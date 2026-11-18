import { useState } from "react";
import {
  activationPct,
  DIFFICULTY_PROFILES,
  LEVEL_RULES,
  RANDOMIZE_COPY,
  restRange,
} from "@/lib/gameRules";
import {
  DAYS,
  defaultLevelConfig,
  EMG_DEFAULTS,
  type Difficulty,
  type EmgCalibration,
  type LevelConfig,
  type Patient,
  type Plan,
  type Preset,
} from "@/lib/mockData";
import { InfoToggle } from "./Explain";
import PatientPicker from "./PatientPicker";

const CARD = "rounded-[14px] border border-bd bg-card";
const NUMBER_FIELD = "flex items-center gap-2 rounded-[10px] border border-bd bg-sub px-3.5";
const NUMBER_INPUT = "min-w-0 flex-1 border-0 bg-transparent font-mono text-t1 outline-none";
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/** Gate opening heights (0–70) for the randomize diagram. */
const SET_LAYOUT = [24, 46, 35, 24, 46, 35];
const RANDOM_LAYOUT = [30, 52, 18, 41, 56, 25];

function GateStrip({ heights, label }: { heights: number[]; label: string }) {
  const xs = heights.map((_, i) => 24 + i * 50);
  return (
    <svg viewBox="0 0 300 70" role="img" aria-label={label} className="h-auto w-full">
      <polyline
        points={heights.map((h, i) => `${xs[i] + 7},${h}`).join(" ")}
        fill="none"
        strokeDasharray="3 4"
        strokeWidth={1.5}
        className="stroke-acc"
      />
      {heights.map((h, i) => (
        <g key={i} className="fill-bd">
          <rect x={xs[i]} y={0} width={14} height={h - 10} rx={2} />
          <rect x={xs[i]} y={h + 10} width={14} height={60 - h} rx={2} />
        </g>
      ))}
    </svg>
  );
}

interface ProtocolsProps {
  patient: Patient;
  onPickPatient: (mrn: string) => void;
  plan: Plan;
  onPlanChange: (patch: Partial<Plan>) => void;
  onAssign: () => void;
  emg: EmgCalibration | undefined;
  onEmgChange: (next: EmgCalibration) => void;
  levelConfig: Record<number, LevelConfig>;
  onLevelConfigChange: (level: number, next: LevelConfig) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
  onSavePreset: (preset: Preset) => void;
  onDeletePreset: (name: string) => void;
}

function sameLevel(a: LevelConfig, b: LevelConfig) {
  return a.gates === b.gates && a.gapMin === b.gapMin && a.gapMax === b.gapMax && a.rand === b.rand;
}

function presetSummary(p: Preset) {
  const randomized = Object.values(p.levels).filter((c) => c.rand).length;
  return `${p.difficulty} · ${p.days.length}/week · randomized ${randomized} of 5 levels`;
}

export default function Protocols({
  patient,
  onPickPatient,
  plan,
  onPlanChange,
  onAssign,
  emg: emgOverride,
  onEmgChange,
  levelConfig,
  onLevelConfigChange,
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
}: ProtocolsProps) {
  const [th0, max0] = EMG_DEFAULTS[patient.mrn];
  const emg = emgOverride ?? { th: th0.toFixed(2), max: max0.toFixed(2) };
  const thN = parseFloat(emg.th);
  const maxN = parseFloat(emg.max);
  const emgRatio =
    thN > 0 && maxN > 0
      ? thN >= maxN
        ? "Threshold must be lower than max output."
        : `Threshold is ${Math.round((thN / maxN) * 100)}% of max output.`
      : "Enter both values.";

  const [showRandInfo, setShowRandInfo] = useState(false);
  const [presetName, setPresetName] = useState("");
  // Several presets can hold identical settings, so prefer the one last applied or saved.
  const [chosenPreset, setChosenPreset] = useState<string | null>(null);

  const currentLevels = Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, levelConfig[n] ?? defaultLevelConfig(n)]));
  const matches = (p: Preset) =>
    p.difficulty === plan.difficulty &&
    p.days.join() === plan.days.join() &&
    [1, 2, 3, 4, 5].every((n) => sameLevel(p.levels[n], currentLevels[n]));
  const chosen = presets.find((p) => p.name === chosenPreset);
  const activePreset = chosen && matches(chosen) ? chosen : presets.find(matches);
  const trimmedName = presetName.trim();
  const nameTakenByBuiltIn = presets.some((p) => p.builtIn && p.name.toLowerCase() === trimmedName.toLowerCase());
  const canSave = trimmedName !== "" && !nameTakenByBuiltIn;
  const savePreset = () => {
    if (!canSave) return;
    onSavePreset({
      name: trimmedName,
      description: "Saved by clinician.",
      difficulty: plan.difficulty,
      days: plan.days,
      levels: currentLevels,
    });
    setChosenPreset(trimmedName);
    setPresetName("");
  };

  // Difficulty breakdown is shown for the highest target level, using this patient's calibration.
  const shownLevel = plan.levels.length ? Math.max(...plan.levels) : patient.level;
  const shownCfg = levelConfig[shownLevel] ?? defaultLevelConfig(shownLevel);
  const shownGap: [number, number] = [
    parseFloat(shownCfg.gapMin) || LEVEL_RULES[shownLevel - 1].gap[0],
    parseFloat(shownCfg.gapMax) || LEVEL_RULES[shownLevel - 1].gap[1],
  ];
  const maxMv = maxN > 0 ? maxN : max0;
  const difficultyRows: { label: string; cell: (d: Difficulty) => [string, string] }[] = [
    {
      label: "Squeeze to rise",
      cell: (d) => {
        const pct = activationPct(shownLevel, d);
        return [`${pct}% of max`, `${((pct / 100) * maxMv).toFixed(2)} mV`];
      },
    },
    { label: "Gate opening", cell: (d) => [DIFFICULTY_PROFILES[d].opening.label, `${DIFFICULTY_PROFILES[d].opening.px} px`] },
    {
      label: "Time between gates",
      cell: (d) => {
        const [lo, hi] = restRange(shownGap, d);
        return [lo === hi ? `${lo} sec` : `${lo}–${hi} sec`, "rest between efforts"];
      },
    },
    { label: "Gates to clear", cell: () => [shownCfg.gates, "same at every difficulty"] },
  ];

  const perWeek = plan.days.length;
  const canAssign = plan.dirty || !plan.assignedAt;
  const planStatus = plan.dirty ? "Unsaved changes" : plan.assignedAt ? `Assigned ${plan.assignedAt} · visible in game` : "No plan assigned";

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Protocols</h1>
        <div className="mt-1.5 text-sm text-t2">Set a weekly plan. The patient sees it in the game once assigned.</div>
      </div>

      <PatientPicker current={patient} onPick={onPickPatient} variant="card" />

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2.5">
          <div className="text-[15px] font-semibold">Presets</div>
          <div className={`text-[13px] ${activePreset ? "text-acc" : "text-t3"}`}>
            {activePreset ? `Using ${activePreset.name}` : "Custom settings"}
          </div>
        </div>
        <div className="mt-1 text-[13px] text-t3">
          Fills difficulty, session days and level settings. Target levels and EMG calibration stay as they are.
        </div>
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3">
          {presets.map((p) => {
            const on = p === activePreset;
            return (
              <div key={p.name} className="relative">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    onApplyPreset(p);
                    setChosenPreset(p.name);
                  }}
                  className={`flex h-full w-full cursor-pointer flex-col gap-1.5 rounded-xl border p-4 text-left ${
                    on ? "border-accbd bg-accbg" : "border-bd bg-sub hover:bg-hover"
                  }`}
                >
                  <div className="pr-6 text-sm font-medium text-t1">{p.name}</div>
                  <div className="text-[12.5px] leading-snug text-t2">{p.description}</div>
                  <div className="mt-auto pt-1 text-[11.5px] text-t3">{presetSummary(p)}</div>
                </button>
                {!p.builtIn && (
                  <button
                    type="button"
                    aria-label={`Delete preset ${p.name}`}
                    onClick={() => onDeletePreset(p.name)}
                    className="absolute top-2.5 right-2.5 flex size-6 cursor-pointer items-center justify-center rounded-md text-t3 hover:bg-hover hover:text-t1"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-4">
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && savePreset()}
            placeholder="Name this setup"
            aria-label="Preset name"
            className="min-w-0 flex-1 basis-[200px] rounded-[10px] border border-bd bg-sub px-3.5 py-2.5 text-sm text-t1 outline-none"
          />
          <button
            type="button"
            disabled={!canSave}
            onClick={savePreset}
            className={`rounded-[10px] border-0 px-4 py-2.5 text-sm font-semibold ${
              canSave ? "cursor-pointer bg-acc text-ink" : "cursor-not-allowed bg-sub text-t3"
            }`}
          >
            Save current as preset
          </button>
        </div>
        <div className="mt-2 text-xs text-t3">
          {nameTakenByBuiltIn
            ? "That name belongs to a built-in preset. Choose another."
            : "Saving with an existing name replaces that preset. Built-in presets are placeholders."}
        </div>
      </div>

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[15px] font-semibold">EMG calibration</div>
          <div className="rounded-full border border-accbd bg-accbg px-2.5 py-1 text-xs font-medium text-[oklch(0.86_0.06_195)]">Patient-specific</div>
        </div>
        <div className="mt-1 text-[13px] text-t3">Applies to {patient.name} only</div>
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-5">
          {(
            [
              { key: "th", title: "EMG threshold", help: "Minimum activation to move the astronaut" },
              { key: "max", title: "Max EMG output", help: "Ceiling for the patient's signal" },
            ] as const
          ).map((f) => (
            <label key={f.key} className="block">
              <div className="text-sm font-medium">{f.title}</div>
              <div className="mt-0.5 text-[12.5px] text-t3">{f.help}</div>
              <div className={`mt-3 ${NUMBER_FIELD}`}>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={emg[f.key]}
                  onChange={(e) => onEmgChange({ ...emg, [f.key]: e.target.value })}
                  className={`${NUMBER_INPUT} py-3 text-base`}
                />
                <span className="text-[13px] text-t3">mV</span>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-3.5 text-[12.5px] text-t3">{emgRatio}</div>
      </div>

      <div className={`${CARD} flex flex-col px-[26px] py-2`}>
        <div className="border-b border-line py-5">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[15px] font-semibold">Session days</div>
            <div className="text-[13.5px] text-acc">
              {perWeek} {perWeek === 1 ? "session" : "sessions"} per week
            </div>
          </div>
          <div className="mt-3.5 grid grid-cols-7 gap-1.5">
            {DAYS.map((d) => {
              const on = plan.days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPlanChange({ days: DAYS.filter((x) => (x === d ? !on : plan.days.includes(x))) })}
                  className={`cursor-pointer rounded-[9px] border py-3 text-[13.5px] font-medium ${
                    on ? "border-accbd bg-accbg text-t1" : "border-bd bg-sub text-t2"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-line py-5">
          <div className="text-[15px] font-semibold">Target levels</div>
          <div className="mt-3.5 grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const locked = n > patient.level;
              const on = plan.levels.includes(n);
              const style = locked
                ? "cursor-not-allowed border-bd bg-transparent text-dim"
                : on
                  ? "cursor-pointer border-accbd bg-accbg text-t1"
                  : "cursor-pointer border-bd bg-sub text-t2";
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on && !locked}
                  disabled={locked}
                  onClick={() =>
                    onPlanChange({ levels: on ? plan.levels.filter((x) => x !== n) : [...plan.levels, n].sort() })
                  }
                  className={`rounded-[9px] border py-3 text-[13.5px] font-medium ${style}`}
                >
                  {locked ? `${n} · locked` : `Level ${n}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-line py-5">
          <div className="text-[15px] font-semibold">Difficulty</div>
          <div className="mt-3.5 grid grid-cols-3 gap-1 rounded-[10px] border border-bd bg-sub p-1">
            {DIFFICULTIES.map((label) => {
              const on = plan.difficulty === label;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPlanChange({ difficulty: label })}
                  className={`cursor-pointer rounded-[7px] border-0 py-2.5 text-sm font-medium ${on ? "bg-acc text-ink" : "bg-transparent text-t2"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[10px] border border-bd bg-sub px-4 py-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-sm font-medium">What changes at {plan.difficulty}</div>
              <div className="text-xs text-t3">
                Level {shownLevel} · {patient.name}&apos;s max {maxMv.toFixed(2)} mV
              </div>
            </div>
            <div className="mt-1.5 text-[13px] leading-normal text-t2">{DIFFICULTY_PROFILES[plan.difficulty].summary}</div>
            <div className="mt-3.5 overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="w-[30%]" />
                    {DIFFICULTIES.map((d) => (
                      <th key={d} className="px-2.5 pb-2 text-left font-medium text-t3">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {difficultyRows.map((row) => (
                    <tr key={row.label} className="border-t border-line">
                      <td className="py-2.5 pr-2 text-t2">{row.label}</td>
                      {DIFFICULTIES.map((d) => {
                        const [main, sub] = row.cell(d);
                        return (
                          <td key={d} className="px-2.5 py-2.5">
                            <div className="font-mono text-t2">{main}</div>
                            <div className="text-[11.5px] text-t3">{sub}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-t3">
              Placeholder values. Final numbers will be set through testing. Medium matches the game as it plays today.
            </div>
          </div>
        </div>

        <div className="py-5">
          <div className="text-[15px] font-semibold">Notes for patient</div>
          <textarea
            value={plan.notes}
            onChange={(e) => onPlanChange({ notes: e.target.value })}
            rows={3}
            placeholder="Optional instructions"
            className="mt-3 w-full resize-y rounded-[10px] border border-bd bg-sub px-3.5 py-3 text-sm leading-normal text-t1 outline-none"
          />
        </div>
      </div>

      <div className={`${CARD} px-[26px] py-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2.5">
          <div className="text-[15px] font-semibold">Level settings</div>
          <InfoToggle
            open={showRandInfo}
            onToggle={() => setShowRandInfo(!showRandInfo)}
            label="What does Randomize gates do?"
          />
        </div>
        <div className="mt-1 text-[13px] text-t3">Gates and pacing for each level</div>
        {showRandInfo && (
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
            {RANDOMIZE_COPY.explainer.map((e, i) => (
              <div key={e.title} className="rounded-xl border border-bd bg-sub p-4">
                <div className="text-sm font-medium">
                  {e.title} <span className="font-normal text-t3">· Randomize {i === 0 ? "on" : "off"}</span>
                </div>
                <div className="my-3">
                  <GateStrip
                    heights={i === 0 ? RANDOM_LAYOUT : SET_LAYOUT}
                    label={i === 0 ? "Gate openings at varied heights" : "Gate openings in a repeating pattern"}
                  />
                </div>
                <div className="text-[13px] leading-normal text-t2">{e.body}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {[1, 2, 3, 4, 5].map((n) => {
            const c = levelConfig[n] ?? defaultLevelConfig(n);
            const set = (patch: Partial<LevelConfig>) => onLevelConfigChange(n, { ...c, ...patch });
            const status = n > patient.level ? "Locked" : n === patient.level ? "Current" : "Cleared";
            const statusClass = status === "Current" ? "text-acc" : status === "Cleared" ? "text-pass" : "text-t3";
            return (
              <div key={n} className="flex flex-col gap-3.5 rounded-xl border border-bd bg-sub p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-[14.5px] font-semibold">Level {n}</div>
                  <div className={`text-xs ${statusClass}`}>{status}</div>
                </div>
                <label className="block">
                  <div className="text-[12.5px] text-t2">Gates to clear</div>
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-[9px] border border-bd bg-card px-3">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={c.gates}
                      onChange={(e) => set({ gates: e.target.value })}
                      className={`${NUMBER_INPUT} py-2.5 text-[15px]`}
                    />
                    <span className="text-[12.5px] text-t3">gates</span>
                  </div>
                </label>
                <div>
                  <div className="text-[12.5px] text-t2">Time between gates</div>
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-[9px] border border-bd bg-card px-3">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      aria-label={`Shortest time between gates, level ${n}`}
                      value={c.gapMin}
                      onChange={(e) => set({ gapMin: e.target.value })}
                      className={`${NUMBER_INPUT} w-0 py-2.5 text-center text-[15px]`}
                    />
                    <span className="text-t3">–</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      aria-label={`Longest time between gates, level ${n}`}
                      value={c.gapMax}
                      onChange={(e) => set({ gapMax: e.target.value })}
                      className={`${NUMBER_INPUT} w-0 py-2.5 text-center text-[15px]`}
                    />
                    <span className="text-[12.5px] text-t3">sec</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2.5 border-t border-line pt-3">
                  <div className="text-[13px] text-t2">Randomize gates</div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.rand}
                    aria-label={`Randomize gates for level ${n}`}
                    onClick={() => set({ rand: !c.rand })}
                    className={`flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-0 p-[3px] ${
                      c.rand ? "justify-end bg-acc" : "justify-start bg-[oklch(0.34_0.028_258)]"
                    }`}
                  >
                    <span className={`size-[18px] rounded-full ${c.rand ? "bg-ink" : "bg-t2"}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13.5px] text-t2">{planStatus}</div>
        <button
          type="button"
          onClick={onAssign}
          className={`cursor-pointer rounded-[10px] border-0 px-[26px] py-[13px] text-[15px] font-semibold ${
            canAssign ? "bg-acc text-ink" : "bg-sub text-t3"
          }`}
        >
          {canAssign ? "Assign plan" : "Assigned"}
        </button>
      </div>
    </div>
  );
}
