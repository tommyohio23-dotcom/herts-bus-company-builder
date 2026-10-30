import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { generateApplicants } from './recruitment';
import { STAFF_ROLES } from './herts';

export const publishAdvert=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(z.object({companyId:z.string().uuid(),role:z.string(),depot:z.string().min(1),wage:z.number().min(1).max(1000),positions:z.number().int().min(1).max(500),description:z.string().max(1500)}))
  .handler(async({data,context})=>{
    if(!(data.role in STAFF_ROLES))throw new Error('Choose a valid role');
    const company=await context.supabase.from('companies').select('id,day').eq('id',data.companyId).single();
    if(company.error||!company.data)throw new Error('Company not found');
    const count=await context.supabase.from('job_adverts').select('id',{count:'exact',head:true}).eq('company_id',data.companyId);
    if(count.error)throw new Error(count.error.message);
    const seed=company.data.day+(count.count??0)*7;
    const result=await context.supabase.rpc('publish_job_advert',{p_company:data.companyId,p_role:data.role,p_depot:data.depot,p_wage:data.wage,p_positions:data.positions,p_description:data.description,p_candidates:generateApplicants(data.role,data.wage,seed,Math.max(12,Math.ceil(data.positions*1.6)))});
    if(result.error)throw new Error(result.error.message);
    return {id:result.data};
  });
export const reviewApplicant=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(z.object({applicantId:z.string().uuid(),action:z.enum(['shortlist','reject','offer'])}))
  .handler(async({data,context})=>{
    const result=await context.supabase.rpc('review_job_applicant',{p_applicant:data.applicantId,p_action:data.action});
    if(result.error)throw new Error(result.error.message);
    return {status:result.data};
  });export const hireAllQualified=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(z.object({companyId:z.string().uuid()}))
  .handler(async({data,context})=>{
    const result=await context.supabase.rpc('hire_all_qualified',{p_company:data.companyId});
    if(result.error)throw new Error(result.error.message);
    return {hired:result.data as number};
  });
