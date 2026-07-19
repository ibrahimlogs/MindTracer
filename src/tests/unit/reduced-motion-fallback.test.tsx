import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReducedMotionFallback } from "@/components/visualization/reduced-motion-fallback";

describe("ReducedMotionFallback", () => {
  it("preserves the complete reasoning meaning without WebGL", () => {
    render(<ReducedMotionFallback />);

    expect(screen.getByText("Learner reasoning")).toBeInTheDocument();
    expect(screen.getByText("Hypothesis A")).toBeInTheDocument();
    expect(screen.getByText("Hypothesis B")).toBeInTheDocument();
    expect(screen.getByText("Verification")).toBeInTheDocument();
    expect(screen.getByText("Intervention")).toBeInTheDocument();
    expect(screen.getByText("Independent transfer")).toBeInTheDocument();
  });
});
