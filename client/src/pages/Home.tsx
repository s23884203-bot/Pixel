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
  discordMessageId?: string;
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
  platform: "discord" | "kick";
}

const AnimatedTagline = () => {
  return (
    <div className="text-center mt-6 mb-12">
      <h2 className="text-2xl md:text-4xl font-black italic tracking-tight">
        من خيالك <span className="text-white/30">—</span> للواقع
      </h2>
    </div>
  );
};

const StarRating = ({ rating }: { rating: number | null }) => {
  const stars = rating ?? 5;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= stars ? "text-yellow-400 fill-yellow-400" : "text-white/10"
          }`}
        />
      ))}
    </div>
  );
};

const PlatformIcon = ({
  platform,
  icon,
}: {
  platform: "discord" | "kick";
  icon?: string | null;
}) => {
  const [error, setError] = useState(false);

  if (icon && !error) {
    return (
      <img
        src={icon}
        onError={() => setError(true)}
        className="w-8 h-8 rounded-full object-cover border border-white/10"
      />
    );
  }

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        platform === "kick" ? "bg-green-400" : "bg-indigo-500"
      }`}
    >
      {platform === "kick" ? "K" : "D"}
    </div>
  );
};

export default function Home() {
  const { data: reviewsData = [], isLoading } =
    trpc.reviews.list.useQuery(undefined, {
      staleTime: 10000,
      refetchInterval: 300000,
    });

  const { data: partners = [] } = trpc.reviews.partners.useQuery();
  const { data: featuredClients = [] } =
    trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);

  /* ================= CLEAN REVIEWS (NO MANUAL REVIEWS) ================= */
  useEffect(() => {
    if (!reviewsData || reviewsData.length === 0) {
      setDisplayReviews([]);
      return;
    }

    const sorted = [...reviewsData].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );

    const uniqueMap = new Map<string, Review>();

    sorted.forEach((r: any) => {
      const key =
        r.discordMessageId || `${r.content}-${r.authorName}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, r);
      }
    });

    setDisplayReviews(Array.from(uniqueMap.values()));
  }, [reviewsData]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-black italic">Pixel Design</span>

          <div className="flex gap-3">
            <a
              href="https://salla.sa/pixel.design"
              target="_blank"
              className="px-4 py-2 bg-white/10 rounded-lg"
            >
              <LayoutGrid className="w-4 h-4 inline" /> Store
            </a>

            <a
              href="https://discord.gg/wBuqaM6tqm"
              target="_blank"
              className="px-4 py-2 bg-white text-black rounded-lg"
            >
              <ExternalLink className="w-4 h-4 inline" /> Discord
            </a>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12">
        <AnimatedTagline />

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="p-6 bg-white/5 rounded-xl">
            {stats?.memberCount ?? 2000}+ Members
          </div>
          <div className="p-6 bg-white/5 rounded-xl">
            200+ Reviews
          </div>
        </div>

        {/* REVIEWS */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare />
            <h2 className="font-black">أحدث التقييمات</h2>
          </div>

          {isLoading ? (
            <p className="text-white/40">Loading...</p>
          ) : displayReviews.length === 0 ? (
            <p className="text-white/30">لا يوجد تقييمات حالياً</p>
          ) : (
            <div className="grid gap-4">
              {displayReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">
                      {r.authorName}
                    </span>
                    <StarRating rating={r.rating} />
                  </div>

                  {r.content && (
                    <p className="text-white/70 text-sm">
                      {r.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
