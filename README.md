# @martinschaer/create-surrealdb-poc

Scaffold a SurrealDB proof of concept in TypeScript or Python, with the official SurrealDB agent skills pre-installed.

```bash
npm create @martinschaer/surrealdb-poc
# or
bun create @martinschaer/surrealdb-poc
```

Non-interactive: `npm create @martinschaer/surrealdb-poc my-poc -- --lang py --install`

Flags: `--name`, `--lang ts|py`, `--install`, `--yes`. Without a TTY, prompts are skipped and defaults used.

## Maintaining

`scripts/refresh-skills.sh` re-vendors the skills from `surrealdb/agent-skills`. Run it before `npm publish`.
