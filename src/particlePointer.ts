type Vector=readonly number[];
export type ParticlePointerState={offset:number[];velocity:number[]};
export type ParticlePointerInput={position:Vector;center:Vector;radius:number;strength:number;active:boolean;delta:number;subject:boolean;seed:Vector;direction?:Vector;cameraBack?:Vector;cameraDistance?:number};
export function getParticlePointerInfluence(distance:number,radius:number) {
  if(!Number.isFinite(distance)||!Number.isFinite(radius)||radius<=0)return 0;
  const t=Math.max(0,Math.min(1,distance/radius));return 1-t*t*(3-2*t);
}
/** Extend the cursor's reference-plane circle along the perspective ray.
 * Every depth has the same screen-space coverage, including an orbiting view.
 * Callers without a camera retain the original world-space sphere. */
export function getParticlePointerProjection(position:Vector,center:Vector,radius:number,cameraBack?:Vector,cameraDistance?:number) {
  const referenceRadius=Math.max(.001,radius);
  if(!cameraBack || cameraDistance===undefined || !Number.isFinite(cameraDistance)) {
    return {delta:position.map((value,i)=>value-center[i]),radius:referenceRadius};
  }
  const pointDepth=cameraDistance-position.reduce((sum,value,i)=>sum+value*cameraBack[i],0);
  const centerDepth=Math.max(.001,cameraDistance-center.reduce((sum,value,i)=>sum+value*cameraBack[i],0));
  const depthScale=Math.max(.001,pointDepth)/centerDepth;
  const delta=position.map((value,i)=>{
    const eye=cameraBack[i]*cameraDistance;
    return value-(eye+(center[i]-eye)*depthScale);
  });
  return {delta,radius:Math.max(.001,referenceRadius*depthScale)};
}
/** A soft push with a cursor-directed slide along a local spherical surface.
 * Direction is a world-space cursor movement vector of length 0–1. The field
 * has no autonomous orbit: stopping the cursor removes the tangential force.
 * Every baseline depth has its own center on the cursor ray. */
export function stepParticlePointer(state:ParticlePointerState,input:ParticlePointerInput):ParticlePointerState {
  const offset=Array.from(state.offset),velocity=Array.from(state.velocity);
  const dt=Math.max(0,Math.min(.1,Number.isFinite(input.delta)?input.delta:0))/8;
  if(dt===0)return {offset,velocity};
  const radius=Math.max(.001,input.radius),strength=Math.max(0,Math.min(3,input.strength));
  const baselineProjection=getParticlePointerProjection(input.position,input.center,radius,input.cameraBack,input.cameraDistance);
  const initialRadius=Math.hypot(...baselineProjection.delta);
  if(offset.every(value=>value===0)&&velocity.every(value=>value===0)&&(!input.active||strength<=0||initialRadius>=baselineProjection.radius))return {offset,velocity};
  const direction=Array.from(input.direction??[0,0,0],value=>Number.isFinite(value)?value:0);
  const directionLength=Math.hypot(...direction),directionScale=Math.max(1,directionLength);
  for(let i=0;i<3;i++)direction[i]/=directionScale;
  const drive=Math.min(1,directionLength),back=input.cameraBack??[0,0,1],side=input.seed[2]<.5?-1:1;
  for(let step=0;step<8;step++) {
    const actualPoint=offset.map((value,i)=>input.position[i]+value);
    const projection=getParticlePointerProjection(actualPoint,input.center,radius,input.cameraBack,input.cameraDistance);
    const local=offset.map((value,i)=>baselineProjection.delta[i]+value),localLength=Math.hypot(...local);
    const normalizedDistance=Math.max(Math.hypot(...projection.delta)/projection.radius,localLength/baselineProjection.radius);
    const influence=input.active&&strength>0?getParticlePointerInfluence(normalizedDistance,1):0;
    const feather=Math.max(0,Math.min(1,(normalizedDistance-.7)/.3));
    const fieldWeight=input.active&&strength>0?1-feather*feather*(3-2*feather):0;
    // Release a swept particle instead of letting it follow the cursor forever.
    const sweepFeather=Math.max(0,Math.min(1,(Math.hypot(...offset)/baselineProjection.radius-.6)/.9));
    const sweepWeight=1-sweepFeather*sweepFeather*(3-2*sweepFeather);
    const spring=(input.subject?9:4)*(1-fieldWeight*(.45+.4*drive*sweepWeight)),damping=input.subject?5.5:3.8;
    const normal=local.map(value=>value/Math.max(.00001,localLength));
    const localDepth=local.reduce((sum,value,i)=>sum+value*back[i],0);
    const lateral=local.map((value,i)=>value-back[i]*localDepth),lateralLength=Math.hypot(...lateral);
    const shellDepth=side*Math.sqrt(Math.max(0,baselineProjection.radius**2-lateralLength**2));
    const shell=lateral.map((value,i)=>value+back[i]*shellDepth),shellLength=Math.max(.00001,Math.hypot(...shell));
    const shellNormal=shell.map(value=>value/shellLength),shellDot=direction.reduce((sum,value,i)=>sum+value*shellNormal[i],0);
    const surfaceTangent=direction.map((value,i)=>value-shellNormal[i]*shellDot);
    // Preserve the outward pressure independently of the directional slide.
    const radialDot=surfaceTangent.reduce((sum,value,i)=>sum+value*normal[i],0);
    const tangent=surfaceTangent.map((value,i)=>value-normal[i]*radialDot);
    const pressure=baselineProjection.radius*strength*(.35+drive*3.5*sweepWeight)*influence*Math.min(1,localLength/(baselineProjection.radius*.18));
    for(let i=0;i<3;i++) {
      const force=tangent[i]*baselineProjection.radius*strength*22*influence*sweepWeight+normal[i]*pressure;
      velocity[i]+=(force-offset[i]*spring-velocity[i]*damping)*dt;
    }
    const speed=Math.max(1,Math.hypot(...velocity)/4);
    for(let i=0;i<3;i++){velocity[i]/=speed;offset[i]+=velocity[i]*dt;}
    const limit=Math.max(1,radius*2),length=Math.hypot(...offset);
    if(length>limit)for(let i=0;i<3;i++)offset[i]*=limit/length;
    if(input.cameraBack && input.cameraDistance!==undefined) {
      const back=input.cameraBack,baseDepth=input.cameraDistance-input.position.reduce((s,v,i)=>s+v*back[i],0);
      const depth=baseDepth-offset.reduce((s,v,i)=>s+v*back[i],0),floor=Math.min(.55,baseDepth);
      if(depth<floor) {const approach=Math.max(0,velocity.reduce((s,v,i)=>s+v*back[i],0));for(let i=0;i<3;i++){offset[i]-=back[i]*(floor-depth);velocity[i]-=back[i]*approach;}}
    }
  }
  return {offset,velocity};
}
/** Cursor ray intersected with a view-facing plane through the contact. */
export function getParticlePointerCenter(ndcX:number,ndcY:number,camera:{right:Vector;up:Vector;back:Vector;distance:number},contact:Vector,aspect:number,focal:number) {
  const plane=contact.reduce((sum,v,i)=>sum+v*camera.back[i],0),depth=camera.distance-plane;
  return [0,1,2].map(i=>camera.back[i]*plane+camera.right[i]*ndcX*aspect/focal*depth+camera.up[i]*ndcY/focal*depth);
}
export const PARTICLE_POINTER_GLSL=`
uniform vec3 uMouseCenter;
uniform vec3 uMouseDirection;
uniform float uMouseRadius,uMouseStrength,uMouseActive,uMotionDelta;
void particlePointerProjection(vec3 actualPoint,out vec3 delta,out float radius) {
  float pointDepth=uCameraDistance-dot(actualPoint,uCameraBack);
  float centerDepth=max(.001,uCameraDistance-dot(uMouseCenter,uCameraBack));
  float depthScale=max(.001,pointDepth)/centerDepth;
  vec3 eye=uCameraBack*uCameraDistance;
  delta=actualPoint-(eye+(uMouseCenter-eye)*depthScale);
  radius=max(.001,max(.001,uMouseRadius)*depthScale);
}
vec3 stepParticlePointer(vec3 baseline,vec3 seed,bool subject,inout vec3 offset,inout vec3 velocity) {
  float dt=clamp(uMotionDelta,0.0,.1)/8.0;
  if(dt<=0.0)return baseline+offset;
  float strength=clamp(uMouseStrength,0.0,3.0);
  vec3 baselineDelta;float baselineRadius;
  particlePointerProjection(baseline,baselineDelta,baselineRadius);
  float initialRadius=length(baselineDelta);
  if(dot(offset,offset)==0.0 && dot(velocity,velocity)==0.0 && (uMouseActive<=.5 || strength<=0.0 || initialRadius>=baselineRadius))return baseline;
  float directionLength=length(uMouseDirection),drive=min(1.0,directionLength);
  vec3 direction=uMouseDirection/max(1.0,directionLength);
  float side=seed.z<.5?-1.0:1.0;
  for(int i=0;i<8;i++) {
    vec3 delta;float projectedRadius;
    particlePointerProjection(baseline+offset,delta,projectedRadius);
    vec3 local=baselineDelta+offset;float localLength=length(local);
    float normalizedDistance=max(length(delta)/projectedRadius,localLength/baselineRadius);
    bool pointerEnabled=uMouseActive>.5 && strength>0.0;
    float influence=pointerEnabled?1.0-smoothstep(0.0,1.0,normalizedDistance):0.0;
    float fieldWeight=pointerEnabled?1.0-smoothstep(.7,1.0,normalizedDistance):0.0;
    float sweepWeight=1.0-smoothstep(.6,1.5,length(offset)/baselineRadius);
    float spring=(subject?9.0:4.0)*(1.0-fieldWeight*(.45+.4*drive*sweepWeight)),damping=subject?5.5:3.8;
    vec3 normal=local/max(.00001,localLength);
    vec3 lateral=local-uCameraBack*dot(local,uCameraBack);
    float shellDepth=side*sqrt(max(0.0,baselineRadius*baselineRadius-dot(lateral,lateral)));
    vec3 shell=lateral+uCameraBack*shellDepth,shellNormal=shell/max(.00001,length(shell));
    vec3 surfaceTangent=direction-shellNormal*dot(direction,shellNormal);
    vec3 tangent=surfaceTangent-normal*dot(surfaceTangent,normal);
    float pressure=baselineRadius*strength*(.35+drive*3.5*sweepWeight)*influence*min(1.0,localLength/(baselineRadius*.18));
    vec3 force=tangent*baselineRadius*strength*22.0*influence*sweepWeight+normal*pressure;
    velocity+=(force-offset*spring-velocity*damping)*dt;
    velocity/=max(1.0,length(velocity)/4.0);offset+=velocity*dt;
    float limit=max(1.0,uMouseRadius*2.0);offset*=min(1.0,limit/max(.00001,length(offset)));
    float baseDepth=uCameraDistance-dot(baseline,uCameraBack),depth=baseDepth-dot(offset,uCameraBack),floor=min(.55,baseDepth);
    if(depth<floor){offset-=uCameraBack*(floor-depth);velocity-=uCameraBack*max(0.0,dot(velocity,uCameraBack));}
  }
  return baseline+offset;
}
`;
