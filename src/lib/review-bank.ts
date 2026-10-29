import bank from './review-bank.json';
export type BankReview={mode:'bus'|'train';rating:number;theme:string;text:string;passenger:string};
export const REVIEW_BANK=bank as BankReview[];
/** Picks a passenger-written review matching mode and star rating; deterministic for the same seed. */
export function bankReview(mode:'bus'|'train',rating:number,seed:number):string|null{
  const list=REVIEW_BANK.filter(r=>r.mode===mode&&r.rating===rating);
  if(!list.length)return null;
  const r=list[Math.abs(seed)%list.length]!;
  return `${r.text} — ${r.passenger}`;
}
