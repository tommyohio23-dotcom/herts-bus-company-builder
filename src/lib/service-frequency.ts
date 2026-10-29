// Game assumption: each bus completes one service cycle in 60 minutes.
export const BUS_CYCLE_MINUTES = 60;
export function requiredBuses(frequency: number) {
  if (!Number.isFinite(frequency) || frequency < 5) throw new Error('Service frequency must be at least five minutes');
  return Math.max(1, Math.ceil(BUS_CYCLE_MINUTES / frequency));
}
export function assertFleetCoverage(routes: {id:string;number?:string;frequency_mins:number}[], buses:{route_id:string|null;status:string}[]) {
  for(const route of routes) {
    const count=buses.filter(b=>b.route_id===route.id&&b.status==='In service').length;
    if(count>0&&count<requiredBuses(route.frequency_mins))throw new Error(`Route ${route.number??route.id}: every ${route.frequency_mins} minutes needs ${requiredBuses(route.frequency_mins)} in-service buses; ${count} allocated. Add buses or increase the interval.`);
  }
}