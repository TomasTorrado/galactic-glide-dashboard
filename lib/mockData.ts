// Mock data mirroring the Galactic Glide design. Replace with Firestore reads in lib/firebase.ts.

import { LEVEL_RULES } from "./gameRules";

export type Leg = "Left" | "Right";
export type Result = "Passed" | "Failed";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Patient {
  name: string;
  mrn: string;
  leg: Leg;
  last: string;
  level: number;
  status: Result;
}

export interface Session {
  date: string;
  level: string;
  score: string;
  lives: string;
  status: Result;
  dur: string;
}

export interface Plan {
  days: string[];
  levels: number[];
  difficulty: Difficulty;
  notes: string;
  assignedAt: string | null;
  dirty?: boolean;
}

export interface EmgCalibration {
  th: string;
  max: string;
}

export interface LevelConfig {
  gates: string;
  gapMin: string;
  gapMax: string;
  rand: boolean;
}

export const PATIENTS: Patient[] = [
  { name: "Marisol Reyes", mrn: "MRN 40-8821", leg: "Right", last: "12 Sep 2026", level: 4, status: "Passed" },
  { name: "Daniel Okafor", mrn: "MRN 40-7315", leg: "Left", last: "11 Sep 2026", level: 2, status: "Failed" },
  { name: "Priya Raman", mrn: "MRN 40-6642", leg: "Left", last: "09 Sep 2026", level: 5, status: "Passed" },
  { name: "Ethan Brandt", mrn: "MRN 40-9077", leg: "Right", last: "08 Sep 2026", level: 3, status: "Passed" },
  { name: "Junko Watanabe", mrn: "MRN 40-5530", leg: "Right", last: "04 Sep 2026", level: 1, status: "Failed" },
  { name: "Omar Haddad", mrn: "MRN 40-8104", leg: "Left", last: "28 Aug 2026", level: 3, status: "Failed" },
];

/** Patients whose baseline (Max + Flex test) has not been recorded yet. */
export const BASELINE_PENDING = new Set(["MRN 40-5530", "MRN 40-8104"]);

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const SEEDED_PLANS: Record<string, Plan> = {
  "MRN 40-8821": { days: ["Mon", "Wed", "Fri"], levels: [4], difficulty: "Medium", notes: "Rest 60 seconds between attempts.", assignedAt: "22 Sep 2026" },
  "MRN 40-6642": { days: ["Mon", "Tue", "Thu", "Fri"], levels: [5], difficulty: "Hard", notes: "", assignedAt: "18 Sep 2026" },
};

export function defaultPlan(p: Patient): Plan {
  return SEEDED_PLANS[p.mrn] ?? { days: ["Tue", "Thu"], levels: [p.level], difficulty: "Easy", notes: "", assignedAt: null };
}

/** [threshold, max output] in mV per patient. */
export const EMG_DEFAULTS: Record<string, [number, number]> = {
  "MRN 40-8821": [0.38, 1.02],
  "MRN 40-7315": [0.22, 0.54],
  "MRN 40-6642": [0.46, 1.31],
  "MRN 40-9077": [0.31, 0.86],
  "MRN 40-5530": [0.18, 0.41],
  "MRN 40-8104": [0.29, 0.77],
};

/** Defaults match the game: every level is randomized today. */
export function defaultLevelConfig(level: number): LevelConfig {
  const { gates, gap } = LEVEL_RULES[level - 1];
  return { gates: String(gates), gapMin: String(gap[0]), gapMax: String(gap[1]), rand: true };
}

/** A reusable bundle of plan and level settings. Target levels and EMG calibration are patient-specific and not included. */
export interface Preset {
  name: string;
  description: string;
  builtIn?: boolean;
  difficulty: Difficulty;
  days: string[];
  levels: Record<number, LevelConfig>;
}

function presetLevels(patch: Partial<LevelConfig> = {}): Record<number, LevelConfig> {
  return Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, { ...defaultLevelConfig(n), ...patch }]));
}

/** Placeholder presets until the team settles on standard protocols. */
export const BUILT_IN_PRESETS: Preset[] = [
  {
    name: "Gentle start",
    description: "Lighter demands while the patient learns the game. Each level uses its set gate layout.",
    builtIn: true,
    difficulty: "Easy",
    days: ["Tue", "Thu"],
    levels: presetLevels({ rand: false }),
  },
  {
    name: "Standard",
    description: "The game as designed, three sessions a week.",
    builtIn: true,
    difficulty: "Medium",
    days: ["Mon", "Wed", "Fri"],
    levels: presetLevels(),
  },
  {
    name: "Challenge",
    description: "Harder gates, more of them, and more frequent sessions.",
    builtIn: true,
    difficulty: "Hard",
    days: ["Mon", "Tue", "Thu", "Fri"],
    levels: presetLevels({ gates: "12" }),
  },
];

export const SESSIONS: Session[] = [
  { date: "12 Sep 2026", level: "4", score: "3,240", lives: "1 of 3", status: "Passed", dur: "4:12" },
  { date: "09 Sep 2026", level: "4", score: "1,890", lives: "0 of 3", status: "Failed", dur: "3:48" },
  { date: "05 Sep 2026", level: "4", score: "2,110", lives: "0 of 3", status: "Failed", dur: "3:31" },
  { date: "03 Sep 2026", level: "3", score: "2,980", lives: "1 of 3", status: "Passed", dur: "4:02" },
  { date: "29 Aug 2026", level: "3", score: "2,740", lives: "2 of 3", status: "Passed", dur: "3:55" },
  { date: "24 Aug 2026", level: "3", score: "1,420", lives: "0 of 3", status: "Failed", dur: "2:47" },
  { date: "19 Aug 2026", level: "2", score: "2,360", lives: "3 of 3", status: "Passed", dur: "3:20" },
];

export const BASELINE_TREND = [
  { label: "14 Jul", v: 0.62 },
  { label: "24 Jul", v: 0.71 },
  { label: "04 Aug", v: 0.68 },
  { label: "11 Aug", v: 0.58 },
  { label: "24 Aug", v: 0.83 },
  { label: "03 Sep", v: 0.91 },
  { label: "12 Sep", v: 1.02 },
];

export const LEVEL_TRACK = [
  { state: "Cleared", history: "2 of 2 passed" },
  { state: "Cleared", history: "2 of 3 passed" },
  { state: "Cleared", history: "2 of 4 passed" },
  { state: "Current", history: "1 of 3 passed" },
  { state: "Locked", history: "Not started" },
] as const;

/** Shared x positions for the two small per-session charts. */
export const SESSION_XS = [56, 102, 148, 194, 240, 286, 332];
export const FLIGHT_PRACTICE = [52, 58, 61, 55, 68, 73, 79];
export const ASTRO_BOOST = {
  score: [2360, 1420, 2740, 2980, 2110, 1890, 3240],
  gates: [9, 7, 11, 12, 10, 9, 12],
  levels: ["L2", "L3", "L3", "L3", "L4", "L4", "L4"],
};
