/** Semantic boundary distances supply an independent, faint 3D fringe. */
export function buildParticleSurface(bytes: ArrayBuffer, mask: Uint8Array) {
  const width=512,height=288,count=new DataView(bytes).getUint32(8,true);
  const distance=new Float32Array(mask.length).fill(1e6);
  const nearest=new Int32Array(mask.length).fill(-1);
  for(let y=1;y<height-1;y++) for(let x=1;x<width-1;x++) {
    const i=y*width+x,inside=mask[i]>=128;
    if([i-1,i+1,i-width,i+width].some(j=>(mask[j]>=128)!==inside)) { distance[i]=0;nearest[i]=i; }
  }
  const update=(i:number,j:number,cost:number)=>{
    if(j<0 || j>=mask.length || nearest[j]<0) return;
    const d=distance[j]+cost;
    if(d<distance[i]) {distance[i]=d;nearest[i]=nearest[j];}
  };
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=y*width+x;
    if(x>0) update(i,i-1,1);
    if(y>0) {update(i,i-width,1);if(x>0)update(i,i-width-1,Math.SQRT2);if(x<width-1)update(i,i-width+1,Math.SQRT2);}
  }
  for(let y=height-1;y>=0;y--) for(let x=width-1;x>=0;x--) {
    const i=y*width+x;
    if(x<width-1)update(i,i+1,1);
    if(y<height-1) {update(i,i+width,1);if(x>0)update(i,i+width-1,Math.SQRT2);if(x<width-1)update(i,i+width+1,Math.SQRT2);}
  }
  const details=new Float32Array(count*4),subjectPrefix=new Uint32Array(count+1);
  const source=new DataView(bytes);
  for(let index=0;index<count;index++) {
    const offset=16+index*12;
    const x=Math.min(width-1,Math.floor(source.getUint16(offset,true)/65535*width));
    const y=Math.min(height-1,Math.floor(source.getUint16(offset+2,true)/65535*height));
    const i=y*width+x,edge=Math.max(0,1-distance[i]/10);
    const subject=source.getUint8(offset+11)>=128;
    subjectPrefix[index+1]=subjectPrefix[index]+Number(subject);
    const boundary=nearest[i];
    let nx=boundary>=0 ? boundary%width-x : 0,ny=boundary>=0 ? -(Math.floor(boundary/width)-y) : 0;
    if(mask[i]<128) {nx=-nx;ny=-ny;}
    const length=Math.hypot(nx,ny);
    if(length>0) {nx/=length;ny/=length;}
    const seed=Math.sin(index*12.9898+source.getUint8(offset+10)*.37)*43758.5453;
    // Bright contours, joints and the contact remain in the stable core.
    const fringe=subject && edge>.10 && source.getUint8(offset+9)<180 && seed-Math.floor(seed)<.30;
    details.set([edge,nx,ny,Number(fringe)],index*4);
  }
  return {details,subjectPrefix};
}
