type Point = readonly [number, number, number];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const FREE_SCATTER_FRACTION = .26;
function launchHash(value:number) {
  value=(value^(value>>>16))>>>0;value=Math.imul(value,0x7feb352d)>>>0;
  value=(value^(value>>>15))>>>0;value=Math.imul(value,0x846ca68b)>>>0;
  return ((value^(value>>>16))>>>0)&0xffffff;
}
export function getParticleLaunchSeed(seed:Point):Point {
  const word=(Math.floor(clamp(seed[0])*4096)|(Math.floor(clamp(seed[1])*4096)<<12))>>>0;
  return [launchHash(word^0xa511e9b3)/16777216,launchHash(word^0x63d83595)/16777216,launchHash(word^0xb5297a4d)/16777216];
}
export function getSceneMorph(progress: number, seed: number) {
  const stagger = clamp(seed) * .15;
  return clamp((progress - stagger) / .85);
}

function getParticleLaunchVectors(seed: Point) {
  const random=getParticleLaunchSeed(seed);
  const phase=random[0]*Math.PI*2,height=random[1]*2-1;
  const planar=Math.sqrt(Math.max(0,1-height*height));
  const direction:Point=[Math.cos(phase)*planar,height,Math.sin(phase)*planar];
  // A broad radius distribution fills the interior instead of drawing a shell.
  const radius=.18+2.12*Math.sqrt(random[2]);
  const launch=direction.map(v=>v*radius) as unknown as Point;
  const axis:Point=Math.abs(height)>.92 ? [1,0,0] : [0,1,0];
  const tangent=[direction[1]*axis[2]-direction[2]*axis[1],direction[2]*axis[0]-direction[0]*axis[2],direction[0]*axis[1]-direction[1]*axis[0]];
  const length=Math.hypot(...tangent);
  for(let i=0;i<3;i++) tangent[i]/=length;
  const second=[direction[1]*tangent[2]-direction[2]*tangent[1],direction[2]*tangent[0]-direction[0]*tangent[2],direction[0]*tangent[1]-direction[1]*tangent[0]];
  const word=(Math.floor(clamp(seed[0])*4096)|(Math.floor(clamp(seed[1])*4096)<<12))>>>0;
  const bendPhase=launchHash(word^0xd8163841)/16777216*Math.PI*2;
  const bend=.12+.12*launchHash(word^0xcb1ab31f)/16777216;
  const curve=tangent.map((v,i)=>(v*Math.cos(bendPhase)+second[i]*Math.sin(bendPhase))*radius*bend) as unknown as Point;
  return { launch,curve };
}

/** Target-independent XYZ scatter, then a velocity-continuous damped capture. */
export function getParticleMorphPosition(source: Point, target: Point, center: Point, seed: Point, progress: number, foreground: number,sideHint=target[0]<center[0] ? -1 : 1): Point {
  // Membership selects the destination; soft semantic weights must not leave
  // an outline point stranded halfway to its image-derived position.
  const m = getSceneMorph(progress, seed[0]) * (foreground >= .5 ? 1 : 0);
  if (m === 0) return [source[0],source[1],source[2]];
  if (m === 1) return [target[0],target[1],target[2]];
  // Retain the positional API argument for callers; launch has no side gate.
  void sideHint;
  const { launch,curve }=getParticleLaunchVectors(seed);
  if(m<=FREE_SCATTER_FRACTION) {
    const t=m/FREE_SCATTER_FRACTION;
    return source.map((v,i)=>v+launch[i]*t+curve[i]*t*t) as unknown as Point;
  }
  const q=(m-FREE_SCATTER_FRACTION)/(1-FREE_SCATTER_FRACTION);
  const t=clamp((q-.65)/.35), decay=Math.exp(-5*q)*(1-t*t*(3-2*t));
  return target.map((v,i)=>{
    const displacement=source[i]+launch[i]+curve[i]-v;
    const velocity=(launch[i]+2*curve[i])*(1-FREE_SCATTER_FRACTION)/FREE_SCATTER_FRACTION;
    return v+(displacement+(velocity+5*displacement)*q)*decay;
  }) as unknown as Point;
}

export const PARTICLE_MORPH_GLSL = `
uint launchHash(uint value) {
  value^=value>>16u;value*=0x7feb352du;
  value^=value>>15u;value*=0x846ca68bu;
  return (value^(value>>16u))&0x00ffffffu;
}
vec3 particleLaunchSeed(vec3 seed) {
  uint word=uint(clamp(seed.x,0.0,1.0)*4096.0)|(uint(clamp(seed.y,0.0,1.0)*4096.0)<<12u);
  return vec3(float(launchHash(word^0xa511e9b3u)),float(launchHash(word^0x63d83595u)),float(launchHash(word^0xb5297a4du)))/16777216.0;
}
float sceneMorph(float progress, float seed) {
  float stagger = clamp(seed, 0.0, 1.0) * .15;
  return clamp((progress-stagger)/.85,0.0,1.0);
}
vec3 particleMorphPosition(vec3 source, vec3 target, vec3 center, vec3 seed, float morph,float side) {
  if(morph<=0.0) return source;
  if(morph>=1.0) return target;
  vec3 launchSeed=particleLaunchSeed(seed);
  float phase=launchSeed.x*GALAXY_TAU,height=launchSeed.y*2.0-1.0;
  float planar=sqrt(max(0.0,1.0-height*height));
  vec3 direction=vec3(cos(phase)*planar,height,sin(phase)*planar);
  float radius=.18+2.12*sqrt(launchSeed.z);
  vec3 launch=direction*radius;
  vec3 axis=abs(height)>.92 ? vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0);
  vec3 tangent=normalize(cross(direction,axis)),second=cross(direction,tangent);
  uint word=uint(clamp(seed.x,0.0,1.0)*4096.0)|(uint(clamp(seed.y,0.0,1.0)*4096.0)<<12u);
  float bendPhase=float(launchHash(word^0xd8163841u))/16777216.0*GALAXY_TAU;
  float bend=.12+.12*float(launchHash(word^0xcb1ab31fu))/16777216.0;
  vec3 curve=(tangent*cos(bendPhase)+second*sin(bendPhase))*radius*bend;
  const float freeScatter=${FREE_SCATTER_FRACTION};
  if(morph<=freeScatter) {
    float t=morph/freeScatter;
    return source+launch*t+curve*t*t;
  }
  float q=(morph-freeScatter)/(1.0-freeScatter);
  vec3 displacement=source+launch+curve-target;
  vec3 velocity=(launch+2.0*curve)*(1.0-freeScatter)/freeScatter;
  float decay=exp(-5.0*q)*(1.0-smoothstep(.65,1.0,q));
  return target+(displacement+(velocity+5.0*displacement)*q)*decay;
}
// The same low-frequency displacement carries both shapes through one field.
vec3 sharedFieldDrift(vec3 p, vec3 center, float time, float amplitude) {
  vec3 q = p - center;
  return vec3(sin(time*.23 + q.z*.48), cos(time*.19 + q.x*.36),
    sin(time*.17 + q.x*.31 + q.y*.27)) * .012 * amplitude;
}
`;
