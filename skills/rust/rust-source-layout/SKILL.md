---
name: rust-source-layout
description: Apply required Rust crate and module layout when designing, planning, implementing, refactoring, or reviewing Rust projects. Use before assigning source paths, adding a crate or substantial feature, or placing domain rules, use cases, ports, adapters, and composition code.
user-invocable: false
---

# Rust Source Layout

Use `architecture-guidance` for responsibility/dependency decisions and
`rust-practices` for implementation. If needed guidance is unavailable, report the
gap before making the affected decision. This skill specifies paths, not a workflow.

## Applicability

For new application crates, and when establishing the first substantial feature in
an existing crate, use this layout for domain rules, application workflows, or
infrastructure integrations unless the user explicitly approves another layout.
Small size alone is not an exemption: a small CLI with domain behavior still
separates that behavior from argument decoding and output formatting.

Create only directories/components needed by actual responsibilities, not empty
layers or placeholder ports. Specialized crates such as procedural macros, bindings,
or focused low-level libraries may need another layout: identify their role and
obtain approval for a concrete alternative before departing from this structure.

In established projects apply ownership rules to affected behavior; do not migrate
unrelated modules. Necessary broader restructuring must be included in approved scope.

## Required Layout

```text
src/
  domain/
    mod.rs
    <domain_concept>/
      mod.rs
      <cohesive_module>.rs
  app/
    mod.rs
    use_cases/
      mod.rs
      <use_case>.rs
    ports/
      mod.rs
      <capability>.rs
  adapters/
    mod.rs
    inbound/
      mod.rs
      <transport>.rs
    outbound/
      mod.rs
      <technology>.rs
  lib.rs
  main.rs
```

Use Rust `snake_case` identifiers for actual paths. The tree shows possible roles,
not a requirement for both an executable and a library or every adapter direction.

- `domain/`: concepts, rules, invariants, domain errors, technology-neutral
  transformations. Organize around meaningful concepts and cohesive families.
- `app/use_cases/`: one module per meaningful use case or tightly coupled family.
- `app/ports/`: application-owned capability contracts, not concrete implementations.
- `adapters/inbound/`: CLI, HTTP, RPC, message, and other inbound translation.
- `adapters/outbound/`: filesystem, database, process, network, and other integrations.
- `main.rs`: composition entry point. Construct/inject concrete resources and use
  cases, then start the runtime. Do not put domain or use-case behavior here.
- `lib.rs` and `mod.rs`: declarations, visibility boundaries, intentional re-exports
  only. Put substantive definitions and behavior in named modules.

For multiple binaries or larger wiring needs, name an outer composition module in
the design and keep each entry point thin. Do not hide infrastructure construction
inside application modules to shorten the composition entry point.

## Dependency Direction

Domain may depend on domain code, the standard library, and approved
technology-neutral supporting crates. It must not import application, adapters,
runtime/OS integration, or external representation details.

Application may depend on domain, its own capability contracts, and approved
technology-neutral supporting crates, not concrete adapters. Adapters depend inward
on application/domain plus the technologies they implement. The location of
`adapters/` under `src/` never makes it part of the core.

Use visibility such as private modules and `pub(crate)` intentionally. Do not expose
every internal type through `lib.rs` just because it exists. If architecture is split
across crates, preserve the same direction in manifest dependencies and public APIs.

## Planning and Review

Before implementation, name concrete module paths for every significant owner.
A plan missing placement of domain behavior, use cases, ports, or adapters that the
change requires is incomplete; revise it or obtain explicit approval for an alternative.

Do not place domain definitions in `domain/mod.rs`, combine layers in one source file
to reduce file count, or create generic `models.rs`, `services.rs`, and `utils.rs`
containers for independently describable responsibilities.

For an IDL domain, parsing, model, name resolution, validation, and formatting may
have distinct owners when independently meaningful. They are not automatically
infrastructure merely because they involve text.

Example: put a routing policy in `domain/routing/policy.rs`, its resolution workflow
in `app/use_cases/resolve_route.rs`, and HTTP translation in `adapters/inbound/http.rs`.
Do not create a second policy inside a new CLI adapter.

Review actual definitions/imports and public contracts, not just directory names.
Use compiler/module-aware checks where available; a passing text search does not
prove correct semantic ownership.
