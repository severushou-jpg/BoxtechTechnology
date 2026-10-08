export const ICON_WORLD_SIZE=2.4;
export const ICON_VOLUME_DEPTH=.5;
export const ICON_HALO_SHARE=.18;
type IconVector=[number,number,number];
const clamp=(value:number,low:number,high:number)=>Math.max(low,Math.min(high,Number.isFinite(value) ? value : low));
const ICON_SEED_SALTS=[0x53a9f17b,0x68e31da4,0xb49f9c27,0x1b56c4e9,0xa17d3e5b,0x3c6ef372,0xc4ceb9fe,0x9e8b64d1] as const;
function iconHash(value:number) {
  value=(value^(value>>>16))>>>0;value=Math.imul(value,0x7feb352d)>>>0;
  value=(value^(value>>>15))>>>0;value=Math.imul(value,0x846ca68b)>>>0;
  return (((value^(value>>>16))>>>0)&0xffffff)/16777216;
}
/** Separate salts keep depth, halo membership and motion independent of the
 * launch trajectory and of each other; changing count keeps existing seeds. */
export function getParticleIconSeed(detail:ArrayLike<number>) {
  const word=(Math.floor(clamp(detail[0],0,1)*4096)|(Math.floor(clamp(detail[1],0,1)*4096)<<12))>>>0;
  return ICON_SEED_SALTS.map(salt=>iconHash(word^salt));
}

/** Give the sampled mark a shallow, filled volume and a sparse soft contour.
 * floatTime is the existing integrated float clock, already scaled by speed.
 * motionWeight fades only animation while the same source enters the morph;
 * its static sampled shape and depth never switch to a different layout. */
export function getParticleIconSource(iconPosition:ArrayLike<number>,detail:ArrayLike<number>,contact:ArrayLike<number>,fit:number,floatTime:number,amplitude:number,depth:number,motionWeight=1):IconVector {
  const r=getParticleIconSeed(detail),strength=clamp(iconPosition[2],0,1);
  const x=Number.isFinite(iconPosition[0]) ? iconPosition[0] : 0,y=Number.isFinite(iconPosition[1]) ? iconPosition[1] : 0;
  const time=Number.isFinite(floatTime) ? floatTime : 0,scale=Math.max(0,Number.isFinite(fit) ? fit : 0);
  const depthScale=clamp(depth,0,3),motion=clamp(amplitude,0,4)*clamp(motionWeight,0,1);
  const halo=r[4]>=1-ICON_HALO_SHARE;
  const spread=halo ? .018+.022*r[5] : .004+.003*(1-strength);
  const radius=Math.sqrt(r[1])*spread,angle=r[0]*Math.PI*2;
  const breathe=1+.003*motion*Math.sin(time*.4);
  const drift=(.005+.004*r[7])*motion;
  const localX=(x+Math.cos(angle)*radius)*ICON_WORLD_SIZE*breathe
    +Math.sin(time*.67+r[2]*Math.PI*2+y*5)*drift+Math.sin(time*.38)*.010*motion;
  const localY=(y+Math.sin(angle)*radius)*ICON_WORLD_SIZE*breathe
    +Math.cos(time*.57+r[3]*Math.PI*2+x*5)*drift+Math.sin(time*.46)*.014*motion;
  // Sum three independent uniforms for a filled, center-weighted depth
  // distribution. The small camber avoids parallel extruded silhouette sheets.
  const localZ=((r[2]+r[3]+r[6]-1.5)/1.5*ICON_VOLUME_DEPTH
    +.06*Math.sin(x*7+y*4)+.025*Math.cos(y*8)
    +Math.sin(time*.49+r[6]*Math.PI*2)*.020*motion+Math.sin(time*.31)*.018*motion)*depthScale;
  return [contact[0]+localX*scale,contact[1]+localY*scale,contact[2]+localZ*scale];
}

export const PARTICLE_ICON_GLSL=`
float particleIconHash(uint value) {
  value^=value>>16u;value*=0x7feb352du;
  value^=value>>15u;value*=0x846ca68bu;
  return float((value^(value>>16u))&0x00ffffffu)/16777216.0;
}
vec3 particleIconSource(vec3 iconPosition,vec3 detail,vec3 contact,float fit,float floatTime,float amplitude,float depth,float motionWeight) {
  uint word=uint(clamp(detail.x,0.0,1.0)*4096.0)|(uint(clamp(detail.y,0.0,1.0)*4096.0)<<12u);
  float r0=particleIconHash(word^0x53a9f17bu),r1=particleIconHash(word^0x68e31da4u);
  float r2=particleIconHash(word^0xb49f9c27u),r3=particleIconHash(word^0x1b56c4e9u);
  float r4=particleIconHash(word^0xa17d3e5bu),r5=particleIconHash(word^0x3c6ef372u);
  float r6=particleIconHash(word^0xc4ceb9feu),r7=particleIconHash(word^0x9e8b64d1u);
  float motion=clamp(amplitude,0.0,4.0)*clamp(motionWeight,0.0,1.0),time=floatTime;
  float spread=r4>=${1-ICON_HALO_SHARE} ? .018+.022*r5 : .004+.003*(1.0-clamp(iconPosition.z,0.0,1.0));
  float radius=sqrt(r1)*spread,angle=r0*6.283185307179586;
  float breathe=1.0+.003*motion*sin(time*.4),drift=(.005+.004*r7)*motion;
  vec3 local;
  local.x=(iconPosition.x+cos(angle)*radius)*${ICON_WORLD_SIZE.toFixed(1)}*breathe
    +sin(time*.67+r2*6.283185307179586+iconPosition.y*5.0)*drift+sin(time*.38)*.010*motion;
  local.y=(iconPosition.y+sin(angle)*radius)*${ICON_WORLD_SIZE.toFixed(1)}*breathe
    +cos(time*.57+r3*6.283185307179586+iconPosition.x*5.0)*drift+sin(time*.46)*.014*motion;
  local.z=((r2+r3+r6-1.5)/1.5*${ICON_VOLUME_DEPTH.toFixed(1)}
    +.06*sin(iconPosition.x*7.0+iconPosition.y*4.0)+.025*cos(iconPosition.y*8.0)
    +sin(time*.49+r6*6.283185307179586)*.020*motion+sin(time*.31)*.018*motion)*clamp(depth,0.0,3.0);
  return contact+local*max(0.0,fit);
}
vec3 particleIconSource(vec3 iconPosition,vec3 detail,vec3 contact,float fit,float floatTime,float amplitude,float depth) {
  return particleIconSource(iconPosition,detail,contact,fit,floatTime,amplitude,depth,1.0);
}
`;
/** Reuse the actual favicon samples without mirroring its outline. Each
 * figure owns samples from the icon half facing its eventual destination. */
export function buildParticleIconPositions(icon:Float32Array,scene:ArrayBuffer,centerU:number) {
  const count=(scene.byteLength-16)/12,samples=icon.length/3;
  if(!Number.isSafeInteger(samples) || samples<2) throw new Error("Invalid particle icon.");
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(let i=0;i<samples;i++) {
    minX=Math.min(minX,icon[i*3]);maxX=Math.max(maxX,icon[i*3]);
    minY=Math.min(minY,icon[i*3+1]);maxY=Math.max(maxY,icon[i*3+1]);
  }
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  const halves:number[][]=[[],[]];
  for(let i=0;i<samples;i++) halves[Number(icon[i*3]>=cx)].push(i);
  if(halves.some(half=>!half.length)) throw new Error("Incomplete particle icon.");
  const view=new DataView(scene),positions=new Float32Array(count*3),cursor=[0,0];
  for(let id=0;id<count;id++) {
    const side=Number(view.getUint16(16+id*12,true)/65535>=centerU);
    const source=halves[side][cursor[side]++%halves[side].length]*3;
    positions[id*3]=icon[source]-cx;positions[id*3+1]=icon[source+1]-cy;
    positions[id*3+2]=icon[source+2];
  }
  return positions;
}
