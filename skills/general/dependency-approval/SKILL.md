---
name: dependency-approval
description: Obtain user approval before adding any runtime, development, or build dependency in any language. Use during design and planning when recommending a new dependency, and before changing dependency declarations or implementing code that requires it.
user-invocable: false
---

# Dependency Approval

## Policy

Obtain explicit user approval before adding a new dependency. This applies to
packages, crates, libraries, vendored third-party code, and build/test tooling
introduced as project dependencies. Changing the acquisition mechanism does not
avoid the requirement.

A preferred-library catalog is a recommendation, not permission to install.
Do not modify dependency declarations or implement code requiring the proposed
dependency until the user approves it.

## Procedure

1. Inspect the standard library, platform facilities, and existing dependencies.
2. Identify the capability needed and why existing facilities are insufficient.
3. Recommend a suitable dependency. Explain its integration boundary and material
   maintenance, licensing, security, portability, footprint, and build tradeoffs.
4. Mention realistic alternatives briefly. Do not invent a safe local alternative
   where none exists, particularly for cryptography or security protocols.
5. Ask for approval and wait before adding or relying on the dependency.
6. Record the selected dependency and material rationale in the existing project
   decision or plan artifact. Do not create a separate workflow or duplicate records.

An explicit user request naming the dependency, or a user-approved plan explicitly
selecting it, satisfies approval. Generic approval to implement a feature does not.
Do not ask again for the same approved selection and scope.

## Scope

- Reusing a dependency already approved for the affected package and purpose does
  not require another approval. A dependency in an unrelated workspace member does
  not automatically authorize adding it to another member.
- Approval covers the package's normal transitive dependencies; do not ask for
  individual approval of every transitive package.
- Surface material changes such as enabling native code, external services, or
  substantially different platform/build requirements for renewed approval.
- This skill does not establish a blanket approval rule for routine version
  upgrades. Follow the user's request and repository upgrade policy; flag material
  changes and risks rather than assuming an unrelated feature authorizes upgrades.
- Researching documentation or comparing options does not require dependency
  approval. Tool execution remains subject to the host's permissions.
- This policy does not require approval for every local implementation. However,
  lack of dependency approval is not permission to silently handroll a proposed
  library replacement. Present the unresolved choice to the user instead.

## Examples and Checks

- **Preferred but absent:** A language skill recommends a serialization library.
  Recommend it and obtain approval; do not treat its listing as pre-approval.
- **Already selected:** The user approves a plan naming the library. Implement
  that selection without asking again.
- **Unavailable approval:** Keep the dependent design decision open. Do not add
  the package provisionally or bypass the gate by vendoring it.

Before completion, compare dependency declaration changes with recorded approvals.
Explain any unapproved change rather than claiming compliance based solely on a
passing build. Lockfile churn alone is not proof of a new direct dependency.
