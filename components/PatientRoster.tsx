import { PATIENTS, type Result } from "@/lib/mockData";

const COLS = "grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_16px]";

export const resultColor = (r: Result) => (r === "Passed" ? "text-pass" : "text-fail");

interface PatientRosterProps {
  query: string;
  onQueryChange: (q: string) => void;
  onOpenPatient: (mrn: string) => void;
}

export default function PatientRoster({ query, onQueryChange, onOpenPatient }: PatientRosterProps) {
  const q = query.trim().toLowerCase();
  const patients = PATIENTS.filter((p) => !q || p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Patients</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name or MRN"
          className="w-[300px] max-w-full rounded-[10px] border border-bd bg-card px-3.5 py-[11px] text-sm text-t1 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-[14px] border border-bd bg-card">
        <div className="overflow-x-auto">
          <div className={`grid ${COLS} gap-3.5 border-b border-line px-6 py-3.5 text-[12.5px] text-t3`}>
            <div>Patient</div>
            <div>Last session</div>
            <div>Level</div>
            <div>Last result</div>
            <div />
          </div>
          {patients.map((p) => (
            <button
              key={p.mrn}
              type="button"
              onClick={() => onOpenPatient(p.mrn)}
              className={`grid w-full ${COLS} cursor-pointer items-center gap-3.5 border-b border-line px-6 py-[18px] text-left text-sm text-t2 hover:bg-hover`}
            >
              <div>
                <div className="text-[15px] font-semibold text-t1">{p.name}</div>
                <div className="mt-0.5 text-[13px] text-t3">{p.leg} leg</div>
              </div>
              <div>{p.last}</div>
              <div>{p.level} of 5</div>
              <div className={`flex items-center gap-2 font-medium ${resultColor(p.status)}`}>
                <span className="size-[7px] rounded-full bg-current" />
                {p.status}
              </div>
              <div className="text-chevron">›</div>
            </button>
          ))}
        </div>
        {patients.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-t3">No patients match your search.</div>
        )}
      </div>
    </div>
  );
}
