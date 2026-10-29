const portraits=import.meta.glob<{default:string}>('/src/assets/applicants/portrait-*.jpg',{eager:true});
export function ApplicantPortrait({index,name,className=''}:{index:number|null;name:string;className?:string}) {
  const path=`/src/assets/applicants/portrait-${String(index??0).padStart(2,'0')}.jpg`;
  const image=portraits[path]?.default;
  return image?<img src={image} alt={`Fictional portrait of ${name}`} loading="lazy" width={240} height={240} className={`aspect-square shrink-0 rounded-md object-cover ${className}`}/>:<span className={`flex items-center justify-center bg-muted ${className}`}>{name.slice(0,1)}</span>;
}