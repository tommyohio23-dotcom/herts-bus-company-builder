import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Route = { id: string; number: string; origin: string | null; destination: string | null };

export function DriverRouteAssign({ driverId, companyId }: { driverId: string; companyId: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeId, setRouteId] = useState<string>('none');

  useEffect(() => {
    supabase.from('routes').select('id,number,origin,destination').eq('company_id', companyId)
      .then(({ data }) => setRoutes(data ?? []));
    supabase.from('drivers').select('route_id').eq('id', driverId).single()
      .then(({ data }) => setRouteId(data?.route_id ?? 'none'));
  }, [driverId, companyId]);

  return (
    <Select value={routeId} onValueChange={async v => {
      setRouteId(v);
      await supabase.from('drivers').update({ route_id: v === 'none' ? null : v }).eq('id', driverId);
    }}>
      <SelectTrigger className="w-44 mt-2">
        <SelectValue placeholder="Assign to route" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No route</SelectItem>
        {routes.map(r => (
          <SelectItem key={r.id} value={r.id}>{r.number}: {r.origin} → {r.destination}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}