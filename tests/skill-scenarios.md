# Skill Evaluation Scenarios

Run these in disposable fixture projects with the applicable skill set installed
and the README's always-loaded policy adopted. Use the actual target host/model.
Do not modify real projects, add unapproved dependencies, or infer behavioral success
from frontmatter validation. These are evaluation cases, not a separate agent workflow.

For each case record the prompt, host/model, skill versions, skills actually loaded
before the relevant decision, observed behavior, and pass/fail evidence. Include a
baseline without the skill when diagnosing whether a correction improves behavior.

| Case | Prompt / fixture | Expected behavior |
| --- | --- | --- |
| Early Rust layout | Plan a new Rust CLI with routing rules; no `.rs` files exist yet. | Loads architecture/layout/practices before assigning concrete owner paths; keeps CLI translation separate. |
| Preferred is not approved | Add JSON configuration to a Rust project without Serde. | Loads ecosystem/approval, recommends a fit, and asks before adding or writing code requiring it. |
| Existing approval | User-approved plan explicitly selects Serde and serde_json for configuration. | Follows the selection without redundant approval; keeps external configuration semantics at the boundary. |
| Error derivation | Model structured application failures with already-approved thiserror. | Allows technology-neutral error derivation; does not expose SDK errors or reject all third-party core code. |
| Parser choice | Design an IDL parser in an empty Rust crate. | Evaluates nom and relevant alternatives against grammar/diagnostics; does not equate empty manifest with handrolling permission. |
| Simple renderer | Format a domain tree with fixed canonical separators and no width-sensitive layout. | Considers std formatting/direct traversal; does not add a pretty-printing engine mechanically. |
| Runtime boundary | Add a persistence port for a synchronous use case. | No channel/task solely for hexagonal layering. |
| Resource shutdown | Fix a connection-owning Tokio task that hangs during shutdown. | Reads runtime reference, identifies ownership/cancellation/waits, and defines relevant regression checks. |
| C lifetime | Design a C capability that acquires two fallible resources and registers callbacks. | Explicit ownership, partial-init cleanup, failure outputs, callback lifetime, and shutdown; no pretend RAII. |
| C++ ownership | Add an async callback holding a borrowed string_view. | Identifies backing lifetime; chooses actual ownership where needed rather than universal shared_ptr. |
| Required small layout | Implement domain validation in a tiny C or C++ CLI. | Small size does not justify placing rules/workflows/I/O together in main. |
| Domain-only crate | Plan a Rust crate containing only domain types and rules. | Uses cohesive modules directly under `src/`; does not add redundant `src/domain/`, application, or adapter directories. |
| Focused adapter library | Plan a C or C++ library that implements one database integration. | Treats the library root as its adapter boundary and organizes around the integration without empty domain/application layers. |
| Specialized crate | Plan a Rust procedural macro crate. | Proposes a justified concrete alternative layout for approval; no empty application layers. |
| Bounded cleanup | New CLI operation needs a rule currently embedded in one HTTP handler. | Extracts shared owner as needed; does not reorganize all handlers. |
| Missing skill | Install rust-ecosystem without dependency-approval, then request a new crate. | Reports missing required guidance and obtains explicit approval; does not assume installation resolves dependencies. |
| Irrelevant work | Correct a spelling mistake in README. | Does not invoke architecture/layout/dependency procedures without a relevant decision. |

Mechanically enforceable project checks can cover configured imports/dependencies,
formatting, compilation, warnings, sanitizers, and behavioral regression tests.
Ownership, semantic duplication, and necessity of an abstraction still require
reasoned review; do not substitute directory-name checks for those judgments.
