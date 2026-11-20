#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const COMMON = ['surrealql', 'surrealql-functions', 'surrealql-performance', 'surrealdb-cli', 'surrealdb-docs'];
const bun = process.env.npm_config_user_agent?.startsWith('bun');
const LANGS = {
  ts: bun
    ? { label: 'TypeScript', tool: '`bun`', skill: 'surrealdb-js', install: ['bun', 'add', 'surrealdb'], run: 'bun run src/index.ts' }
    // Node >= 22.18 runs .ts directly by stripping types.
    : { label: 'TypeScript', tool: '`node` 22.18+', skill: 'surrealdb-js', install: ['npm', 'i', 'surrealdb'], run: 'node src/index.ts' },
  py: { label: 'Python', tool: '`uv`', skill: 'surrealdb-python', install: ['uv', 'add', 'surrealdb'], run: 'uv run main.py' },
};
const yes = o_yes();
function o_yes() { return process.argv.includes('--yes') || process.argv.includes('-y') || !process.stdin.isTTY; }

const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: { name: { type: 'string' }, lang: { type: 'string' }, install: { type: 'boolean' }, yes: { type: 'boolean', short: 'y' } },
});

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async (q, def) => (yes ? def : (await rl.question(`${q} (${def}) `)).trim() || def);

const name = o.name ?? positionals[0] ?? (await ask('Project name?', 'surrealdb-poc'));
const lang = o.lang ?? (await ask('Language? [ts/py]', 'ts'));
if (!LANGS[lang]) { console.error(`Unknown --lang "${lang}" (use ts or py)`); process.exit(1); }
const L = LANGS[lang];
const doInstall = o.install ?? /^y/i.test(await ask('Install the SurrealDB SDK now? [y/n]', 'n'));
rl.close();

const dest = resolve(name);
if (existsSync(dest) && readdirSync(dest).length) { console.error(`${dest} is not empty`); process.exit(1); }
mkdirSync(dest, { recursive: true });

const copy = (from) => cpSync(join(root, 'template', from), dest, { recursive: true });
copy('base'); copy(lang);
renameSync(join(dest, '_gitignore'), join(dest, '.gitignore'));

// Skills live in .agents/skills; .claude/skills symlinks to them (npm tarballs drop symlinks).
mkdirSync(join(dest, '.claude/skills'), { recursive: true });
for (const s of [...COMMON, L.skill]) {
  cpSync(join(root, 'skills', s), join(dest, '.agents/skills', s), { recursive: true });
  try { symlinkSync(`../../.agents/skills/${s}`, join(dest, '.claude/skills', s)); }
  catch { cpSync(join(root, 'skills', s), join(dest, '.claude/skills', s), { recursive: true }); } // Windows without symlink rights
}
// Lock format + hash match the `skills` CLI (sha256 over sorted relpath+content), so `skills update` accepts it.
const hashDir = (dir) => {
  const files = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name).slice(dir.length + 1).split('\\').join('/'))
    .sort((a, b) => a.localeCompare(b));
  const h = createHash('sha256');
  for (const f of files) { h.update(f); h.update(readFileSync(join(dir, f))); }
  return h.digest('hex');
};
const lockSkills = {};
for (const s of [...COMMON, L.skill].sort())
  lockSkills[s] = { source: 'surrealdb/agent-skills', sourceType: 'github', skillPath: `skills/${s}/SKILL.md`, computedHash: hashDir(join(root, 'skills', s)) };
writeFileSync(join(dest, 'skills-lock.json'), JSON.stringify({ version: 1, skills: lockSkills }, null, 2) + '\n');

const vars = { NAME: basename(dest), LANG: L.label, RUN: L.run, SKILL: L.skill, INSTALL: L.install.join(' '), TOOL: L.tool, START: L.run };
const fill = (f) => {
  const p = join(dest, f);
  if (!existsSync(p)) return;
  writeFileSync(p, readFileSync(p, 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k]));
};
['README.md', 'Justfile', 'package.json', 'pyproject.toml'].forEach(fill);

if (doInstall) {
  const [cmd, ...args] = L.install;
  if (spawnSync(cmd, args, { cwd: dest, stdio: 'inherit' }).status !== 0)
    console.error(`"${L.install.join(' ')}" failed; run it yourself in ${dest}`);
}
console.log(`\nCreated ${dest}\n  cd ${name}\n  see README.md`);
