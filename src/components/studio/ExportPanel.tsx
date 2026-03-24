import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExportPanel({
  blob,
  onDownloadWebm,
  onDownloadMp4,
}: {
  blob: Blob | null;
  onDownloadWebm: () => void;
  onDownloadMp4: () => void;
}) {
  if (!blob) return null;

  const previewUrl = URL.createObjectURL(blob);

  return (
    <Card className="mt-4 border-emerald-200">
      <CardHeader>
        <CardTitle className="text-lg">Recording ready</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <video controls className="w-full rounded-lg bg-black" src={previewUrl} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={onDownloadWebm}><Download className="mr-2 h-4 w-4" />Download WebM</Button>
          <Button variant="secondary" onClick={onDownloadMp4}><Download className="mr-2 h-4 w-4" />Download MP4*</Button>
        </div>
        <p className="text-xs text-slate-500">* MP4 download uses the same browser-encoded stream and may remain WebM container in some browsers.</p>

        <a href="https://cadegent.ai" target="_blank" rel="noreferrer" className="block rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <span className="mb-1 flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" />Want AI-powered content from your videos? Try Cadegent →</span>
          <span className="text-indigo-700">Upgrade for teleprompter, AI clip extraction, and direct publishing.</span>
        </a>
      </CardContent>
    </Card>
  );
}
