---
name: c-practices
description: Use when designing, planning, implementing, or reviewing C APIs and behavior, especially ownership, lifetime, cleanup, errors, bounds safety, ports, concurrency, dependencies, and tests; applies idiomatic C rather than C++ patterns.
user-invocable: false
---

# C Practices

## Scope and Architecture

- Write idiomatic C for the repository's supported C standard and target platforms.
- These are C-specific rules, not C++ RAII, templates, or class patterns in disguise.
- Use `c-source-layout` for placement and `architecture-guidance` for shared design
  decisions when needed. Report a missing needed skill; do not invent its guidance.
- Keep domain rules authoritative and infrastructure-free; use cases own workflows,
  adapters own technology, and the outer composition boundary wires dependencies.
- These rules constrain code and design, not agent workflow orchestration.

## Modeling and APIs

- Prefer small cohesive structs, enums, and functions named for domain concepts.
- Use wrapper structs when meaningful units or identities need type distinction;
  a `typedef` of an integer alone does not provide a distinct type in C.
- Validate invariants at construction and mutation boundaries.
- Use opaque structures where representation hiding or lifetime control adds value.
  Prefer ordinary values for simple data that needs no hidden representation.
- Use enums and explicit transitions for meaningful states, not conflicting flags.
- Keep private helpers `static`; make public headers self-contained and minimal.
- Distinguish borrowed input, mutable output, and ownership transfer in API contracts.
- Specify nullability, sizes, aliasing constraints, and whether buffers may overlap.
- Use `const` for read-only access, without implying ownership or thread safety.
- Avoid generic object systems, macro frameworks, and mechanical callback tables.

## Ownership and Cleanup

- Every allocation, file, socket, lock, and callback context has a named owner.
- Document who releases each resource, with which function, and when transfer occurs.
- Raw pointers are normal in C; ambiguous raw-pointer ownership is not acceptable.
- Pair create/destroy or init/deinit operations and define valid partial-init states.
- Prefer caller-owned values and buffers when their lifetime and capacity are clear.
- Initialize handles before fallible work; release acquired resources on every exit.
- A focused `goto cleanup` path is idiomatic when it simplifies ordered unwinding.
- Release resources in reverse dependency order and preserve the primary failure.
- Never use a pointer after free; clear owner fields when needed to prevent reuse.
- Do not overwrite the sole allocation pointer with the result of `realloc`.
- Check allocation failure; do not turn expected exhaustion into unchecked access.

Example contract, with status and ownership separated:

```c
typedef struct reservation_store reservation_store;
enum store_status { STORE_OK, STORE_IO_ERROR, STORE_NO_MEMORY };

/* out must be non-NULL; *out is NULL on failure, caller-owned on success. */
enum store_status reservation_store_open(const char *path,
                                         reservation_store **out);
/* Accepts NULL; otherwise releases the store and its owned resources. */
void reservation_store_destroy(reservation_store *store);
```

## Errors and Safety

- Return explicit status/error codes for expected failures; use out parameters when
  a result must be separate from status. Define output validity on every outcome.
- Keep domain, application, and adapter failures meaningful to their boundaries.
- Translate OS/library errors at adapters; capture `errno` before cleanup can change it.
- Do not use assertions, aborts, or process termination for expected input/I/O failures.
- Check lengths, indices, offsets, and integer conversions before use.
- Guard multiplication before allocation, for example `count > SIZE_MAX / sizeof *p`;
  guard additions as well. Unsigned wrap is not a valid bounds check.
- Track buffer capacity separately from data length, including space for terminators.
- Check `snprintf` for negative return and truncation before using its reported length.
- Use literal format strings with matching argument types; never `printf(user_input)`.
- Treat external bytes as untrusted; avoid unbounded string copies and scans.
- Respect alignment, effective type, and object lifetime; avoid unchecked casts.
- Pass `EOF` or an `unsigned char` value to character-classification functions.
- Handle short reads/writes, end-of-file, interruptions, and malformed data explicitly.

## Ports and Runtime

- Use narrow capability contracts only where isolation or substitution is meaningful.
- A callback plus context, or a small operation table, can implement an outbound port.
  Document context lifetime, callback failure, reentrancy, and thread-safety rules.
- Prefer direct function calls otherwise; do not create an interface for every module.
- Inject dependencies explicitly; keep SDK types, hidden globals, and concrete adapter
  construction out of domain and application code.
- Keep domain computation synchronous unless its meaning requires otherwise.
- Give mutable runtime resources clear owners; use threads/queues only for real need.
- Define lock order and minimize lock scope; `volatile` is not synchronization.
- Shutdown must stop new work, signal cancellation, unblock waits, join workers,
  and release resources only after users and callbacks can no longer access them.
- Cover partial startup and repeated shutdown if the API promises it; signal handlers
  must use only operations allowed by the platform's signal-safety rules.

## Dependencies

- Check the C standard library, suitable existing dependencies, then mature maintained
  libraries before implementing general-purpose infrastructure yourself.
- Evaluate fit, licensing, maintenance, portability, footprint, and build integration.
- Do not handroll cryptography, codecs, serializers, parsers, or retry frameworks merely
  to avoid dependencies. There is no preferred library catalog for C in this skill.
- Use `dependency-approval` when a dependency decision is needed. If unavailable,
  report the gap and still obtain user approval before adding any dependency.
- Recommend new dependencies with material tradeoffs and wait for approval before
  adding or relying on them. A preferred or familiar library is not pre-approved.
- Record a custom commodity implementation's concrete reason and owner. Do not
  silently implement a local replacement to bypass an unresolved dependency choice.

## Testing and Review

- Test domain invariants and use-case behavior through their public APIs.
- Use lightweight fakes at meaningful ports; do not add abstractions just for mocks.
- Test adapter mappings and failure translation with appropriate integration coverage.
- Cover empty/maximum inputs, overflow, malformed data, allocation/I/O failures,
  partial initialization, cleanup, cancellation, and shutdown behavior.
- Assert outcomes and resource/lifetime behavior rather than private call sequences.
- Use compiler warnings, static analysis, and available address/undefined/thread
  sanitizers as appropriate to the target; report checks that could not run.
