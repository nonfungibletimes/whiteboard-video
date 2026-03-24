import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LayoutMode } from "@/types/studio";

export function LayoutSelector({ value, onChange }: { value: LayoutMode; onChange: (value: LayoutMode) => void }) {
  return (
    <div className="w-[170px]">
      <Select value={value} onValueChange={(v) => onChange(v as LayoutMode)}>
        <SelectTrigger><SelectValue placeholder="Layout" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="pip-br">PiP Bottom Right</SelectItem>
          <SelectItem value="pip-bl">PiP Bottom Left</SelectItem>
          <SelectItem value="pip-tr">PiP Top Right</SelectItem>
          <SelectItem value="pip-tl">PiP Top Left</SelectItem>
          <SelectItem value="side-by-side">Side by Side</SelectItem>
          <SelectItem value="board-only">Board Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
