import { Slider } from './ui/slider';
import { requiredBuses } from '@/lib/service-frequency';

export function ServiceFrequency({
  value,
  onChange,
  label = 'Service frequency',
  disabled = false,
  cycleMinutes = 60,
}: {
  value: number;
  onChange: (n: number) => void;
  label?: string;
  disabled?: boolean;
  cycleMinutes?: number;   // pass routeCycleMinutes(route.stops) from the parent
}) {
  const busCount = requiredBuses(value, cycleMinutes);
  const oneWay   = Math.round(cycleMinutes / 2);
  return (
    <div className="min-w-0 space-y-3 py-2">
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <span>{label}</span>
        <b>Every {value} min</b>
      </div>
      <Slider
        aria-label={label}
        min={5}
        max={Math.max(240, value)}
        step={5}
        value={[value]}
        disabled={disabled}
        onValueChange={v => {
          const n = v[0];
          if (n !== undefined) onChange(n);
        }}
      />
      <p className="text-xs text-muted-foreground">
        {oneWay}-min journey · {cycleMinutes}-min round trip →{' '}
        <strong>{busCount} bus{busCount > 1 ? 'es' : ''} needed</strong> at every {value} min
      </p>
    </div>
  );
}