---
name: cpp-practices
description: Use for modern C++ design, planning, source organization, implementation, and review, including module/header/build boundaries, APIs, domain modeling, RAII, ownership, ports, errors, concurrency, dependencies, and tests; favors idiomatic values and meaningful boundaries over mechanical interfaces.
user-invocable: false
---

# C++ Practices

## Scope and Architecture

- Use modern idiomatic C++ within the repository's supported standard and toolchain.
- Load `architecture-guidance` for shared design principles when assigning owners or
  boundaries. Report missing needed guidance; do not invent its contents. The C++ core
  dependency policy below remains stricter than general supporting-library allowances.
- Domain owns rules, invariants, meaningful state, values, and domain failures. Domain
  headers and implementations depend only on domain code and the C++ standard library,
  never application code, adapters, OS APIs, or infrastructure.
- Application owns workflows, transaction intent, and required port contracts. Use
  cases and ports depend only on domain code, application contracts, and the C++ standard
  library; they must not include or construct concrete adapters.
- Adapters depend inward on core contracts and outward on technology. Inbound adapters
  decode and validate protocol syntax, invoke use cases, and map results; they do not
  own domain rules or workflows or bypass them by calling unrelated adapters.
- Outbound adapters own persistence, serialization, technical retries, SDKs, OS calls,
  and technology failure translation. Give each integration one authoritative owner;
  feature slices use shared owners rather than duplicating architecture.
- The outer composition boundary constructs and injects concrete dependencies and owns
  startup, resource lifetimes, and shutdown. Keep entry points thin.
- Keep domain computation synchronous unless its meaning requires asynchrony.
- These rules constrain code and design, not agent workflow orchestration.

## Source Organization and Planning

- Before designing, changing, or reviewing source organization, headers, public APIs,
  include visibility, or build/dependency boundaries, read
  [Source Organization](references/source-organization.md) for C++ arrangements and mechanics.
- Default to shallow, cohesive modules named for concepts, workflows, or integrations.
  Architectural roles are ownership and dependency rules, not a mandatory directory
  tree. Co-locate related types, helpers, and behavior when this keeps the flow readable
  without mixing technology into core code.
- No file per owner/class, public header per helper, role directory, or template minimum
  is required. A focused library can use its root as its boundary. Split files or targets
  for real cohesion, visibility, or build needs, not to satisfy a diagram. Alternative
  layouts do not require special approval when they preserve the hard boundaries.
- In existing code, identify precise owner symbols and paths before changing behavior.
  For greenfield work, name likely modules, responsibilities, contracts, and dependency
  constraints; do not freeze speculative paths. Resolve placement as implementation
  makes it concrete, recording relevant header visibility, build changes, and tests.
- Make each flow discoverable from entry point through use case, domain decisions,
  required capabilities, adapter effects, and result/failure mapping. Keep orchestration
  cohesive rather than scattering each step into a separate class or layer file.
- Plan and verify behavioral slices through shared owners, not a task per layer. Do not
  create duplicate DTOs or mappings just to cross a logical boundary.
- Keep headers self-contained, guarded, and minimal; distinguish installed/public
  contracts from private cross-translation-unit declarations. Reinforce inward
  dependencies with build targets and include visibility where practical; directory
  names alone do not enforce them.
- Correct ownership issues material to the requested change. Do not automatically
  reorganize unrelated code; seek approval only if necessary work materially expands
  scope, not merely because the layout differs from an example.

## Modeling and APIs

- Prefer value semantics, small domain classes, and explicit aggregate ownership.
- Use dedicated value types for meaningful units, identifiers, and constrained values.
- Use `enum class` and explicit states rather than unrelated booleans or magic integers.
- Enforce invariants in the type or operation that owns them; avoid duplicated checks
  as the only protection against invalid domain state.
- Prefer free functions or concrete classes for internal single-strategy behavior;
  technology isolation still requires a port even with one adapter implementation.
- Use composition over deep inheritance; do not create an abstract class per class.
- Avoid mechanical `IFoo/Foo/FooImpl` families and speculative extension points.
- Give every significant rule, mapping, and policy one authoritative implementation.
- Keep transport/persistence representations separate where semantics differ; do not
  duplicate representations or mappings without architectural value.
- Keep headers self-contained and expose the smallest useful contract.

## Ownership and Lifetime

- Prefer RAII for allocations, files, sockets, locks, threads, and other resources.
- Prefer values for lightweight owned objects and standard containers for storage.
- Use `std::unique_ptr` for transferred exclusive ownership when indirection is needed.
- Use `std::shared_ptr` only for genuinely shared ownership, not convenient borrowing.
- Prefer references for required externally owned dependencies; their owners must
  outlive use. Use non-owning pointers when optional/reseatable access is appropriate.
- Avoid raw owning pointers and manual `new`/`delete` when RAII alternatives exist.
- Prefer the rule of zero; define move/copy behavior deliberately for resource wrappers.
- Treat `std::span`, `std::string_view`, iterators, and references as borrowed views.
  Check their backing lifetime, invalidation rules, and asynchronous capture behavior.
- Do not capture stack references in work that can outlive their scope.
- Use custom deleters or focused RAII wrappers for C and platform handles.
- Destructors must not throw; expose explicit fallible finalization when callers need
  to observe flush/commit/close errors, with non-throwing fallback cleanup.

Example ownership at an application boundary:

```cpp
class ReserveSeat {
public:
    explicit ReserveSeat(ReservationStore& store) : store_(store) {}
    ReservationResult execute(const ReservationRequest& request);
private:
    ReservationStore& store_; // Borrowed; composition owner outlives this use case.
};
```

The store contract is justified by a meaningful external capability, not by the
existence of a concrete class. This use case does not need its own abstract interface.

## Ports and Composition

- Design narrow application-owned capability ports around core needs, not SDK APIs.
  Isolate external technology behind a port even with one implementation; multiple
  implementations or testing needs are not prerequisites for this boundary.
- Abstract interfaces can express technology isolation as well as runtime substitution;
  provide a virtual destructor if destruction through a base pointer is supported.
- Choose an abstract interface, callable contract, or suitable compile-time technique
  that preserves inward dependencies without leaking concrete adapter types into core
  code. Prefer concrete internal calls otherwise; do not introduce templates just to
  avoid a reasonable virtual call.
- Inbound adapters may call concrete use cases directly.
- Inject dependencies explicitly and wire implementations at the outer composition root.
- Keep service locators, hidden globals, and SDK-specific types out of core contracts.
- Translate representations and infrastructure failures in adapters.

## Errors and Safety

- Model expected domain/application failures explicitly using the project's result
  conventions, including `std::expected` where supported and appropriate.
- Respect the project's exception policy; exceptions are not a replacement for a
  meaningful failure model. Translate infrastructure exceptions at boundaries.
- Never expose third-party exception types through domain contracts.
- Preserve invariants on failure and define strong/basic exception guarantees where
  relevant; resource cleanup must also work during partial construction.
- Do not use assertions or termination for expected input, network, or storage failures.
- Check bounds, integer overflow, narrowing conversions, and iterator invalidation.
- Avoid unchecked casts, aliasing violations, dangling views, and other undefined behavior.
- Validate untrusted lengths and formats before allocation or indexing.
- Use type-safe formatting supported by the project; never treat external text as
  a printf-style format string when working with C interfaces.

## Runtime and Shutdown

- Prefer clear resource owners and minimal shared mutable state.
- Add threads, tasks, queues, or executors only for meaningful concurrency or lifecycle.
- Minimize lock scope; define lock order and avoid invoking unknown code under locks.
- Do not add runtime hops for logical layers or use shared ownership as synchronization.
- Define cancellation, deadlines, backpressure, and failure propagation where relevant.
- Shutdown must stop intake, cancel or drain work, unblock waits, join workers, and
  destroy resources only after their users are finished.
- RAII alone does not decide shutdown order or unblock a worker; make that protocol
  explicit, including partial startup and callbacks arriving during shutdown.
- Measure hot paths before optimizing; avoid needless copies, allocation, and queue hops.

## Dependencies

- Check the C++ standard library, suitable existing dependencies, then mature maintained
  libraries before implementing general-purpose infrastructure yourself.
- Evaluate maintenance, adoption, licensing, portability, footprint, and build impact.
- Do not handroll cryptography, codecs, serializers, parsers, or retry frameworks merely
  to avoid dependencies. Keep infrastructure library types behind adapter boundaries.
- Use `dependency-approval` when a dependency decision is needed. If unavailable,
  report the gap and still obtain user approval before adding any dependency.
- Recommend new dependencies with material tradeoffs and wait for approval before
  adding or relying on them. A preferred or familiar library is not pre-approved.
- Record a custom commodity implementation's concrete reason and owner. Do not
  silently implement a local replacement to bypass an unresolved dependency choice.

## Testing and Review

- Test domain invariants directly and use cases through their application-facing API.
- Use lightweight fakes at meaningful ports, not interfaces introduced only for mocking.
- Test adapter mapping, integration behavior, and failure translation separately.
- Cover invalid/boundary inputs, I/O failures, partial construction, exception safety,
  cancellation, shutdown, and resource release where relevant.
- Assert observable behavior and guarantees rather than private call sequences.
- Use compiler warnings, static analysis, and available address/undefined/thread
  sanitizers as appropriate; report checks that could not run.
