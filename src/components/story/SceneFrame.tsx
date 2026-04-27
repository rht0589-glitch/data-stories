import { ReactNode } from "react";

interface SceneFrameProps {
  index: number;
  total: number;
  chapter: string;
  children: ReactNode;
}

export const SceneFrame = ({ index, total, chapter, children }: SceneFrameProps) => {
  return (
    <div className="relative w-full max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-12 scene-enter">
        <span className="text-xs tracking-[0.25em] uppercase text-ink-soft font-medium">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs tracking-[0.25em] uppercase text-ink-soft font-medium">
          {chapter}
        </span>
      </div>
      {children}
    </div>
  );
};
