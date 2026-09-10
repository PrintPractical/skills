---
name: c-source-layout
description: Use when designing, planning, implementing, or reviewing C application source layout, header placement, module ownership, ports, adapters, or dependency boundaries; requires concrete paths before implementation and bounded architectural structure.
user-invocable: false
---

# C Source Layout

## Scope

- Apply to C, not to C++ code compiled alongside it.
- Application projects with domain behavior, workflows, or integrations require
  the domain/app/ports/adapters structure below for those responsibilities.
- Apply when creating an application or establishing its first substantial feature.
- Small size, a single executable, or few source files is not an exemption.
- Create only directories that contain actual code; do not scaffold empty layers.
- A specialized library, binding, or low-level component may need another shape.
  Request explicit user approval for a concrete alternative; do not self-exempt.
- For existing code, apply the rules to the work in scope and correct ownership
  problems material to that change. Do not migrate unrelated code.
- Use `architecture-guidance` for shared architectural decisions when needed.
  If that needed skill is unavailable, report the gap, retain these rules, and
  seek clarification for unresolved decisions rather than inventing its contents.
- This skill defines source organization, not an agent workflow or orchestration.

## Required Shape

Paths below are a pattern, not an instruction to create every listed directory.
Replace placeholders with project, concept, use-case, and capability names.

```text
include/<project>/
  domain/<concept>/<concept>.h
  app/use_cases/<use_case>.h
  app/ports/<capability>.h
  adapters/inbound/<transport>.h       # only if externally needed
  adapters/outbound/<technology>.h    # only if externally needed
src/
  domain/<concept>/<concept>.c
  app/use_cases/<use_case>.c
  adapters/inbound/<transport>.c
  adapters/outbound/<technology>.c
  main.c
tests/
  domain/<concept>_test.c
  app/<use_case>_test.c
  adapters/<technology>_test.c
```

## Concrete Placement

- Before implementation, name the concrete header and source paths for every
  significant domain owner, use case, port, adapter, and composition component.
- State which headers are shared contracts and which declarations stay private.
- Name test paths and any build-target/include-path changes needed for boundaries.
- If no separate header or source is needed, say so instead of inventing a pair.
- A design that leaves significant owners in unspecified files is incomplete.
- Revise a nonconforming design or obtain explicit user approval before coding.

For example, a reservation feature can name these actual owners:

```text
include/booking/domain/reservation/reservation.h  # invariants and public API
src/domain/reservation/reservation.c             # domain implementation
include/booking/app/use_cases/reserve_seat.h      # application entry point
src/app/use_cases/reserve_seat.c                  # workflow
include/booking/app/ports/reservation_store.h     # required storage capability
src/adapters/outbound/sqlite_reservation_store.c  # storage and mapping
src/adapters/inbound/cli.c                        # argument/result translation
src/main.c                                      # wiring and lifetime ownership
```

## Ownership and Dependencies

- Domain headers and implementations depend only on domain code and the C
  standard library, not application code, adapters, OS APIs, or infrastructure.
- Domain owns rules, invariants, meaningful state, and domain error definitions.
- Application use cases depend on domain code, application contracts, and the
  standard library. They must not include concrete adapter headers.
- Application owns workflows, transaction intent, and required port contracts.
- `app/ports/` holds contracts, not concrete infrastructure implementations.
- Adapters depend inward on application/domain contracts and outward on technology.
- Inbound adapters decode, validate protocol syntax, invoke use cases, and map
  results. Domain rules and workflows do not belong in handlers.
- Outbound adapters own persistence, serialization, retries, OS calls, and SDKs.
- Translate external representations and errors at their owning boundary.
- Do not duplicate a rule or mapping across feature slices or adapter handlers.
- Wire concrete adapters in `main.c` or a focused outer composition component.
  Core code must not construct concrete infrastructure or use service locators.

## C Module Boundaries

- Organize by cohesive concepts, not giant `models.h`, `services.c`, or `utils.c`.
- Use project/concept-prefixed symbols and include guards; C has no namespaces.
- Keep headers self-contained and expose only needed declarations and includes.
- Keep implementation-only functions and objects `static` in their translation unit.
- Use opaque structures when hiding representation or protecting invariants helps.
  Do not hide every small value behind allocation and an opaque handle.
- Keep private adapter declarations beside their implementation under `src/`.
- A public header/source pair is not mandatory for a private helper or small value.
- Capability functions or callback/context contracts may express meaningful ports.
  Do not manufacture vtables, inheritance emulation, or `Foo/FooImpl` families.
- An inbound adapter may call a concrete application function directly.
- Specify callback context ownership and lifetime in the contract, not by convention.
- Keep entry points thin: construct, inject, start, shut down, and clean up.
- Use build targets and include visibility to reinforce inward dependencies where
  practical; directory names alone do not enforce architecture.

## Corrections

- A CLI handler calculating reservation policy: move the rule to the reservation
  domain owner and the workflow to `app/use_cases/reserve_seat.c`.
- A use case including SQLite headers: define a needed storage capability in
  `app/ports/` and keep SQLite calls and types in the outbound adapter.
- Empty directories for hypothetical capabilities: omit them until code exists.
- A tiny application merging domain, workflow, and I/O into `main.c`: split real
  responsibilities into the required paths; do not add artificial abstraction.
- An unrelated legacy subtree violating layout: leave it alone for this change.
