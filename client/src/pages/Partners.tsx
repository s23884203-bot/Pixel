import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

interface Partner {
  id: string;
  name: string;
  description: string;
  image?: string;
  link?: string;
}

export default function Partners() {
  const [, setLocation] = useLocation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch partners from Discord channel 1400841587977621604
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        // This would be implemented with actual Discord API call
        // For now, showing placeholder structure
        setPartners([
          {
            id: "1",
            name: "Partner 1",
            description: "شريك مميز في مجتمع Pixel Design",
            image: "https://via.placeholder.com/300x200?text=Partner+1",
          },
          {
            id: "2",
            name: "Partner 2",
            description: "شريك متعاون في المشاريع الإبداعية",
            image: "https://via.placeholder.com/300x200?text=Partner+2",
          },
        ]);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="py-16 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black text-white mb-4">شركاؤنا</h1>
          <p className="text-xl text-slate-300">
            تعرف على الشركاء المميزين في مجتمع Pixel Design
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : partners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="group p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {partner.image && (
                    <img
                      src={partner.image}
                      alt={partner.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                  <p className="text-slate-300 mb-4">{partner.description}</p>
                  {partner.link && (
                    <a
                      href={partner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      زيارة الموقع
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-slate-400 mb-4">لا توجد شراكات حالياً</p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                العودة للرئيسية
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
