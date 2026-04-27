export const SceneIntro = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
    <div className="scene-enter">
      <p className="text-xs tracking-[0.4em] uppercase text-ink-soft mb-8">
        An interactive story
      </p>
    </div>
    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ink leading-[1.05] max-w-4xl scene-enter scene-enter-delay-1">
      Finding hidden order in <em className="text-highlight">unlabeled</em> data.
    </h1>
    <p className="mt-10 text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed scene-enter scene-enter-delay-2">
      A guided journey through hierarchical clustering — the algorithm that builds structure from chaos, one merge at a time.
    </p>
    <div className="mt-16 scene-enter scene-enter-delay-3">
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs tracking-[0.3em] uppercase text-ink-soft">Scroll to begin</span>
        <div className="w-px h-12 bg-gradient-to-b from-line to-transparent" />
      </div>
    </div>
  </div>
);
