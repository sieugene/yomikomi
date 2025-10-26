export const SELECTION = {
  MIN_SIZE: 10,
  BORDER_WIDTH: 2,
  CORNER_SIZE: 3,
} as const;

export const ZOOM = {
  MIN: 0.5,
  MAX: 3,
  STEP: 0.25,
} as const;

export const LOADING = {
  PROGRESS_INTERVAL: 100,
  PROGRESS_STEP: 10,
  MAX_SIMULATED_PROGRESS: 90,
  TRANSITION_DELAY: 300,
} as const;

export const ANIMATION = {
  FADE_IN_DURATION: 200,
  SLIDE_IN_DURATION: 300,
  SLIDE_IN_BOTTOM_DURATION: 500,
} as const;