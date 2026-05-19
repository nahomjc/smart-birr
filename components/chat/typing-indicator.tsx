export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 rounded-2xl border border-emerald-900/30 bg-[#141f1b] px-4 py-3"
      aria-label="Smart Birr is typing"
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/90 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/90 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/90 [animation-delay:300ms]" />
    </div>
  );
}
