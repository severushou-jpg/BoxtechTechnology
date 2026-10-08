export const DEFAULT_PARTICLE_SETTINGS = {
  particleCount: 100000,
  particleSize: 1,
  brightness: 1.5,
  exposure: 7.2,
  bloom: 0,
  bloomRadius: 0.5,
  depth: 0.6,
  yawRange: 2,
  pitchRange: 2,
  cameraDistance: 7.2,
  zoom: 1.3,
  cameraSmoothing: 0.2,
  floatAmplitude: 4,
  floatSpeed: 3,
  figureSpeed: 1.3,
  flowSpeed: 2,
  flowSpeedBias: 0.5,
  flowRange: 1,
  focus: 0.25,
  dof: 2,
  hueShift: -10,
  saturation: 1,
  galaxyRatio: 0.2,
  galaxyStrength: 0.8,
  sceneStrength: 0.45,
  subjectClarity: 1,
  contourProtection: 1,
  edgeDispersion: 2,
  introTrail: 0,
  flowTrail: 0,
  centerWhiteness: 0.85,
  mouseFieldRadius: 0.15,
  mouseFieldStrength: 2,
};

export type ParticleSettings = typeof DEFAULT_PARTICLE_SETTINGS;
export const SPECIFIED_PARTICLE_PRESET: ParticleSettings = { ...DEFAULT_PARTICLE_SETTINGS };
export const PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v10";
export const PARTICLE_TRAIL_MIGRATION_STORAGE_KEY = "i2lab-particle-light-trails-v1";
export const NEWEST_LEGACY_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v9";
export const PRIOR_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v8";
export const RECENT_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v7";
export const PREVIOUS_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v6";
export const LEGACY_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v5";
export const OLDER_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v4";
export const OLDEST_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v3";
export const EARLIEST_PARTICLE_SETTINGS_STORAGE_KEY = "i2lab-particle-settings-v2";

export const PARTICLE_PARAMETER_RANGES: Record<keyof ParticleSettings, readonly [number, number]> = {
  particleCount: [20000, 238000],
  particleSize: [0.25, 2.5],
  brightness: [0, 1.8],
  exposure: [1, 12],
  bloom: [0, 1.5],
  bloomRadius: [0.5, 8],
  depth: [0, 3],
  yawRange: [0, 16],
  pitchRange: [0, 12],
  cameraDistance: [6, 14],
  zoom: [0.65, 1.3],
  cameraSmoothing: [0.03, 1.2],
  floatAmplitude: [0, 4],
  floatSpeed: [0, 3],
  figureSpeed: [0, 2],
  flowSpeed: [0, 2],
  flowSpeedBias: [0, 1],
  flowRange: [0.5, 2.5],
  focus: [-1, 1],
  dof: [0, 2],
  hueShift: [-45, 45],
  saturation: [0, 1.8],
  galaxyRatio: [0.1, 0.7],
  galaxyStrength: [0, 1.8],
  sceneStrength: [0, 1.8],
  subjectClarity: [0, 1],
  contourProtection: [0, 1],
  edgeDispersion: [0, 2],
  introTrail: [0, 0],
  flowTrail: [0, 1],
  centerWhiteness: [0, 1],
  mouseFieldRadius: [0.1, 2.5],
  mouseFieldStrength: [0, 3],
};

export function normalizeParticleSettings(value: unknown): ParticleSettings {
  const settings = { ...DEFAULT_PARTICLE_SETTINGS };
  if (!value || typeof value !== "object" || Array.isArray(value)) return settings;
  const input = value as Record<string, unknown>;
  for (const key of Object.keys(settings) as Array<keyof ParticleSettings>) {
    const entry = input[key];
    if (typeof entry !== "number" || !Number.isFinite(entry)) continue;
    const [min, max] = PARTICLE_PARAMETER_RANGES[key];
    settings[key] = Math.min(max, Math.max(min, entry));
  }
  settings.particleCount = Math.round(settings.particleCount);
  // Keep the legacy JSON field readable without reviving figure/icon trails.
  settings.introTrail = 0;
  return settings;
}

/** Retained for older imports; new openings no longer upgrade trail strengths. */
export function migrateParticleTrailDefaults(settings: ParticleSettings): ParticleSettings {
  return settings;
}
