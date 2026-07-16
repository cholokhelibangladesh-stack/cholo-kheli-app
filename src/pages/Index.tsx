import React, { useState, useEffect, useRef } from"react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useMotionTemplate, useSpring } from"framer-motion";
import { Link, useNavigate } from"@tanstack/react-router";
import {
 ArrowRight, ArrowLeft, Shield, Twitter, Facebook,
 Instagram, Youtube, ChevronDown
} from"lucide-react";
import { Button } from"@/components/ui/button";
import { useAuth } from"@/hooks/useAuth";
import { supabase } from"@/integrations/supabase/client";
import CholoKheliMark from"@/components/CholoKheliMark";
import HeroMistCursor from"@/components/HeroMistCursor";
import HeroScrollVideo from"@/components/HeroScrollVideo";
import heroImg from"@/assets/hero-cricket.jpg.asset.json";
import footballerImg from"@/assets/footballer-motion.jpg.asset.json";
import { safeMediaUrl } from"@/lib/sanitize";
import { useLanguage } from"@/i18n/LanguageProvider";

const COPY = {
 en: {
 heroTagline:"A quiet place where Bangladesh's grassroots talent meets verified scouts. Safe. Transparent. Built for the love of the game.",
 openDashboard:"Open Dashboard",
 joinAsPlayer:"Join as Player",
 imAScout:"I'm a Scout",
 scroll:"Scroll",
 sportsTitle1:"EVERY GAME,",
 sportsTitle2:"EVERY PLAYER",
 football:"Football",
 cricket:"Cricket",
 basketball:"Basketball",
 footballTag:"From para to pitch",
 cricketTag:"Bat. Ball. Belief.",
 basketballTag:"Rising on the hardwood",
 footballBlurb:"Bangladesh's most-loved game. We connect strikers, keepers, and midfielders from every district to scouts who're watching.",
 cricketBlurb:"From maktab grounds to national selection — batters, bowlers, and all-rounders get a verified pathway to be seen.",
 basketballBlurb:"A growing scene in Dhaka and Chattogram. Guards, forwards, and centres — your jump shot deserves an audience.",
 explore:"Explore",
 thePlatform:"The Platform",
 howItWorks1:"HOW IT",
 howItWorks2:"WORKS",
 howItWorksSub:"Three simple steps from unknown talent to scouted athlete",
 step1Pill:"Create Profile",
 step1Title:"YOUR STORY\nSTARTS HERE",
 step1Body:"Sign up as a Player, add your details, select your sport — Football or Cricket. Your profile becomes your digital identity, visible to scouts across Bangladesh.",
 athletics:"Athletics",
 step2Pill:"Upload Highlights",
 step2Title:"LET YOUR GAME\nSPEAK",
 step2Body:"Record a 3-minute highlight video. Tag your position and traits. Pay ৳100 via bKash. Your reel goes live to hundreds of verified scouts instantly.",
 only100:"Only ৳100",
 only100Sub:"One-time payment via bKash · Instantly live",
 step3Pill:"Get Discovered",
 step3Title:"SCOUTS\nFIND YOU",
 step3Body:"Verified scouts browse your profile, shortlist you, and reach out through our safe admin-mediated channel. No direct contact. No corruption. Pure merit.",
 scoutDashboard:"Scout Dashboard",
 midfielder:"Midfielder", forward:"Forward", allRounder:"All-rounder",
 shortlisted:" Shortlisted",
 live:"Live",
 midfielderLong:"Midfielder · Football · Dhaka",
 skillSpeed:"Speed", skillDribbling:"Dribbling", skillVision:"Vision", skillPositioning:"Positioning",
 ourNetwork:"Our Network",
 verified:"VERIFIED", scouts:"SCOUTS",
 scoutsSub:"Hear directly from the professionals discovering talent across Bangladesh",
 of:"OF",
 previous:"Previous", next:"Next",
 joinFree:"Join Cholo Kheli Free",
 ourMission:"Our Mission",
 playersRegistered:"Players Registered",
 verifiedScouts:"Verified Scouts",
 talentDiscovered:"Talent Discovered",
 followJourney:"Follow the Journey",
 copyright:"© 2026 Cholo Kheli — Let's Play",
 },
 bn: {
 heroTagline:"একটি শান্ত জায়গা যেখানে বাংলাদেশের তৃণমূল প্রতিভা যাচাইকৃত স্কাউটদের সাথে মিলিত হয়। নিরাপদ। স্বচ্ছ। খেলার ভালোবাসার জন্য তৈরি।",
 openDashboard:"ড্যাশবোর্ড খুলুন",
 joinAsPlayer:"প্লেয়ার হিসেবে যোগ দিন",
 imAScout:"আমি একজন স্কাউট",
 scroll:"স্ক্রল",
 sportsTitle1:"প্রতিটি খেলা,",
 sportsTitle2:"প্রতিটি খেলোয়াড়",
 football:"ফুটবল",
 cricket:"ক্রিকেট",
 basketball:"বাস্কেটবল",
 footballTag:"পাড়া থেকে মাঠে",
 cricketTag:"ব্যাট। বল। বিশ্বাস।",
 basketballTag:"কাঠের কোর্টে উদীয়মান",
 footballBlurb:"বাংলাদেশের সবচেয়ে প্রিয় খেলা। আমরা প্রতিটি জেলার স্ট্রাইকার, গোলরক্ষক ও মিডফিল্ডারদের যাচাইকৃত স্কাউটদের সাথে যুক্ত করি।",
 cricketBlurb:"মক্তবের মাঠ থেকে জাতীয় নির্বাচন পর্যন্ত — ব্যাটার, বোলার ও অলরাউন্ডাররা দৃশ্যমান হওয়ার একটি যাচাইকৃত পথ পায়।",
 basketballBlurb:"ঢাকা ও চট্টগ্রামে ক্রমবর্ধমান একটি অঙ্গন। গার্ড, ফরোয়ার্ড ও সেন্টার — আপনার জাম্প শট দর্শক প্রাপ্য।",
 explore:"অন্বেষণ",
 thePlatform:"প্ল্যাটফর্ম",
 howItWorks1:"এটি কীভাবে",
 howItWorks2:"কাজ করে",
 howItWorksSub:"অজানা প্রতিভা থেকে স্কাউটেড অ্যাথলিটে — তিনটি সহজ ধাপ",
 step1Pill:"প্রোফাইল তৈরি করুন",
 step1Title:"আপনার গল্প\nএখানেই শুরু",
 step1Body:"প্লেয়ার হিসেবে সাইন আপ করুন, আপনার তথ্য যোগ করুন, আপনার খেলা নির্বাচন করুন — ফুটবল বা ক্রিকেট। আপনার প্রোফাইলই আপনার ডিজিটাল পরিচয়, বাংলাদেশের সকল স্কাউটের কাছে দৃশ্যমান।",
 athletics:"অ্যাথলেটিক্স",
 step2Pill:"হাইলাইট আপলোড করুন",
 step2Title:"আপনার খেলা\nকথা বলুক",
 step2Body:"একটি ৩-মিনিটের হাইলাইট ভিডিও রেকর্ড করুন। আপনার পজিশন ও বৈশিষ্ট্য ট্যাগ করুন। বিকাশে ১০০ টাকা পরিশোধ করুন। আপনার রিল তাৎক্ষণিকভাবে শত শত যাচাইকৃত স্কাউটের কাছে লাইভ হয়ে যাবে।",
 only100:"মাত্র ১০০ টাকা",
 only100Sub:"বিকাশে এককালীন পেমেন্ট · তাৎক্ষণিক লাইভ",
 step3Pill:"আবিষ্কৃত হন",
 step3Title:"স্কাউট\nআপনাকে খুঁজে পাবে",
 step3Body:"যাচাইকৃত স্কাউটরা আপনার প্রোফাইল দেখে, আপনাকে শর্টলিস্ট করে এবং আমাদের নিরাপদ অ্যাডমিন-মধ্যস্থ চ্যানেলে যোগাযোগ করে। কোনো সরাসরি যোগাযোগ নেই। কোনো দুর্নীতি নেই। শুধুই মেধা।",
 scoutDashboard:"স্কাউট ড্যাশবোর্ড",
 midfielder:"মিডফিল্ডার", forward:"ফরোয়ার্ড", allRounder:"অলরাউন্ডার",
 shortlisted:" শর্টলিস্টেড",
 live:"লাইভ",
 midfielderLong:"মিডফিল্ডার · ফুটবল · ঢাকা",
 skillSpeed:"গতি", skillDribbling:"ড্রিবলিং", skillVision:"দৃষ্টি", skillPositioning:"পজিশনিং",
 ourNetwork:"আমাদের নেটওয়ার্ক",
 verified:"যাচাইকৃত", scouts:"স্কাউট",
 scoutsSub:"বাংলাদেশজুড়ে প্রতিভা আবিষ্কারকারী পেশাদারদের কাছ থেকে সরাসরি শুনুন",
 of:"এর",
 previous:"পূর্ববর্তী", next:"পরবর্তী",
 joinFree:"চলো খেলিতে বিনামূল্যে যোগ দিন",
 ourMission:"আমাদের লক্ষ্য",
 playersRegistered:"নিবন্ধিত খেলোয়াড়",
 verifiedScouts:"যাচাইকৃত স্কাউট",
 talentDiscovered:"আবিষ্কৃত প্রতিভা",
 followJourney:"যাত্রা অনুসরণ করুন",
 copyright:"© ২০২৬ চলো খেলি — চলো খেলি",
 },
} as const;

const socialLinks = [
 { Icon: Facebook, label:"Facebook", href:"https://facebook.com/cholokheli", color:"hover:text-[hsl(var(--teal))]" },
 { Icon: Twitter, label:"Twitter / X", href:"https://twitter.com/cholokheli", color:"hover:text-[hsl(var(--teal))]" },
 { Icon: Instagram, label:"Instagram", href:"https://instagram.com/cholokheli", color:"hover:text-[hsl(var(--teal))]" },
 { Icon: Youtube, label:"YouTube", href:"https://youtube.com/@cholokheli", color:"hover:text-[hsl(var(--teal))]" },
];

type ScoutProfile = {
 user_id: string;
 full_name: string;
 organization: string | null;
 avatar_url: string | null;
 bio: string | null;
};

const FALLBACK_SCOUTS: ScoutProfile[] = [
 {
 user_id:"fb-1",
 full_name:"Tanvir Hasan",
 organization:"Bashundhara Kings Academy",
 avatar_url: null,
 bio:"Fifteen years scouting football across Dhaka and Chattogram divisions. I look for players who read the game two passes ahead — technique can be coached, vision is rarer. My job is to give district-level talent a fair shot at the national pipeline.",
 },
 {
 user_id:"fb-2",
 full_name:"Nusrat Jahan",
 organization:"Bangladesh Cricket Board",
 avatar_url: null,
 bio:"Former domestic all-rounder, now scouting for the women's and U-19 pathways. Cholo Kheli lets me watch tape from villages I'd never reach in person. Every week I find someone worth a closer look — that didn't happen before.",
 },
 {
 user_id:"fb-3",
 full_name:"Imran Chowdhury",
 organization:"Sheikh Russel KC",
 avatar_url: null,
 bio:"I scout midfielders and defenders for the Premier League side. The verified, admin-mediated channel here means I'm talking to real players and real guardians — no agents, no noise. That trust is what made me sign up.",
 },
 {
 user_id:"fb-4",
 full_name:"Farhana Ahmed",
 organization:"Abahani Limited Dhaka",
 avatar_url: null,
 bio:"Twelve years in talent identification. The grassroots in Bangladesh is deeper than people think — what's been missing is a clean way to see it. Cholo Kheli is the first platform where I trust every profile in front of me.",
 },
 {
 user_id:"fb-5",
 full_name:"Rashed Mahmud",
 organization:"BFF Elite Academy",
 avatar_url: null,
 bio:"I focus on under-17 prospects. Three minutes of honest footage tells me more than a written CV ever could. The players I've shortlisted from this platform are now training with us in Sylhet — that's the proof I needed.",
 },
];


/* ── Animated counter ── */
function Counter({ target, suffix ="" }: { target: number; suffix?: string }) {
 const [count, setCount] = useState(0);
 const ref = useRef<HTMLSpanElement>(null);
 const inView = useInView(ref, { once: true });
 useEffect(() => {
 if (!inView) return;
 let start = 0;
 const step = (ts: number) => {
 if (!start) start = ts;
 const prog = Math.min((ts - start) / 1800, 1);
 const eased = 1 - Math.pow(1 - prog, 3);
 setCount(Math.floor(eased * target));
 if (prog < 1) requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
 }, [inView, target]);
 return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Scroll-reveal ── */
const Reveal = React.forwardRef<HTMLDivElement, {
 children: React.ReactNode; delay?: number; className?: string; direction?:"up" |"left" |"right";
}>(function Reveal({ children, delay = 0, className ="", direction ="up" }, _forwardedRef) {
 const ref = useRef<HTMLDivElement>(null);
 const inView = useInView(ref, { once: true, margin:"-8% 0px" });
 const initial = direction ==="left" ? { opacity: 0, x: -50 } : direction ==="right" ? { opacity: 0, x: 50 } : { opacity: 0, y: 50 };
 return (
 <motion.div ref={ref} initial={initial} animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
 transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
 {children}
 </motion.div>
);
});

/* ── Scout carousel card with parallax shine + smooth fade ── */
const ScoutCarouselCard = React.forwardRef<HTMLDivElement, { scout: ScoutProfile; defaultBio: string }>(function ScoutCarouselCard({ scout, defaultBio }, _forwardedRef) {
 const ref = useRef<HTMLDivElement>(null);
 const mx = useMotionValue(50);
 const my = useMotionValue(25);
 const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.4 });
 const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.4 });
 const shine = useMotionTemplate`radial-gradient(120% 80% at ${sx}% ${sy}%, rgba(180,215,245,0.45) 0%, rgba(90,140,190,0.22) 28%, rgba(20,40,70,0.05) 58%, rgba(0,0,0,0) 78%)`;
 const accent = useMotionTemplate`radial-gradient(60% 50% at ${sx}% ${sy}%, hsl(var(--green) / 0.35), transparent 70%)`;

 const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
 const r = ref.current?.getBoundingClientRect();
 if (!r) return;
 mx.set(((e.clientX - r.left) / r.width) * 100);
 my.set(((e.clientY - r.top) / r.height) * 100);
 };
 const onLeave = () => { mx.set(50); my.set(25); };

 return (
 <motion.div
 ref={ref}
 onMouseMove={onMove}
 onMouseLeave={onLeave}
 initial={{ opacity: 0, y: 24, filter:"blur(8px)" }}
 animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
 exit={{ opacity: 0, y: -16, filter:"blur(6px)" }}
 transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
 whileHover={{ scale: 1.005 }}
 className="absolute inset-0 rounded-3xl border overflow-hidden p-5 sm:p-10 lg:p-12 flex flex-col justify-between shadow-2xl"
 style={{ borderColor:"hsl(var(--green) / 0.22)", background:"#0a1520" }}
 >
 {/* Mouse-tracked shine */}
 <motion.div className="absolute inset-0 pointer-events-none" style={{ background: shine }} />
 {/* Static cool highlight bottom-right */}
 <div className="absolute inset-0 pointer-events-none"
 style={{ background:"radial-gradient(90% 70% at 95% 100%, rgba(120,170,220,0.22) 0%, rgba(120,170,220,0.05) 35%, transparent 65%)" }} />
 {/* Mouse-tracked brand tint */}
 <motion.div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: accent }} />
 {/* Sweeping diagonal sheen on enter */}
 <motion.div
 className="absolute inset-y-0 -inset-x-1/4 pointer-events-none"
 initial={{ x:"-60%", opacity: 0 }}
 animate={{ x:"120%", opacity: [0, 0.6, 0] }}
 transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
 style={{ background:"linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)" }}
 />
 {/* Top edge gloss */}
 <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
 style={{ background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }} />

 <div className="relative flex items-center gap-3">
 <div className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center"
 style={{ borderColor:"hsl(var(--green) / 0.4)", background:"hsl(var(--green) / 0.15)" }}>
 {scout.avatar_url ? (
 <img src={safeMediaUrl(scout.avatar_url)} alt={scout.full_name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
) : (
 <span className="font-display text-xl text-white">{scout.full_name.charAt(0).toUpperCase()}</span>
)}
 </div>
 <div className="w-9 h-9 rounded-full flex items-center justify-center -ml-4 border-2"
 style={{ borderColor:"hsl(var(--ink))", background:"hsl(var(--green))" }}>
 <Shield className="h-4 w-4 text-white" />
 </div>
 </div>

 <p className="relative text-sm sm:text-xl lg:text-[26px] leading-relaxed text-white/95 font-light tracking-tight my-4 sm:my-8 line-clamp-6 sm:line-clamp-none break-words">
"{scout.bio ?? defaultBio}"
 </p>

 <div className="relative min-w-0">
 <p className="text-sm sm:text-base font-semibold text-white truncate">{scout.full_name}</p>
 {scout.organization && <p className="text-xs sm:text-sm text-white/55 mt-0.5 truncate">{scout.organization}</p>}
 </div>

 </motion.div>
);
});

/* ════════════════════════════════════════════
 PAGE
════════════════════════════════════════════ */
const Index = () => {
 const { user, role, loading: authLoading } = useAuth();
 const navigate = useNavigate();
 const { lang } = useLanguage();
 const T = COPY[lang];
 const [verifiedScouts, setVerifiedScouts] = useState<ScoutProfile[]>(FALLBACK_SCOUTS);
 const [scoutIndex, setScoutIndex] = useState(0);

 // Auto-redirect returning signed-in users straight to their in-app home,
 // so re-opening the app after signup lands on the dashboard, not marketing.
 const shouldRedirect = !authLoading && !!user && !!role;
 useEffect(() => {
   if (!shouldRedirect) return;
   const dest = role === "admin" ? "/admin" : role === "scout" ? "/scout" : "/player";
   navigate({ to: dest as any, replace: true });
 }, [shouldRedirect, role, navigate]);

 useEffect(() => {
 const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL;
 if (isPlaceholder) return;
 const fetchScouts = async () => {
 try {
 const { data: scoutData } = await supabase.from("scout_profiles").select("user_id, organization").eq("verification_status","active").limit(12);
 if (!scoutData?.length) return;
 const userIds = scoutData.map((s) => s.user_id);
 const { data: profileData } = await supabase.from("profiles").select("user_id, full_name, avatar_url, bio").in("user_id", userIds);
 const map = Object.fromEntries((profileData ?? []).map((p) => [p.user_id, p]));
 setVerifiedScouts(scoutData.map((s) => ({
 user_id: s.user_id, organization: s.organization,
 full_name: map[s.user_id]?.full_name ??"Scout",
 avatar_url: map[s.user_id]?.avatar_url ?? null,
 bio: map[s.user_id]?.bio ?? null,
 })));
 } catch (e) {
 console.warn("scouts fetch failed", e);
 }
 };
 fetchScouts();
 }, []);



 // Lock body scroll while on the intro flow — the user cannot scroll away
 // until they've signed up (auth redirects them to their dashboard).
 useEffect(() => {
 const prevHtml = document.documentElement.style.overflow;
 const prevBody = document.body.style.overflow;
 document.documentElement.style.overflow ="hidden";
 document.body.style.overflow ="hidden";
 return () => {
 document.documentElement.style.overflow = prevHtml;
 document.body.style.overflow = prevBody;
 };
 }, []);

 // Keep the public intro visible while auth resolves on cold project loads.
 // A signed-in user is only covered once we know their role and are routing.
 if (shouldRedirect) {
   return (
     <div className="min-h-[100svh] w-full grid place-items-center bg-background">
       <CholoKheliMark className="h-16 w-16 text-primary" aria-label="Loading" />
     </div>
   );
 }

 return (
 <div className="h-[100svh] overflow-hidden bg-background">
 {/* ══════════════════════════════════════════
 HERO — Slide-driven cinematic (Next button, mobile app)
 ══════════════════════════════════════════ */}
 <HeroScrollVideo
 mode="slides"
 tagline={T.heroTagline}
 scrollLabel={T.scroll}
 joinLabel={T.joinAsPlayer}
 scoutLabel={T.imAScout}
 openDashboardLabel={T.openDashboard}
 isAuthed={!!(user && role)}
 dashboardHref={role ==="admin" ?"/admin" : role ==="scout" ?"/scout" :"/player"}
 />







 {/* ══════════════════════════════════════════
 VERIFIED SCOUTS
 ══════════════════════════════════════════ */}
 <section className="py-16 sm:py-20 relative overflow-hidden" style={{ background:"hsl(var(--ink))" }}>
 <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
 style={{ backgroundImage:"linear-gradient(hsl(var(--green)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--green)) 1px, transparent 1px)", backgroundSize:"80px 80px" }} />


 <div className="container relative z-10">
 <Reveal className="text-center mb-12">
 <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 px-4 py-1.5 rounded-full"
 style={{ background:"hsl(var(--green) / 0.15)", color:"hsl(var(--green))" }}>{T.ourNetwork}</span>
 <h2 className="font-display text-3xl sm:text-5xl text-white">
 {T.verified} <span style={{ color:"hsl(var(--green))" }}>{T.scouts}</span>
 </h2>
 <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto mt-2">
 {T.scoutsSub}
 </p>
 </Reveal>

 {verifiedScouts.length > 0 && (() => {
 const scout = verifiedScouts[scoutIndex % verifiedScouts.length];
 const prev = () => setScoutIndex((i) => (i - 1 + verifiedScouts.length) % verifiedScouts.length);
 const next = () => setScoutIndex((i) => (i + 1) % verifiedScouts.length);
 const defaultBio = `${scout.full_name} is a verified scout${scout.organization ? ` with ${scout.organization}` :""}, actively discovering grassroots talent across Bangladesh through Cholo Kheli.`;
 return (
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 lg:gap-10 items-stretch max-w-6xl mx-auto">
 <div className="relative min-h-[360px] sm:min-h-[420px]">
 <AnimatePresence mode="wait">
 <ScoutCarouselCard key={scout.user_id} scout={scout} defaultBio={defaultBio} />
 </AnimatePresence>
 </div>


 <div className="flex lg:flex-col justify-between gap-4 lg:py-2">
 <div className="text-xs font-mono tracking-[0.2em] text-white/50 self-start">
 {String(scoutIndex + 1).padStart(2,"0")} {T.of} {String(verifiedScouts.length).padStart(2,"0")} //
 </div>
 <div className="flex lg:flex-col gap-3 lg:gap-2 lg:mt-auto w-full">
 <button onClick={prev}
 className="group flex-1 flex items-center justify-between gap-3 px-4 py-4 rounded-xl border transition-colors hover:bg-white/5"
 style={{ borderColor:"hsl(var(--green) / 0.2)" }}>
 <ArrowLeft className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
 <span className="text-sm font-medium text-white/80 group-hover:text-white">{T.previous}</span>
 </button>
 <button onClick={next}
 className="group flex-1 flex items-center justify-between gap-3 px-4 py-4 rounded-xl border transition-colors hover:bg-white/5"
 style={{ borderColor:"hsl(var(--green) / 0.2)" }}>
 <span className="text-sm font-medium text-white/80 group-hover:text-white">{T.next}</span>
 <ArrowRight className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
 </button>
 </div>
 </div>
 </div>
);
 })()}
 </div>
 </section>


 {/* ══════════════════════════════════════════
 CINEMATIC CTA
 ══════════════════════════════════════════ */}
 <section className="py-16 sm:py-24 relative overflow-hidden surface-ink">


 {/* Cinematic backdrop */}
 <img src={footballerImg.url} alt="" aria-hidden loading="lazy" decoding="async"
 className="absolute inset-0 w-full h-full object-cover opacity-40" />
 <div className="absolute inset-0 pointer-events-none"
 style={{ background:"linear-gradient(to bottom, hsl(var(--ink) / 0.85), hsl(var(--ink) / 0.95))" }} />
 {/* Top edge fade — hide image at seam so bridge (pure ink) meets pure ink */}
 <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-20 z-[2]"
 style={{ background:"linear-gradient(to bottom, hsl(var(--ink)) 0%, hsl(var(--ink) / 0.6) 55%, transparent 100%)" }} />
 {/* Bottom edge fade — hide image at seam so section meets bridge cleanly */}
 <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-[2]"
 style={{ background:"linear-gradient(to top, hsl(var(--ink)) 0%, hsl(var(--ink) / 0.6) 55%, transparent 100%)" }} />


 {/* Animated grid */}
 <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
 style={{ backgroundImage:"linear-gradient(hsl(var(--green)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--green)) 1px, transparent 1px)", backgroundSize:"60px 60px" }} />

 <div className="container relative z-10">
 <Reveal>
	 <div className="max-w-5xl mx-auto">


 {/* CTAs below the phones */}
 <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
 {!user && (
 <Link to="/auth">
 <Button size="lg" className="font-bold text-lg px-12 py-6 animate-pulse-glow"
 style={{ background:"hsl(var(--green))", color:"hsl(var(--primary-foreground))" }}>
 {T.joinFree} <ArrowRight className="ml-2 h-5 w-5" />
 </Button>
 </Link>
)}
 <Link to="/mission">
 <Button size="lg" variant="outline" className="font-semibold text-lg px-10 py-6"
 style={{ borderColor:"hsl(var(--green) / 0.3)", color:"hsl(var(--green))" }}>
 {T.ourMission}
 </Button>
 </Link>
 </div>
 </div>
 </Reveal>
 </div>
 </section>


 </div>
);
};

export default Index;
