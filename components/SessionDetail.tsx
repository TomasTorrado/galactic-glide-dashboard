import { emgSession, THRESHOLD_MV } from "@/lib/emgSignal";
import type { Patient } from "@/lib/mockData";

const CARD = "rounded-[14px] border border-bd bg-card";

const meta = [
  { k: "Max voltage", v: emgSession.maxVoltage.toFixed(2) + " mV" },
  { k: "Threshold", v: THRESHOLD_MV.toFixed(2) + " mV" },
  { k: "Score", v: "3,240" },
  { k: "Lives left", v: `${emgSession.livesLeft} of 3` },
  { k: "Duration", v: "4:12" },
  { k: "Kp / Ki / Kd", v: "0.85 / 0.04 / 0.12" },
];

const yTicks: [string, number][] = [["1.2", 38], ["0.9", 107], ["0.6", 176], ["0.3", 245], ["0", 314]];
const xTicks: [string, number][] = [["0:00", 40], ["1:00", 211.4], ["2:00", 382.9], ["3:00", 554.3], ["4:00", 725.7]];

interface SessionDetailProps {
  patient: Patient;
  onBack: () => void;
}

export default function SessionDetail({ patient, onBack }: SessionDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <button type="button" onClick={onBack} className="cursor-pointer text-sm text-acc hover:text-acc-hover">
          ‹ {patient.name}
        </button>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">12 Sep 2026 · Level 4</h1>
        <div className="mt-1.5 text-sm text-t2">10:24 · 4 min 12 s · {patient.leg} leg</div>
      </div>

      <div className="flex items-center gap-4 rounded-[14px] border border-pass-bd bg-pass-bg px-6 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.78_0.11_155)] text-[17px] font-bold text-[oklch(0.2_0.04_155)]">
          ✓
        </div>
        <div>
          <div className="text-lg font-semibold text-[oklch(0.88_0.08_155)]">Passed</div>
          <div className="mt-0.5 text-sm text-[oklch(0.8_0.05_155)]">Level 4 cleared with 1 of 3 lives left. Level 5 unlocked.</div>
        </div>
      </div>

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <div className="text-base font-semibold">EMG signal</div>
          <div className="flex flex-wrap gap-[18px] text-[13px] text-t2">
            <div className="flex items-center gap-[7px]">
              <span className="h-0.5 w-4 bg-[oklch(0.45_0.04_220)]" />
              Raw
            </div>
            <div className="flex items-center gap-[7px]">
              <span className="h-[3px] w-4 bg-[oklch(0.82_0.1_235)]" />
              RMS
            </div>
            <div className="flex items-center gap-[7px]">
              <span className="w-4 border-t-2 border-dashed border-t3" />
              Threshold
            </div>
            <div className="flex items-center gap-[7px]">
              <span className="font-bold text-[oklch(0.74_0.15_25)]">✕</span>
              Collision
            </div>
          </div>
        </div>
        <svg viewBox="0 0 760 350" className="mt-[18px] block aspect-[760/350] h-auto w-full overflow-visible">
          {[34, 103, 172, 241].map((y) => (
            <line key={y} x1={40} y1={y} x2={760} y2={y} className="stroke-[oklch(0.25_0.028_258)]" />
          ))}
          <line x1={40} y1={310} x2={760} y2={310} className="stroke-[oklch(0.31_0.028_258)]" />
          {yTicks.map(([t, y]) => (
            <text key={t} x={32} y={y} textAnchor="end" fontSize={11} className="fill-axis font-mono">
              {t}
            </text>
          ))}
          <polyline points={emgSession.rawPoints} fill="none" strokeWidth={0.9} strokeLinejoin="round" className="stroke-[oklch(0.45_0.04_220)]" />
          <polyline points={emgSession.rmsPoints} fill="none" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" className="stroke-[oklch(0.82_0.1_235)]" />
          <line x1={40} y1={emgSession.thresholdY} x2={760} y2={emgSession.thresholdY} strokeWidth={1.6} strokeDasharray="7 5" className="stroke-t3" />
          {emgSession.collisions.map((c) => (
            <text key={c.x} x={c.x} y={c.y} textAnchor="middle" fontSize={16} fontWeight={700} className="fill-[oklch(0.74_0.15_25)] font-mono">
              ✕
            </text>
          ))}
          {xTicks.map(([t, x]) => (
            <text key={t} x={x} y={334} textAnchor="middle" fontSize={11} className="fill-axis font-mono">
              {t}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-6">
        <div className="grid grid-cols-2 gap-3">
          {meta.map((m) => (
            <div key={m.k} className="rounded-xl border border-bd bg-card px-[18px] py-4">
              <div className="text-[12.5px] text-t3">{m.k}</div>
              <div className="mt-[5px] text-[17px] font-semibold">{m.v}</div>
            </div>
          ))}
        </div>

        <div className={`${CARD} px-[26px] py-6`}>
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-base font-semibold">Gates</div>
            <div className="text-[13.5px] text-t2">
              {emgSession.gatesPassed} of {emgSession.gateCount} passed
            </div>
          </div>
          <div className="mt-4 text-[12.5px] text-t3">Start</div>
          <div className="relative mt-1.5 flex flex-col">
            <div className="absolute top-3.5 bottom-3.5 left-[11px] w-0.5 bg-bd" />
            {emgSession.gates.map((g) => (
              <div key={g.n} className="relative flex items-center gap-3.5 py-[5px]">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                    g.missed ? "border-fail bg-fail-bg text-fail" : "border-pass bg-pass-bg text-pass"
                  }`}
                >
                  {g.missed ? "✕" : "✓"}
                </div>
                <div className={`flex-1 text-sm ${g.missed ? "text-t1" : "text-t2"}`}>Gate {g.n}</div>
                <div className="font-mono text-[12.5px] text-t3">{g.time}</div>
                <div className={`w-[52px] text-right text-[13px] font-medium ${g.missed ? "text-fail" : "text-pass"}`}>
                  {g.missed ? "Missed" : "Passed"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 text-[12.5px] text-t3">Finish</div>
        </div>
      </div>
    </div>
  );
}
