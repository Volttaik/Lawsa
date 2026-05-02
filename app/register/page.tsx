"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, ChevronRight, ChevronLeft,
  User, Mail, Lock, Phone, Calendar, Camera, CheckCircle2,
  Shield, Sparkles, Zap
} from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import Image from "next/image";

const TOTAL_STEPS = 6;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Contains special char", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  const textColors = ["", "text-red-500", "text-yellow-600", "text-blue-600", "text-green-600"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-100"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score > 0 ? textColors[score] : "text-gray-400"}`}>
        {score > 0 ? levels[score] : ""}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.met ? "bg-green-500" : "bg-gray-100"}`}>
              {c.met && <CheckCircle2 size={9} className="text-white" />}
            </div>
            <span className={`text-xs ${c.met ? "text-gray-700" : "text-gray-400"}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-black/8 shadow-soft flex-shrink-0">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <span className="font-bold text-gray-900 text-sm">Sosa</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
          <Link href="/#features" className="hover:text-blue-600 transition-colors font-medium">Features</Link>
          <Link href="/#community" className="hover:text-blue-600 transition-colors font-medium">Community</Link>
          <Link href="/#about" className="hover:text-blue-600 transition-colors font-medium">About</Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="text-sm text-gray-700 font-medium px-4 py-1.5 rounded-lg border border-black/10 hover:border-blue-500 hover:text-blue-600 transition-all">
            Login
          </Link>
          <Link href="/register" className="text-sm text-white font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function StepWrapper({ icon, title, subtitle, children }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    profileImage: "",
    profileImagePreview: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((prev) => ({ ...prev, profileImage: result, profileImagePreview: result }));
    };
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    setError("");
    if (!validateStep()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setError("");
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const validateStep = (): boolean => {
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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username.toLowerCase().trim(),
          email: form.email.toLowerCase().trim(),
          password: form.password,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          profileImage: form.profileImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#e8ecf0] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={40} className="text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-3"
            >
              Account Created!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-8 leading-relaxed"
            >
              Welcome to Sosa, <span className="font-semibold text-blue-600">{form.name}</span>!
              Your account has been created successfully. You&apos;re now part of our growing community.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl border border-black/10 shadow-btn hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Continue to Login <ChevronRight size={18} />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8ecf0] flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Step {step} of {TOTAL_STEPS}</span>
                <span className="text-xs font-medium text-blue-600">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600 rounded-full"
                  initial={false}
                  animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i + 1 <= step ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 shadow-card overflow-hidden">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-8"
                >
                  {step === 1 && (
                    <StepWrapper
                      icon={<User size={22} className="text-blue-600" />}
                      title="Let's get started"
                      subtitle="Choose your username and tell us your name"
                    >
                      <FormField label="Username">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                          <input
                            type="text"
                            value={form.username}
                            onChange={(e) => update("username", e.target.value.replace(/\s/g, "").toLowerCase())}
                            placeholder="yourusername"
                            className="form-input pl-7"
                            autoFocus
                          />
                        </div>
                      </FormField>
                      <FormField label="Full Name">
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your full name"
                          className="form-input"
                        />
                      </FormField>
                    </StepWrapper>
                  )}

                  {step === 2 && (
                    <StepWrapper
                      icon={<Mail size={22} className="text-blue-600" />}
                      title="Contact details"
                      subtitle="Enter your email and phone number"
                    >
                      <FormField label="Email Address">
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          className="form-input"
                          autoFocus
                        />
                      </FormField>
                      <FormField label="Phone Number (optional)">
                        <div className="relative">
                          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="form-input pl-9"
                          />
                        </div>
                      </FormField>
                    </StepWrapper>
                  )}

                  {step === 3 && (
                    <StepWrapper
                      icon={<Lock size={22} className="text-blue-600" />}
                      title="Secure your account"
                      subtitle="Choose a strong password to protect your account"
                    >
                      <FormField label="Password">
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            placeholder="Min 6 characters"
                            className="form-input pr-12"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <PasswordStrength password={form.password} />
                      </FormField>
                      <FormField label="Confirm Password">
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => update("confirmPassword", e.target.value)}
                            placeholder="Repeat your password"
                            className="form-input pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {form.confirmPassword && form.password !== form.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                        {form.confirmPassword && form.password === form.confirmPassword && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Passwords match
                          </p>
                        )}
                      </FormField>
                    </StepWrapper>
                  )}

                  {step === 4 && (
                    <StepWrapper
                      icon={<Calendar size={22} className="text-blue-600" />}
                      title="Date of birth"
                      subtitle="We use this to personalize your experience"
                    >
                      <FormField label="Date of Birth">
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => update("dateOfBirth", e.target.value)}
                          className="form-input"
                          max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                          autoFocus
                        />
                      </FormField>
                      <p className="text-xs text-gray-400 mt-2">You must be at least 13 years old to join Sosa.</p>
                    </StepWrapper>
                  )}

                  {step === 5 && (
                    <StepWrapper
                      icon={<Camera size={22} className="text-blue-600" />}
                      title="Profile picture"
                      subtitle="Add a photo so people can recognize you"
                    >
                      <div className="flex flex-col items-center gap-5">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="relative w-28 h-28 rounded-full border-2 border-dashed border-black/20 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 transition-all flex flex-col items-center justify-center overflow-hidden"
                        >
                          {form.profileImagePreview ? (
                            <Image
                              src={form.profileImagePreview}
                              alt="Profile preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <>
                              <Camera size={28} className="text-gray-400 mb-1" />
                              <span className="text-xs text-gray-400">Upload photo</span>
                            </>
                          )}
                        </motion.button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {form.profileImagePreview ? "Change photo" : "Choose a photo"}
                          </button>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-gray-400 mt-4">
                        You can always change this later from your profile settings.
                      </p>
                    </StepWrapper>
                  )}

                  {step === 6 && (
                    <StepWrapper
                      icon={<Sparkles size={22} className="text-blue-600" />}
                      title="You're all set!"
                      subtitle="Review your information and create your account"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-black/5">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                            {form.profileImagePreview ? (
                              <Image src={form.profileImagePreview} alt="Profile" width={56} height={56} className="object-cover w-full h-full" />
                            ) : (
                              <span className="text-white font-bold text-xl">{form.name?.[0]?.toUpperCase() || "?"}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{form.name}</p>
                            <p className="text-sm text-gray-500">@{form.username}</p>
                            <p className="text-xs text-gray-400">{form.email}</p>
                          </div>
                        </div>
                        {[
                          { label: "Phone", value: form.phone || "Not provided" },
                          { label: "Date of Birth", value: form.dateOfBirth || "Not provided" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between text-sm py-2 border-b border-black/5">
                            <span className="text-gray-500">{item.label}</span>
                            <span className="text-gray-800 font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </StepWrapper>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mt-4"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3 mt-6">
                    {step > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-black/10 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all shadow-soft"
                      >
                        <ChevronLeft size={16} /> Back
                      </motion.button>
                    )}
                    {step < TOTAL_STEPS ? (
                      <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={goNext}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white font-semibold py-3 rounded-xl border border-black/10 hover:bg-blue-700 transition-all shadow-btn hover:shadow-btn-hover text-sm"
                      >
                        {step === 5 ? (form.profileImagePreview ? "Continue" : "Skip for now") : "Continue"}
                        <ChevronRight size={16} />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl border border-black/10 hover:bg-blue-700 transition-all shadow-btn hover:shadow-btn-hover disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? (
                          <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                        ) : (
                          <><Sparkles size={16} /> Create Account</>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {step === 1 && (
                    <p className="mt-5 text-xs text-center text-gray-500">
                      Already have an account?{" "}
                      <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-4 text-xs text-center text-gray-400">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center w-2/5 relative overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80"
            alt="Professional legal environment"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-blue-900/80" />
          <div className="relative z-10 px-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-white text-xs font-medium mb-6 w-fit">
              <Sparkles size={13} />
              Free forever
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 leading-snug">Your professional journey starts here</h2>
            <p className="text-blue-200 text-sm mb-10 leading-relaxed">
              Join a growing community of ambitious people sharing knowledge, building connections, and creating opportunities.
            </p>
            <div className="space-y-5">
              {[
                { icon: Sparkles, title: "Rich Profile", desc: "Showcase your skills and achievements" },
                { icon: Shield, title: "Private & Secure", desc: "Your data stays safe with us" },
                { icon: Zap, title: "Instant Connect", desc: "Find and follow people instantly" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Icon className="text-white" size={17} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{title}</div>
                    <div className="text-blue-300 text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
