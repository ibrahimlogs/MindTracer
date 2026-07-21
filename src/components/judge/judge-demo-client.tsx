"use client";

import dynamic from "next/dynamic";

import { SectionContainer } from "@/components/layout/primitives";

const JudgeDemoShell = dynamic(
  () => import("./judge-demo-shell").then((module) => module.JudgeDemoShell),
  {
    loading: () => (
      <SectionContainer>
        <div className="lesson-shadow rounded-[2rem] bg-white p-8">
          <p className="text-sm font-semibold text-reasoning">Guided Demo</p>
          <h1 className="text-ink mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Same answer.
            <span className="block text-reasoning">Different minds.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Preparing the reviewed demo path…
          </p>
        </div>
      </SectionContainer>
    ),
    ssr: false,
  },
);

export function JudgeDemoClient() {
  return <JudgeDemoShell />;
}
