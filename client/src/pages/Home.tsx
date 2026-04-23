import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.reviews.getStats.useQuery();
  const [memberCount, setMemberCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Animate counters
  useEffect(() => {
    let memberInterval: NodeJS.Timeout;
    let reviewInterval: NodeJS.Timeout;

    if (memberCount < 2000) {
      memberInterval = setInterval(() => {
        setMemberCount((prev) => Math.min(prev + 50, 2000));
      }, 30);
    }

    if (reviewCount < 200) {
      reviewInterval = setInterval(() => {
        setReviewCount((prev) => Math.min(prev + 5, 200));
      }, 30);
    }

    return () => {
      clearInterval(memberInterval);
      clearInterval(reviewInterval);
    };
  }, [memberCount, reviewCount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Logo and Text */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                PIXEL
                <br />
                DESIGN
              </h1>
              <p className="text-xl text-slate-300 max-w-md">
                Join our thriving Discord community dedicated to pixel art, game design, and creative excellence.
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={() => setLocation("/overview")}
                className="px-8 py-6 bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-colors"
              >
                اكتشف المزيد
              </Button>
              <Button
                onClick={() => setLocation("/reviews")}
                variant="outline"
                className="px-8 py-6 border-white text-white hover:bg-white/10 font-bold text-lg"
              >
                التقييمات
              </Button>
            </div>
          </div>

          {/* Logo Image */}
          <div className="flex justify-center">
            <img
              src="/manus-storage/a_59b6606ae6c2e0f0be6a6a02c12c40d1_18fea0bb.webp"
              alt="Pixel Design Logo"
              className="w-full max-w-md drop-shadow-2xl animate-float"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Community Stats
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Members Counter */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-colors">
              <p className="text-4xl md:text-5xl text-blue-400 font-black mb-4">
                {memberCount}+ members
              </p>
              <p className="text-sm text-slate-400 mt-2">Active community members</p>
            </div>

            {/* Reviews Counter */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-colors">
              <p className="text-4xl md:text-5xl text-purple-400 font-black mb-4">
                {reviewCount}+ reviews
              </p>
              <p className="text-sm text-slate-400 mt-2">Community feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            استكشف المزيد
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              onClick={() => setLocation("/partners")}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-white mb-3">الشركاء</h3>
              <p className="text-slate-300">
                اكتشف شركاءنا المميزين والمتعاونين معنا.
              </p>
            </div>

            <div
              onClick={() => setLocation("/reviews")}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-pink-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-white mb-3">التقييمات</h3>
              <p className="text-slate-300">
                اقرأ تقييمات أعضاء المجتمع عن تجربتهم معنا.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
