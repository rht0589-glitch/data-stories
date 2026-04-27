import { Sparkles } from "lucide-react";

const groups = [
  { color: "cluster-a", points: [[20, 25], [25, 22], [22, 30], [28, 28], [18, 32]] },
  { color: "cluster-b", points: [[70, 30], [75, 25], [78, 35], [72, 38]] },
  { color: "cluster-c", points: [[35, 70], [40, 75], [32, 78], [38, 72], [42, 80]] },
  { color: "cluster-d", points: [[75, 75], [80, 78], [78, 70], [72, 80]] },
];

export const SceneClustering = () => (
  <div className="grid md:grid-cols-2 gap-16 items-center min-h-[60vh]">
    <div className="order-2 md:order-1 scene-enter scene-enter-delay-1">
      <div className="aspect-square bg-card rounded-3xl shadow-elegant p-8 border border-line">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {groups.map((g, gi) =>
            g.points.map(([x, y], i) => (
              <circle
                key={`${gi}-${i}`}
                cx={x}
                cy={y}
                r="2"
                className={`fill-${g.color}`}
                style={{
                  opacity: 0,
                  animation: `scene-in 0.5s ease-out ${gi * 200 + i * 80}ms forwards`,
                }}
              />
            ))
          )}
          {groups.map((g, gi) => {
            const xs = g.points.map((p) => p[0]);
            const ys = g.points.map((p) => p[1]);
            const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
            const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
            const r = Math.max(...g.points.map(([x, y]) => Math.hypot(x - cx, y - cy))) + 4;
            return (
              <circle
                key={`hull-${gi}`}
                cx={cx}
                cy={cy}
                r={r}
                className={`stroke-${g.color}`}
                fill="none"
                strokeWidth="0.4"
                strokeDasharray="1.5 1.5"
                style={{
                  opacity: 0,
                  animation: `scene-in 0.8s ease-out ${800 + gi * 150}ms forwards`,
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
    <div className="order-1 md:order-2">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-8 scene-enter">
        <Sparkles className="w-3.5 h-3.5 text-ink-soft" strokeWidth={1.5} />
        <span className="text-xs tracking-wider uppercase text-ink-soft">The idea</span>
      </div>
      <h2 className="font-serif text-4xl md:text-6xl text-ink leading-[1.1] scene-enter scene-enter-delay-1">
        We group what <em className="text-highlight">looks alike</em>.
      </h2>
      <p className="mt-8 text-lg text-ink-soft leading-relaxed max-w-md scene-enter scene-enter-delay-2">
        Similarity becomes distance. Points close together belong together. From a single principle, structure begins to emerge.
      </p>
    </div>
  </div>
);
