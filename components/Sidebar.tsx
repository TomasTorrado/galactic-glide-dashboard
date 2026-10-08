export type Section = "patients" | "protocols" | "launcher";

const NAV: { label: string; section: Section }[] = [
  { label: "Patients", section: "patients" },
  { label: "Protocols", section: "protocols" },
  { label: "Game Launcher", section: "launcher" },
];

interface SidebarProps {
  active: Section;
  onNavigate: (section: Section) => void;
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col gap-8 border-r border-line bg-side px-3.5 py-7">
      <div className="flex items-center gap-[11px] px-2.5">
        <div className="flex size-[30px] items-center justify-center rounded-lg bg-acc font-mono text-[12.5px] font-medium text-ink">
          GG
        </div>
        <div className="text-[15px] font-semibold tracking-[-0.01em]">Galactic Glide</div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, section }) => {
          const on = section === active;
          return (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate(section)}
              aria-current={on ? "page" : undefined}
              className={`cursor-pointer rounded-[9px] px-3 py-[11px] text-left text-[14.5px] ${
                on ? "bg-card font-semibold text-t1" : "bg-transparent font-medium text-t2"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-2.5 text-[13px] text-t3">Dr. A. Halvorsen, PT</div>
    </aside>
  );
}
