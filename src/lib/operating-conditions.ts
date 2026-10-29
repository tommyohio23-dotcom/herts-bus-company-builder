/** Fictional game conditions, repeatable for a saved day so retries cannot reroll finances. */
const CONDITIONS = [
  { label: 'Steady commuter demand', demand: 1, runningCost: 1 },
  { label: 'Wet weather · extra travel demand', demand: 1.12, runningCost: 1.08 },
  { label: 'Quieter travel day', demand: 0.84, runningCost: 0.96 },
  { label: 'Busy shopping day', demand: 1.18, runningCost: 1.04 },
  { label: 'Traffic disruption · higher running costs', demand: 0.93, runningCost: 1.14 },
  { label: 'Strong leisure demand', demand: 1.08, runningCost: 1.02 },
  { label: 'Light demand · easier running', demand: 0.89, runningCost: 0.94 },
];
export function operatingConditions(day: number) {
  const index = ((Math.max(1, Math.floor(day)) - 1) % CONDITIONS.length);
  return CONDITIONS[index] ?? CONDITIONS[0] ?? { label: 'Steady demand', demand: 1, runningCost: 1 };
}

export function routeDemand(day: number, routeId: string) {
  let hash = 2166136261;
  for (const char of `${day}:${routeId}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return operatingConditions(day).demand * (0.95 + (hash >>> 0) % 11 / 100);
}

export function reportConditions(details: unknown): string | undefined {
  if (!details || typeof details !== 'object' || !('conditions' in details)) return undefined;
  return typeof details.conditions === 'string' ? details.conditions : undefined;
}