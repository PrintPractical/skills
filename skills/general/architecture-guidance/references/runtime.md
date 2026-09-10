# Runtime Ownership

Runtime architecture determines how work executes and resources are owned. It is
independent of logical hexagonal boundaries.

## Select the Execution Model

Choose the simplest model meeting ownership, concurrency, lifecycle, isolation, and
performance requirements: direct calls, async calls, tasks, event loops, actors,
workers, threads, state machines, or pipelines. State the concrete requirement
before introducing a task, channel, queue, or scheduler transition.

Do not introduce actors/tasks for stateless transformation or ordinary domain
computation. A port can be a direct call; it does not imply a runtime hop.

## Resource Lifetimes

Every long-lived, mutable, stateful, or exclusive resource needs an explicit owner:
sockets, sessions, hardware, subprocesses, mutable runtime state, and coordinated
caches included. Identify creation, access, mutation, failure handling, shutdown,
and final cleanup. For background work, specify cancellation and whether shutdown
drains, rejects, or abandons in-flight operations.

A dedicated task/component can provide exclusive ownership, serialized mutation,
event handling, lifecycle control, or failure isolation. Locks can be simpler for
genuinely shared in-process state; message passing is not universally preferable.
Specify queue bounds/backpressure and overload behavior where work can accumulate.

Prefer `manager -> resolved handle -> resource` for repeated operations on a resolved
resource. Managers own discovery, creation, registration, lifecycle, and acquisition;
do not route every data-plane operation through a control-plane manager needlessly.

## State and Failures

Use explicit states/transitions when valid operations materially depend on state,
rather than combinations of independent booleans. Domain-semantic state belongs in
the domain. Protocol, transport, hardware, OS, and lifecycle state belongs with its
adapter/runtime owner.

Technical retry/backoff belongs in infrastructure. Whether repeating an operation is
semantically safe, and the use-case deadline or transaction semantics, must remain
explicit in core contracts. Do not retry non-idempotent work blindly or multiply
retries at several boundaries. Preserve cancellation and actionable failure meaning.

Centralize repeated tracing/context propagation, authentication metadata extraction,
instrumentation, protocol error mapping, and serialization conventions in suitable
middleware/wrappers/adapters. This does not move domain authorization decisions or
other business policies into generic middleware merely because they recur.

## Performance

On performance-sensitive paths, inspect avoidable allocations, copies, serialization,
queue hops, scheduler transitions, lookups, policy reevaluation, and manager traversal.
Resolve expensive decisions once only while their result remains valid; identify
invalidation needs. Do not trade correctness for stale cached decisions.

Do not use architectural cleanliness to justify runtime overhead, or speculative
performance to erase meaningful ownership boundaries. Measure relevant workload
before adopting more complex optimization.

## Examples and Checks

- **New outbound port:** A direct adapter call is sufficient unless resource ownership
  or concurrency requires another task. Check the stated reason for any added queue.
- **Device session:** One task exclusively owns the device, accepts bounded work, and
  shuts down explicitly. Test acquisition failure, overload, cancellation, and cleanup.
- **Lifecycle flags:** Replace invalid combinations with explicit transitions owned
  by the runtime component. Test rejected operations and terminal-state behavior.
- **Hot-path lookup:** Resolve a handle once when valid; test behavior after resource
  removal or replacement rather than assuming cached handles remain usable forever.
