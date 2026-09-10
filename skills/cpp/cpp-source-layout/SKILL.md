---
name: cpp-source-layout
description: Use when designing, planning, implementing, or reviewing C++ application or library source layout, header placement, module ownership, ports, adapters, or dependency boundaries; supports mixed-role applications and focused-role libraries with concrete paths.
user-invocable: false
---

# C++ Source Layout

## Scope

- Mixed-responsibility applications with domain behavior, workflows, and integrations
  use the domain/app/ports/adapters structure below for those responsibilities.
- A library dedicated to one architectural role treats its include/source root as
  that boundary and omits a redundant role directory such as `domain/`.
- Apply when creating an application or library, or establishing its first substantial
  feature.
- Small size, a single binary, or few classes is not an exemption.
- Create only directories containing actual code; do not scaffold empty layers.
- Bindings and specialized low-level components may need another layout. Request
  explicit user approval for a concrete alternative when the mixed or focused shape
  does not fit; do not self-exempt.
- For existing code, apply the rules to work in scope and correct ownership problems
  material to the change. Do not migrate unrelated existing code.
- Use `architecture-guidance` for shared architectural decisions when needed.
  If that needed skill is unavailable, report the gap, retain these rules, and
  seek clarification for unresolved decisions rather than inventing its contents.
- This skill defines source organization, not an agent workflow or orchestration.

## Mixed-Responsibility Application Shape

Paths below are a pattern, not an instruction to create every listed directory.
Replace placeholders with project, concept, use-case, and capability names.

```text
include/<project>/
  domain/<concept>/<concept>.hpp
  app/use_cases/<use_case>.hpp
  app/ports/<capability>.hpp
  adapters/inbound/<transport>.hpp       # only if externally needed
  adapters/outbound/<technology>.hpp     # only if externally needed
src/
  domain/<concept>/<concept>.cpp
  app/use_cases/<use_case>.cpp
  adapters/inbound/<transport>.cpp
  adapters/outbound/<technology>.cpp
  main.cpp
tests/
  domain/<concept>_test.cpp
  app/<use_case>_test.cpp
  adapters/<technology>_test.cpp
```

## Focused Library Shape

When a library contains only one architectural category, omit that category wrapper.
For example, a domain-only library can use:

```text
include/<project>/
  <concept>/<concept>.hpp
src/
  <concept>/<concept>.cpp
tests/
  <concept>_test.cpp
```

An application-only library may place `use_cases/` and `ports/` directly under its
public include and source roots. An adapter-only library may organize directly by
inbound/outbound responsibilities, or directly by one integration when that is the
library's sole cohesive purpose. Create only paths required by actual code.

The library boundary must represent real cohesion and dependency direction. Do not
split every concept or adapter into a library mechanically. If a focused library
acquires another architectural role, introduce explicit role directories or split
the responsibilities rather than leaving its root ambiguous.

## Concrete Placement

- Before implementation, name concrete header and source paths for every significant
  domain owner, use case, port, adapter, and composition component.
- State which headers are shared contracts and which declarations stay private.
- Name test paths and build-target/include-visibility changes needed for boundaries.
- If an owner is header-only or implementation-private, say so; do not invent pairs.
- A design that leaves significant owners in unspecified files is incomplete.
- Revise a nonconforming design or obtain explicit user approval before coding.

For example, a reservation feature can name these actual owners:

```text
include/booking/domain/reservation/reservation.hpp # invariants and value API
src/domain/reservation/reservation.cpp            # domain implementation
include/booking/app/use_cases/reserve_seat.hpp     # application entry point
src/app/use_cases/reserve_seat.cpp                 # workflow
include/booking/app/ports/reservation_store.hpp    # needed storage capability
src/adapters/outbound/sqlite_reservation_store.cpp # storage and mapping
src/adapters/inbound/cli.cpp                       # argument/result translation
src/main.cpp                                     # wiring and resource ownership
```

## Ownership and Dependencies

- Domain headers and implementations, whether under `domain/` in a mixed application
  or at the root of a domain-only library, depend only on domain code and the C++
  standard library, never application code, adapters, OS APIs, or infrastructure.
- Domain owns rules, invariants, meaningful state, values, and domain failures.
- Application use cases and ports depend on domain code, application contracts,
  and the standard library; they must not include concrete adapter headers.
- Application owns workflows, transaction intent, and required port contracts.
- `include/<project>/app/ports/` holds contracts, not concrete adapter implementations.
- Adapters depend inward on application/domain contracts and outward on technology.
- Inbound adapters translate requests, invoke use cases, and translate responses.
  Keep domain rules and application workflows out of transport handlers.
- Outbound adapters own persistence, serialization, retries, SDKs, and OS calls.
- Translate external representations and failures at their owning boundary.
- Give each rule, mapping, and integration responsibility one authoritative owner.
- Feature slices cross these shared owners; do not duplicate architecture per slice.
- `main.cpp` or a focused outer composition component constructs adapters, injects
  them into use cases, and owns runtime startup, lifetime, and shutdown.
- Core code must not construct concrete infrastructure or use service locators.

## Headers and Translation Units

- Organize around cohesive concepts, not giant `Domain.hpp` or `Services.cpp` files.
- Match public headers and implementations by owned concept, not by class count.
- Keep headers self-contained, guarded, and explicit about required includes.
- Keep private types and helpers in implementation files or private nearby headers.
- Expose adapter headers under `include/<project>/adapters/` only for genuine callers.
- Use namespaces to reflect ownership without turning namespace files into logic bins.
- Avoid transitive include dependence and infrastructure leakage through public APIs.
- Do not create a header/source pair for every private type or simple header-only value.
- Templates may require visible definitions; this does not relax dependency direction.
- Use build targets and include visibility to reinforce inward dependencies where
  practical; a directory tree alone does not enforce architecture.

## Boundaries Without Ceremony

- Abstract interfaces are appropriate for meaningful runtime substitution boundaries.
- Prefer free functions, concrete classes, or values when polymorphism adds no value.
- An inbound adapter may invoke a concrete application use case directly.
- Do not create `IFoo/Foo/FooImpl` families mechanically or mirror an external SDK.
- Inject required borrowed dependencies by reference and owned resources explicitly.
- A logical boundary does not require a thread, queue, process, or runtime hop.

## Corrections

- A CLI handler calculating reservation policy: place the rule in the reservation
  domain owner and orchestration in `app/use_cases/reserve_seat.cpp`.
- A use case including a database SDK: define its needed capability in `app/ports/`
  and move SDK calls, types, and failure translation into the outbound adapter.
- A small application merging domain, workflow, and I/O into `main.cpp`: split real
  responsibilities into the required paths without inventing extra interfaces.
- Empty directories for future integrations: omit them until implementation exists.
- Unrelated legacy layout violations: do not turn the current change into a migration.
