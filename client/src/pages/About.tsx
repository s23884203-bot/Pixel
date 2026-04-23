import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="py-16 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black text-white mb-4">About Pixel Design</h1>
          <p className="text-xl text-slate-300">
            Learn more about our creative community
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mission */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Pixel Design is a vibrant Discord community dedicated to celebrating and advancing the art of pixel art, game design, and digital creativity. We bring together artists, designers, and enthusiasts from around the world to collaborate, learn, and inspire one another.
            </p>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-blue-400 mb-3">Creativity</h3>
                <p className="text-slate-300">
                  We celebrate original ideas and encourage members to push the boundaries of pixel art and game design.
                </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-purple-400 mb-3">Community</h3>
                <p className="text-slate-300">
                  We believe in the power of collaboration and mutual support among artists and designers.
                </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-pink-400 mb-3">Learning</h3>
                <p className="text-slate-300">
                  We provide resources, tutorials, and mentorship to help members grow their skills.
                </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-green-400 mb-3">Excellence</h3>
                <p className="text-slate-300">
                  We strive for high-quality work and foster a culture of continuous improvement.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">What We Offer</h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-bold text-white">Pixel Art Showcase</h3>
                  <p className="text-slate-400">Share and receive feedback on your pixel art creations</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-2xl">🎮</span>
                <div>
                  <h3 className="font-bold text-white">Game Design Discussions</h3>
                  <p className="text-slate-400">Collaborate on game projects and share design insights</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-2xl">📚</span>
                <div>
                  <h3 className="font-bold text-white">Resources & Tutorials</h3>
                  <p className="text-slate-400">Access guides, tools, and learning materials</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="font-bold text-white">Community Events</h3>
                  <p className="text-slate-400">Participate in challenges and collaborative projects</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-bold text-white">Networking</h3>
                  <p className="text-slate-400">Connect with like-minded creatives and professionals</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Community</h2>
            <p className="text-lg text-slate-300 mb-8">
              Whether you're a beginner or an experienced artist, there's a place for you in Pixel Design.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
