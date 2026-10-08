"use client";

import { useState } from "react";
import { PATIENTS, type Patient } from "@/lib/mockData";

interface PatientPickerProps {
  current: Patient;
  onPick: (mrn: string) => void;
  /** "card" is the Protocols header style; "field" is the Game Launcher form style. */
  variant: "card" | "field";
}

export default function PatientPicker({ current, onPick, variant }: PatientPickerProps) {
  const [open, setOpen] = useState(false);
  const card = variant === "card";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 border border-bd px-4 py-3.5 text-left text-t1 ${
          card ? "rounded-xl bg-card" : "rounded-[10px] bg-sub"
        }`}
      >
        <span className="text-[15px] font-semibold">{current.name}</span>
        <span className="text-[13px] text-t3">{card ? `${current.leg} leg · Change ▾` : "▾"}</span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-20 flex flex-col gap-0.5 rounded-xl border border-bd bg-pop p-1.5 shadow-[0_18px_40px_rgba(2,5,18,0.55)]">
          {PATIENTS.map((p) => (
            <button
              key={p.mrn}
              type="button"
              onClick={() => {
                onPick(p.mrn);
                setOpen(false);
              }}
              className={`flex cursor-pointer justify-between gap-3 rounded-lg border-0 px-3 py-[11px] text-left text-sm text-t1 ${
                p.mrn === current.mrn ? "bg-accbg" : "bg-transparent"
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[13px] text-t3">{p.leg} leg</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
