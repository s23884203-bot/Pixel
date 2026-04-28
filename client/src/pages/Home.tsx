ابغاك تشيل التقيمات اليدوية و تبقي النظام التلقائي 

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Star, ExternalLink, MessageSquare, Award, Sparkles, LayoutGrid, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

interface Review {
  id: number | string;
  content: string;
  image?: string | null;
  rating: number | null;
  authorName: string;
  authorAvatar?: string | null;
  timestamp: string | Date;
}

interface Partner {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  link?: string | null;
}

interface FeaturedClient {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  serverIcon: string | null;
  inviteLink: string;
  platform: 'discord' | 'kick';
}

const MANUAL_REVIEWS: Review[] = [
  {
    "id": "manual_117",
    "authorName": "Neon",
    "content": "10/10 شغل احترافي وفن ويعطي اقتراحات جامده افضل مصمم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-02"
  }
];

const AnimatedTagline = () => {
  return (
    <div className="text-center mt-6 mb-12">
      <div className="relative inline-block group">
        <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm">
            <span className="text-2xl md:text-3xl animate-bounce filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">📌</span>
            <div className="flex flex-col">
              <h2 className="flex flex-wrap justify-center items-center gap-x-3 text-xl md:text-3xl font-black italic tracking-tighter" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <span className="text-white/90">من خيالك</span>
                <span className="text-white/10 text-lg md:text-xl font-light not-italic">——</span>
                <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">للواقع</span>
              </h2>
              <div className="relative w-full h-[1.5px] mt-2 bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite_ease-in-out]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating }: { rating: number | null }) => {
  const stars = rating || 5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const { data: reviewsData, isLoading: reviewsLoading } = trpc.reviews.list.useQuery(undefined, {
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchInterval: 300000
  });
  const { data: partnerMessages } = trpc.reviews.partners.useQuery();
  const { data: featuredClientsData } = trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>(MANUAL_REVIEWS);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredClients, setFeaturedClients] = useState<FeaturedClient[]>([]);

  useEffect(() => {
    if (reviewsData && reviewsData.length > 0) {
      // التقييمات القادمة من السيرفر (ديسكورد + قاعدة البيانات)
      const sorted = [...reviewsData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // دمج التقييمات اليدوية مع تقييمات السيرفر
      // نضع تقييمات السيرفر في البداية لتظهر الأحدث أولاً
      const merged = [...sorted, ...MANUAL_REVIEWS];
      
      // منع التكرار بناءً على المحتوى واسم الكاتب، أو المعرف الفريد
      const uniqueMap = new Map();
      merged.forEach(r => {
        const key = r.discordMessageId || (r.content + r.authorName);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, r);
        }
      });
      
      setDisplayReviews(Array.from(uniqueMap.values()) as Review[]);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (partnerMessages) setPartners(partnerMessages);
  }, [partnerMessages]);

  useEffect(() => {
    if (featuredClientsData) setFeaturedClients(featuredClientsData as FeaturedClient[]);
  }, [featuredClientsData]);

  const isLoading = reviewsLoading && displayReviews.length === MANUAL_REVIEWS.length;

  const PlatformIcon = ({ platform, icon }: { platform: 'discord' | 'kick', icon?: string | null }) => {
    const [imgError, setImgError] = useState(false);
    if (icon && !imgError) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-black">
          <img src={icon} alt={platform} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        </div>
      );
    }
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-black ${platform === 'kick' ? 'bg-[#53fc18]' : 'bg-[#5865F2] p-1.5'}`}>
        {platform === 'kick' ? <span className="text-[10px] font-black text-black">K</span> : 
          <svg viewBox="0 0 127.14 96.36" fill="white" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.48,80.21a105.73,105.73,0,0,0,32.22,16.15,77.7,77.7,0,0,0,7.34-11.86,68.11,68.11,0,0,1-11.85-5.65c.99-.71,1.96-1.46,2.89-2.22a74.87,74.87,0,0,0,65.35,0c.93.76,1.9,1.51,2.89,2.22a68.4,68.4,0,0,1-11.85,5.65,77,77,0,0,0,7.34,11.86,105.55,105.55,0,0,0,32.25-16.15C129.58,52.13,125.4,28.38,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.12-12.67,11.45-12.67S54,46,54,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.12-12.67,11.44-12.67S96.2,46,96.2,53,91.05,65.69,84.69,65.69Z"/></svg>
        }
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex flex-col" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[url('/bg.webp')] bg-cover bg-center grayscale" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Navbar */}
        <nav className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black not-italic text-sm">P</div>
              Pixel Design
            </div>
            <div className="flex items-center gap-3">
              <a href="https://salla.sa/pixel.design" target="_blank" rel="noopener noreferrer" className="bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" /> Store
              </a>
              <a href="https://discord.gg/wBuqaM6tqm" target="_blank" className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Discord
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content Grid */}
        <main className="max-w-[1600px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 pb-24 flex-1">
          
          {/* Left Sidebar: Featured Clients */}
          <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md sticky top-24">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="bg-white/5 p-2 rounded-xl text-white/60"><Award className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight italic">عملاء مميزون</h2>
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Premium Clients</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
