import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Auto-sync reviews on page load
  useEffect(() => {
    const syncReviews = async () => {
      await syncMutation.mutateAsync();
    };
    syncReviews();
  }, []);

  // Filter and display reviews
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const filtered = reviews.filter(r => r.content && r.content.trim().length > 0);
      setDisplayReviews(filtered);
    }
  }, [reviews]);

  // Auto-rotate reviews
  useEffect(() => {
    if (displayReviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % displayReviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [displayReviews]);

  // Fetch partners from Discord
  useEffect(() => {
    if (partnerMessages && partnerMessages.length > 0) {
      setPartners(partnerMessages);
    }
  }, [partnerMessages]);

  // Fetch featured clients
  useEffect(() => {
    if (featuredClientsData && featuredClientsData.length > 0) {
      setFeaturedClients(featuredClientsData);
    }
  }, [featuredClientsData]);

  // Auto-rotate featured clients
  useEffect(() => {
    if (featuredClients.length > 0) {
      const interval = setInterval(() => {
        setCurrentClientIndex((prev) => (prev + 1) % featuredClients.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [featuredClients]);

  const currentReview = displayReviews[currentReviewIndex];
  const currentClient = featuredClients[currentClientIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg.webp")' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-white cursor-pointer" onClick={() => window.location.href='/'}>PIXEL DESIGN</div>
          <a
            href="https://discord.gg/wBuqaM6tqm"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-md transition-colors font-medium flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Discord
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 p-8 max-w-7xl mx-auto w-full">
          {/* Left Sidebar - Partners */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">الشركاء</h2>
              <div className="space-y-4">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 transition-colors"
                  >
                    {partner.image && (
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-24 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-bold text-white text-sm">{partner.name}</h3>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">
                      {partner.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Hero & Discord */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/logo.webp"
                alt="Pixel Design Logo"
                className="w-48 h-auto drop-shadow-2xl animate-float"
                onError={(e) => {
                  console.error("Logo failed to load from:", e.currentTarget.src);
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-black text-white text-center mb-4">
              Pixel Design
            </h1>


            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-12 w-full">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
                <p className="text-4xl font-black text-white mb-2">{stats?.memberCount || 2000}+</p>
                <p className="text-white/60">members</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
                <p className="text-4xl font-black text-white mb-2">{stats?.totalReviews || 200}+</p>
                <p className="text-white/60">reviews</p>
              </div>
            </div>

            {/* Discord Button */}
            <a
              href="https://discord.gg/wBuqaM6tqm"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              انضم إلى الديسكورد
            </a>

            {/* Featured Client Carousel */}
            {currentClient && (
              <div className="mt-12 w-full max-w-md">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">عميلنا المميز</h3>
                <div className="relative p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/20">
                  {/* Client Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {currentClient.avatar && (
                      <img
                        src={currentClient.avatar}
                        alt={currentClient.name}
                        className="w-16 h-16 rounded-full border-2 border-purple-500"
                      />
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-white">{currentClient.name}</h4>
                      <p className="text-sm text-white/40">@{currentClient.username}</p>
                    </div>
                  </div>

                  {/* Server Icon */}
                  {currentClient.serverIcon && (
                    <img
                      src={currentClient.serverIcon}
                      alt="Server Icon"
                      className="w-full h-40 object-cover rounded-lg mb-4 border border-slate-700"
                    />
                  )}

                  {/* Invite Link */}
                  <a
                    href={currentClient.inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg transition-colors text-sm font-medium text-center mb-4"
                  >
                    زيارة السيرفر
                  </a>

                  {/* Carousel Controls */}
                  {featuredClients.length > 1 && (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setCurrentClientIndex((prev) => (prev - 1 + featuredClients.length) % featuredClients.length)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex gap-2">
                        {featuredClients.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentClientIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentClientIndex
                                ? "bg-purple-400 w-6"
                                : "bg-slate-600 hover:bg-slate-500"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentClientIndex((prev) => (prev + 1) % featuredClients.length)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Carousel */}
            <div className="mt-12 w-full">
              {currentReview ? (
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    {currentReview.authorAvatar ? (
                      <img
                        src={currentReview.authorAvatar}
                        alt={currentReview.authorName}
                        className="w-14 h-14 rounded-full border border-slate-600"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {currentReview.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{currentReview.authorName}</h3>
                      <div className="flex gap-1">
                        {Array.from({ length: currentReview.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 mb-4 line-clamp-4">
                    {currentReview.content}
                  </p>
                  <p className="text-sm text-slate-500">
                    {typeof currentReview.timestamp === 'string' 
                      ? new Date(currentReview.timestamp).toLocaleDateString("ar-SA")
                      : currentReview.timestamp instanceof Date
                      ? currentReview.timestamp.toLocaleDateString("ar-SA")
                      : new Date(currentReview.timestamp).toLocaleDateString("ar-SA")}
                  </p>

                  {/* Review Indicators */}
                  <div className="flex gap-2 justify-center mt-4">
                    {displayReviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReviewIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentReviewIndex
                            ? "bg-blue-400 w-6"
                            : "bg-slate-600 hover:bg-slate-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center text-white/40">
                  جاري تحميل التقييمات...
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Reviews */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">التقييمات</h2>
              <div className="space-y-4">
                {displayReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {review.authorAvatar ? (
                        <img
                          src={review.authorAvatar}
                          alt={review.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {review.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h3 className="font-bold text-white text-sm">{review.authorName}</h3>
                    </div>
                    <p className="text-xs text-white/40 line-clamp-2 mb-2">
                      {review.content}
                    </p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Stream - Below */}
        <div className="w-full bg-slate-900/50 border-t border-slate-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              آخر التقييمات
            </h2>

            {displayReviews.length > 0 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max px-4">
                  {displayReviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="flex-shrink-0 w-80 p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all"
                      style={{
                        animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {review.authorAvatar ? (
                          <img
                            src={review.authorAvatar}
                            alt={review.authorName}
                            className="w-12 h-12 rounded-full border border-slate-600"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {review.authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{review.authorName}</h3>
                          <div className="flex gap-1">
                            {Array.from({ length: review.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm line-clamp-4 mb-4">
                        {review.content}
                      </p>
                      <p className="text-xs text-slate-500">
                        {typeof review.timestamp === 'string' 
                          ? new Date(review.timestamp).toLocaleDateString("ar-SA")
                          : review.timestamp instanceof Date
                          ? review.timestamp.toLocaleDateString("ar-SA")
                          : new Date(review.timestamp).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/40">
                لا توجد تقييمات حالياً
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
