// Compatibility exports: the old separate nebula-unfolding stage is replaced.
export const GALAXY_DURATION = 0;
export const TRANSITION_DURATION = 6.4;
export const ICON_HOLD_DURATION = .72;
export const INTRO_DURATION = ICON_HOLD_DURATION+TRANSITION_DURATION;
export const EMISSION_DURATION = ICON_HOLD_DURATION+1.68;
export const FLOW_RELEASE_PROGRESS = .9;
export const FLOW_WARMUP_TIME = 44;

export type ParticleClocks = { shared: number; figure: number; flow: number; flowFloat: number; figureFloat: number; flowElapsed: number };
type MotionSpeeds = { floatSpeed: number; figureSpeed: number; flowSpeed: number };

export function initialParticleClocks(reducedMotion = false): ParticleClocks {
  return { shared: 0, figure: reducedMotion ? INTRO_DURATION : 0, flow: reducedMotion ? FLOW_WARMUP_TIME : 0, figureFloat: 0, flowFloat: 0, flowElapsed: reducedMotion ? FLOW_WARMUP_TIME : 0 };
}

/** Integrate separate clocks so changing a speed never changes an existing phase. */
export function advanceParticleClocks(clocks: ParticleClocks, delta: number, speeds: MotionSpeeds, paused: boolean,flowDelta=delta): ParticleClocks {
  if (paused) return { ...clocks };
  const dt = Number.isFinite(delta) ? Math.max(0,delta) : 0;
  const flowDt=Number.isFinite(flowDelta) ? Math.max(0,Math.min(dt,flowDelta)) : 0;
  const speed = (value: number, maximum: number) => Number.isFinite(value) ? Math.max(0,Math.min(maximum,value)) : 0;
  const shared = speed(speeds.floatSpeed,3), figure = speed(speeds.figureSpeed,2), flow = speed(speeds.flowSpeed,2);
  return {
    shared: clocks.shared+dt*shared,
    figure: clocks.figure+dt*figure,
    flow: clocks.flow+flowDt*flow,
    figureFloat: clocks.figureFloat+dt*figure*shared,
    flowFloat: clocks.flowFloat+flowDt*flow*shared,
    // Real released time is independent of the two transport speed controls.
    // It freezes with the field, so a resumed intro finishes its initial fill.
    flowElapsed: clocks.flowElapsed+((figure>0 || flow>0) ? flowDt : 0),
  };
}

/** Only the part of a frame after formation is almost settled can emit flow.
 * Preview follows its displayed phase; hiding a formed flow does not reset it. */
export function getParticleFlowDelta(figureTime:number,delta:number,figureSpeed:number,paused:boolean,previewProgress:number|null) {
  if(paused) return 0;
  const dt=Number.isFinite(delta) ? Math.max(0,Math.min(.1,delta)) : 0;
  const threshold=ICON_HOLD_DURATION+TRANSITION_DURATION*FLOW_RELEASE_PROGRESS;
  if(previewProgress!==null && Number.isFinite(previewProgress)) return previewProgress*INTRO_DURATION>=threshold ? dt : 0;
  if(figureTime>=threshold) return dt;
  const speed=Number.isFinite(figureSpeed) ? Math.max(0,Math.min(2,figureSpeed)) : 0;
  return speed>0 ? Math.max(0,dt-(threshold-figureTime)/speed) : 0;
}

/** Preview freezes only this clock, leaving live particle drift and camera usable. */
export function getParticleTimeline(elapsed: number, previewProgress: number | null) {
  const preview = previewProgress !== null && Number.isFinite(previewProgress)
    ? Math.min(1, Math.max(0, previewProgress)) : null;
  const time = preview !== null ? preview * INTRO_DURATION : Math.min(INTRO_DURATION,Math.max(0, Number.isFinite(elapsed) ? elapsed : 0));
  const morph = Math.min(1,Math.max(0,(time-ICON_HOLD_DURATION)/TRANSITION_DURATION));
  const iconFade=Math.min(1,morph/.12);
  return {
    time,
    // Keep the final nebula's existing material calibration throughout launch.
    galaxyTime: 3,
    morph,
    iconVisibility:1-iconFade*iconFade*(3-2*iconFade),
    flowReleased:morph>=FLOW_RELEASE_PROGRESS,
    progress: Math.min(1, time / INTRO_DURATION),
    stage: time<=ICON_HOLD_DURATION ? "icon" : time < EMISSION_DURATION ? "emitting" : morph < 1 ? "forming" : "composite",
  };
}
