import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Reviews from "@/pages/Reviews";
import About from "@/pages/About";
import Overview from "@/pages/Overview";
import Partners from "@/pages/Partners";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
            PIXEL
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={location === "/" ? "default" : "ghost"}
            onClick={() => setLocation("/")}
            className={`${
              location === "/"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Home
          </Button>

          <Button
            variant={location === "/partners" ? "default" : "ghost"}
            onClick={() => setLocation("/partners")}
            className={`${
              location === "/partners"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Partners
          </Button>
          <Button
            variant={location === "/reviews" ? "default" : "ghost"}
            onClick={() => setLocation("/reviews")}
            className={`${
              location === "/reviews"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Reviews
          </Button>
          <a
            href="https://discord.gg/pixeldesign"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium"
          >
            Discord
          </a>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/overview"} component={Overview} />
      <Route path={"/partners"} component={Partners} />
      <Route path={"/about"} component={About} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Navigation />
          <div className="pt-16">
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
