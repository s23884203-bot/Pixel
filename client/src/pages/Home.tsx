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

export default function Home() {
  // Queries with higher staleTime to prevent unnecessary re-fetches
  const { data: reviewsData, isLoading: reviewsLoading } = trpc.reviews.list.useQuery(undefined, {
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
  const { data: partnerMessages } = trpc.reviews.partners.useQuery();
  const { data: featuredClientsData } = trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredClients, setFeaturedClients] = useState<FeaturedClient[]>([]);

  useEffect(() => {
    if (reviewsData) {
      console.log("Raw reviews data received:", reviewsData.length);
      // Accept any review that has either content OR an image
      const filtered = reviewsData.filter(r => (r.content && r.content.trim().length > 0) || r.image);
      console.log("Filtered reviews to display:", filtered.length);
      setDisplayReviews(filtered);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (partnerMessages) setPartners(partnerMessages);
  }, [partnerMessages]);

  useEffect(() => {
    if (featuredClientsData) setFeaturedClients(featuredClientsData);
  }, [featuredClientsData]);

  // Auto-rotate main review
  useEffect(() => {
    if (displayReviews.length > 0) {
      const interval = setInterval(() => setCurrentReviewIndex(p => (p + 1) % displayReviews.length), 6000);
      return () => clearInterval(interval);
    }
  }, [displayReviews]);

  const currentReview = displayReviews[currentReviewIndex];
  const isLoading = reviewsLoading && displayReviews.length === 0;

  const PlatformIcon = ({ platform }: { platform: 'discord' | 'kick' }) => {
    if (platform === 'kick') {
      return (
        <div className="w-8 h-8 bg-[#53fc18] rounded-full flex items-center justify-center shadow-lg shadow-[#53fc18]/20 border-2 border-black">
          <span className="text-xs font-black text-black">K</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center shadow-lg shadow-[#5865F2]/20 border-2 border-black p-1.5">
        <svg viewBox="0 0 127.14 96.36" fill="white" className="w-full h-full">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.48,80.21a105.73,105.73,0,0,0,32.22,16.15,77.7,77.7,0,0,0,7.34-11.86,68.11,68.11,0,0,1-11.85-5.65c.99-.71,1.96-1.46,2.89-2.22a74.87,74.87,0,0,0,65.35,0c.93.76,1.9,1.51,2.89,2.22a68.4,68.4,0,0,1-11.85,5.65,77,77,0,0,0,7.34,11.86,105.55,105.55,0,0,0,32.25-16.15C129.58,52.13,125.4,28.38,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.12-12.67,11.45-12.67S54,46,54,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.12-12.67,11.44-12.67S96.2,46,96.2,53,91.05,65.69,84.69,65.69Z"/>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center grayscale"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Nav */}
        <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1800px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-black tracking-tighter uppercase italic">Pixel Design</div>
            <a 
              href="https://discord.gg/wBuqaM6tqm" 
              target="_blank" 
              className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Discord
            </a>
          </div>
        </nav>

        {isLoading && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Loading Pixel Experience</span>
            </div>
          </div>
        )}

        {/* Main Layout Container */}
        <div className="max-w-[1800px] mx-auto px-6 w-full flex flex-col lg:flex-row gap-12 pt-12 flex-1">
          
          {/* Left Sidebar: Featured Clients (FLUSH LEFT) */}
          <aside className="lg:w-[400px] lg:sticky lg:top-24 self-start order-2 lg:order-1">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter italic text-white">عملاء مميزون</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Premium Clients</p>
                </div>
              </div>
              <div className="max-h-[700px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                {featuredClients.map(client => (
                  <a 
                    key={client.id}
                    href={client.inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all group shadow-lg"
                  >
                    <div className="flex-shrink-0 transform group-hover:rotate-12 transition-transform">
                      <PlatformIcon platform={client.platform} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base truncate group-hover:text-white transition-colors uppercase tracking-tighter italic">{client.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">View Project</span>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">{client.platform}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="flex-1 space-y-12 order-1 lg:order-2">
            {/* Hero Section */}
            <header className="text-center max-w-4xl mx-auto pb-8">
              <div className="inline-block mb-6 relative group">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img src="/logo.webp" alt="Logo" className="relative w-28 h-28 md:w-32 md:h-32 object-contain animate-float" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-none">
                Pixel <span className="text-white/20">Design</span>
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-black">{stats?.memberCount || 2000}+</span>
                  <span className="text-white/40 text-[10px] uppercase tracking-widest">Members</span>
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-black">{stats?.totalReviews || 200}+</span>
                  <span className="text-white/40 text-[10px] uppercase tracking-widest">Reviews</span>
                </div>
              </div>
            </header>

            {/* Content Grid for Reviews & Partners */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
              <div className="xl:col-span-7 space-y-12">
                {/* Main Review Spotlight */}
                {currentReview ? (
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <MessageSquare className="w-32 h-32 rotate-12" />
                    </div>

                    <div className="flex items-center gap-2 mb-8 relative z-10">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Live Feedback</span>
                    </div>
                    
                    <div className="flex gap-6 mb-8 relative z-10">
                      {currentReview.authorAvatar ? (
                        <img src={currentReview.authorAvatar} className="w-16 h-16 rounded-full grayscale border border-white/10" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-2xl">
                          {currentReview.authorName[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold mb-1 tracking-tight">{currentReview.authorName}</h3>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < (currentReview.rating || 5) ? 'fill-white' : 'fill-white/10 text-transparent'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-2xl md:text-3xl font-medium leading-tight mb-8 text-white/90 relative z-10">
                      "{currentReview.content}"
                    </p>

                    {currentReview.image && (
                      <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[450px] relative z-10">
                        <img src={currentReview.image} className="w-full h-full object-contain bg-black/40" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                        {new Date(currentReview.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrentReviewIndex(p => (p - 1 + displayReviews.length) % displayReviews.length)} className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCurrentReviewIndex(p => (p + 1) % displayReviews.length)} className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 border-dashed rounded-[2.5rem] p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Waiting for Discord Reviews...</p>
                  </div>
                )}

                {/* Partners Section (Title Removed as requested) */}
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partners.map(p => (
                      <div key={p.id} className="group p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/20 transition-all">
                        {p.image && <img src={p.image} className="w-full h-32 object-cover rounded-xl mb-4 grayscale group-hover:grayscale-0 transition-all border border-white/5" />}
                        <h3 className="font-bold text-sm mb-1 uppercase tracking-tight">{p.name}</h3>
                        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Recent Reviews Sidebar */}
              <aside className="xl:col-span-5 space-y-12">
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-white/60" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Feedback Feed</h2>
                  </div>
                  <div className="grid gap-4">
                    {displayReviews.length > 0 ? (
                      displayReviews.slice(0, 6).map(r => (
                        <div key={r.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            {r.authorAvatar && <img src={r.authorAvatar} className="w-8 h-8 rounded-full grayscale border border-white/10" />}
                            <span className="font-bold text-[10px] uppercase tracking-tight">{r.authorName}</span>
                          </div>
                          <p className="text-[11px] text-white/50 line-clamp-3 mb-3 leading-relaxed">"{r.content}"</p>
                          {r.image && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-white/5">
                              <img src={r.image} className="w-full h-24 object-cover grayscale hover:grayscale-0 transition-all" />
                            </div>
                          )}
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < (r.rating || 5) ? 'fill-white' : 'fill-white/10 text-transparent'}`} />
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 border border-white/5 border-dashed rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">No Recent Feed</p>
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
