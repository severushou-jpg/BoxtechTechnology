const smooth=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
function capsule(x:number,y:number,ax:number,ay:number,bx:number,by:number,radius:number) {
  const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
  return 1-smooth(radius*.7,radius,Math.hypot(x-ax-dx*t,y-ay-dy*t));
}
/** Reduce repeated limb excitation beside the emitter; retain head response. */
export function getSubjectExcitationSensitivity(u:number,v:number) {
  const x=u*1672,y=v*941;
  const arm=Math.max(capsule(x,y,291,425,635,389,73),capsule(x,y,635,389,779,373,55),capsule(x,y,908,420,1110,645,69),capsule(x,y,1110,645,1310,830,82));
  const head=1-smooth(.75,1.1,Math.hypot((x-1465)/225,(y-620)/224));return 1-.86*arm*(1-head);
}
export const PARTICLE_EXCITATION_GLSL=`
float excitationCapsule(vec2 p,vec2 a,vec2 b,float radius) {
  vec2 d=b-a;float t=clamp(dot(p-a,d)/dot(d,d),0.0,1.0);return 1.0-smoothstep(radius*.7,radius,length(p-a-d*t));
}
float subjectExcitationSensitivity(vec2 uv) {
  vec2 p=uv*vec2(1672.0,941.0);
  float arm=max(max(excitationCapsule(p,vec2(291.0,425.0),vec2(635.0,389.0),73.0),excitationCapsule(p,vec2(635.0,389.0),vec2(779.0,373.0),55.0)),max(excitationCapsule(p,vec2(908.0,420.0),vec2(1110.0,645.0),69.0),excitationCapsule(p,vec2(1110.0,645.0),vec2(1310.0,830.0),82.0)));
  float head=1.0-smoothstep(.75,1.1,length((p-vec2(1465.0,620.0))/vec2(225.0,224.0)));return 1.0-.86*arm*(1.0-head);
}
`;
