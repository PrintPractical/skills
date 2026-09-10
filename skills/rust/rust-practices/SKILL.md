---
name: rust-practices
description: Apply idiomatic Rust modeling, ownership, traits, errors, async execution, and safety when designing, implementing, refactoring, testing, or reviewing Rust code. Use for API and concurrency decisions as well as edits to Rust source.
user-invocable: false
---

# Rust Practices

Load `architecture-guidance` for ownership and runtime boundaries,
`rust-source-layout` for paths, and `rust-ecosystem` when selecting library facilities.
Load `dependency-approval` before adding a dependency. If required guidance is
unavailable, report the gap before making the affected decision.

## Modeling and APIs

- Prefer structs for entities/aggregates, enums for closed alternatives and state,
  and newtypes where primitives carry meaningful identity, units, or constraints.
- Preserve invariants through construction and operations. Do not expose mutable
  fields or unchecked constructors that bypass the owning type's rules casually.
- Prefer concrete functions/types for single-strategy behavior. A struct does not
  require a trait; avoid mechanical Foo/FooTrait/FooImpl families.
- Traits suit meaningful ports and interchangeable strategies. Shape contracts around
  capability needs, not a concrete SDK API. Keep adapter-specific types out of them.
- Prefer static dispatch where practical; use trait objects for genuine runtime
  polymorphism or other demonstrated boundary needs. Neither is a universal rule.
- Inject dependencies through constructors/parameters, rather than global lookup.
- Choose borrowing, owned values, and return types that make lifetime and transfer
  intent clear. Do not clone or allocate merely to avoid understanding ownership.

## Errors and Safety

Use explicit, structured errors with domain/application/adapter meaning. Keep
expected failures programmatically distinguishable where callers need to act on them.
Translate technology-specific failures at boundaries without losing useful context
for diagnostics. Do not leak secrets into error messages or logs.

`thiserror` may derive implementations for these error types when approved;
third-party derivation does not by itself destroy domain independence. Do not expose
`anyhow::Error` through domain or stable port contracts. Top-level executable error
reporting can use `anyhow` when callers need no structured interpretation.

Avoid `unwrap`, `expect`, and `panic!` for expected production conditions. Make
fallibility explicit and test it. Test-only assertions do not establish a production
error-handling pattern. Avoid undefined behavior and unchecked assumptions at FFI.

Do not introduce `unsafe` unless explicitly approved or required by an unavoidable
low-level boundary. For the latter, make the necessity and safety invariants explicit
and obtain review appropriate to the risk. Minimize the unsafe region and expose a
safe API where possible; do not bypass borrow checking for convenience.

## Async and Ownership

Prefer Tokio when async execution is required and compatible with project targets;
follow the existing approved runtime rather than silently introducing another.
Keep domain computation synchronous unless the domain itself requires asynchrony.

- Prefer direct async calls when no ownership/concurrency boundary requires a task.
- Add tasks/channels for actual ownership, concurrency, event handling, isolation,
  or lifecycle value, not to reflect each architectural layer.
- Prefer Rust ownership over shared synchronization where practical. Message passing
  can simplify exclusive ownership; locks can be simpler for genuinely shared state.
  Do not introduce actors solely to avoid every lock.
- Specify cancellation, shutdown, in-flight work, queue bounds, and resource cleanup
  for long-lived tasks. Decide who observes task failures; avoid accidental detachment.
- Do not block executor workers with blocking I/O or substantial CPU work. Use an
  appropriate blocking/worker boundary without spawning extra tasks for trivial work.
- Avoid holding synchronous lock guards across `.await`. Keep shared mutation and
  lock scope small; use async locks only when their semantics are actually needed.
- Document cancellation safety for operations whose partial execution changes state.

## Verification and Corrections

Test domain invariants directly, use cases via their application APIs, and adapter
mapping/integration at the relevant boundary. Prefer lightweight fakes or concrete
test arrangements over traits added solely for mocking.

For concurrency changes test shutdown, cancellation, failure propagation, and bounded
overload behavior where applicable. Prefer controlled synchronization and clocks
over arbitrary sleeps when practical.

Examples:

- **Unstructured errors:** A port returning `anyhow::Result` loses required failure
  distinctions. Define its meaningful error variants and test caller behavior.
- **Layer-shaped tasks:** A new adapter does not require a channel. Identify the
  actual runtime requirement or call it directly.
- **Boolean state:** Replace invalid combinations with an enum and validated
  transitions; test rejection of illegal operations.

Run the repository's configured formatting, lint, test, feature, and target checks.
Do not assume a generic `cargo test` covers workspace-specific configurations, or
claim checks ran when they were unavailable. Use the existing workflow for evidence.
