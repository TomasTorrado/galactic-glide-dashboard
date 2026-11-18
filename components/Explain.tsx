import { useId, useState, type ReactNode } from "react";

export function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 fill-none stroke-current">
      <circle cx="8" cy="8" r="6.75" strokeWidth={1.5} />
      <path d="M8 7.25v4" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.4" strokeWidth={1.2} className="fill-current" />
    </svg>
  );
}

/** ⓘ button that opens a "learn more" panel the caller renders. */
export function InfoToggle({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-1.5 text-[13px] text-acc hover:text-acc-hover"
    >
      <InfoIcon />
      {open ? "Hide" : label}
    </button>
  );
}

/** Panel of titled paragraphs shown under an InfoToggle. */
export function LearnMore({ sections }: { sections: { title: string; body: string }[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-bd bg-sub p-4">
      {sections.map((s) => (
        <div key={s.title}>
          <div className="text-sm font-medium">{s.title}</div>
          <div className="mt-1 text-[13px] leading-normal text-t2">{s.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Dotted-underlined term with a short definition on hover, focus or tap. */
export function Term({ tip, align = "left", children }: { tip: string; align?: "left" | "right"; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-describedby={id}
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        className="cursor-help underline decoration-t3 decoration-dotted underline-offset-[3px]"
      >
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        className={`absolute top-full z-10 mt-2 w-64 rounded-lg border border-bd bg-pop px-3 py-2.5 text-left text-[12.5px] font-normal leading-normal text-t2 shadow-lg ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "block" : "hidden group-hover:block group-focus-within:block"}`}
      >
        {tip}
      </span>
    </span>
  );
}
