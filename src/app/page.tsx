export default function Home() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[900px] items-center justify-center px-5 py-7">
      <section className="w-full rounded-md border-2 border-brass-dark bg-bg2/80 px-6 py-10 text-center shadow-[0_0_0_1px_rgba(201,162,39,0.15),0_0_24px_rgba(255,47,176,0.08)]">
        <p className="font-mechanical text-xs uppercase tracking-[0.2em] text-cyan [text-shadow:0_0_6px_rgba(47,214,214,0.6)]">
          Cinematic decision chamber
        </p>
        <h1 className="mt-4 font-display text-4xl font-black text-brass-light [text-shadow:0_0_10px_var(--color-pink),0_0_2px_var(--color-brass-light)]">
          AI Strategy Table
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-editorial text-xl italic leading-8 text-parchment">
          The room is lit. The instruments are calibrated. The advisors arrive
          in the next build phase.
        </p>
      </section>
    </main>
  );
}
