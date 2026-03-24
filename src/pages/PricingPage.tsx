import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

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

export function PricingPage() {
  return (
    <main className="min-h-screen bg-surface px-6 py-12 text-on-surface md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-bold md:text-5xl">Simple, transparent pricing</h1>
            <p className="mt-2 text-on-surface-variant">Choose the plan that fits your recording needs.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="rounded-lg bg-surface-container-high px-4 py-2 font-label text-sm font-semibold hover:bg-surface-bright">
              Back Home
            </Link>
            <Link to="/studio" className="rounded-lg bg-primary-container px-4 py-2 font-label text-sm font-semibold text-on-primary-container hover:opacity-90">
              Start Recording
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card relative flex h-full flex-col rounded-xl p-8 ${plan.featured ? "scale-105 shadow-2xl shadow-primary-container/10" : ""}`}
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
      </div>
    </main>
  );
}
