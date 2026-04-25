import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ChevronLeft, ChevronRight, Users, MessageSquare, Award } from "lucide-react";
import Footer from "@/components/Footer";

interface Review {
  id: number;
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

const AnimatedTagline = () => {
  return (
    <div className="text-center mt-12 mb-20">
      <div className="relative inline-block group">
        {/* Multi-layered glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-white/20 via-white/5 to-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 px-10 py-6 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            <span className="text-5xl md:text-7xl animate-bounce filter drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">📌</span>
            
            <div className="flex flex-col">
              <h2 className="flex flex-wrap justify-center items-center gap-x-6 text-4xl md:text-7xl font-black italic tracking-tighter" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <span className="text-white animate-pulse transition-all duration-500 hover:scale-110 cursor-default">
                  من خيالك
                </span>
                <span className="text-white/30 text-2xl md:text-4xl font-light not-italic">——</span>
                <span className="relative">
                  <span className="absolute -inset-2 bg-white/10 blur-xl rounded-full animate-pulse"></span>
                  <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">
                    للواقع
                  </span>
                </span>
              </h2>
              
              {/* Modern animated underline */}
              <div className="relative w-full h-[3px] mt-4 bg-white/10 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_2.5s_infinite_ease-in-out]"></div>
              </div>
            </div>
          </div>
          
          {/* Bottom decorative element */}
          <div className="flex gap-2 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
            <div className="w-12 h-1 bg-white rounded-full"></div>
            <div className="w-4 h-1 bg-white rounded-full"></div>
            <div className="w-2 h-1 bg-white rounded-full"></div>
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
          className={`w-3 h-3 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = trpc.reviews.list.useQuery(undefined, {
    staleTime: 10000,
    refetchOnWindowFocus: true,
    retry: 1,
    refetchInterval: 300000 // Refetch every 5 minutes
  });
  const { data: partnerMessages } = trpc.reviews.partners.useQuery();
  const { data: featuredClientsData } = trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredClients, setFeaturedClients] = useState<FeaturedClient[]>([]);

  useEffect(() => {
    if (reviewsData) {
      const sorted = [...reviewsData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setDisplayReviews(sorted);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (partnerMessages) setPartners(partnerMessages);
  }, [partnerMessages]);

  useEffect(() => {
    if (featuredClientsData) setFeaturedClients(featuredClientsData as FeaturedClient[]);
  }, [featuredClientsData]);

  const isLoading = reviewsLoading && displayReviews.length === 0;

  const PlatformIcon = ({ platform, icon }: { platform: 'discord' | 'kick', icon?: string | null }) => {
    const [imgError, setImgError] = useState(false);
    if (icon && !imgError) {
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shadow-lg bg-black">
          <img src={icon} alt={platform} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        </div>
      );
    }
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-black ${platform === 'kick' ? 'bg-[#53fc18] shadow-[#53fc18]/20' : 'bg-[#5865F2] shadow-[#5865F2]/20 p-2'}`}>
        {platform === 'kick' ? <span className="text-sm font-black text-black">K</span> : 
          <svg viewBox="0 0 127.14 96.36" fill="white" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.48,80.21a105.73,105.73,0,0,0,32.22,16.15,77.7,77.7,0,0,0,7.34-11.86,68.11,68.11,0,0,1-11.85-5.65c.99-.71,1.96-1.46,2.89-2.22a74.87,74.87,0,0,0,65.35,0c.93.76,1.9,1.51,2.89,2.22a68.4,68.4,0,0,1-11.85,5.65,77,77,0,0,0,7.34,11.86,105.55,105.55,0,0,0,32.25-16.15C129.58,52.13,125.4,28.38,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.12-12.67,11.45-12.67S54,46,54,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.12-12.67,11.44-12.67S96.2,46,96.2,53,91.05,65.69,84.69,65.69Z"/></svg>
        }
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex flex-col" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center grayscale" style={{ backgroundImage: 'url("/bg.webp")' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1800px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-black tracking-tighter uppercase italic" style={{ fontFamily: "'Tajawal', sans-serif" }}>Pixel Design</div>
            <div className="flex items-center gap-3">
              <a href="https://salla.sa/pixel.design" target="_blank" rel="noopener noreferrer" className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 border border-white/20">
                <ExternalLink className="w-4 h-4" /> Store
              </a>
              <a href="https://discord.gg/wBuqaM6tqm" target="_blank" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Discord
              </a>
            </div>
          </div>
        </nav>

        {isLoading && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40" style={{ fontFamily: "'Tajawal', sans-serif" }}>Loading Pixel Experience</span>
            </div>
          </div>
        )}

        <div className="max-w-[1800px] mx-auto px-6 w-full flex flex-col lg:flex-row gap-8 pt-12 flex-1">
          <aside className="lg:w-[400px] lg:sticky lg:top-24 self-start order-2 lg:order-1">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="bg-white/10 p-2 rounded-xl"><Award className="w-6 h-6 text-white" /></div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter italic text-white" style={{ fontFamily: "'Tajawal', sans-serif" }}>عملاء مميزون</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Premium Clients</p>
                </div>
              </div>
              <div className="max-h-[700px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                {featuredClients.map(client => (
                  <a key={client.id} href={client.inviteLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all group shadow-lg">
                    <div className="flex-shrink-0 transform group-hover:rotate-12 transition-transform"><PlatformIcon platform={client.platform} icon={client.serverIcon} /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base truncate group-hover:text-white transition-colors uppercase tracking-tighter italic" style={{ fontFamily: "'Tajawal', sans-serif" }}>{client.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">View Project</span>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">{client.platform}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white group-hover:text-black transition-all"><ExternalLink className="w-4 h-4" /></div>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-12 order-1 lg:order-2 flex flex-col items-center justify-start pt-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8 flex flex-col items-center">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4 hover:bg-white/10 transition-all">
                  <img src="/snow_logo.webp" alt="SNOW" className="w-6 h-6 object-contain" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Tajawal', sans-serif" }}>SNOW</span>
                </div>
              </div>
              <div className="inline-block mb-8 relative group">
                <div className="absolute -inset-8 bg-white/10 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full blur-2xl opacity-30"></div>
                <img src="/logo.webp" alt="Logo" className="relative w-40 h-40 md:w-56 md:h-56 object-contain animate-float drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-8 leading-none" style={{ fontFamily: "'Tajawal', sans-serif" }}>Pixel <span className="text-white/20">Design</span></h1>
              <AnimatedTagline />
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-8">
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Tajawal', sans-serif" }}>{stats?.memberCount || 2000}+</span>
                  <span className="text-white/40 text-[12px] uppercase tracking-[0.3em] font-bold">Members</span>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Tajawal', sans-serif" }}>{displayReviews.length || stats?.totalReviews || 200}+</span>
                  <span className="text-white/40 text-[12px] uppercase tracking-[0.3em] font-bold">Reviews</span>
                </div>
              </div>
              <div className="mt-24 w-full max-w-2xl">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-50 hover:opacity-100 transition-opacity">
                  {partners.slice(0, 6).map(p => (
                    <div key={p.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                      {p.image && <img src={p.image} className="w-10 h-10 rounded-full grayscale mb-2" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest truncate w-full" style={{ fontFamily: "'Tajawal', sans-serif" }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:w-[400px] lg:sticky lg:top-24 self-start order-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="bg-white/10 p-2 rounded-xl"><MessageSquare className="w-6 h-6 text-white" /></div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter italic text-white" style={{ fontFamily: "'Tajawal', sans-serif" }}>أحدث التقييمات</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Customer Reviews</p>
                </div>
              </div>
              <div className="max-h-[800px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {displayReviews.length > 0 ? (
                  displayReviews.map(r => (
                    <div key={r.id} className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/40 transition-all duration-500 hover:border-white/20 hover:scale-[1.02]">
                      {r.image && (
                        <div className="aspect-auto w-full">
                          <img src={r.image} className="w-full h-auto object-contain grayscale-[0.5] transition-all duration-700 group-hover:grayscale-0" loading="lazy" />
                        </div>
                      )}
                      {/* Review info: author name, stars, and content */}
                      <div className="p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            {r.authorAvatar && (
                              <img src={r.authorAvatar} alt={r.authorName} className="w-5 h-5 rounded-full border border-white/10" />
                            )}
                            <span className="text-[11px] font-bold text-white/80 truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{r.authorName}</span>
                          </div>
                          <StarRating rating={r.rating} />
                        </div>
                        {r.content && r.content !== "تقييم Pixel Design" && (
                          <p className="text-[11px] text-white/60 italic leading-relaxed mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>"{r.content}"</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 border border-white/5 border-dashed rounded-[1.5rem] text-center">
                    <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]" style={{ fontFamily: "'Tajawal', sans-serif" }}>No Reviews Yet</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
        <Footer />
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.01); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}
