import {z} from 'zod';
export const analysisSchema=z.object({summary:z.string(),complaints:z.array(z.object({theme:z.string(),reviewIds:z.array(z.string()),evidence:z.string()})),improvements:z.array(z.object({priority:z.string(),action:z.string(),reason:z.string(),measure:z.string()})),limitations:z.string()});
export type ReviewAnalysis=z.infer<typeof analysisSchema>;
export type AnalysisReview={id:string;day:number;rating:number;comment:string};
export function selectAnalysisReviews(reviews:AnalysisReview[],ids:string[]) {
 const unique=[...new Set(ids)];
 if(!unique.length||unique.length>50)throw new Error('Select between one and 50 reviews');
 const selected=unique.map(id=>reviews.find(r=>r.id===id));
 if(selected.some(r=>!r))throw new Error('A selected review does not belong to this route or is no longer available');
 return selected.filter((r):r is AnalysisReview=>r!==undefined);
}
export function normalizeAnalysis(result:ReviewAnalysis,ids:string[]):ReviewAnalysis {
 const allowed=new Set(ids);
 return {...result,complaints:result.complaints.slice(0,6).map(c=>({...c,reviewIds:[...new Set(c.reviewIds)].filter(id=>allowed.has(id))})).filter(c=>c.reviewIds.length>=2),improvements:result.improvements.slice(0,6)};
}