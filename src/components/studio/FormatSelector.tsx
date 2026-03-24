import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OutputFormat } from "@/types/studio";

interface Props {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
}

export function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="w-[170px]">
      <Select value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
        <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="landscape">Landscape 16:9</SelectItem>
          <SelectItem value="portrait">Portrait 9:16</SelectItem>
          <SelectItem value="square">Square 1:1</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
