# C Source Organization

Read when designing, changing, or reviewing source organization, headers, public APIs,
include visibility, or build/dependency boundaries. Apply the practices skill's ownership,
inward-dependency, and standard-library-only core rules regardless of paths. These
examples illustrate choices, not templates or minimum file counts.

## Smallest Useful Arrangements

A focused reservation library can keep one cohesive API and implementation:

```text
include/booking/reservation.h  # exported values and operations
src/reservation.c             # invariants and private static helpers
tests/reservation_test.c      # observable behavior
```

No `domain/` wrapper or concept subdirectory is needed. An implementation-private
value or helper needs no public header; an application with no external API need not
have an installed `include/` tree at all. Several related owners can share a file
when their responsibilities and dependency rules remain clear.

When a workflow and external storage actually exist, a shallow application might use:

```text
src/reservation.h, .c       # domain values, rules, and errors
src/reserve_seat.h, .c      # workflow API and needed storage contract
src/sqlite_store.h, .c      # private adapter construction, mapping, and database calls
src/cli.c                  # protocol syntax and application result translation
src/main.c                 # construction, injection, startup, and cleanup
tests/reserve_seat_test.c   # behavioral flow with a lightweight port fake
```

Here `.h, .c` is shorthand for same-stem files, not a requirement to create pairs.
The storage contract can live beside its use case until separate sharing or visibility
justifies another header. `main.c` can hold a small CLI entry point instead of a
separate `cli.c`; keep workflow ownership out of the handler. Add adapter integration
checks and direct invariant tests where behavior needs them, not a mirrored test tree.

As real concepts or integrations grow, group related files by feature or integration,
or use role directories where they improve navigation and visibility. A focused-role
library can keep using its root; adding a role requires clear ownership and dependencies,
not automatically new directories or libraries. Never scaffold empty future layers.

## Headers and Build Mechanics

- Organize by cohesive concepts, not generic `models.h`, `services.c`, or `utils.c`
  bins. Use project/concept-prefixed symbols and include guards; C has no namespaces.
- Each header includes what its declarations require and compiles on its own. Include
  the corresponding header in its implementation, preferably first, to expose missing
  dependencies rather than relying on transitive includes.
- Export only genuinely consumed API. Keep adapter construction declarations and
  other private shared headers beside their implementation; do not install them just
  because another translation unit needs them.
- Keep implementation-only functions and objects `static`. Use opaque structs when
  representation hiding or lifetime control helps, not to heap-allocate every value.
- For opaque handles, document create/destroy or init/deinit, allocation ownership,
  borrowed arguments, and partial failure. Callback/context ports specify who owns
  the context, how long it lives, and when callbacks can no longer occur.
- A callback/context contract or technology-neutral function contract can isolate
  a single adapter. Keep SDK handles and OS types out of that core-facing contract;
  avoid vtable frameworks or `Foo/FooImpl` families for ordinary internal calls.
- Set include visibility deliberately: consumers see exported contracts, while private
  header paths and technology dependencies stay local to their targets. Avoid global
  include paths or transitive link exposure that let core code consume adapter details.
- Where useful, separate core and adapter build targets so core builds with only its
  allowed dependencies and composition links the implementations. Do not create a
  target per owner. If a small build shares a target, review includes and link usage
  explicitly; a shared target does not permit technology calls in core functions.
- Verify header self-containment and affected consumer builds using the repository's
  supported C standard and existing tools. Check that core headers and implementations
  include no concrete adapters, OS APIs, or non-standard libraries.

## Traceable Changes

For an existing reservation change, identify the actual handler, workflow function,
invariant owner, capability declaration, adapter mapping, and composition owner by
symbol and path. Trace input -> use case -> domain decision -> port -> adapter, then
the result/failure path, and name behavioral checks. For greenfield planning, likely
modules and dependency/visibility constraints suffice until placement is concrete.

If a handler owns reservation policy, move that rule to the authoritative domain
owner and orchestration to the use case. If the use case includes SQLite, introduce
the storage capability it needs and move technology calls and mappings to the adapter.
Neither correction requires a prescribed tree, duplicate DTOs, a file per step, or
unrelated reorganization. Preserve explicit C cleanup and callback lifetime ownership
while moving behavior; do not turn a logical boundary into an extra runtime task.
