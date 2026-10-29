import {it,expect} from 'vitest';
import {selectAnalysisReviews,normalizeAnalysis} from './review-analysis';
const reviews=[{id:'a',day:1,rating:1,comment:'Late'},{id:'b',day:2,rating:2,comment:'Late again'}];
it('only analyzes selected reviews from the chosen route',()=>{expect(selectAnalysisReviews(reviews,['b']).map(r=>r.id)).toEqual(['b']);expect(()=>selectAnalysisReviews(reviews,['foreign'])).toThrow();});
it('requires two distinct selected reviews for a recurring complaint',()=>expect(normalizeAnalysis({summary:'',complaints:[{theme:'Late',reviewIds:['a','a','foreign'],evidence:''}],improvements:[],limitations:''},['a','b']).complaints).toEqual([]));
it('retains supported recurring complaint evidence',()=>expect(normalizeAnalysis({summary:'',complaints:[{theme:'Late',reviewIds:['a','b'],evidence:'Two reports'}],improvements:[],limitations:''},['a','b']).complaints[0]?.reviewIds).toEqual(['a','b']));