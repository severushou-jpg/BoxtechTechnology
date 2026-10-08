/** Source-region selection and the single emitter between the two fingertips. */
export const CONTACT_SOURCE_CENTER_UV = [836/1672,386/941] as const;
export const CONTACT_SOURCE_RADII_UV = [60/1672,64.8/941] as const;
export const CONTACT_HUMAN_TIP_UV = [779/1672,373/941] as const;
export const CONTACT_ROBOT_TIP_UV = [908/1672,420/941] as const;
export const CONTACT_CENTER_UV = [843.5/1672,396.5/941] as const;
export const CONTACT_WORLD_DEPTH = .24;
export const CONTACT_LIGHT_GAP_FRACTION=2/3;
export const CONTACT_WHITENESS_RADIUS_SCALE=1.8;
export function getContactParticleGlow(distance:number,radius:number) {
  if(!Number.isFinite(distance) || !Number.isFinite(radius) || radius<=0)return 0;
  const t=Math.max(0,Math.min(1,distance/radius));
  return (1-t*t*(3-2*t))**1.5;
}
export function getContactParticleColor(color:readonly number[],distance:number,radius:number,whiteness:number) {
  const amount=getContactParticleGlow(distance,radius*CONTACT_WHITENESS_RADIUS_SCALE)*Math.max(0,Math.min(1,Number.isFinite(whiteness)?whiteness:0));
  const peak=Math.max(...color);
  return color.map(value=>value+(peak-value)*amount);
}
/** A soft light's diameter follows the projected distance between fingertips. */
export function getContactLightProjection(camera:{right:readonly number[];up:readonly number[];back:readonly number[];distance:number},depth:number,zoom:number,aspect:number,screenAspect:number,cssHeight:number,focal:number,referenceDistance:number) {
  const fit=Math.min(1,screenAspect/aspect)*(1.16+(1.02-1.16)*smooth(.85,1.15,screenAspect));
  const frame=fit*zoom*referenceDistance/camera.distance,z=CONTACT_WORLD_DEPTH*depth;
  const project=(uv:readonly number[])=>{
    const p=[(uv[0]*2-1)*aspect*(camera.distance-z)/focal*frame,(1-uv[1]*2)*(camera.distance-z)/focal*frame,z];
    const dot=(axis:readonly number[])=>p.reduce((sum,value,i)=>sum+value*axis[i],0);
    const distance=Math.max(.1,camera.distance-dot(camera.back));
    return [dot(camera.right)*focal/screenAspect/distance,dot(camera.up)*focal/distance];
  };
  const human=project(CONTACT_HUMAN_TIP_UV),robot=project(CONTACT_ROBOT_TIP_UV),center=project(CONTACT_CENTER_UV);
  const width=cssHeight*screenAspect;
  const gap=Math.hypot((human[0]-robot[0])*width/2,(human[1]-robot[1])*cssHeight/2);
  const diameter=gap*CONTACT_LIGHT_GAP_FRACTION;
  return {center,radiusNdc:[diameter/width,diameter/cssHeight],diameter,gap};
}
function smooth(a:number,b:number,value:number) {const t=Math.min(1,Math.max(0,(value-a)/(b-a)));return t*t*(3-2*t);}
/** Remove the old source orb's residual halo from the protected fingertip.
 * Preserve its actual points, silhouette and sampled colors. */
export function getHumanTipGlareWeight(u:number,v:number) {
  const x=(u-CONTACT_HUMAN_TIP_UV[0])*1672,y=(v-CONTACT_HUMAN_TIP_UV[1])*941;
  const sphere=Math.hypot((u-CONTACT_SOURCE_CENTER_UV[0])/CONTACT_SOURCE_RADII_UV[0],(v-CONTACT_SOURCE_CENTER_UV[1])/CONTACT_SOURCE_RADII_UV[1]);
  return (1-smooth(.96,1.04,sphere))*(1-smooth(8,18,Math.hypot(x,y)))*smooth(-5,6,x);
}
export function isContactSource(u:number,v:number) {
  const sphere=((u-CONTACT_SOURCE_CENTER_UV[0])/CONTACT_SOURCE_RADII_UV[0])**2+((v-CONTACT_SOURCE_CENTER_UV[1])/CONTACT_SOURCE_RADII_UV[1])**2;
  const finger=((u-CONTACT_HUMAN_TIP_UV[0])*1672)**2+((v-CONTACT_HUMAN_TIP_UV[1])*941)**2;
  return sphere<=1 && finger>100;
}
export const PARTICLE_CONTACT_GLSL = `
const vec2 CONTACT_SOURCE_UV=vec2(${CONTACT_SOURCE_CENTER_UV.join(",")});
const vec2 CONTACT_SOURCE_RADII=vec2(${CONTACT_SOURCE_RADII_UV.join(",")});
const vec2 CONTACT_HUMAN_TIP=vec2(${CONTACT_HUMAN_TIP_UV.join(",")});
const vec2 CONTACT_ROBOT_TIP=vec2(${CONTACT_ROBOT_TIP_UV.join(",")});
const vec2 CONTACT_CENTER_UV=vec2(${CONTACT_CENTER_UV.join(",")});
const float CONTACT_WORLD_DEPTH=${CONTACT_WORLD_DEPTH};
float contactParticleRadius(float frame,float depth,float distance,float focal,float aspect) {
  float z=CONTACT_WORLD_DEPTH*depth;
  vec2 gap=(CONTACT_ROBOT_TIP-CONTACT_HUMAN_TIP)*vec2(2.0*aspect,-2.0)*(distance-z)/focal*frame;
  return length(gap)/3.0;
}
float contactParticleGlow(vec3 p,vec3 contact,float frame,float depth,float distance,float focal,float aspect) {
  float radius=contactParticleRadius(frame,depth,distance,focal,aspect);
  return pow(1.0-smoothstep(0.0,max(.001,radius),length(p-contact)),1.5);
}
float contactParticleWhiteness(vec3 p,vec3 contact,float frame,float depth,float distance,float focal,float aspect) {
  float radius=contactParticleRadius(frame,depth,distance,focal,aspect)*${CONTACT_WHITENESS_RADIUS_SCALE.toFixed(1)};
  return pow(1.0-smoothstep(0.0,max(.001,radius),length(p-contact)),1.5);
}
float humanTipGlareWeight(vec2 uv) {
  vec2 delta=(uv-CONTACT_HUMAN_TIP)*vec2(1672.0,941.0);
  float sphere=length((uv-CONTACT_SOURCE_UV)/CONTACT_SOURCE_RADII);
  return (1.0-smoothstep(.96,1.04,sphere))*(1.0-smoothstep(8.0,18.0,length(delta)))*smoothstep(-5.0,6.0,delta.x);
}
float contactSourceMask(vec2 uv) {
  vec2 delta=(uv-CONTACT_SOURCE_UV)/CONTACT_SOURCE_RADII,finger=(uv-CONTACT_HUMAN_TIP)*vec2(1672.0,941.0);
  return (1.0-step(1.000001,dot(delta,delta)))*step(100.000001,dot(finger,finger));
}
`;
