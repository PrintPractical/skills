import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = {
  general: ['architecture-guidance', 'dependency-approval', 'dependency-source-research'],
  'spec-driven-development': ['preserve-implementation-intent'],
  rust: ['rust-practices', 'rust-ecosystem'],
  c: ['c-practices'],
  cpp: ['cpp-practices'],
};
const names = new Set(Object.values(catalog).flat());

test('catalog contains exactly the intended categories and skills', async () => {
  assert.deepEqual((await readdir(path.join(root, 'skills'))).sort(),
    Object.keys(catalog).sort());
  for (const [category, skills] of Object.entries(catalog)) {
    assert.deepEqual((await readdir(path.join(root, 'skills', category))).sort(),
      [...skills].sort());
  }
  assert.equal(names.size, 8);
});

for (const [category, skills] of Object.entries(catalog)) {
  for (const name of skills) {
    test(`${name}: metadata, content, links, and skill references`, async () => {
      const directory = path.join(root, 'skills', category, name);
      const text = await readFile(path.join(directory, 'SKILL.md'), 'utf8');
      const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
      assert.ok(frontmatter, 'requires opening YAML frontmatter');
      // This catalog deliberately uses simple, single-line scalar frontmatter.
      const fields = Object.fromEntries(frontmatter[1].split('\n').map(line => {
        const match = line.match(/^([a-z-]+): (.+)$/);
        assert.ok(match, `unsupported frontmatter shape: ${line}`);
        return [match[1], match[2]];
      }));
      assert.deepEqual(Object.keys(fields).sort(),
        ['name', 'description', 'user-invocable'].sort());
      assert.equal(fields.name, name);
      assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
      assert.ok(name.length <= 64);
      assert.ok(fields.description.length > 0 && fields.description.length <= 1024);
      assert.equal(fields['user-invocable'], 'false');
      assert.ok(text.split('\n').length < 500, 'keep skill bodies concise');
      assert.match(text.slice(frontmatter[0].length), /^\n?# /);
      assert.doesNotMatch(text, /[^\x00-\x7f]/, 'use ASCII source text');

      for (const file of await readdir(directory, { recursive: true })) {
        if (!file.endsWith('.md')) continue;
        const source = path.join(directory, file);
        const markdown = await readFile(source, 'utf8');
        assert.doesNotMatch(markdown, /[^\x00-\x7f]/, `use ASCII source text: ${file}`);
        for (const [, target] of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
          assert.ok(!target.includes('://'), 'bundle skill references locally');
          const resolved = path.resolve(path.dirname(source), target);
          assert.ok(resolved.startsWith(directory + path.sep),
            `reference must stay inside independently installable skill: ${file}: ${target}`);
          assert.ok((await stat(resolved)).isFile(), `missing reference: ${file}: ${target}`);
        }
        for (const [, reference] of markdown.matchAll(
          /`((?:rust|cpp|c)-[a-z-]+|architecture-guidance|dependency-approval|dependency-source-research|preserve-implementation-intent)`/g,
        )) {
          assert.ok(names.has(reference), `unknown named skill: ${file}: ${reference}`);
        }
      }
    });
  }
}
