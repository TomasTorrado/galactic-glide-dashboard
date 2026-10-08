"use client";

import { useState } from "react";
import GameLauncher from "@/components/GameLauncher";
import PatientDetail from "@/components/PatientDetail";
import PatientRoster from "@/components/PatientRoster";
import Protocols from "@/components/Protocols";
import SessionDetail from "@/components/SessionDetail";
import Sidebar, { type Section } from "@/components/Sidebar";
import { defaultPlan, PATIENTS, type EmgCalibration, type LevelConfig, type Plan } from "@/lib/mockData";

type View = "roster" | "detail" | "session" | "protocols" | "launcher";

const SECTION_HOME: Record<Section, View> = { patients: "roster", protocols: "protocols", launcher: "launcher" };

function sectionOf(view: View): Section {
  if (view === "protocols" || view === "launcher") return view;
  return "patients";
}

export default function Home() {
  const [view, setView] = useState<View>("roster");
  const [pid, setPid] = useState(PATIENTS[0].mrn);
  const [query, setQuery] = useState("");
  // Per-patient edits, keyed by MRN. Kept here so they survive navigating between screens.
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [emg, setEmg] = useState<Record<string, EmgCalibration>>({});
  const [levelCfg, setLevelCfg] = useState<Record<string, Record<number, LevelConfig>>>({});
  const [launched, setLaunched] = useState<{ mrn: string; at: string } | null>(null);

  const patient = PATIENTS.find((p) => p.mrn === pid) ?? PATIENTS[0];
  const plan = plans[patient.mrn] ?? defaultPlan(patient);

  const go = (next: View) => {
    setView(next);
    window.scrollTo(0, 0);
  };

  const launch = () => {
    const d = new Date();
    const at = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    setLaunched({ mrn: patient.mrn, at });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={sectionOf(view)} onNavigate={(s) => go(SECTION_HOME[s])} />

      <main className="min-w-0 flex-1 px-12 pt-10 pb-20">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-6">
          {view === "roster" && (
            <PatientRoster
              query={query}
              onQueryChange={setQuery}
              onOpenPatient={(mrn) => {
                setPid(mrn);
                go("detail");
              }}
            />
          )}
          {view === "detail" && <PatientDetail patient={patient} onBack={() => go("roster")} onOpenSession={() => go("session")} />}
          {view === "session" && <SessionDetail patient={patient} onBack={() => go("detail")} />}
          {view === "protocols" && (
            <Protocols
              patient={patient}
              onPickPatient={setPid}
              plan={plan}
              onPlanChange={(patch) => setPlans((all) => ({ ...all, [patient.mrn]: { ...plan, ...patch, dirty: true } }))}
              onAssign={() =>
                setPlans((all) => ({ ...all, [patient.mrn]: { ...plan, dirty: false, assignedAt: "30 Sep 2026" } }))
              }
              emg={emg[patient.mrn]}
              onEmgChange={(next) => setEmg((all) => ({ ...all, [patient.mrn]: next }))}
              levelConfig={levelCfg[patient.mrn] ?? {}}
              onLevelConfigChange={(n, next) =>
                setLevelCfg((all) => ({ ...all, [patient.mrn]: { ...all[patient.mrn], [n]: next } }))
              }
            />
          )}
          {view === "launcher" && (
            <GameLauncher
              patient={patient}
              onPickPatient={setPid}
              launchedAt={launched?.mrn === patient.mrn ? launched.at : null}
              onLaunch={launch}
            />
          )}
        </div>
      </main>
    </div>
  );
}
