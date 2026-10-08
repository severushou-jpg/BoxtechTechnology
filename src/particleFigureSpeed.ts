export const OPENING_FIGURE_SPEED = 1.3;
export const SETTLED_FIGURE_SPEED = .65;
export const OPENING_FLOW_TRAIL = 0;
export const SETTLED_FLOW_TRAIL = 1;

export type FigureSpeedScheduleState = { settled: boolean };

export function createFigureSpeedSchedule(populated = false): FigureSpeedScheduleState {
  return { settled: populated };
}

/** Change speed and enable diffusion trails once spatial filling and its gain settle.
 * Pause keeps this state unchanged; replay starts a fresh schedule. */
export function advanceFigureSpeedSchedule(
  state: FigureSpeedScheduleState,
  startupFinished: boolean,
  boost: number,
): { state: FigureSpeedScheduleState; figureSpeed: number | null; flowTrail: number | null } {
  if (state.settled || !startupFinished || !Number.isFinite(boost) || boost > 1 + 1e-4) {
    return { state, figureSpeed: null, flowTrail: null };
  }
  return { state: { settled: true }, figureSpeed: SETTLED_FIGURE_SPEED, flowTrail: SETTLED_FLOW_TRAIL };
}
