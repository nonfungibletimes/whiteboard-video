interface Props {
  text: string;
  visible: boolean;
}

export function CaptionOverlay({ text, visible }: Props) {
  if (!visible || !text.trim()) return null;

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-30 flex justify-center">
      <div className="max-w-[85%] rounded-xl bg-slate-950/70 px-4 py-2 text-center text-lg font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300">
        {text}
      </div>
    </div>
  );
}
