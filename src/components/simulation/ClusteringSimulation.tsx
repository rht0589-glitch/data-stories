import { useMemo, useState, useEffect } from "react";
import { RotateCcw, ArrowRight, Sparkles, Target, ArrowUp, ArrowDown, Info, Play, Pause } from "lucide-react";

/**
 * Simulation interactive — Classification Hiérarchique
 *
 * Cas d'étude : 10 personnes décrites par 3 traits de mode de vie :
 *   - heures de sport / semaine
 *   - heures de réseaux sociaux / jour
 *   - niveau de stress (1 à 10)
 *
 * OBJECTIF : sans aucune étiquette, découvrir les profils naturels
 * (sportifs sereins, accros aux écrans stressés, profils intermédiaires).
 *
 * Deux approches au choix :
 *   1. Agglomérative (bas → haut) : chaque personne est seule, on fusionne les plus proches.
 *   2. Divisive (haut → bas) : tout le monde dans un groupe, on sépare le plus éloigné.
 */

type Person = {
  id: string;
  name: string;
  initial: string;
  sport: number;   // heures / semaine
  social: number;  // heures / jour
  stress: number;  // 1-10
};

const PEOPLE: Person[] = [
  { id: "amina", name: "Amina", initial: "A", sport: 8, social: 2, stress: 3 },
  { id: "bilal", name: "Bilal", initial: "B", sport: 2, social: 6, stress: 8 },
  { id: "chaima", name: "Chaima", initial: "C", sport: 5, social: 3, stress: 5 },
  { id: "dounia", name: "Dounia", initial: "D", sport: 7, social: 1, stress: 2 },
  { id: "elias", name: "Elias", initial: "E", sport: 1, social: 8, stress: 9 },
  { id: "farid", name: "Farid", initial: "F", sport: 6, social: 2, stress: 4 },
  { id: "Ghaith", name: "Ghaith", initial: "G", sport: 3, social: 7, stress: 7 },
  { id: "hamza", name: "Hamza", initial: "H", sport: 9, social: 1, stress: 1 },
  { id: "imane", name: "Imane", initial: "I", sport: 4, social: 5, stress: 6 },
  { id: "jamal", name: "Jamal", initial: "J", sport: 2, social: 9, stress: 9 },
];

// Ordre des feuilles dans le dendrogramme (groupé par profil naturel pour éviter les croisements)
const LEAF_ORDER = ["hamza", "dounia", "amina", "farid", "chaima", "imane", "Ghaith", "bilal", "elias", "jamal"];


const CLUSTER_COLORS = [
  "cluster-a", "cluster-b", "cluster-c", "cluster-d",
  "highlight", "ink-soft", "cluster-a", "cluster-b", "cluster-c", "cluster-d",
];

type Cluster = { id: string; members: string[] };
type MergeEvent = { step: number; a: Cluster; b: Cluster; distance: number; kind: "merge" | "split" };

// Distance euclidienne normalisée (chaque dimension ramenée à ~0-10)
const personDist = (p: Person, q: Person) =>
  Math.hypot(p.sport - q.sport, p.social - q.social, p.stress - q.stress);

const centroid = (members: string[]) => {
  const pts = members.map((id) => PEOPLE.find((a) => a.id === id)!);
  return {
    sport: pts.reduce((a, p) => a + p.sport, 0) / pts.length,
    social: pts.reduce((a, p) => a + p.social, 0) / pts.length,
    stress: pts.reduce((a, p) => a + p.stress, 0) / pts.length,
  };
};

const clusterDistance = (c1: Cluster, c2: Cluster) => {
  const a = centroid(c1.members);
  const b = centroid(c2.members);
  return Math.hypot(a.sport - b.sport, a.social - b.social, a.stress - b.stress);
};

// ---------- AGGLOMÉRATIVE ----------
const runAgglomerative = () => {
  let clusters: Cluster[] = PEOPLE.map((p) => ({ id: p.id, members: [p.id] }));
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
    const merged: Cluster = { id: `${a.id}+${b.id}`, members: [...a.members, ...b.members] };
    clusters = clusters.filter((_, k) => k !== best!.i && k !== best!.j).concat(merged);
    history.push({
      clusters: clusters.map((c) => ({ ...c })),
      merge: { step, a, b, distance: best.d, kind: "merge" },
    });
    step++;
  }
  return history;
};

// ---------- DIVISIVE ----------
// Heuristique simple : à chaque étape, on prend le cluster avec le plus grand diamètre
// (distance max entre 2 membres), puis on sépare le point le plus éloigné du centre
// avec ses voisins les plus proches.
const runDivisive = () => {
  let clusters: Cluster[] = [{ id: "all", members: PEOPLE.map((p) => p.id) }];
  const history: { clusters: Cluster[]; merge: MergeEvent | null }[] = [
    { clusters: clusters.map((c) => ({ ...c })), merge: null },
  ];
  let step = 1;
  while (clusters.some((c) => c.members.length > 1)) {
    // 1) trouver le cluster au plus grand diamètre interne
    let target = -1;
    let maxDiameter = -1;
    clusters.forEach((c, idx) => {
      if (c.members.length < 2) return;
      let dia = 0;
      for (let i = 0; i < c.members.length; i++) {
        for (let j = i + 1; j < c.members.length; j++) {
          const d = personDist(
            PEOPLE.find((p) => p.id === c.members[i])!,
            PEOPLE.find((p) => p.id === c.members[j])!,
          );
          if (d > dia) dia = d;
        }
      }
      if (dia > maxDiameter) {
        maxDiameter = dia;
        target = idx;
      }
    });
    if (target < 0) break;

    const cluster = clusters[target];
    const ctr = centroid(cluster.members);
    // 2) point le plus éloigné du centre = "splinter"
    const distancesToCenter = cluster.members.map((id) => {
      const p = PEOPLE.find((x) => x.id === id)!;
      return { id, d: Math.hypot(p.sport - ctr.sport, p.social - ctr.social, p.stress - ctr.stress) };
    });
    distancesToCenter.sort((a, b) => b.d - a.d);
    const splinterSeed = distancesToCenter[0].id;

    // 3) chaque autre point rejoint le groupe (original ou splinter) dont il est le plus proche
    const splinter: string[] = [splinterSeed];
    const rest: string[] = [];
    cluster.members.forEach((id) => {
      if (id === splinterSeed) return;
      const p = PEOPLE.find((x) => x.id === id)!;
      const dToSplinter = personDist(p, PEOPLE.find((x) => x.id === splinterSeed)!);
      // distance moyenne vers le reste
      const others = cluster.members.filter((m) => m !== id && m !== splinterSeed);
      const dToRest = others.length
        ? others.reduce((acc, m) => acc + personDist(p, PEOPLE.find((x) => x.id === m)!), 0) / others.length
        : Infinity;
      if (dToSplinter < dToRest) splinter.push(id);
      else rest.push(id);
    });

    if (splinter.length === 0 || rest.length === 0) {
      // fallback : split en deux moitiés
      const half = Math.floor(cluster.members.length / 2);
      const newClusters: Cluster[] = [
        { id: cluster.id + "-1", members: cluster.members.slice(0, half) },
        { id: cluster.id + "-2", members: cluster.members.slice(half) },
      ];
      clusters = clusters.filter((_, k) => k !== target).concat(newClusters);
    } else {
      const c1: Cluster = { id: cluster.id + "-r", members: rest };
      const c2: Cluster = { id: cluster.id + "-s", members: splinter };
      clusters = clusters.filter((_, k) => k !== target).concat([c1, c2]);
    }

    history.push({
      clusters: clusters.map((c) => ({ ...c })),
      merge: {
        step,
        a: { id: "split", members: rest },
        b: { id: "split", members: splinter },
        distance: maxDiameter,
        kind: "split",
      },
    });
    step++;
  }
  return history;
};

type Mode = "agglo" | "divisive";

// Petit badge avec l'initiale, coloré selon le cluster courant
const MemberBadge = ({ id, colorIdx }: { id: string; colorIdx: number }) => {
  const p = PEOPLE.find((x) => x.id === id)!;
  const color = CLUSTER_COLORS[colorIdx % CLUSTER_COLORS.length];
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
      style={{ backgroundColor: `hsl(var(--${color}))`, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
      title={p.name}
    >
      {p.initial}
    </span>
  );
};

// Construit les coordonnées du dendrogramme à partir de l'historique agglomératif.
// Pour le mode divisif, on inverse l'historique pour obtenir les mêmes fusions.
const buildDendrogram = (
  aggloHistory: { clusters: Cluster[]; merge: MergeEvent | null }[],
  visibleStep: number,
  mode: Mode,
  divisiveHistory: { clusters: Cluster[]; merge: MergeEvent | null }[],
) => {
  const totalSteps = aggloHistory.length - 1; // = nombre de fusions
  // Combien de fusions sont "révélées" à cette étape ?
  let revealed: number;
  if (mode === "agglo") {
    revealed = visibleStep;
  } else {
    // En divisif, l'étape 0 = tout fusionné (tout révélé), étape finale = rien révélé
    const divSteps = divisiveHistory.length - 1;
    revealed = totalSteps - Math.round((visibleStep / divSteps) * totalSteps);
  }

  const xOf = (id: string) => LEAF_ORDER.indexOf(id) * 38 + 30;
  const baseY = 240;
  const maxDist = Math.max(
    ...aggloHistory.slice(1).map((h) => h.merge!.distance),
    1,
  );

  // pos[clusterKey] = { x, y } — clusterKey = membres triés joints
  const keyOf = (members: string[]) => [...members].sort().join(",");
  const pos: Record<string, { x: number; y: number }> = {};
  PEOPLE.forEach((p) => (pos[keyOf([p.id])] = { x: xOf(p.id), y: baseY }));

  const links: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    yTop: number;
    isLast: boolean;
  }[] = [];

  for (let i = 1; i <= totalSteps; i++) {
    const ev = aggloHistory[i].merge!;
    const ka = keyOf(ev.a.members);
    const kb = keyOf(ev.b.members);
    const pa = pos[ka];
    const pb = pos[kb];
    if (!pa || !pb) continue;
    const yTop = baseY - 20 - (ev.distance / maxDist) * 190;
    const isVisible = i <= revealed;
    if (isVisible) {
      links.push({
        x1: pa.x,
        x2: pb.x,
        y1: pa.y,
        y2: pb.y,
        yTop,
        isLast: i === revealed,
      });
    }
    pos[keyOf([...ev.a.members, ...ev.b.members])] = { x: (pa.x + pb.x) / 2, y: yTop };
  }
  return { links, xOf, baseY };
};

export const ClusteringSimulation = () => {
  const [mode, setMode] = useState<Mode>("agglo");
  const aggloHistory = useMemo(() => runAgglomerative(), []);
  const divisiveHistory = useMemo(() => runDivisive(), []);
  const history = mode === "agglo" ? aggloHistory : divisiveHistory;

  const [hasStarted, setHasStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = history[step];
  const lastEvent = current.merge;
  const isDone = step === history.length - 1;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && isPlaying && !isDone) {
      timer = setTimeout(() => {
        setStep((s) => Math.min(s + 1, history.length - 1));
      }, 2500);
    } else if (isDone) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [hasStarted, isPlaying, isDone, history, step]);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(0);
  };

  const goalGroups = 3;

  const animalCluster: Record<string, number> = {};
  current.clusters.forEach((c, i) => c.members.forEach((m) => (animalCluster[m] = i)));

  const dendro = useMemo(
    () => buildDendrogram(aggloHistory, step, mode, divisiveHistory),
    [aggloHistory, divisiveHistory, step, mode],
  );

  return (
    <div className="min-h-screen bg-background text-ink">
      {/* Header */}
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-highlight" />
            <span className="font-serif text-lg">Classification Hiérarchique</span>
          </div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-ink-soft hidden sm:block">
            Simulation interactive
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* Mission Briefing Card */}
        <div className="mb-10 p-8 md:p-10 rounded-[2rem] bg-paper border border-line shadow-xl relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-highlight/5 rounded-full blur-3xl group-hover:bg-highlight/10 transition-colors duration-700" />

          <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-ink text-paper flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Target className="w-8 h-8" strokeWidth={2} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlight/10 border border-highlight/20 text-highlight text-[10px] font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> Mission d'Analyse
              </div>

              <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-6">
                10 personnes. 3 variables. <span className="text-highlight italic underline decoration-highlight/30">Zéro étiquette.</span>
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-secondary border border-line/60 flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft">Variable A</span>
                  <span className="font-serif text-lg text-ink font-medium">Sport (h/sem)</span>
                </div>
                <div className="p-4 rounded-2xl bg-secondary border border-line/60 flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft">Variable B</span>
                  <span className="font-serif text-lg text-ink font-medium">Écrans (h/j)</span>
                </div>
                <div className="p-4 rounded-2xl bg-secondary border border-line/60 flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft">Variable C</span>
                  <span className="font-serif text-lg text-ink font-medium">Stress (1-10)</span>
                </div>
              </div>

              <p className="text-lg md:text-xl text-ink-soft leading-relaxed max-w-4xl italic">
                "Notre but : laisser l'algorithme découvrir <span className="text-ink font-semibold">{goalGroups} profils naturels</span> de manière totalement autonome."
              </p>
            </div>
          </div>
        </div>

        {/* Approach selector + explanation */}
        {!hasStarted ? (
          <div className="flex flex-col gap-8 mt-4">
            <div className="p-6 md:p-8 rounded-2xl bg-card border border-line shadow-soft max-w-4xl mx-auto w-full">
              <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft text-center mb-2">Les données brutes</div>
              <div className="font-serif text-2xl md:text-3xl text-center mb-8">10 personnes à analyser</div>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-secondary text-ink-soft">
                    <tr>
                      <th className="text-left font-normal py-3 px-4">Nom</th>
                      <th className="text-right font-normal py-3 px-4">Sport (h/sem)</th>
                      <th className="text-right font-normal py-3 px-4">Réseaux (h/j)</th>
                      <th className="text-right font-normal py-3 px-4">Stress (1-10)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PEOPLE.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`border-t border-line transition-colors hover:bg-highlight/5 ${i % 2 === 1 ? "bg-paper" : ""
                          }`}
                      >
                        <td className="py-3 px-4 font-medium text-ink flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-line text-ink text-xs font-semibold">
                            {p.initial}
                          </span>
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{p.sport}</td>
                        <td className="py-3 px-4 text-right font-mono">{p.social}</td>
                        <td className="py-3 px-4 text-right font-mono">{p.stress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-ink text-paper font-medium transition hover:opacity-90 shadow-lg hover:-translate-y-0.5"
                >
                  Lancer l'analyse <Play className="w-4 h-4 fill-current" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 grid md:grid-cols-2 gap-3">
              <button
                onClick={() => switchMode("agglo")}
                className={`text-left p-5 rounded-2xl border transition ${mode === "agglo"
                  ? "bg-card border-ink shadow-soft"
                  : "bg-background border-line hover:border-ink/30"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-4 h-4 text-highlight" strokeWidth={2} />
                  <span className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">Approche 1</span>
                </div>
                <div className="font-serif text-lg mb-1">Agglomérative — De bas en haut</div>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Chaque personne commence seule dans son propre groupe. À chaque étape, on{" "}
                  <span className="text-ink">fusionne les deux groupes les plus proches</span>. On
                  s'arrête quand on a atteint le bon nombre de profils.
                </p>
              </button>
              <button
                onClick={() => switchMode("divisive")}
                className={`text-left p-5 rounded-2xl border transition ${mode === "divisive"
                  ? "bg-card border-ink shadow-soft"
                  : "bg-background border-line hover:border-ink/30"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDown className="w-4 h-4 text-highlight" strokeWidth={2} />
                  <span className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">Approche 2</span>
                </div>
                <div className="font-serif text-lg mb-1">Divisive — De haut en bas</div>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Tout le monde commence dans <span className="text-ink">un seul grand groupe</span>. À
                  chaque étape, on identifie le membre le plus différent et on{" "}
                  <span className="text-ink">sépare le groupe en deux</span>. On continue jusqu'à
                  révéler les profils.
                </p>
              </button>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-6 gap-6">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Scatter + controls */}
                <div className="p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">
                        Visualisation
                      </div>
                      <div className="font-serif text-lg">sport × réseaux sociaux</div>
                    </div>
                    <div className="text-xs text-ink-soft">
                      {current.clusters.length} groupe{current.clusters.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] bg-paper rounded-xl border border-line overflow-hidden">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      {/* axes */}
                      <line x1="40" y1="260" x2="380" y2="260" stroke="hsl(var(--line))" strokeWidth="1" />
                      <line x1="40" y1="20" x2="40" y2="260" stroke="hsl(var(--line))" strokeWidth="1" />
                      <text x="378" y="278" textAnchor="end" className="fill-ink-soft" fontSize="9">
                        sport (h/sem) →
                      </text>
                      <text x="44" y="14" textAnchor="start" className="fill-ink-soft" fontSize="9">
                        ↑ réseaux sociaux (h/j)
                      </text>

                      {/* hulls */}
                      {current.clusters.map((c, ci) => {
                        if (c.members.length < 2) return null;
                        const pts = c.members.map((id) => PEOPLE.find((p) => p.id === id)!);
                        const cx = 40 + (pts.reduce((a, p) => a + p.sport, 0) / pts.length) * 34;
                        const cy = 260 - (pts.reduce((a, p) => a + p.social, 0) / pts.length) * 26;
                        const r =
                          Math.max(
                            ...pts.map((p) =>
                              Math.hypot(40 + p.sport * 34 - cx, 260 - p.social * 26 - cy),
                            ),
                          ) + 22;
                        const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
                        return (
                          <circle
                            key={c.id}
                            cx={cx}
                            cy={cy}
                            r={r}
                            className="transition-all duration-700"
                            style={{ fill: `hsl(var(--${color}))`, stroke: `hsl(var(--${color}))` }}
                            fillOpacity={0.12}
                            strokeOpacity={0.5}
                            strokeWidth={1}
                            strokeDasharray="3 3"
                          />
                        );
                      })}

                      {/* people */}
                      {PEOPLE.map((p) => {
                        const x = 40 + p.sport * 34;
                        const y = 260 - p.social * 26;
                        const ci = animalCluster[p.id];
                        const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
                        return (
                          <g key={p.id} className="transition-all duration-500">
                            <circle cx={x} cy={y} r="11" style={{ fill: `hsl(var(--${color}))` }} />
                            <text
                              x={x}
                              y={y + 3.5}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="600"
                              className="fill-paper"
                            >
                              {p.initial}
                            </text>
                            <text x={x} y={y + 22} textAnchor="middle" fontSize="8" className="fill-ink-soft">
                              {p.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* explanation of last event */}
                  <div className="mt-4 min-h-[72px] p-4 rounded-xl bg-secondary border border-line">
                    {!lastEvent && (
                      <p className="text-sm text-ink-soft leading-relaxed">
                        {mode === "agglo" ? (
                          <>
                            <span className="text-ink font-medium">Étape 0 :</span> chaque personne est
                            seule dans son groupe. Cliquez sur{" "}
                            <span className="text-ink">Étape suivante</span> pour fusionner la paire la
                            plus proche.
                          </>
                        ) : (
                          <>
                            <span className="text-ink font-medium">Étape 0 :</span> tout le monde est
                            regroupé. Cliquez sur <span className="text-ink">Étape suivante</span> pour
                            séparer le groupe le moins homogène.
                          </>
                        )}
                      </p>
                    )}
                    {lastEvent && lastEvent.kind === "merge" && (
                      <div className="text-sm text-ink-soft leading-relaxed">
                        <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-highlight" strokeWidth={2} />
                          Étape {lastEvent.step}
                        </span>
                        <span className="mx-2">·</span>
                        Fusion de{" "}
                        <span className="inline-flex flex-wrap gap-0.5 mx-1">
                          {lastEvent.a.members.map((m) => (
                            <MemberBadge key={m} id={m} colorIdx={animalCluster[m]} />
                          ))}
                        </span>
                        {" "}avec{" "}
                        <span className="inline-flex flex-wrap gap-0.5 mx-1">
                          {lastEvent.b.members.map((m) => (
                            <MemberBadge key={m} id={m} colorIdx={animalCluster[m]} />
                          ))}
                        </span>
                        {" "}— distance{" "}
                        <span className="font-mono text-ink font-medium">{lastEvent.distance.toFixed(2)}</span>
                      </div>
                    )}
                    {lastEvent && lastEvent.kind === "split" && (
                      <div className="text-sm text-ink-soft leading-relaxed">
                        <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-highlight" strokeWidth={2} />
                          Étape {lastEvent.step}
                        </span>
                        <span className="mx-2">·</span>
                        Séparation : d'un côté{" "}
                        <span className="inline-flex flex-wrap gap-0.5 mx-1">
                          {lastEvent.a.members.map((m) => (
                            <MemberBadge key={m} id={m} colorIdx={animalCluster[m]} />
                          ))}
                        </span>
                        , de l'autre{" "}
                        <span className="inline-flex flex-wrap gap-0.5 mx-1">
                          {lastEvent.b.members.map((m) => (
                            <MemberBadge key={m} id={m} colorIdx={animalCluster[m]} />
                          ))}
                        </span>
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
                      {isDone ? "Terminé" : "Étape suivante"}
                      {!isDone && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                    </button>
                    <button
                      onClick={() => setStep(0)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line text-ink-soft hover:text-ink hover:border-ink/30 transition text-sm"
                    >
                      <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
                      Recommencer
                    </button>
                  </div>

                  {/* progress dots */}
                  <div className="mt-4 flex gap-1.5">
                    {history.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-ink" : "bg-line"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Dendrogramme */}
                <div className="p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">
                        L'arbre hiérarchique
                      </div>
                      <div className="font-serif text-lg">Dendrogramme</div>
                    </div>
                    <div className="text-xs text-ink-soft hidden sm:block">
                      hauteur = distance entre groupes fusionnés
                    </div>
                  </div>
                  <div className="bg-paper rounded-xl border border-line overflow-hidden p-4">
                    <svg viewBox="0 0 410 280" className="w-full h-auto">
                      {/* baseline */}
                      <line
                        x1="20"
                        y1={dendro.baseY}
                        x2="400"
                        y2={dendro.baseY}
                        stroke="hsl(var(--line))"
                        strokeWidth="1"
                      />

                      {/* links */}
                      {dendro.links.map((l, i) => (
                        <path
                          key={i}
                          d={`M ${l.x1} ${l.y1} L ${l.x1} ${l.yTop} L ${l.x2} ${l.yTop} L ${l.x2} ${l.y2}`}
                          fill="none"
                          stroke={l.isLast ? "hsl(var(--highlight))" : "hsl(var(--ink))"}
                          strokeWidth={l.isLast ? 2 : 1.2}
                          strokeOpacity={l.isLast ? 1 : 0.55}
                          className="transition-all duration-500"
                        />
                      ))}

                      {/* leaves */}
                      {LEAF_ORDER.map((id) => {
                        const p = PEOPLE.find((x) => x.id === id)!;
                        const x = dendro.xOf(id);
                        const ci = animalCluster[id];
                        const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
                        return (
                          <g key={id}>
                            <circle
                              cx={x}
                              cy={dendro.baseY}
                              r="9"
                              className="transition-all duration-500"
                              style={{ fill: `hsl(var(--${color}))` }}
                            />
                            <text
                              x={x}
                              y={dendro.baseY + 3.5}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="600"
                              className="fill-paper"
                            >
                              {p.initial}
                            </text>
                            <text
                              x={x}
                              y={dendro.baseY + 24}
                              textAnchor="middle"
                              fontSize="8"
                              className="fill-ink-soft"
                            >
                              {p.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="mt-3 text-xs text-ink-soft leading-relaxed max-w-2xl">
                    <div className="text-base text-ink font-serif mb-3">Étape {step} :</div>
                    <div className="text-sm md:text-base leading-relaxed text-ink-soft">
                      {mode === "agglo" ? (
                        <>
                          Chaque barre horizontale représente une <span className="text-ink font-medium">fusion</span>. Plus la barre est <span className="text-highlight font-medium">haute</span>,
                          plus les deux groupes étaient <span className="text-ink font-medium">différents</span> au moment où on les a réunis.
                          En coupant l'arbre à une certaine hauteur, on choisit le nombre de groupes finaux.
                        </>
                      ) : (
                        <>
                          Chaque barre horizontale représente une <span className="text-ink font-medium">division</span>. L'algorithme part d'un seul grand groupe (en haut) et sépare la partie la plus <span className="text-highlight font-medium">hétérogène</span>.
                          Plus la barre est haute, plus les sous-groupes séparés étaient différents.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final insight */}
            {isDone && (
              <div className="mt-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-8 md:p-10 rounded-3xl bg-ink text-paper shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-highlight" />
                  </div>
                  
                  
                  <p className="font-serif text-2xl md:text-4xl leading-tight relative z-10">
                    Sans aucune étiquette, l'algorithme a redécouvert trois profils de vie : les{" "}
                    <span className="text-highlight italic underline decoration-highlight/30 underline-offset-8">sportifs sereins</span>, les{" "}
                    <span className="text-highlight italic underline decoration-highlight/30 underline-offset-8">accros aux écrans stressés</span>, et un groupe{" "}
                    <span className="text-highlight italic underline decoration-highlight/30 underline-offset-8">intermédiaire</span>uniquement à partir des
                    chiffres.
                  </p>
                </div>

                <div className="p-8 md:p-10 rounded-3xl bg-highlight/5 border border-highlight/20 text-ink shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-highlight text-paper shadow-lg">
                      <Target className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl">Décision & Plan d'Action</h2>
                  </div>
                  <p className="text-lg md:text-xl text-ink-soft mb-10 max-w-4xl leading-relaxed">
                    Suite à cette analyse de classification (clustering), nous pouvons adapter nos décisions et stratégies pour chaque groupe identifié :
                  </p>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="p-6 md:p-8 rounded-2xl bg-card border border-line shadow-soft transition hover:border-highlight/40 group">
                      <h3 className="font-serif text-2xl text-ink mb-3 group-hover:text-highlight transition-colors">1. Les Sportifs Sereins</h3>
                      <p className="text-base text-ink-soft mb-6 leading-relaxed">Forte activité sportive, stress faible et réseaux sociaux limités.</p>
                      <div className="text-[11px] font-bold text-highlight uppercase tracking-[0.2em] mb-3">Stratégie</div>
                      <div className="p-4 rounded-xl bg-secondary border border-line/50 text-base text-ink leading-relaxed font-medium">
                        Proposer des programmes avancés, des événements physiques et des rôles d'ambassadeurs de la marque.
                      </div>
                    </div>
                    <div className="p-6 md:p-8 rounded-2xl bg-card border border-line shadow-soft transition hover:border-highlight/40 group">
                      <h3 className="font-serif text-2xl text-ink mb-3 group-hover:text-highlight transition-colors">2. Les Ultra-Connectés</h3>
                      <p className="text-base text-ink-soft mb-6 leading-relaxed">Forte présence en ligne, stress élevé, peu ou pas de sport.</p>
                      <div className="text-[11px] font-bold text-highlight uppercase tracking-[0.2em] mb-3">Stratégie</div>
                      <div className="p-4 rounded-xl bg-secondary border border-line/50 text-base text-ink leading-relaxed font-medium">
                        Cibler avec des campagnes en ligne de "digital detox", des applications de méditation ou des activités douces.
                      </div>
                    </div>
                    <div className="p-6 md:p-8 rounded-2xl bg-card border border-line shadow-soft transition hover:border-highlight/40 group">
                      <h3 className="font-serif text-2xl text-ink mb-3 group-hover:text-highlight transition-colors">3. Le Profil Équilibré</h3>
                      <p className="text-base text-ink-soft mb-6 leading-relaxed">Pratique modérée, temps d'écran moyen, stress sous contrôle.</p>
                      <div className="text-[11px] font-bold text-highlight uppercase tracking-[0.2em] mb-3">Stratégie</div>
                      <div className="p-4 rounded-xl bg-secondary border border-line/50 text-base text-ink leading-relaxed font-medium">
                        Offrir des services de maintien du bien-être, de la flexibilité et des activités sociales diversifiées.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Method explanation - only visible at step 0 */}
            {step === 0 && (
              <div className="mt-12 p-8 md:p-10 rounded-3xl bg-secondary border border-line animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-3 rounded-xl bg-background shadow-sm">
                    <Info className="w-6 h-6 text-highlight" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[13px] tracking-[0.3em] uppercase text-ink-soft mb-3 font-bold">
                      Comment l'algorithme calcule la "proximité"
                    </div>
                    <p className="text-lg md:text-xl text-ink-soft leading-relaxed max-w-5xl">
                      Chaque personne est un point dans un espace à 3 dimensions (sport, réseaux,
                      stress). La <span className="text-ink font-medium underline decoration-highlight/30 underline-offset-4">distance euclidienne</span> entre deux
                      personnes mesure à quel point elles sont différentes. L'approche{" "}
                      <span className="text-ink font-medium">agglomérative</span> rapproche les plus similaires ;
                      l'approche <span className="text-highlight font-medium italic">divisive</span> isole les plus atypiques.
                      Les deux finissent par révéler la même structure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
