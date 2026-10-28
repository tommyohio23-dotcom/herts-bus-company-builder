import { realBusPhoto, type PhotoCredit } from "@/lib/bus-photos";

/** Real photo with credit; shows a plain "no photo" panel when none exists. */
export function BusPhoto({ model, presetKey, credit, className = "" }: { model: string; presetKey: string | null; credit?: PhotoCredit | undefined; className?: string }) {
  const real = credit ?? realBusPhoto(presetKey, model);
  return (
    <figure className={className}>
      {real ? (
        <img src={real.url} alt={`${model} bus`} loading="lazy" referrerPolicy="no-referrer" className="aspect-[16/10] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-muted text-sm text-muted-foreground">No photo yet</div>
      )}
      {real && (
        <figcaption className="truncate bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          Photo: <a href={real.page} target="_blank" rel="noreferrer" className="underline">{real.author}</a> · {real.license} · Wikimedia Commons
        </figcaption>
      )}
    </figure>
  );
}
