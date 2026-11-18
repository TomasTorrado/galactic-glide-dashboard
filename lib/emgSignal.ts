// Deterministic synthetic EMG trace for the mock session, ported from the design's script.
// Values are in a.u. (raw sensor reading, 0–4095), like the game.

const N = 640;
const DURATION_S = 252;
/** Patient's max from their latest Astro Boost test. */
export const MAX_AU = 1020;
/** Level 4 threshold: 20% of max, as the game sets it. */
export const THRESHOLD_AU = Math.round(MAX_AU * 0.2);
const GATE_COUNT = 10;

const px = (i: number) => 40 + (i / (N - 1)) * 720;
export const py = (v: number) => 310 - (Math.max(0, Math.min(1200, v)) / 1200) * 276;

function frac(x: number) {
  const s = Math.sin(x) * 43758.5453;
  return s - Math.floor(s);
}

const fmtTime = (s: number) => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");

function synthesize() {
  // Two explicit sub-threshold dips => exactly two collisions, matching 1/3 lives left.
  const dips = [
    { t: 155, w: 9, d: 520 },
    { t: 205, w: 8, d: 480 },
  ];
  const rms: number[] = [];
  const raw: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * DURATION_S;
    let v = 700 + 100 * Math.sin(t * 0.075 + 0.4) + 45 * Math.sin(t * 0.23 + 1.9) + 20 * Math.sin(t * 0.61 + 0.7);
    v *= 1 - 0.14 * (t / DURATION_S);
    for (const dp of dips) v -= dp.d * Math.exp(-Math.pow((t - dp.t) / dp.w, 2));
    v = Math.max(60, v);
    rms.push(v);
    raw.push(Math.max(10, v + (frac(i * 7.31) * 2 - 1) * (160 + 100 * frac(i * 1.77))));
  }

  const toPoints = (arr: number[]) => arr.map((v, i) => px(i).toFixed(1) + "," + py(v).toFixed(1)).join(" ");

  const hits: number[] = [];
  for (let i = 1; i < N; i++) if (rms[i] < THRESHOLD_AU && rms[i - 1] >= THRESHOLD_AU) hits.push(i);

  // Gates are evenly spaced; each collision replaces the nearest gate as a miss.
  const gateTimes = Array.from({ length: GATE_COUNT }, (_, k) => 14 + k * (232 / (GATE_COUNT - 1)));
  const missed = new Set<number>();
  for (const i of hits) {
    const ct = (i / (N - 1)) * DURATION_S;
    let best = 0;
    gateTimes.forEach((t, k) => {
      if (Math.abs(t - ct) < Math.abs(gateTimes[best] - ct)) best = k;
    });
    missed.add(best);
    gateTimes[best] = ct;
  }

  return {
    rawPoints: toPoints(raw),
    rmsPoints: toPoints(rms),
    thresholdY: py(THRESHOLD_AU).toFixed(1),
    collisions: hits.map((i) => ({ x: px(i).toFixed(1), y: (py(rms[i]) - 12).toFixed(1) })),
    livesLeft: 3 - hits.length,
    gates: gateTimes.map((t, k) => ({ n: k + 1, time: fmtTime(t), missed: missed.has(k) })),
    gatesPassed: GATE_COUNT - missed.size,
    gateCount: GATE_COUNT,
  };
}

export const emgSession = synthesize();
