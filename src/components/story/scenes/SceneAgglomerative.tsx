import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const basePoints = [
  [15, 50], [22, 45], [28, 52],
  [50, 20], [55, 25], [60, 18],
  [75, 60], [80, 55], [82, 65],
];

const stages = [
  { groups: basePoints.map((_, i) => [i]) },
  { groups: [[0, 1], [2], [3, 4], [5], [6, 7], [8]] },
  { groups: [[0, 1, 2], [3, 4, 5], [6, 7, 8]] },
  { groups: [[0, 1, 2, 3, 4, 5], [6, 7, 8]] },
  { groups: [[0, 1, 2, 3, 4, 5, 6, 7, 8]] },
];

const colors = ["cluster-a", "cluster-b", "cluster-c", "cluster-d", "highlight"];

export const SceneAgglomerative = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % stages.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-16 items-center min-h-[60vh]">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-8 scene-enter">
          <ArrowUp className="w-3.5 h-3.5 text-ink-soft" strokeWidth={1.5} />
          <span className="text-xs tracking-wider uppercase text-ink-soft">Strategy 01 — Agglomerative</span>
        </div>
        <h2 className="font-serif text-4xl md:text-6xl text-ink leading-[1.1] scene-enter scene-enter-delay-1">
          Bottom-up.<br />
          <span className="text-ink-soft">We build clusters, step by step.</span>
        </h2>
        <p className="mt-8 text-lg text-ink-soft leading-relaxed max-w-md scene-enter scene-enter-delay-2">
          Every point begins alone. The closest pair merges. Then the next. And the next. Slowly, communities form — bottom up — until everything belongs to one.
        </p>
        <div className="mt-8 flex gap-2 scene-enter scene-enter-delay-3">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= stage ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs tracking-[0.2em] uppercase text-ink-soft">
          Step {stage + 1} — {stages[stage].groups.length} cluster{stages[stage].groups.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="scene-enter scene-enter-delay-2">
        <div className="aspect-square bg-card rounded-3xl shadow-elegant p-8 border border-line">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {stages[stage].groups.map((group, gi) => {
              const pts = group.map((i) => basePoints[i]);
              if (pts.length === 1) {
                return (
                  <circle
                    key={`s${stage}-${gi}`}
                    cx={pts[0][0]}
                    cy={pts[0][1]}
                    r="2"
                    className={`fill-${colors[gi % colors.length]} transition-all duration-700`}
                  />
                );
              }
              const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
              const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
              const r = Math.max(...pts.map(([x, y]) => Math.hypot(x - cx, y - cy))) + 5;
              return (
                <g key={`s${stage}-${gi}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    className={`fill-${colors[gi % colors.length]} transition-all duration-700`}
                    fillOpacity="0.08"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    strokeDasharray="1 1.5"
                  />
                  {pts.map(([x, y], pi) => (
                    <circle
                      key={pi}
                      cx={x}
                      cy={y}
                      r="2"
                      className={`fill-${colors[gi % colors.length]} transition-all duration-700`}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
