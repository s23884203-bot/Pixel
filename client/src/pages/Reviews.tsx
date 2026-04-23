import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, Star } from "lucide-react";

export default function Reviews() {
  const [, setLocation] = useLocation();
  const { data: reviews, isLoading, refetch } = trpc.reviews.list.useQuery();
  const syncMutation = trpc.reviews.sync.useMutation();

  // Auto-sync reviews on page load
  useEffect(() => {
    syncMutation.mutate();
  }, []);

  const handleSync = async () => {
    await syncMutation.mutateAsync();
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="py-16 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black text-white mb-4">Reviews & Store</h1>
          <p className="text-xl text-slate-300 mb-8">
            See what our community members think about Pixel Design
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800"
            >
              ← Back to Home
            </Button>
            <Button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Reviews"
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="group p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-4">
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
                      <p className="text-xs text-slate-400">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (review.rating || 5)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Content */}
                  <p className="text-slate-300 leading-relaxed mb-4 line-clamp-4">
                    {review.content}
                  </p>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">
                      Discord ID: {review.discordUserId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-slate-400 mb-4">No reviews yet</p>
              <Button
                onClick={handleSync}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sync Reviews from Discord
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
