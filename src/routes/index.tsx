import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BusSide } from "@/components/BusSide";
import { PRESETS } from "@/lib/herts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Herts Bus Manager — run Hertfordshire bus companies" },
      { name: "description", content: "Take charge of Arriva the Shires, Uno, Centrebus, Sullivan and more, or start your own Herts bus company." },
      { property: "og:title", content: "Herts Bus Manager" },
      { property: "og:description", content: "Fleet, roster and route management for classic Hertfordshire bus operators." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <div className="stripe-band h-2" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="blind px-3 py-1 text-xl">HERTS BUS MANAGER</span>
        <Button asChild variant="outline"><Link to="/dashboard">Sign in</Link></Button>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-20">
        <p className="font-semibold uppercase tracking-widest text-primary">Hertfordshire · est. on your terms</p>
        <h1 className="mt-2 text-6xl leading-none md:text-8xl">Run the county's buses.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Keep a full fleet and roster for the classic Herts operators — or build your own company from Stevenage to Tring. Run days, earn fares, pay drivers.
        </p>
        <Button asChild size="lg" className="mt-6"><Link to="/dashboard">Start managing</Link></Button>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-16 md:grid-cols-3">
        {PRESETS.map((p, i) => (
          <div key={p.key} className="card-raised rounded-lg bg-card p-3">
            <BusSide primary={p.primary} secondary={p.secondary} label={p.short} double={i % 2 === 0} className="w-full" />
            <p className="mt-2 font-display text-xl">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.livery}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
