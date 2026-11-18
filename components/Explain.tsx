import { useEffect, useId, useRef, useState, type ReactNode } from "react";

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

/** Short description line with an ⓘ that expands into a LearnMore panel. */
export function CardIntro({
  text,
  sections,
  label = "How to read this chart",
}: {
  text: string;
  sections: { title: string; body: string }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="max-w-[560px] text-[13px] leading-normal text-t3">{text}</div>
        <InfoToggle open={open} onToggle={() => setOpen(!open)} label={label} />
      </div>
      {open && (
        <div className="mt-4">
          <LearnMore sections={sections} />
        </div>
      )}
    </>
  );
}

const TIP_WIDTH = 256;

/**
 * Dotted-underlined term with a short definition on hover, focus or tap.
 * The tip is position: fixed so cards that clip or scroll can't cut it off; it closes on scroll.
 */
export function Term({ tip, align = "left", children }: { tip: string; align?: "left" | "right"; children: ReactNode }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const left = align === "right" ? r.right - TIP_WIDTH : r.left;
    setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(left, window.innerWidth - TIP_WIDTH - 8)) });
  };
  const hide = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [pos]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-describedby={id}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={show}
        className="cursor-help underline decoration-t3 decoration-dotted underline-offset-[3px]"
      >
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!pos}
        style={{ ...pos, width: TIP_WIDTH }}
        className="fixed z-50 rounded-lg border border-bd bg-pop px-3 py-2.5 text-left text-[12.5px] font-normal leading-normal text-t2 shadow-lg"
      >
        {tip}
      </span>
    </>
  );
}
