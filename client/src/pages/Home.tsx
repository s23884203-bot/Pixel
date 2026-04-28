import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Star, ExternalLink, MessageSquare, Award, LayoutGrid, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

interface Review {
  id: number | string;
  content: string;
  image?: string | null;
  rating: number | null;
  authorName: string;
  authorAvatar?: string | null;
  timestamp: string | Date;
  discordMessageId?: string;
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

// قائمة العملاء المضافين يدوياً مع إضافة SFF
const HARDCODED_CLIENTS: FeaturedClient[] = [
  {
    id: "sff-client",
    name: "SFF",
    username: "sff",
    avatar: "https://cdn.discordapp.com/icons/769222515082199050/a_6a8e8a6e8e8e8e8e8e8e8e8e8e8e8e8e.png", 
    serverIcon: null,
    inviteLink: "https://discord.gg/sff",
    platform: 'discord'
  }
];

const AnimatedTagline = () => (
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

const StarRating = ({ rating }: { rating: number | null }) => {
  const stars = rating || 5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-2.5 h-2.5 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
      ))}
    </div>
  );
};

export default function Home() {
  // تفعيل الكاش العنيف لضمان تحميل البيانات فورياً في الزيارات التالية
  const { data: reviewsData } = trpc.reviews.list.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnMount: false,
  });
  const { data: featuredClientsData } = trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [featuredClients, setFeaturedClients] = useState<FeaturedClient[]>(HARDCODED_CLIENTS);

  useEffect(() => {
    if (reviewsData) {
      const sorted = [...reviewsData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const uniqueMap = new Map();
      sorted.forEach(r => {
        const key = r.discordMessageId || (r.content + r.authorName);
        if (!uniqueMap.has(key)) uniqueMap.set(key, r);
      });
      setDisplayReviews(Array.from(uniqueMap.values()) as Review[]);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (featuredClientsData) {
      const merged = [...HARDCODED_CLIENTS, ...(featuredClientsData as FeaturedClient[])];
      const uniqueClients = Array.from(new Map(merged.map(item => [item.inviteLink, item])).values());
      setFeaturedClients(uniqueClients);
    }
  }, [featuredClientsData]);

  // مكون الشعار يعرض صورة السيرفر بدلاً من أيقونة المنصة
  const ClientAvatar = ({ client }: { client: FeaturedClient }) => {
    const [imgError, setImgError] = useState(false);
    const iconUrl = client.serverIcon || client.avatar;

    if (iconUrl && !imgError) {
      return (
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 p-0.5 group-hover:border-white/30 transition-all">
          <img 
            src={iconUrl} 
            alt={client.name} 
            className="w-full h-full object-cover rounded-lg" 
            onError={() => setImgError(true)} 
          />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-[10px] font-bold">
        {client.name.charAt(0)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex flex-col font-sans" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[url('/bg.webp')] bg-cover bg-center grayscale" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
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
              <a href="https://salla.sa/pixel.design" target="_blank" className="bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 hover:bg-white/10">
                <LayoutGrid className="w-3.5 h-3.5" /> Store
              </a>
              <a href="https://discord.gg/wBuqaM6tqm" target="_blank" className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Discord
              </a>
            </div>
          </div>
        </nav>

        {/* Main Grid */}
        <main className="max-w-[1600px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 pb-24 flex-1">
          
          {/* Featured Clients */}
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
                {featuredClients.map(client => (
                  <a key={client.id} href={client.inviteLink} target="_blank" className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                    <ClientAvatar client={client} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-xs truncate uppercase italic">{client.name}</h3>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">{client.platform}</span>
                    </div>
                    <div className="text-white/20 group-hover:text-white transition-colors"><ExternalLink className="w-3 h-3" /></div>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Hero Section */}
          <div className="lg:col-span-6 space-y-16 order-1 lg:order-2 flex flex-col items-center">
            <section className="text-center w-full pt-10">
              <div className="mb-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl mb-8 shadow-2xl backdrop-blur-md">
                  <img src="/snow_logo.webp" alt="SNOW" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-3xl font-black text-white uppercase tracking-widest italic leading-none">SNOW</span>
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-black mt-1">Store Owner</span>
                  </div>
                </div>
                <img src="/logo.webp" alt="Pixel Design" className="w-40 h-40 md:w-52 md:h-52 object-contain animate-float" />
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mt-6 mb-4 leading-none">
                  Pixel <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">Design</span>
                </h1>
                <AnimatedTagline />
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                  <span className="block text-2xl md:text-3xl font-black">{stats?.memberCount || "..."}+</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Reviews</span>
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                  <span className="block text-2xl md:text-3xl font-black">200+</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Members</span>
                </div>
              </div>
            </section>
          </div>

          {/* Reviews Sidebar */}
          <aside className="lg:col-span-3 order-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-xl sticky top-24 h-[80vh] flex flex-col">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="bg-white/10 p-2.5 rounded-2xl text-white"><MessageSquare className="w-5 h-5" /></div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black uppercase tracking-tighter italic leading-none">أحدث التقييمات</h2>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Customer Reviews</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-3 space-y-6 custom-scrollbar">
                {displayReviews.length > 0 ? (
                  displayReviews.map((r) => (
                    <div key={r.id} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 transition-all hover:border-white/20 hover:scale-[1.02]">
                      {r.image && <img src={r.image} className="w-full h-auto object-contain transition-all duration-1000 group-hover:scale-110" loading="lazy" />}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {r.authorAvatar ? <img src={r.authorAvatar} className="w-9 h-9 rounded-full border border-white/20" /> : <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[10px]">{r.authorName.charAt(0)}</div>}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-black text-white truncate leading-none mb-1">{r.authorName}</span>
                              <span className="text-[8px] text-white/30 uppercase font-black">Verified User</span>
                            </div>
                          </div>
                          <div className="bg-white/5 px-2 py-1 rounded-xl"><StarRating rating={r.rating} /></div>
                        </div>
                        {r.content && <p className="text-[11px] text-white/60 italic leading-relaxed border-t border-white/5 pt-3">"{r.content}"</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-white/10 uppercase tracking-widest font-black">
                    <MessageSquare className="w-12 h-12 mb-4 animate-pulse" />
                    <p className="text-[10px]">Loading Reviews...</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>
        <Footer />
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
