import type { SessionSnapshot } from "@/lib/session-engine";

import { AdditiveMultiplicativeContrast } from "./additive-multiplicative-contrast";
import { ArithmeticCheckVisualizer } from "./arithmetic-check-visualizer";
import { ConsecutiveDifferenceVisualizer } from "./consecutive-difference-visualizer";
import { EvidenceComparisonVisualizer } from "./evidence-comparison-visualizer";
import { SlopeInterceptBridge } from "./slope-intercept-bridge";
import { VariableRoleMap } from "./variable-role-map";

interface InterventionCanvasProps {
  intervention: SessionSnapshot["intervention"];
}

export function InterventionCanvas({ intervention }: InterventionCanvasProps) {
  if (!intervention) return null;
  const config = intervention.visualizerConfig;

  if (config.visualizerType === "consecutive_difference") {
    return <ConsecutiveDifferenceVisualizer config={config} />;
  }
  if (config.visualizerType === "additive_multiplicative_contrast") {
    return <AdditiveMultiplicativeContrast config={config} />;
  }
  if (config.visualizerType === "slope_intercept_bridge") {
    return <SlopeInterceptBridge config={config} />;
  }
  if (config.visualizerType === "variable_role_map") {
    return <VariableRoleMap config={config} />;
  }
  if (config.visualizerType === "arithmetic_check") {
    return <ArithmeticCheckVisualizer config={config} />;
  }
  return <EvidenceComparisonVisualizer config={config} />;
}
