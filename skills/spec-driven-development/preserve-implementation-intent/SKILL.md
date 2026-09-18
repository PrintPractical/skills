---
name: preserve-implementation-intent
description: Invoke before creating or updating OpenSpec or other spec-driven development assets, including proposals, design documents, capability specs, implementation plans, and tasks. Preserve implementation-relevant details from exploration and planning, route them into the appropriate artifacts, and expose consequential ambiguity before drafting rather than only reviewing afterward.
user-invocable: false
---

# Preserve Implementation Intent

## Purpose and Timing

Load this skill before drafting or editing development assets, not only as a final
review. Apply it when producing one artifact or a complete set, including when
continuing artifact creation in a fresh session. Follow the existing framework's
templates, artifact dependencies, scope, and approval process.

Preserve any established detail whose omission could plausibly lead an implementing
agent to produce a materially different result, even if that result satisfies the
high-level requirements. Optimize for implementation fidelity, not document length.

This skill enriches existing assets. It does not introduce another required document,
discovery log, approval gate, or implementation lifecycle. Do not create unrelated
assets or begin implementation just because this skill is loaded.

## Before Drafting

1. Read the relevant available conversation, exploration findings, existing assets,
   and referenced code or documentation. Identify the artifact being produced and
   its place in the framework's workflow.
2. Gather implementation-relevant decisions, constraints, discovered behavior,
   examples, rejected alternatives, and unresolved questions. Use the detail prompts
   below to recover context, not to invent requirements.
3. Distinguish agreed requirements and choices from observed existing behavior,
   proposed approaches, unverified assumptions, and open questions. Existing behavior
   is evidence, not automatically a requirement to preserve it.
4. Decide where each relevant detail belongs. Compare against existing assets so
   drafting does not silently drop, duplicate, or contradict established intent.
5. Resolve consequential ambiguity with a targeted question when needed for the
   current artifact. Otherwise record the uncertainty or explicitly leave the choice
   open. Do not ask the user to decide every incidental coding detail.

If earlier context is unavailable, use accessible assets and evidence, state the
specific gap, and ask only for missing information that materially affects the result.
Do not claim to recover unavailable discussion or treat silence as agreement.

## Details Worth Preserving

- Interaction behavior: submission, cancellation, navigation, focus, selection,
  loading indicators, and error presentation where established.
- State handling: what persists, resets, remains visible, or survives retries,
  failures, refreshes, and interrupted operations.
- Integration choices: concrete existing owners, components, utilities, interfaces,
  and conventions to reuse, including relevant code paths or symbols.
- Execution semantics: ordering, validation timing, concurrency, cancellation,
  partial failure, cleanup, and boundary conditions.
- Constraints and exclusions: compatibility, security, performance, operational
  limits, non-goals, deferred work, and behavior that must not be introduced.
- Decision context: concise rationale and rejected alternatives when omission would
  invite an implementer to reopen a settled choice or repeat a known mistake.
- Verification intent: specific observable outcomes, examples, and failure scenarios
  that distinguish the intended solution from a merely plausible implementation.

Include only relevant categories. Preserve concrete values and examples when known;
do not replace them with vague phrases such as "handle errors appropriately."
Do not pad artifacts with transcripts, exhaustive deliberation, speculative edge
cases, or invented precision. Record decision summaries and useful rationale.

For architectural plans, load `architecture-guidance` and the applicable language
practices before assigning owners or boundaries. Preserve the rule owner, workflow,
technology contracts, dependency direction, and consequential lifecycle decisions.
Identify existing owners by actual paths/symbols. For new code, likely cohesive
modules and constraints suffice; do not turn provisional paths into required file
trees, one artifact per responsibility, or speculative extension points. Preserve
an exact path when it is an agreed requirement or a real integration constraint.

## Place Details in OpenSpec Assets

Use the project's actual schema and templates; the following maps responsibilities,
not mandatory new headings or a replacement artifact format.

| Asset | Preserve here |
| --- | --- |
| Proposal | Motivation, scope, and intended outcomes. Add implementation detail only when it materially changes the why or scope. |
| Design | Primary home for implementation choices, detailed behavior, integration points, constraints, rationale, and unresolved questions. |
| Capability specs | Observable required behavior and distinguishing scenarios. Keep incidental implementation mechanics in the design unless they are genuine requirements. |
| Tasks | Actionable implementation and verification work, dependencies, and precise references to relevant design sections or requirements. |

For other frameworks, map these responsibilities onto their existing artifacts.
Do not force OpenSpec filenames or structure onto them.

Keep one authoritative home for each detail, with concise references where needed.
Tasks must make important design details discoverable at the point of implementation;
"implement according to the design" is insufficient when it conceals a specific
failure path or constraint. Include the relevant section or requirement reference.

When producing only an early artifact, retain consequential detail in its permitted
sections if no appropriate downstream asset exists yet. Mark its status and intended
destination concisely rather than relying on conversation memory. Do not bypass the
framework's artifact order to create a full design prematurely.

When revising an established decision, reconcile affected artifacts within the
authorized scope. If an affected asset cannot be updated yet, flag the specific
follow-up rather than leaving the contradiction unmentioned. Do not silently rewrite
approved requirements or promote a proposed approach into an agreed constraint.

## Example

Suppose exploration established that a failed save must preserve entered values,
keep the editor open, and show an inline error rather than a toast.

- Design: describe the failure interaction and established component/state reuse,
  with rationale if it helps prevent an alternative implementation.
- Capability spec: include a failed-save scenario requiring retained values, an open
  editor, and an inline error. Do not invent unspecified wording or retry behavior.
- Task: implement and verify the failed-save path, referencing the relevant design
  section and scenario, rather than simply "handle save errors."
- Proposal: leave unchanged unless this behavior materially affects scope or purpose.

If automatic retry was merely suggested, keep it proposed or unresolved; do not turn
it into a requirement while preserving the agreed failure behavior.

## Before Finishing

Review the assets from the perspective of a fresh implementing agent:

> Using only these artifacts, where could an agent reasonably choose a different
> behavior or approach from what we established?

For each consequential gap, restore the supported detail, explicitly leave the
choice open, or ask a targeted question. Check that small but important choices
survive, uncertainty remains labeled, references resolve, and tasks expose relevant
constraints and verification work. Remove unnecessary duplication and reconcile
contradictions. Report material remaining gaps without claiming the artifacts
contain context you could not access.
