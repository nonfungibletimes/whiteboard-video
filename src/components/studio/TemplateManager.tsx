import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SavedTemplate } from "@/types/studio";
import { useState } from "react";

export function TemplateManager({
  templates,
  onSave,
  onLoad,
  onDelete,
}: {
  templates: SavedTemplate[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
        <Button
          size="sm"
          className="min-h-11 min-w-11"
          onClick={() => {
            if (!name.trim()) return;
            onSave(name.trim());
            setName("");
          }}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-28 space-y-1 overflow-y-auto">
        {templates.length === 0 && <p className="text-xs text-slate-500">No saved templates yet.</p>}
        {templates.map((template) => (
          <div key={template.id} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-xs">
            <button onClick={() => onLoad(template.id)} className="truncate text-left font-medium text-slate-700 hover:text-slate-900">
              {template.name}
            </button>
            <button onClick={() => onDelete(template.id)} className="min-h-8 min-w-8 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
