import type { ReactNode } from "react";
import {
  ASTRO_BOOST,
  BASELINE_PENDING,
  BASELINE_TREND,
  FLIGHT_PRACTICE,
  LEVEL_TRACK,
  SESSIONS,
  SESSION_XS,
  type Patient,
} from "@/lib/mockData";
import { resultColor } from "./PatientRoster";

const SESSION_COLS = "grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_16px]";
const CARD = "rounded-[14px] border border-bd bg-card";

// Baseline chart geometry
const bx = (i: number) => 70 + i * 110;
const by = (v: number) => 244 - (v / 1.2) * 224;
const baseDots = BASELINE_TREND.map((d, i) => ({ x: bx(i), y: by(d.v).toFixed(1), label: d.label }));
const basePoints = baseDots.map((d) => `${d.x},${d.y}`).join(" ");

// Flight Practice / Astro Boost geometry (shared 380×220 viewBox)
const fpDots = FLIGHT_PRACTICE.map((v, i) => ({ x: SESSION_XS[i], y: (176 - (v / 100) * 160).toFixed(1) }));
const fpPoints = fpDots.map((d) => `${d.x},${d.y}`).join(" ");
const abBars = ASTRO_BOOST.score.map((v, i) => {
  const y = 176 - (v / 4500) * 160;
  return { x: SESSION_XS[i] - 11, y: y.toFixed(1), h: (176 - y).toFixed(1) };
});
const abDots = ASTRO_BOOST.gates.map((g, i) => ({ x: SESSION_XS[i], y: (176 - (g / 15) * 160).toFixed(1) }));
const abPoints = abDots.map((d) => `${d.x},${d.y}`).join(" ");
const sparseDates = [
  { x: 56, label: "19 Aug" },
  { x: 148, label: "29 Aug" },
  { x: 240, label: "05 Sep" },
  { x: 332, label: "12 Sep" },
];

function AxisText({ x, y, anchor = "end", children }: { x: number; y: number; anchor?: "start" | "middle" | "end"; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={11} className="fill-axis font-mono">
      {children}
    </text>
  );
}

function Dots({ dots, r = 4 }: { dots: { x: number; y: string }[]; r?: number }) {
  return dots.map((d) => <circle key={d.x} cx={d.x} cy={d.y} r={r} strokeWidth={2} className="fill-card stroke-acc" />);
}

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onOpenSession: () => void;
}

export default function PatientDetail({ patient, onBack, onOpenSession }: PatientDetailProps) {
  const baseline = BASELINE_PENDING.has(patient.mrn) ? "Baseline pending" : "Baseline complete, recalibrated 12 Sep 2026";

  const stats = [
    { k: "Max RMS voltage", v: "1.02 mV", sub: "+64% since first baseline", subClass: "text-pass" },
    { k: "Current level", v: `${patient.level} of 5`, sub: "12 sessions total" },
    { k: "PID gains (Kp / Ki / Kd)", v: "0.85 / 0.04 / 0.12", sub: "Tuned for this patient", mono: true },
    { k: "Engagement", v: "1,480 coins", sub: "4 of 9 skins unlocked" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button type="button" onClick={onBack} className="cursor-pointer text-sm text-acc hover:text-acc-hover">
          ‹ Patients
        </button>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">{patient.name}</h1>
        <div className="mt-1.5 text-sm text-t2">
          {patient.leg} leg · {patient.mrn} · {baseline}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-px overflow-hidden rounded-[14px] border border-bd bg-line">
        {stats.map((s) => (
          <div key={s.k} className="bg-card px-[22px] py-5">
            <div className="text-[12.5px] text-t3">{s.k}</div>
            {s.mono ? (
              <div className="mt-2 font-mono text-[17px] whitespace-nowrap">{s.v}</div>
            ) : (
              <div className="mt-1.5 text-[22px] font-semibold">{s.v}</div>
            )}
            <div className={`mt-0.5 text-[12.5px] ${s.subClass ?? "text-t3"}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="text-base font-semibold">Baseline strength</div>
        <div className="mt-[3px] text-[13px] text-t3">Max RMS voltage (mV) at each recalibration</div>
        <svg viewBox="0 0 760 240" className="mt-[18px] block aspect-[760/240] h-auto w-full overflow-visible">
          {[20, 76, 132, 188].map((y) => (
            <line key={y} x1={44} y1={y} x2={760} y2={y} className="stroke-grid" />
          ))}
          {[["1.2", 24], ["0.9", 80], ["0.6", 136], ["0.3", 192]].map(([t, y]) => (
            <AxisText key={t} x={34} y={y as number}>{t}</AxisText>
          ))}
          <polygon points={`${basePoints} 730,244 70,244`} className="fill-acc/10" />
          <polyline points={basePoints} fill="none" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" className="stroke-acc" />
          <Dots dots={baseDots} />
          {baseDots.map((d) => (
            <AxisText key={d.label} x={d.x} y={226} anchor="middle">{d.label}</AxisText>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-6">
        <div className={`${CARD} px-[26px] py-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <div className="text-base font-semibold">Flight Practice</div>
            <div className="text-[13px] text-pass">79% latest</div>
          </div>
          <div className="mt-[3px] text-[13px] text-t3">Control accuracy: time the RMS signal stayed in the target band</div>
          <svg viewBox="0 0 380 220" className="mt-[18px] block aspect-[380/220] h-auto w-full overflow-visible">
            {[16, 96, 176].map((y) => (
              <line key={y} x1={36} y1={y} x2={352} y2={y} className="stroke-grid" />
            ))}
            <AxisText x={28} y={20}>100%</AxisText>
            <AxisText x={28} y={100}>50%</AxisText>
            <AxisText x={28} y={180}>0%</AxisText>
            <polygon points={`${fpPoints} 332,176 56,176`} className="fill-acc/10" />
            <polyline points={fpPoints} fill="none" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" className="stroke-acc" />
            <Dots dots={fpDots} />
            {[{ x: 56, label: "21 Jul" }, { x: 148, label: "04 Aug" }, { x: 240, label: "20 Aug" }, { x: 332, label: "10 Sep" }].map((d) => (
              <AxisText key={d.label} x={d.x} y={204} anchor="middle">{d.label}</AxisText>
            ))}
          </svg>
        </div>

        <div className={`${CARD} px-[26px] py-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <div className="text-base font-semibold">Astro Boost</div>
            <div className="flex flex-wrap gap-3.5 text-[13px] text-t2">
              <div className="flex items-center gap-[7px]">
                <span className="size-2.5 rounded-[2px] bg-[oklch(0.42_0.06_240)]" />
                Score
              </div>
              <div className="flex items-center gap-[7px]">
                <span className="h-[3px] w-4 bg-acc" />
                Gates passed
              </div>
            </div>
          </div>
          <div className="mt-[3px] text-[13px] text-t3">Gameplay per session, with level reached under each bar</div>
          <svg viewBox="0 0 380 220" className="mt-[18px] block aspect-[380/220] h-auto w-full overflow-visible">
            {[16, 69.3, 122.7, 176].map((y) => (
              <line key={y} x1={36} y1={y} x2={352} y2={y} className="stroke-grid" />
            ))}
            {[["4.5k", "15", 20], ["3k", "10", 73.3], ["1.5k", "5", 126.7], ["0", "0", 180]].map(([l, r, y]) => (
              <g key={y}>
                <AxisText x={28} y={y as number}>{l}</AxisText>
                <AxisText x={358} y={y as number} anchor="start">{r}</AxisText>
              </g>
            ))}
            {abBars.map((b) => (
              <rect key={b.x} x={b.x} y={b.y} width={22} height={b.h} rx={3} className="fill-[oklch(0.42_0.06_240)]" />
            ))}
            <polyline points={abPoints} fill="none" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" className="stroke-acc" />
            <Dots dots={abDots} />
            {ASTRO_BOOST.levels.map((l, i) => (
              <AxisText key={i} x={SESSION_XS[i]} y={194} anchor="middle">{l}</AxisText>
            ))}
            {sparseDates.map((d) => (
              <AxisText key={d.label} x={d.x} y={212} anchor="middle">{d.label}</AxisText>
            ))}
          </svg>
        </div>
      </div>

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="text-base font-semibold">Level progress</div>
        <div className="mt-5 grid grid-cols-5 gap-3">
          {LEVEL_TRACK.map((L, i) => {
            const done = L.state === "Cleared";
            const now = L.state === "Current";
            const ring = done ? "border-pass bg-pass-bg text-pass" : now ? "border-acc bg-accbg text-acc" : "border-bd bg-transparent text-dim";
            return (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                <div className={`flex size-10 items-center justify-center rounded-full border-2 text-[15px] font-semibold ${ring}`}>{i + 1}</div>
                <div className={`text-[13.5px] font-medium ${L.state === "Locked" ? "text-t3" : "text-t1"}`}>{L.state}</div>
                <div className="text-[12.5px] text-t3">{L.history}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="px-[26px] pt-[22px] pb-3.5 text-base font-semibold">Sessions</div>
        <div className="overflow-x-auto">
          <div className={`grid ${SESSION_COLS} gap-3 border-y border-line px-[26px] py-2.5 text-[12.5px] text-t3`}>
            <div>Date</div>
            <div>Level</div>
            <div>Score</div>
            <div>Lives left</div>
            <div>Result</div>
            <div />
          </div>
          {SESSIONS.map((s) => (
            <button
              key={s.date}
              type="button"
              onClick={onOpenSession}
              className={`grid w-full ${SESSION_COLS} cursor-pointer items-center gap-3 border-b border-line px-[26px] py-[15px] text-left text-sm text-t2 hover:bg-hover`}
            >
              <div>
                <div className="font-medium text-t1">{s.date}</div>
                <div className="mt-0.5 text-[12.5px] text-t3">{s.dur} min</div>
              </div>
              <div>{s.level}</div>
              <div>{s.score}</div>
              <div>{s.lives}</div>
              <div className={`flex items-center gap-2 font-medium ${resultColor(s.status)}`}>
                <span className="size-[7px] rounded-full bg-current" />
                {s.status}
              </div>
              <div className="text-chevron">›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
