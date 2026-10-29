import photo from '@/assets/trains/great-northern-717.jpg.asset.json';
export function TrainPhoto({model}:{model:string}) {
  if(model!=='Class 717')return <div className="flex aspect-[16/9] items-center justify-center bg-muted text-sm text-muted-foreground">{model} · Photo not yet verified</div>;
  return <figure><img src={photo.url} alt="Real Great Northern Class 717 at Palmers Green" className="aspect-[16/9] w-full object-contain bg-muted"/><figcaption className="p-2 text-xs text-muted-foreground"><a className="underline" href="https://commons.wikimedia.org/wiki/File:Great_Northern_Class_717_Desiro_City_at_Palmers_Green_June_2019.jpg" target="_blank" rel="noreferrer">Class 717 model reference · Wikimedia Commons · Photographer and licence</a></figcaption></figure>;
}