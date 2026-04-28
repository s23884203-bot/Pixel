import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Star, ExternalLink, MessageSquare, Award, LayoutGrid, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

// --- الواجهات (Interfaces) ---
interface Review {
  id: number | string;
  content: string;
  image?: string | null;
  rating: number | null;
  authorName: string;
  authorAvatar?: string | null;
  timestamp: string | Date;
}

interface FeaturedClient {
  id: string;
  name: string;
  inviteLink: string;
  platform: 'discord' | 'kick';
}

// --- نظام ذكي لاستخراج الصور من الرابط مباشرة ---
const getSmartAvatar = (client: FeaturedClient) => {
  const code = client.inviteLink.split('/').pop();
  if (client.platform === 'discord') {
    // جلب أيقونة السيرفر الرسمية عبر ويدجت ديسكورد
    return `https://cdn.discordapp.com/widget/${code}/8.png`;
  } 
  if (client.platform === 'kick') {
    // محاولة جلب الصورة من API كيك العام (أو صورة افتراضية في حال الفشل)
    return `https://kick.com/api/v1/channels/${code}/image`;
  }
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
};

// قائمة العملاء المميزين (إضافة SFF وروابط الكيك هنا)
const CLIENTS_LIST: FeaturedClient[] = [
  { id: "sff", name: "SFF", inviteLink: "https://discord.gg/sff", platform: 'discord' },
  { id: "pixel-support", name: "Pixel Support", inviteLink: "https://discord.gg/wBuqaM6tqm", platform: 'discord' },
  { id: "kick-sample", name: "Kick Channel", inviteLink: "https://kick.com/username", platform: 'kick' }, // استبدل username باسم القناة
];

const StarRating = ({ rating }: { rating: number | null }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-2.5 h-2.5 ${i <= (rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
    ))}
  </div>
);

// مكون التاج لاين المتحرك
const AnimatedTagline = () => (
  <div className="text-center mt-6 mb-12">
    <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm">
      <span className="text-2xl md:text-3xl animate-bounce">📌</span>
      <h2 className="text-xl md:text-3xl font-black italic tracking-tighter" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <span className="text-white/90">من خيالك</span>
        <span className="mx-2 text-white/10 font-light">—</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">للواقع</span>
      </h2>
    </div>
  </div>
);

export default function Home() {
  // تفعيل الكاش العنيف لسرعة التحميل (0.1 ثانية)
  const { data: reviewsData } = trpc.reviews.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // ساعة كاملة كاش
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  
  const { data: stats } = trpc.reviews.getStats.useQuery(undefined, { 
    staleTime: Infinity 
  });

  // معالجة فورية للتقييمات
  const sortedReviews = useMemo(() => {
    if (!reviewsData) return [];
    return [...reviewsData].sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [reviewsData]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      
      {/* الخلفية */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[url('/bg.webp')] bg-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* الهيدر */}
        <nav className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-black italic flex items-center gap-2 uppercase">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black not-italic text-sm">P</div>
              Pixel Design
            </div>
            <div className="flex items-center gap-3">
              <a href="https://salla.sa/pixel.design" target="_blank" className="bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all">Store</a>
              <a href="https://discord.gg/wBuqaM6tqm" target="_blank" className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all">Discord</a>
            </div>
          </div>
        </nav>

        {/* المحتوى الرئيسي */}
        <main className="max-w-[1600px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 pb-24 flex-1">
          
          {/* اليمين: العملاء (نظام ذكي) */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md sticky top-24">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Award className="w-5 h-5 text-white/60" />
                <h2 className="text-sm font-black uppercase italic">عملاء مميزون</h2>
              </div>
              <div className="space-y-3">
                {CLIENTS_LIST.map(client => (
                  <a key={client.id} href={client.inviteLink} target="_blank" className="flex items-center gap-4 p-3 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      <img 
                        src={getSmartAvatar(client)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-black uppercase italic truncate">{client.name}</p>
                      <span className={`text-[8px] font-bold uppercase ${client.platform === 'kick' ? 'text-[#53fc18]' : 'text-[#5865F2]'}`}>
                        {client.platform}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* المنتصف: الهيرو */}
          <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2 space-y-12">
            <section className="text-center w-full">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl mb-12 backdrop-blur-md">
                <img src="/snow_logo.webp" className="w-14 h-14" alt="Owner" />
                <div className="text-left">
                  <div className="flex items-center gap-1 font-black italic">
                    <span className="text-2xl">SNOW</span>
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Owner</span>
                </div>
              </div>
              <img src="/logo.webp" className="w-52 h-52 md:w-64 md:h-64 object-contain animate-float mx-auto" />
              <h1 className="text-6xl md:text-8xl font-black italic mt-10 uppercase leading-none">
                Pixel <span className="text-white/20">Design</span>
              </h1>
              <AnimatedTagline />
            </section>

            <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
              <div className="p-7 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center backdrop-blur-sm">
                <p className="text-4xl font-black italic mb-1">{stats?.memberCount || "2000"}+</p>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Members</p>
              </div>
              <div className="p-7 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center backdrop-blur-sm">
                <p className="text-4xl font-black italic mb-1">200+</p>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Reviews</p>
              </div>
            </div>
          </div>

          {/* اليسار: التقييمات (مطولة وسريعة) */}
          <aside className="lg:col-span-3 order-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-2xl sticky top-24 h-[85vh] flex flex-col shadow-2xl ring-1 ring-white/5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <MessageSquare className="w-5 h-5 text-white" />
                <h2 className="text-sm font-black italic uppercase">آخر الآراء</h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
                {sortedReviews.length > 0 ? (
                  sortedReviews.map((r: any) => (
                    <div key={r.id} className="group bg-black/40 border border-white/5 rounded-3xl p-5 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={r.authorAvatar || 'https://cdn.discordapp.com/embed/avatars/1.png'} 
                          className="w-8 h-8 rounded-full border border-white/10" 
                          alt=""
                        />
                        <div className="leading-none text-left">
                          <p className="text-xs font-black truncate max-w-[90px] mb-1">{r.authorName}</p>
                          <StarRating rating={r.rating} />
                        </div>
                      </div>
                      {r.image && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                          <img src={r.image} className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" loading="lazy" />
                        </div>
                      )}
                      <p className="text-[11px] text-white/60 leading-relaxed italic text-left">
                        "{r.content || "Experience speaks for itself."}"
                      </p>
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
                  ))
                )}
              </div>
            </div>
          </aside>

        </main>
        <Footer />
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
