# Rust Source Organization

Read when designing, changing, or reviewing source organization, module/crate
dependencies, visibility, or public APIs. Apply the practices skill's dependency rules
regardless of paths. These examples are choices, not templates or minimum file counts.
Use repository conventions and Rust `snake_case` identifiers.

## Start Cohesive

A small library with one domain concept can keep its values, invariants, errors, and
operations in `src/lib.rs`, with direct behavioral tests. It needs no `domain/`,
`app/`, or declaration-only wrapper. Related owners do not each require a file.

When workflows and external storage exist, a shallow application might use:

```text
src/
  configuration.rs  # domain values, validation, and resolution
  application.rs    # workflow and its core-owned ConfigurationStore trait
  file_store.rs     # storage implementation, persisted schema, error translation
  cli.rs            # argument decoding and result presentation
  main.rs           # concrete construction, injection, startup, shutdown
```

The trait can live beside the workflow. No `ports/`, one-file-per-method `use_cases/`,
or adapter-direction directories are needed. A small CLI entry point can stay in
`main.rs` rather than acquiring `cli.rs`; domain rules and workflows must still have
their own owners outside the handler. Add `lib.rs` if a library API or project test
arrangement benefits, not just to complete the example.

A flow can be traced from `cli::run` to `application::update_configuration`, through
domain validation and `ConfigurationStore`, to `FileStore`. Composition selects
`FileStore`; the application never imports it. Related input/result types can stay
with the operation instead of acquiring command, service, and adapter copies.

## Grow for Concrete Needs

Expand `configuration.rs` into subordinate modules when independently changing APIs,
visibility, or navigation justify it. For example, extract resolution only when it
has become a meaningful separate API or obscures other configuration behavior.
Do not create a parser/model/validator/resolver directory family preemptively.

As multiple real capabilities or integrations grow, group by concept or role:

```text
src/
  configuration/
    mod.rs          # cohesive configuration API/behavior or namespace aggregation
    resolution.rs   # substantial independently useful resolution behavior
  app/
    configuration.rs
    ports.rs        # shared capability contracts when separate ownership helps
  adapters/
    file_store.rs
    remote_store.rs
  runtime.rs        # substantial composition/lifecycle wiring when needed
  lib.rs
```

This is one possible expansion, not the next mandatory stage. Use idiomatic module
declarations in `mod.rs` or same-named parent `.rs` files per repository conventions.
Grouping by business capability is also valid if domain, workflow, and technology
owners remain identifiable and dependencies point inward. Do not replicate shared
rules or a complete architecture tree in every feature.

A focused domain, application, adapter, procedural macro, or bindings crate can use
its root as its scope without redundant role directories or special layout approval.
Crate splits need real dependency enforcement, cohesive reuse, or build value; do
not create a workspace member per concept or adapter. Adding a role requires clear
ownership and dependencies, not automatically a new directory or crate.

## Visibility and Verification

- Keep modules and implementation details private by default. Expose only genuine
  consumer needs, using `pub(crate)` and narrower visibility where appropriate.
- Re-export intentionally; do not expose every internal type through `lib.rs`.
- Keep domain and application independent of concrete adapters even within one crate.
  Check definitions, imports, signatures, and external type exposure, not directory
  names alone. Visibility helps but does not prove all architectural dependencies.
- If splitting crates, verify manifest dependencies and exported APIs preserve the
  same direction. Do not add generic plumbing merely to support a speculative split.
- Keep direct domain tests, application behavior tests, and adapter integration checks
  where the repository supports them. Do not mirror every production directory or
  assert private placement/call chains as a substitute for behavior.
- In plans, identify existing owner paths and symbols precisely. For new code,
  ownership plus likely module and dependency constraints is enough until concrete
  placement matters to implementation or a consumer contract.
