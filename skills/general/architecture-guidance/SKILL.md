---
name: architecture-guidance
description: Apply DDD and hexagonal architecture when designing, planning, implementing, refactoring, or reviewing domain behavior, application workflows, integrations, or runtime resource ownership. Use before assigning owners, defining ports, or introducing tasks, channels, actors, and lifecycle boundaries.
user-invocable: false
---

# Architecture Guidance

## Priorities

Apply in order: correct ownership of domain rules and invariants; explicit use-case
boundaries; inward dependencies; cohesive concepts; one authoritative implementation;
clear infrastructure/runtime ownership; simplicity within those boundaries; and
efficiency where the workload makes it meaningful.

Prefer the smallest implementation preserving these priorities. Do not simplify
locally by collapsing responsibilities with distinct architectural meaning.
DDD building blocks are tools, not a checklist. Logical boundaries do not require
interfaces, processes, tasks, channels, or extra runtime hops.

Load the applicable language layout and practices skills before committing to
language-specific paths or implementation decisions. Load `dependency-approval`
before selecting a new dependency. If required guidance is unavailable, report the
gap before making the affected decision; do not invent its policy.

For concurrency, lifecycle, stateful resources, state machines, or hot-path changes,
read [Runtime Ownership](references/runtime.md) before designing or changing them.

## Assign Owners Before Implementation

1. Inspect existing behavior and the repository's concepts and boundaries.
2. Identify the independently meaningful owner of each significant rule, invariant,
   workflow, policy, mapping, external capability, and integration responsibility.
3. Reuse an existing authoritative owner when correct; extend or refactor it when
   the requested behavior changes its responsibility.
4. Name concrete owner paths in the existing design/plan. Apply required language
   layouts, rather than creating a private architecture for every vertical slice.
5. Identify boundary contracts, failure semantics, and relevant behavioral checks.

Semantic duplication is duplication even when the syntax differs. Shared behavior
belongs with its concept or boundary, not an indiscriminate helper/common module.

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
- Keep domain computation synchronous unless asynchrony is intrinsically meaningful
  to the domain. Pass information into domain operations, not infrastructure access.
- Use explicit inbound interfaces when multiple adapters, stable contracts, or useful
  substitution justify them. Otherwise an adapter may call a concrete use case.
- Do not mechanically create Foo/FooPort/FooService/FooUseCase/FooImpl families,
  buses, handlers, or CQRS machinery for ordinary operations.
- Keep representations distinct when semantics differ. Map explicitly at meaningful
  boundaries, with one mapping owner. Neither turn domain types into external DTOs
  for convenience nor duplicate representations without value.
- Domain errors express domain failures; application errors express use-case
  failures; adapters translate technology errors before crossing core contracts.
  Preserve actionable meaning, and represent expected production failures explicitly.
- Do not let adapters bypass application behavior by calling unrelated adapters.

## Cohesion and Cleanup Scope

Organize around concepts, use cases, and cohesive integration responsibilities.
Layers are boundaries/namespaces, not dumping grounds. Keep entry points and namespace
files thin. Avoid generic services/models/utils/managers containing independently
describable responsibilities. Use concrete internal types where polymorphism adds
no value, and do not force patterns that are unidiomatic for the language.

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

- Test domain rules and invalid states directly without infrastructure where practical.
- Test use cases through their application-facing APIs, using lightweight fakes where
  useful. Do not create abstractions solely to enable mocking.
- Test adapter mapping, failure translation, and real technology integration.
- Prefer behavioral assertions over tests coupled to private implementation structure.
- Check that new owners, contracts, and imports preserve dependency direction.
- Review equivalent rules/mappings for semantic duplication, not just matching text.
- Investigate entry points gaining behavior, generic modules growing responsibilities,
  mirror-image interfaces, concrete adapter construction in core code, and technical
  details shaping domain models. These are review signals, not mechanical failures.

Use the project's existing test/review workflow. Report actual evidence and remaining
gaps; this skill does not create a separate approval or lifecycle process.
