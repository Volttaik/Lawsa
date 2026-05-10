"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Microphone, MicrophoneSlash, VideoCamera, VideoCameraSlash,
  PhoneDisconnect, Phone, SpinnerGap, ArrowLeft, SpeakerHigh,
} from "@phosphor-icons/react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

async function sendSignal(body: {
  sessionId: string;
  toUserId: string;
  type: string;
  payload?: object;
}) {
  await fetch("/api/calls/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  }).catch(() => {});
}

async function pollSignals(sessionId: string, since: string, types: string): Promise<any[]> {
  const p = new URLSearchParams({ sessionId, since, types });
  const res = await fetch(`/api/calls/signal?${p}`, {
    credentials: "include",
  }).catch(() => null);
  if (!res?.ok) return [];
  const d = await res.json().catch(() => ({}));
  return d.signals || [];
}

export default function CallPage() {
  const { userId: targetId } = useParams<{ userId: string }>();
  const sp = useSearchParams();
  const router = useRouter();

  const role = (sp.get("role") || "caller") as "caller" | "callee";
  const callType = (sp.get("type") || "video") as "video" | "voice";
  const sessionId = sp.get("session") || `${Date.now()}-${targetId}`;

  const [me, setMe] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [status, setStatus] = useState<
    "loading" | "calling" | "ringing" | "connected" | "ended" | "declined" | "failed"
  >("loading");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sinceRef = useRef(new Date(0).toISOString());
  const remoteSetRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/users/${targetId}`).then((r) => r.json()),
    ]).then(([meD, uD]) => {
      if (meD.user) setMe(meD.user);
      if (uD.user) setTargetUser(uD.user);
    });
  }, [targetId]);

  const cleanup = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (durationTimerRef.current) { clearInterval(durationTimerRef.current); durationTimerRef.current = null; }
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  }, []);

  const getMedia = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints =
        callType === "video"
          ? { video: { width: 1280, height: 720, facingMode: "user" }, audio: true }
          : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch {
      setStatus("failed");
      return null;
    }
  }, [callType]);

  const buildPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0] || null;
    };

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        await sendSignal({
          sessionId,
          toUserId: targetId,
          type: "ice-candidate",
          payload: { candidate: e.candidate.toJSON() },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setStatus("connected");
        durationTimerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setStatus((prev) => (prev === "connected" ? "ended" : prev));
        cleanup();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sessionId, targetId, cleanup]);

  const applyPendingIce = async (pc: RTCPeerConnection) => {
    for (const c of pendingIceRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
    pendingIceRef.current = [];
  };

  const startCaller = useCallback(async () => {
    if (!me || startedRef.current) return;
    startedRef.current = true;
    setStatus("calling");

    const stream = await getMedia();
    if (!stream) return;

    const pc = buildPC();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await sendSignal({
      sessionId,
      toUserId: targetId,
      type: "call-invite",
      payload: {
        callType,
        callerName: me.name,
        callerImage: me.profileImage || "",
        callerId: me._id || me.id,
        sessionId,
      },
    });

    setStatus("ringing");

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendSignal({
      sessionId,
      toUserId: targetId,
      type: "offer",
      payload: { sdp: { type: offer.type, sdp: offer.sdp } },
    });

    sinceRef.current = new Date().toISOString();
    pollingRef.current = setInterval(async () => {
      const sigs = await pollSignals(sessionId, sinceRef.current, "answer,ice-candidate,hangup,decline");
      if (sigs.length) sinceRef.current = sigs[sigs.length - 1].created_at;
      for (const sig of sigs) {
        if (sig.type === "answer" && !remoteSetRef.current) {
          remoteSetRef.current = true;
          await pc.setRemoteDescription(new RTCSessionDescription(sig.payload.sdp)).catch(() => {});
          await applyPendingIce(pc);
        } else if (sig.type === "ice-candidate") {
          if (remoteSetRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(sig.payload.candidate)).catch(() => {});
          } else {
            pendingIceRef.current.push(sig.payload.candidate);
          }
        } else if (sig.type === "hangup" || sig.type === "decline") {
          setStatus(sig.type === "decline" ? "declined" : "ended");
          cleanup();
        }
      }
    }, 1500);
  }, [me, targetId, sessionId, callType, buildPC, getMedia, cleanup]);

  const startCallee = useCallback(async () => {
    if (!me || startedRef.current) return;
    startedRef.current = true;
    setStatus("ringing");

    const stream = await getMedia();
    if (!stream) return;

    const pc = buildPC();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    let offerFound = false;
    const findOffer = setInterval(async () => {
      if (offerFound) return;
      const sigs = await pollSignals(sessionId, new Date(0).toISOString(), "offer,hangup");
      const offer = sigs.find((s: any) => s.type === "offer");
      const hangup = sigs.find((s: any) => s.type === "hangup");

      if (hangup) { setStatus("ended"); clearInterval(findOffer); cleanup(); return; }
      if (!offer) return;

      offerFound = true;
      clearInterval(findOffer);

      await pc.setRemoteDescription(new RTCSessionDescription(offer.payload.sdp)).catch(() => {});
      remoteSetRef.current = true;
      await applyPendingIce(pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal({
        sessionId,
        toUserId: targetId,
        type: "answer",
        payload: { sdp: { type: answer.type, sdp: answer.sdp } },
      });

      sinceRef.current = new Date().toISOString();
      pollingRef.current = setInterval(async () => {
        const iceSigs = await pollSignals(sessionId, sinceRef.current, "ice-candidate,hangup");
        if (iceSigs.length) sinceRef.current = iceSigs[iceSigs.length - 1].created_at;
        for (const sig of iceSigs) {
          if (sig.type === "ice-candidate") {
            await pc.addIceCandidate(new RTCIceCandidate(sig.payload.candidate)).catch(() => {});
          } else if (sig.type === "hangup") {
            setStatus("ended");
            cleanup();
          }
        }
      }, 1500);
    }, 1000);

    setTimeout(() => {
      if (!offerFound) { clearInterval(findOffer); setStatus("failed"); }
    }, 30000);
  }, [me, targetId, sessionId, buildPC, getMedia, cleanup]);

  useEffect(() => {
    if (me && targetUser) {
      if (role === "caller") startCaller();
      else startCallee();
    }
  }, [me, targetUser, role, startCaller, startCallee]);

  useEffect(() => () => cleanup(), [cleanup]);

  const hangup = async () => {
    await sendSignal({ sessionId, toUserId: targetId, type: "hangup", payload: {} });
    setStatus("ended");
    cleanup();
    setTimeout(() => router.back(), 1200);
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted(!muted);
  };

  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOff; });
    setCamOff(!camOff);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const statusLabel: Record<string, string> = {
    loading: "Connecting...",
    calling: "Setting up...",
    ringing: role === "caller" ? "Ringing..." : "Incoming call",
    connected: fmt(duration),
    ended: "Call ended",
    declined: "Call declined",
    failed: "Could not connect",
  };

  const other = targetUser;
  const isOver = ["ended", "declined", "failed"].includes(status);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Remote video — full background for video calls */}
      {callType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Back button */}
      <button
        onClick={() => { cleanup(); router.back(); }}
        className="absolute top-6 left-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Call type badge */}
      <div className="absolute top-6 right-5 z-20">
        <span className="text-xs text-white/60 uppercase tracking-widest font-medium">
          {callType === "video" ? "Video Call" : "Voice Call"}
        </span>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
          {other?.profileImage ? (
            <img src={other.profileImage} alt={other?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold">
              {other?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold drop-shadow">{other?.name || "..."}</h1>
          {other?.username && (
            <p className="text-white/50 text-sm">@{other.username}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {status === "loading" || status === "calling" || status === "ringing" ? (
            <SpinnerGap className="w-4 h-4 text-white/60 animate-spin" />
          ) : status === "connected" ? (
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          ) : null}
          <span className="text-white/80 text-sm font-medium">{statusLabel[status]}</span>
        </div>
      </div>

      {/* Local video PiP */}
      {callType === "video" && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute bottom-32 right-4 w-28 h-40 object-cover rounded-2xl border-2 border-white/20 shadow-lg z-20 transition-opacity ${
            status === "connected" ? "opacity-100" : "opacity-40"
          }`}
        />
      )}

      {/* Voice call: local audio only (no video ref needed — browser handles audio) */}
      {callType === "voice" && (
        <audio ref={remoteVideoRef as any} autoPlay />
      )}

      {/* Controls */}
      <div className="absolute bottom-10 z-20 flex items-center gap-4">
        {!isOver ? (
          <>
            <button
              onClick={toggleMute}
              title={muted ? "Unmute" : "Mute"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                muted ? "bg-red-500 hover:bg-red-600" : "bg-white/15 hover:bg-white/25 backdrop-blur-sm"
              }`}
            >
              {muted
                ? <MicrophoneSlash size={24} weight="fill" className="text-white" />
                : <Microphone size={24} weight="fill" className="text-white" />}
            </button>

            {callType === "video" && (
              <button
                onClick={toggleCam}
                title={camOff ? "Turn camera on" : "Turn camera off"}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  camOff ? "bg-red-500 hover:bg-red-600" : "bg-white/15 hover:bg-white/25 backdrop-blur-sm"
                }`}
              >
                {camOff
                  ? <VideoCameraSlash size={24} weight="fill" className="text-white" />
                  : <VideoCamera size={24} weight="fill" className="text-white" />}
              </button>
            )}

            <button
              onClick={hangup}
              title="End call"
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl transition-all"
            >
              <PhoneDisconnect size={28} weight="fill" className="text-white" />
            </button>
          </>
        ) : (
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-full font-semibold transition-all"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
