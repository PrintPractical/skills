# C++ Source Organization

Read when designing, changing, or reviewing source organization, headers, public APIs,
include visibility, or build/dependency boundaries. Apply the practices skill's ownership,
inward-dependency, and standard-library-only core rules regardless of paths. These
examples illustrate choices, not templates or minimum file counts.

## Smallest Useful Arrangements

A focused reservation library can keep related values and operations together:

```text
include/booking/reservation.hpp  # exported values and operations
src/reservation.cpp             # invariants and private helpers
tests/reservation_test.cpp      # observable behavior
```

No `domain/` wrapper or class subdirectory is needed. A simple header-only value needs
no implementation file, and a private type needs no public header. An application with
no external API need not have an installed `include/` tree. Several related owners can
share a file when their responsibilities and dependency rules remain clear.

When a workflow and external storage actually exist, a shallow application might use:

```text
src/reservation.hpp, .cpp    # domain values, rules, and failures
src/reserve_seat.hpp, .cpp   # workflow API and needed storage contract
src/sqlite_store.hpp, .cpp   # private adapter construction, mapping, and database calls
src/cli.cpp                 # protocol syntax and application result translation
src/main.cpp                # construction, injection, startup, and shutdown
tests/reserve_seat_test.cpp  # behavioral flow with a lightweight port fake
```

Here `.hpp, .cpp` is shorthand for same-stem files, not a requirement to create pairs.
The storage contract can live beside its use case until separate sharing or visibility
justifies another header. `main.cpp` can hold a small CLI entry point instead of a
separate `cli.cpp`; keep workflow ownership out of the handler. Add adapter integration
checks and direct invariant tests where behavior needs them, not a mirrored test tree.

As real concepts or integrations grow, group related files by feature or integration,
or use role directories where they improve navigation and visibility. A focused-role
library can keep using its root; adding a role requires clear ownership and dependencies,
not automatically new directories or libraries. Never scaffold empty future layers.

## Headers and Build Mechanics

- Match APIs and implementations by cohesive concept, not class count. Use namespaces
  to express ownership, not generic `Domain.hpp`, `Services.cpp`, or utility bins.
- Each header is guarded, includes what its declarations require, and compiles on its
  own. Include the corresponding header in its implementation, preferably first, to
  expose missing dependencies rather than relying on transitive includes.
- Export only genuinely consumed API. Keep private types, helpers, and adapter
  construction declarations in implementation files or nearby private headers. Another
  translation unit needing a declaration does not make it an installed/public API.
- Template definitions may need header visibility; this does not relax dependency
  direction or justify exposing SDK types. Follow the supported standard/toolchain
  and repository conventions for header-only code or C++ module interfaces.
- Use value semantics where practical and opaque implementation storage only when
  hiding representation or controlling compilation dependencies has concrete value.
  If an opaque implementation uses `std::unique_ptr` to an incomplete type, define
  destruction and other operations requiring completeness where the type is complete.
- Technology isolation justifies a narrow port with one implementation. Keep its
  declarations core-owned and technology-neutral; do not require an abstract interface
  for each concrete use case or create `IFoo/Foo/FooImpl` families.
- Set include visibility deliberately: consumers see exported contracts, while private
  header paths and technology dependencies stay local to their targets. Avoid global
  include paths or transitive link exposure that let core code consume adapter details.
- Where useful, separate core and adapter build targets so core builds with only its
  allowed dependencies and composition links the implementations. Do not create a
  target per class or owner. If a small build shares a target, review includes and link
  usage explicitly; a shared target does not permit technology calls in core functions.
- Verify header self-containment and affected consumer builds using the repository's
  supported C++ standard and existing tools. Check that core headers and implementations
  include no concrete adapters, OS APIs, or non-standard libraries.

## Traceable Changes

For an existing reservation change, identify the actual handler, workflow function or
class, invariant owner, capability declaration, adapter mapping, and composition owner
by symbol and path. Trace input -> use case -> domain decision -> port -> adapter, then
the result/failure path, and name behavioral checks. For greenfield planning, likely
modules and dependency/visibility constraints suffice until placement is concrete.

If a handler owns reservation policy, move that rule to the authoritative domain
owner and orchestration to the use case. If the use case includes a database SDK,
introduce the storage capability it needs and move technology calls and mappings to
the adapter. Neither correction requires a prescribed tree, duplicate DTOs, a class
per step, or unrelated reorganization. Preserve RAII, borrowed dependency lifetimes,
and explicit shutdown ordering while moving behavior; a logical boundary needs no
extra runtime task or queue hop.
