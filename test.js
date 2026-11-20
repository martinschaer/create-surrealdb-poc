import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert';

for (const [lang, manifest, skill] of [['ts', 'package.json', 'surrealdb-js'], ['py', 'pyproject.toml', 'surrealdb-python']]) {
  const dir = join(mkdtempSync(join(tmpdir(), 'poc-')), `app-${lang}`);
  const r = spawnSync('node', ['index.js', dir, '--lang', lang, '--yes'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  for (const f of [manifest, '.gitignore', 'Justfile', '.env.example', 'README.md', 'skills-lock.json', `.agents/skills/${skill}/SKILL.md`, `.claude/skills/${skill}/SKILL.md`])
    assert(existsSync(join(dir, f)), `${lang}: missing ${f}`);
  assert(lstatSync(join(dir, '.claude/skills/surrealql')).isSymbolicLink());
  for (const f of ['README.md', 'Justfile']) assert(!/\{\{[A-Z]+\}\}/.test(readFileSync(join(dir, f), 'utf8')), `unfilled placeholder in ${f}`);
  const other = lang === 'ts' ? 'surrealdb-python' : 'surrealdb-js';
  assert(!existsSync(join(dir, '.agents/skills', other)), `${lang}: leaked ${other}`);
}
console.log('ok');
