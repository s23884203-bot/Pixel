import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { Star } from "lucide-react";

export default function Home() {
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="text-white text-center py-20">جاري تحميل التقييمات...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-white text-center mb-12">تقييمات العملاء</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* العميل المميز المثبت في البداية */}
        <a 
          href="https://discord.gg/sff" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-[#5865F2]/20 to-[#121212] p-6 rounded-2xl border border-[#5865F2]/30 hover:border-[#5865F2]/60 transition-all shadow-xl group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-[#5865F2] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
            العميل المميز
          </div>
          <div className="flex justify-between items-center mb-4 flex-row-reverse">
            <div className="text-right">
              <h3 className="text-white font-bold text-lg group-hover:text-[#5865F2] transition-colors">SFF Community</h3>
            </div>
            <div className="flex gap-0.5" style={{ direction: 'ltr' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#facc15" className="text-yellow-400" />
              ))}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-gray-300 text-right text-sm leading-relaxed" style={{ direction: 'rtl' }}>
              انضم إلى مجتمعنا المميز على ديسكورد للحصول على أفضل الخدمات والعروض الحصرية.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-[#5865F2] text-xs font-bold flex items-center gap-1">
              دخول السيرفر
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </span>
          </div>
        </a>

        {reviews?.map((review) => (
          <div 
            key={review.id} 
            className="bg-[#121212] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all shadow-xl"
          >
            {/* الهيدر: الاسم يمين والنجوم يسار */}
            <div className="flex justify-between items-center mb-4 flex-row-reverse">
              <div className="text-right">
                <h3 className="text-white font-bold text-lg">{review.authorName}</h3>
              </div>
              
              <div className="flex gap-0.5" style={{ direction: 'ltr' }}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < (review.rating || 5) ? "#facc15" : "none"} 
                    className={i < (review.rating || 5) ? "text-yellow-400" : "text-gray-700"}
                  />
                ))}
              </div>
            </div>
            
            {/* نص التقييم بالأسفل */}
            <div className="mt-2">
              <p className="text-gray-400 text-right text-sm leading-relaxed" style={{ direction: 'rtl' }}>
                {review.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {(!reviews || reviews.length === 0) && (
        <p className="text-gray-500 text-center">لا توجد تقييمات حالياً.</p>
      )}
    </div>
  );
}
