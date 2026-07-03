export function QuestionPlate({ question }: { question: string }) {
  return (
    <div className="mx-auto max-w-[420px] rounded-lg border-2 border-brass bg-[linear-gradient(180deg,#241a1d,#150f12)] px-6 py-[18px] text-center shadow-[0_0_20px_color-mix(in_srgb,var(--color-pink)_15%,transparent),inset_0_0_12px_rgb(0_0_0_/_60%)]">
      <div className="mb-1.5 font-mechanical text-[11px] uppercase tracking-[0.26em] text-pink-soft">
        Your question
      </div>
      <p className="m-0 font-editorial text-[19px] italic text-parchment">
        {question}
      </p>
    </div>
  );
}
