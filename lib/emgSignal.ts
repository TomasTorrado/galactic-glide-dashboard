// Deterministic synthetic EMG trace for the mock session, ported from the design's script.

const N = 640;
const DURATION_S = 252;
export const THRESHOLD_MV = 0.38;
const GATE_COUNT = 14;

const px = (i: number) => 40 + (i / (N - 1)) * 720;
export const py = (v: number) => 310 - (Math.max(0, Math.min(1.2, v)) / 1.2) * 276;

function frac(x: number) {
  const s = Math.sin(x) * 43758.5453;
  return s - Math.floor(s);
}

const fmtTime = (s: number) => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");

function synthesize() {
  // Two explicit sub-threshold dips => exactly two collisions, matching 1/3 lives left.
  const dips = [
    { t: 155, w: 9, d: 0.34 },
    { t: 205, w: 8, d: 0.3 },
  ];
  const rms: number[] = [];
  const raw: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * DURATION_S;
    let v = 0.7 + 0.1 * Math.sin(t * 0.075 + 0.4) + 0.045 * Math.sin(t * 0.23 + 1.9) + 0.02 * Math.sin(t * 0.61 + 0.7);
    v *= 1 - 0.14 * (t / DURATION_S);
    for (const dp of dips) v -= dp.d * Math.exp(-Math.pow((t - dp.t) / dp.w, 2));
    v = Math.max(0.06, v);
    rms.push(v);
    raw.push(Math.max(0.01, v + (frac(i * 7.31) * 2 - 1) * (0.16 + 0.1 * frac(i * 1.77))));
  }

  const toPoints = (arr: number[]) => arr.map((v, i) => px(i).toFixed(1) + "," + py(v).toFixed(1)).join(" ");

  const hits: number[] = [];
  for (let i = 1; i < N; i++) if (rms[i] < THRESHOLD_MV && rms[i - 1] >= THRESHOLD_MV) hits.push(i);

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
    thresholdY: py(THRESHOLD_MV).toFixed(1),
    collisions: hits.map((i) => ({ x: px(i).toFixed(1), y: (py(rms[i]) - 12).toFixed(1) })),
    maxVoltage: Math.max(...raw),
    livesLeft: 3 - hits.length,
    gates: gateTimes.map((t, k) => ({ n: k + 1, time: fmtTime(t), missed: missed.has(k) })),
    gatesPassed: GATE_COUNT - missed.size,
    gateCount: GATE_COUNT,
  };
}

export const emgSession = synthesize();
