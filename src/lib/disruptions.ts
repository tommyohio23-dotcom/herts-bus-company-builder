/** Repeatable fictional incidents: retrying a saved day cannot reroll them. */
export function breakdownOccurs(day:number,id:string,condition:number):boolean {
  let hash=2166136261;
  for(const c of `${day}:${id}:breakdown`)hash=Math.imul(hash^c.charCodeAt(0),16777619);
  return (hash>>>0)%1000 < Math.max(5,(100-condition)*2);
}
export const busRepairCost=(condition:number)=>1000+(100-condition)*30;
export const TRAIN_REPAIR_COST=12000;
export const RAIL_REPLACEMENT_COST=900;