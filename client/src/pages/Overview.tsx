import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function Overview() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="py-16 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black text-white mb-4">Pixel Design</h1>
          <p className="text-xl text-slate-300">
            اكتشف مجتمع Pixel Design الإبداعي
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">نبذة عن السيرفر</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Pixel Design هو مجتمع Discord متخصص في فن البكسل والتصميم الرقمي وتطوير الألعاب. نجمع بين الفنانين والمصممين والمطورين من جميع أنحاء العالم لتبادل الخبرات والتعاون على مشاريع إبداعية.
            </p>
          </div>

          {/* What We Do */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">ماذا نفعل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                <h3 className="text-xl font-bold text-blue-400 mb-3">🎨 فن البكسل</h3>
                <p className="text-slate-300">
                  نشارك أعمالنا الفنية ونتلقى تعليقات بناءة من مجتمع متخصص وداعم.
                </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                <h3 className="text-xl font-bold text-purple-400 mb-3">🎮 تطوير الألعاب</h3>
                <p className="text-slate-300">
                  نناقش تقنيات تطوير الألعاب والتصميم والفنون المرئية.
                </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-pink-500/50 transition-colors">
                <h3 className="text-xl font-bold text-pink-400 mb-3">📚 التعليم والموارد</h3>
                <p className="text-slate-300">
                  نوفر دروساً وموارد تعليمية لمساعدة الأعضاء على تطوير مهاراتهم.
                </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-green-500/50 transition-colors">
                <h3 className="text-xl font-bold text-green-400 mb-3">🤝 التعاون</h3>
                <p className="text-slate-300">
                  نعمل معاً على مشاريع جماعية ونبني علاقات احترافية طويلة الأمد.
                </p>
              </div>
            </div>
          </div>

          {/* Community Values */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">قيمنا المجتمعية</h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-bold text-white">الإبداع</h3>
                  <p className="text-slate-400">نحتفل بالأفكار الأصلية والابتكار</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors">
                <span className="text-2xl">🤲</span>
                <div>
                  <h3 className="font-bold text-white">الدعم المتبادل</h3>
                  <p className="text-slate-400">نساعد بعضنا البعض في النمو والتطور</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-bold text-white">الاحترافية</h3>
                  <p className="text-slate-400">نسعى للجودة والتميز في كل عمل</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-bold text-white">التنوع والشمول</h3>
                  <p className="text-slate-400">نرحب بالجميع بغض النظر عن الخلفية</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center py-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-slate-700/50 p-8">
            <h2 className="text-3xl font-bold text-white mb-6">انضم إلينا الآن</h2>
            <p className="text-lg text-slate-300 mb-8">
              كن جزءاً من مجتمع Pixel Design وابدأ رحلتك الإبداعية معنا.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
