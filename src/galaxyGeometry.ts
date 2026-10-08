/**
 * Deterministic, fully volumetric red-orange nebula.
 * Layout: final XYZ, random1, random2, population. Population 0 is a sparse
 * nucleus, 1 thick smoke filaments and filled interior, 2 faint diffuse haze.
 * Every prefix retains all populations. Density is baked in CPU geometry.
 * The original compact cloud unfolds without a disk, tube shell or rotation.
 */
export const GALAXY_VERTEX_STRIDE = 6;
export const NEBULA_EXTENTS_XYZ = [3.85, 1.82, 2.5] as const;
export const GALAXY_CONTACT_ANCHOR = [-0.07, 0.415, 0.1] as const;
export const GALAXY_FORM_DURATION = 3;
// Compatibility names; these now describe the volume's extents.
export const GALAXY_DISK_RADIUS = NEBULA_EXTENTS_XYZ[0];
export const GALAXY_DISK_DEPTH_RADIUS = NEBULA_EXTENTS_XYZ[2];
export const GALAXY_DISK_THICKNESS = NEBULA_EXTENTS_XYZ[1];
export type GalaxyVector = [number, number, number];

export function buildGalaxyGeometry(count: number): Float32Array {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Nebula point count must be a positive safe integer.");
  const vertices = new Float32Array(count * GALAXY_VERTEX_STRIDE);
  let state = 0x6a09e667;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(1e-8, random()))) * Math.cos(random() * Math.PI * 2);
  for (let point = 0; point < count; point += 1) {
    const offset = point * GALAXY_VERTEX_STRIDE;
    const populationRandom = random();
    let population: number;
    let x: number, y: number, z: number;
    if (populationRandom < 0.065) {
      population = 0;
      const spread = random() < 0.76 ? 0.148 : 0.28;
      x = gaussian() * spread;
      y = gaussian() * spread;
      z = gaussian() * spread * 0.83;
    } else if (populationRandom < 0.725) {
      population = 1;
      const branch = random();
      const along = random() * 2 - 1;
      // Overlapping bent filaments have thick Gaussian cross sections. Their
      // interiors contain points rather than tracing hollow tube surfaces.
      if (branch < 0.30) {
        x = along * 2.85 + gaussian() * 0.38;
        y = Math.sin(along * 2 + 0.35) * 0.62 + gaussian() * 0.59;
        z = Math.sin(along * 2.7 - 0.7) * 0.85 + gaussian() * 0.65;
      } else if (branch < 0.58) {
        x = along * 2.25 + 0.45 + gaussian() * 0.52;
        y = Math.cos(along * 1.6) * 0.85 - 0.38 + gaussian() * 0.65;
        z = -0.72 + along * 0.83 + Math.sin(along * 2.2) * 0.32 + gaussian() * 0.54;
      } else if (branch < 0.80) {
        x = along * 2.6 - 0.35 + gaussian() * 0.55;
        y = -0.60 + along * 0.92 + gaussian() * 0.60;
        z = 0.72 - Math.sin(along * 2.4) * 0.75 + gaussian() * 0.60;
      } else {
        // Low-density inner fill joins the lobes without a uniform ball.
        x = gaussian() * 1.4;
        y = gaussian() * 0.85;
        z = gaussian() * 1.0;
      }
    } else {
      population = 2;
      // Loose full-volume haze with broad side lobes and true front/back depth.
      const side = random() < 0.5 ? -1 : 1;
      x = gaussian() * 1.0 + side * (0.75 + random() * 1.65);
      y = gaussian() * 0.82 + Math.sin(x * 0.8) * 0.25;
      z = gaussian() * 1.04 + side * 0.42;
    }
    // Compress along each point's spatial ray. Independent axis clamps flatten
    // the outer lobes into a box; this smooth ellipsoidal envelope preserves
    // their directions, with a gradual, rounded three-dimensional boundary.
    const radius = Math.hypot(x / NEBULA_EXTENTS_XYZ[0], y / NEBULA_EXTENTS_XYZ[1], z / NEBULA_EXTENTS_XYZ[2]);
    const boundaryScale = 1.08 / Math.pow(1 + Math.pow(radius * 1.08, 6), 1 / 6);
    vertices[offset] = x * boundaryScale;
    vertices[offset + 1] = y * boundaryScale;
    vertices[offset + 2] = z * boundaryScale;
    vertices[offset + 3] = random();
    vertices[offset + 4] = random();
    vertices[offset + 5] = population;
  }
  return vertices;
}

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const mix = (first: number, second: number, amount: number) => first + (second - first) * amount;
function smoothstep(low: number, high: number, value: number) {
  const fraction = clamp((value - low) / (high - low), 0, 1);
  return fraction * fraction * (3 - 2 * fraction);
}

/**
 * CPU counterpart of galaxyScenePosition for numerical checks and diagnostic
 * renders. Includes the contact anchor once. Geometry and seed bake all density
 * noise: forming and idle positions use no CPU/GPU hash. Runtime animation stays
 * in GLSL, so this helper adds no per-frame JS point loop.
 */
export function getGalaxyPosition(
  base: ArrayLike<number>, detail: ArrayLike<number>, shapeTime: number,
  motionTime = shapeTime, amplitude = 1,
): GalaxyVector {
  const time = Math.max(0, motionTime);
  const forming = clamp(shapeTime, 0, GALAXY_FORM_DURATION);
  const strength = clamp(amplitude, 0, 4);
  const phase = forming / GALAXY_FORM_DURATION;
  const seed = detail[0] * Math.PI * 2;
  const secondSeed = detail[1] * Math.PI * 2;
  const opening = Math.sin(phase * Math.PI);
  const normalizedRadius = Math.sqrt([0, 1, 2].reduce((sum, axis) => sum + (base[axis] / NEBULA_EXTENTS_XYZ[axis]) ** 2, 0) / 3);
  const sourceRadius = 0.06 + Math.pow(clamp(normalizedRadius, 0, 1), 0.55) * 0.64;
  const sourceZ = detail[1] * 2 - 1;
  const sourceXY = Math.sqrt(Math.max(0, 1 - sourceZ * sourceZ));
  const compact: GalaxyVector = [Math.cos(seed) * sourceXY * sourceRadius, Math.sin(seed) * sourceXY * sourceRadius, sourceZ * sourceRadius];
  const unfold: GalaxyVector = [
    smoothstep(0, 2.70, forming),
    smoothstep(0.10, 2.90, forming),
    smoothstep(0.15, GALAXY_FORM_DURATION, forming),
  ];
  const breathing = 1 + Math.sin(time * 0.16) * 0.006 * strength;
  const drift = (detail[2] < 0.5 ? 0.004 : detail[2] > 1.5 ? 0.026 : 0.014) * strength;
  const position: GalaxyVector = [
    (mix(compact[0], base[0], unfold[0]) + Math.sin(seed + base[1] * 0.9 + phase * 2) * 0.12 * opening) * breathing,
    (mix(compact[1], base[1], unfold[1]) + Math.cos(secondSeed + base[0] * 0.7 + phase * 1.6) * 0.16 * opening) * breathing,
    (mix(compact[2], base[2], unfold[2]) + Math.sin(seed + secondSeed + base[2] * 0.8 + phase * 1.8) * 0.18 * opening) * breathing,
  ];
  return [
    position[0] + Math.sin(time * 0.27 + seed * 3 + base[1] * 0.70 + base[2] * 0.24) * drift + GALAXY_CONTACT_ANCHOR[0],
    position[1] + Math.cos(time * 0.21 + secondSeed * 4 + base[0] * 0.55) * drift + GALAXY_CONTACT_ANCHOR[1],
    position[2] + Math.sin(time * 0.19 + seed * 2 + secondSeed + base[0] * 0.35) * drift + GALAXY_CONTACT_ANCHOR[2],
  ];
}
export const getGalaxyScenePositionCPU = getGalaxyPosition;

/** Stable shader interfaces; shapeTime unfolds the nebula over 0..3 seconds. */
export const GALAXY_GLSL = `
const float GALAXY_TAU = 6.28318530718;
const vec3 NEBULA_BOUNDS = vec3(${NEBULA_EXTENTS_XYZ.map((value) => value.toFixed(2)).join(", ")});
float galaxyHash(vec3 value) {
  return fract(sin(dot(value, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}
vec3 galaxyShapePosition(vec3 base, vec3 detail, float foldingTime, float motionTime, float amplitude) {
  float time = max(0.0, motionTime);
  float forming = clamp(foldingTime, 0.0, ${GALAXY_FORM_DURATION.toFixed(1)});
  float strength = clamp(amplitude, 0.0, 4.0);
  float phase = forming / ${GALAXY_FORM_DURATION.toFixed(1)};
  float seed = detail.x * GALAXY_TAU;
  float secondSeed = detail.y * GALAXY_TAU;
  float opening = sin(phase * 3.14159265359);
  float normalizedRadius = length(base / NEBULA_BOUNDS) / 1.73205080757;
  float sourceRadius = 0.06 + pow(clamp(normalizedRadius, 0.0, 1.0), 0.55) * 0.64;
  float sourceZ = detail.y * 2.0 - 1.0;
  float sourceXY = sqrt(max(0.0, 1.0 - sourceZ * sourceZ));
  vec3 compact = vec3(cos(seed) * sourceXY, sin(seed) * sourceXY, sourceZ) * sourceRadius;
  vec3 unfold = vec3(smoothstep(0.0, 2.70, forming), smoothstep(0.10, 2.90, forming),
    smoothstep(0.15, ${GALAXY_FORM_DURATION.toFixed(1)}, forming));
  vec3 position = mix(compact, base, unfold);
  position += vec3(
    sin(seed + base.y * 0.9 + phase * 2.0) * 0.12,
    cos(secondSeed + base.x * 0.7 + phase * 1.6) * 0.16,
    sin(seed + secondSeed + base.z * 0.8 + phase * 1.8) * 0.18) * opening;
  position *= 1.0 + sin(time * 0.16) * 0.006 * strength;
  float drift = (detail.z < 0.5 ? 0.004 : (detail.z > 1.5 ? 0.026 : 0.014)) * strength;
  position += vec3(
    sin(time * 0.27 + seed * 3.0 + base.y * 0.70 + base.z * 0.24),
    cos(time * 0.21 + secondSeed * 4.0 + base.x * 0.55),
    sin(time * 0.19 + seed * 2.0 + secondSeed + base.x * 0.35)) * drift;
  return position;
}
vec3 galaxyPosition(vec3 base, vec3 detail, float t) {
  return galaxyShapePosition(base, detail, t, t, 1.0);
}
vec3 galaxyScenePosition(vec3 base, vec3 detail, float shapeTime, float motionTime, float amplitude) {
  return galaxyShapePosition(base, detail, shapeTime, motionTime, amplitude) + vec3(-0.07, 0.415, 0.1);
}
vec3 galaxyColor(vec3 base, vec3 detail, float t) {
  float tint = galaxyHash(detail + vec3(0.4, 11.7, 3.2));
  float core = 1.0 - smoothstep(0.04, 0.40, length(base));
  vec3 ember = mix(vec3(1.0, 0.085, 0.070), vec3(1.0, 0.34, 0.18), tint);
  float hotStar = pow(tint, 12.0) * 0.42;
  ember = mix(ember, vec3(1.0, 0.50, 0.27), hotStar);
  return mix(ember, vec3(1.0, 0.72, 0.52), core * 0.83);
}
// A flow particle's only white region is the live contact sphere. A core tint
// attached to its immutable seed would otherwise carry pale stars far outside.
vec3 galaxyFlowColor(vec3 detail) {
  float tint = galaxyHash(detail + vec3(0.4, 11.7, 3.2));
  return mix(vec3(1.0, 0.085, 0.070), vec3(1.0, 0.34, 0.18), tint);
}
float galaxySize(vec3 detail) {
  return 0.76 + pow(galaxyHash(detail + vec3(7.1, 2.3, 19.1)), 5.0) * 1.5;
}
float galaxyGain(vec3 base, vec3 detail, float t) {
  float sparkle = galaxyHash(detail + vec3(6.7, 0.8, 23.5));
  float nucleus = 1.0 - step(0.5, detail.z);
  float halo = step(1.5, detail.z);
  float gain = 0.085 + pow(sparkle, 3.0) * 0.16;
  gain += nucleus * 0.025;
  gain *= mix(1.0, 0.37, halo);
  gain *= mix(1.0, 0.58, nucleus * smoothstep(1.7, ${GALAXY_FORM_DURATION.toFixed(1)}, t));
  return gain * mix(0.53, 1.0, smoothstep(0.05, 0.48, t));
}
`;
