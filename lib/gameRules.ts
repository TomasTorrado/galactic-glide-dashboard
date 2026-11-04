// Game rules shown to clinicians. Level values mirror the Galactic Glide game
// (core/constants.py, core/profile_store.py, game_loop.py). Difficulty values are
// placeholders until they are set through testing — see docs/game-todo.md.

import type { Difficulty } from "./mockData";

export interface LevelRule {
  /** Gates the patient must pass to clear the level. */
  gates: number;
  /** [min, max] seconds between gates. */
  gap: [number, number];
  /** Activation needed to rise, as % of the patient's max EMG. */
  activationPct: number;
}

/** Levels 1–5, as the game plays them today. */
export const LEVEL_RULES: LevelRule[] = [
  { gates: 10, gap: [8, 12], activationPct: 5 },
  { gates: 10, gap: [7, 10], activationPct: 10 },
  { gates: 10, gap: [6, 8], activationPct: 15 },
  { gates: 10, gap: [5, 6], activationPct: 20 },
  { gates: 10, gap: [4, 5], activationPct: 25 },
];

/** Height of a gate opening in the game today, in pixels. */
export const GATE_OPENING_PX = 170;

export interface DifficultyProfile {
  summary: string;
  /** Multiplies the level's activation %. */
  activationScale: number;
  opening: { label: string; px: number };
  /** Seconds added to (or taken from) the level's time between gates. */
  restDelta: number;
}

export const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  Easy: {
    summary: "A lighter squeeze lifts the astronaut, gate openings are wider, and there is more rest between gates.",
    activationScale: 0.75,
    opening: { label: "Wide", px: 220 },
    restDelta: 2,
  },
  Medium: {
    summary: "The level as designed: standard squeeze, standard gate openings, standard rest between gates.",
    activationScale: 1,
    opening: { label: "Standard", px: GATE_OPENING_PX },
    restDelta: 0,
  },
  Hard: {
    summary: "A stronger squeeze is needed to rise, gate openings are narrower, and gates come closer together.",
    activationScale: 1.25,
    opening: { label: "Narrow", px: 130 },
    restDelta: -1,
  },
};

/** Activation % for a level at a difficulty, rounded to one decimal. */
export function activationPct(level: number, difficulty: Difficulty): number {
  return Math.round(LEVEL_RULES[level - 1].activationPct * DIFFICULTY_PROFILES[difficulty].activationScale * 10) / 10;
}

/** Time between gates at a difficulty, never below 2 seconds. */
export function restRange(gap: [number, number], difficulty: Difficulty): [number, number] {
  const d = DIFFICULTY_PROFILES[difficulty].restDelta;
  return [Math.max(2, gap[0] + d), Math.max(2, gap[1] + d)];
}

export const RANDOMIZE_COPY = {
  explainer: [
    {
      title: "Randomized",
      body: "Each gate opening appears at an unpredictable height, and the time between gates varies within the level's range. The patient can't memorize the course, so they have to read each gate and adjust how hard they squeeze in the moment.",
    },
    {
      title: "Set layout",
      body: "The level plays the same gate heights and spacing every session. The patient can learn the course, and because every run is identical, scores and EMG traces are directly comparable from session to session.",
    },
  ],
};
