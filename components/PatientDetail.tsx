import { useState, type ReactNode } from "react";
import {
  BASELINE_PENDING,
  BASELINE_TREND,
  LEVEL_TRACK,
  SESSIONS,
  SESSION_XS,
  type Patient,
} from "@/lib/mockData";
import { PATIENT_TEXT, SESSION_TEXT } from "@/lib/descriptions";
import { CardIntro, Term } from "./Explain";
import { resultColor } from "./PatientRoster";

const SESSION_COLS = "grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_16px]";
const CARD = "rounded-[14px] border border-bd bg-card";

// Baseline chart geometry
const bx = (i: number) => 70 + i * 110;
const by = (v: number) => 244 - (v / 1200) * 224;
const baseDots = BASELINE_TREND.map((d, i) => ({ x: bx(i), y: by(d.v).toFixed(1), label: d.label }));
const basePoints = baseDots.map((d) => `${d.x},${d.y}`).join(" ");

// Planets chart geometry (380×220 viewBox): one bar per session, oldest first
const planetSessions = [...SESSIONS].reverse();
const planetBars = planetSessions.map((s, i) => {
  const y = 176 - (s.score / 10) * 160;
  return {
    x: SESSION_XS[i],
    y: y.toFixed(1),
    h: (176 - y).toFixed(1),
    level: `L${s.level}`,
    passed: s.status === "Passed",
    session: s,
  };
});
const strengthGain = Math.round((BASELINE_TREND.at(-1)!.v / BASELINE_TREND[0].v - 1) * 100);

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
  const [hoverBar, setHoverBar] = useState<number | null>(null);
  const hovered = hoverBar === null ? null : planetBars[hoverBar];
  const baseline = BASELINE_PENDING.has(patient.mrn) ? "Baseline pending" : "Baseline complete, recalibrated 12 Sep 2026";

  const stats = [
    {
      k: "Max strength",
      v: `${BASELINE_TREND.at(-1)!.v.toLocaleString("en-US")} a.u.`,
      sub: `+${strengthGain}% since first Astro Boost`,
      subClass: "text-pass",
    },
    { k: "Current level", v: `${patient.level} of 5`, sub: "12 sessions total" },
    { k: "PID gains (Kp / Ki / Kd)", v: "1.2 / 0.05 / 0.40", sub: "Kd set by Glide Practice", mono: true },
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
          {patient.leg} leg · {patient.mrn} · <Term tip={PATIENT_TEXT.baseline}>{baseline}</Term>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-px overflow-hidden rounded-[14px] border border-bd bg-line">
        {stats.map((s) => (
          <div key={s.k} className="bg-card px-[22px] py-5">
            <div className="text-[12.5px] text-t3">
              <Term tip={PATIENT_TEXT.tiles[s.k]}>{s.k}</Term>
            </div>
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
        <div className="text-base font-semibold">Astro Boost</div>
        <CardIntro text="Max strength (a.u.) from each Astro Boost test." sections={PATIENT_TEXT.astroBoost} />
        <svg viewBox="0 0 760 240" className="mt-[18px] block aspect-[760/240] h-auto w-full overflow-visible">
          {[20, 76, 132, 188].map((y) => (
            <line key={y} x1={44} y1={y} x2={760} y2={y} className="stroke-grid" />
          ))}
          {[["1200", 24], ["900", 80], ["600", 136], ["300", 192]].map(([t, y]) => (
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
          <div className="text-base font-semibold">Glide Practice</div>
          <CardIntro
            text="Tracking error: how far the patient's astronaut strays from the guide. Lower is better."
            sections={PATIENT_TEXT.glidePractice}
            label="About this test"
          />
          <div className="mt-[18px] flex aspect-[380/200] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-bd px-6 text-center">
            <div className="text-sm font-medium text-t2">Not recorded yet</div>
            <div className="max-w-[300px] text-[12.5px] leading-normal text-t3">
              The game measures this during Glide Practice but doesn&apos;t save it yet.
            </div>
          </div>
        </div>

        <div className={`${CARD} px-[26px] py-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <div className="text-base font-semibold">Planets</div>
            <div className="flex flex-wrap gap-3.5 text-[13px] text-t2">
              <div className="flex items-center gap-[7px]">
                <span className="size-2.5 rounded-[2px] bg-pass" />
                Passed
              </div>
              <div className="flex items-center gap-[7px]">
                <span className="size-2.5 rounded-[2px] bg-fail" />
                Failed
              </div>
            </div>
          </div>
          <CardIntro
            text="Gates passed per session (out of 10), with the planet under each bar."
            sections={PATIENT_TEXT.planets}
          />
          <div className="relative mt-[18px]" onMouseLeave={() => setHoverBar(null)}>
            <svg viewBox="0 0 380 200" className="block aspect-[380/200] h-auto w-full overflow-visible">
              {[16, 96, 176].map((y) => (
                <line key={y} x1={36} y1={y} x2={352} y2={y} className="stroke-grid" />
              ))}
              {[["10", 20], ["5", 100], ["0", 180]].map(([t, y]) => (
                <AxisText key={t} x={28} y={y as number}>{t}</AxisText>
              ))}
              {planetBars.map((b, i) => (
                <rect
                  key={b.x}
                  x={b.x - 11}
                  y={b.y}
                  width={22}
                  height={b.h}
                  rx={3}
                  className={`${b.passed ? "fill-pass" : "fill-fail"} ${hoverBar === null || hoverBar === i ? "opacity-70" : "opacity-30"}`}
                />
              ))}
              {planetBars.map((b) => (
                <AxisText key={b.x} x={b.x} y={194} anchor="middle">{b.level}</AxisText>
              ))}
              {/* Full-height hit areas so short bars are easy to hover or tap. */}
              {planetBars.map((b, i) => (
                <rect
                  key={b.x}
                  x={b.x - 23}
                  y={0}
                  width={46}
                  height={200}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${b.session.date}, level ${b.session.level}, ${b.session.score} of 10 gates, ${b.session.status}`}
                  onMouseEnter={() => setHoverBar(i)}
                  onFocus={() => setHoverBar(i)}
                  onBlur={() => setHoverBar(null)}
                  onClick={() => setHoverBar(i)}
                  className="cursor-default outline-none"
                />
              ))}
            </svg>
            {hovered && (
              <div
                role="tooltip"
                style={{ left: `${(hovered.x / 380) * 100}%`, top: `${(parseFloat(hovered.y) / 200) * 100}%` }}
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg border border-bd bg-pop px-3 py-2 text-[12.5px] whitespace-nowrap shadow-lg"
              >
                <div className="font-medium text-t1">{hovered.session.date}</div>
                <div className="mt-0.5 text-t2">
                  Level {hovered.session.level} · {hovered.session.score} of 10 gates
                </div>
                <div className={`mt-0.5 font-medium ${resultColor(hovered.session.status)}`}>{hovered.session.status}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="text-base font-semibold">Level progress</div>
        <div className="mt-1 text-[13px] leading-normal text-t3">{PATIENT_TEXT.levelProgress}</div>
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
            <div>
              <Term tip={SESSION_TEXT.tiles.Score}>Score</Term>
            </div>
            <div>
              <Term tip={SESSION_TEXT.tiles["Lives left"]}>Lives left</Term>
            </div>
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
              <div>{s.score} of 10</div>
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
