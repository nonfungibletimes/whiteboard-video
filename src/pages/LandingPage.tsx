import { Link } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  MoonStar,
  PenTool,
  Play,
  Ratio,
} from "lucide-react";

const featureCards = [
  {
    icon: PenTool,
    title: "Excalidraw-powered",
    description:
      "Beautiful, hand-drawn style diagramming tools that make your presentations feel organic and engaging.",
    iconWrap: "bg-primary-container text-on-primary-container",
    titleClass: "text-primary",
  },
  {
    icon: Camera,
    title: "Webcam PiP",
    description:
      "6 flexible layout options to show your face alongside your ideas, ensuring your team stays connected to the presenter.",
    iconWrap: "bg-secondary-container text-on-secondary-container",
    titleClass: "text-secondary",
  },
  {
    icon: Ratio,
    title: "Multiple Export Formats",
    description:
      "Ready for any platform with 16:9 Landscape for YouTube, 9:16 Portrait for mobile, and 1:1 Square for social feeds.",
    iconWrap: "bg-tertiary-container text-on-tertiary-container",
    titleClass: "text-tertiary",
  },
  {
    icon: MoonStar,
    title: "Dark/Light Mode",
    description:
      "Toggle between elegant themes to match your personal brand style or the environment of your presentation.",
    iconWrap: "bg-outline-variant text-on-surface",
    titleClass: "text-on-surface",
  },
] as const;

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "/forever",
    cta: "Get Started",
    featured: false,
    items: ["Watermarked videos", "5-minute recording limit", "Standard resolution"],
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "/mo",
    cta: "Go Pro",
    featured: true,
    items: ["No watermarks", "Unlimited recording time", "4K Export quality", "Priority support"],
  },
  {
    name: "Team",
    price: "$19",
    cadence: "/mo",
    cta: "Contact Sales",
    featured: false,
    items: ["Everything in Pro", "Collaboration tools", "Custom brand kit", "Shared asset library"],
  },
] as const;

export function LandingPage() {
  return (
    <div className="bg-surface text-on-surface">
      <nav className="fixed top-0 z-50 w-full bg-surface-container-high/60 backdrop-blur-xl shadow-xl shadow-violet-900/5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
          <Link to="/" className="font-headline text-2xl font-bold tracking-tighter">
            WhiteBoard Video
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            <a href="#features" className="border-b-2 border-violet-500 pb-1 font-headline font-bold tracking-tight text-violet-400">
              Features
            </a>
            <a href="#how-it-works" className="font-headline font-bold tracking-tight text-slate-400 transition-colors hover:text-slate-100">
              How it Works
            </a>
            <Link to="/pricing" className="font-headline font-bold tracking-tight text-slate-400 transition-colors hover:text-slate-100">
              Pricing
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <button className="font-headline font-bold tracking-tight text-slate-400 transition-colors hover:text-slate-100">
              Log In
            </button>
            <Link
              to="/studio"
              className="rounded-lg bg-primary-container px-6 py-2.5 font-headline font-bold tracking-tight text-on-primary-container transition-all duration-300 hover:opacity-80 active:scale-90"
            >
              Start Recording
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section className="hero-glow relative flex min-h-[921px] flex-col items-center justify-center overflow-hidden px-8">
          <div className="z-10 mx-auto max-w-5xl text-center">
            <h1 className="mb-6 font-headline text-5xl font-bold leading-tight tracking-tight text-on-surface md:text-7xl">
              Create Whiteboard <span className="text-secondary">Videos</span> in Minutes
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              No downloads, no accounts, just record. The fastest way to share ideas with your team through beautiful handwritten diagrams.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/studio"
                className="rounded-xl bg-primary-container px-10 py-4 font-headline text-lg font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all hover:opacity-90 active:scale-95"
              >
                Start Recording Free
              </Link>
              <button className="rounded-xl bg-transparent px-10 py-4 font-headline text-lg font-bold transition-all hover:bg-surface-container-high">
                View Demo
              </button>
            </div>
          </div>

          <div className="group relative mx-auto mt-20 w-full max-w-6xl">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container opacity-20 blur transition duration-1000 group-hover:opacity-40" />
            <div className="relative rounded-xl bg-surface-container-lowest p-2 shadow-2xl">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-white">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbIAc6ih5Z7fY8vPUNzjLari2CkLVBvHxfNpWFbTexP5QdTzoWjyiFwTT7Hy90pHHFqsZnuysA3LITlUVFwzr51y-m0Rq2rbsQxDgJ0FvyW70TP2ANa5w5h3Siq-UbWfL3SpfyVwv2dZmtwaEXFh__Xp8BxgjzgsYeFJLss4vMHG42cnInsA3oZpv4wS-6UOYt2x6KIZz1o-JqZg7KHLhyJJa2a_wPk6FE-Keke9HNdy-nK8qhxf-lmuoxGqETZ5TL0afB0DW4bAI"
                  alt="Application UI Preview"
                  className="h-full w-full object-cover grayscale-[0.2]"
                />

                <div className="absolute bottom-6 right-6 h-32 w-32 overflow-hidden rounded-full border-4 border-primary-container shadow-2xl md:h-48 md:w-48">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMIUVvsxDRPd_tvH9n0nBscBmDZVAlE5i1bYzgqbgyW3aRq9oycX0ZXHjDsNLzZ1IxgfD-qRKbOc-RDfiEmDPWUE44pzbk90L14Lrp89kqSiT5AT2m7kOImH6jhCt_j_pwvmizlHatZr_rFNj2IBaFoBD_WWmLa_Wo-RO64WO5PD32g7SDZ7d4mWpWGnM_t9H-QKP8aJunn5W5qnEPjKOFfV8eyG55xDGThZY2E-Ih8tmjSecUT62H263fnDJguEUQI0gnDc-Qty4"
                    alt="Presenter Webcam"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="absolute left-6 top-6 flex items-center space-x-2 rounded-full bg-red-500/90 px-4 py-1.5 font-headline text-sm font-bold text-white animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>REC 02:14</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-8 py-32">
          <div className="mb-20 text-center">
            <h2 className="mb-4 font-headline text-4xl font-bold md:text-5xl">Built for clarity and speed.</h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-secondary" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card group rounded-xl p-8 transition-all duration-500 hover:bg-surface-container-high"
                >
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${feature.iconWrap}`}>
                    <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className={`mb-3 font-headline text-2xl font-bold ${feature.titleClass}`}>{feature.title}</h3>
                  <p className="leading-relaxed text-on-surface-variant">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="bg-surface-container-lowest py-32">
          <div className="mx-auto max-w-7xl px-8">
            <div className="flex flex-col items-center justify-between gap-16 md:flex-row">
              <div className="md:w-1/2">
                <h2 className="mb-12 font-headline text-4xl font-bold md:text-5xl">From idea to video in seconds.</h2>
                <div className="space-y-12">
                  {[
                    {
                      n: "1",
                      title: "Draw on the infinite whiteboard canvas",
                      text: "Use intuitive tools to sketch, diagram, and illustrate your concepts without limits.",
                      color: "border-primary text-primary",
                    },
                    {
                      n: "2",
                      title: "Record with your webcam and voice",
                      text: "Sync your explanation with your drawings in real-time. Choose your preferred PiP layout.",
                      color: "border-secondary text-secondary",
                    },
                    {
                      n: "3",
                      title: "Download instantly and share anywhere",
                      text: "No rendering wait times. Your high-quality MP4 file is ready as soon as you stop recording.",
                      color: "border-primary-fixed text-primary-fixed",
                    },
                  ].map((step) => (
                    <div key={step.n} className="flex items-start space-x-6">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-headline font-bold ${step.color}`}>
                        {step.n}
                      </div>
                      <div>
                        <h4 className="mb-2 font-headline text-xl font-bold">{step.title}</h4>
                        <p className="text-on-surface-variant">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative md:w-1/2">
                <div className="aspect-square overflow-hidden rounded-xl shadow-2xl shadow-primary-container/10">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQVNzItJyBe_CIXWxzLEJoo-Y9KjiJWnb0z-EJcacHcgJiPosvKsCrSrUvnwqKzYFo5ZCgEH69l6Tbh-015Z9wuWnElKcf8hwChgGGpvnuX38WZUngUC8JVMGGmx8iUhJ43vzB68-Ex-ZYMteSxy13B7K0aoT1Ciepbam6OXkB5vEsLaXJrHHJauADk8hxkuU9FcybBL70FSSNqskoa5yg36T86MnQfpKV12h2tnlE0DyGccfqQJaewFw4r3FCPIUQUW_1ZRnaKxQ"
                    alt="Team collaborating"
                    className="h-full w-full object-cover grayscale opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent" />
                  <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-container shadow-xl">
                    <Play className="h-10 w-10 fill-on-primary-container text-on-primary-container" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-8 py-32">
          <div className="mb-20 text-center">
            <h2 className="mb-4 font-headline text-4xl font-bold md:text-5xl">Simple, transparent pricing</h2>
            <p className="text-on-surface-variant">Choose the plan that fits your recording needs.</p>
          </div>

          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card relative flex h-full flex-col rounded-xl p-8 ${
                  plan.featured ? "scale-105 shadow-2xl shadow-primary-container/10" : ""
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-container px-4 py-1 text-xs font-bold uppercase tracking-widest text-on-primary-container">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 font-headline text-2xl font-bold">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-on-surface-variant">{plan.cadence}</span>
                </div>

                <ul className="mb-10 flex-grow space-y-4">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center space-x-3 text-on-surface-variant">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-lg py-3 font-bold transition-all ${
                    plan.featured
                      ? "bg-primary-container py-4 text-lg text-on-primary-container hover:opacity-90"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-bright"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full bg-slate-950 px-8 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between space-y-8 border-t border-slate-800 pt-12 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-2 font-headline text-xl font-bold text-slate-200">WhiteBoard Video</div>
            <p className="text-sm font-body text-slate-400">2024 WhiteBoard Video. Powered by Cadegent.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Contact Us",
              "Twitter",
              "LinkedIn",
            ].map((item) => (
              <a key={item} href="#" className="text-sm font-body text-slate-500 opacity-80 transition-colors hover:text-violet-400 hover:opacity-100">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
