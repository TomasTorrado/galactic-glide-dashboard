import { BASELINE_PENDING, type Patient } from "@/lib/mockData";
import PatientPicker from "./PatientPicker";

interface GameLauncherProps {
  patient: Patient;
  onPickPatient: (mrn: string) => void;
  /** Launch time (HH:MM) if the game was started for this patient. */
  launchedAt: string | null;
  onLaunch: () => void;
}

export default function GameLauncher({ patient, onPickPatient, launchedAt, onLaunch }: GameLauncherProps) {
  const pending = BASELINE_PENDING.has(patient.mrn);

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Game Launcher</h1>

      <div className="flex flex-col gap-5 rounded-[14px] border border-bd bg-card p-6">
        <div>
          <div className="mb-2 text-[13px] text-t3">Patient</div>
          <PatientPicker current={patient} onPick={onPickPatient} variant="field" />
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className={`flex items-center gap-2 font-semibold ${pending ? "text-warn" : "text-pass"}`}>
            <span className="size-2 rounded-full bg-current" />
            {pending ? "Baseline pending — game opens on calibration first" : "Ready to launch"}
          </div>
          <div className="text-t2">
            Last session {patient.last} · Level {patient.level} of 5
          </div>
        </div>

        <button
          type="button"
          onClick={onLaunch}
          className="w-full cursor-pointer rounded-[10px] border-0 bg-acc p-[15px] text-[15.5px] font-semibold text-ink hover:bg-[oklch(0.8_0.085_195)]"
        >
          Launch Galactic Glide
        </button>
      </div>

      {launchedAt && (
        <div className="rounded-xl border border-accbd bg-accbg px-5 py-4 text-sm leading-normal">
          Galactic Glide started for {patient.name} at {launchedAt}.
        </div>
      )}
    </div>
  );
}
