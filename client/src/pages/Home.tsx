import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ChevronLeft, ChevronRight, Users, MessageSquare, Award } from "lucide-react";
import Footer from "@/components/Footer";

interface Review {
  id: number;
  content: string;
  rating: number | null;
  authorName: string;
  authorAvatar?: string | null;
  timestamp: Date;
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
}

export default function Home() {
  const { data: reviews } = trpc.reviews.list.useQuery();
  const syncMutation = trpc.reviews.sync.useMutation();
  const { data: partnerMessages } = trpc.reviews.partners.useQuery();
  const { data: featuredClientsData } = trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredClients, setFeaturedClients] = useState<FeaturedClient[]>([]);
  const [currentClientIndex, setCurrentClientIndex] = useState(0);

  useEffect(() => {
    syncMutation.mutate();
  }, []);

  useEffect(() => {
    if (reviews) setDisplayReviews(reviews.filter(r => r.content?.trim()));
  }, [reviews]);

  useEffect(() => {
    if (partnerMessages) setPartners(partnerMessages);
  }, [partnerMessages]);

  useEffect(() => {
    if (featuredClientsData) setFeaturedClients(featuredClientsData);
  }, [featuredClientsData]);

  // Auto-rotate carousels
  useEffect(() => {
    if (displayReviews.length > 0) {
      const interval = setInterval(() => setCurrentReviewIndex(p => (p + 1) % displayReviews.length), 5000);
      return () => clearInterval(interval);
    }
  }, [displayReviews]);

  useEffect(() => {
    if (featuredClients.length > 0) {
      const interval = setInterval(() => setCurrentClientIndex(p => (p + 1) % featuredClients.length), 6000);
      return () => clearInterval(interval);
    }
  }, [featuredClients]);

  const currentReview = displayReviews[currentReviewIndex];
  const currentClient = featuredClients[currentClientIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center grayscale"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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

        {/* Hero Section */}
        <header className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-8 relative group">
            <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img src="/logo.webp" alt="Logo" className="relative w-32 h-32 md:w-40 md:h-40 object-contain animate-float" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-8 leading-none">
            Pixel <span className="text-white/20">Design</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black">{stats?.memberCount || 2000}+</span>
              <span className="text-white/40 text-xs uppercase tracking-widest">Members</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black">{stats?.totalReviews || 200}+</span>
              <span className="text-white/40 text-xs uppercase tracking-widest">Reviews</span>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <main className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Partners & Stats */}
          <aside className="lg:col-span-3 space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-white/60" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Partners</h2>
              </div>
              <div className="grid gap-4">
                {partners.slice(0, 6).map(p => (
                  <div key={p.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
                    {p.image && <img src={p.image} className="w-full h-24 object-cover rounded-xl mb-3 grayscale group-hover:grayscale-0 transition-all" />}
                    <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                    <p className="text-xs text-white/40 line-clamp-2">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          {/* Center: Featured Client & Main Reviews */}
          <section className="lg:col-span-6 space-y-12">
            {/* Featured Client Card */}
            {currentClient && (
              <div className="bg-white text-black rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-8">
                    <Award className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Featured Client</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    {currentClient.avatar && (
                      <img src={currentClient.avatar} className="w-24 h-24 rounded-full border-4 border-black/10" />
                    )}
                    <div className="flex-1">
                      <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase italic">{currentClient.name}</h2>
                      <p className="text-black/60 font-medium mb-6">@{currentClient.username}</p>
                      
                      {currentClient.serverIcon && (
                        <div className="mb-8 rounded-2xl overflow-hidden border border-black/5 shadow-2xl">
                          <img src={currentClient.serverIcon} className="w-full h-48 object-cover" />
                        </div>
                      )}
                      
                      <a 
                        href={currentClient.inviteLink} 
                        target="_blank"
                        className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
                      >
                        Visit Server <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* Background Decor for Card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
              </div>
            )}

            {/* Main Review Spotlight */}
            {currentReview && (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
                <div className="flex items-center gap-2 mb-8">
                  <MessageSquare className="w-5 h-5 text-white/60" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Testimonial</span>
                </div>
                
                <div className="flex gap-6 mb-8">
                  {currentReview.authorAvatar ? (
                    <img src={currentReview.authorAvatar} className="w-16 h-16 rounded-full grayscale" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-2xl">
                      {currentReview.authorName[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold mb-1">{currentReview.authorName}</h3>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (currentReview.rating || 5) ? 'fill-white' : 'fill-white/10 text-transparent'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-2xl md:text-3xl font-medium leading-tight mb-8 text-white/90">
                  "{currentReview.content}"
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/20">
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
            )}
          </section>

          {/* Right: Recent Reviews List */}
          <aside className="lg:col-span-3 space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-white/60" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Latest Feedback</h2>
              </div>
              <div className="grid gap-4">
                {displayReviews.slice(0, 5).map(r => (
                  <div key={r.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      {r.authorAvatar && <img src={r.authorAvatar} className="w-8 h-8 rounded-full grayscale" />}
                      <span className="font-bold text-xs">{r.authorName}</span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-3 mb-3 leading-relaxed">"{r.content}"</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (r.rating || 5) ? 'fill-white' : 'fill-white/10 text-transparent'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

        </main>

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
      `}</style>
    </div>
  );
}
