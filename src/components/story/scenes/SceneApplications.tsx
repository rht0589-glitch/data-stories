import { Lightbulb, Users, Stethoscope, Activity } from "lucide-react";

const apps = [
  {
    icon: Users,
    field: "Marketing",
    title: "Customer segmentation",
    desc: "Discover who your customers truly are — beyond demographics, by behavior they share.",
  },
  {
    icon: Stethoscope,
    field: "Healthcare",
    title: "Patient subtyping",
    desc: "Group patients by symptom patterns to guide diagnosis and personalized treatment.",
  },
  {
    icon: Activity,
    field: "Behavior",
    title: "Pattern discovery",
    desc: "Reveal hidden routines in user activity — sessions, journeys, intent.",
  },
];

export const SceneApplications = () => (
  <div className="min-h-[70vh]">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-6 scene-enter">
        <Lightbulb className="w-3.5 h-3.5 text-ink-soft" strokeWidth={1.5} />
        <span className="text-xs tracking-wider uppercase text-ink-soft">Real-world value</span>
      </div>
      <h2 className="font-serif text-4xl md:text-6xl text-ink leading-[1.1] max-w-3xl mx-auto scene-enter scene-enter-delay-1">
        Raw data becomes <em className="text-highlight">decision-making power</em>.
      </h2>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {apps.map((a, i) => (
        <div
          key={a.title}
          className="p-8 rounded-3xl bg-card border border-line shadow-soft hover:shadow-elegant transition-all duration-500 scene-enter"
          style={{ animationDelay: `${0.2 + i * 0.15}s` }}
        >
          <a.icon className="w-6 h-6 text-ink-soft mb-6" strokeWidth={1.5} />
          <div className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">{a.field}</div>
          <h3 className="font-serif text-2xl text-ink mb-3">{a.title}</h3>
          <p className="text-ink-soft leading-relaxed text-sm">{a.desc}</p>
        </div>
      ))}
    </div>

    <div className="mt-24 text-center scene-enter scene-enter-delay-4">
      <p className="text-xs tracking-[0.4em] uppercase text-ink-soft mb-6">Fin.</p>
      <p className="font-serif text-3xl md:text-4xl text-ink max-w-2xl mx-auto leading-[1.2]">
        From a cloud of points,<br />
        <span className="text-ink-soft italic">a structure was always waiting.</span>
      </p>
    </div>
  </div>
);
