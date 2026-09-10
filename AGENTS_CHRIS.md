# Project Guidance

## Architectural Priorities

This project uses Domain-Driven Design with Hexagonal Architecture (Ports and Adapters) for domain-bearing and infrastructure-facing behavior.

Apply these priorities in order:

1. Correct ownership of domain rules and invariants.
2. Explicit application/use-case boundaries.
3. Inward dependency direction.
4. Cohesive concepts and modules.
5. One authoritative implementation of each behavior.
6. Clear infrastructure and runtime ownership.
7. Simplicity within the established boundaries.
8. Runtime efficiency where workload makes it meaningful.

Prefer the simplest implementation that preserves these priorities.
Do not simplify locally by collapsing responsibilities that have distinct architectural meaning.

---

## Architecture

The application core consists of the domain and application.
Infrastructure surrounds the core through ports and adapters.

```text
                    inbound
                      |
                      v
               +-------------+
               |   adapter   |
               +------+------+
                      |
                      v
               +-------------+
               | application |
               +------+------+
                      |
                      v
               +-------------+
               |   domain    |
               +-------------+

application --> outbound port <-- outbound adapter
```

Dependencies point inward.

- Domain depends only on domain code.
- Application depends on domain and abstractions required to perform use cases.
- Inbound adapters invoke application behavior.
- Outbound adapters implement capabilities required by the application.
- Domain and application do not depend on concrete infrastructure.
- Concrete implementations are assembled at the composition boundary.

Hexagonal boundaries are logical dependency boundaries, not requirements for runtime hops, processes, actors, channels, or interfaces between every component.
Do not introduce indirection solely to make the architecture look layered.

---

## Responsibility and Ownership

Architecture is organized around independently meaningful responsibilities, not generic layers or implementation convenience.

Every significant:

- domain rule;
- invariant;
- workflow;
- policy;
- mapping;
- external capability;
- integration responsibility;

should have one clear authoritative owner.

An owner should normally be independently describable.
Do not use a nearby file, generic service, implementation slice, or architectural layer as the owner when the behavior has a more specific conceptual home.

Before adding substantial behavior to an existing component, consider whether the change introduces another independently meaningful responsibility. If it does, prefer a dedicated owner.

---

## Domain

The domain contains the concepts, state, rules, decisions, and invariants of the problem being solved.
Domain logic is identified by meaning, not complexity.

Model important concepts explicitly using the smallest appropriate DDD building block.
Possible domain building blocks include:

- entities;
- value objects;
- aggregates;
- domain services;
- policies;
- domain errors;
- domain events when they have genuine domain meaning.

These are tools, not a required checklist.

### Domain Modeling

Prefer meaningful domain types over primitives when values carry semantics, constraints, identity, or units.
Prefer domain-specific types such as:

- `EntityId`
- `Version`
- `Priority`
- `Timestamp`
- `Endpoint`
- `ResourceId`

instead of unrelated strings, integers, and boolean flags when the distinction matters.

- Make invalid states unrepresentable where practical.
- Enforce invariants in the type or aggregate that owns them.
- Keep aggregate boundaries meaningful. Do not create large aggregates simply because data is related.
- Use a domain service or policy when domain behavior spans concepts and does not naturally belong to one entity or value object.
- Do not introduce an interface for a domain service unless meaningful interchangeable strategies exist.

### Domain Independence

Domain code must not depend on:

- transport protocols;
- persistence technologies;
- framework DTOs;
- serialization formats;
- OS APIs;
- telemetry SDKs;
- connection management;
- retry mechanisms;
- application workflow orchestration.

Keep domain behavior synchronous unless asynchrony is inherently part of the domain itself.
Pass required information into domain operations rather than giving domain objects infrastructure access.

---

## Application

The application layer implements use cases.
Prefer cohesive, independently meaningful use cases over large generic application services.

Examples:

- `CreateEntity`
- `UpdatePolicy`
- `StartSession`
- `ResolveRoute`
- `ProcessRequest`
- `GetStatus`

Application behavior may:

- load state through outbound ports;
- invoke domain behavior;
- coordinate multiple domain objects;
- persist results;
- define transaction boundaries;
- invoke infrastructure capabilities through ports;
- publish events;
- sequence operations;
- translate infrastructure failures into application-level failures.

Application code should describe what the use case does, while the domain describes what the domain rules mean.
Do not place domain rules in application orchestration merely because they are used by one use case.
Do not place transport-, persistence-, framework-, SDK-, or OS-specific implementation details in the application layer.

Commands and queries may be modeled separately when useful, but do not introduce command buses, query buses, handlers, or CQRS machinery without a concrete need.

---

## Ports

Ports represent meaningful boundaries between the application core and the outside world.
Use ports where architectural isolation or substitution has value.

Do not mechanically create:

```text
Foo
FooPort
FooService
FooUseCase
FooImpl
```

for every component.

### Inbound Ports

An explicit inbound port is useful when:

- multiple inbound adapters expose the same application capability;
- the application exposes a stable contract independent of implementation;
- substitution or independent testing benefits from the abstraction.

When those benefits do not exist, an inbound adapter may invoke a concrete application use-case component directly.

### Outbound Ports

Outbound ports describe capabilities the application requires, not technologies used to provide them.

Prefer:

- `ResourceRepository`
- `Clock`
- `EventPublisher`
- `RemoteCapability`
- `ProcessLauncher`
- `CredentialStore`

instead of technology-oriented contracts such as:

- `SqliteStorage`
- `TokioTimer`
- `GrpcPublisher`
- `LinuxProcessManager`

when the application does not need to know the technology.

The application owns outbound port contracts.
Concrete adapters implement them.
Design port operations around application/domain needs rather than mirroring an external SDK, database, or protocol API.

---

## Adapters

Adapters translate between the application core and concrete technologies.

### Inbound Adapters

Examples:

- gRPC;
- HTTP;
- CLI;
- message consumers;
- Unix-domain sockets;
- protocol servers.

Inbound adapters may:

- decode requests;
- perform protocol-level validation;
- extract request context;
- map transport DTOs to application inputs;
- invoke application operations;
- map application results to protocol responses.

Inbound adapters must not implement domain rules or application workflows.
Handlers should remain thin.

### Outbound Adapters

Examples:

- databases;
- filesystems;
- remote clients;
- hardware;
- operating-system integrations;
- event publishers;
- transport clients.

Infrastructure-specific behavior belongs here, including:

- serialization;
- persistence representation;
- framing;
- retries/backoff;
- connection management;
- SDK-specific types;
- OS-specific APIs.

Translate infrastructure-specific failures before they cross into application or domain contracts.
Adapters must not call unrelated adapters to bypass application behavior.

---

## Representation Boundaries

Keep representations distinct when they have different responsibilities or semantics.

Typical flow:

```text
Transport Representation
          |
          v
Application Input/Output
          |
          v
     Domain Types
          |
          v
Persistence / External Representation
```

Map explicitly at meaningful boundaries.
Domain types must not become protobuf, database, framework, or SDK DTOs solely for convenience.
Do not create duplicate representations when they provide no semantic or architectural value.
Mapping logic must have one authoritative implementation.

---

## Modules and Code Organization

Organize code around domain concepts, use cases, and cohesive integration responsibilities.
Architectural layers are boundaries and namespaces, not dumping grounds.
A module should normally represent one independently meaningful concept/responsibility or a closely related family of concepts.

Prefer structures conceptually similar to:

```text
<domain concept>
  entity/value/aggregate behavior

<use case>
  application workflow

<port>
  required external capability

<adapter>
  concrete integration
```

The exact directory tree should follow the language and repository, except where
the language-specific guidance below establishes a required layout.
Do not mechanically reproduce a universal folder structure outside those
requirements.

Avoid large generic modules such as:

- `domain`
- `application`
- `services`
- `models`
- `types`
- `common`
- `helpers`
- `utils`
- `manager`

when they contain multiple independently describable responsibilities.

- Keep namespace and entry-point files thin.
- Do not preserve poor organization merely for local consistency.
- Move behavior to its correct owner when modifying nearby code makes an existing ownership problem material to the change.
- Keep things that change together close when doing so does not violate dependency direction.
- Architecture is decomposed by responsibility; implementation may proceed as vertical slices through those shared responsibilities.
- Do not duplicate architecture per implementation slice.

---

## Reuse and Single Source of Truth

Each concept, rule, mapping, policy, and technical operation should have one authoritative implementation.

Before implementing non-trivial behavior:

1. Search for equivalent existing behavior in the repository.
2. Identify its authoritative owner.
3. Reuse it when correct.
4. Extend or refactor the owner when requirements change.
5. Consolidate duplicates when they become relevant to the work.

Duplication is semantic, not merely textual.
Two implementations that express the same rule through different syntax are still duplication.
Do not eliminate duplication by creating generic helpers, utils, or common dumping grounds.
Shared behavior belongs with the concept or architectural boundary that owns it.

### Prefer Established Libraries Over Custom Implementations

Do not write custom implementations of well-known, general-purpose technical functionality when a mature, maintained library already solves the problem appropriately.

Before building infrastructure or utility behavior yourself:

1. Check the language standard library.
2. Check dependencies already used by the repository or workspace.
3. Check for a mature, widely adopted ecosystem library or crate.
4. Prefer integrating that implementation behind the appropriate adapter or boundary rather than recreating it locally.

This applies especially to functionality such as:

- cryptography, hashing, certificates, and TLS;
- serialization and deserialization;
- protocol implementations and codecs;
- HTTP, RPC, WebSocket, QUIC, MQTT, and similar transports;
- URL, URI, path, and structured identifier parsing;
- semantic versioning and version constraints;
- date, time, and duration handling;
- command-line parsing;
- compression;
- retry/backoff primitives;
- database clients and connection pools;
- concurrency/runtime primitives;
- observability and telemetry integrations;
- common data structures and algorithms with established implementations.

Do not create a local parser, protocol stack, cryptographic primitive, executor, serializer, retry framework, or equivalent commodity infrastructure merely to avoid a dependency.

A custom implementation is appropriate only when there is a concrete reason the established options do not satisfy the requirements, such as:

- required behavior is genuinely project-specific;
- available libraries cannot meet required performance, footprint, portability, licensing, or platform constraints;
- the dependency would introduce disproportionate complexity or risk;
- the repository intentionally owns that implementation as a core product capability.

When choosing a new dependency, prefer libraries that are mature, actively maintained, widely used, appropriately licensed, and proportionate to the problem.
For embedded or resource-constrained targets, consider footprint and transitive dependency cost, but do not use those concerns as an excuse to casually reimplement mature functionality.

When a custom implementation is necessary, keep it narrowly scoped and make the reason for owning it clear in the code or design documentation.

---

## Composition

Concrete implementations are assembled at the outermost application boundary.

The composition root should:

- construct concrete adapters and runtime resources;
- inject them into application components;
- connect inbound adapters to application operations;
- establish runtime ownership;
- start the application.

Domain and application modules must not construct concrete infrastructure implementations.
Prefer explicit constructor or parameter injection.

Avoid:

- service locators;
- hidden dependency lookup;
- mutable globals;
- implicit runtime dependencies.

---

## Runtime Architecture

Runtime architecture describes how work executes and resources are owned.
It is independent from logical hexagonal boundaries.

Valid runtime models include:

- direct synchronous calls;
- async tasks;
- event loops;
- actors;
- worker pools;
- dedicated threads;
- state machines;
- pipelines.

Choose the simplest runtime model satisfying ownership, concurrency, lifecycle, isolation, and performance requirements.
Do not create a runtime hop for every architectural boundary.

---

## Resource Ownership

Long-lived, mutable, stateful, or exclusive resources must have a clear owner.

Examples:

- sockets;
- connections;
- hardware devices;
- protocol sessions;
- subprocesses;
- mutable runtime state;
- coordinated caches.

A dedicated task, actor, or component may own a resource when it provides meaningful:

- exclusive ownership;
- serialized mutation;
- asynchronous event handling;
- lifecycle management;
- failure isolation.

Do not introduce actors/tasks for stateless transformation or simple domain computation.

Prefer:

```text
manager -> resolved handle -> resource
```

when repeated operations target an already-resolved resource.

Managers should primarily handle discovery, creation, registration, lifecycle, and acquisition.
Repeated operational work should not unnecessarily traverse control-plane components.

---

## State Machines

Use explicit state machines when valid operations materially depend on current state.
Prefer explicit states/transitions over combinations of boolean flags.
Domain-semantic state belongs in the domain.

State that exists because of:

- a protocol;
- transport;
- OS;
- hardware interface;
- runtime lifecycle;

belongs with the adapter/runtime component that owns that concern.

---

## Performance

Architectural cleanliness does not justify unnecessary runtime cost.

For performance-sensitive paths, avoid unnecessary:

- allocations;
- copies;
- serialization;
- queue/channel hops;
- scheduler transitions;
- repeated lookup;
- repeated policy evaluation;
- manager traversal.

Resolve expensive decisions once when their result remains valid.
Do not sacrifice correctness or maintainability for speculative optimization.

---

## Cross-Cutting Infrastructure

Cross-cutting infrastructure is not domain behavior.

Centralize repeated concerns such as:

- tracing/context propagation;
- authentication metadata;
- protocol error mapping;
- instrumentation;
- retry/backoff;
- serialization conventions.

Prefer middleware, interceptors, wrappers, decorators, or dedicated adapter components over repeating equivalent code in individual handlers.

---

## Errors

Errors should reflect the boundary where they have meaning.

- Domain errors describe domain failures.
- Application errors describe use-case failures.
- Adapter errors describe infrastructure failures.

Do not expose framework, SDK, database, protocol, or transport error types through domain contracts.
Translate errors at architectural boundaries.
Represent expected production failures explicitly.

---

## Testing

Design the core so domain and application behavior can be tested without real infrastructure where practical.

- Test domain rules directly.
- Test use cases through their application-facing API.
- Use lightweight fake/in-memory outbound ports where useful.
- Test adapters for mapping, error translation, and technology integration.
- Prefer behavioral assertions over tests tied to implementation structure.
- Do not introduce abstractions solely to enable mocking when a simple fake or concrete test arrangement is sufficient.

---

## Architectural Warning Signs

Reconsider the design when any of these occur:

- an entry-point or namespace file gains substantial behavior;
- a generic module accumulates another independently describable responsibility;
- a transport handler contains domain rules or workflow orchestration;
- domain code imports infrastructure/framework types;
- application code constructs concrete adapters;
- equivalent logic is being implemented again;
- an implementation slice creates a private copy of shared behavior;
- a component has several independently describable reasons to change;
- a new interface merely mirrors one implementation;
- dependency direction becomes unclear;
- infrastructure technology starts shaping the domain model;
- substantial commodity infrastructure is being implemented locally despite a suitable mature library already existing.

These are signals to reconsider ownership, not mechanical failure rules.

---

## Software Design

- Prefer small cohesive components.
- Prefer explicit ownership and dependencies.
- Prefer composition over large multipurpose services.
- Prefer concrete types for internal implementation when polymorphism provides no value.
- Introduce abstractions at meaningful boundaries.
- Avoid speculative extensibility.
- Avoid indirection without architectural or runtime benefit.
- Favor clarity over ceremony.
- Do not force patterns from another language when they are unidiomatic.
- Do not preserve a poor abstraction merely because it already exists.

---

## Safety

- Handle expected runtime failures explicitly.
- Make ownership and lifetime clear.
- Avoid production crashes for expected conditions.
- Avoid undefined behavior.
- Do not bypass language safety mechanisms without an explicit, unavoidable reason.

---

## Commit Guidelines

- Use descriptive Conventional Commit messages.
- Include rationale when it materially helps explain the change.

---

# Rust Guidance

The following supplements the general architecture rules.

## Required Crate Layout

For a new Rust crate, and when establishing the first substantial feature in an
existing crate, use this layout unless the user explicitly approves a different
one:

```text
src/
  domain/
    <domain-concept>/
      mod.rs
      <cohesive-domain-modules>.rs
  app/
    mod.rs
    use_cases/
      mod.rs
      <use-case>.rs
    ports/
      mod.rs
      <capability-port>.rs
  adapters/
    mod.rs
    inbound/
      <transport-adapter>.rs
    outbound/
      <technology-adapter>.rs
  lib.rs
  main.rs
```

- `src/domain/` owns domain concepts, rules, invariants, domain errors, and
  technology-neutral transformations.
- `src/app/use_cases/` owns application workflows. Use one module per
  independently meaningful use case or tightly coupled use-case family.
- `src/app/ports/` owns application-defined inbound or outbound contracts.
- `src/adapters/inbound/` owns CLI, HTTP, RPC, message, or other inbound
  translation.
- `src/adapters/outbound/` owns concrete filesystem, database, process,
  network, and other infrastructure integrations.
- `src/main.rs` is the composition root. It constructs concrete adapters and
  use cases, then starts the runtime. `src/lib.rs` and every `mod.rs` contain
  only declarations, visibility boundaries, and intentional re-exports.

The `src/adapters/` directory is outside the application core. Its location
must not invert dependencies:

- `src/domain/` may depend only on `src/domain/` and the standard library.
- `src/app/use_cases/` and `src/app/ports/` may depend on `src/domain/`, each
  other where necessary, and the standard library; they must not import from
  `src/adapters/`.
- `src/adapters/` may depend inward on `src/app/use_cases/`,
  `src/app/ports/`, and `src/domain/`.

Within each directory, use modules named for the owned concept rather than
generic containers. For example, an IDL domain should normally separate its
model, parsing, name resolution, validation, and formatting owners when those
are independently meaningful. Do not put substantive domain definitions in a
domain `mod.rs`, or combine application workflows, ports, and concrete
adapters in one source file merely to reduce file count.

Before implementation, the design and plan must name the concrete module path
for every significant owner. A plan that does not place domain behavior,
use cases, ports, and adapters in this layout is incomplete and must be revised
or explicitly approved by the user before build work begins.

## Modeling

Prefer:

- structs for entities and aggregates;
- enums for closed domain alternatives and state;
- newtypes for semantically meaningful primitive values;
- concrete functions/types for single-strategy domain behavior;
- traits for meaningful ports or interchangeable strategies.

Do not create a trait merely because a struct exists.

Avoid mechanical:

```text
Foo
FooTrait
FooImpl
```

Prefer APIs that preserve invariants.
Keep `main.rs`, `lib.rs`, and `mod.rs` thin.

Use modules around cohesive concepts rather than giant:

- `domain.rs`
- `application.rs`
- `services.rs`
- `models.rs`
- `utils.rs`

## Ports and Dependency Injection

- Traits are appropriate for outbound ports and other genuine substitution boundaries.
- Use constructor/parameter injection.
- Prefer static dispatch where practical.
- Use trait objects when runtime polymorphism is genuinely required.
- Do not leak adapter-specific types into domain/application trait contracts.

## Async and Concurrency

- Use Tokio when async execution is required by the project.
- Keep domain computation synchronous unless the domain itself is asynchronous.
- Prefer direct async calls when no ownership/concurrency boundary requires another task.
- Use tasks and channels only when they provide real ownership, concurrency, asynchronous event handling, isolation, or lifecycle value.
- Avoid unnecessary channel hops.
- Provide explicit shutdown/lifecycle behavior for long-lived tasks.

## Ownership

- Prefer Rust ownership over shared synchronization where practical.
- Use message passing when exclusive task ownership simplifies the problem.
- Use locks when shared in-process state is genuinely simpler.
- Do not introduce actors merely to avoid every lock.
- Keep resource lifetimes explicit.

## Errors

- Use `thiserror` for structured domain/application/adapter errors where appropriate.
- Do not expose `anyhow::Error` through domain or stable port contracts.
- `anyhow` is acceptable at executable/composition boundaries where programmatic interpretation is unnecessary.
- Avoid `unwrap`, `expect`, and `panic!` for expected production conditions.

## Dependencies and Infrastructure

- Prefer the Rust standard library or a mature, established crate over a custom implementation of general-purpose functionality.
- Search the workspace dependencies and crates.io ecosystem before implementing commodity infrastructure yourself.
- Reuse existing project dependencies when they are suitable rather than adding parallel libraries for the same responsibility.
- Prefer well-maintained, widely adopted crates with appropriate licensing and a reasonable dependency/footprint cost.
- Do not reimplement cryptography, TLS, protocol codecs, serializers, parsers, URL handling, semantic versioning, retry primitives, CLI parsing, compression, or similar mature functionality without a concrete documented reason and an explicit user decision under the dependency-decision protocol below.
- Use Serde at serialization boundaries, not as justification to couple domain types to external representations.
- Use `tracing` for instrumentation.
- Keep OpenTelemetry SDK types out of the domain.
- Gate optional infrastructure integrations behind features when appropriate.
- Prefer `cargo add` when adding dependencies.
- Follow the dependency-decision protocol below. Do not treat the absence of an existing dependency as a reason to handroll commodity functionality.
- Do not use `unsafe` unless explicitly approved or required by an unavoidable low-level boundary.

### Dependency-Decision Protocol

Before designing or implementing a capability that is not adequately provided
by the Rust standard library and could reasonably use a mature crate, the agent
must ask the user to choose between a dependency and a local implementation.
This is mandatory for parsers, formatters/pretty printers, serializers,
protocol codecs, CLI parsing, URL handling, semantic versioning, retry logic,
cryptography, compression, and comparable general-purpose behavior.

The agent must first investigate suitable options, then make a clear
recommendation. Its question must include:

- the capability being added and why the standard library is insufficient;
- the recommended crate, including why it fits, its expected integration
  boundary, and material dependency, licensing, maintenance, or footprint
  tradeoffs;
- the viable local implementation alternative, its ownership and maintenance
  cost, and the concrete reason it might be preferred;
- any already-approved or already-used dependency that is suitable.

For source-language parsing, the default recommendation is a mature parser
crate such as `nom`, `winnow`, `chumsky`, `pest`, or `lalrpop`, selected for the
grammar, diagnostic needs, and repository conventions. The agent must not
choose a handwritten lexer or parser simply because the crate has no current
dependencies. For canonical formatting, the agent must likewise evaluate an
established formatting or pretty-printing library and recommend either it or a
small domain-owned renderer when direct traversal is demonstrably sufficient.

Do not add the proposed dependency or begin a local replacement until the user
selects an option. A user instruction naming a dependency, or an approved plan
that records the user's selection and the exact chosen dependency, satisfies
this requirement and must be followed without asking again. If the user selects
the local option, record the decision and rationale in the design or plan before
implementation. If requirements later make that decision unsuitable, stop and
ask the user again rather than silently changing approach.

---

# C++ Guidance

The following supplements the general architecture rules.

## Required Project Layout

For a new C++ project, and when establishing the first substantial feature in
an existing project, use this layout unless the user explicitly approves a
different one:

```text
include/
  <project>/
    domain/
      <domain-concept>/
        <cohesive-domain-interface>.hpp
    app/
      use_cases/
        <use-case>.hpp
      ports/
        <capability-port>.hpp
    adapters/
      inbound/
        <transport-adapter>.hpp
      outbound/
        <technology-adapter>.hpp
src/
  domain/
    <domain-concept>/
      <cohesive-domain-implementation>.cpp
  app/
    use_cases/
      <use-case>.cpp
  adapters/
    inbound/
      <transport-adapter>.cpp
    outbound/
      <technology-adapter>.cpp
  main.cpp
tests/
  domain/
  app/
  adapters/
```

- `include/<project>/domain/` and `src/domain/` own domain interfaces and
  implementations. Domain headers expose no application, adapter, framework,
  operating-system, or third-party infrastructure types.
- `include/<project>/app/use_cases/` and `src/app/use_cases/` own application
  workflows. Use one module per independently meaningful use case or tightly
  coupled use-case family.
- `include/<project>/app/ports/` owns application-defined capability
  interfaces. Port implementations do not belong in this directory.
- `include/<project>/adapters/` exposes adapter interfaces only when an
  external caller genuinely needs them. `src/adapters/inbound/` and
  `src/adapters/outbound/` own concrete adapter implementations.
- `src/main.cpp` is the composition root. It constructs concrete adapters and
  use cases, injects dependencies, and starts the application.
- Public headers and source implementations are organized by the same owned
  concept. Do not create a header/source pair solely by convention when a type
  is intentionally private to one implementation file.

The `src/adapters/` directory is outside the application core. Its placement
must not invert dependencies:

- `include/<project>/domain/` and `src/domain/` may depend only on domain code
  and the C++ standard library.
- `include/<project>/app/` and `src/app/use_cases/` may depend on domain code,
  application ports, and the C++ standard library; they must not include adapter
  headers or source files.
- Adapter implementations may depend inward on application use cases, ports,
  and domain code, as well as their required technology libraries.

Before implementation, the design and plan must name the concrete header and
source paths for every significant owner. A plan that does not place domain
behavior, use cases, ports, and adapters in this layout is incomplete and must
be revised or explicitly approved by the user before build work begins.

## Modeling

Use modern, idiomatic C++.

Prefer:

- value semantics;
- strongly typed enums;
- small domain classes;
- dedicated value objects;
- explicit aggregate ownership;
- free functions or concrete classes for behavior that does not require polymorphism.

Do not create an abstract interface for every class.

Avoid mechanical:

```text
IFoo
Foo
FooImpl
```

when there is no architectural or substitution purpose.

Organize headers and translation units around cohesive concepts rather than large:

- `Domain.hpp`
- `Services.cpp`
- `Models.hpp`
- `Utils.cpp`

## Ports

- Use abstract interfaces for meaningful inbound/outbound ports when runtime substitution is useful.
- Keep concrete implementation details out of application-facing contracts.
- Prefer narrow capability-oriented interfaces.
- Do not mirror third-party SDK interfaces unless the application genuinely requires the same abstraction.

## Ownership and Dependency Injection

- Prefer RAII.
- Prefer values for lightweight owned objects.
- Use `std::unique_ptr` for transferred exclusive ownership.
- Use `std::shared_ptr` only for genuinely shared ownership.
- Prefer references for required externally owned dependencies.
- Avoid raw owning pointers.
- Inject dependencies explicitly and wire concrete implementations at the composition root.

## Concurrency

- Prefer clear resource ownership over pervasive shared synchronization.
- Use threads, tasks, executors, queues, or message passing only when they provide meaningful runtime value.
- Minimize lock scope and shared mutable state.
- Avoid unnecessary queues, context switches, allocations, and copies on hot paths.
- Make shutdown and lifecycle behavior explicit.

## Dependencies and Infrastructure

- Prefer the C++ standard library or a mature, established third-party library over custom general-purpose infrastructure.
- Reuse dependencies already adopted by the project when they are suitable.
- Evaluate new libraries for maintenance quality, adoption, licensing, portability, footprint, and build-system impact.
- Do not reimplement cryptography, TLS, protocol stacks/codecs, serializers, parsers, URL handling, semantic versioning, retry frameworks, CLI parsing, compression, or similar mature functionality without a concrete documented reason.
- Keep third-party types behind adapter boundaries when they do not belong in domain/application contracts.

## Errors and Safety

- Represent expected domain/application failures explicitly.
- Do not use exceptions as an unstructured substitute for domain or application error modeling.
- Translate infrastructure exceptions at architectural boundaries.
- Do not expose third-party exception types through domain contracts.
- Avoid unsafe ownership, unchecked casts, undefined behavior, and manual `new`/`delete` when RAII alternatives exist.
- Prefer composition over deep inheritance.
