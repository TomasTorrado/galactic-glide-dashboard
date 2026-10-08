import {
  DAYS,
  defaultLevelConfig,
  EMG_DEFAULTS,
  type Difficulty,
  type EmgCalibration,
  type LevelConfig,
  type Patient,
  type Plan,
} from "@/lib/mockData";
import PatientPicker from "./PatientPicker";

const CARD = "rounded-[14px] border border-bd bg-card";
const NUMBER_FIELD = "flex items-center gap-2 rounded-[10px] border border-bd bg-sub px-3.5";
const NUMBER_INPUT = "min-w-0 flex-1 border-0 bg-transparent font-mono text-t1 outline-none";

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
            {(["Easy", "Medium", "Hard"] as Difficulty[]).map((label) => {
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
        <div className="text-[15px] font-semibold">Level settings</div>
        <div className="mt-1 text-[13px] text-t3">Gates and pacing for each level</div>
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
                {(
                  [
                    { key: "gates", label: "Logic gates", unit: "gates" },
                    { key: "gap", label: "Time between gates", unit: "sec" },
                  ] as const
                ).map((f) => (
                  <label key={f.key} className="block">
                    <div className="text-[12.5px] text-t2">{f.label}</div>
                    <div className="mt-1.5 flex items-center gap-1.5 rounded-[9px] border border-bd bg-card px-3">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={c[f.key]}
                        onChange={(e) => set({ [f.key]: e.target.value })}
                        className={`${NUMBER_INPUT} py-2.5 text-[15px]`}
                      />
                      <span className="text-[12.5px] text-t3">{f.unit}</span>
                    </div>
                  </label>
                ))}
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
