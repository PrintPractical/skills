# Engineering Skills

Reusable architecture and language guidance for coding agents, distributed with
[`npx skills`](https://github.com/vercel-labs/skills). These skills complement an
existing workflow, including [agent-toolkit](https://github.com/PrintPractical/agent-toolkit/tree/v4);
they do not introduce another specification, approval, or verification lifecycle.

## Catalog

| Category | Skill | Purpose |
| --- | --- | --- |
| General | `architecture-guidance` | DDD/hexagonal boundaries, concrete design defaults, technology ports, traceable flows, runtime ownership, and behavioral verification |
| General | `dependency-approval` | User approval before adding dependencies, independent of language |
| General | `dependency-source-research` | Local-first dependency API research using cached source or temporary version-matched upstream checkouts |
| Spec-Driven Development | `preserve-implementation-intent` | Load before producing assets to preserve exploration details, implementation choices, and consequential uncertainty in OpenSpec or equivalent artifacts |
| Rust | `rust-practices` | Cohesive source organization, modeling, ownership, traits, errors, async, safety, and tests |
| Rust | `rust-ecosystem` | Standard-library and established-crate preferences, including Tokio, thiserror, Serde, and parser/formatter selection |
| C | `c-practices` | Cohesive source/header organization, explicit lifetimes, cleanup, status APIs, bounds safety, callback ports, and tests |
| C++ | `cpp-practices` | Cohesive source/header organization, values, RAII, ownership, errors, meaningful interfaces, concurrency, and tests |

Sources live under `skills/<category>/<skill>/SKILL.md`. Category directories do not
contain `SKILL.md` files: they are catalog organization, not skills or namespaces.
Skill names remain unique across the whole catalog. Supporting references are
bundled inside their owning skill so individual installations retain those files.

## Install

After these files are published to the repository:

```bash
# Inspect the catalog without installing it.
npx skills add PrintPractical/skills --list

# Install all skills for OpenCode in the current project.
npx skills add PrintPractical/skills --skill '*' -a opencode

# Install the general and Rust guidance only.
npx skills add PrintPractical/skills \
  --skill architecture-guidance dependency-approval dependency-source-research \
  rust-practices rust-ecosystem \
  -a opencode
```

Add `-g` for a user-level installation or target another supported agent with `-a`,
such as `claude-code`. Prefer project installation for shared, reproducible project
policy; global installation makes guidance available across projects and should not
silently impose this architecture on unrelated repositories.

From this checkout, use `npx skills add . --list` to inspect unpublished changes and
`npx skills add . --skill '*' -a opencode` to install them locally. The installer
discovers the categorized source tree and handles agent-specific installed paths.
Do not manually reproduce the nested catalog inside every agent's installed directory.

The catalog contains eight skills. Check discovery with your installer version using
`--list` before adopting it. Restart OpenCode after installing or changing skills so
discovery uses the new files.

### Migrating Existing Installations

The standalone `rust-source-layout`, `c-source-layout`, and `cpp-source-layout` skills
are retired. Their useful language-specific guidance now lives in each language's
practices skill and its bundled `references/source-organization.md`. Update explicit
install lists and consuming `AGENTS.md` policies to load practices rather than layout
skills. Remove retired installed skills in the scope where you installed them; do not
assume installing the new catalog removes stale copies. Do not load old layout rules
alongside the revised guidance. This checkout change does not update installations
in other projects or global skill directories.

## Agent Loading

Agents choose skills from their names/descriptions; users need not invoke them.
Descriptions include design, planning, implementation, and review because guidance
must apply before decisions are embedded in an approved plan, not only during edits.

`user-invocable: false` is included as a Claude Code convenience. It is not an Agent
Skills standard field, and OpenCode's documented loader ignores it. It must not be
used as an enforcement mechanism or a portable guarantee of hidden UI commands.

Installing a skill makes it available; it does not guarantee selection. Keep a short
always-loaded policy in the consuming project's `AGENTS.md` (or its host equivalent).
For projects adopting this catalog, the following is a suggested integration snippet,
not an automatically installed instruction file:

```markdown
## Engineering Guidance

- Preserve authoritative domain/use-case ownership, inward dependencies, core-owned
  technology ports, and traceable workflows. Logical layers do not mandate file trees.
- Obtain explicit user approval before adding dependencies. Preferred libraries
  are recommendations, not pre-approval.
- Before substantive domain, integration, or runtime decisions, load
  architecture-guidance. Follow its runtime reference for concurrency/lifecycle work.
- Before substantive design, planning, implementation, or review of code, load the
  applicable language's practices skill. Read its source-organization reference when
  designing, changing, or reviewing organization, public APIs, visibility, or
  module/header/package/build dependency boundaries.
- For Rust library/facility choices, load rust-ecosystem.
- Before proposing or adding a new dependency, load dependency-approval.
- Before researching a dependency's APIs, documentation, or behavior, load
  dependency-source-research. Prefer cached source or a temporary version-matched
  upstream checkout over repeated documentation-site fetches.
- Before creating or updating OpenSpec or other spec-driven development assets,
  load preserve-implementation-intent, including for proposals, designs, capability
  specs, implementation plans, and tasks. Do not defer loading until final review.
- Apply these skills within the existing workflow. Reassess relevance when scope
  changes and provide required skills/artifacts to reviewers or fresh sessions.
- If required guidance is missing, report the gap before the affected decision.
- Use descriptive Conventional Commit messages when a commit is requested.
```

Cross-skill references name skills rather than assuming sibling filesystem paths.
Install the general skills with each language set. The skill format does not
automatically resolve or install these dependencies.

These are instructional policies, not security controls. Use host permissions and
project checks for enforceable restrictions. Loading guidance never authorizes
commits, deployment, dependency additions, or other actions requiring user approval.

## Policy Choices

- Preserve DDD/hexagonal ownership and isolate infrastructure behind core-owned
  capability contracts, even with one implementation. Concrete internal operations
  need no corresponding interface. Logical layers do not require runtime hops.
- Give agents firm boundaries, a default design recipe, a decision table, and paired
  examples rather than an open-ended instruction to exercise good judgment. Keep
  orchestration readable and implementation selection discoverable in composition.
- Start with shallow cohesive modules. Related types, errors, operations, and helpers
  may share files, including Rust module/library roots. Expand structure for concrete
  ownership, visibility, semantic, lifecycle, or navigation needs, not a diagram.
  Example trees are not minimums, and equivalent layouts need no special approval.
- Identify existing owners precisely; keep greenfield paths provisional unless they
  are genuine constraints. No speculative file trees, DTO families, or extension points.
- Refactor ownership necessary for the requested change, not unrelated legacy code.
  Material scope expansion requires approval through the existing process.
- Rust core independence means no concrete infrastructure coupling, not no supporting
  crates. Approved technology-neutral libraries such as thiserror can be appropriate.
- Prefer Tokio for needed async execution; evaluate nom and other suitable parsers
  for actual grammar requirements. Ordinary formatting starts with `std::fmt`.
- C and C++ retain their standard-library-only core dependency rules in practices;
  infrastructure libraries stay behind adapters. C guidance does not pretend C has
  C++ ownership mechanisms.
- New dependencies need approval. Routine upgrade approval is left to the consuming
  repository's policy; this catalog does not silently establish a blanket rule.
- Dependency research uses local source and bundled docs first, reusing a matching
  cache or temporary upstream checkout. Targeted web lookups remain available for
  missing or live information; research does not authorize dependency installation
  or execution of third-party code.
- Mature-library evaluation precedes handrolled commodity functionality. In workflows
  that consider installed dependencies before local code, absence from the manifest
  is not itself sufficient justification for a custom implementation.

`AGENTS_CHRIS.md` is the original source guidance and has been left unchanged. It is
not an installable skill or a second maintained policy implementation. Do not
load it alongside the extracted catalog as competing instructions: it contains the
older Rust dependency restriction and dependency-decision protocol.

## Validate

No project dependencies are required for structural tests. Use Node.js 20 or newer:

```bash
node --test tests/catalog.test.mjs
npx skills add . --list
```

The tests check this catalog's frontmatter, names, categories, and links and named
skill references in skill bodies and bundled Markdown references. They are intentionally
not a general YAML or Agent Skills validator. CLI listing checks actual discovery
without installing the catalog.

See [evaluation scenarios](tests/skill-scenarios.md) for behavioral tests of skill
selection and policy adherence, including paired simplicity/boundary cases. Structural
tests cannot prove an agent will select or follow a skill. Exercise the scenarios with
the actual target host/model and configuration, including Terra/Luna/Sol where used;
record loading failures separately from design failures and repeat representative cases.
