# Verification engine

Step 7 implements the “same answer, different minds” check. The learner-safe posture is: “I see more than one possible idea behind your answer, so MindTrace will check one small detail.”

Verification is required when multiple hypotheses remain plausible, confidence is not high, structured analysis asks for clarification, answer and reasoning conflict, counter-signals exist, or arithmetic-only and conceptual explanations are unclear.

Question selection starts with curated Step 4 templates. The deterministic adapter fills problem values and preserves the instructional goal. It may not reveal the final answer, state a diagnosis, ask multiple independent questions, or introduce unrelated theory.

Learner A and Learner B both answer `10`, but receive different verification checks:

- Learner A: “When advertising increases from 1 to 2, how much does sales increase?”
- Learner B: “If sales were exactly double advertising, what should sales be when advertising is 2? Does that match the table?”

The evaluator can return `confirmed`, `probable`, `uncertain`, `not_detected`, or `arithmetic_only`. It records supported, weakened, and rejected hypothesis IDs, recommends an intervention family, and sets a starting level from 1 to 4. Step 8 will generate and animate the actual intervention.

Automatic verification is capped at two questions per initial attempt. If the distinction remains unresolved, MindTrace chooses a conservative support path instead of interrogating the learner.
