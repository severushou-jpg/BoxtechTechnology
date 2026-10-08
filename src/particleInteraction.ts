export const INTERACTION_RADIUS=.34;
export const INTERACTION_MAX_DISPLACEMENT=.20;
export const INTERACTION_INTEGRATION_STEPS=2;
export const INTERACTION_SOURCE_EDGE_FADE=.025;
export const INTERACTION_FIELD_WIDTH=256;
export const INTERACTION_FIELD_HEIGHT=144;
export type InteractionField={data:Float32Array;width:number;height:number};
type Vector=[number,number,number];
export type InteractionProjection={frame:number;depth:number;distance:number;focal:number;aspect:number};

/** Exact image-plane nearest cells; the cell's baked Z is retained separately. */
function nearestSurfaceCells(counts:Uint32Array,width:number,height:number) {
  const rows=new Int32Array(width*height).fill(-1),nearest=new Int32Array(width*height);
  for(let y=0;y<height;y++) {
    let previous=-1;
    for(let x=0;x<width;x++) {
      const i=y*width+x;if(counts[i])previous=i;rows[i]=previous;
    }
    previous=-1;
    for(let x=width-1;x>=0;x--) {
      const i=y*width+x;if(counts[i])previous=i;
      if(previous>=0 && (rows[i]<0 || previous%width-x<x-rows[i]%width))rows[i]=previous;
    }
  }
  const sites=new Int32Array(height),boundaries=new Float64Array(height+1),costs=new Float64Array(height);
  for(let x=0;x<width;x++) {
    let last=-1;
    for(let y=0;y<height;y++) {
      const site=rows[y*width+x];costs[y]=site<0 ? Infinity : (x-site%width)**2;
      if(!Number.isFinite(costs[y]))continue;
      let crossing=-Infinity;
      while(last>=0) {
        const previous=sites[last];
        crossing=(costs[y]+y*y-costs[previous]-previous*previous)/(2*(y-previous));
        if(crossing>boundaries[last])break;
        last--;
      }
      last++;sites[last]=y;boundaries[last]=last===0 ? -Infinity : crossing;boundaries[last+1]=Infinity;
    }
    let active=0;
    for(let y=0;y<height;y++) {
      while(boundaries[active+1]<y)active++;
      nearest[y*width+x]=rows[sites[active]*width+x];
    }
  }
  return nearest;
}

/** Nearest sampled subject surface, including its real baked depth. The atlas
 * supplies geometry only; it never supplies rendered image pixels. */
export function buildParticleInteractionField(bytes:ArrayBuffer,mask:Uint8Array,exclude:(u:number,v:number)=>boolean):InteractionField {
  const width=INTERACTION_FIELD_WIDTH,height=INTERACTION_FIELD_HEIGHT,size=width*height;
  const sum=new Float64Array(size),counts=new Uint32Array(size),inside=new Uint8Array(size);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const u=(x+.5)/width,v=(y+.5)/height;
    const mx=Math.min(511,Math.floor(u*512)),my=Math.min(287,Math.floor(v*288));
    inside[y*width+x]=Number(mask[my*512+mx]>=128 && !exclude(u,v));
  }
  const view=new DataView(bytes),count=(bytes.byteLength-16)/12;
  for(let id=0;id<count;id++) {
    const offset=16+id*12,u=view.getUint16(offset,true)/65535,v=view.getUint16(offset+2,true)/65535;
    const x=Math.min(width-1,Math.floor(u*width)),y=Math.min(height-1,Math.floor(v*height)),i=y*width+x;
    if(view.getUint8(offset+11)<128 || !inside[i] || exclude(u,v))continue;
    sum[i]+=view.getUint16(offset+4,true)/65535;counts[i]++;
  }
  const depth=new Float32Array(size);
  if(!counts.some(count=>count>0))throw new Error("No subject surface for particle interaction.");
  const nearest=nearestSurfaceCells(counts,width,height);
  for(let i=0;i<size;i++)if(counts[i])depth[i]=sum[i]/counts[i];
  for(let i=0;i<size;i++)if(!counts[i])depth[i]=depth[nearest[i]];
  // Smooth the depth within each occupied surface without bridging silhouettes.
  for(let pass=0;pass<2;pass++) {
    const next=new Float32Array(depth);
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++) {
      const i=y*width+x;if(!inside[i])continue;
      let total=depth[i]*4,weight=4;
      for(const j of [i-1,i+1,i-width,i+width])if(inside[j]) {total+=depth[j];weight++;}
      next[i]=total/weight;
    }
    depth.set(next);
  }
  const data=new Float32Array(size*4);
  for(let i=0;i<size;i++) {
    const n=inside[i]?i:nearest[i];
    data[i*4]=(n%width+.5)/width;data[i*4+1]=(Math.floor(n/width)+.5)/height;
    data[i*4+2]=depth[n];data[i*4+3]=inside[i];
  }
  return {data,width,height};
}

const clamp=(value:number,low:number,high:number)=>Math.min(high,Math.max(low,value));
function smooth(low:number,high:number,value:number) {const t=clamp((value-low)/(high-low),0,1);return t*t*(3-2*t);}
const length=(v:readonly number[])=>Math.hypot(...v);
const dot=(a:readonly number[],b:readonly number[])=>a.reduce((sum,value,index)=>sum+value*b[index],0);

/** CPU equivalent of the GPU's full-precision manual bilinear geometry query. */
export function sampleParticleInteractionField(field:InteractionField,u:number,v:number) {
  const x=clamp(u,0,1)*field.width-.5,y=clamp(v,0,1)*field.height-.5;
  const bx=Math.floor(x),by=Math.floor(y),fx=x-bx,fy=y-by;
  const sample=(dx:number,dy:number,channel:number)=>field.data[(clamp(by+dy,0,field.height-1)*field.width+clamp(bx+dx,0,field.width-1))*4+channel];
  return [0,1,2,3].map(channel=>
    (sample(0,0,channel)*(1-fx)+sample(1,0,channel)*fx)*(1-fy)+
    (sample(0,1,channel)*(1-fx)+sample(1,1,channel)*fx)*fy);
}
function surfaceAt(field:InteractionField,p:readonly number[],projection:InteractionProjection) {
  const {frame,depth,distance,focal,aspect}=projection;
  const ix=p[0]*focal/Math.max(.5,distance-p[2])/Math.max(.001,frame),iy=p[1]*focal/Math.max(.5,distance-p[2])/Math.max(.001,frame);
  const u=(ix/aspect+1)*.5,v=(1-iy)*.5;
  if(u<0 || v<0 || u>1 || v>1)return undefined;
  const x=u*field.width-.5,y=v*field.height-.5,bx=Math.floor(x),by=Math.floor(y),fx=x-bx,fy=y-by;
  const point:Vector=[0,0,0],hit=[0,0];let squaredDistance=0;
  for(let dy=0;dy<=1;dy++)for(let dx=0;dx<=1;dx++) {
    const weight=(dx?fx:1-fx)*(dy?fy:1-fy),i=(clamp(by+dy,0,field.height-1)*field.width+clamp(bx+dx,0,field.width-1))*4;
    const su=field.data[i],sv=field.data[i+1],z=(field.data[i+2]-.5)*2.4*depth;
    const candidate=[(su*2-1)*aspect*(distance-z)/focal*frame,(1-sv*2)*(distance-z)/focal*frame,z];
    squaredDistance+=weight*candidate.reduce((sum,value,axis)=>sum+(p[axis]-value)**2,0);
    point.forEach((value,axis)=>{point[axis]=value+candidate[axis]*weight;});hit[0]+=su*weight;hit[1]+=sv*weight;
  }
  return {point,uv:hit,sourceUv:[u,v],separation:Math.sqrt(Math.max(0,squaredDistance))};
}
export function getParticleInteractionDistance(field:InteractionField,p:readonly number[],projection:InteractionProjection) {
  const surface=surfaceAt(field,p,projection);
  return surface?.separation??1;
}

/** A bounded 3D surface-guided bend, independent of frame rate and time. */
export function getParticleInteraction(field:InteractionField,p:readonly number[],contact:readonly number[],seed:readonly number[],gate:number,projection:InteractionProjection) {
  const result=Array.from(p) as Vector,surface=surfaceAt(field,p,projection);
  const separation=surface?.separation??1;
  const report=(excitation:number)=>({position:result,excitation,hitUv:surface?.uv??[-1,-1],beforeDistance:separation,afterDistance:getParticleInteractionDistance(field,result,projection)});
  gate=clamp(gate,0,1);
  if(!surface || !gate || separation>=INTERACTION_RADIUS)return report(0);
  const [sourceU,sourceV]=surface.sourceUv;
  gate*=smooth(0,INTERACTION_SOURCE_EDGE_FADE,Math.min(sourceU,sourceV,1-sourceU,1-sourceV));
  const initialNear=1-smooth(.015,INTERACTION_RADIUS,separation);
  const curl=[Math.cos(seed[1]*Math.PI*2),Math.sin(seed[1]*Math.PI*2),seed[0]*2-1];
  // The figure is 2.5D: a fixed frontal tangent plane cannot flip at a nearest
  // patch boundary. Real sampled XYZ still controls influence and repulsion.
  const normal=[0,0,1];
  const incident=p.map((value,index)=>value-contact[index]),incidentLength=Math.max(.03,length(incident));
  const ray=incident.map(value=>value/incidentLength);
  const tangent=ray.map((value,index)=>value-normal[index]*dot(ray,normal)+.3*(curl[index]-normal[index]*dot(curl,normal)));
  const tangentLength=Math.max(.5,length(tangent));
  result.forEach((value,index)=>{result[index]=value+(tangent[index]/tangentLength*.17+(p[index]-surface.point[index])/Math.max(.10,separation)*.04)*initialNear*gate;});
  for(let iteration=0;iteration<INTERACTION_INTEGRATION_STEPS;iteration++) {
    const next=surfaceAt(field,result,projection);if(!next)break;
    const delta=result.map((value,index)=>value-next.point[index]),clearance=next.separation;
    const correction=.02*(1-smooth(.015,.18,clearance))*initialNear*gate;
    result.forEach((value,index)=>{result[index]=value+delta[index]/Math.max(.10,clearance)*correction;});
  }
  const offset=result.map((value,index)=>value-p[index]),bound=INTERACTION_MAX_DISPLACEMENT/Math.max(INTERACTION_MAX_DISPLACEMENT,length(offset));
  result.forEach((_,index)=>{result[index]=p[index]+offset[index]*bound;});
  return report(initialNear*gate);
}

export const PARTICLE_INTERACTION_GLSL=`
uniform highp sampler2D uSurfaceField;
vec4 sampleSurfaceField(vec2 uv) {
  // Manual bilinear filtering keeps full position precision on WebGL2 without
  // requiring float-texture filtering support. Half-float UVs can staircase.
  ivec2 size=textureSize(uSurfaceField,0);
  vec2 cell=clamp(uv,vec2(0.0),vec2(1.0))*vec2(size)-.5;
  ivec2 base=ivec2(floor(cell));vec2 fraction=fract(cell);
  vec4 a=texelFetch(uSurfaceField,clamp(base,ivec2(0),size-1),0);
  vec4 b=texelFetch(uSurfaceField,clamp(base+ivec2(1,0),ivec2(0),size-1),0);
  vec4 c=texelFetch(uSurfaceField,clamp(base+ivec2(0,1),ivec2(0),size-1),0);
  vec4 d=texelFetch(uSurfaceField,clamp(base+ivec2(1,1),ivec2(0),size-1),0);
  return mix(mix(a,b,fraction.x),mix(c,d,fraction.x),fraction.y);
}
vec3 interactionSurfacePoint(vec2 uv,float frame,float depth,float distance,float focal,float aspect) {
  vec3 samplePoint=sampleSurfaceField(uv).xyz;
  float z=(samplePoint.z-.5)*2.4*depth;
  vec2 image=vec2((samplePoint.x*2.0-1.0)*aspect,1.0-samplePoint.y*2.0);
  return vec3(image*(distance-z)/focal*frame,z);
}
void interactionSurfaceQuery(vec2 uv,vec3 p,float frame,float depth,float distance,float focal,float aspect,out vec3 surface,out float separation) {
  ivec2 size=textureSize(uSurfaceField,0);
  vec2 cell=clamp(uv,vec2(0.0),vec2(1.0))*vec2(size)-.5;
  ivec2 base=ivec2(floor(cell));vec2 f=fract(cell);
  vec4 samples[4]=vec4[4](
    texelFetch(uSurfaceField,clamp(base,ivec2(0),size-1),0),
    texelFetch(uSurfaceField,clamp(base+ivec2(1,0),ivec2(0),size-1),0),
    texelFetch(uSurfaceField,clamp(base+ivec2(0,1),ivec2(0),size-1),0),
    texelFetch(uSurfaceField,clamp(base+ivec2(1,1),ivec2(0),size-1),0));
  vec4 weights=vec4((1.0-f.x)*(1.0-f.y),f.x*(1.0-f.y),(1.0-f.x)*f.y,f.x*f.y);
  surface=vec3(0.0);float squared=0.0;
  for(int i=0;i<4;i++) {
    float z=(samples[i].z-.5)*2.4*depth;
    vec2 image=vec2((samples[i].x*2.0-1.0)*aspect,1.0-samples[i].y*2.0);
    vec3 candidate=vec3(image*(distance-z)/focal*frame,z);
    surface+=candidate*weights[i];vec3 delta=p-candidate;squared+=dot(delta,delta)*weights[i];
  }
  // Interpolate distances, not nearest positions: averaging positions across
  // two separated patches would invent a much closer surface inside the gap.
  separation=sqrt(max(0.0,squared));
}
bool interactionSurfaceAt(vec3 p,float frame,float depth,float distance,float focal,float aspect,out vec3 surface,out float separation) {
  vec2 image=p.xy*focal/max(.5,distance-p.z)/max(.001,frame);
  vec2 uv=vec2((image.x/aspect+1.0)*.5,(1.0-image.y)*.5);
  if(any(lessThan(uv,vec2(0.0))) || any(greaterThan(uv,vec2(1.0))))return false;
  interactionSurfaceQuery(uv,p,frame,depth,distance,focal,aspect,surface,separation);
  return true;
}
bool interactionSurfaceAt(vec3 p,float frame,float depth,float distance,float focal,float aspect,out vec3 surface) {
  float separation;return interactionSurfaceAt(p,frame,depth,distance,focal,aspect,surface,separation);
}
float interactionDistance(vec3 p,float frame,float depth,float distance,float focal,float aspect) {
  vec3 surface;float separation;
  if(!interactionSurfaceAt(p,frame,depth,distance,focal,aspect,surface,separation))return 1.0;
  return separation;
}
vec3 deflectParticleFromSubject(vec3 p,vec3 contact,vec3 seed,float gate,float frame,float depth,float distance,float focal,float aspect,out float excitation,out vec2 hitUv) {
  excitation=0.0;hitUv=vec2(-1.0);
  if(gate<=0.0) return p;
  vec2 image=p.xy*focal/max(.5,distance-p.z)/max(.001,frame);
  vec2 uv=vec2((image.x/aspect+1.0)*.5,(1.0-image.y)*.5);
  if(any(lessThan(uv,vec2(0.0))) || any(greaterThan(uv,vec2(1.0)))) return p;
  // A truncated subject at the source image edge must release the bend
  // smoothly before the out-of-domain branch returns the unmodified point.
  float edge=min(min(uv.x,uv.y),min(1.0-uv.x,1.0-uv.y));
  gate*=smoothstep(0.0,${INTERACTION_SOURCE_EDGE_FADE},edge);
  vec4 samplePoint=sampleSurfaceField(uv);
  hitUv=samplePoint.xy;
  vec3 surface;float separation;
  interactionSurfaceQuery(uv,p,frame,depth,distance,focal,aspect,surface,separation);
  vec3 delta=p-surface;
  float radius=${INTERACTION_RADIUS};
  if(separation>=radius) return p;
  float initialNear=1.0-smoothstep(.015,radius,separation);
  vec3 result=p;
  vec3 curl=vec3(cos(seed.y*6.2831853),sin(seed.y*6.2831853),seed.x*2.0-1.0);
  vec3 normal=vec3(0.0,0.0,1.0);
  vec3 ray=p-contact;ray/=max(.03,length(ray));
  vec3 tangent=ray-normal*dot(ray,normal)+(curl-normal*dot(curl,normal))*.3;
  tangent/=max(.5,length(tangent));
  // Tangential guidance dominates; the radial soft core cannot split into two
  // saturated offsets when the unwarped path passes through a thin surface.
  result+=(tangent*.17+delta/max(.10,separation)*.04)*initialNear*gate;
  for(int i=0;i<${INTERACTION_INTEGRATION_STEPS};i++) {
    vec3 nextSurface;float clearance;if(!interactionSurfaceAt(result,frame,depth,distance,focal,aspect,nextSurface,clearance))break;
    vec3 nextDelta=result-nextSurface;
    float correction=.02*(1.0-smoothstep(.015,.18,clearance))*initialNear*gate;
    result+=nextDelta/max(.10,clearance)*correction;
  }
  vec3 offset=result-p;result=p+offset*${INTERACTION_MAX_DISPLACEMENT}/max(${INTERACTION_MAX_DISPLACEMENT},length(offset));
  excitation=initialNear*gate;
  return result;
}
`;
