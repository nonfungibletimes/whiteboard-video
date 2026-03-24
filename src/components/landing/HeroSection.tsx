import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
      <div>
        <p className="mb-3 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Free whiteboard video tool
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Create whiteboard explainer videos in your browser.</h1>
        <p className="mt-4 text-lg text-slate-600">
          Draw with Excalidraw, record webcam + voice, and download instantly. No account, no backend, no watermark.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/studio">Open Studio</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/pricing">Free vs Pro</Link></Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 shadow-sm">
        <div className="aspect-video rounded-xl bg-white p-4 shadow-inner">
          <div className="h-full rounded-lg border border-dashed border-slate-300 bg-slate-50" />
        </div>
        <ul className="mt-5 grid gap-2 text-sm text-slate-700">
          <li>• 6 webcam layouts</li>
          <li>• 3 output formats</li>
          <li>• Built-in countdown + timer</li>
          <li>• Local templates (save/load)</li>
        </ul>
      </div>
    </section>
  );
}
