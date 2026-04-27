import { useMemo, useState } from "react";
import { RotateCcw, ArrowRight, Sparkles, Target } from "lucide-react";

/**
 * A small, focused simulation of Agglomerative Hierarchical Clustering.
 *
 * Case study: We have 6 animals described by 2 traits — (size, speed).
 * GOAL: discover natural groups without any labels.
 *
 * The user clicks "Next merge" to step through the algorithm.
 * At each step we:
 *   1. Find the two closest clusters (by centroid distance)
 *   2. Merge them
 *   3. Draw the link in the dendrogram
 * Stop when only the desired number of groups remain.
 */

type Animal = { id: string; name: string; emoji: string; size: number; speed: number };

const ANIMALS: Animal[] = [
  { id: "a", name: "Mouse",    emoji: "🐭", size: 8,  speed: 25 },
  { id: "b", name: "Rabbit",   emoji: "🐰", size: 18, speed: 55 },
  { id: "c", name: "Cat",      emoji: "🐱", size: 22, speed: 48 },
  { id: "d", name: "Wolf",     emoji: "🐺", size: 55, speed: 75 },
  { id: "e", name: "Cheetah",  emoji: "🐆", size: 60, speed: 95 },
  { id: "f", name: "Elephant", emoji: "🐘", size: 95, speed: 35 },
];

// Cluster colors (semantic tokens).
const CLUSTER_COLORS = ["cluster-a", "cluster-b", "cluster-c", "cluster-d", "highlight", "ink-soft"];

type Cluster = {
  id: string;
  members: string[]; // animal ids
  colorIdx: number;
};

type MergeEvent = {
  step: number;
  a: Cluster;
  b: Cluster;
  distance: number;
};

const dist = (p: Animal, q: Animal) =>
  Math.hypot(p.size - q.size, p.speed - q.speed);

const centroid = (members: string[]) => {
  const pts = members.map((id) => ANIMALS.find((a) => a.id === id)!);
  const s = pts.reduce((a, p) => a + p.size, 0) / pts.length;
  const v = pts.reduce((a, p) => a + p.speed, 0) / pts.length;
  return { size: s, speed: v };
};

const clusterDistance = (c1: Cluster, c2: Cluster) => {
  const a = centroid(c1.members);
  const b = centroid(c2.members);
  return Math.hypot(a.size - b.size, a.speed - b.speed);
};

// Run the full clustering once and store every step.
const runClustering = () => {
  let clusters: Cluster[] = ANIMALS.map((a, i) => ({
    id: a.id,
    members: [a.id],
    colorIdx: i,
  }));

  const history: { clusters: Cluster[]; merge: MergeEvent | null }[] = [
    { clusters: clusters.map((c) => ({ ...c })), merge: null },
  ];

  let step = 1;
  while (clusters.length > 1) {
    let best: { i: number; j: number; d: number } | null = null;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDistance(clusters[i], clusters[j]);
        if (!best || d < best.d) best = { i, j, d };
      }
    }
    if (!best) break;
    const a = clusters[best.i];
    const b = clusters[best.j];
    const merged: Cluster = {
      id: `${a.id}+${b.id}`,
      members: [...a.members, ...b.members],
      colorIdx: a.colorIdx, // inherit
    };
    clusters = clusters.filter((_, k) => k !== best!.i && k !== best!.j).concat(merged);
    history.push({
      clusters: clusters.map((c) => ({ ...c })),
      merge: { step, a, b, distance: best.d },
    });
    step++;
  }
  return history;
};

export const ClusteringSimulation = () => {
  const history = useMemo(() => runClustering(), []);
  const [step, setStep] = useState(0);

  const current = history[step];
  const lastMerge = current.merge;
  const isDone = step === history.length - 1;

  // Build dendrogram coordinates from merges up to current step.
  const dendro = useMemo(() => {
    // Each animal sits at a fixed x position based on a sensible ordering.
    const order = ["a", "b", "c", "d", "e", "f"];
    const xOf = (id: string) => order.indexOf(id) * 60 + 40;

    const merges = history
      .slice(1, step + 1)
      .map((h) => h.merge!)
      .filter(Boolean);

    // Track the current x and y of each cluster id.
    const pos: Record<string, { x: number; y: number }> = {};
    ANIMALS.forEach((a) => (pos[a.id] = { x: xOf(a.id), y: 240 }));

    const links: { x1: number; x2: number; y1: number; y2: number; yTop: number; isLast: boolean }[] = [];
    merges.forEach((m, idx) => {
      const pa = pos[m.a.id];
      const pb = pos[m.b.id];
      const yTop = 220 - m.distance * 2.2; // higher merges = bigger distance
      const newX = (pa.x + pb.x) / 2;
      links.push({
        x1: pa.x,
        x2: pb.x,
        y1: pa.y,
        y2: pb.y,
        yTop,
        isLast: idx === merges.length - 1,
      });
      const newId = `${m.a.id}+${m.b.id}`;
      pos[newId] = { x: newX, y: yTop };
    });

    return { links, xOf };
  }, [step, history]);

  const goalGroups = 3; // our learning goal: discover 3 natural groups

  // Map each animal to its current cluster index for coloring.
  const animalCluster: Record<string, number> = {};
  current.clusters.forEach((c, i) => {
    c.members.forEach((m) => (animalCluster[m] = i));
  });

  return (
    <div className="min-h-screen bg-background text-ink">
      {/* Header */}
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-highlight" />
            <span className="font-serif text-lg">Hierarchical Clustering</span>
          </div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-ink-soft hidden sm:block">
            Mini simulation
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* Goal card */}
        <div className="mb-8 p-5 md:p-6 rounded-2xl bg-secondary border border-line">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-background">
              <Target className="w-4 h-4 text-highlight" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft mb-1">The case</div>
              <h1 className="font-serif text-2xl md:text-3xl leading-tight">
                We have 6 animals, no labels.
              </h1>
              <p className="mt-2 text-sm md:text-base text-ink-soft leading-relaxed max-w-2xl">
                Each one has a <span className="text-ink">size</span> and a{" "}
                <span className="text-ink">speed</span>. Our goal: discover{" "}
                <span className="text-highlight font-medium">{goalGroups} natural groups</span> by
                merging the closest pair, one step at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT — scatter plot of animals */}
          <div className="lg:col-span-3 p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">The data</div>
                <div className="font-serif text-lg">size × speed</div>
              </div>
              <div className="text-xs text-ink-soft">
                {current.clusters.length} group{current.clusters.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-paper rounded-xl border border-line overflow-hidden">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* axes */}
                <line x1="40" y1="260" x2="380" y2="260" stroke="hsl(var(--line))" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="260" stroke="hsl(var(--line))" strokeWidth="1" />
                <text x="380" y="278" textAnchor="end" className="fill-ink-soft" fontSize="9">size →</text>
                <text x="40" y="14" textAnchor="start" className="fill-ink-soft" fontSize="9">↑ speed</text>

                {/* cluster hulls (circles around members) */}
                {current.clusters.map((c, ci) => {
                  if (c.members.length < 2) return null;
                  const pts = c.members.map((id) => ANIMALS.find((a) => a.id === id)!);
                  const cx = 40 + (pts.reduce((a, p) => a + p.size, 0) / pts.length) * 3.4;
                  const cy = 260 - (pts.reduce((a, p) => a + p.speed, 0) / pts.length) * 2.4;
                  const r = Math.max(
                    ...pts.map((p) =>
                      Math.hypot(40 + p.size * 3.4 - cx, 260 - p.speed * 2.4 - cy),
                    ),
                  ) + 22;
                  const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
                  const justMerged =
                    lastMerge &&
                    c.members.length === lastMerge.a.members.length + lastMerge.b.members.length &&
                    lastMerge.a.members.every((m) => c.members.includes(m));
                  return (
                    <circle
                      key={c.id}
                      cx={cx}
                      cy={cy}
                      r={r}
                      className={`fill-${color} stroke-${color} transition-all duration-700`}
                      fillOpacity={justMerged ? 0.18 : 0.1}
                      strokeOpacity={justMerged ? 0.7 : 0.4}
                      strokeWidth={justMerged ? 1.5 : 1}
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* animal points */}
                {ANIMALS.map((a) => {
                  const x = 40 + a.size * 3.4;
                  const y = 260 - a.speed * 2.4;
                  const ci = animalCluster[a.id];
                  const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
                  return (
                    <g key={a.id} className="transition-all duration-500">
                      <circle cx={x} cy={y} r="6" className={`fill-${color}`} />
                      <text x={x} y={y - 12} textAnchor="middle" fontSize="14">
                        {a.emoji}
                      </text>
                      <text x={x} y={y + 18} textAnchor="middle" fontSize="8" className="fill-ink-soft">
                        {a.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* explanation of last merge */}
            <div className="mt-4 min-h-[64px] p-4 rounded-xl bg-secondary border border-line">
              {!lastMerge && !isDone && (
                <p className="text-sm text-ink-soft">
                  <span className="text-ink font-medium">Start:</span> every animal is its own group.
                  Press <span className="text-ink">Next merge</span> to combine the closest pair.
                </p>
              )}
              {lastMerge && (
                <div className="text-sm text-ink-soft leading-relaxed">
                  <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-highlight" strokeWidth={2} />
                    Step {lastMerge.step}
                  </span>
                  <span className="mx-2">·</span>
                  Merged{" "}
                  <span className="text-ink">
                    {lastMerge.a.members.map((m) => ANIMALS.find((a) => a.id === m)!.emoji).join(" ")}
                  </span>{" "}
                  with{" "}
                  <span className="text-ink">
                    {lastMerge.b.members.map((m) => ANIMALS.find((a) => a.id === m)!.emoji).join(" ")}
                  </span>{" "}
                  — distance{" "}
                  <span className="font-mono text-ink">{lastMerge.distance.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* controls */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setStep((s) => Math.min(s + 1, history.length - 1))}
                disabled={isDone}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ink text-paper font-medium text-sm transition hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isDone ? "Done" : "Next merge"}
                {!isDone && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
              </button>
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line text-ink-soft hover:text-ink hover:border-ink/30 transition text-sm"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
                Reset
              </button>
            </div>

            {/* progress dots */}
            <div className="mt-4 flex gap-1.5">
              {history.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= step ? "bg-ink" : "bg-line"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — dendrogram + groups list */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">
              <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">The tree</div>
              <div className="font-serif text-lg mb-4">Dendrogram</div>
              <div className="aspect-[5/4] bg-paper rounded-xl border border-line overflow-hidden">
                <svg viewBox="0 0 400 280" className="w-full h-full">
                  {/* baseline */}
                  <line x1="20" y1="245" x2="380" y2="245" stroke="hsl(var(--line))" strokeWidth="1" />

                  {/* links */}
                  {dendro.links.map((l, i) => (
                    <g key={i}>
                      <path
                        d={`M ${l.x1} ${l.y1} L ${l.x1} ${l.yTop} L ${l.x2} ${l.yTop} L ${l.x2} ${l.y2}`}
                        fill="none"
                        stroke={l.isLast ? "hsl(var(--highlight))" : "hsl(var(--ink-soft))"}
                        strokeWidth={l.isLast ? 2 : 1.2}
                        strokeOpacity={l.isLast ? 1 : 0.6}
                        className="transition-all duration-500"
                      />
                    </g>
                  ))}

                  {/* leaf labels */}
                  {ANIMALS.map((a, i) => (
                    <text
                      key={a.id}
                      x={dendro.xOf(a.id)}
                      y={262}
                      textAnchor="middle"
                      fontSize="14"
                    >
                      {a.emoji}
                    </text>
                  ))}
                </svg>
              </div>
              <p className="mt-3 text-xs text-ink-soft leading-relaxed">
                Each horizontal bar is a merge. The higher the bar, the more different the groups
                that joined.
              </p>
            </div>

            {/* current groups */}
            <div className="p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">Right now</div>
                  <div className="font-serif text-lg">
                    {current.clusters.length} group{current.clusters.length !== 1 ? "s" : ""}
                  </div>
                </div>
                {current.clusters.length === goalGroups && (
                  <span className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded-full bg-highlight/15 text-highlight">
                    Goal reached
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {current.clusters.map((c, ci) => {
                  const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary border border-line"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full bg-${color}`} />
                      <div className="text-lg">
                        {c.members
                          .map((m) => ANIMALS.find((a) => a.id === m)!.emoji)
                          .join(" ")}
                      </div>
                      <div className="ml-auto text-[10px] tracking-wider uppercase text-ink-soft">
                        {c.members.length} member{c.members.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Final insight */}
        {isDone && (
          <div className="mt-8 p-6 rounded-2xl bg-ink text-paper">
            <div className="text-[11px] tracking-[0.25em] uppercase opacity-60 mb-2">What we learned</div>
            <p className="font-serif text-xl md:text-2xl leading-snug">
              Without any labels, the algorithm rebuilt the natural hierarchy: small fast pets,
              large fast predators, and the lone elephant — just by repeatedly merging the closest
              pair.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
