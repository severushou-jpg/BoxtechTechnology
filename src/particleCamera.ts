export const CAMERA_FOV = 42;
export const REFERENCE_CAMERA_DISTANCE = 5.8;

/** A bounded orbit around the scene center; the geometry stays fixed. */
export function getParticleCamera(
  pointerX: number,
  pointerY: number,
  yawRange: number,
  pitchRange: number,
  distance: number,
) {
  const radians = Math.PI / 180;
  const x = Number.isFinite(pointerX) ? Math.max(-1, Math.min(1, pointerX)) : 0;
  const y = Number.isFinite(pointerY) ? Math.max(-1, Math.min(1, pointerY)) : 0;
  const yaw = x * Math.max(0, Math.min(16, yawRange)) * radians;
  const pitch = -y * Math.max(0, Math.min(12, pitchRange)) * radians;
  const sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
  return {
    right: [cy, 0, -sy] as const,
    up: [-sy * sp, cp, -cy * sp] as const,
    back: [sy * cp, sp, cy * cp] as const,
    distance,
    yawDegrees: yaw / radians,
    pitchDegrees: pitch / radians,
  };
}
