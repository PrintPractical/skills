---
name: cpp-practices
description: Use when designing, planning, implementing, or reviewing modern C++ APIs and behavior, especially domain modeling, RAII, ownership, ports, errors, concurrency, dependencies, and tests; favors idiomatic values and meaningful boundaries over mechanical interfaces.
user-invocable: false
---

# C++ Practices

## Scope and Architecture

- Use modern idiomatic C++ within the repository's supported standard and toolchain.
- Use `cpp-source-layout` for placement and `architecture-guidance` for shared design
  decisions when needed. Report a missing needed skill; do not invent its guidance.
- Domain owns rules and invariants; application owns workflows; adapters own technology.
- Dependencies point inward; domain and application must not include concrete adapters.
- Keep domain computation synchronous unless its meaning requires asynchrony.
- These rules constrain code and design, not agent workflow orchestration.

## Modeling and APIs

- Prefer value semantics, small domain classes, and explicit aggregate ownership.
- Use dedicated value types for meaningful units, identifiers, and constrained values.
- Use `enum class` and explicit states rather than unrelated booleans or magic integers.
- Enforce invariants in the type or operation that owns them; avoid duplicated checks
  as the only protection against invalid domain state.
- Prefer free functions or concrete classes for single-strategy behavior.
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

- Design narrow capability-oriented ports around application needs, not SDK APIs.
- Use abstract interfaces when runtime substitution is useful; provide a virtual
  destructor if an interface supports destruction through a base pointer.
- Use concrete calls or suitable compile-time techniques when runtime dispatch adds
  no value; do not introduce templates just to avoid a reasonable virtual call.
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
