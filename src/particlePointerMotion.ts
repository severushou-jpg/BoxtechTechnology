type Vector = readonly number[];
type Pair = [number, number];
export type ParticlePointerMotion = { sample: Pair | null; sampledAt: number; velocity: Pair; smoothed: Pair };

export function createParticlePointerMotion(): ParticlePointerMotion {
  return { sample: null, sampledAt: 0, velocity: [0, 0], smoothed: [0, 0] };
}

/** Record actual pointer movement in screen coordinates, independently of camera orbit. */
export function sampleParticlePointerMotion(state: ParticlePointerMotion, x: number, y: number, now: number): ParticlePointerMotion {
  if (![x, y, now].every(Number.isFinite)) return state;
  const elapsed = (now - state.sampledAt) / 1000;
  let velocity: Pair = [0, 0];
  if (state.sample && elapsed > 0 && elapsed <= .2) {
    const vx = (x - state.sample[0]) / Math.max(.008, elapsed);
    const vy = (y - state.sample[1]) / Math.max(.008, elapsed);
    const scale = 1 / Math.max(.6, Math.hypot(vx, vy));
    velocity = [vx * scale, vy * scale];
  }
  return { ...state, sample: [x, y], sampledAt: now, velocity };
}

/** Smooth the push, let it fade after the pointer stops, and orient it in the current view. */
export function stepParticlePointerMotion(state: ParticlePointerMotion, now: number, delta: number, camera: { right: Vector; up: Vector }, enabled = true) {
  if (!enabled) return { state: { ...state, smoothed: [0, 0] as Pair }, direction: [0, 0, 0] };
  const dt = Math.max(0, Math.min(.1, Number.isFinite(delta) ? delta : 0));
  const age = Number.isFinite(now) ? Math.max(0, now - state.sampledAt - 30) / 1000 : Infinity;
  const decay = Math.exp(-age / .08), response = 1 - Math.exp(-dt / .035);
  const smoothed = state.smoothed.map((value, index) => {
    const result = value + (state.velocity[index] * decay - value) * response;
    return Math.abs(result) < 1e-6 ? 0 : result;
  }) as Pair;
  const direction = [0, 1, 2].map(index => camera.right[index] * smoothed[0] + camera.up[index] * smoothed[1]);
  return { state: { ...state, smoothed }, direction };
}
