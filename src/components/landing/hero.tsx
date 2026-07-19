"use client";

import { motion } from "framer-motion";
import { ArrowRight, ScanSearch } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <div className="mb-8 flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-reasoning uppercase">
          <ScanSearch className="size-4" aria-hidden="true" />
          Diagnostic reasoning environment
        </div>
        <h1 className="max-w-3xl text-5xl leading-[1.02] font-semibold tracking-[-0.045em] sm:text-7xl">
          Same answer.
          <span className="block text-text-secondary">Different minds.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-text-secondary">
          MindTrace finds the reasoning behind a learner’s mistake, tests the
          most likely misconception, and measures whether understanding
          transfers beyond the original problem.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/demo">
              Explore the lab{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/technology">See the architecture</Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
