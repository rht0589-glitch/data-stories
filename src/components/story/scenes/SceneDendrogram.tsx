import { useState } from "react";
import { GitBranch } from "lucide-react";

// leaf x positions
const leaves = [10, 20, 30, 45, 55, 65, 80, 90];
const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];

// merge structure: y = height
// pairs: (A,B) at 15, (D,E) at 18, (G,H) at 20, (AB,C) at 32, (DE,F) at 35, (GH) stays, (ABC,DEF) at 55, (ABCDEF, GH) at 75

export const SceneDendrogram = () => {
  const [cutY, setCutY] = useState(45);

  // determine clusters at cut
  const clustersAtCut = (y: number): string[][] => {
    if (y < 15) return labels.map((l) => [l]);
    if (y < 18) return [["A", "B"], ["C"], ["D"], ["E"], ["F"], ["G"], ["H"]];
    if (y < 20) return [["A", "B"], ["C"], ["D", "E"], ["F"], ["G"], ["H"]];
    if (y < 32) return [["A", "B"], ["C"], ["D", "E"], ["F"], ["G", "H"]];
    if (y < 35) return [["A", "B", "C"], ["D", "E"], ["F"], ["G", "H"]];
    if (y < 55) return [["A", "B", "C"], ["D", "E", "F"], ["G", "H"]];
    if (y < 75) return [["A", "B", "C", "D", "E", "F"], ["G", "H"]];
    return [["A", "B", "C", "D", "E", "F", "G", "H"]];
  };

  const clusters = clustersAtCut(cutY);

  return (
    <div className="min-h-[70vh]">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-6 scene-enter">
          <GitBranch className="w-3.5 h-3.5 text-ink-soft" strokeWidth={1.5} />
          <span className="text-xs tracking-wider uppercase text-ink-soft">The dendrogram</span>
        </div>
        <h2 className="font-serif text-4xl md:text-6xl text-ink leading-[1.1] max-w-3xl mx-auto scene-enter scene-enter-delay-1">
          A tree that <em className="text-highlight">remembers</em> every merge.
        </h2>
        <p className="mt-6 text-lg text-ink-soft max-w-xl mx-auto scene-enter scene-enter-delay-2">
          Drag the line. Where you cut decides how many clusters you keep.
        </p>
      </div>

      <div className="bg-card rounded-3xl shadow-elegant p-8 md:p-12 border border-line scene-enter scene-enter-delay-3">
        <svg viewBox="0 0 100 100" className="w-full h-[420px]" preserveAspectRatio="none">
          {/* Branches */}
          <g stroke="hsl(var(--ink))" strokeWidth="0.4" fill="none">
            {/* A-B merge at 15 */}
            <line x1={leaves[0]} y1={100} x2={leaves[0]} y2={100 - 15} />
            <line x1={leaves[1]} y1={100} x2={leaves[1]} y2={100 - 15} />
            <line x1={leaves[0]} y1={100 - 15} x2={leaves[1]} y2={100 - 15} />
            {/* AB-C at 32 */}
            <line x1={(leaves[0] + leaves[1]) / 2} y1={100 - 15} x2={(leaves[0] + leaves[1]) / 2} y2={100 - 32} />
            <line x1={leaves[2]} y1={100} x2={leaves[2]} y2={100 - 32} />
            <line x1={(leaves[0] + leaves[1]) / 2} y1={100 - 32} x2={leaves[2]} y2={100 - 32} />
            {/* D-E at 18 */}
            <line x1={leaves[3]} y1={100} x2={leaves[3]} y2={100 - 18} />
            <line x1={leaves[4]} y1={100} x2={leaves[4]} y2={100 - 18} />
            <line x1={leaves[3]} y1={100 - 18} x2={leaves[4]} y2={100 - 18} />
            {/* DE-F at 35 */}
            <line x1={(leaves[3] + leaves[4]) / 2} y1={100 - 18} x2={(leaves[3] + leaves[4]) / 2} y2={100 - 35} />
            <line x1={leaves[5]} y1={100} x2={leaves[5]} y2={100 - 35} />
            <line x1={(leaves[3] + leaves[4]) / 2} y1={100 - 35} x2={leaves[5]} y2={100 - 35} />
            {/* G-H at 20 */}
            <line x1={leaves[6]} y1={100} x2={leaves[6]} y2={100 - 20} />
            <line x1={leaves[7]} y1={100} x2={leaves[7]} y2={100 - 20} />
            <line x1={leaves[6]} y1={100 - 20} x2={leaves[7]} y2={100 - 20} />
            {/* ABC + DEF at 55 */}
            {(() => {
              const xL = ((leaves[0] + leaves[1]) / 2 + leaves[2]) / 2;
              const xR = ((leaves[3] + leaves[4]) / 2 + leaves[5]) / 2;
              return (
                <>
                  <line x1={xL} y1={100 - 32} x2={xL} y2={100 - 55} />
                  <line x1={xR} y1={100 - 35} x2={xR} y2={100 - 55} />
                  <line x1={xL} y1={100 - 55} x2={xR} y2={100 - 55} />
                  {/* root at 75 */}
                  <line x1={(xL + xR) / 2} y1={100 - 55} x2={(xL + xR) / 2} y2={100 - 75} />
                  <line x1={(leaves[6] + leaves[7]) / 2} y1={100 - 20} x2={(leaves[6] + leaves[7]) / 2} y2={100 - 75} />
                  <line x1={(xL + xR) / 2} y1={100 - 75} x2={(leaves[6] + leaves[7]) / 2} y2={100 - 75} />
                </>
              );
            })()}
          </g>

          {/* Cut line */}
          <line
            x1="0"
            x2="100"
            y1={100 - cutY}
            y2={100 - cutY}
            stroke="hsl(var(--highlight))"
            strokeWidth="0.5"
            strokeDasharray="1.5 1"
          />

          {/* Leaves */}
          {leaves.map((x, i) => (
            <circle key={i} cx={x} cy={100} r="1.2" className="fill-ink" />
          ))}
        </svg>

        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <label className="text-xs tracking-[0.2em] uppercase text-ink-soft">Cut height</label>
            <input
              type="range"
              min="5"
              max="80"
              value={cutY}
              onChange={(e) => setCutY(Number(e.target.value))}
              className="w-full mt-3 accent-[hsl(var(--highlight))]"
            />
          </div>
          <div className="text-right">
            <div className="text-xs tracking-[0.2em] uppercase text-ink-soft">Resulting clusters</div>
            <div className="font-serif text-4xl text-ink mt-1">{clusters.length}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {clusters.map((c, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full bg-secondary text-sm text-ink border border-line"
            >
              {"{ " + c.join(", ") + " }"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
