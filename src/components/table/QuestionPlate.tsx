"use client";

import { useState, type FormEvent } from "react";

import { useStrategyStore } from "@/stores/strategy-store";

const MAX_QUESTION_LENGTH = 280;

const PLATE_CLASS =
  "mx-auto max-w-[420px] rounded-lg border-2 border-brass bg-[linear-gradient(180deg,#241a1d,#150f12)] px-6 py-[18px] shadow-[0_0_20px_color-mix(in_srgb,var(--color-pink)_15%,transparent),inset_0_0_12px_rgb(0_0_0_/_60%)]";

export function QuestionPlate() {
  const status = useStrategyStore((state) => state.status);
  const question = useStrategyStore((state) => state.question);
  const setQuestion = useStrategyStore((state) => state.setQuestion);
  const startSession = useStrategyStore((state) => state.startSession);

  const [draft, setDraft] = useState("");

  if (status !== "idle") {
    return (
      <div className={`${PLATE_CLASS} text-center`}>
        <div className="mb-1.5 font-mechanical text-[11px] uppercase tracking-[0.26em] text-pink-soft">
          Your question
        </div>
        <p className="m-0 font-editorial text-[19px] italic text-parchment">
          {question}
        </p>
      </div>
    );
  }

  const trimmed = draft.trim();
  const isValid = trimmed.length > 0;
  const showRequiredHint = draft.length > 0 && trimmed.length === 0;
  const remaining = MAX_QUESTION_LENGTH - draft.length;

  const hint = showRequiredHint
    ? "A question is required to convene the table."
    : `${remaining} characters left`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    setQuestion(trimmed);
    startSession(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className={PLATE_CLASS}>
      <label
        htmlFor="strategy-question"
        className="mb-2 block text-center font-mechanical text-[11px] uppercase tracking-[0.26em] text-pink-soft"
      >
        Pose your question
      </label>
      <textarea
        id="strategy-question"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={2}
        maxLength={MAX_QUESTION_LENGTH}
        placeholder="Should we relocate the studio to Madrid next year?"
        className="w-full resize-none rounded-md border border-brass-dark bg-[rgb(0_0_0_/_35%)] px-3 py-2 text-center font-editorial text-[17px] italic text-parchment shadow-[inset_0_0_10px_rgb(0_0_0_/_55%)] outline-none placeholder:not-italic placeholder:text-brass-dark focus:border-brass"
      />
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <span
          className={`font-mechanical text-[10px] uppercase tracking-[0.14em] ${
            showRequiredHint ? "text-amber" : "text-brass-dark"
          }`}
        >
          {hint}
        </span>
        <button
          type="submit"
          disabled={!isValid}
          className="rounded-md border-2 border-brass bg-[linear-gradient(180deg,#3a2c12,#1c1409)] px-4 py-2 font-mechanical text-[11px] uppercase tracking-[0.18em] text-brass-light shadow-[0_0_12px_color-mix(in_srgb,var(--color-pink)_18%,transparent)] transition-shadow hover:shadow-[0_0_18px_color-mix(in_srgb,var(--color-pink)_32%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-light disabled:cursor-not-allowed disabled:border-brass-dark disabled:text-brass-dark disabled:shadow-none"
        >
          Convene the table
        </button>
      </div>
    </form>
  );
}
