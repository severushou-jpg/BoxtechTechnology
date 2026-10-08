export const FLOW_MIN_LIFETIME = 14;
export const FLOW_LIFETIME_RANGE = 8;
export const FLOW_PHASE_MIX = .7548776662466927;
export const FLOW_RANGE_TRANSITION_END = 1.14;
// The one-time fill is an actual one-second phase, including its smooth exit.
// Gain is a ceiling; the live peak is calibrated from the existing probes.
export const FLOW_STARTUP_DURATION = 1;
export const FLOW_STARTUP_GAIN = 144;
export const FLOW_STARTUP_SETTLE_DURATION = .20;
export const FLOW_STARTUP_FRONT_QUANTILE = .9;
export const FLOW_STARTUP_FRONT_DISTANCE = .98;
export const FLOW_STARTUP_SAMPLE_COUNT = 512;
/** Compatibility boundary for diagnostics; the path has no near/outer join. */
export const FLOW_NEAR_FIELD_END = .4;
const FLOW_STARTUP_RAMP_DURATION = .12;
const FLOW_STARTUP_DECELERATION_START = FLOW_STARTUP_DURATION-FLOW_STARTUP_SETTLE_DURATION;
const FLOW_STARTUP_DEFAULT_PEAK = 24;
const DEFAULT_LAUNCH_SPEEDS={figureSpeed:1.2,flowSpeed:.25,flowRange:1,flowSpeedBias:.5};

type Vector = [number, number, number];
export type FlowSpeeds = { figureSpeed: number; flowSpeed: number; flowRange: number; flowSpeedBias?:number };
export type ParticleFlowStartupState = {
  sampleIds:Uint32Array;
  samples:Float32Array;
  ages:Float32Array;
  peakGain:number;
  elapsed:number;
  coverage:number;
  reachedAt:number|null;
  finished:boolean;
  stopReason:"duration"|"populated"|"empty"|null;
};
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const finite = (value: number) => Number.isFinite(value) ? value : 0;
const cross = (a: Vector, b: Vector): Vector => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const normalize = (value: Vector): Vector => {
  const length = Math.hypot(...value);
  return value.map(component => component / Math.max(1e-8, length)) as Vector;
};
function smoothstep(low: number, high: number, value: number) {
  const t = clamp((value-low)/(high-low), 0, 1);
  return t*t*(3-2*t);
}
/** A short transport warmup fills the volume from its emitter. It advances
 * pending first launches as well as live points, preserving the full-cycle
 * phase distribution instead of creating a single, exhausted launch cohort.
 * No elapsed time means ordinary transport, as used by scalar diagnostics. */
export function getParticleFlowStartupBoost(releasedElapsed=Infinity,peakGain=FLOW_STARTUP_DEFAULT_PEAK) {
  if(!Number.isFinite(releasedElapsed)) return 1;
  const time=Math.max(0,releasedElapsed);
  return 1+(clamp(finite(peakGain),1,FLOW_STARTUP_GAIN)-1)*smoothstep(0,FLOW_STARTUP_RAMP_DURATION,time)
    *(1-smoothstep(FLOW_STARTUP_DECELERATION_START,FLOW_STARTUP_DURATION,time));
}
/** Exact area under the nonoverlapping smooth ramp, plateau and exit. */
function startupEnvelopeIntegral(time:number) {
  const at=clamp(time,0,FLOW_STARTUP_DURATION);
  const ramp=Math.min(at/FLOW_STARTUP_RAMP_DURATION,1);
  const enter=FLOW_STARTUP_RAMP_DURATION*(ramp**3-.5*ramp**4);
  const plateau=clamp(at-FLOW_STARTUP_RAMP_DURATION,0,FLOW_STARTUP_DECELERATION_START-FLOW_STARTUP_RAMP_DURATION);
  const fade=clamp((at-FLOW_STARTUP_DECELERATION_START)/FLOW_STARTUP_SETTLE_DURATION,0,1);
  return enter+plateau+FLOW_STARTUP_SETTLE_DURATION*(fade-fade**3+.5*fade**4);
}
function flowSeed(detail: ArrayLike<number>) {
  const a=clamp(finite(detail[0]),0,.999999),b=clamp(finite(detail[1]),0,.999999);
  return { a,b,lifetime:FLOW_MIN_LIFETIME+FLOW_LIFETIME_RANGE*b,phase:(a+FLOW_PHASE_MIX*b)%1 };
}
function flowHash(word:number) {
  word=(word^(word>>>16))>>>0;word=Math.imul(word,0x7feb352d)>>>0;
  word=(word^(word>>>15))>>>0;word=Math.imul(word,0x846ca68b)>>>0;
  return (((word^(word>>>16))>>>0)&0xffffff)/16777216;
}
function flowCurveSeed(a:number,b:number) {
  const word=(Math.floor(a*4096)|(Math.floor(b*4096)<<12))>>>0;
  // Curve orientation and strength are independent of launch phase, speed
  // and population. Integer avalanche hashing is identical in GLSL.
  return [0x68bc21eb,0x02e5be93]
    .map(salt=>flowHash(word^salt));
}
export function getParticleFlowSpeedSample(detail:ArrayLike<number>) {
  let word=(Math.floor(clamp(finite(detail[0]),0,1)*4096)|(Math.floor(clamp(finite(detail[1]),0,1)*4096)<<12))^0x9e3779b9;
  word=(word^(word>>>16))>>>0;word=Math.imul(word,0x7feb352d)>>>0;
  word=(word^(word>>>15))>>>0;word=Math.imul(word,0x846ca68b)>>>0;
  return (((word^(word>>>16))>>>0)&0xffffff)/16777216;
}
/** Bias is the actual fraction in the upper half of the speed interval. */
export function getParticleFlowSpeed(detail:ArrayLike<number>,figureSpeed:number,bias=.5) {
  const r=getParticleFlowSpeedSample(detail),share=clamp(finite(bias),0,1);
  const speed=r<share ? .725+.475*r/Math.max(.000001,share) : .25+.475*(r-share)/Math.max(.000001,1-share);
  return speed*clamp(finite(figureSpeed),0,2)/1.2;
}
let launchDelayTable:Float32Array|undefined;
function launchSpan(a:number,speeds:FlowSpeeds) {
  const figure=Math.max(.1,clamp(finite(speeds.figureSpeed),0,2)),flow=Math.max(.05,clamp(finite(speeds.flowSpeed),0,2));
  const low=Math.log(.025),high=Math.log(20);
  if(!launchDelayTable) {
    launchDelayTable=new Float32Array(65*65);
    for(let i=0;i<=64;i++) for(let k=0;k<=64;k++) {
      const endpoint=1.15+.2*i/64,ratio=Math.exp(low+(high-low)*k/64);
      let integral=0;
      for(let j=0;j<64;j++) {
        const age=(j+.5)/64;
        const blend=smoothstep(1,FLOW_RANGE_TRANSITION_END,endpoint*age*(2-age));
        integral+=1/(1+(ratio-1)*blend)/64;
      }
      launchDelayTable[i*65+k]=integral;
    }
  }
  const x=a*64,y=clamp((Math.log(flow/figure)-low)/(high-low)*64,0,64);
  const i=Math.floor(x),k=Math.floor(y),tx=x-i,ty=y-k;
  const row=(v:number)=>launchDelayTable![v*65+k]*(1-ty)+launchDelayTable![v*65+Math.min(64,k+1)]*ty;
  return row(i)*(1-tx)+row(Math.min(64,i+1))*tx;
}
export function getInitialParticleFlowAge(detail: ArrayLike<number>, populated=false,speeds:FlowSpeeds=DEFAULT_LAUNCH_SPEEDS) {
  const seed=flowSeed(detail);
  // Spread first launches across the predicted full passage time. A short
  // cohort launch leaves the emitter empty while slow outer points finish.
  const inner=getParticleFlowSpeed(detail,speeds.figureSpeed,speeds.flowSpeedBias??.5);
  return populated ? seed.phase : -seed.phase*launchSpan(seed.a,{...speeds,figureSpeed:inner});
}
export function buildParticleFlowAges(geometry: Float32Array, populated=false,speeds:FlowSpeeds=DEFAULT_LAUNCH_SPEEDS) {
  const ages=new Float32Array(geometry.length/6);
  for(let i=0;i<ages.length;i++) ages[i]=getInitialParticleFlowAge(geometry.subarray(i*6+3,i*6+6),populated,speeds);
  return ages;
}

/** Mirror a stratified subset of the actual drawn flow IDs. These probes use
 * the same persistent Float32 ages and per-frame gain as transform feedback;
 * they are measurements, never extra rendered points or prefilled geometry.
 * Keep the controller across count/range changes; replay alone resets it. */
export function createParticleFlowStartup(geometry:Float32Array,flowIndices:ArrayLike<number>,speeds:FlowSpeeds=DEFAULT_LAUNCH_SPEEDS,populated=false,initialAges?:ArrayLike<number>):ParticleFlowStartupState {
  const count=Math.min(FLOW_STARTUP_SAMPLE_COUNT,flowIndices.length);
  const sampleIds=new Uint32Array(count),samples=new Float32Array(count*6),ages=new Float32Array(count);
  for(let i=0;i<count;i++) {
    const id=flowIndices[Math.min(flowIndices.length-1,Math.floor((i+.5)*flowIndices.length/count))];
    if(!Number.isSafeInteger(id) || id<0 || (id+1)*6>geometry.length) throw new RangeError("Invalid startup flow sample ID.");
    sampleIds[i]=id;
    samples.set(geometry.subarray(id*6,id*6+6),i*6);
    const initial=initialAges===undefined ? getInitialParticleFlowAge(samples.subarray(i*6+3,i*6+6),populated,speeds) : initialAges[id];
    if(!Number.isFinite(initial)) throw new RangeError("Invalid initial startup flow age.");
    ages[i]=initial;
  }
  // Before the selected radius, transport has constant inner speed. Estimate
  // the normal-time arrival of the earliest fifth of the actual probes once;
  // this fills a visible front without running a high-gain loop for a second.
  const arrivals:number[]=[],range=clamp(finite(speeds.flowRange),.5,2.5);
  for(let i=0;i<count;i++) {
    const detail=samples.subarray(i*6+3,i*6+6),seed=flowSeed(detail);
    const speed=getParticleFlowSpeed(detail,speeds.figureSpeed,speeds.flowSpeedBias??.5);
    if(speed<=0)continue;
    const targetAge=1-Math.sqrt(1-FLOW_STARTUP_FRONT_DISTANCE/(1.15+.2*seed.a));
    arrivals.push(Math.max(0,targetAge-ages[i])*seed.lifetime*range/speed);
  }
  arrivals.sort((a,b)=>a-b);
  const arrival=arrivals.length ? arrivals[Math.floor((arrivals.length-1)*.2)] : FLOW_STARTUP_DEFAULT_PEAK;
  const peakGain=populated ? 1 : clamp(1+(arrival-FLOW_STARTUP_DURATION)/startupEnvelopeIntegral(FLOW_STARTUP_DURATION),1,FLOW_STARTUP_GAIN);
  return {sampleIds,samples,ages,peakGain,elapsed:0,coverage:populated ? 1 : 0,reachedAt:populated ? 0 : null,
    finished:populated || count===0,stopReason:populated ? "populated" : count===0 ? "empty" : null};
}

/** Run a fixed one-second fill. Coverage remains a measurement, never an
 * early-exit condition. The frame gain is its exact transport average, while
 * endBoost reports the actual endpoint for a one-shot speed handoff. */
export function stepParticleFlowStartup(state:ParticleFlowStartupState,delta:number,bounds:ArrayLike<number>,speeds:FlowSpeeds,currentFlowIndices?:ArrayLike<number>) {
  const enabled=clamp(finite(speeds.figureSpeed),0,2)>0 || clamp(finite(speeds.flowSpeed),0,2)>0;
  const dt=enabled ? clamp(finite(delta),0,.1) : 0;
  let elapsed=Math.min(FLOW_STARTUP_DURATION,state.elapsed+dt);
  if(FLOW_STARTUP_DURATION-elapsed<=1e-9)elapsed=FLOW_STARTUP_DURATION;
  const endBoost=state.finished ? 1 : getParticleFlowStartupBoost(elapsed,state.peakGain);
  const boost=state.finished ? 1 : dt>0 ? 1+(state.peakGain-1)*(startupEnvelopeIntegral(elapsed)-startupEnvelopeIntegral(state.elapsed))/dt : endBoost;
  if(dt===0 || state.finished) return {boost,endBoost,nextState:state,coverage:state.coverage,finished:state.finished,visible:0,front:state.coverage*FLOW_STARTUP_FRONT_DISTANCE,octants:0};
  const ages=new Float32Array(state.ages),distances:number[]=[],occupied=new Uint8Array(8);
  let activeCount=0;
  for(let i=0;i<ages.length;i++) {
    const base=state.samples.subarray(i*6,i*6+3),detail=state.samples.subarray(i*6+3,i*6+6);
    ages[i]=advanceParticleFlowAge(base,detail,ages[i],dt,bounds,speeds,Infinity,boost);
    // Allocator IDs are sorted. Filtering a changed draw allocation avoids
    // allowing a now-hidden probe to complete startup, without restarting or
    // allocating a large Set on every slider frame. TF still advances all IDs.
    if(currentFlowIndices) {
      let low=0,high=currentFlowIndices.length;
      while(low<high) {
        const middle=(low+high)>>>1;
        if(currentFlowIndices[middle]<state.sampleIds[i]) low=middle+1; else high=middle;
      }
      if(currentFlowIndices[low]!==state.sampleIds[i]) continue;
    }
    activeCount++;
    const point=getParticleFlowAtAge(base,detail,ages[i],bounds,speeds.flowRange);
    if(point.launched && point.opacity>.002) {
      distances.push(point.normalizedDistance);
      if(point.normalizedDistance>=.75) occupied[(point.position[0]>=0 ? 1 : 0)|(point.position[1]>=0 ? 2 : 0)|(point.position[2]>=0 ? 4 : 0)]=1;
    }
  }
  distances.sort((a,b)=>a-b);
  const front=distances.length ? distances[Math.floor((distances.length-1)*FLOW_STARTUP_FRONT_QUANTILE)] : 0;
  const eligible=activeCount>0 && distances.length>=Math.min(activeCount,Math.max(32,Math.min(64,Math.ceil(activeCount*.125))));
  const coverage=Math.max(state.coverage,eligible ? clamp(front/FLOW_STARTUP_FRONT_DISTANCE,0,1) : 0);
  const covered=eligible && front>=FLOW_STARTUP_FRONT_DISTANCE;
  const reachedAt=state.reachedAt ?? (covered ? elapsed : null);
  const finished=elapsed===FLOW_STARTUP_DURATION;
  const stopReason=state.stopReason ?? (finished ? "duration" : null);
  const nextState:ParticleFlowStartupState={...state,ages,elapsed,coverage,reachedAt,finished,stopReason};
  return {boost,endBoost,nextState,coverage,finished,visible:distances.length,front,octants:occupied.reduce((sum,v)=>sum+v,0)};
}

function particleFlowPath(base:ArrayLike<number>,a:number,b:number,bounds:ArrayLike<number>,range:number) {
  const extents=[0,1,2].map(i=>Math.max(.001,finite(bounds[i]))) as Vector;
  const rangeScale=clamp(finite(range),.5,2.5);
  let guide=[0,1,2].map(i=>finite(base[i])) as Vector;
  let radius=Math.hypot(...guide.map((v,i)=>v/extents[i]));
  if(radius<.0001) {
    const h=b*2-1,p=Math.sqrt(Math.max(0,1-h*h)),angle=a*Math.PI*2;
    guide=[Math.cos(angle)*p*extents[0],h*extents[1],Math.sin(angle)*p*extents[2]];
    radius=1;
  }
  const target=guide.map(v=>v/radius*(1.15+.2*a)*rangeScale) as Vector;
  const length=Math.hypot(...target),direction=normalize(target);
  const axis:Vector=Math.abs(direction[1])>.92 ? [1,0,0] : [0,1,0];
  const tangent=normalize(cross(direction,axis)),second=cross(direction,tangent);
  const random=flowCurveSeed(a,b),angle=random[0]*Math.PI*2,bend=.025+.030*random[1];
  const curve=tangent.map((v,i)=>(v*Math.cos(angle)+second[i]*Math.sin(angle))*bend) as Vector;
  return {extents,rangeScale,target,length,curve};
}
type FlowPath=ReturnType<typeof particleFlowPath>;
function particleFlowPosition(path:FlowPath,travel:number):Vector {
  // One stable guide direction and a single very gentle quadratic arc.
  // The transverse term has no oscillation or near-source steering phase;
  // its velocity turns by at most 2*atan(.055), about 6.3 degrees in total.
  return path.target.map((v,i)=>v*travel+path.length*path.curve[i]*travel*(1-travel)) as Vector;
}
function particleFlowOuterBlend(path:ReturnType<typeof particleFlowPath>,rawAge:number) {
  const age=rawAge-Math.floor(rawAge),travel=age*(2-age);
  const position=particleFlowPosition(path,travel);
  return smoothstep(1,FLOW_RANGE_TRANSITION_END,Math.hypot(...position.map((v,i)=>v/path.extents[i]))/path.rangeScale);
}

/** Shape and opacity only: transport age is persistent, never recomputed from
 * the current speed. The radius marks the start of the outer speed handoff;
 * the fade envelope extends beyond it so the handoff remains visible. */
export function getParticleFlowAtAge(base: ArrayLike<number>,detail: ArrayLike<number>,rawAge: number,bounds: ArrayLike<number>,range=1) {
  const { a,b,lifetime,phase }=flowSeed(detail);
  const path=particleFlowPath(base,a,b,bounds,range);
  const {extents,rangeScale,target,length,curve}=path;
  const launched=rawAge>=0,age=launched ? rawAge-Math.floor(rawAge) : 0;
  const travel=age*(2-age);
  const position=particleFlowPosition(path,travel);
  const derivative=target.map((v,i)=>v+length*curve[i]*(1-2*travel));
  const normalizedDistance=Math.hypot(...position.map((v,i)=>v/extents[i]))/rangeScale;
  const outerBlend=smoothstep(1,FLOW_RANGE_TRANSITION_END,normalizedDistance);
  const opacity=smoothstep(0,.012,age)*Math.pow(1-age,1.15)*(1-smoothstep(.94,.985,age));
  return { position,opacity,age,lifetime,travel,normalizedDistance,outerBlend,launched,
    launchTime:phase*launchSpan(a,DEFAULT_LAUNCH_SPEEDS)*lifetime*rangeScale,speed:launched ? Math.hypot(...derivative)*2*(1-age)/lifetime : 0 };
}

/** Midpoint advection, matching the transform-feedback shader one frame at a
 * time. A changed speed affects the next step, without jumping a live point. */
export function advanceParticleFlowAge(base: ArrayLike<number>,detail: ArrayLike<number>,age:number,delta:number,bounds:ArrayLike<number>,speeds:FlowSpeeds,releasedElapsed=Infinity,startupBoost?:number) {
  const dt=clamp(finite(delta),0,.1),range=clamp(finite(speeds.flowRange),.5,2.5);
  const figure=getParticleFlowSpeed(detail,speeds.figureSpeed,speeds.flowSpeedBias??.5),flow=clamp(finite(speeds.flowSpeed),0,2);
  const seed=flowSeed(detail),lifetime=seed.lifetime;
  // The path is invariant during this frame. Reuse its coefficients across
  // warmup substeps instead of rebuilding the full shape/opacity diagnostic.
  const path=particleFlowPath(base,seed.a,seed.b,bounds,range);
  const rate=(at:number)=>{
    const blend=at<0 ? 0 : particleFlowOuterBlend(path,at);
    return (figure+(flow-figure)*blend)/(lifetime*range);
  };
  // releasedElapsed is the start of this gated, unpaused frame. The warmup
  // changes transport continuously; it never replaces an age or position.
  const override=startupBoost===undefined ? undefined : clamp(finite(startupBoost),1,FLOW_STARTUP_GAIN);
  const steps=(override ?? getParticleFlowStartupBoost(releasedElapsed+dt*.5))>1 ? 8 : 1;
  const step=dt/steps;
  let next=age;
  for(let i=0;i<steps;i++) {
    const transport=step*(override ?? getParticleFlowStartupBoost(releasedElapsed+(i+.5)*step));
    const midpoint=next+transport*.5*rate(next);
    // A midpoint beyond the dying end must not sample the next cycle's fast
    // inner speed before this particle has actually recycled at the emitter.
    next+=transport*rate(steps>1 ? Math.min(midpoint,.999999) : midpoint);
    if(next>=1) next-=Math.floor(next);
  }
  return next;
}

/** Constant-speed compatibility helper for scalar flow diagnostics. Live
 * rendering uses getParticleFlowAtAge and advanceParticleFlowAge instead. */
export function getParticleFlow(base:ArrayLike<number>,detail:ArrayLike<number>,time:number,bounds:ArrayLike<number>,range=1) {
  const initial=getInitialParticleFlowAge(detail),lifetime=flowSeed(detail).lifetime;
  return getParticleFlowAtAge(base,detail,initial+Math.max(0,finite(time))/(lifetime*range),bounds,range);
}

/** Keep a large volume in front of the camera, with a smooth depth envelope.
 * Screen-plane extent is preserved; there is no clipped front wall. */
export function getFlowWorldPosition(local:ArrayLike<number>,contact:ArrayLike<number>,fit:number,back:ArrayLike<number>,distance:number):Vector {
  const delta=[0,1,2].map(i=>local[i]*fit) as Vector;
  const offset=delta.reduce((s,v,i)=>s+v*back[i],0);
  const centerDepth=distance-[0,1,2].reduce((s,i)=>s+contact[i]*back[i],0);
  const limit=Math.max(.5,centerDepth-.65);
  const correction=limit*Math.tanh(offset/limit)-offset;
  return delta.map((v,i)=>contact[i]+v+back[i]*correction) as Vector;
}

export const PARTICLE_FLOW_GLSL = `
float particleFlowSpeedSample(vec3 detail) {
  uint word=(uint(clamp(detail.x,0.0,1.0)*4096.0)|(uint(clamp(detail.y,0.0,1.0)*4096.0)<<12u))^0x9e3779b9u;
  word^=word>>16u;word*=0x7feb352du;word^=word>>15u;word*=0x846ca68bu;
  return float((word^(word>>16u))&0x00ffffffu)/16777216.0;
}
float particleFlowSpeed(vec3 detail,float figureSpeed,float share) {
  float r=particleFlowSpeedSample(detail);
  float speed=r<share ? .725+.475*r/max(.000001,share) : .25+.475*(r-share)/max(.000001,1.0-share);
  return speed*figureSpeed/1.2;
}
float particleFlowHash(uint word) {
  word^=word>>16u;word*=0x7feb352du;word^=word>>15u;word*=0x846ca68bu;
  return float((word^(word>>16u))&0x00ffffffu)/16777216.0;
}
struct ParticleFlowPath {
  vec3 target;float extent;vec3 curve;float rangeScale;
};
ParticleFlowPath particleFlowPath(vec3 base,vec3 detail,float rangeScale) {
  ParticleFlowPath path;
  float a=clamp(detail.x,0.0,.999999),b=clamp(detail.y,0.0,.999999);
  rangeScale=clamp(rangeScale,.5,2.5);
  vec3 guide=base;
  float radius=length(guide/NEBULA_BOUNDS);
  if(radius<.0001) {
    float height=b*2.0-1.0,planar=sqrt(max(0.0,1.0-height*height)),angle=a*GALAXY_TAU;
    guide=vec3(cos(angle)*planar,height,sin(angle)*planar)*NEBULA_BOUNDS;
    radius=1.0;
  }
  path.target=guide/radius*(1.15+.2*a)*rangeScale;
  vec3 direction=normalize(path.target);
  path.extent=length(path.target);path.rangeScale=rangeScale;
  vec3 axis=abs(direction.y)>.92 ? vec3(1.0,0.0,0.0) : vec3(0.0,1.0,0.0);
  vec3 tangent=normalize(cross(direction,axis)),second=cross(direction,tangent);
  uint word=uint(a*4096.0)|(uint(b*4096.0)<<12u);
  float angle=particleFlowHash(word^0x68bc21ebu)*GALAXY_TAU;
  float bend=.025+.030*particleFlowHash(word^0x02e5be93u);
  path.curve=(tangent*cos(angle)+second*sin(angle))*bend;
  return path;
}
vec3 particleFlowPosition(ParticleFlowPath path,float travel) {
  return path.target*travel+path.extent*path.curve*travel*(1.0-travel);
}
float particleFlowOuterBlend(ParticleFlowPath path,float rawAge) {
  if(rawAge<0.0) return 0.0;
  float age=fract(rawAge),travel=age*(2.0-age);
  vec3 position=particleFlowPosition(path,travel);
  return smoothstep(1.0,${FLOW_RANGE_TRANSITION_END},length(position/NEBULA_BOUNDS)/path.rangeScale);
}
void particleFlow(vec3 base,vec3 detail,float rawAge,float rangeScale,out vec3 position,out float opacity,out float outerBlend) {
  ParticleFlowPath path=particleFlowPath(base,detail,rangeScale);
  float age=rawAge<0.0 ? 0.0 : fract(rawAge),travel=age*(2.0-age);
  position=particleFlowPosition(path,travel);
  opacity=smoothstep(0.0,.012,age)*pow(1.0-age,1.15)*(1.0-smoothstep(.94,.985,age));
  outerBlend=smoothstep(1.0,${FLOW_RANGE_TRANSITION_END},length(position/NEBULA_BOUNDS)/path.rangeScale);
}
float particleFlowRateAtPath(ParticleFlowPath path,float age,float figureSpeed,float flowSpeed,float lifetime) {
  return mix(figureSpeed,flowSpeed,particleFlowOuterBlend(path,age))/(lifetime*path.rangeScale);
}
float particleFlowRate(vec3 base,vec3 detail,float age,float figureSpeed,float flowSpeed,float rangeScale) {
  ParticleFlowPath path=particleFlowPath(base,detail,rangeScale);
  return particleFlowRateAtPath(path,age,figureSpeed,flowSpeed,${FLOW_MIN_LIFETIME.toFixed(1)}+${FLOW_LIFETIME_RANGE.toFixed(1)}*clamp(detail.y,0.0,.999999));
}
float particleFlowStartupBoost(float releasedElapsed) {
  return 1.0+${(FLOW_STARTUP_DEFAULT_PEAK-1).toFixed(1)}*smoothstep(0.0,${FLOW_STARTUP_RAMP_DURATION},max(0.0,releasedElapsed))
    *(1.0-smoothstep(${FLOW_STARTUP_DECELERATION_START},${FLOW_STARTUP_DURATION.toFixed(1)},max(0.0,releasedElapsed)));
}
float advanceParticleFlowAge(vec3 base,vec3 detail,float age,float delta,float figureSpeed,float flowSpeed,float rangeScale,float speedBias,float releasedElapsed,float startupBoost) {
  figureSpeed=particleFlowSpeed(detail,figureSpeed,speedBias);
  ParticleFlowPath path=particleFlowPath(base,detail,rangeScale);
  float lifetime=${FLOW_MIN_LIFETIME.toFixed(1)}+${FLOW_LIFETIME_RANGE.toFixed(1)}*clamp(detail.y,0.0,.999999);
  float dt=clamp(delta,0.0,.1);
  float overrideBoost=clamp(startupBoost,1.0,${FLOW_STARTUP_GAIN.toFixed(1)});
  int steps=(startupBoost>=1.0 ? overrideBoost : particleFlowStartupBoost(releasedElapsed+dt*.5))>1.0 ? 8 : 1;
  float step=dt/float(steps),next=age;
  for(int i=0;i<8;i++) {
    if(i>=steps) break;
    float transport=step*(startupBoost>=1.0 ? overrideBoost : particleFlowStartupBoost(releasedElapsed+(float(i)+.5)*step));
    float midpoint=next+transport*.5*particleFlowRateAtPath(path,next,figureSpeed,flowSpeed,lifetime);
    next+=transport*particleFlowRateAtPath(path,steps>1 ? min(midpoint,.999999) : midpoint,figureSpeed,flowSpeed,lifetime);
    if(next>=1.0) next=fract(next);
  }
  return next;
}
vec3 flowWorldPosition(vec3 local,vec3 contact,float fit,vec3 back,float distance) {
  vec3 delta=local*fit;
  float offset=dot(delta,back),limit=max(.5,distance-dot(contact,back)-.65);
  return contact+delta+back*(limit*tanh(offset/limit)-offset);
}
`;
