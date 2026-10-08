import type { ParticleSettings } from "./particleSettings";

export type ParticleLoadingClocks = { shared: number; figureFloat: number; elapsed: number };
type ParticleLoadingController = {
  phase: (settings?: Partial<ParticleSettings>, paused?: boolean) => ParticleLoadingClocks;
  finish: (duration?: number) => void;
  hide: () => void;
};

declare global {
  interface Window { __i2ParticleLoading?: ParticleLoadingController }
}

/** Carry the already-visible loader's floating phase into the first GPU frame.
 * The icon/figure formation clock deliberately remains at the start. */
export function readParticleLoadingClocks(settings?: Partial<ParticleSettings>, paused?: boolean): ParticleLoadingClocks | null {
  return window.__i2ParticleLoading?.phase(settings, paused) ?? null;
}

/** Call after the matching first WebGL frame has been drawn. Keep the opening
 * in its icon hold during this short opacity handoff. Safe to call repeatedly. */
export function finishParticleLoading({ duration = 180 }: { duration?: number } = {}): void {
  window.__i2ParticleLoading?.finish(duration);
}

/** Detail routes and a failed GPU renderer must never retain the overlay. */
export function hideParticleLoading(): void { window.__i2ParticleLoading?.hide(); }
