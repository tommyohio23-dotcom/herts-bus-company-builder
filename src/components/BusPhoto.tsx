import { busPhoto, realModelPhoto, type PhotoCredit } from "@/lib/bus-photos";

/** Shows a real photo of the model (with credit) or falls back to an illustration. */
export function BusPhoto({ model, presetKey, credit, className = "" }: { model: string; presetKey: string | null; credit?: PhotoCredit | undefined; className?: string }) {
  const real = credit ?? realModelPhoto(model);
  return (
    <figure className={className}>
      <img src={real?.url ?? busPhoto(presetKey, model)} alt={`${model} bus`} loading="lazy" referrerPolicy="no-referrer"
        className="aspect-[16/10] w-full object-cover" />
      {real ? (
        <figcaption className="truncate bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          Photo: <a href={real.page} target="_blank" rel="noreferrer" className="underline">{real.author}</a> · {real.license} · Wikimedia Commons
        </figcaption>
      ) : (
        <figcaption className="bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Illustration</figcaption>
      )}
    </figure>
  );
}
