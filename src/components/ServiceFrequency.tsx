import {Slider} from './ui/slider';
import {requiredBuses} from '@/lib/service-frequency';
export function ServiceFrequency({value,onChange,label='Service frequency',disabled=false}:{value:number;onChange:(n:number)=>void;label?:string;disabled?:boolean}) {
 return <div className="min-w-0 space-y-3 py-2"><div className="flex flex-wrap justify-between gap-2 text-sm"><span>{label}</span><b>Every {value} min</b></div><Slider aria-label={label} min={5} max={Math.max(240,value)} step={5} value={[value]} disabled={disabled} onValueChange={v=>{const n=v[0];if(n!==undefined)onChange(n);}}/><p className="text-xs text-muted-foreground">{requiredBuses(value)} in-service bus{requiredBuses(value)>1?'es':''} required · 60-minute game cycle</p></div>;
}