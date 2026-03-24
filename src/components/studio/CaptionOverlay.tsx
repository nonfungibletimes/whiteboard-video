interface Props {
  text: string;
  visible: boolean;
}

export function CaptionOverlay({ text, visible }: Props) {
  if (!visible || !text.trim()) return null;

  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-20 z-30 flex justify-center md:inset-x-4 md:bottom-4">
      <div className="max-w-[92%] rounded-xl bg-slate-950/70 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 sm:text-base md:max-w-[85%] md:px-4 md:text-lg">
        {text}
      </div>
    </div>
  );
}
