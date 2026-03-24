import { Link } from "react-router-dom";
import { HeroSection } from "@/components/landing/HeroSection";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold">WhiteBoard Video</Link>
        <nav className="flex gap-6 text-sm text-slate-600">
          <Link to="/studio">Studio</Link>
          <Link to="/pricing">Pricing</Link>
        </nav>
      </header>
      <HeroSection />
    </main>
  );
}
