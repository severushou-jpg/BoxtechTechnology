/** Actual world-space snapshots, sampled at most once per display frame. */
export const PARTICLE_HISTORY_CAPACITY=18;
export const PARTICLE_HISTORY_INTERVAL=1/60;
export const PARTICLE_TRAIL_MAX_SEGMENT=1.25;
export const PARTICLE_TRAIL_MAX_PAIRS=8;
export function getParticleHistoryWeight(strength:number,age:number) {
  const amount=Number.isFinite(strength)?Math.max(0,Math.min(1,strength)):0;
  if(!amount || !Number.isFinite(age) || age<=0 || age>.5)return 0;
  const lifetime=.018+.095*Math.sqrt(amount);
  return .30*Math.pow(amount,.65)*Math.exp(-age/lifetime);
}

/** A zero-alpha sample breaks a path at birth, recycling or allocation changes. */
export function getParticleTrailSegment(older:ArrayLike<number>,newer:ArrayLike<number>,middle:ArrayLike<number>=older) {
  const distance=Math.hypot(newer[0]-older[0],newer[1]-older[1],newer[2]-older[2]);
  const valid=[older[0],older[1],older[2],older[3],newer[0],newer[1],newer[2],newer[3]].every(Number.isFinite)
    && Number.isFinite(middle[3]) && middle[3]*newer[3]>0
    && older[3]*newer[3]>0 && distance>1e-8 && distance<PARTICLE_TRAIL_MAX_SEGMENT;
  return {valid,distance,kind: newer[3]<0 ? 1 : 2};
}

export const PARTICLE_TRAIL_GLSL=`
float particleTrailWeight(float strength,float age) {
  float amount=clamp(strength,0.0,1.0);
  if(amount<=0.0 || age<0.0 || age>.5)return 0.0;
  return .30*pow(amount,.65)*exp(-age/(.018+.095*sqrt(amount)));
}
bool particleTrailSegment(vec4 older,vec4 newer) {
  float distance=length(newer.xyz-older.xyz);
  return older.w*newer.w>0.0 && distance>1e-8 && distance<${PARTICLE_TRAIL_MAX_SEGMENT.toFixed(2)};
}
`;
