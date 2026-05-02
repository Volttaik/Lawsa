"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MessageCircle, TrendingUp, Star, ArrowRight,
  Heart, Bell, BadgeCheck, X, Loader2, Zap, Shield, Globe,
} from "lucide-react";

function GuestPostViewerInner() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post");
  const [post, setPost] = useState<any>(null);
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
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.91, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.91, y: 28 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="bg-[#111] rounded-2xl border border-[#333] w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-black text-xs">S</span>
                </div>
                <span className="font-bold text-white text-sm">Sosa Socials</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#222] transition-all">
                <X size={15} />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-44">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div>
            ) : post ? (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {post.authorImage
                    ? <img src={post.authorImage} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                    : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{post.authorName?.[0]?.toUpperCase()}</div>}
                  <div>
                    <p className="font-bold text-white text-sm">{post.authorName}</p>
                    {post.authorUsername && <p className="text-gray-500 text-xs">@{post.authorUsername}</p>}
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">{post.content}</p>
                <div className="flex gap-4 text-gray-500 text-xs border-t border-[#222] pt-3">
                  <span className="flex items-center gap-1"><Heart size={12} /> {(post.likes || []).length}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {(post.comments || []).length}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">Post not found</div>
            )}
            <div className="px-4 pb-4">
              <Link href="/register" className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-full text-center text-sm transition-colors">
                Join Sosa to reply
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const FEATURES = [
  { icon: BadgeCheck, title: "Verified Profiles", desc: "Get a blue checkmark and build trust with your audience.", color: "text-blue-400" },
  { icon: MessageCircle, title: "Real-time Chat", desc: "WhatsApp-style messaging with read receipts and reactions.", color: "text-green-400" },
  { icon: Users, title: "Clans & Groups", desc: "Join communities of like-minded professionals and students.", color: "text-purple-400" },
  { icon: TrendingUp, title: "Profile Boost", desc: "Get featured at the top of search and recommendations.", color: "text-orange-400" },
  { icon: Bell, title: "Smart Notifications", desc: "Never miss an important interaction or update.", color: "text-yellow-400" },
  { icon: Shield, title: "Privacy First", desc: "Control who sees your content and profile information.", color: "text-pink-400" },
];

const POSTS = [
  { name: "Chidi Okonkwo", handle: "chidi_ok", avatar: "", content: "Just closed my first major deal through a connection I made on Sosa Socials. This platform is a game changer for Nigerian professionals!", likes: 482, time: "2h" },
  { name: "Amaka Eze", handle: "amaka_law", avatar: "", content: "The legal community on here is so supportive. Got amazing feedback on my research paper from senior practitioners. Highly recommend!", likes: 291, time: "4h" },
  { name: "Tunde Adeyemi", handle: "tunde_tech", avatar: "", content: "From zero followers to 2,000 connections in 3 months. The networking opportunities on Sosa are unmatched in Nigeria 🇳🇬", likes: 1200, time: "1d" },
];

function MockPost({ post }: { post: typeof POSTS[0] }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="border border-[#2f3336] rounded-2xl p-4 bg-[#080808]">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
          {post.name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-white text-sm">{post.name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-400" />
            <span className="text-gray-500 text-xs">@{post.handle} · {post.time}</span>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-5 mt-3">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 text-xs transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> Reply
            </button>
            <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-pink-500" : "text-gray-500 hover:text-pink-400"}`}>
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-pink-500" : ""}`} /> {post.likes + (liked ? 1 : 0)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={null}><GuestPostViewerInner /></Suspense>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="text-white font-black text-lg">Sosa Socials</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-gray-400 hover:text-white text-sm transition-colors">Features</button>
            <button onClick={() => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" })} className="text-gray-400 hover:text-white text-sm transition-colors">Community</button>
            <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-gray-400 hover:text-white text-sm transition-colors">Premium</button>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-gray-300 hover:text-white font-medium text-sm px-4 py-2 rounded-full border border-[#333] hover:border-[#555] transition-colors">Login</Link>
            <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-full transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400 text-xs font-semibold">Nigeria's #1 Professional Network</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
              Connect.<br />
              <span className="text-blue-500">Share.</span><br />
              Grow Together.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
              Sosa Socials is where students and professionals come together to build meaningful connections, share knowledge, and unlock new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-3 rounded-full text-center transition-colors flex items-center justify-center gap-2">
                Join for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="border border-[#333] hover:border-[#555] text-white font-bold px-6 py-3 rounded-full text-center transition-colors">
                Sign In
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {["A","B","C","D"].map((l, i) => (
                  <div key={l} className="w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold" style={{ zIndex: 4 - i }}>{l}</div>
                ))}
              </div>
              <p className="text-gray-400 text-sm"><span className="text-white font-bold">10,000+</span> professionals already on Sosa</p>
            </div>
          </motion.div>

          {/* Mock feed */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-3">
            {POSTS.map((post, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <MockPost post={post} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 border-t border-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Everything you need to grow</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Powerful features designed for Nigerian students and professionals.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#333] transition-colors">
                  <Icon className={`w-8 h-8 ${f.color} mb-4`} />
                  <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community / social proof */}
      <section id="community" className="py-20 px-4 sm:px-6 border-t border-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">A community that has your back</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Join thousands of Nigerian legal, business, and tech professionals who use Sosa Socials daily to collaborate, learn, and advance their careers.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[["10K+","Members"],["50K+","Posts"],["98%","Satisfied"]].map(([num, label]) => (
                  <div key={label} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-blue-400">{num}</p>
                    <p className="text-gray-500 text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <Link href="/register" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-full transition-colors">
                Join the community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">N</div>
                  <div>
                    <div className="flex items-center gap-1"><p className="font-bold text-white">Ngozi Adaeze</p><BadgeCheck className="w-4 h-4 text-blue-400" /></div>
                    <p className="text-gray-500 text-xs">@ngozi_legal · Senior Associate</p>
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">
                  "Sosa Socials completely transformed how I network. I've connected with over 500 professionals, landed two speaking engagements, and even got my current job through a connection here. It's not just a social network — it's a career platform."
                </p>
                <div className="flex items-center gap-4 text-gray-500 text-xs border-t border-[#222] pt-3">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" /> 847</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 142</span>
                  <span className="ml-auto text-green-400 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium / Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 border-t border-[#111]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">Sosa Premium</span>
          </div>
          <h2 className="text-4xl font-black mb-4">Stand out from the crowd</h2>
          <p className="text-gray-400 text-lg mb-10">Unlock powerful premium features with one-time payments. No subscriptions.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "Verified Badge", price: "₦2,500", icon: BadgeCheck, color: "text-blue-400", desc: "Blue ✓ on your profile" },
              { name: "Profile Boost", price: "₦1,500", icon: TrendingUp, color: "text-purple-400", desc: "Top of search results" },
              { name: "Premium Theme", price: "₦1,000", icon: Star, color: "text-amber-400", desc: "Gold avatar ring" },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 text-center hover:border-[#333] transition-colors">
                  <Icon className={`w-8 h-8 ${p.color} mx-auto mb-3`} />
                  <p className="font-bold text-white mb-1">{p.name}</p>
                  <p className="text-2xl font-black text-white mb-1">{p.price}</p>
                  <p className="text-gray-500 text-xs">{p.desc}</p>
                </div>
              );
            })}
          </div>
          <Link href="/register" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-full transition-colors">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-[#111]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6">Ready to grow?</h2>
          <p className="text-gray-400 text-lg mb-8">Join Sosa Socials today — it's completely free to get started.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-black px-8 py-4 rounded-full text-lg transition-colors">
            Join for free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span className="text-gray-400 text-sm font-semibold">Sosa Socials</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-gray-500 hover:text-white text-sm transition-colors">Login</Link>
            <Link href="/register" className="text-gray-500 hover:text-white text-sm transition-colors">Register</Link>
            <Link href="/dashboard/premium" className="text-gray-500 hover:text-white text-sm transition-colors">Premium</Link>
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Sosa Socials. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
