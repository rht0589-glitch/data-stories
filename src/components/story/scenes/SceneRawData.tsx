import { Database } from "lucide-react";

const points = Array.from({ length: 28 }, (_, i) => ({
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  d: i * 60,
}));

export const SceneRawData = () => (
  <div className="grid md:grid-cols-2 gap-16 items-center min-h-[60vh]">
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-8 scene-enter">
        <Database className="w-3.5 h-3.5 text-ink-soft" strokeWidth={1.5} />
        <span className="text-xs tracking-wider uppercase text-ink-soft">The dataset</span>
      </div>
      <h2 className="font-serif text-4xl md:text-6xl text-ink leading-[1.1] scene-enter scene-enter-delay-1">
        We have data.<br />
        <span className="text-ink-soft">But no labels. No groups. No story.</span>
      </h2>
      <p className="mt-8 text-lg text-ink-soft leading-relaxed max-w-md scene-enter scene-enter-delay-2">
        Customers, patients, products, students — thousands of points, each described by numbers, none of them telling us where they belong.
      </p>
    </div>
    <div className="scene-enter scene-enter-delay-2">
      <div className="aspect-square bg-card rounded-3xl shadow-elegant p-8 relative overflow-hidden border border-line">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.4"
              className="fill-ink-soft"
              style={{
                opacity: 0,
                animation: `scene-in 0.6s ease-out ${p.d}ms forwards`,
              }}
            />
          ))}
        </svg>
        <div className="absolute bottom-6 left-6 text-xs tracking-[0.2em] uppercase text-ink-soft">
          n = 28 observations
        </div>
      </div>
    </div>
  </div>
);
