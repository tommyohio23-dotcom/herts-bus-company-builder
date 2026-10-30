import bank from './review-bank.json';
/** companies = preset keys the review was written for (or whose routes serve every named place); places = towns the text names. */
export type BankReview = { mode: 'bus' | 'train'; rating: number; theme: string; text: string; passenger: string; companies?: string[]; places?: string[] };
export const REVIEW_BANK = bank as BankReview[];
/** Picks a passenger-written train review matching the star rating; deterministic for the same seed. */
export function bankReview(mode: 'bus' | 'train', rating: number, seed: number): string | null {
  const list = REVIEW_BANK.filter(r => r.mode === mode && r.rating === rating && !r.companies);
  if (!list.length) return null;
  const r = list[Math.abs(seed) % list.length]!;
  return `${r.text} — ${r.passenger}`;
}
