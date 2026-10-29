import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { routeCycleFromNames, requiredBuses } from '@/lib/service-frequency';

export function RouteFleetStatus({ routeId, origin, via, destination, frequencyMins }: {
  routeId: string; origin: string; via: string; destination: string; frequencyMins: number;
}) {
  const [assigned, setAssigned] = useState<number | null>(null);
  const cycle  = routeCycleFromNames(origin, via, destination);
  const needed = requiredBuses(frequencyMins, cycle);

  useEffect(() => {
    supabase.from('buses').select('id', { count: 'exact' })
      .eq('route_id', routeId).eq('status', 'In service')
      .then(({ count }) => setAssigned(count ?? 0));
  }, [routeId]);

  const ok = assigned !== null && assigned >= needed;
  return (
    <p className="text-xs mt-1">
      Every {frequencyMins} min on a {cycle}-min loop →{' '}
      <strong>{needed} buses needed</strong>
      {assigned !== null && (
        <span className={ok ? ' text-green-600' : ' text-red-500'}>
          {' '}· {assigned} assigned{!ok && ` ⚠`}
        </span>
      )}
    </p>
  );
}