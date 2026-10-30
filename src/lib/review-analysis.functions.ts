import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {selectAnalysisReviews,type AnalysisReview} from './review-analysis';
import type {RailState} from './rail';
import {requiredBuses,timetableCycle} from './service-frequency';
export const analyzePassengerReviews=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({companyId:z.string().uuid(),routeId:z.string().min(1),reviewIds:z.array(z.string()).min(1).max(50)})).handler(async({data,context})=>{
 const db=context.supabase;
 const company=await db.from('companies').select('id,transport_mode').eq('id',data.companyId).single();if(company.error||!company.data)throw new Error('Company not found');
 const blocked=await db.from('review_ai_access').select('*').eq('user_id',context.userId).maybeSingle();if(blocked.error)throw new Error('AI access status could not load');if(blocked.data)return {ok:false as const,error:blocked.data.message,status:blocked.data.blocked_status};
 let route:unknown,reviews:AnalysisReview[];
 if(company.data.transport_mode==='train'){
  const game=await db.from('rail_games').select('state').eq('company_id',data.companyId).single();if(game.error||!game.data)throw new Error('Rail company not found');const state=game.data.state as unknown as RailState;const service=state.services.find(s=>s.id===data.routeId);if(!service)throw new Error('Rail service not found');
  if(state.services.filter(s=>s.name===service.name).length>1)throw new Error('Give rail services unique names before analyzing their historical reviews');
  route={mode:'rail',name:service.name,calls:service.calls,fare:service.fare,turnaroundMinutes:service.returnMinutes,train:state.trains.filter(t=>t.id===service.trainId).map(t=>({model:t.model,condition:t.condition,features:t.features,status:t.status})),driverAssigned:state.staff.some(s=>s.id===service.driverId)};
  reviews=state.reviews.map((r,i)=>({...r,id:`rail-${i}`})).filter(r=>r.service===service.name);
 }else{
  const r=await db.from('routes').select('*').eq('id',data.routeId).eq('company_id',data.companyId).single();if(r.error||!r.data)throw new Error('Route not found');
  const duplicates=await db.from('routes').select('id').eq('company_id',data.companyId).eq('number',r.data.number);if((duplicates.data?.length??0)>1)throw new Error('Give bus routes unique numbers before analyzing their historical reviews');
  const [feedback,fleet]=await Promise.all([db.from('passenger_reviews').select('id,day,rating,comment').eq('company_id',data.companyId).eq('route_number',r.data.number).order('day',{ascending:false}).limit(100),db.from('buses').select('model,condition,features,status').eq('company_id',data.companyId).eq('route_id',data.routeId)]);if(feedback.error||fleet.error)throw new Error('Route feedback could not load');reviews=feedback.data??[];route={mode:'bus',number:r.data.number,origin:r.data.origin,destination:r.data.destination,frequencyMinutes:r.data.frequency_mins,requiredBuses:requiredBuses(r.data.frequency_mins,timetableCycle(r.data)),fare:Number(r.data.fare),fleet:fleet.data};
 }
 const selected=selectAnalysisReviews(reviews,data.reviewIds);const key=process.env['LOVABLE_API_KEY'];if(!key)return {ok:false as const,error:'Lovable AI is not configured.',status:401};
 const {generateReviewAnalysis}=await import('./ai/review-analysis.server');const result=await generateReviewAnalysis(key,route,selected);
 if(!result.ok&&(result.status===402||result.status===403)) {const {supabaseAdmin}=await import('@/integrations/supabase/client.server');await supabaseAdmin.from('review_ai_access').upsert({user_id:context.userId,blocked_status:result.status,message:result.error});}
 return result;
});