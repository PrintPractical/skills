---
name: architecture-guidance
description: Apply pragmatic DDD and hexagonal architecture when designing, planning, implementing, refactoring, or reviewing domain behavior, application workflows, integrations, or runtime ownership. Use before assigning owners, choosing module boundaries, defining ports, or introducing tasks and channels; preserve technology isolation and traceable flows without speculative structure.
user-invocable: false
---

# Architecture Guidance

## Priorities

Preserve authoritative ownership, inward dependencies, explicit resource lifecycles,
and traceable workflows using the least structural machinery that makes them clear.
DDD building blocks are tools, not a checklist. A responsibility does not imply its
own directory, file, type, interface, representation, or runtime hop. Small size does
not excuse infrastructure coupling or misplaced rules; large size does not justify
forwarding layers without behavior.

Load the applicable language practices skill before committing to language-specific
organization or implementation decisions. Load `dependency-approval`
before selecting a new dependency. If required guidance is unavailable, report the
gap before making the affected decision; do not invent its policy.

For concurrency, lifecycle, stateful resources, state machines, or hot-path changes,
read [Runtime Ownership](references/runtime.md) before designing or changing them.

## Hard Boundaries

- Domain concepts own rules and invariants, not transport handlers, persistence
  implementations, or composition. Give each rule and mapping one authoritative owner.
- Domain code does not import application, concrete infrastructure, external formats,
  OS integration, runtime mechanisms, or telemetry SDKs.
- Application owns workflows and accesses infrastructure through application-owned
  capability contracts expressed in core terms, not concrete adapter or SDK APIs.
- Adapters depend inward and translate technology-specific representations and
  failures where semantics differ. They do not own domain rules or application flows.
- Composition selects, constructs, and injects concrete implementations. Long-lived
  resources and tasks have explicit owners, failure handling, and shutdown behavior.

A technology-isolating port is justified even with one implementation. This is not
permission to add an interface for every internal function or use case. Language
practices specify allowed supporting libraries and mechanisms for these boundaries.

## Default Design Recipe

1. Inspect existing behavior and the repository's concepts and boundaries.
2. Reuse the existing cohesive owner when correct. Otherwise name the domain concept
   that owns the new rules and invariants; keep related behavior and values together.
3. Keep orchestration in a readable application operation. Make ordering, domain
   decisions, external effects, transaction intent, and failure paths discoverable.
4. Define only the external capabilities the workflow needs, using core-owned types
   and failure semantics. Implement them in technology-specific adapters.
5. Wire concrete implementations in composition; name resource and lifecycle owners.
6. Start with shallow cohesive modules. Split only for a concrete ownership,
   visibility, technology, or navigation need; use the decision table below.
7. Identify behavioral checks for rules, workflows, boundary translations, and any
   lifecycle guarantees affected by the change.

Stop when the required behavior and boundaries are covered. Do not invent missing
responsibilities to complete the recipe: a pure library needs no application layer
or ports, and a use case needs no forwarding handler solely to look layered. An
inbound adapter can call a pure domain operation directly when no application
workflow is needed; do not use this exception to hide orchestration in the adapter.

For existing code, identify actual owner symbols and paths. For greenfield work,
name likely cohesive modules, responsibilities, and dependency constraints without
freezing speculative submodule paths. An owner can be a function or type within a
module, not necessarily a separate file. Record consequential choices in the
existing plan/design; small changes do not require a new architecture document.

Semantic duplication is duplication even when the syntax differs. Shared behavior
belongs with its concept or boundary, not an indiscriminate helper/common module.

## Defaults and Exceptions

| Decision | Default | Add structure when |
| --- | --- | --- |
| File or module | Extend the existing cohesive owner; otherwise start shallow | Independent change, ownership, visibility, or actual navigation difficulty warrants separation |
| Trait or interface | Use concrete internal functions and types | Isolating infrastructure or expressing a meaningful interchangeable policy |
| Data representation | Reuse core-owned types across matching internal semantics | Meaning, validation, trust, persistence, or schema evolution differs |
| Task or channel | Make direct synchronous or async calls | Concurrency, resource ownership, isolation, or backpressure needs an execution boundary |
| Wrapper | Call the meaningful operation directly | The wrapper owns real policy, translation, or lifecycle behavior |
| Package or crate | Keep existing package boundaries | Dependency enforcement, cohesive reuse, or build requirements justify extraction |

State the concrete need for the mechanism being added. A task's concurrency need
does not justify a command bus or DTO family. Hypothetical future integrations and
test mocking alone are not reasons to add abstractions. No fixed file-size or
file-count threshold replaces a cohesion decision.

## Traceable Flows

Keep the important workflow visible in one application operation, calling meaningful
domain operations and ports rather than chains of pass-through services. Use names
that describe behavior, not just pattern roles. Co-locate related inputs, results,
errors, and private helpers instead of making a directory for every kind of type.

A reader must be able to locate entry -> workflow -> domain decisions and external
effects, follow result/failure handling, and find implementation selection in
composition. This is a navigation check, not a required linear execution order.
Use explicit calls and injection by default, not hidden registries or implicit
dispatch. Necessary asynchronous boundaries must expose how work and failures flow.

- **Useful boundary:** `reserve_seat` checks a domain invariant and persists through
  a core-owned `ReservationStore`; composition injects its SQLite implementation.
  The port protects the application even if SQLite is the only implementation.
- **Unnecessary chain:** handler -> service -> use-case wrapper -> repository wrapper
  where intermediate components only forward. Remove redundant steps, not the port
  that keeps SQLite types and errors out of the application.
- **Cohesive module:** configuration values, errors, and resolution operations can
  share a module. Split resolution when it gains an independent API or makes that
  module difficult to navigate, not because a diagram names it separately.
- **Necessary separation:** protocol decoding and domain validation have different
  owners. Keep transport dependencies out of domain behavior even in a small CLI;
  shallow modules suffice without nested layer directories.

## Core and Boundaries

Dependencies point inward:

```text
inbound adapter -> application -> domain
application -> outbound port <- outbound adapter
composition root assembles concrete implementations
```

- **Domain:** Concepts, state, decisions, rules, and invariants, identified by meaning
  rather than complexity. Use entities, value objects, aggregates, policies, services,
  errors, or genuinely meaningful domain events only where appropriate.
- **Application:** Cohesive use cases that load state, invoke domain behavior,
  coordinate operations, own transaction boundaries, persist results, publish events,
  and translate capability failures into use-case failures.
- **Inbound adapters:** Decode and validate protocol representation, extract context,
  map inputs, invoke use cases, and map results. No domain rules or workflow ownership.
- **Outbound ports:** Application-owned capability contracts shaped by core needs,
  not copies of an SDK or database API. Prefer `Clock` or `ResourceRepository` over
  technology-named contracts when technology is irrelevant to the application.
- **Outbound adapters:** Persistence, transport, serialization, OS/SDK integration,
  connection management, and technical retry/backoff implementation.
- **Composition:** Construct concrete adapters/resources, inject dependencies,
  establish runtime ownership, connect entry points, and start the application.

Domain code must not depend on application workflows or concrete transport,
persistence, serialization formats, frameworks, OS APIs, runtime mechanisms, or
telemetry SDKs. Application code must not construct or import concrete adapters.
Approved technology-neutral supporting libraries are not automatically violations;
evaluate actual coupling rather than treating all third-party code as infrastructure.

Use explicit constructor/parameter injection. Avoid service locators, mutable globals,
hidden dependency lookup, and implicit runtime dependencies.

## Modeling and Contracts

- Prefer meaningful types when identity, constraints, units, or semantics matter.
  Enforce invariants in their owning type/aggregate and make invalid states
  unrepresentable where practical. Related data alone does not justify an aggregate.
- Domain policies/services suit rules that span concepts without a natural entity
  owner. Do not add an interface for a single strategy without a meaningful need.
- A port isolates technology even with one implementation. Internal policies need
  no interface just because an infrastructure port uses one. Do not mirror SDK APIs.
- Keep domain computation synchronous unless asynchrony is intrinsically meaningful
  to the domain. Pass information into domain operations, not infrastructure access.
- Use explicit inbound interfaces when multiple adapters, stable contracts, or useful
  substitution justify them. Otherwise an adapter may call a concrete use case.
- Do not mechanically create Foo/FooPort/FooService/FooUseCase/FooImpl families,
  buses, handlers, or CQRS machinery for ordinary operations.
- Keep representations distinct when semantics differ. Map explicitly at meaningful
  boundaries, with one mapping owner. Neither turn domain types into external DTOs
  for convenience nor duplicate representations without value. Matching fields do
  not prove matching semantics; external schemas can need independent evolution.
- Domain errors express domain failures; application errors express use-case
  failures; adapters translate technology errors before crossing core contracts.
  Preserve actionable meaning, and represent expected production failures explicitly.
- Do not let adapters bypass application behavior by calling unrelated adapters.

## Cohesion and Cleanup Scope

Organize around concepts, use cases, and cohesive integration responsibilities.
Keep composition entry points focused on wiring and lifecycle. A namespace aggregator
should focus on aggregation, but a module or library root may own cohesive behavior.
Do not split code solely because of its filename. Avoid generic services/models/utils
containers of unrelated behavior. Several related owners can share a file without
mixing their dependencies or meaning.

Use shallow modules by default. Group by capability or role as the implementation
grows, preserving shared authoritative owners and inward dependencies. Examples are
not templates or minimum trees. Equivalent physical arrangements do not need special
approval; this does not authorize relaxing hard boundaries or project requirements.

Refactor ownership when necessary for the requested behavior, dependency direction,
or reuse of the authoritative implementation. Include affected paths in the plan.
Do not reorganize unrelated code merely because it violates these conventions.
Report unrelated problems separately. If necessary cleanup materially expands the
approved scope, seek approval before expanding the work.

Example: extracting a handler's rule for a new CLI operation is relevant cleanup;
reorganizing every handler is not. Public API redesign discovered during extraction
may require a revised decision rather than an unannounced expansion.

## Established Functionality

Prefer standard/platform facilities, suitable existing dependencies, and mature
ecosystem libraries to custom commodity infrastructure. Not being installed is not
by itself a reason to handroll parsers, serializers, crypto, protocols, retries,
executors, URL handling, compression, or comparable established functionality.

Use `dependency-approval` for new dependencies. Custom ownership needs a concrete
reason such as product-specific behavior, unsuitable options, target constraints,
or disproportionate cost/risk. Record the rationale; do not use speculative footprint
concerns as a blanket justification for reimplementation.

## Verification

For substantial changes, briefly identify the actual rule owner, workflow entry,
technology contracts, composition wiring, and the concrete need for new abstractions
or execution boundaries. Cite symbols/locations, not just "clean architecture."
Use the existing review or completion format, not a separate required artifact.

- Test domain rules and invalid states directly without infrastructure where practical.
- Test use cases through their application-facing APIs, using lightweight fakes where
  useful. Do not create abstractions solely to enable mocking.
- Test adapter mapping, failure translation, and real technology integration.
- Prefer behavioral assertions over tests coupled to private implementation structure.
- Check that new owners, contracts, and imports preserve dependency direction.
- Trace one representative success and relevant failure path. Check that meaningful
  orchestration is visible and implementation selection can be found in composition.
- Review equivalent rules/mappings for semantic duplication, not just matching text.
- Investigate entry points gaining behavior, generic modules growing responsibilities,
  mirror-image interfaces, concrete adapter construction in core code, and technical
  details shaping domain models. Also check forwarding chains, trivial file-per-step
  splits, duplicate internal DTOs, and tasks used only to cross layers. These are
  review signals, not mechanical failures; a single-implementation port is not a smell
  when it protects a technology boundary.

Use the project's existing test/review workflow. Report actual evidence and remaining
gaps; this skill does not create a separate approval or lifecycle process.
