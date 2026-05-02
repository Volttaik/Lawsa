"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, ChevronRight, ChevronLeft,
  User, Mail, Lock, Phone, Calendar, Camera, CheckCircle2, ArrowRight,
} from "lucide-react";

const TOTAL_STEPS = 6;

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "6+ characters", met: password.length >= 6 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const bars = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const labelColors = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-green-400"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? bars[score] : "bg-[#333]"}`} />
        ))}
      </div>
      {score > 0 && <p className={`text-xs font-medium ${labelColors[score]}`}>{labels[score]}</p>}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.met ? "bg-green-500" : "bg-[#333]"}`}>
              {c.met && <CheckCircle2 size={9} className="text-white" />}
            </div>
            <span className={`text-xs ${c.met ? "text-gray-300" : "text-gray-600"}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepWrapper({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">{icon}</div>
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="text-gray-500 text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#111] border border-[#333] hover:border-[#555] focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "", name: "", email: "", phone: "",
    password: "", confirmPassword: "", dateOfBirth: "",
    profileImage: "", profileImagePreview: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((p) => ({ ...p, profileImage: result, profileImagePreview: result }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (step === 1) {
      if (!form.username.trim()) { setError("Username is required"); return false; }
      if (form.username.length < 3) { setError("Username must be at least 3 characters"); return false; }
      if (!form.name.trim()) { setError("Full name is required"); return false; }
    }
    if (step === 2) {
      if (!form.email.trim()) { setError("Email is required"); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email"); return false; }
    }
    if (step === 3) {
      if (!form.password) { setError("Password is required"); return false; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters"); return false; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
    }
    if (step === 4) {
      if (!form.dateOfBirth) { setError("Date of birth is required"); return false; }
    }
    return true;
  };

  const goNext = () => { setError(""); if (!validate()) return; setDirection(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goBack = () => { setError(""); setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, username: form.username.toLowerCase().trim(),
          email: form.email.toLowerCase().trim(), password: form.password,
          phone: form.phone, dateOfBirth: form.dateOfBirth, profileImage: form.profileImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      setSuccess(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const Nav = () => (
    <nav className="border-b border-[#222] flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-white font-black text-lg">Sosa Socials</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</Link>
          <Link href="/#community" className="text-gray-400 hover:text-white text-sm transition-colors">Community</Link>
          <Link href="/#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Premium</Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-gray-400 text-sm">Already have an account?</span>
          <Link href="/login" className="border border-[#333] hover:border-[#555] text-white font-bold text-sm px-4 py-2 rounded-full transition-colors">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-sm text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-3">You&apos;re in!</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Welcome to Sosa Socials, <span className="font-bold text-white">{form.name}</span>! Your account is ready.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors">
              Continue to Login <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Step {step} of {TOTAL_STEPS}</span>
              <span className="text-xs font-bold text-blue-400">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-1 bg-[#222] rounded-full overflow-hidden">
              <motion.div className="h-full bg-blue-500 rounded-full" initial={false}
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.4, ease: "easeInOut" }} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }} className="p-6 sm:p-8">

                {step === 1 && (
                  <StepWrapper icon={<User size={20} className="text-blue-400" />} title="Let's get started" subtitle="Choose your username and full name">
                    <Field label="Username">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">@</span>
                        <input type="text" value={form.username} onChange={(e) => update("username", e.target.value.replace(/\s/g,"").toLowerCase())}
                          placeholder="yourusername" className={inputCls + " pl-8"} autoFocus />
                      </div>
                    </Field>
                    <Field label="Full Name">
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                        placeholder="Your full name" className={inputCls} />
                    </Field>
                  </StepWrapper>
                )}

                {step === 2 && (
                  <StepWrapper icon={<Mail size={20} className="text-blue-400" />} title="Contact details" subtitle="Your email and phone number">
                    <Field label="Email Address">
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                        placeholder="you@example.com" className={inputCls} autoFocus />
                    </Field>
                    <Field label="Phone Number (optional)">
                      <div className="relative">
                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                          placeholder="+234 800 000 0000" className={inputCls + " pl-10"} />
                      </div>
                    </Field>
                  </StepWrapper>
                )}

                {step === 3 && (
                  <StepWrapper icon={<Lock size={20} className="text-blue-400" />} title="Secure your account" subtitle="Choose a strong password">
                    <Field label="Password">
                      <div className="relative">
                        <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)}
                          placeholder="Min 6 characters" className={inputCls + " pr-11"} autoFocus />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <PasswordStrength password={form.password} />
                    </Field>
                    <Field label="Confirm Password">
                      <div className="relative">
                        <input type={showCPw ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                          placeholder="Repeat your password" className={inputCls + " pr-11"} />
                        <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showCPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-red-400 mt-1">Passwords do not match</p>}
                      {form.confirmPassword && form.password === form.confirmPassword && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle2 size={11} /> Passwords match</p>}
                    </Field>
                  </StepWrapper>
                )}

                {step === 4 && (
                  <StepWrapper icon={<Calendar size={20} className="text-blue-400" />} title="Date of birth" subtitle="We use this to personalize your experience">
                    <Field label="Date of Birth">
                      <input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)}
                        className={inputCls + " [color-scheme:dark]"}
                        max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} autoFocus />
                    </Field>
                    <p className="text-xs text-gray-600">You must be at least 13 years old to join Sosa Socials.</p>
                  </StepWrapper>
                )}

                {step === 5 && (
                  <StepWrapper icon={<Camera size={20} className="text-blue-400" />} title="Profile picture" subtitle="Add a photo so people can recognise you">
                    <div className="flex flex-col items-center gap-5">
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="relative w-28 h-28 rounded-full border-2 border-dashed border-[#333] hover:border-blue-500 bg-[#111] transition-all flex flex-col items-center justify-center overflow-hidden">
                        {form.profileImagePreview
                          ? <img src={form.profileImagePreview} alt="Preview" className="object-cover w-full h-full" />
                          : <><Camera size={28} className="text-gray-600 mb-1" /><span className="text-xs text-gray-600">Upload photo</span></>}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                      <div className="text-center">
                        <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-blue-400 hover:text-blue-300">
                          {form.profileImagePreview ? "Change photo" : "Choose a photo"}
                        </button>
                        <p className="text-xs text-gray-600 mt-1">JPG, PNG. Max 5MB. You can skip this.</p>
                      </div>
                    </div>
                  </StepWrapper>
                )}

                {step === 6 && (
                  <StepWrapper icon={<CheckCircle2 size={20} className="text-blue-400" />} title="You're all set!" subtitle="Review your info and create your account">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 bg-[#111] rounded-xl border border-[#222]">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          {form.profileImagePreview
                            ? <img src={form.profileImagePreview} alt="Profile" className="object-cover w-full h-full" />
                            : <span className="text-white font-black text-xl">{form.name?.[0]?.toUpperCase() || "?"}</span>}
                        </div>
                        <div>
                          <p className="font-bold text-white">{form.name}</p>
                          <p className="text-sm text-gray-400">@{form.username}</p>
                          <p className="text-xs text-gray-600">{form.email}</p>
                        </div>
                      </div>
                      {[{ label: "Phone", value: form.phone || "Not provided" }, { label: "Date of Birth", value: form.dateOfBirth || "Not provided" }].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm py-2 border-b border-[#1a1a1a]">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="text-gray-300 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </StepWrapper>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mt-4">
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button type="button" onClick={goBack}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-[#333] text-gray-300 text-sm font-medium hover:bg-[#111] transition-all">
                      <ChevronLeft size={16} /> Back
                    </button>
                  )}
                  {step < TOTAL_STEPS ? (
                    <button type="button" onClick={goNext}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                      {step === 5 ? (form.profileImagePreview ? "Continue" : "Skip for now") : "Continue"}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60">
                      {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
