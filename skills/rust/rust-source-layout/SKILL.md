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

For new crates, and when establishing the first substantial feature in an existing
crate, first identify the crate's architectural scope. A crate spanning domain,
application, and adapter responsibilities uses explicit role directories. A crate
dedicated to one role treats its crate root as that boundary and does not repeat the
role in its paths. For example, a domain-only crate uses `src/<domain_concept>/`, not
`src/domain/<domain_concept>/`.

Small size alone is not an exemption from separating distinct responsibilities: a
small mixed-responsibility CLI still separates domain behavior from argument decoding
and output formatting. Conversely, a focused crate does not add empty or redundant
layer directories merely to resemble an application crate.

Create only directories/components needed by actual responsibilities, not empty
layers or placeholder ports. Procedural macros, bindings, and other specialized
crates may need another layout: identify their role and obtain approval for a concrete
alternative when neither the mixed-role nor focused-role shape below fits.

In established projects apply ownership rules to affected behavior; do not migrate
unrelated modules. Necessary broader restructuring must be included in approved scope.

## Mixed-Responsibility Application Crate

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

## Focused Crates

When a crate contains only one architectural category, omit that category's wrapper
directory because the crate itself establishes the boundary. Organize its root by
cohesive concepts or responsibilities:

```text
# Domain-only crate
src/
  <domain_concept>/
    mod.rs
    <cohesive_module>.rs
  lib.rs

# Application-only crate
src/
  use_cases/
    mod.rs
    <use_case>.rs
  ports/
    mod.rs
    <capability>.rs
  lib.rs

# Adapter-only crate
src/
  inbound/
    mod.rs
    <transport>.rs
  outbound/
    mod.rs
    <technology>.rs
  lib.rs
```

These are examples of role-focused roots, not a requirement to create every shown
subdirectory. A crate containing one cohesive domain concept may put named modules
directly under `src/`; it does not need both `src/domain/` and another concept wrapper.
An adapter crate dedicated to one integration may likewise organize directly around
that integration rather than adding a redundant `outbound/` directory.

Crate boundaries must provide real cohesion and dependency direction, not merely
move folders into workspace members. Do not split every concept, use case, port, or
adapter into its own crate mechanically. If a focused crate later gains another
architectural role, introduce explicit role boundaries or split responsibilities as
the change requires instead of allowing its root to become ambiguous.

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
A focused crate's role follows from its declared scope and contracts, not from
requiring a redundant directory name.

## Planning and Review

Before implementation, name concrete module paths for every significant owner.
A plan missing placement of domain behavior, use cases, ports, or adapters that the
change requires is incomplete; revise it or obtain explicit approval for an alternative.

In a mixed-role crate, do not place substantive domain definitions in `domain/mod.rs`.
In a focused crate, keep `lib.rs` and namespace `mod.rs` files thin. Do not combine
distinct responsibilities in one source file to reduce file count, or create generic
`models.rs`, `services.rs`, and `utils.rs` containers for independently describable
responsibilities.

For an IDL domain, parsing, model, name resolution, validation, and formatting may
have distinct owners when independently meaningful. They are not automatically
infrastructure merely because they involve text.

Example: in a mixed crate, put a routing policy in `domain/routing/policy.rs`, its
workflow in `app/use_cases/resolve_route.rs`, and HTTP translation in
`adapters/inbound/http.rs`. In a domain-only crate, the same policy belongs at
`routing/policy.rs`. Do not create a second policy inside a new CLI adapter.

Review actual definitions/imports and public contracts, not just directory names.
Use compiler/module-aware checks where available; a passing text search does not
prove correct semantic ownership.
