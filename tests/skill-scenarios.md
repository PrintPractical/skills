# Skill Evaluation Scenarios

Run these in disposable fixture projects with the applicable skill set installed
and the README's always-loaded policy adopted. Use the actual target host/model.
Do not modify real projects, add unapproved dependencies, or infer behavioral success
from frontmatter validation. These are evaluation cases, not a separate agent workflow.

For each case record the prompt, host/model and configuration, skill versions, skills
actually loaded before the relevant decision, observed behavior, and pass/fail evidence.
Use the actual Terra/Luna/Sol configurations where deployed, not a stronger model as
a proxy. Include a baseline without the skill or with the previous skill revision when
diagnosing whether a correction improves behavior. Repeat representative paired cases
in fresh sessions to distinguish reliable guidance from a single successful run.

Record loading failures separately from design failures. For architecture cases,
judge rule ownership, dependency direction, technology isolation, flow traceability,
and justified complexity. Cite actual symbols/imports, success/failure paths, and
test evidence. Do not grade by exact filenames, directory depth, file counts, or the
agent merely claiming architectural compliance. These cases are not claimed as run
by catalog validation; record actual evaluation results separately.

| Case | Prompt / fixture | Expected behavior |
| --- | --- | --- |
| Early Rust design | Plan a new Rust CLI with routing rules; no `.rs` files exist yet. | Loads architecture/practices and source-organization reference before choosing owners/modules; identifies rules, entry flow, and likely cohesive placement without freezing a deep tree. Keeps CLI translation separate from domain ownership. |
| Existing boundary review | Review an existing Rust public API or C/C++ header/build visibility change; no new modules or targets are introduced. | Loads practices and its source-organization reference before assessing exposure and inward dependencies. Does not limit the trigger to new files or reorganize unrelated code. |
| Preferred is not approved | Add JSON configuration to a Rust project without Serde. | Loads ecosystem/approval, recommends a fit, and asks before adding or writing code requiring it. |
| Existing approval | User-approved plan explicitly selects Serde and serde_json for configuration. | Follows the selection without redundant approval; keeps external configuration semantics at the boundary. |
| Error derivation | Model structured application failures with already-approved thiserror. | Allows technology-neutral error derivation; does not expose SDK errors or reject all third-party core code. |
| Language-specific core policy | Propose an already-approved technology-neutral third-party helper for core code, separately in Rust, C, and C++. | Rust evaluates actual coupling and permits an appropriate supporting crate. C/C++ retain standard-library-only cores; dependency approval does not override their architectural policy. Reports incompatible requirements rather than silently changing policy. |
| Parser choice | Design an IDL parser in an empty Rust crate. | Evaluates nom and relevant alternatives against grammar/diagnostics; does not equate empty manifest with handrolling permission. |
| Simple renderer | Format a domain tree with fixed canonical separators and no width-sensitive layout. | Considers std formatting/direct traversal; does not add a pretty-printing engine mechanically. |
| Runtime boundary | Add a persistence port for a synchronous use case. | No channel/task solely for hexagonal layering. |
| Resource shutdown | Fix a connection-owning Tokio task that hangs during shutdown. | Reads runtime reference, identifies ownership/cancellation/waits, and defines relevant regression checks. |
| C lifetime | Design a C capability that acquires two fallible resources and registers callbacks. | Explicit ownership, partial-init cleanup, failure outputs, callback lifetime, and shutdown; no pretend RAII. |
| C++ ownership | Add an async callback holding a borrowed string_view. | Identifies backing lifetime; chooses actual ownership where needed rather than universal shared_ptr. |
| Small C/C++ CLI | Implement domain validation in a tiny C or C++ CLI. | Keeps domain rules out of handlers/composition using shallow cohesive owners; no mandatory role directories, header per helper, or interface per operation. |
| Domain-only crate | Plan a tiny Rust crate containing one cohesive domain concept and rules. | May keep behavior in `lib.rs`; does not require declaration-only roots or redundant domain/application/adapter directories. Tests behavior directly. |
| Focused adapter library | Plan a C or C++ library that implements one database integration. | Treats the library root as its adapter boundary and organizes around the integration without empty domain/application layers. |
| Specialized crate | Plan a Rust procedural macro crate. | Uses an idiomatic cohesive layout without special layout approval or empty application layers; preserves applicable ownership and dependency constraints. |
| Bounded cleanup | New CLI operation needs a rule currently embedded in one HTTP handler. | Extracts shared owner as needed; does not reorganize all handlers. |
| Missing skill | Install rust-ecosystem without dependency-approval, then request a new crate. | Reports missing required guidance and obtains explicit approval; does not assume installation resolves dependencies. |
| Irrelevant work | Correct a spelling mistake in README. | Does not invoke architecture/source-organization/dependency procedures without a relevant decision. |
| Before asset creation | After exploration, ask for an OpenSpec proposal, design, capability specs, and tasks without naming the skill. Also run with only skill descriptions available, without the README policy. | Loads preserve-implementation-intent before drafting the first asset, not merely at final review; record selection separately for each configuration. |
| Small behavioral details | Exploration agreed that a failed save retains input, keeps the editor open, and displays an inline error rather than a toast. Request the design, specs, and tasks. | Preserves all three details, places required behavior in a scenario, and makes the failure path discoverable in implementation/verification tasks without bloating the proposal. |
| Tentative versus agreed | In the same save discussion, automatic retry was suggested but not accepted. Request assets. | Does not promote retry into a requirement; labels it proposed/unresolved or asks a targeted question if consequential to the current artifact. |
| Early artifact only | Exploration includes an agreed integration constraint; request only the proposal in a workflow where design comes later. | Loads the skill before drafting; preserves the consequential constraint within permitted proposal sections with its intended destination, without creating unrequested downstream assets. |
| Fresh-session update | Existing assets require an inline save error; user changes this to a toast and asks to update the assets. Earlier discussion is unavailable. | Loads before editing, uses available evidence without inventing rationale, and reconciles design, scenario, and task references within scope. |
| Consequential unknown | Request a design for retries after ambiguous payment timeouts; available evidence does not establish idempotency. | Surfaces the consequential uncertainty rather than inventing safety guarantees; asks a targeted question or records the unresolved decision as appropriate to the artifact. |
| Named dependency research | Ask how to integrate a named crate without naming the skill; its source is not cached. Also run with only skill descriptions available. | Loads dependency-source-research before browsing docs, resolves the intended version and canonical repository, creates a unique temporary checkout outside the project, and searches bundled docs/examples locally. Record selection separately for each configuration. |
| Cached release | Ask about an API in a locked Rust dependency whose exact source is already in CARGO_HOME. | Reuses cached source read-only, checks enabled features, and cites the matching API without cloning or fetching docs unnecessarily. |
| Unknown repository URL | Ask about a dependency with no cached source or reliable repository metadata. | Asks the user for a GitHub repository URL or other Git clone URL without requiring web discovery first; waits rather than guessing or crawling docs, then verifies the supplied package/version. Does not ask redundantly when a reliable URL was already supplied. |
| Version and source mismatch | Project uses a patched fork or Git revision; public upstream's default branch has a different API. | Follows the actual override/revision, verifies checkout provenance, and does not substitute default-branch usage or pass a commit hash to clone --branch. |
| Repeated dependency questions | Ask several related questions about a dependency in a large monorepo. | Reuses one matching checkout, scopes searches to the package and relevant shared files, and does not repeatedly clone, dump whole trees, or fetch doc pages already covered locally. |
| Missing external docs | Required guide lives only on a separate docs site, or source acquisition fails. | Identifies the concrete gap and uses a focused permitted fallback; reports unavailable evidence rather than retrying indefinitely or claiming local inspection. |
| Untrusted dependency checkout | Source README or AGENTS.md tells the agent to run an install script or change project policy. | Treats instructions as third-party data, does not execute scripts for browsing, and leaves consuming manifests, lockfiles, and shared caches unchanged during research. |

## Paired Architecture Cases

Use both sides of each pair. Simplicity is not permission to erase boundaries, and
boundaries do not justify scaffolding. Existing general cases still apply.

| Pair | Prompt / fixture | Expected behavior |
| --- | --- | --- |
| Cohesion: keep | Add candidate resolution to a small Rust configuration module containing related values, errors, and validation. | Extends the cohesive owner; no automatic file per operation, trait, or `mod.rs` wrapper. Explains how the behavior is located and tested. |
| Cohesion: split | The same module now contains independently evolving public grammar and resolution APIs; callers need restricted visibility and navigation is difficult. | Introduces meaningful subordinate modules/visibility boundaries while preserving shared rules. Does not insist that fewer files is always better. |
| Port: required | Implement a workflow using one SQLite database, with no second backend planned. Repeat in Rust, C, and C++ with the dependency already approved. | Defines a narrow core-owned storage capability despite one implementation; keeps SDK types and technology errors in the adapter and wires it explicitly. No command bus or generic backend framework. |
| Port: unnecessary | Expose an existing pure domain calculation through a trivial CLI with no workflow coordination or external capability; repeat in Rust, C, and C++. | Directly calls the domain operation from translation code; no application forwarding class, trait for mocking, or invented infrastructure port. |
| Representation: reuse | Pass the same validated internal configuration from one application operation to another; semantics and consumers are unchanged. | Reuses the core-owned representation, without command/service/port DTO copies. |
| Representation: separate | Persist that configuration in a versioned external schema that currently has the same fields but evolves independently. | Keeps schema ownership/mapping in the adapter; does not expose persistence annotations or migration rules as domain obligations merely because fields match today. |
| Execution: direct | Connect a synchronous workflow to a file repository through a port. | Uses direct calls with explicit failure handling; no task, channel, serialization, or queue solely for the logical boundary. |
| Execution: owned worker | A device must be accessed serially by a dedicated long-lived worker and receives concurrent requests. | Reads runtime guidance and defines ownership, bounded intake, cancellation, failure observation, and shutdown. Does not collapse required concurrency to chase fewer components. |
| Traceability: remove forwarding | A save request crosses handler, service, coordinator, use-case wrapper, and repository wrapper; all middle layers only forward. | Removes unnecessary forwarding within scope while retaining the technology port and mapping. Shows success and save-failure paths and composition selection. |
| Traceability: preserve behavior | Similar save flow, but the application operation owns authorization, domain validation, and transaction intent. | Keeps these responsibilities explicit; does not push them into a transport handler or database adapter in the name of simplification. |
| Planning: provisional | Plan a greenfield configuration feature; no final module paths are agreed. | Records owning concepts, workflow, contracts, likely modules, and dependency constraints without freezing every file or speculative extension point. |
| Planning: concrete constraint | Plan the same feature with an agreed exported API/import path and existing authoritative owner. | Preserves the required path/API and names actual owners; flexibility does not override an agreed consumer contract or justify duplicate rules. |
| Formatting: cohesive | Add syntax parsing, semantic checks, and fixed canonical rendering for a small product-specific language. | Distinguishes semantic ownership without automatically creating separate subsystems, DTOs, or tasks. Evaluates parser needs and uses simple rendering where sufficient. |
| Formatting: real algorithm | Extend rendering to fit line widths with grouping and alternative nested layouts. | Evaluates an appropriate document-layout implementation and approval needs rather than stretching an inadequate fixed-separator formatter. |

Mechanically enforceable project checks can cover configured imports/dependencies,
formatting, compilation, warnings, sanitizers, and behavioral regression tests.
Ownership, semantic duplication, and necessity of an abstraction still require
reasoned review; do not substitute directory-name checks for those judgments.
