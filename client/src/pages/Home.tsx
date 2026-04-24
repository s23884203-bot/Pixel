import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";
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
  image?: string;
  link?: string;
}

export default function Home() {
  const { data: reviews } = trpc.reviews.list.useQuery();
  const syncMutation = trpc.reviews.sync.useMutation();
  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([]);

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

  // Mock partners data (replace with actual Discord fetch)
  useEffect(() => {
    setPartners([
      {
        id: "1",
        name: "Partner 1",
        description: "شريك مميز",
        image: "https://via.placeholder.com/150x150?text=Partner+1",
      },
      {
        id: "2",
        name: "Partner 2",
        description: "شريك متعاون",
        image: "https://via.placeholder.com/150x150?text=Partner+2",
      },
      {
        id: "3",
        name: "Partner 3",
        description: "شريك إبداعي",
        image: "https://via.placeholder.com/150x150?text=Partner+3",
      },
    ]);
  }, []);

  const currentReview = displayReviews[currentReviewIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-white">PIXEL DESIGN</div>
          <a
            href="https://discord.gg/pixeldesign"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Discord
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 p-8 max-w-7xl mx-auto w-full">
          {/* Left Sidebar - Partners */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">الشركاء</h2>
              <div className="space-y-4">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-colors"
                  >
                    {partner.image && (
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-24 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-bold text-white text-sm">{partner.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{partner.description}</p>
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
                src="/manus-storage/a_59b6606ae6c2e0f0be6a6a02c12c40d1_18fea0bb.webp"
                alt="Pixel Design Logo"
                className="w-48 h-auto drop-shadow-2xl animate-float"
                onError={(e) => {
                  console.error("Logo failed to load");
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-black text-white text-center mb-4">
              Pixel Design
            </h1>
            <p className="text-xl text-slate-300 text-center mb-8 max-w-lg">
              مجتمع متخصص في فن البكسل والتصميم الرقمي
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-12 w-full">
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                <p className="text-4xl font-black text-blue-400 mb-2">2000+</p>
                <p className="text-slate-300">members</p>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                <p className="text-4xl font-black text-purple-400 mb-2">200+</p>
                <p className="text-slate-300">reviews</p>
              </div>
            </div>

            {/* Discord Button */}
            <a
              href="https://discord.gg/pixeldesign"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-lg transition-colors flex items-center gap-2 mb-8"
            >
              <ExternalLink className="w-5 h-5" />
              انضم إلى الديسكورد
            </a>
          </div>

          {/* Right Sidebar - Reviews Carousel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">التقييمات</h2>
              {currentReview ? (
                <div className="space-y-4">
                  {/* Current Review */}
                  <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 min-h-64 flex flex-col justify-between animate-fade-in">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4">
                      {currentReview.authorAvatar ? (
                        <img
                          src={currentReview.authorAvatar}
                          alt={currentReview.authorName}
                          className="w-10 h-10 rounded-full border border-slate-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {currentReview.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{currentReview.authorName}</h3>
                        <div className="flex gap-1">
                          {Array.from({ length: currentReview.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-slate-300 text-sm flex-1 line-clamp-5">
                      {currentReview.content}
                    </p>

                    {/* Timestamp */}
                    <p className="text-xs text-slate-500 mt-4">
                      {typeof currentReview.timestamp === 'string' 
                        ? new Date(currentReview.timestamp).toLocaleDateString("ar-SA")
                        : currentReview.timestamp instanceof Date
                        ? currentReview.timestamp.toLocaleDateString("ar-SA")
                        : new Date(currentReview.timestamp).toLocaleDateString("ar-SA")}
                    </p>
                  </div>

                  {/* Review Indicators */}
                  <div className="flex gap-2 justify-center">
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
                <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center text-slate-400">
                  جاري تحميل التقييمات...
                </div>
              )}
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
                      className="flex-shrink-0 w-80 p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all"
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
                      <p className="text-slate-300 text-sm line-clamp-4 mb-4">
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
              <div className="text-center text-slate-400">
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
      `}</style>
    </div>
  );
}
