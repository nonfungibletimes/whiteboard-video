import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pricing</h1>
          <Link to="/studio" className="text-sm font-medium text-indigo-600">Open Studio →</Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">Free</Badge>
              <CardTitle>Standalone WhiteBoard Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>✓ Excalidraw whiteboard</p>
              <p>✓ Webcam + mic recording</p>
              <p>✓ 3 formats, 6 layouts</p>
              <p>✓ Download WebM/MP4</p>
              <p>✓ Local templates</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-300">
            <CardHeader>
              <Badge className="w-fit">Cadegent Pro</Badge>
              <CardTitle>AI Content Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>✓ Built-in teleprompter</p>
              <p>✓ AI clip extraction + repurposing</p>
              <p>✓ Social post generation</p>
              <p>✓ Team workflows + publishing</p>
              <p>✓ Priority support</p>
              <a href="https://cadegent.ai" target="_blank" rel="noreferrer" className="mt-3 inline-block text-indigo-600">Learn more at cadegent.ai →</a>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
