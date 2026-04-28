export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-lg font-black tracking-tighter uppercase italic mb-1">Pixel Design</span>
          <p className="text-white text-[10px] uppercase tracking-[0.3em]">Premium Digital Art Community</p>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="text-white">Alpha dev</span>
          </p>
          <p className="text-white/20 text-[10px]">
            © 2026 Pixel Design. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
