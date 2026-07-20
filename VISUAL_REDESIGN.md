# Visual Redesign

## Design goals

MindTrace was redesigned from a dark technical dashboard into a calm learning product. The new direction emphasizes the learner task, visible reasoning differences, supportive guidance, and plain-language progress.

## Problems addressed

- Reduced pure-black surfaces and repeated bordered cards.
- Increased body text size and contrast.
- Replaced internal terms with learner-facing language on primary routes.
- Made Guided Demo a story instead of a control panel.
- Made the workspace clearly answer “what should I do now?”
- Made the report feel like a reflection rather than analytics.

## Design principles

1. Learning task first.
2. Progressive disclosure.
3. One primary action.
4. Human-readable typography.
5. Visual explanation before technical explanation.
6. Technical status remains secondary.

## Color system

The primary learner experience now uses a warm light palette:

- Background: `#F6F7F9`
- Surface: `#FFFFFF`
- Soft surface: `#F0F3F7`
- Primary text: `#172033`
- Secondary text: `#526072`
- Accent: `#5B6FEF`
- Success: `#2E9C6A`
- Attention: `#C88719`
- Conflict: `#D65B5B`

Dark mode tokens remain available through the `.dark` class but are no longer forced globally.

## Typography

Geist remains the UI font. Body text is larger and more readable, monospace is reserved for equations and compact data, and learner-facing labels avoid excessive uppercase tracking.

## Surface hierarchy

- Main lesson surface: white elevated surface.
- Supporting evidence: soft blue or neutral surfaces.
- Feedback/guidance: success or attention-tinted surfaces.
- Technical details: technology and pipeline-specific sections.

## Route changes

- Landing: hero now shows concrete learner comparison proof.
- Demo entry: one primary Guided Demo path with secondary options below.
- Guided Demo: compact controls, story-first scenes, technical summaries only at the close.
- Workspace: learner-first two-column layout with main lesson surface and secondary coach panel.
- Report: reflection-oriented sections with no fake scores.
- Technology/evaluation: clearer copy and less stale implementation language.

## Responsive behavior

Mobile remains single-column, with readable inputs, full-width controls, and no horizontal overflow. Tablet and desktop prioritize the learning task while keeping the coach panel secondary.

## Accessibility

The redesign preserves semantic headings, visible labels, keyboard controls, reduced-motion handling, accessible tables, and clear action text.

## Remaining limitations

This pass improves visual and UX presentation but does not add live service credentials, deployment, demo video recording, or new product features.
