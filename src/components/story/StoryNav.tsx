import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoryNavProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}

export const StoryNav = ({ index, total, onPrev, onNext, onJump }: StoryNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
    <div className="max-w-6xl mx-auto px-6 md:px-12 pb-8">
      <div className="pointer-events-auto bg-card/90 backdrop-blur-xl border border-line rounded-full shadow-elegant px-4 py-3 flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous scene"
        >
          <ChevronLeft className="w-4 h-4 text-ink" strokeWidth={1.8} />
        </button>
        <div className="flex-1 flex items-center gap-1.5 px-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? "bg-ink flex-[3]" : "bg-line flex-1 hover:bg-ink-soft"
              }`}
              aria-label={`Jump to scene ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-ink text-paper hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="Next scene"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  </div>
);
