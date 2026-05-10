"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Microphone, MicrophoneSlash, VideoCamera, VideoCameraSlash,
  PhoneDisconnect, SpinnerGap, ArrowLeft, Broadcast, Eye,
  PaperPlaneTilt, Heart, DotsThree, X,
} from "@phosphor-icons/react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

async function sendSignal(body: { sessionId: string; toUserId: string; type: string; payload?: object }) {
  await fetch("/api/messages/calls/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  }).catch(() => {});
}

async function pollSignals(sessionId: string, since: string, types: string): Promise<any[]> {
  const p = new URLSearchParams({ sessionId, since, types });
  const res = await fetch(`/api/messages/calls/signal?${p}`, { credentials: "include" }).catch(() => null);
  if (!res?.ok) return [];
  return (await res.json().catch(() => ({}))).signals || [];
}

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderImage?: string;
  content: string;
  createdAt: string;
}

interface FloatingHeart { id: number; x: number; delay: number; }

function FloatingHearts({ hearts }: { hearts: FloatingHeart[] }) {
  return (
    <div className="absolute right-4 bottom-24 w-12 pointer-events-none" style={{ height: 260 }}>
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute bottom-0"
          style={{
            right: `${h.x}px`,
            animation: `floatHeart 2.2s ease-out forwards`,
            animationDelay: `${h.delay}ms`,
          }}
        >
          <Heart size={28} weight="fill" className="text-pink-500 drop-shadow-lg" />
        </div>
      ))}
    </div>
  );
}

function CommentOverlay({ messages }: { messages: ChatMessage[] }) {
  const visible = messages.slice(-6);
  return (
    <div className="absolute bottom-24 left-3 w-[62%] pointer-events-none space-y-1.5">
      {visible.map((msg, i) => (
        <div
          key={msg._id}
          className="flex items-center gap-2"
          style={{ opacity: 0.3 + ((i + 1) / visible.length) * 0.7 }}
        >
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold overflow-hidden border border-white/20">
            {msg.senderImage
              ? <img src={msg.senderImage} alt={msg.senderName} className="w-full h-full object-cover" />
              : msg.senderName?.[0]?.toUpperCase()}
          </div>
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-3 py-1.5 max-w-full">
            <span className="text-white font-semibold text-[11px] mr-1.5">{msg.senderName}</span>
            <span className="text-white/90 text-[11px] break-words">{msg.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveStreamOverlay({
  stream,
  me,
  isHost,
  videoRef,
  viewerCount,
  liveFor,
  paused,
  onClose,
  children,
}: {
  stream: any;
  me: any;
  isHost: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  viewerCount: number;
  liveFor?: number;
  paused?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const heartIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/livestreams/${stream._id}/chat`).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json().catch(() => ({}));
    setMessages(data.messages || []);
  }, [stream._id]);

  useEffect(() => {
    loadMessages();
    const id = setInterval(loadMessages, 2500);
    return () => clearInterval(id);
  }, [loadMessages]);

  const sendHeart = () => {
    const id = ++heartIdRef.current;
    setHearts(prev => [...prev, { id, x: Math.random() * 20, delay: 0 }]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2400);
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${m}:${String(sec).padStart(2, "0")}`;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/livestreams/${stream._id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: text.trim() }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (data?.message) setMessages(prev => [...prev, data.message]);
    setText("");
    setSending(false);
    inputRef.current?.blur();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <style>{`
        @keyframes floatHeart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-120px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-260px) scale(0.6); opacity: 0; }
        }
      `}</style>

      {/* Full-screen video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isHost}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-10 pb-4">
        <div className="flex items-center gap-2.5">
          {!isHost && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center mr-1">
              <ArrowLeft size={16} className="text-white" />
            </button>
          )}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/60 flex-shrink-0">
            {stream.hostImage
              ? <img src={stream.hostImage} alt={stream.hostName} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">{stream.hostName?.[0]}</div>}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">{stream.hostName}</p>
            {isHost && liveFor !== undefined && (
              <p className="text-white/60 text-[11px] font-mono mt-0.5">{fmt(liveFor)}</p>
            )}
          </div>
          <div className={`flex items-center gap-1 text-white text-[11px] font-black px-2.5 py-1 rounded-md ${paused ? "bg-gray-600" : "bg-[#E1306C]"}`}>
            {!paused && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {paused ? "PAUSED" : "LIVE"}
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-md">
            <Eye size={12} weight="fill" />
            <span className="font-semibold">{viewerCount.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Host controls (for host only) */}
      {children}

      {/* Comments overlay */}
      <CommentOverlay messages={messages} />

      {/* Floating hearts */}
      <FloatingHearts hearts={hearts} />

      {/* Bottom input bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 py-3 pb-6">
        <form onSubmit={send} className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2.5">
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Comment..."
              className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
              maxLength={200}
            />
            {text.trim() && (
              <button type="submit" disabled={sending} className="ml-2 flex-shrink-0">
                {sending
                  ? <SpinnerGap size={18} className="text-white animate-spin" />
                  : <PaperPlaneTilt size={18} className="text-white" weight="fill" />}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={sendHeart}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0"
          >
            <Heart size={20} weight="fill" className="text-pink-400" />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0"
          >
            <DotsThree size={20} className="text-white" weight="bold" />
          </button>
        </form>
      </div>

      {/* Connecting / ended overlays */}
      {paused === undefined && (
        <></>
      )}
    </div>
  );
}

function HostView({ stream, me }: { stream: any; me: any }) {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [viewerCount, setViewerCount] = useState(stream.viewerCount || 0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [paused, setPaused] = useState(false);
  const [liveFor, setLiveFor] = useState(0);
  const [ending, setEnding] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConns = useRef<Map<string, RTCPeerConnection>>(new Map());
  const sinceRef = useRef(new Date().toISOString());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vcPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = `stream-${stream._id}`;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((s) => {
        localStreamRef.current = s;
        setLocalStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      })
      .catch(() => {});

    timerRef.current = setInterval(() => setLiveFor((t) => t + 1), 1000);
    vcPollRef.current = setInterval(async () => {
      const res = await fetch(`/api/livestreams/${stream._id}`).catch(() => null);
      const d = await res?.json().catch(() => ({}));
      if (d?.stream) setViewerCount(d.stream.viewerCount || 0);
    }, 4000);

    return () => {
      [pollingRef, vcPollRef, timerRef].forEach((r) => { if (r.current) clearInterval(r.current); });
      peerConns.current.forEach((pc) => pc.close());
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [stream._id]);

  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      const sigs = await pollSignals(sessionId, sinceRef.current, "offer,ice-candidate");
      if (sigs.length) sinceRef.current = sigs[sigs.length - 1].created_at;
      for (const sig of sigs) {
        const viewerId = sig.from_user_id;
        if (sig.type === "offer" && !peerConns.current.has(viewerId)) {
          const pc = new RTCPeerConnection(ICE_SERVERS);
          peerConns.current.set(viewerId, pc);
          localStreamRef.current?.getTracks().forEach((t) => {
            if (localStreamRef.current) pc.addTrack(t, localStreamRef.current);
          });
          pc.onicecandidate = async (e) => {
            if (e.candidate) await sendSignal({ sessionId, toUserId: viewerId, type: "ice-candidate", payload: { candidate: e.candidate.toJSON() } });
          };
          pc.onconnectionstatechange = () => {
            if (["disconnected", "failed", "closed"].includes(pc.connectionState)) peerConns.current.delete(viewerId);
          };
          await pc.setRemoteDescription(new RTCSessionDescription(sig.payload.sdp)).catch(() => {});
          const answer = await pc.createAnswer().catch(() => null);
          if (!answer) continue;
          await pc.setLocalDescription(answer).catch(() => {});
          await sendSignal({ sessionId, toUserId: viewerId, type: "answer", payload: { sdp: { type: answer.type, sdp: answer.sdp } } });
        } else if (sig.type === "ice-candidate") {
          const pc = peerConns.current.get(viewerId);
          if (pc && pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(sig.payload.candidate)).catch(() => {});
        }
      }
    }, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sessionId]);

  const endStream = async () => {
    setEnding(true);
    await fetch(`/api/livestreams/${stream._id}`, { method: "DELETE", credentials: "include" }).catch(() => {});
    peerConns.current.forEach((pc) => pc.close());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    router.push("/dashboard/live");
  };

  const toggleMute = () => { localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = muted; }); setMuted(!muted); };
  const toggleCam = () => { localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOff; }); setCamOff(!camOff); };
  const togglePause = () => {
    const next = !paused;
    localStreamRef.current?.getTracks().forEach((t) => { t.enabled = paused; });
    setPaused(next);
    if (next && localVideoRef.current) localVideoRef.current.pause();
    else if (localVideoRef.current) localVideoRef.current.play();
  };

  return (
    <LiveStreamOverlay
      stream={stream}
      me={me}
      isHost={true}
      videoRef={localVideoRef}
      viewerCount={viewerCount}
      liveFor={liveFor}
      paused={paused}
      onClose={endStream}
    >
      {/* Host controls floating panel */}
      <div className="absolute bottom-20 right-3 z-30 flex flex-col gap-2.5" onClick={() => setShowControls(v => !v)}>
        {showControls && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500" : "bg-black/60 backdrop-blur border border-white/20"}`}
            >
              {muted ? <MicrophoneSlash size={20} weight="fill" className="text-white" /> : <Microphone size={20} weight="fill" className="text-white" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleCam(); }}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${camOff ? "bg-red-500" : "bg-black/60 backdrop-blur border border-white/20"}`}
            >
              {camOff ? <VideoCameraSlash size={20} weight="fill" className="text-white" /> : <VideoCamera size={20} weight="fill" className="text-white" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); endStream(); }}
              disabled={ending}
              className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
            >
              {ending ? <SpinnerGap size={18} className="animate-spin text-white" /> : <PhoneDisconnect size={20} weight="fill" className="text-white" />}
            </button>
          </>
        )}
      </div>

      {(!localStream || paused) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 z-10">
          {paused
            ? <p className="text-white/60 font-semibold">Stream paused</p>
            : <><SpinnerGap size={40} className="text-white animate-spin" /><p className="text-white/60 text-sm">Starting camera...</p></>}
        </div>
      )}
    </LiveStreamOverlay>
  );
}

function ViewerView({ stream, me }: { stream: any; me: any }) {
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "connected" | "ended">("connecting");
  const [viewerCount, setViewerCount] = useState(stream.viewerCount || 0);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sinceRef = useRef(new Date().toISOString());
  const remoteSetRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const sessionId = `stream-${stream._id}`;

  useEffect(() => {
    let polling: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      pc.ontrack = (e) => {
        if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0] || null; setStatus("connected"); }
      };
      pc.onicecandidate = async (e) => {
        if (e.candidate) await sendSignal({ sessionId, toUserId: stream.hostId, type: "ice-candidate", payload: { candidate: e.candidate.toJSON() } });
      };
      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) setStatus("ended");
      };
      const offer = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true }).catch(() => null);
      if (!offer) return;
      await pc.setLocalDescription(offer).catch(() => {});
      await sendSignal({ sessionId, toUserId: stream.hostId, type: "offer", payload: { sdp: { type: offer.type, sdp: offer.sdp } } });
      await fetch(`/api/livestreams/${stream._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ action: "join" }) }).catch(() => {});
      sinceRef.current = new Date().toISOString();

      polling = setInterval(async () => {
        const sigs = await pollSignals(sessionId, sinceRef.current, "answer,ice-candidate");
        if (sigs.length) sinceRef.current = sigs[sigs.length - 1].created_at;
        for (const sig of sigs) {
          if (sig.type === "answer" && !remoteSetRef.current) {
            remoteSetRef.current = true;
            await pc.setRemoteDescription(new RTCSessionDescription(sig.payload.sdp)).catch(() => {});
            for (const c of pendingIceRef.current) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
            pendingIceRef.current = [];
          } else if (sig.type === "ice-candidate") {
            if (remoteSetRef.current) await pc.addIceCandidate(new RTCIceCandidate(sig.payload.candidate)).catch(() => {});
            else pendingIceRef.current.push(sig.payload.candidate);
          }
        }
      }, 1500);
    })();

    const vcPoll = setInterval(async () => {
      const res = await fetch(`/api/livestreams/${stream._id}`).catch(() => null);
      const d = await res?.json().catch(() => ({}));
      if (d?.stream) { setViewerCount(d.stream.viewerCount || 0); if (d.stream.status === "ended") setStatus("ended"); }
    }, 4000);

    return () => {
      if (polling) clearInterval(polling);
      clearInterval(vcPoll);
      pcRef.current?.close();
      fetch(`/api/livestreams/${stream._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ action: "leave" }) }).catch(() => {});
    };
  }, [sessionId, stream._id, stream.hostId]);

  if (status === "ended") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
        <Broadcast size={48} className="text-white/20" />
        <p className="text-white/70 text-base">Stream has ended</p>
        <button onClick={() => router.push("/dashboard/live")} className="px-6 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-full font-semibold">
          Browse Streams
        </button>
      </div>
    );
  }

  return (
    <LiveStreamOverlay
      stream={stream}
      me={me}
      isHost={false}
      videoRef={remoteVideoRef}
      viewerCount={viewerCount}
      onClose={() => router.push("/dashboard/live")}
    >
      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 z-10">
          <SpinnerGap size={40} className="text-white animate-spin" />
          <p className="text-white/70 text-sm">Connecting to stream...</p>
        </div>
      )}
    </LiveStreamOverlay>
  );
}

export default function LiveStreamPage() {
  const { streamId } = useParams<{ streamId: string }>();
  const router = useRouter();
  const [stream, setStream] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/livestreams/${streamId}`).then((r) => r.json()),
    ]).then(([meD, stD]) => {
      if (meD.user) setMe(meD.user);
      if (stD.stream) setStream(stD.stream);
      else setNotFound(true);
      setLoading(false);
    });
  }, [streamId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <SpinnerGap size={40} className="text-white animate-spin" />
      </div>
    );
  }

  if (notFound || !stream) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
        <Broadcast size={48} className="text-white/20" />
        <p className="text-white/60">This stream doesn&apos;t exist or has ended.</p>
        <button onClick={() => router.push("/dashboard/live")} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full">
          Browse Live Streams
        </button>
      </div>
    );
  }

  const isHost = me && (me._id === stream.hostId || me.id === stream.hostId);

  if (stream.status === "ended" && !isHost) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
        <Broadcast size={48} className="text-white/20" />
        <p className="text-white/60 text-base">This stream has ended.</p>
        <button onClick={() => router.push("/dashboard/live")} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full">
          Browse Live Streams
        </button>
      </div>
    );
  }

  if (isHost) return <HostView stream={stream} me={me} />;
  return <ViewerView stream={stream} me={me} />;
}
