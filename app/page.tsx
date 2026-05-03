"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowRight, Heart, Sparkles, X, Loader2 } from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
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

function AvatarFallback() {
  return <img src="/logo.jpg" alt="Sosa" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
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
    fetch(`/api/posts/${postId}`).
    then((r) => r.json()).
    then((data) => {if (data.post) setPost(data.post);}).
    catch(() => {}).
    finally(() => setLoading(false));
  }, [postId]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4"
        onClick={() => setOpen(false)}>
        
          <motion.div
          initial={{ opacity: 0, scale: 0.91, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.91, y: 28 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl border border-black/8 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-black/6">
              <div className="flex items-center gap-2">
                <LogoIcon size={40} />
                <span className="font-bold text-gray-900 text-sm">Sosa</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={15} />
              </button>
            </div>

            {loading ?
          <div className="flex items-center justify-center h-44">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div> :
          post ?
          <>
                {(post.images || []).filter(Boolean).length > 0 &&
            <img src={(post.images || [])[0]} alt="Post" className="w-full max-h-52 object-cover" />
            }
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {post.authorImage ? <img src={post.authorImage} alt={post.authorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <AvatarFallback />}
                    <div>
                      <p className="font-semibold text-sm text-gray-900">@{post.authorUsername || post.authorName}</p>
                      <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">{post.content}</p>
                  {((post.likes?.length || 0) > 0 || (post.comments?.length || 0) > 0) &&
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 text-xs text-gray-400">
                      {(post.likes?.length || 0) > 0 && <span className="flex items-center gap-1"><Heart size={12} className="fill-red-400 text-red-400" /> {post.likes?.length}</span>}
                      {(post.comments?.length || 0) > 0 && <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments?.length} {post.comments?.length === 1 ? "reply" : "replies"}</span>}
                    </div>
              }
                </div>
                <div className="px-4 pb-4 space-y-2.5">
                  <p className="text-xs text-center text-gray-400 mb-1">Join Sosa to like, comment and connect</p>
                  <Link href="/register" className="block w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center transition-all">Create Account to Continue</Link>
                  <Link href="/login" className="block w-full py-2 rounded-xl border border-black/10 text-gray-700 text-sm font-medium text-center hover:border-blue-500 hover:text-blue-600 transition-all">Already have an account? Sign in</Link>
                </div>
              </> :

          <div className="p-8 text-center text-gray-400 text-sm">
                <p>This post is no longer available.</p>
                <Link href="/register" className="block mt-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Join Sosa</Link>
              </div>
          }
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}

function GuestPostViewer() {
  return (
    <Suspense fallback={null}>
      <GuestPostViewerInner />
    </Suspense>);

}

export default function LandingPage() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#e8ecf0] flex flex-col">
      <GuestPostViewer />
      <PWAInstallBanner />
      <header className="bg-white/95 backdrop-blur-sm border-b border-black/8 shadow-soft flex-shrink-0">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><LogoIcon size={42} /><span className="font-bold text-gray-900 text-sm">Sosa</span></div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
            <a href="#features" className="hover:text-blue-400 transition-colors font-medium">Features</a>
            <a href="#community" className="hover:text-blue-400 transition-colors font-medium">Community</a>
            <a href="#about" className="hover:text-blue-400 transition-colors font-medium">About</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="text-sm text-gray-700 font-medium px-4 py-1.5 rounded-lg border border-black/10 hover:border-blue-500 hover:text-blue-600 transition-all">Login</Link>
            <Link href="/register" className="text-sm text-white font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all">Get Started</Link>
          </div>
        </div>
      </header>
      <section className="pt-16 pb-16 px-5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-500 font-medium mb-5">
                <Sparkles size={13} className="fill-blue-400" />
                The Social Platform for Everyone
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
                Connect. Share. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Grow Together.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-base text-gray-600 mb-8 leading-relaxed max-w-xl">Sosa is where people come together to share ideas, build meaningful connections, and discover new communities. Connect with people who share your interests.</motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link href="/register"><motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-7 py-3 rounded-xl shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all cursor-pointer">Join for Free <ArrowRight size={17} /></motion.div></Link>
                <Link href="/login"><motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 text-gray-900 font-semibold px-7 py-3 rounded-xl border border-black/10 hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer">Sign In</motion.div></Link>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/8"><Image src="https://images.unsplash.com/photo-1549436779-6d582a63f97f" alt="People connecting" width={800} height={560} className="w-full h-80 object-cover" priority /><div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" /></div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>);

}