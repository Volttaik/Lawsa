"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MessageCircle, Globe, Star, ArrowRight,
  BookOpen, TrendingUp, Heart, Share2, Bell, CheckCircle2,
  Briefcase, Scale, X, Loader2,
} from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface GuestPost {
  _id: string;
  authorName: string;
  authorUsername?: string;
  authorImage?: string;
  content: string;
  images?: string[];
  likes?: string[];
  comments?: unknown[];
  createdAt: string;
}

function GuestPostViewerInner() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post");
  const [post, setPost] = useState<GuestPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!postId) return;
    setOpen(true);
    setLoading(true);
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => { if (data.post) setPost(data.post); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.91, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.91, y: 28 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl border border-black/8 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-black/6">
              <div className="flex items-center gap-2">
                <LogoIcon size={22} />
                <span className="font-bold text-gray-900 text-sm">Sosa Socials</span>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={15} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-44">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div>
            ) : post ? (
              <>
                {(post.images || []).filter(Boolean).length > 0 && (
                  <img src={(post.images || [])[0]} alt="Post" className="w-full max-h-52 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {post.authorImage
                      ? <img src={post.authorImage} alt={post.authorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">{post.authorName?.[0]?.toUpperCase()}</div>
                    }
                    <div>
                      <p className="font-semibold text-sm text-gray-900">@{post.authorUsername || post.authorName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
                    {post.content}
                  </p>
                  {((post.likes?.length || 0) > 0 || (post.comments?.length || 0) > 0) && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 text-xs text-gray-400">
                      {(post.likes?.length || 0) > 0 && (
                        <span className="flex items-center gap-1"><Heart size={12} className="fill-red-400 text-red-400" /> {post.likes?.length}</span>
                      )}
                      {(post.comments?.length || 0) > 0 && (
                        <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments?.length} {post.comments?.length === 1 ? "reply" : "replies"}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4 space-y-2.5">
                  <p className="text-xs text-center text-gray-400 mb-1">Join Sosa Socials to like, comment and connect</p>
                  <Link href="/register" className="block w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center transition-all">
                    Create Account to Continue
                  </Link>
                  <Link href="/login" className="block w-full py-2 rounded-xl border border-black/10 text-gray-700 text-sm font-medium text-center hover:border-blue-500 hover:text-blue-600 transition-all">
                    Already have an account? Sign in
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <p>This post is no longer available.</p>
                <Link href="/register" className="block mt-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">
                  Join Sosa Socials
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GuestPostViewer() {
  return (
    <Suspense fallback={null}>
      <GuestPostViewerInner />
    </Suspense>
  );
}

export default function LandingPage() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#e8ecf0]">
      <GuestPostViewer />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/8 shadow-soft">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon size={28} />
            <span className="font-bold text-gray-900 text-sm">Sosa Socials</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
            <a href="#features" className="hover:text-blue-600 transition-colors font-medium">Features</a>
            <a href="#community" className="hover:text-blue-600 transition-colors font-medium">Community</a>
            <a href="#about" className="hover:text-blue-600 transition-colors font-medium">About</a>
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

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-5">
                <Star size={13} className="fill-blue-500 text-blue-500" />
                The Social Platform for Students & Professionals
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
                Connect. Share.{" "}
                <span className="text-blue-600">Grow Together.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-base text-gray-500 mb-8 leading-relaxed max-w-xl">
                Sosa Socials is where students and professionals come together to build meaningful connections, share knowledge, and unlock new opportunities in law and beyond.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3 rounded-xl shadow-btn hover:shadow-btn-hover hover:bg-blue-700 transition-all cursor-pointer text-sm"
                  >
                    Join for Free <ArrowRight size={17} />
                  </motion.div>
                </Link>
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 text-gray-800 font-semibold px-7 py-3 rounded-xl border border-black/10 shadow-soft hover:shadow-card transition-all cursor-pointer text-sm"
                  >
                    Sign In
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mt-8 flex-wrap">
                {["Post", "Connect", "Learn"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200"
                  >
                    {label}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-card-hover border border-black/8">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Professionals collaborating"
                  width={800}
                  height={560}
                  className="w-full h-80 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-5 -left-6 bg-white rounded-2xl border border-black/8 shadow-card-hover p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">New connection!</div>
                  <div className="text-xs text-gray-500">Sarah K. just followed you</div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="absolute -top-4 -right-4 bg-blue-600 text-white rounded-2xl shadow-card-hover p-4"
              >
                <div className="text-2xl font-bold">12K+</div>
                <div className="text-blue-200 text-xs">Daily Active</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section className="py-14 px-5 bg-gray-50 border-y border-black/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl border border-black/8 shadow-card-hover overflow-hidden"
          >
            <div className="bg-gray-50 border-b border-black/8 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md border border-black/8 h-6" />
            </div>
            <div className="p-5 space-y-3">
              {[
                { name: "Alex Johnson", role: "CS Student", time: "2h ago", content: "Just launched my first open-source project! So excited to share it with the community 🚀", likes: "24", comments: "8" },
                { name: "Priya Sharma", role: "Law Student", time: "4h ago", content: "Collaboration tip: Always start with research before diving in. It saves 10x the time later and produces much better outcomes.", likes: "41", comments: "12" },
              ].map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="bg-white rounded-xl border border-black/8 shadow-soft p-4"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {post.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{post.name}</div>
                      <div className="text-xs text-gray-400">{post.role} · {post.time}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5">
                    {[{ icon: Heart, label: post.likes }, { icon: MessageCircle, label: post.comments }, { icon: Share2, label: "Share" }].map(({ icon: Icon, label }) => (
                      <button key={label} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                        <Icon size={13} /> {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp} className="text-blue-600 font-semibold text-xs uppercase tracking-widest mb-3">Features</motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Everything you need to thrive</motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              A complete social networking experience built for the next generation of learners and creators.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { icon: Users, title: "Smart Connections", desc: "Discover and connect with peers, mentors, and professionals through intelligent recommendations." },
              { icon: MessageCircle, title: "Real-time Messaging", desc: "Have meaningful conversations with your network through our clean, fast private messaging." },
              { icon: TrendingUp, title: "Knowledge Feed", desc: "Stay updated with posts, articles, and insights from your connections and communities." },
              { icon: BookOpen, title: "Skill Showcase", desc: "Build a rich professional profile highlighting your skills, projects, and achievements." },
              { icon: Bell, title: "Smart Notifications", desc: "Stay in the loop with contextual notifications about likes, comments, and connections." },
              { icon: Globe, title: "Global Community", desc: "Connect with students and professionals worldwide sharing diverse perspectives." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                className="bg-white rounded-2xl border border-black/8 shadow-card p-6 transition-all cursor-default group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="text-blue-600 group-hover:text-white transition-colors" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community In Action — Background Image Section */}
      <section id="community" className="relative py-24 px-5 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
            alt="Community collaborating"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/75" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="text-blue-300 font-semibold text-xs uppercase tracking-widest mb-3">For Everyone</motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">Built for students. Loved by professionals.</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-sm leading-relaxed mb-8">
              Whether you&apos;re a student looking for opportunities, a developer sharing side projects, or a professional mentoring the next generation — Sosa Socials is your home.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                "Share projects and get feedback",
                "Find mentors and collaborators",
                "Discover opportunities through your network",
                "Learn from professionals across industries",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                  <span className="text-blue-100 text-xs">{item}</span>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-btn text-sm cursor-pointer hover:bg-blue-50 transition-all"
                >
                  Join the Community <ArrowRight size={16} />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Law & Professional Section — Background Image Left Panel */}
      <section className="py-0 bg-white overflow-hidden">
        <div className="max-w-none">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 min-h-[520px]"
          >
            {/* Left: background image of a courtroom */}
            <motion.div variants={fadeUp} className="relative min-h-[340px] md:min-h-0">
              <Image
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80"
                alt="Courtroom and law"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium mb-3 w-fit border border-white/20">
                  <Scale size={12} />
                  Law & Legal Careers
                </div>
                <p className="text-white text-2xl font-bold leading-snug max-w-xs">
                  Where legal minds connect and grow
                </p>
              </div>
            </motion.div>

            {/* Right: content */}
            <motion.div variants={fadeUp} className="flex flex-col justify-center px-10 py-16 bg-white">
              <div className="text-blue-600 font-semibold text-xs uppercase tracking-widest mb-3">Law & Beyond</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5 leading-tight">
                The platform built for the legal community
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Sosa Socials was built for the legal community — law students, attorneys, paralegals, and professionals who want to stay connected, share insights, and advance their careers.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Users, title: "Law Student Network", desc: "Connect with fellow students across universities" },
                  { icon: Briefcase, title: "Professional Development", desc: "Learn from experienced legal professionals" },
                  { icon: TrendingUp, title: "Career Opportunities", desc: "Discover internships, clerkships, and jobs" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-black/8 shadow-soft hover:shadow-card transition-all"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials — Background image section */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1600&q=80"
            alt="Students studying together"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gray-950/82" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} className="text-blue-400 font-semibold text-xs uppercase tracking-widest mb-2">Testimonials</motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white">What our community says</motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { name: "Sarah K.", role: "Law Student", text: "Sosa Socials helped me find my first internship through a connection I made on the platform. The community is incredibly supportive!" },
              { name: "Marcus T.", role: "Full Stack Developer", text: "I love how clean and fast the platform is. The messaging system is smooth and the feed shows me relevant content from people I actually care about." },
              { name: "Aisha M.", role: "Attorney", text: "As a legal professional, this platform has become essential for staying up-to-date and mentoring the next generation of lawyers." },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 shadow-card hover:bg-white/15 transition-all p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-5">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-5 bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <motion.div variants={fadeUp}>
              <div className="text-blue-600 font-semibold text-xs uppercase tracking-widest mb-3">Get Started</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Ready to join the community?
              </h2>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Create your free account today and start connecting with thousands of students and professionals. It takes less than 2 minutes.
              </p>
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3 rounded-xl shadow-btn hover:shadow-btn-hover hover:bg-blue-700 transition-all text-sm cursor-pointer"
                >
                  Create Free Account <ArrowRight size={16} />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="relative rounded-2xl overflow-hidden shadow-card-hover border border-black/8">
              <Image
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=700&q=80"
                alt="Students networking"
                width={700}
                height={400}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent flex items-end p-5">
                <p className="text-white text-sm font-medium">Join 50,000+ members today</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-black/8 py-10 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <LogoIcon size={28} />
                <span className="font-bold text-gray-900 text-sm">Sosa Socials</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                The professional social platform built for law students, attorneys, and ambitious professionals.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Platform</h4>
              <div className="space-y-2">
                {["Features", "Community", "Pricing", "Blog"].map((item) => (
                  <a key={item} href="#" className="block text-xs text-gray-500 hover:text-blue-600 transition-colors">{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Legal</h4>
              <div className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Help Center"].map((item) => (
                  <a key={item} href="#" className="block text-xs text-gray-500 hover:text-blue-600 transition-colors">{item}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-black/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-400">© 2025 Sosa Socials. All rights reserved.</div>
            <div className="flex gap-5 text-xs text-gray-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>

      <PWAInstallBanner />
    </div>
  );
}
