import { useEffect, useRef, useState } from "react";
import { DEFAULT_PARTICLE_SETTINGS, type ParticleSettings } from "./particleSettings";
import { CAMERA_FOV, REFERENCE_CAMERA_DISTANCE, getParticleCamera } from "./particleCamera";
import { buildGalaxyGeometry, GALAXY_GLSL, NEBULA_EXTENTS_XYZ } from "./galaxyGeometry";
import { getParticleTimeline, initialParticleClocks, advanceParticleClocks, getParticleFlowDelta } from "./particleTimeline";
import { buildParticleAllocation } from "./particleComposition";
import { buildParticleIconPositions, PARTICLE_ICON_GLSL } from "./particleIcon";
import { PARTICLE_MORPH_GLSL } from "./particleMorph";
import { buildParticleSurface } from "./particleSurface";
import { PARTICLE_CONTACT_GLSL, isContactSource, CONTACT_CENTER_UV } from "./particleContact";
import { PARTICLE_FLOW_GLSL, buildParticleFlowAges, createParticleFlowStartup, stepParticleFlowStartup } from "./particleFlow";
import { buildParticleInteractionField, PARTICLE_INTERACTION_GLSL } from "./particleInteraction";
import { getParticleHistoryWeight, PARTICLE_HISTORY_CAPACITY, PARTICLE_HISTORY_INTERVAL, PARTICLE_TRAIL_MAX_PAIRS, PARTICLE_TRAIL_GLSL } from "./particleTrail";
import { getParticlePointerCenter, PARTICLE_POINTER_GLSL } from "./particlePointer";
import { createParticlePointerMotion, sampleParticlePointerMotion, stepParticlePointerMotion } from "./particlePointerMotion";
import { PARTICLE_EXCITATION_GLSL } from "./particleExcitation";
import { readParticleLoadingClocks, finishParticleLoading, hideParticleLoading } from "./particleLoading";
import { OPENING_FIGURE_SPEED, SETTLED_FIGURE_SPEED, OPENING_FLOW_TRAIL, SETTLED_FLOW_TRAIL, createFigureSpeedSchedule, advanceFigureSpeedSchedule } from "./particleFigureSpeed";

type Props = { paused: boolean; className?: string; lang?: "zh" | "en"; startSettled?: boolean; interior?: boolean };
type Cloud = { bytes: ArrayBuffer; count: number; aspect: number; subjectMask: Uint8Array;iconSamples:Float32Array };
type Geometry = Cloud & { vao: WebGLVertexArrayObject; buffer: WebGLBuffer; galaxyBuffer: WebGLBuffer; galaxy:Float32Array; surfaceBuffer: WebGLBuffer; iconBuffer:WebGLBuffer;indexBuffer:WebGLBuffer;allocation?:ReturnType<typeof buildParticleAllocation>;allocationKey?:string;maskTexture: WebGLTexture;interactionTexture:WebGLTexture; subjectPrefix: Uint32Array; contactPrefix: Uint32Array; flowAges: Float32Array; flowBuffers: WebGLBuffer[]; flowVaos: WebGLVertexArrayObject[]; flowRead: number; motion:MotionState; flowBoost?:number;flowStartup?:ReturnType<typeof createParticleFlowStartup> };
type MotionState={ offsets:WebGLBuffer[]; velocities:WebGLBuffer[]; color:WebGLBuffer;trailVao:WebGLVertexArrayObject; read:number; roles:WebGLBuffer; empty:WebGLBuffer; scratch:WebGLBuffer; history:{buffer:WebGLBuffer;color:WebGLBuffer;time:number}[]; write:number; lastCapture:number };
type Target = { texture: WebGLTexture; bloomSource?: WebGLTexture; framebuffer: WebGLFramebuffer; width: number; height: number };

let cloudPromise: Promise<Cloud> | undefined;
let loadingCleanupTimer:number|undefined;
function loadCloud(): Promise<Cloud> {
  if (!cloudPromise) {
    cloudPromise = Promise.all([fetch("/point-cloud/scene.bin"),fetch("/point-cloud/subject-mask.bin"),fetch("/point-cloud/icon.bin")]).then(async ([response,maskResponse,iconResponse]) => {
      if (!response.ok || !maskResponse.ok || !iconResponse.ok) throw new Error("Point cloud could not be loaded.");
      const bytes = await response.arrayBuffer();
      const subjectMask = new Uint8Array(await maskResponse.arrayBuffer());
      const iconBytes=await iconResponse.arrayBuffer();
      if(iconBytes.byteLength<16) throw new Error("Incomplete particle icon.");
      const iconHeader=new DataView(iconBytes),iconCount=iconHeader.getUint32(8,true);
      if(iconHeader.getUint32(0,true)!==0x49324943 || iconHeader.getUint32(4,true)!==1 || iconCount<2 || iconBytes.byteLength!==16+iconCount*12) throw new Error("Invalid particle icon.");
      const iconSamples=new Float32Array(iconBytes,16);
      if(!iconSamples.every(Number.isFinite)) throw new Error("Invalid particle icon samples.");
      if (subjectMask.byteLength !== 512*288) throw new Error("Incomplete subject mask.");
      if (bytes.byteLength < 16) throw new Error("Invalid point cloud.");
      const header = new DataView(bytes);
      if (header.getUint32(0, true) !== 0x49325043 || header.getUint32(4, true) !== 2) {
        throw new Error("Invalid point cloud.");
      }
      const count = header.getUint32(8, true);
      const aspect = header.getFloat32(12, true);
      if (bytes.byteLength !== 16 + count * 12 || !Number.isFinite(aspect) || aspect <= 0) {
        throw new Error("Incomplete point cloud.");
      }
      return { bytes, count, aspect, subjectMask,iconSamples };
    }).catch((error: unknown) => { cloudPromise = undefined; throw error; });
  }
  return cloudPromise;
}

// The actual icon is the first points-only shape. Particles scatter throughout
// XYZ space before capture; the contact emits flow once figures settle.
const pointVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aColor;
layout(location=2) in vec3 aDetail;
layout(location=3) in vec3 aGalaxyBase;
layout(location=4) in vec3 aGalaxyDetail;
layout(location=5) in vec4 aSurfaceDetail;
layout(location=6) in float aFlowAge;
layout(location=7) in vec3 aIconPosition;
layout(location=8) in vec4 aMotionOffset;
layout(location=9) in vec4 aMotionVelocity;
layout(location=11) in vec2 aParticleRole;
layout(location=12) in vec4 aHistoryPosition;
uniform vec3 uCameraRight, uCameraUp, uCameraBack;
uniform float uTime, uDpr, uAspect, uScreenAspect, uCssHeight, uGain;
uniform float uFigureFloatTime, uFlowFloatTime, uFlowRange;
uniform float uIconVisibility,uFlowReleased;
uniform float uDepth, uCameraDistance, uReferenceDistance, uFocal, uZoom;
uniform float uParticleSize, uFloatAmplitude, uFocus, uDof, uHue, uSaturation;
uniform float uGalaxyTime, uSceneMorph, uLayer, uGalaxyStrength, uSceneStrength;
uniform float uSubjectClarity, uContourProtection, uNebulaDensity, uSubjectDensity, uEdgeDispersion;
uniform float uHistoryKind,uHistoryWeight,uHasPreviousHistory,uCenterWhiteness;
uniform sampler2D uSubjectMask,uExcitationField;
out vec3 vColor;
out float vAlpha, vBokeh, vSpark, vBloomContribution;

${GALAXY_GLSL}
${PARTICLE_MORPH_GLSL}
${PARTICLE_CONTACT_GLSL}
${PARTICLE_FLOW_GLSL}
${PARTICLE_ICON_GLSL}
${PARTICLE_INTERACTION_GLSL}
${PARTICLE_POINTER_GLSL}
${PARTICLE_EXCITATION_GLSL}
float randomValue(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
struct ParticleState {vec3 position;float morph;float subject;float fringe;float flowOpacity;float excitation;float age;};
ParticleState particleState(float lag) {
  float progress=uSceneMorph,iconVisibility=uIconVisibility;
  float figureFloatTime=uFigureFloatTime,flowFloatTime=uFlowFloatTime;
  float seed = aDetail.y * 6.2831853;
  float sourceSubject=uLayer<-.5 ? aParticleRole.x : uLayer>.5 ? 0.0 : step(.5,aDetail.z);
  float contactMember=sourceSubject*contactSourceMask(aPosition.xy);
  float subject=sourceSubject*(1.0-contactMember);
  float z = (aPosition.z-.5)*2.4*uDepth;
  float fit = min(1.0, uScreenAspect / uAspect) * mix(1.16,1.02,smoothstep(.85,1.15,uScreenAspect));
  // Unproject each sampled pixel along its original camera ray. Changing depth
  // retains the source composition at the centered, currently selected camera.
  vec2 image = vec2((aPosition.x * 2.0 - 1.0) * uAspect, 1.0 - aPosition.y * 2.0);
  float centerFrame=fit*uZoom*uReferenceDistance/uCameraDistance;
  vec3 p = vec3(image * (uCameraDistance-z) / uFocal * centerFrame, z);
  float stability=mix(1.0,.24,uContourProtection*subject);
  float drift = (0.0026 + (1.0-aDetail.x) * 0.0052) * uFloatAmplitude * stability;
  p.x += sin(figureFloatTime * 0.47 + seed * 13.0 + image.y * 2.0) * drift;
  p.y += cos(figureFloatTime * 0.39 + seed * 19.0 + image.x) * drift;
  p.z += sin(figureFloatTime * 0.32 + seed * 7.0) * 0.016 * uFloatAmplitude * stability;
  p.y += sin(figureFloatTime * 0.23) * 0.006 * uFloatAmplitude;
  float fringe=aSurfaceDetail.w*subject*step(.001,uEdgeDispersion);
  float spread=fringe*aSurfaceDetail.x*uEdgeDispersion;
  p.xy+=aSurfaceDetail.yz*(.02+.10*aGalaxyDetail.x)*spread;
  p.z+=(aGalaxyDetail.y*2.0-1.0)*(.10+.42*aSurfaceDetail.x)*fringe*uEdgeDispersion;
  float random=aGalaxyDetail.x;
  float morph=sceneMorph(progress,aGalaxyDetail.x)*subject;
  float galaxyFit=min(1.0,uScreenAspect/1.25)*uZoom;
  float contactZ=CONTACT_WORLD_DEPTH*uDepth;
  vec2 contactImage=vec2((CONTACT_CENTER_UV.x*2.0-1.0)*uAspect,1.0-CONTACT_CENTER_UV.y*2.0);
  vec3 contact=vec3(contactImage*(uCameraDistance-contactZ)/uFocal*centerFrame,contactZ);
  vec3 iconSource=particleIconSource(aIconPosition,aGalaxyDetail,contact,galaxyFit,figureFloatTime,uFloatAmplitude,uDepth,1.0-smoothstep(.05,.6,morph));
  float figureSide=aPosition.x<CONTACT_CENTER_UV.x ? -1.0:1.0;
  p=particleMorphPosition(iconSource,p,contact,aGalaxyDetail,morph,figureSide);
  vec3 flowPosition;float flowOpacity,outerBlend;
  float flowAge=aFlowAge;
  particleFlow(aGalaxyBase,aGalaxyDetail,flowAge,uFlowRange,flowPosition,flowOpacity,outerBlend);
  float flowBlend=1.0-subject;
  vec3 flowWorld=iconVisibility>0.0 ? iconSource : flowWorldPosition(flowPosition,contact,galaxyFit,uCameraBack,uCameraDistance);
  p=mix(p,flowWorld,flowBlend);
  float groupFloatTime=mix(flowFloatTime,figureFloatTime,subject);
  float driftGate=mix(smoothstep(0.0,.02,length(flowPosition))*uFlowReleased,smoothstep(0.0,.15,morph),subject);
  p+=sharedFieldDrift(p,contact,groupFloatTime,uFloatAmplitude)*driftGate*mix(.12,1.0,subject);
  float deflectionExcitation=0.0;vec2 hitUv;
  float interactionGate=uFlowReleased*smoothstep(.85,1.0,progress);
  if(subject<.5 && iconVisibility<=0.0 && flowOpacity>.001) {p=deflectParticleFromSubject(p,contact,aGalaxyDetail,interactionGate,centerFrame,uDepth,uCameraDistance,uFocal,uAspect,deflectionExcitation,hitUv);deflectionExcitation*=subjectExcitationSensitivity(hitUv);}

  return ParticleState(p,morph,subject,fringe,flowOpacity,deflectionExcitation,flowAge);
}
void main() {
  if(uHistoryKind>0.0 && ((uHistoryKind<1.5 && aHistoryPosition.w>=0.0)||(uHistoryKind>1.5 && aHistoryPosition.w<=0.0))) {
    gl_Position=vec4(-3.0,-3.0,0.0,1.0);gl_PointSize=1.0;vColor=vec3(0.0);vAlpha=0.0;vBokeh=0.0;vSpark=0.0;vBloomContribution=0.0;return;
  }
  ParticleState state;
  if(uHistoryKind>0.0) {
    float historicalSubject=uLayer>.5 ? 0.0:1.0;
    state=ParticleState(aHistoryPosition.xyz,sceneMorph(uSceneMorph,aGalaxyDetail.x)*historicalSubject,historicalSubject,aSurfaceDetail.w*historicalSubject*step(.001,uEdgeDispersion),0.0,0.0,0.0);
  } else state=particleState(0.0);
  vec3 p=state.position+aMotionOffset.xyz;
  if(uHistoryKind>0.0)p=aHistoryPosition.xyz;
  float morph=state.morph,subject=state.subject,fringe=state.fringe;
  float flowOpacity=state.flowOpacity,deflectionExcitation=state.excitation,flowAge=state.age;
  float random=aGalaxyDetail.x;
  float fit=min(1.0,uScreenAspect/uAspect)*mix(1.16,1.02,smoothstep(.85,1.15,uScreenAspect));
  float centerFrame=fit*uZoom*uReferenceDistance/uCameraDistance;
  float contactZ=CONTACT_WORLD_DEPTH*uDepth;
  vec2 contactImage=vec2((CONTACT_CENTER_UV.x*2.0-1.0)*uAspect,1.0-CONTACT_CENTER_UV.y*2.0);
  vec3 contact=vec3(contactImage*(uCameraDistance-contactZ)/uFocal*centerFrame,contactZ);
  if(subject<.5 && uHistoryKind<.5 && uIconVisibility<=0.0 && flowOpacity>.001) {
    float actualExcitation;vec2 actualHit;
    deflectParticleFromSubject(p,contact,aGalaxyDetail,uFlowReleased*smoothstep(.85,1.0,uSceneMorph),centerFrame,uDepth,uCameraDistance,uFocal,uAspect,actualExcitation,actualHit);
    deflectionExcitation=actualExcitation*subjectExcitationSensitivity(actualHit);
  }
  float surfaceExcitation=(1.0-exp(-texture(uExcitationField,aPosition.xy).r*2.4))*subject*morph*uFlowReleased;
  float excitation=clamp(max(deflectionExcitation,surfaceExcitation),0.0,1.0);
  float tipDistance=length((aPosition.xy-CONTACT_HUMAN_TIP)*vec2(1672.0,941.0));
  // The protected source fingertip contains a little of the old orb's halo.
  // Keep excitation there, but prevent it from amplifying that remnant again.
  excitation=min(excitation,mix(1.0,mix(.18,1.0,smoothstep(8.0,18.0,tipDistance)),subject*morph));
  float cameraDepth = uCameraDistance-dot(p,uCameraBack);
  vec2 cameraXY = vec2(dot(p,uCameraRight),dot(p,uCameraUp));
  gl_Position = vec4(cameraXY*vec2(uFocal/uScreenAspect,uFocal),0.0,max(cameraDepth,0.1));
  // Reference coordinates have a larger world-unit scale. This conversion
  // keeps its exact sprite sizes and near-side-only DOF at our default framing.
  float referenceScale=19.13975/8.8;
  float referenceDepth=max(.5,cameraDepth*referenceScale);
  float focusDistance=max(.5,(uCameraDistance-uFocus)*referenceScale);
  float nearOffset=max(0.0,focusDistance-referenceDepth);
  vBokeh=clamp(smoothstep(1.4,5.0,nearOffset)*(.72+.28*random)*uDof,0.0,1.0)*mix(1.0,.08,uSubjectClarity*morph);
  vBokeh=mix(vBokeh,clamp(nearOffset/4.0,0.0,1.0)*uDof*.55,fringe*morph);
  vBloomContribution=mix(1.0,.14,uSubjectClarity*morph);
  vBloomContribution=mix(vBloomContribution,.55,fringe*morph);
  float sizeRandom=randomValue(aGalaxyDetail.xy+vec2(4.1,7.3));
  float alphaRandom=randomValue(aGalaxyDetail.xy+vec2(3.7,1.9));
  bool rare=randomValue(aGalaxyDetail.xy+vec2(8.6,5.2))>.86;
  float size=rare ? 1.0+sizeRandom*1.9 : .68+pow(sizeRandom,3.0)*1.6;
  float seedAlpha=rare ? .1+alphaRandom*.15 : .34+alphaRandom*.64;
  float naturalSize=size*uCssHeight*.044/referenceDepth*mix(1.0,2.25,vBokeh)*uParticleSize;
  gl_PointSize=clamp(naturalSize,1.0,mix(5.5,18.0,vBokeh))*uDpr;
  float theta=atan(aGalaxyBase.z,aGalaxyBase.x);
  bool backgroundFlow=subject<.5 && uIconVisibility<=0.0;
  float lightTime=backgroundFlow?0.0:uTime;
  float sparkSeed=fract(random*39.17+theta*4.83+aGalaxyDetail.y*13.19);
  float glint=backgroundFlow?0.0:smoothstep(.973,.995,sparkSeed);
  vSpark=clamp(.19+.26*random+glint*(.42+.24*sin(lightTime*.68+random*43.0)),0.0,1.0);
  vSpark=clamp(vSpark+excitation*.2,0.0,1.0);
  vBloomContribution=mix(vBloomContribution,1.0,excitation);
  // Hue rotates around the neutral RGB axis, preserving the sampled reds at 0°.
  vec3 axis=normalize(vec3(1.0));
  vec3 nebulaColor=backgroundFlow?galaxyFlowColor(aGalaxyDetail):galaxyColor(aGalaxyBase,aGalaxyDetail,uGalaxyTime);
  vec3 color=mix(nebulaColor,aColor,morph);
  color*=.63+.30*(.5+.5*sin(lightTime*.22+random*31.0));
  color=mix(color,vec3(1.0,.42,.24),excitation*.75);
  vec3 hue=color*cos(uHue)+cross(axis,color)*sin(uHue)+axis*dot(axis,color)*(1.0-cos(uHue));
  float luma=dot(hue,vec3(0.2126,0.7152,0.0722));
  vColor=max(vec3(0.0),mix(vec3(luma),hue,uSaturation));
  float homeGlow=.47+.19*vSpark+.07*sin(lightTime*.42+random*27.0);
  float depthAtten=clamp(1.0-(referenceDepth-16.0)*.029,.48,1.0);
  float shimmer=.84+.16*sin(aGalaxyDetail.y*39.0+random*13.0-lightTime*.7);
  // Geometry masks describe where light gathers. They do not replace the
  // reference's seeded alpha distribution shared by both stages.
  float border=min(min(aPosition.x,1.0-aPosition.x),min(aPosition.y,1.0-aPosition.y));
  float edgeFeather=smoothstep(0.0,.045,border);
  // Preserve the sampled luminance contrast: dark visor/face points must remain
  // dark, with bright outlines supplying their recognizable structure.
  float subjectLight=(.04+pow(aDetail.x,1.1)*3.1)*edgeFeather*mix(1.0,.25+.20*aGalaxyDetail.x,fringe);
  // Nebula light is calibrated after density/DOF energy compensation; its
  // volume remains visible without raising exposure over the subjects.
  float shapeGain=mix(galaxyGain(aGalaxyBase,aGalaxyDetail,uGalaxyTime)*12.0,subjectLight,morph);
  float layerGain=mix(uGalaxyStrength,uSceneStrength,morph);
  float densityGain=mix(uNebulaDensity,uSubjectDensity,morph);
  // Project the camera ray into the subject plane and query only a semantic
  // coverage mask. This texture never supplies visible color or image pixels.
  vec3 eye=uCameraBack*uCameraDistance;
  vec3 ray=p-eye;
  float rayZ=abs(ray.z)>.001 ? ray.z : -.001;
  vec3 maskPlane=eye+ray*((contact.z-eye.z)/rayZ);
  vec2 maskImage=maskPlane.xy*uFocal/max(.5,uCameraDistance-contact.z)/max(.001,centerFrame);
  vec2 maskUv=vec2((maskImage.x/uAspect+1.0)*.5,(1.0-maskImage.y)*.5);
  float coverage=0.0;
  if(all(greaterThanEqual(maskUv,vec2(0.0))) && all(lessThanEqual(maskUv,vec2(1.0)))) coverage=texture(uSubjectMask,maskUv).r*(1.0-contactSourceMask(maskUv));
  float protection=1.0-coverage*.96*uContourProtection*smoothstep(0.0,.9,uSceneMorph)*(1.0-morph);
  protection=mix(protection,1.0,excitation*(1.0-subject));
  vAlpha=seedAlpha*depthAtten*shimmer*homeGlow*shapeGain*uGain*layerGain*densityGain*protection;
  // A new figure point fades in as it leaves the emitter; settled figures never
  // recycle. Only the uncaptured flow group has a finite transparent lifetime.
  float figureOpacity=smoothstep(0.0,.04,morph);
  vAlpha*=mix(flowOpacity*smoothstep(0.0,.025,flowOpacity)*uFlowReleased,figureOpacity,subject);
  float iconAlpha=seedAlpha*depthAtten*shimmer*homeGlow*uGain*uGalaxyStrength*uNebulaDensity*aIconPosition.z*.42;
  vAlpha=mix(vAlpha,iconAlpha,uIconVisibility);
  // A defocused sprite spreads the same light over a larger footprint.
  // Without this correction a 2.25x sprite contributes nearly ten times the
  // light, turning foreground nebula points into an opaque luminous veil.
  vAlpha/=pow(mix(1.0,2.25,vBokeh),2.0)*mix(1.0,1.9,smoothstep(.12,.90,vBokeh));
  float emitterGlow=contactParticleGlow(p,contact,centerFrame,uDepth,uCameraDistance,uFocal,uAspect)*uFlowReleased;
  vAlpha*=1.0+emitterGlow*4.0;
  float whitePeak=max(max(vColor.r,vColor.g),vColor.b);
  float whiteGlow=contactParticleWhiteness(p,contact,centerFrame,uDepth,uCameraDistance,uFocal,uAspect)*uFlowReleased;
  vColor=mix(vColor,vec3(whitePeak),whiteGlow*uCenterWhiteness);
  // Sharp particle light, independent of the global bloom switch.
  vAlpha*=1.0+excitation*7.0;
  vAlpha*=mix(1.0,.48,humanTipGlareWeight(aPosition.xy)*subject*morph);
  if(uHistoryKind>0.0) {
    bool matches=uHistoryKind<1.5 ? aHistoryPosition.w<0.0 : aHistoryPosition.w>0.0;
    vAlpha=matches ? abs(aHistoryPosition.w)*uHistoryWeight : 0.0;
  }
  if(cameraDepth < 0.3) vAlpha=0.0;
}`;

// The same position and material shader records the actual post-force points.
// Separate feedback outputs keep persistent dynamics and a compact XYZ/alpha history.
const motionVertex=pointVertex.replace("void main() {",`out vec4 vNextMotionOffset,vNextMotionVelocity,vRecordedPosition,vRecordedColor;
void main() {
  if(aParticleRole.y<.5){vNextMotionOffset=vec4(0.0,0.0,0.0,aFlowAge);vNextMotionVelocity=vec4(0.0);vRecordedPosition=vec4(0.0);vRecordedColor=vec4(0.0);gl_Position=vec4(0.0,0.0,0.0,1.0);return;}
`).replace("vec3 p=state.position+aMotionOffset.xyz;",`
  vec3 offset=aMotionOffset.xyz,velocity=aMotionVelocity.xyz;
  bool isSubject=state.subject>.5;
  if(aParticleRole.y<.5 || (!isSubject && (aFlowAge<=0.0 || aFlowAge<aMotionOffset.w))){offset=vec3(0.0);velocity=vec3(0.0);}
  vec3 p=stepParticlePointer(state.position,aGalaxyDetail,isSubject,offset,velocity);
  if(aParticleRole.y<.5){offset=vec3(0.0);velocity=vec3(0.0);p=state.position;}
  vNextMotionOffset=vec4(offset,aFlowAge);vNextMotionVelocity=vec4(velocity,aParticleRole.y);
`).replace("if(cameraDepth < 0.3) vAlpha=0.0;",`if(cameraDepth < 0.3) vAlpha=0.0;
  float historyKind=state.subject>.5 || uIconVisibility>0.0 ? -1.0:uFlowReleased;
  bool continuous=state.subject>.5 || uIconVisibility>0.0 || (aFlowAge>0.0 && aFlowAge>=aMotionOffset.w);
  vRecordedPosition=vec4(p,continuous ? vAlpha*historyKind*aParticleRole.y:0.0);
  vRecordedColor=vec4(vColor,vBloomContribution);
`);

// Actual successive world positions form thin light paths, including settled figures.
// Each endpoint uses the color captured with its position, so a white newborn
// at the contact cannot recolor the old red trail left in the outer volume.
const trailVertex=`#version 300 es
precision highp float;
layout(location=0) in vec4 aTrailOlder;
layout(location=1) in vec4 aTrailNewer;
layout(location=2) in vec4 aTrailColor;
layout(location=3) in float aTrailContinuity;
layout(location=4) in vec4 aTrailOlderColor;
uniform vec3 uCameraRight,uCameraUp,uCameraBack;
uniform float uCameraDistance,uFocal,uScreenAspect,uCssHeight;
uniform float uIntroTrail,uFlowTrail;
uniform vec2 uTrailAges;
out vec3 vTrailColor;
out float vTrailAlpha,vTrailBloom;
${PARTICLE_TRAIL_GLSL}
void main() {
  vec3 older=aTrailOlder.xyz,newer=aTrailNewer.xyz;
  float olderDepth=uCameraDistance-dot(older,uCameraBack),newerDepth=uCameraDistance-dot(newer,uCameraBack);
  vec2 olderXY=vec2(dot(older,uCameraRight),dot(older,uCameraUp))*vec2(uFocal/uScreenAspect,uFocal)/max(.1,olderDepth);
  vec2 newerXY=vec2(dot(newer,uCameraRight),dot(newer,uCameraUp))*vec2(uFocal/uScreenAspect,uFocal)/max(.1,newerDepth);
  float pixels=length((newerXY-olderXY)*vec2(uScreenAspect,1.0))*uCssHeight*.5;
  float movement=smoothstep(.015,.35,pixels);
  float strength=aTrailNewer.w<0.0 ? uIntroTrail:uFlowTrail;
  bool valid=particleTrailSegment(aTrailOlder,aTrailNewer) && aTrailContinuity*aTrailNewer.w>0.0 && olderDepth>.3 && newerDepth>.3 && pixels<240.0;
  bool atNewer=gl_VertexID==1;
  float age=atNewer?uTrailAges.y:uTrailAges.x;
  vTrailAlpha=valid?abs(atNewer?aTrailNewer.w:aTrailOlder.w)*particleTrailWeight(strength,age)*.18*movement:0.0;
  vec4 material=atNewer?aTrailColor:aTrailOlderColor;
  vTrailColor=material.rgb;vTrailBloom=material.a;
  gl_Position=valid?vec4(atNewer?newerXY:olderXY,0.0,1.0):vec4(-3.0,-3.0,0.0,1.0);
}
`;
const trailFragment=`#version 300 es
precision highp float;
in vec3 vTrailColor;
in float vTrailAlpha,vTrailBloom;
layout(location=0) out vec4 outColor;
layout(location=1) out vec4 outBloom;
void main() {
  outColor=vec4(vTrailColor,vTrailAlpha);
  outBloom=vec4(vTrailColor,vTrailAlpha*vTrailBloom);
}
`;

// Persistent transport phases let each point change speed at its own spatial
// boundary. Transform feedback keeps this update and geometry on the GPU.
const flowVertex = `#version 300 es
precision highp float;
layout(location=3) in vec3 aGalaxyBase;
layout(location=4) in vec3 aGalaxyDetail;
layout(location=6) in float aFlowAge;
uniform float uDelta,uFigureSpeed,uFlowSpeed,uFlowRange,uFlowSpeedBias,uReleasedElapsed,uStartupBoost;
out float vNextFlowAge;
${GALAXY_GLSL}
${PARTICLE_FLOW_GLSL}
void main() {
  vNextFlowAge=advanceParticleFlowAge(aGalaxyBase,aGalaxyDetail,aFlowAge,uDelta,uFigureSpeed,uFlowSpeed,uFlowRange,uFlowSpeedBias,uReleasedElapsed,uStartupBoost);
  gl_Position=vec4(0.0,0.0,0.0,1.0);
}`;
const flowFragment = `#version 300 es
precision highp float;
out vec4 outColor;
void main() { outColor=vec4(0.0); }
`;

const pointFragment = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha, vBokeh, vSpark, vBloomContribution;

layout(location=0) out vec4 outColor;
layout(location=1) out vec4 outBloom;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = dot(p,p);
  if (r > 1.0) discard;
  float nucleus = exp(-r*48.0);
  float glow = exp(-r*10.0);
  float halo = exp(-r*1.8)*0.09;
  float ring = exp(-pow((sqrt(r)-0.56)/0.18,2.0));
  float glint = pow(vSpark,9.0)*(exp(-p.x*p.x*90.0-p.y*p.y*4.5)+exp(-p.y*p.y*90.0-p.x*p.x*4.5))*0.17;
  float focused = nucleus*0.76 + glow*0.31 + halo + glint;
  float outerVeil=exp(-r*2.3)*(1.0-smoothstep(.78,1.0,sqrt(r)));
  float diffraction=.80+.20*cos(atan(p.y,p.x)*4.0+vSpark*5.0);
  float diffuse = (outerVeil*0.27+ring*0.29)*diffraction+exp(-r*8.0)*0.055+glint*.17;
  float alpha = vAlpha * mix(focused, diffuse, smoothstep(0.12,0.90,vBokeh));
  outColor = vec4(vColor, alpha);
  outBloom = vec4(vColor, alpha*vBloomContribution);
}`;

// Splat energy only where a live flow particle is deflected by the sampled
// surface. The main point pass reads it at the matching subject coordinates.
const excitationVertex=`#version 300 es
precision highp float;
layout(location=3) in vec3 aGalaxyBase;
layout(location=4) in vec3 aGalaxyDetail;
layout(location=6) in float aFlowAge;
layout(location=8) in vec4 aMotionOffset;
uniform vec3 uCameraBack;
uniform float uDepth,uCameraDistance,uReferenceDistance,uFocal,uScreenAspect,uAspect,uZoom;
uniform float uFlowRange,uFlowFloatTime,uFloatAmplitude,uFlowReleased,uSceneMorph;
out float vHeat;
${GALAXY_GLSL}
${PARTICLE_MORPH_GLSL}
${PARTICLE_CONTACT_GLSL}
${PARTICLE_FLOW_GLSL}
${PARTICLE_INTERACTION_GLSL}
${PARTICLE_EXCITATION_GLSL}
void main() {
  float fit=min(1.0,uScreenAspect/uAspect)*mix(1.16,1.02,smoothstep(.85,1.15,uScreenAspect));
  float frame=fit*uZoom*uReferenceDistance/uCameraDistance;
  float z=CONTACT_WORLD_DEPTH*uDepth;
  vec2 image=vec2((CONTACT_CENTER_UV.x*2.0-1.0)*uAspect,1.0-CONTACT_CENTER_UV.y*2.0);
  vec3 contact=vec3(image*(uCameraDistance-z)/uFocal*frame,z);
  float galaxyFit=min(1.0,uScreenAspect/1.25)*uZoom;
  vec3 local;float opacity,outerBlend;
  particleFlow(aGalaxyBase,aGalaxyDetail,aFlowAge,uFlowRange,local,opacity,outerBlend);
  vec3 p=flowWorldPosition(local,contact,galaxyFit,uCameraBack,uCameraDistance);
  p+=sharedFieldDrift(p,contact,uFlowFloatTime,uFloatAmplitude)*smoothstep(0.0,.02,length(local))*uFlowReleased*.12;
  float excitation;vec2 uv;
  p=deflectParticleFromSubject(p,contact,aGalaxyDetail,uFlowReleased*smoothstep(.85,1.0,uSceneMorph),frame,uDepth,uCameraDistance,uFocal,uAspect,excitation,uv);
  p+=aMotionOffset.xyz;
  deflectParticleFromSubject(p,contact,aGalaxyDetail,uFlowReleased*smoothstep(.85,1.0,uSceneMorph),frame,uDepth,uCameraDistance,uFocal,uAspect,excitation,uv);
  vHeat=excitation*opacity*.85*subjectExcitationSensitivity(uv);
  gl_Position=vec4(uv*2.0-1.0,0.0,1.0);
  if(vHeat<=.00001)gl_Position=vec4(-3.0,-3.0,0.0,1.0);
  gl_PointSize=4.0;
}`;
const excitationFragment=`#version 300 es
precision highp float;
in float vHeat;
out vec4 outColor;
void main() {
  float r=length(gl_PointCoord*2.0-1.0);
  if(r>1.0)discard;
  float heat=vHeat*exp(-r*r*5.0)*(1.0-smoothstep(.7,1.0,r));
  outColor=vec4(heat,0.0,0.0,1.0);
}`;
const screenVertex = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p*2.0-1.0,0.0,1.0);
}`;
const excitationDecayFragment=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPreviousHeat;
uniform float uHeatDecay;
out vec4 outColor;
void main() {outColor=vec4(texture(uPreviousHeat,vUv).r*uHeatDecay,0.0,0.0,1.0);}
`;
const blurFragment = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uDirection;
out vec4 outColor;
void main() {
  vec3 c=texture(uImage,vUv).rgb*0.227027;
  c+=(texture(uImage,vUv+uDirection*1.384615).rgb+texture(uImage,vUv-uDirection*1.384615).rgb)*0.316216;
  c+=(texture(uImage,vUv+uDirection*3.230769).rgb+texture(uImage,vUv-uDirection*3.230769).rgb)*0.070270;
  outColor=vec4(c,1.0);
}`;
const compositeFragment = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage, uBloom;
uniform vec2 uResolution;
uniform float uBloomStrength, uExposure;
out vec4 outColor;
void main() {
  vec3 light=texture(uImage,vUv).rgb;
  if(uBloomStrength>0.0001) {
    vec3 bloom=texture(uBloom,vUv).rgb;
    vec2 stepUv=vec2(23.0)/uResolution;
    vec3 wide=(texture(uBloom,vUv+vec2(stepUv.x,0.0)).rgb+texture(uBloom,vUv-vec2(stepUv.x,0.0)).rgb+texture(uBloom,vUv+vec2(0.0,stepUv.y)).rgb+texture(uBloom,vUv-vec2(0.0,stepUv.y)).rgb)*0.25;
    light+=(bloom*0.73+wide*0.35)*uBloomStrength;
  }
  float peak=max(max(light.r,light.g),light.b);
  float energy=1.0-exp(-peak*uExposure);
  vec3 chroma=light/max(peak,0.0001);
  vec3 c=vec3(0.003,0.002,0.004)+chroma*energy*0.96;
  c+=vec3(0.035,0.013,0.009)*pow(energy,1.8);
  outColor=vec4(min(c,vec3(1.0,0.985,0.97)),1.0);
}`;

export default function PointCloudScene({ paused, className, lang = "zh", startSettled = false, interior = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ pause: (value: boolean) => void } | null>(null);
  const pausedRef = useRef(paused);
  const interiorRef = useRef(interior);
  const settingsRef = useRef<ParticleSettings>({ ...DEFAULT_PARTICLE_SETTINGS });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [contextVersion, setContextVersion] = useState(0);
  pausedRef.current = paused;
  interiorRef.current = interior;

  useEffect(() => { controller.current?.pause(paused); }, [paused]);

  useEffect(() => {
    window.clearTimeout(loadingCleanupTimer);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, powerPreference: "high-performance" });
    if (!gl) { hideParticleLoading();setStatus("error"); return; }
    let disposed = false, frame = 0, lastTime = 0;
    const startPopulated=startSettled || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let figureSpeedSchedule=createFigureSpeedSchedule(startPopulated);
    let clocks = initialParticleClocks(startPopulated);
    let isPaused = pausedRef.current, isVisible = true, isPageVisible = !document.hidden;
    let current: Geometry | undefined;
    let dpr = 1, width = 1, height = 1, renderTargetFailed = false;
    let compactViewport = window.matchMedia("(max-width: 700px)").matches;
    const qualityLevels = [1, 0.82, 0.68];
    let qualityLevel = 0, qualityElapsed = 0, qualityFrames = 0, fastWindows = 0;
    let targets: Target[] = [];
    let excitationTarget:Target|undefined;
    let excitationHistory:Target|undefined;
    const pointer = [0, 0], destination = [0, 0], mouseNdc=[0,0];
    let mouseMotion=createParticlePointerMotion(),mouseDirection=[0,0,0];
    let mouseActive=false,mouseSettlingUntil=0,motionTime=0,loadingAligned=false,loadingHoldUntil=0;
    const programs: WebGLProgram[] = [];

    function program(vertex: string, fragment: string, feedback?: string[], separate=false) {
      const shaders = [gl!.VERTEX_SHADER, gl!.FRAGMENT_SHADER].map((type, index) => {
        const shader = gl!.createShader(type)!;
        gl!.shaderSource(shader, index === 0 ? vertex : fragment);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          const message = gl!.getShaderInfoLog(shader);
          gl!.deleteShader(shader);
          throw new Error(message || "Particle shader failed.");
        }
        return shader;
      });
      const result = gl!.createProgram()!;
      shaders.forEach((shader) => gl!.attachShader(result, shader));
      if(feedback) gl!.transformFeedbackVaryings(result,feedback,separate?gl!.SEPARATE_ATTRIBS:gl!.INTERLEAVED_ATTRIBS);
      gl!.linkProgram(result);
      shaders.forEach((shader) => gl!.deleteShader(shader));
      if (!gl!.getProgramParameter(result, gl!.LINK_STATUS)) {
        gl!.deleteProgram(result);
        throw new Error("Particle shader could not be linked.");
      }
      programs.push(result);
      return result;
    }
    let points: WebGLProgram, trails:WebGLProgram, blur: WebGLProgram, composite: WebGLProgram, flowProgram: WebGLProgram, excitationProgram:WebGLProgram,excitationDecayProgram:WebGLProgram,motionProgram:WebGLProgram;
    try {
      points = program(pointVertex, pointFragment);
      motionProgram=program(motionVertex,flowFragment,["vNextMotionOffset","vNextMotionVelocity","vRecordedPosition","vRecordedColor"],true);
      trails=program(trailVertex,trailFragment);
      blur = program(screenVertex, blurFragment);
      composite = program(screenVertex, compositeFragment);
      flowProgram = program(flowVertex,flowFragment,["vNextFlowAge"]);
      excitationProgram=program(excitationVertex,excitationFragment);
      excitationDecayProgram=program(screenVertex,excitationDecayFragment);
    } catch (error) { console.error(error); programs.forEach((item) => gl.deleteProgram(item));hideParticleLoading();setStatus("error"); return; }
    const uniforms = (item: WebGLProgram, names: string[]) => Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(item, name)]));
    const pointUniformNames=["uCameraRight", "uCameraUp", "uCameraBack", "uTime", "uFigureFloatTime", "uFlowFloatTime", "uFlowRange", "uIconVisibility", "uFlowReleased", "uGalaxyTime", "uSceneMorph", "uLayer", "uGalaxyStrength", "uSceneStrength", "uDpr", "uAspect", "uScreenAspect", "uCssHeight", "uGain", "uDepth", "uCameraDistance", "uReferenceDistance", "uFocal", "uZoom", "uParticleSize", "uFloatAmplitude", "uFocus", "uDof", "uHue", "uSaturation", "uSubjectClarity", "uContourProtection", "uNebulaDensity", "uSubjectDensity", "uEdgeDispersion", "uSubjectMask","uSurfaceField","uExcitationField","uHistoryKind","uHistoryWeight","uHasPreviousHistory","uCenterWhiteness","uMouseCenter","uMouseDirection","uMouseRadius","uMouseStrength","uMouseActive","uMotionDelta"];
    const pu=uniforms(points,pointUniformNames),mu=uniforms(motionProgram,pointUniformNames);
    const tu=uniforms(trails,["uCameraRight","uCameraUp","uCameraBack","uCameraDistance","uFocal","uScreenAspect","uCssHeight","uIntroTrail","uFlowTrail","uTrailAges"]);
    const fu=uniforms(flowProgram,["uDelta","uFigureSpeed","uFlowSpeed","uFlowRange","uFlowSpeedBias","uReleasedElapsed","uStartupBoost"]);
    const eu=uniforms(excitationProgram,["uCameraBack","uDepth","uCameraDistance","uReferenceDistance","uFocal","uScreenAspect","uAspect","uZoom","uFlowRange","uFlowFloatTime","uFloatAmplitude","uFlowReleased","uSceneMorph","uSurfaceField"]);
    const hu=uniforms(excitationDecayProgram,["uPreviousHeat","uHeatDecay"]);
    const feedback=gl.createTransformFeedback()!;
    const bu = uniforms(blur, ["uImage", "uDirection"]);
    const cu = uniforms(composite, ["uImage", "uBloom", "uResolution", "uBloomStrength", "uExposure"]);
    const screenVao = gl.createVertexArray();

    let useHdr = Boolean(gl.getExtension("EXT_color_buffer_float"));

    const deleteTargets = () => {
      targets.forEach(({ texture, bloomSource, framebuffer }) => { gl.deleteTexture(texture); if (bloomSource) gl.deleteTexture(bloomSource); gl.deleteFramebuffer(framebuffer); });
      targets = [];
      if(excitationTarget) {gl.deleteTexture(excitationTarget.texture);gl.deleteFramebuffer(excitationTarget.framebuffer);excitationTarget=undefined;}
      if(excitationHistory) {gl.deleteTexture(excitationHistory.texture);gl.deleteFramebuffer(excitationHistory.framebuffer);excitationHistory=undefined;}
    };
    const target = (targetWidth: number, targetHeight: number, separateBloom = false): Target => {
      const makeTexture = () => {
        const item = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, item);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, useHdr ? gl.RGBA16F : gl.RGBA8, targetWidth, targetHeight, 0, gl.RGBA, useHdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
        return item;
      };
      const texture = makeTexture(), bloomSource = separateBloom ? makeTexture() : undefined, framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (bloomSource) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, bloomSource, 0);
      gl.drawBuffers(bloomSource ? [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] : [gl.COLOR_ATTACHMENT0]);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        gl.deleteTexture(texture); if (bloomSource) gl.deleteTexture(bloomSource); gl.deleteFramebuffer(framebuffer);
        throw new Error("Particle render target is unavailable.");
      }
      return { texture, bloomSource, framebuffer, width: targetWidth, height: targetHeight };
    };
    const texture = (value: WebGLTexture, unit: number) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, value); };
    const bindTarget = (value: Target | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, value?.framebuffer ?? null);
      gl.viewport(0, 0, value?.width ?? width, value?.height ?? height);
    };
    function resize() {
      if (disposed || gl!.isContextLost()) return;
      compactViewport = window.matchMedia("(max-width: 700px)").matches;
      settingsRef.current.particleCount = compactViewport ? 65000 : DEFAULT_PARTICLE_SETTINGS.particleCount;
      // Layout dimensions exclude the content-page CSS scale, keeping the
      // backing buffer independent of the visual enlargement.
      const cssWidth = canvas!.clientWidth;
      const cssHeight = canvas!.clientHeight;
      const requestedDpr = Math.min(window.devicePixelRatio || 1, compactViewport ? 1.15 : 1.35) * qualityLevels[qualityLevel];
      const maxDimension = Math.min(2200, gl!.getParameter(gl!.MAX_TEXTURE_SIZE) as number);
      dpr = requestedDpr * Math.min(1, maxDimension / (Math.max(cssWidth, cssHeight) * requestedDpr));
      const nextWidth = Math.max(1, Math.round(cssWidth * dpr));
      const nextHeight = Math.max(1, Math.round(cssHeight * dpr));
      if (nextWidth === width && nextHeight === height && targets.length) return;
      width = nextWidth; height = nextHeight;
      canvas!.width = width; canvas!.height = height;
      deleteTargets();
      const createTargets = () => {
        const bloomEnabled = settingsRef.current.bloom > 0.0001;
        targets.push(target(width, height, bloomEnabled));
        if (bloomEnabled) targets.push(target(Math.ceil(width / 2), Math.ceil(height / 2)));
        excitationTarget=target(256,144);
        excitationHistory=target(256,144);
        for(const item of [excitationTarget,excitationHistory]) {bindTarget(item);gl!.clearColor(0,0,0,0);gl!.clear(gl!.COLOR_BUFFER_BIT);}
        if (bloomEnabled) targets.push(target(Math.ceil(width / 2), Math.ceil(height / 2)));
      };
      try {
        try { createTargets(); }
        catch (error) {
          deleteTargets();
          if (!useHdr) throw error;
          useHdr = false;
          createTargets();
        }

        renderTargetFailed = false;
        if (current) setStatus("ready");
      } catch (error) { deleteTargets(); renderTargetFailed = true; console.error(error);hideParticleLoading();setStatus("error"); return; }
      schedule();
    }
    function makeBuffer(bytes:number) {const buffer=gl!.createBuffer()!;gl!.bindBuffer(gl!.ARRAY_BUFFER,buffer);gl!.bufferData(gl!.ARRAY_BUFFER,bytes,gl!.DYNAMIC_COPY);return buffer;}
    function clearMotion(geometry:Geometry) {
      for(const buffer of [...geometry.motion.offsets,...geometry.motion.velocities]) {gl!.bindBuffer(gl!.ARRAY_BUFFER,buffer);gl!.bufferData(gl!.ARRAY_BUFFER,geometry.count*16,gl!.DYNAMIC_COPY);}
      geometry.motion.read=0;geometry.motion.history.forEach(item=>{item.time=-Infinity;});geometry.motion.lastCapture=-Infinity;
    }
    function bindMotion(geometry:Geometry) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER,geometry.motion.offsets[geometry.motion.read]);gl!.vertexAttribPointer(8,4,gl!.FLOAT,false,16,0);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,geometry.motion.velocities[geometry.motion.read]);gl!.vertexAttribPointer(9,4,gl!.FLOAT,false,16,0);
    }
    function upload(cloud: Cloud): Geometry {
      const vao = gl!.createVertexArray()!, buffer = gl!.createBuffer()!, galaxyBuffer = gl!.createBuffer()!, surfaceBuffer = gl!.createBuffer()!, maskTexture = gl!.createTexture()!,interactionTexture=gl!.createTexture()!,iconBuffer=gl!.createBuffer()!,indexBuffer=gl!.createBuffer()!;
      const { details, subjectPrefix } = buildParticleSurface(cloud.bytes, cloud.subjectMask);
      const contactPrefix=new Uint32Array(cloud.count+1),view=new DataView(cloud.bytes);
      for(let index=0;index<cloud.count;index++) {
        const offset=16+index*12;
        const selected=view.getUint8(offset+11)>=128 && isContactSource(view.getUint16(offset,true)/65535,view.getUint16(offset+2,true)/65535);
        contactPrefix[index+1]=contactPrefix[index]+Number(selected);
      }
      gl!.bindVertexArray(vao);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Uint8Array(cloud.bytes, 16), gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(0); gl!.vertexAttribPointer(0, 3, gl!.UNSIGNED_SHORT, true, 12, 0);
      gl!.enableVertexAttribArray(1); gl!.vertexAttribPointer(1, 3, gl!.UNSIGNED_BYTE, true, 12, 6);
      gl!.enableVertexAttribArray(2); gl!.vertexAttribPointer(2, 3, gl!.UNSIGNED_BYTE, true, 12, 9);
      const galaxy=buildGalaxyGeometry(cloud.count);
      const flowAges=buildParticleFlowAges(galaxy,startPopulated,settingsRef.current);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, galaxyBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, galaxy, gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(3); gl!.vertexAttribPointer(3, 3, gl!.FLOAT, false, 24, 0);
      gl!.enableVertexAttribArray(4); gl!.vertexAttribPointer(4, 3, gl!.FLOAT, false, 24, 12);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, surfaceBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, details, gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(5); gl!.vertexAttribPointer(5, 4, gl!.FLOAT, false, 16, 0);
      const flowBuffers=[gl!.createBuffer()!,gl!.createBuffer()!];
      const flowVaos=flowBuffers.map((ageBuffer)=>{
        const flowVao=gl!.createVertexArray()!;
        gl!.bindVertexArray(flowVao);
        gl!.bindBuffer(gl!.ARRAY_BUFFER,galaxyBuffer);
        gl!.enableVertexAttribArray(3);gl!.vertexAttribPointer(3,3,gl!.FLOAT,false,24,0);
        gl!.enableVertexAttribArray(4);gl!.vertexAttribPointer(4,3,gl!.FLOAT,false,24,12);
        gl!.bindBuffer(gl!.ARRAY_BUFFER,ageBuffer);
        gl!.bufferData(gl!.ARRAY_BUFFER,flowAges,gl!.DYNAMIC_COPY);
        gl!.enableVertexAttribArray(6);gl!.vertexAttribPointer(6,1,gl!.FLOAT,false,4,0);
        return flowVao;
      });
      gl!.bindVertexArray(vao);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,flowBuffers[0]);
      gl!.enableVertexAttribArray(6);gl!.vertexAttribPointer(6,1,gl!.FLOAT,false,4,0);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,iconBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER,buildParticleIconPositions(cloud.iconSamples,cloud.bytes,CONTACT_CENTER_UV[0]),gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(7);gl!.vertexAttribPointer(7,3,gl!.FLOAT,false,12,0);
      const motion:MotionState={offsets:[makeBuffer(cloud.count*16),makeBuffer(cloud.count*16)],velocities:[makeBuffer(cloud.count*16),makeBuffer(cloud.count*16)],color:makeBuffer(cloud.count*16),trailVao:gl!.createVertexArray()!,read:0,roles:makeBuffer(cloud.count*8),empty:makeBuffer(cloud.count*16),scratch:makeBuffer(cloud.count*16),history:[],write:0,lastCapture:-Infinity};
      for(const [location,buffer,size]of [[8,motion.offsets[0],4],[9,motion.velocities[0],4],[11,motion.roles,2],[12,motion.empty,4]] as const) {
        gl!.bindBuffer(gl!.ARRAY_BUFFER,buffer);gl!.enableVertexAttribArray(location);gl!.vertexAttribPointer(location,size,gl!.FLOAT,false,size*4,0);
      }
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER,indexBuffer);
      gl!.bindTexture(gl!.TEXTURE_2D, maskTexture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.R8, 512, 288, 0, gl!.RED, gl!.UNSIGNED_BYTE, cloud.subjectMask);
      const interaction=buildParticleInteractionField(cloud.bytes,cloud.subjectMask,isContactSource);
      gl!.bindTexture(gl!.TEXTURE_2D,interactionTexture);
      gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MIN_FILTER,gl!.NEAREST);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MAG_FILTER,gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_S,gl!.CLAMP_TO_EDGE);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_T,gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA32F,interaction.width,interaction.height,0,gl!.RGBA,gl!.FLOAT,interaction.data);
      gl!.bindVertexArray(motion.trailVao);
      for(const location of [0,1,2,4]) {
        gl!.bindBuffer(gl!.ARRAY_BUFFER,motion.empty);
        gl!.enableVertexAttribArray(location);gl!.vertexAttribPointer(location,4,gl!.FLOAT,false,16,0);gl!.vertexAttribDivisor(location,1);
      }
      gl!.bindBuffer(gl!.ARRAY_BUFFER,motion.empty);gl!.enableVertexAttribArray(3);gl!.vertexAttribPointer(3,1,gl!.FLOAT,false,16,12);gl!.vertexAttribDivisor(3,1);
      gl!.bindVertexArray(null);
      return { ...cloud, vao, buffer, galaxyBuffer, galaxy, surfaceBuffer,iconBuffer,indexBuffer, maskTexture,interactionTexture, subjectPrefix, contactPrefix,flowAges,flowBuffers,flowVaos,flowRead:0,motion };
    }
    function advanceFlow(geometry:Geometry,delta:number,parameters:ParticleSettings,releasedElapsed:number) {
      if(delta<=0 || (parameters.figureSpeed===0 && parameters.flowSpeed===0)) return;
      const allocation=allocateParticles(geometry,parameters);
      if(!geometry.flowStartup) geometry.flowStartup=createParticleFlowStartup(geometry.galaxy,allocation.flowIndices,parameters,startPopulated,geometry.flowAges);
      const startup=stepParticleFlowStartup(geometry.flowStartup,delta,NEBULA_EXTENTS_XYZ,parameters,allocation.flowIndices);
      geometry.flowStartup=startup.nextState;
      geometry.flowBoost=startup.endBoost;
      const output=1-geometry.flowRead;
      gl!.useProgram(flowProgram);
      gl!.uniform1f(fu.uDelta,delta);gl!.uniform1f(fu.uFigureSpeed,parameters.figureSpeed);
      gl!.uniform1f(fu.uFlowSpeed,parameters.flowSpeed);gl!.uniform1f(fu.uFlowRange,parameters.flowRange);
      gl!.uniform1f(fu.uFlowSpeedBias,parameters.flowSpeedBias);
      gl!.uniform1f(fu.uReleasedElapsed,releasedElapsed);
      gl!.uniform1f(fu.uStartupBoost,startup.boost);

      gl!.bindVertexArray(geometry.flowVaos[geometry.flowRead]);
      gl!.bindTransformFeedback(gl!.TRANSFORM_FEEDBACK,feedback);
      gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,0,geometry.flowBuffers[output]);
      gl!.enable(gl!.RASTERIZER_DISCARD);
      gl!.beginTransformFeedback(gl!.POINTS);
      gl!.drawArrays(gl!.POINTS,0,geometry.count);
      gl!.endTransformFeedback();
      gl!.disable(gl!.RASTERIZER_DISCARD);
      gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,0,null);
      gl!.bindTransformFeedback(gl!.TRANSFORM_FEEDBACK,null);
      geometry.flowRead=output;
    }
    function applyFigureSpeed(value:number) {
      if(settingsRef.current.figureSpeed!==value) {
        settingsRef.current={...settingsRef.current,figureSpeed:value};
      }
      return settingsRef.current;
    }
    function applyFlowTrail(value:number) {
      const adapted = compactViewport ? value * 0.45 : value;
      if(settingsRef.current.flowTrail!==adapted) {
        settingsRef.current={...settingsRef.current,introTrail:0,flowTrail:adapted};
      }
      return settingsRef.current;
    }
    async function initializeCloud() {
      try {
        const cloud = await loadCloud();
        if (disposed || gl!.isContextLost()) return;
        applyFigureSpeed(startPopulated?SETTLED_FIGURE_SPEED:OPENING_FIGURE_SPEED);
        applyFlowTrail(startPopulated?SETTLED_FLOW_TRAIL:OPENING_FLOW_TRAIL);
        current = upload(cloud);
        if (!renderTargetFailed) setStatus("ready");
        schedule();
      } catch (error) {
        if (disposed) return;
        console.error(error);
        hideParticleLoading();
        setStatus("error");
      }
    }
    function allocateParticles(geometry: Geometry, parameters: ParticleSettings) {
      const key=`${parameters.particleCount}/${parameters.galaxyRatio}`;
      if(!geometry.allocation || geometry.allocationKey!==key) {
        geometry.allocation=buildParticleAllocation(geometry.subjectPrefix,geometry.contactPrefix,Math.min(parameters.particleCount,geometry.count),parameters.galaxyRatio);
        geometry.allocationKey=key;
        gl!.bindVertexArray(geometry.vao);
        gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER,geometry.indexBuffer);
        gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER,geometry.allocation.indices,gl!.STATIC_DRAW);
        const roles=new Float32Array(geometry.count*2);
        for(const id of geometry.allocation.flowIndices)roles[id*2+1]=1;
        for(let i=geometry.allocation.sceneOffset;i<geometry.allocation.sceneOffset+geometry.allocation.sceneCount;i++){const id=geometry.allocation.indices[i];roles[id*2]=1;roles[id*2+1]=1;}
        gl!.bindBuffer(gl!.ARRAY_BUFFER,geometry.motion.roles);gl!.bufferSubData(gl!.ARRAY_BUFFER,0,roles);clearMotion(geometry);
      }
      return geometry.allocation;
    }
    function drawCloud(geometry: Geometry, parameters: ParticleSettings, morph: number, drawFigure=true,drawFlow=true) {
      const layers=allocateParticles(geometry,parameters);
      const total=layers.galaxyCount+layers.sceneCount;
      const subjectCount=layers.sceneCount,nebulaCount=layers.galaxyCount;
      // Keep light energy stable while changing sampling density. The extra
      // subject samples supply detail, rather than washing out dark surfaces.
      const sourceDensity=Math.pow(50000/total,.75);
      const nebulaDensity=Math.pow(24000/Math.max(1,nebulaCount),.75);
      gl!.uniform1f(pu.uNebulaDensity,sourceDensity+(nebulaDensity-sourceDensity)*morph);
      gl!.uniform1f(pu.uSubjectDensity,Math.min(1.6,Math.pow(65000/Math.max(1,subjectCount),.68)));
      gl!.uniform1f(pu.uAspect, geometry.aspect);
      gl!.uniform1i(pu.uSubjectMask,2); texture(geometry.maskTexture,2);
      gl!.bindVertexArray(geometry.vao);bindMotion(geometry);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,geometry.flowBuffers[geometry.flowRead]);
      gl!.vertexAttribPointer(6,1,gl!.FLOAT,false,4,0);
      gl!.uniform1f(pu.uLayer,1);
      gl!.uniform1f(pu.uGain, parameters.brightness);
      if(drawFlow)gl!.drawElements(gl!.POINTS,layers.galaxyCount,gl!.UNSIGNED_INT,layers.galaxyOffset*4);
      gl!.uniform1f(pu.uLayer,0);
      if(drawFigure)gl!.drawElements(gl!.POINTS,layers.sceneCount,gl!.UNSIGNED_INT,layers.sceneOffset*4);
      return { ...layers, subjectCount, nebulaCount };
    }
    function setPointUniforms(uni:Record<string,WebGLUniformLocation|null>,parameters:ParticleSettings,camera:ReturnType<typeof getParticleCamera>,timeline:ReturnType<typeof getParticleTimeline>) {
      gl!.uniform3f(uni.uCameraRight, ...camera.right);
      gl!.uniform3f(uni.uCameraUp, ...camera.up);
      gl!.uniform3f(uni.uCameraBack, ...camera.back);
      gl!.uniform1f(uni.uTime, clocks.shared);
      gl!.uniform1f(uni.uFigureFloatTime,clocks.figureFloat);gl!.uniform1f(uni.uFlowFloatTime,clocks.flowFloat);gl!.uniform1f(uni.uFlowRange,parameters.flowRange);
      gl!.uniform1f(uni.uIconVisibility,timeline.iconVisibility);gl!.uniform1f(uni.uFlowReleased,Number(timeline.flowReleased));
      gl!.uniform1f(uni.uDpr, dpr); gl!.uniform1f(uni.uScreenAspect, width / height); gl!.uniform1f(uni.uCssHeight, height / dpr);
      gl!.uniform1f(uni.uGalaxyTime,timeline.galaxyTime); gl!.uniform1f(uni.uSceneMorph,timeline.morph);
      gl!.uniform1f(uni.uGalaxyStrength,parameters.galaxyStrength); gl!.uniform1f(uni.uSceneStrength,parameters.sceneStrength);
      gl!.uniform1f(uni.uDepth, parameters.depth); gl!.uniform1f(uni.uCameraDistance, parameters.cameraDistance);
      gl!.uniform1f(uni.uReferenceDistance, REFERENCE_CAMERA_DISTANCE); gl!.uniform1f(uni.uFocal, 1/Math.tan(CAMERA_FOV*Math.PI/360));
      gl!.uniform1f(uni.uZoom, parameters.zoom); gl!.uniform1f(uni.uParticleSize, parameters.particleSize);
      gl!.uniform1f(uni.uFloatAmplitude, parameters.floatAmplitude); gl!.uniform1f(uni.uFocus, parameters.focus); gl!.uniform1f(uni.uDof, parameters.dof);
      gl!.uniform1f(uni.uHue, parameters.hueShift*Math.PI/180); gl!.uniform1f(uni.uSaturation, parameters.saturation);
      gl!.uniform1f(uni.uSubjectClarity, parameters.subjectClarity); gl!.uniform1f(uni.uContourProtection, parameters.contourProtection);
      gl!.uniform1f(uni.uEdgeDispersion, parameters.edgeDispersion);
      gl!.uniform1i(uni.uSurfaceField,3);texture(current!.interactionTexture,3);
      gl!.uniform1i(uni.uExcitationField,4);texture(excitationTarget!.texture,4);
      gl!.uniform1f(uni.uCenterWhiteness,parameters.centerWhiteness);
      const center=mouseCenter(parameters,camera);
      gl!.uniform3f(uni.uMouseCenter,center[0],center[1],center[2]);gl!.uniform1f(uni.uMouseRadius,parameters.mouseFieldRadius);gl!.uniform1f(uni.uMouseStrength,parameters.mouseFieldStrength);gl!.uniform1f(uni.uMouseActive,mouseActive&&parameters.mouseFieldStrength>0?1:0);
      gl!.uniform3f(uni.uMouseDirection,mouseDirection[0],mouseDirection[1],mouseDirection[2]);
    }
    function mouseCenter(parameters:ParticleSettings,camera:ReturnType<typeof getParticleCamera>) {
      const focal=1/Math.tan(CAMERA_FOV*Math.PI/360),fit=Math.min(1,width/height/current!.aspect)*(1.16+(1.02-1.16)*Math.min(1,Math.max(0,(width/height-.85)/.3))**2*(3-2*Math.min(1,Math.max(0,(width/height-.85)/.3))));
      const frame=fit*parameters.zoom*REFERENCE_CAMERA_DISTANCE/parameters.cameraDistance,z=.24*parameters.depth;
      const contact=[(CONTACT_CENTER_UV[0]*2-1)*current!.aspect*(parameters.cameraDistance-z)/focal*frame,(1-CONTACT_CENTER_UV[1]*2)*(parameters.cameraDistance-z)/focal*frame,z];
      return getParticlePointerCenter(mouseNdc[0],mouseNdc[1],camera,contact,width/height,focal);
    }
    function drawTrails(geometry:Geometry,parameters:ParticleSettings,camera:ReturnType<typeof getParticleCamera>) {

      if(parameters.introTrail<=0 && parameters.flowTrail<=0)return;
      const snapshots=geometry.motion.history.filter(item=>Number.isFinite(item.time) && motionTime-item.time<=.5).sort((a,b)=>a.time-b.time);
      if(snapshots.length<2)return;
      gl!.useProgram(trails);gl!.bindVertexArray(geometry.motion.trailVao);gl!.lineWidth(1);
      gl!.uniform3f(tu.uCameraRight,...camera.right);gl!.uniform3f(tu.uCameraUp,...camera.up);gl!.uniform3f(tu.uCameraBack,...camera.back);
      gl!.uniform1f(tu.uCameraDistance,parameters.cameraDistance);gl!.uniform1f(tu.uFocal,1/Math.tan(CAMERA_FOV*Math.PI/360));
      gl!.uniform1f(tu.uScreenAspect,width/height);gl!.uniform1f(tu.uCssHeight,height/dpr);
      gl!.uniform1f(tu.uIntroTrail,parameters.introTrail);gl!.uniform1f(tu.uFlowTrail,parameters.flowTrail);
      let pairs=0;
      const pairLimit = compactViewport ? 3 : interiorRef.current ? 5 : PARTICLE_TRAIL_MAX_PAIRS;
      for(let newerIndex=snapshots.length-1;newerIndex>0 && pairs<pairLimit;) {
        const olderIndex=Math.max(0,newerIndex-2),older=snapshots[olderIndex],newer=snapshots[newerIndex];
        const olderAge=motionTime-older.time,newerAge=Math.max(0,motionTime-newer.time);
        const weight=getParticleHistoryWeight(Math.max(parameters.introTrail,parameters.flowTrail),Math.max(.000001,newerAge));
        if(weight<.0002)break;
        if(newer.time-older.time<=.25) {
          gl!.bindBuffer(gl!.ARRAY_BUFFER,older.buffer);gl!.vertexAttribPointer(0,4,gl!.FLOAT,false,16,0);
          gl!.bindBuffer(gl!.ARRAY_BUFFER,newer.buffer);gl!.vertexAttribPointer(1,4,gl!.FLOAT,false,16,0);
          gl!.bindBuffer(gl!.ARRAY_BUFFER,newer.color);gl!.vertexAttribPointer(2,4,gl!.FLOAT,false,16,0);
          gl!.bindBuffer(gl!.ARRAY_BUFFER,older.color);gl!.vertexAttribPointer(4,4,gl!.FLOAT,false,16,0);
          gl!.bindBuffer(gl!.ARRAY_BUFFER,snapshots[Math.floor((olderIndex+newerIndex)/2)].buffer);gl!.vertexAttribPointer(3,1,gl!.FLOAT,false,16,12);
          gl!.uniform2f(tu.uTrailAges,olderAge,newerAge);
          gl!.drawArraysInstanced(gl!.LINES,0,2,geometry.count);pairs++;
        }
        newerIndex=olderIndex;
      }

    }
    function advanceMotion(geometry:Geometry,parameters:ParticleSettings,camera:ReturnType<typeof getParticleCamera>,timeline:ReturnType<typeof getParticleTimeline>,delta:number) {
      const allocation=allocateParticles(geometry,parameters),motion=geometry.motion;
      const capture=delta>0 && (parameters.introTrail>0 || parameters.flowTrail>0) && motionTime-motion.lastCapture>=PARTICLE_HISTORY_INTERVAL-.00001;
      let output=motion.scratch,colorOutput=motion.color;
      const previous=motion.history.length?motion.history[(motion.write+PARTICLE_HISTORY_CAPACITY-1)%PARTICLE_HISTORY_CAPACITY]:undefined;
      if(capture) {
        if(!motion.history[motion.write])motion.history[motion.write]={buffer:makeBuffer(geometry.count*16),color:makeBuffer(geometry.count*16),time:-Infinity};
        output=motion.history[motion.write].buffer;
        colorOutput=motion.history[motion.write].color;
      }
      gl!.useProgram(motionProgram);setPointUniforms(mu,parameters,camera,timeline);
      gl!.uniform1f(mu.uLayer,-1);gl!.uniform1f(mu.uMotionDelta,delta);gl!.uniform1f(mu.uHistoryKind,0);
      gl!.uniform1f(mu.uHasPreviousHistory,previous && Number.isFinite(previous.time)?1:0);
      const total=allocation.galaxyCount+allocation.sceneCount,sourceDensity=Math.pow(50000/total,.75),nebulaDensity=Math.pow(24000/Math.max(1,allocation.galaxyCount),.75);
      gl!.uniform1f(mu.uNebulaDensity,sourceDensity+(nebulaDensity-sourceDensity)*timeline.morph);
      gl!.uniform1f(mu.uSubjectDensity,Math.min(1.6,Math.pow(65000/Math.max(1,allocation.sceneCount),.68)));
      gl!.uniform1f(mu.uAspect,geometry.aspect);gl!.uniform1f(mu.uGain,parameters.brightness);
      gl!.uniform1i(mu.uSubjectMask,2);texture(geometry.maskTexture,2);
      gl!.bindVertexArray(geometry.vao);bindMotion(geometry);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,geometry.flowBuffers[geometry.flowRead]);gl!.vertexAttribPointer(6,1,gl!.FLOAT,false,4,0);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,previous?.buffer??motion.empty);gl!.vertexAttribPointer(12,4,gl!.FLOAT,false,16,0);
      gl!.bindTransformFeedback(gl!.TRANSFORM_FEEDBACK,feedback);
      gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,0,motion.offsets[1-motion.read]);
      gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,1,motion.velocities[1-motion.read]);
      gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,2,output);
      gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,3,colorOutput);
      gl!.enable(gl!.RASTERIZER_DISCARD);gl!.beginTransformFeedback(gl!.POINTS);gl!.drawArrays(gl!.POINTS,0,geometry.count);gl!.endTransformFeedback();gl!.disable(gl!.RASTERIZER_DISCARD);
      for(let slot=0;slot<4;slot++)gl!.bindBufferBase(gl!.TRANSFORM_FEEDBACK_BUFFER,slot,null);
      gl!.bindTransformFeedback(gl!.TRANSFORM_FEEDBACK,null);motion.read=1-motion.read;
      if(capture){motion.history[motion.write].time=motionTime;motion.write=(motion.write+1)%PARTICLE_HISTORY_CAPACITY;motion.lastCapture=motionTime;}
    }
    function drawExcitation(geometry:Geometry,parameters:ParticleSettings,camera:ReturnType<typeof getParticleCamera>,timeline:ReturnType<typeof getParticleTimeline>,flowDelta:number) {
      const layers=allocateParticles(geometry,parameters);
      bindTarget(excitationHistory!);gl!.disable(gl!.BLEND);gl!.disable(gl!.DEPTH_TEST);
      gl!.useProgram(excitationDecayProgram);gl!.bindVertexArray(screenVao);
      gl!.uniform1i(hu.uPreviousHeat,5);texture(excitationTarget!.texture,5);
      gl!.uniform1f(hu.uHeatDecay,Math.exp(-flowDelta/.35));
      gl!.drawArrays(gl!.TRIANGLES,0,3);
      gl!.enable(gl!.BLEND);gl!.blendEquation(gl!.MAX);gl!.blendFunc(gl!.ONE,gl!.ONE);
      gl!.useProgram(excitationProgram);
      gl!.uniform3f(eu.uCameraBack,...camera.back);
      const values={uDepth:parameters.depth,uCameraDistance:parameters.cameraDistance,uReferenceDistance:REFERENCE_CAMERA_DISTANCE,uFocal:1/Math.tan(CAMERA_FOV*Math.PI/360),uScreenAspect:width/height,uAspect:geometry.aspect,uZoom:parameters.zoom,uFlowRange:parameters.flowRange,uFlowFloatTime:clocks.flowFloat,uFloatAmplitude:parameters.floatAmplitude,uFlowReleased:Number(timeline.flowReleased),uSceneMorph:timeline.morph};
      for(const [name,value]of Object.entries(values))gl!.uniform1f(eu[name],value);
      gl!.uniform1i(eu.uSurfaceField,3);texture(geometry.interactionTexture,3);
      gl!.bindVertexArray(geometry.vao);bindMotion(geometry);
      gl!.bindBuffer(gl!.ARRAY_BUFFER,geometry.flowBuffers[geometry.flowRead]);
      gl!.vertexAttribPointer(6,1,gl!.FLOAT,false,4,0);
      gl!.drawElements(gl!.POINTS,layers.galaxyCount,gl!.UNSIGNED_INT,layers.galaxyOffset*4);
      [excitationTarget,excitationHistory]=[excitationHistory,excitationTarget];
    }
    function render(now: number) {
      frame = 0;
      const bloomEnabled = settingsRef.current.bloom > 0.0001;
      if (disposed || gl!.isContextLost() || !isVisible || !isPageVisible || targets.length !== (bloomEnabled ? 3 : 1) || !excitationTarget || !current) { lastTime = 0; return; }
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
      lastTime = now;
      let parameters = settingsRef.current;
      if(!loadingAligned) {
        const loading=readParticleLoadingClocks(isPaused);
        if(loading){clocks.shared=loading.shared;clocks.figureFloat=loading.figureFloat;loadingHoldUntil=now+180;}
        loadingAligned=true;
      }
      const simulationDelta=isPaused?0:delta;motionTime+=simulationDelta;
      const flowDelta=getParticleFlowDelta(clocks.figure,delta,parameters.figureSpeed,isPaused);
      const releasedElapsed=clocks.flowElapsed;
      const previousFigure=clocks.figure;
      clocks=advanceParticleClocks(clocks,delta,parameters,isPaused,flowDelta);
      if(now<loadingHoldUntil)clocks.figure=previousFigure;
      advanceFlow(current,flowDelta,parameters,releasedElapsed);
      if(!isPaused) {
        const change=advanceFigureSpeedSchedule(figureSpeedSchedule,current.flowStartup?.finished ?? false,current.flowBoost ?? 1);
        figureSpeedSchedule=change.state;
        if(change.figureSpeed!==null)parameters=applyFigureSpeed(change.figureSpeed);
        if(change.flowTrail!==null)parameters=applyFlowTrail(change.flowTrail);
      }
      if (interiorRef.current) {
        parameters = {
          ...parameters,
          floatAmplitude: compactViewport ? 4.7 : 5.9,
          galaxyStrength: compactViewport ? 0.87 : 0.96,
          sceneStrength: compactViewport ? 0.48 : 0.53,
        };
      }
      const timeline=getParticleTimeline(clocks.figure);
      const response = 1-Math.exp(-delta/parameters.cameraSmoothing);
      pointer[0] += (destination[0] - pointer[0]) * response;
      pointer[1] += (destination[1] - pointer[1]) * response;
      const camera = getParticleCamera(pointer[0], pointer[1], parameters.yawRange, parameters.pitchRange, parameters.cameraDistance);
      const motion=stepParticlePointerMotion(mouseMotion,now,simulationDelta,camera,mouseActive&&!isPaused);
      mouseMotion=motion.state;mouseDirection=motion.direction;

      advanceMotion(current,parameters,camera,timeline,simulationDelta);
      drawExcitation(current,parameters,camera,timeline,flowDelta);
      bindTarget(targets[0]);
      gl!.clearColor(0, 0, 0, 0); gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.enable(gl!.BLEND);gl!.blendEquation(gl!.FUNC_ADD);gl!.blendFunc(gl!.SRC_ALPHA,gl!.ONE);gl!.disable(gl!.DEPTH_TEST);
      drawTrails(current,parameters,camera);
      gl!.useProgram(points);
      setPointUniforms(pu,parameters,camera,timeline);
      const layers=drawCloud(current,parameters,timeline.morph);

      gl!.disable(gl!.BLEND); gl!.bindVertexArray(screenVao);
      if (bloomEnabled) {
        gl!.useProgram(blur); gl!.uniform1i(bu.uImage, 0);
        bindTarget(targets[1]); texture(targets[0].bloomSource!, 0);
        gl!.uniform2f(bu.uDirection, parameters.bloomRadius / width, 0); gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        bindTarget(targets[2]); texture(targets[1].texture, 0);
        gl!.uniform2f(bu.uDirection, 0, parameters.bloomRadius / height); gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      }
      bindTarget(null); gl!.useProgram(composite);
      texture(targets[0].texture, 0); texture(bloomEnabled ? targets[2].texture : targets[0].texture, 1);
      gl!.uniform1i(cu.uImage, 0); gl!.uniform1i(cu.uBloom, 1); gl!.uniform2f(cu.uResolution, width, height);
      gl!.uniform1f(cu.uBloomStrength, parameters.bloom); gl!.uniform1f(cu.uExposure, parameters.exposure);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      finishParticleLoading({duration:180});
      // Lower only the canvas resolution after sustained slow frames. The text
      // remains sharp DOM content, while point sprites tolerate this scaling.
      if (!isPaused && delta > 0) {
        qualityElapsed += delta;
        qualityFrames++;
        if (qualityElapsed >= 2.2) {
          const frameInterval = qualityElapsed / qualityFrames;
          if (frameInterval > 0.024 && qualityLevel < qualityLevels.length - 1) {
            qualityLevel++;
            fastWindows = 0;
            resize();
          } else if (frameInterval < 0.0178 && qualityLevel > 0) {
            fastWindows++;
            if (fastWindows >= 3) {
              qualityLevel--;
              fastWindows = 0;
              resize();
            }
          } else {
            fastWindows = 0;
          }
          qualityElapsed = 0;
          qualityFrames = 0;
        }
      }
      if ((!isPaused && (parameters.floatSpeed>0 || parameters.flowSpeed>0 || parameters.figureSpeed>0 || (mouseActive&&parameters.mouseFieldStrength>0) || now<mouseSettlingUntil)) || Math.abs(pointer[0] - destination[0]) + Math.abs(pointer[1] - destination[1]) > 0.00001) schedule();
      else lastTime = 0;
    }
    function schedule() { if (!frame && !disposed && isVisible && isPageVisible) frame = requestAnimationFrame(render); }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      mouseSettlingUntil=performance.now()+5000;
      if (event.target instanceof Element && event.target.closest("[data-particle-ui]")){mouseActive=false;mouseMotion=createParticlePointerMotion();mouseDirection=[0,0,0];schedule();return;}
      const bounds=canvas!.getBoundingClientRect();mouseNdc[0]=(event.clientX-bounds.left)/Math.max(1,bounds.width)*2-1;mouseNdc[1]=1-(event.clientY-bounds.top)/Math.max(1,bounds.height)*2;
      mouseActive=Math.abs(mouseNdc[0])<=1&&Math.abs(mouseNdc[1])<=1;
      mouseMotion=mouseActive?sampleParticlePointerMotion(mouseMotion,mouseNdc[0],mouseNdc[1],performance.now()):createParticlePointerMotion();
      destination[0] = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      destination[1] = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
      schedule();
    };
    const resetPointer = () => { destination[0] = 0; destination[1] = 0;mouseActive=false;mouseMotion=createParticlePointerMotion();mouseDirection=[0,0,0];mouseSettlingUntil=performance.now()+5000;schedule(); };
    const visibility = () => { isPageVisible = !document.hidden; lastTime = 0; if (isPageVisible) schedule(); else { mouseMotion=createParticlePointerMotion();mouseDirection=[0,0,0];cancelAnimationFrame(frame); frame = 0; } };
    const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; setStatus("loading"); };
    const restored = () => setContextVersion((version) => version + 1);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting; lastTime = 0;
      if (isVisible) schedule(); else { cancelAnimationFrame(frame); frame = 0; }
    });
    intersection.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", visibility);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    controller.current = { pause: (value) => { isPaused = value; lastTime = 0; schedule(); } };
    resize();
    void initializeCloud();

    return () => {
      disposed = true; controller.current = null;
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      if (current) { gl.deleteVertexArray(current.vao); gl.deleteBuffer(current.buffer); gl.deleteBuffer(current.galaxyBuffer); gl.deleteBuffer(current.surfaceBuffer);gl.deleteBuffer(current.iconBuffer);gl.deleteBuffer(current.indexBuffer); gl.deleteTexture(current.maskTexture);gl.deleteTexture(current.interactionTexture);current.flowBuffers.forEach(buffer=>gl.deleteBuffer(buffer));current.flowVaos.forEach(vao=>gl.deleteVertexArray(vao)); }
      if(current){const m=current.motion;gl.deleteVertexArray(m.trailVao);[...m.offsets,...m.velocities,m.color,m.roles,m.empty,m.scratch,...m.history.flatMap(item=>[item.buffer,item.color])].forEach(buffer=>gl.deleteBuffer(buffer));}
      loadingCleanupTimer=window.setTimeout(hideParticleLoading,0);
      gl.deleteTransformFeedback(feedback);
      gl.deleteVertexArray(screenVao); deleteTargets(); programs.forEach((item) => gl.deleteProgram(item));
    };
  }, [contextVersion,startSettled]);

  return <div className={`point-cloud-scene ${className ?? ""}`} data-state={status}>
    <canvas ref={canvasRef} role="img" aria-label={lang === "zh" ? "红橙色三维体积星云舒展并与 XR 使用者和机器人指尖相遇的点云融为一体" : "A red-orange volumetric nebula expands and merges with an XR user and a robot touching fingertips"} style={{ width: "100%", height: "100%", display: "block" }} />
    {status !== "ready" && <p className="point-cloud-status" role="status">
      {status === "loading" ? (lang === "zh" ? "正在加载粒子场" : "Loading particle field") : (lang === "zh" ? "粒子场暂时无法显示，请使用导航浏览实验室。" : "The particle field is unavailable. Use the navigation to explore the laboratory.")}
    </p>}
  </div>;
}
