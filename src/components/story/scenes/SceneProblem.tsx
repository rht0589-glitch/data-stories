import { HelpCircle } from "lucide-react";

export const SceneProblem = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-8 scene-enter">
      <HelpCircle className="w-3.5 h-3.5 text-ink-soft" strokeWidth={1.5} />
      <span className="text-xs tracking-wider uppercase text-ink-soft">The question</span>
    </div>
    <h2 className="font-serif text-4xl md:text-7xl text-ink leading-[1.05] max-w-4xl scene-enter scene-enter-delay-1">
      How can we find <em className="text-highlight">natural groups</em> when no one tells us what to look for?
    </h2>
    <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl w-full scene-enter scene-enter-delay-3">
      {[
        { k: "No categories", v: "We don't know how many groups exist." },
        { k: "No labels", v: "Nothing tells us which point belongs where." },
        { k: "Hidden structure", v: "Yet patterns are waiting to be discovered." },
      ].map((c) => (
        <div key={c.k} className="text-left p-6 rounded-2xl border border-line bg-card shadow-soft">
          <div className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">{c.k}</div>
          <div className="text-ink leading-relaxed">{c.v}</div>
        </div>
      ))}
    </div>
  </div>
);
