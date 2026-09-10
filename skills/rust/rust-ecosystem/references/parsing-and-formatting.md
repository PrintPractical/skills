# Parsing and Formatting

Choose according to grammar, diagnostics, streaming needs, canonical output,
round-tripping, target constraints, and existing repository conventions. Parsing and
formatting are separate capabilities; `nom` is not a general formatting library.

## Parsing

- Prefer an existing format-specific parser for an established format. Do not use
  generic parser combinators to casually recreate JSON, URLs, or protocol codecs.
- For custom grammars, `nom` is a preferred initial parser-combinator candidate.
  Evaluate `winnow` when its API, input model, or repository conventions fit better.
- For source languages with diagnostic/recovery requirements, evaluate `chumsky`
  alongside grammar-oriented options such as `pest` or `lalrpop` as appropriate.
  These have different grammar, generation, recovery, and integration tradeoffs;
  do not assume all support the same requirements equally well.
- Use standard-library parsing for genuinely simple, bounded formats when sufficient.
  Do not declare an evolving grammar trivial merely because its first example is short.

Before choosing, identify representative valid/invalid inputs, ambiguity, source-span
needs, error recovery, incremental/streaming requirements, and resource limits.
Inspect current crate APIs/features and recommend a concrete fit, not a list of names.
Obtain dependency approval before adding the selection.

Parsing can be domain-owned when the source language is the product's domain.
Transport decoding belongs in the adapter. Classify by meaning, not by whether code
operates on text. Keep parsing, name resolution, and semantic validation separately
owned when they are independently meaningful; syntax acceptance is not validation
of every domain invariant.

## Formatting

- Prefer `std::fmt`, `Display`, `write!`, and `format!` for ordinary textual output.
- A small domain-owned AST traversal can suffice for canonical rendering with simple
  fixed layout. Document why a general pretty-printer adds no useful capability.
- Evaluate a document-layout crate such as `pretty` when line width, grouping,
  nesting, and alternative layouts require a real pretty-printing algorithm.
- Use Serde with format-specific libraries for serialization rather than inventing
  escaping, numeric, or encoding rules in handwritten formatters.
- Source-code formatting is different again: use repository-configured `rustfmt`
  for Rust source, not a general domain-output formatting crate.

## Checks and Corrections

- An empty manifest does not justify a handwritten lexer/parser. Compare appropriate
  established options and obtain approval for a new dependency when needed.
- A renderer with fixed separators need not acquire a width-aware layout engine.
  Demonstrate sufficiency and test canonical output instead.
- Test malformed/truncated inputs, boundaries, useful diagnostics, and resource limits.
  Use round-trip and canonicalization properties only when the contract promises them.
- Consider fuzz/property tests for nontrivial untrusted parsing, within the project's
  existing tools and dependency-approval policy.
