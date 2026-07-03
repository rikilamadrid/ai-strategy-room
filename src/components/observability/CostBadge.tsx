export function CostBadge() {
  return (
    <div
      className="flex items-center gap-3 font-mechanical text-[11px] uppercase tracking-[0.14em] text-brass-light sm:text-xs"
      aria-label="Session cost $0.01"
    >
      <div
        className="relative size-12 shrink-0 rounded-full border-2 border-brass bg-[radial-gradient(circle_at_35%_30%,var(--color-brass-dark),var(--color-bg)_70%)] shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-pink)_35%,transparent)] sm:size-[54px]"
        aria-hidden="true"
      >
        <span className="absolute left-1/2 top-1/2 h-4 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rotate-[35deg] bg-pink shadow-[0_0_6px_var(--color-pink)] sm:h-5" />
      </div>
      <span className="whitespace-nowrap">Session cost $0.01</span>
    </div>
  );
}
