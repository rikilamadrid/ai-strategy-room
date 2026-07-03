import type { DecisionBrief as DecisionBriefModel } from "@/types/strategy";

interface DecisionBriefProps {
  brief: DecisionBriefModel;
}

function getConfidenceLabel(confidence: number) {
  if (confidence >= 0.75) {
    return "high";
  }

  if (confidence >= 0.45) {
    return "moderate";
  }

  return "low";
}

export function DecisionBrief({ brief }: DecisionBriefProps) {
  const confidenceLabel = getConfidenceLabel(brief.confidence);
  const briefItems = [
    ...brief.agreements.map((item) => `Agreement: ${item}`),
    ...brief.risks.map((item) => `Risk: ${item}`),
    `Next action: ${brief.nextAction}`,
  ];

  return (
    <section className="min-h-[260px] rounded-md border-2 border-brass-dark bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-parchment)_96%,white),color-mix(in_srgb,var(--color-brass-light)_54%,var(--color-parchment)))] px-[18px] py-4 text-ink shadow-[inset_0_0_42px_rgb(42_33_24_/_18%)]">
      <h2 className="mb-5 mt-0 font-display text-base font-black uppercase tracking-[0.04em] text-brass-dark">
        Decision brief
      </h2>
      <p className="mb-4 border-l-[3px] border-seal pl-3 font-editorial text-[1.35rem] italic leading-7">
        Recommendation: {brief.recommendation}
      </p>
      <p className="mb-3 font-mechanical text-xs uppercase tracking-[0.16em] text-ink/80">
        Confidence — {confidenceLabel}
      </p>
      <ul className="m-0 list-disc space-y-1 pl-5 font-editorial text-lg leading-7">
        {briefItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
