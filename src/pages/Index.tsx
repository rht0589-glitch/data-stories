import { useEffect, useState } from "react";
import { SceneFrame } from "@/components/story/SceneFrame";
import { StoryNav } from "@/components/story/StoryNav";
import { SceneIntro } from "@/components/story/scenes/SceneIntro";
import { SceneRawData } from "@/components/story/scenes/SceneRawData";
import { SceneProblem } from "@/components/story/scenes/SceneProblem";
import { SceneClustering } from "@/components/story/scenes/SceneClustering";
import { SceneAgglomerative } from "@/components/story/scenes/SceneAgglomerative";
import { SceneDivisive } from "@/components/story/scenes/SceneDivisive";
import { SceneDendrogram } from "@/components/story/scenes/SceneDendrogram";
import { SceneApplications } from "@/components/story/scenes/SceneApplications";

const scenes = [
  { chapter: "Prologue", component: <SceneIntro /> },
  { chapter: "The Data", component: <SceneRawData /> },
  { chapter: "The Problem", component: <SceneProblem /> },
  { chapter: "The Idea", component: <SceneClustering /> },
  { chapter: "Strategy I", component: <SceneAgglomerative /> },
  { chapter: "Strategy II", component: <SceneDivisive /> },
  { chapter: "The Dendrogram", component: <SceneDendrogram /> },
  { chapter: "Epilogue", component: <SceneApplications /> },
];

const Index = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => Math.min(i + 1, scenes.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  const scene = scenes[index];

  return (
    <main className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/70 backdrop-blur-xl border-b border-line/50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-highlight animate-float-pulse" />
            <span className="font-serif text-lg text-ink">Hierarchical Clustering</span>
          </div>
          <span className="text-xs tracking-[0.25em] uppercase text-ink-soft hidden md:block">
            An interactive story
          </span>
        </div>
      </header>

      <section className="pt-24 pb-32" key={index}>
        {index === 0 ? (
          <div className="max-w-6xl mx-auto px-6 md:px-12">{scene.component}</div>
        ) : (
          <SceneFrame index={index} total={scenes.length - 1} chapter={scene.chapter}>
            {scene.component}
          </SceneFrame>
        )}
      </section>

      <StoryNav
        index={index}
        total={scenes.length}
        onPrev={prev}
        onNext={next}
        onJump={setIndex}
      />
    </main>
  );
};

export default Index;
