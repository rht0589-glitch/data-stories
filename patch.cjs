const fs = require('fs');
const file = 'src/components/simulation/ClusteringSimulation.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update imports
code = code.replace(
  'import { RotateCcw, ArrowRight, Sparkles, Target, ArrowUp, ArrowDown, Info } from "lucide-react";',
  'import { RotateCcw, ArrowRight, Sparkles, Target, ArrowUp, ArrowDown, Info, Play, Pause } from "lucide-react";'
);
code = code.replace(
  'import { useMemo, useState } from "react";',
  'import { useMemo, useState, useEffect } from "react";'
);

// 2. Add isPlaying state and useEffect
code = code.replace(
  '  const [step, setStep] = useState(0);',
  `  const [step, setStep] = useState(0);\n  const [isPlaying, setIsPlaying] = useState(true);\n\n  useEffect(() => {\n    let timer: NodeJS.Timeout;\n    if (isPlaying && !isDone) {\n      timer = setTimeout(() => {\n        setStep((s) => Math.min(s + 1, history.length - 1));\n      }, 2500);\n    } else if (isDone) {\n      setIsPlaying(false);\n    }\n    return () => clearTimeout(timer);\n  }, [isPlaying, isDone, history, step]);\n`
);

// 3. Update switchMode
code = code.replace(
  '  const switchMode = (m: Mode) => {\n    setMode(m);\n    setStep(0);\n  };',
  '  const switchMode = (m: Mode) => {\n    setMode(m);\n    setStep(0);\n    setIsPlaying(true);\n  };'
);

// 4. Update Grid and Controls
const controlsTarget = `            {/* controls */}
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
            </div>`;

const controlsReplacement = `            {/* controls */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isDone}
                className={\`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition disabled:opacity-30 disabled:cursor-not-allowed \${
                  isPlaying ? "bg-ink/10 text-ink hover:bg-ink/20" : "bg-ink text-paper hover:opacity-90"
                }\`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" strokeWidth={2} /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" strokeWidth={2} /> Lecture auto
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStep((s) => Math.min(s + 1, history.length - 1));
                }}
                disabled={isDone}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-line text-ink hover:border-ink/30 font-medium text-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isDone ? "Terminé" : "Étape suivante"}
                {!isDone && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
              </button>
              <button
                onClick={() => {
                  setStep(0);
                  setIsPlaying(true);
                }}
                className="inline-flex items-center justify-center p-3 rounded-xl border border-line text-ink-soft hover:text-ink hover:border-ink/30 transition"
                title="Recommencer"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
            <div className="mt-3 text-xs text-ink-soft text-center">
              <span className="font-medium text-ink">Astuce :</span> la simulation avance automatiquement avec de petites explications.
            </div>`;

code = code.replace(controlsTarget, controlsReplacement);

// 5. Restructure Layout
code = code.replace(
  '        <div className="grid lg:grid-cols-5 gap-6">\n          {/* LEFT — scatter + controls */}\n          <div className="lg:col-span-3 p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">',
  '        <div className="grid lg:grid-cols-2 gap-6">\n          {/* LEFT COLUMN */}\n          <div className="flex flex-col gap-6">\n            {/* Visualisation + Controls */}\n            <div className="p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">'
);

code = code.replace(
  '          </div>\n\n          {/* RIGHT — table + groups */}\n          <div className="lg:col-span-2 flex flex-col gap-6">\n            {/* mini data table */}',
  '          </div>\n\n            {/* mini data table */}'
);

const oldDendrogramStart = `        {/* Dendrogramme */}
        <div className="mt-6 p-5 md:p-6 rounded-2xl bg-card border border-line shadow-soft">`;

const oldDendrogramEnd = `            En coupant l'arbre à une certaine hauteur, on choisit le nombre de groupes finaux.
          </p>
        </div>`;

// Extract Dendrogram block
let dendrogramBlock = "";
const dIndex = code.indexOf(oldDendrogramStart);
if (dIndex !== -1) {
  const dEndIndex = code.indexOf(oldDendrogramEnd, dIndex) + oldDendrogramEnd.length;
  dendrogramBlock = code.substring(dIndex, dEndIndex);
  code = code.substring(0, dIndex) + code.substring(dEndIndex);
}

// Inject RIGHT COLUMN after Table
code = code.replace(
  '              </div>\n            </div>\n\n            {/* current groups */}',
  '              </div>\n            </div>\n          </div>\n\n          {/* RIGHT COLUMN */}\n          <div className="flex flex-col gap-6">\n            ' + dendrogramBlock + '\n\n            {/* current groups */}'
);

// Fix indentation of Dendrogram block
code = code.replace(/<div className="mt-6 p-5/g, '<div className="p-5');

fs.writeFileSync(file, code);
console.log("Patched successfully!");
