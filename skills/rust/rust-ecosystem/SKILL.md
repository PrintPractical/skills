---
name: rust-ecosystem
description: Select standard-library facilities and established Rust crates during design, planning, implementation, or review. Use for errors, serialization, Tokio async execution, tracing, CLI parsing, source parsing, formatting, and decisions between ecosystem libraries and custom functionality.
user-invocable: false
---

# Rust Ecosystem

## Selection Policy

Prefer the standard library when sufficient. Then inspect platform facilities and
suitable approved workspace dependencies. For commodity functionality not adequately
covered, evaluate mature ecosystem crates before writing a custom implementation.
Not having a dependency installed is not a reason by itself to handroll it.

These are project preferences and starting points, not universal Rust mandates or
a starter dependency checklist. Do not add unused crates or parallel libraries for
the same responsibility. Consider maintenance, licensing, security, minimum Rust
version, target support, `no_std`, features, native build requirements, and footprint.
Check current documentation and repository constraints instead of assuming a listed
crate/version is always appropriate.

**Every new dependency still needs user approval.** Load `dependency-approval`
before committing to the addition. A crate appearing here is not pre-approved.
If the skill is unavailable, report the gap and obtain explicit approval rather
than proceeding. Prefer `cargo add` after approval, using the project's version
and workspace conventions and only needed features.

## Preferred Facilities

| Capability | Preference and boundary |
| --- | --- |
| Basic collections, text, paths, formatting | Start with `std`; use `Path`/`PathBuf` for filesystem paths rather than assuming UTF-8 strings. |
| Structured errors | Prefer `thiserror` when useful for explicit domain/application/adapter error types. |
| Executable error reporting | `anyhow` at composition/executable boundaries where programmatic interpretation is unnecessary; not domain or stable port contracts. |
| Serialization | Prefer Serde plus a suitable format crate such as `serde_json`; keep external schema/format concerns at representation boundaries. |
| Async runtime | Prefer Tokio when async execution is required and target constraints fit; do not introduce async or a second runtime unnecessarily. |
| Instrumentation | Prefer `tracing`; assemble subscribers/exporters externally and keep OpenTelemetry SDK types out of the domain. |
| Substantial CLI argument parsing | Evaluate `clap`; simple standard-library argument handling can suffice for genuinely trivial needs. |
| Parsing and pretty-printing | Read [Parsing and Formatting](references/parsing-and-formatting.md) before choosing a parser or structured formatter. |
| Structured identifiers and versions | Evaluate purpose-built types/crates such as `url` and `semver` instead of ad hoc splitting and comparison. |
| Time semantics | Start with `Duration`, `Instant`, and `SystemTime` for their intended roles; evaluate calendar/time-zone crates only when those semantics are required. |

For cryptography, TLS, codecs, compression, transport clients, retry/backoff,
concurrency primitives, databases, and telemetry integrations, select suitable
maintained libraries rather than recreating commodity infrastructure. There is no
single mandated crate for every target and use case.

## Core Dependency Boundaries

Domain/application code may use approved technology-neutral supporting crates.
The rule is independence from concrete infrastructure, not zero third-party code.
Apply `architecture-guidance` and `rust-practices` to actual types and contracts.

- `thiserror` derives implementations for an error whose variants remain owned by
  the domain/application; it need not expose a database or framework error.
- Serde does not justify serializing domain internals directly when external schema,
  validation, evolution, or persistence semantics need a distinct representation.
- Tokio mechanics, connection management, and telemetry exporters belong with
  runtime/adapters/composition, not inside domain rules.
- Gate optional integrations behind features where useful; do not build a speculative
  feature matrix or enable every default feature without considering its cost.

## Exceptions and Checks

Custom functionality can be appropriate when product-specific behavior, target
constraints, unsuitable libraries, or disproportionate cost justify ownership.
Record that reason in the existing design/plan. A focused domain renderer may be
simpler than a general layout engine; a custom cryptographic primitive is not an
equivalent casual alternative.

Before completion, check that selected crates were approved, existing suitable
dependencies were considered, feature/target constraints were tested as required,
and infrastructure types did not leak into core contracts. Do not mistake a passing
build for dependency-policy or architecture compliance.
