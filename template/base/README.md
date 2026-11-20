# {{NAME}}

A SurrealDB proof of concept in {{LANG}}. Replace this paragraph with what you are trying to prove.

## Requirements

- The [`surreal` CLI](https://surrealdb.com/docs/explore/cli/install). Check yours with `surreal version`.
- [SurrealDB Studio](https://surrealdb.com/studio)
- [`just`](https://github.com/casey/just#installation), the command runner (`brew install just`, `cargo install just`, or see its docs)
- {{TOOL}}

## Agent skills (highly recommended)

This repo includes SurrealDB skills from [`surrealdb/agent-skills`](https://github.com/surrealdb/agent-skills) in `.agents/skills/`, linked into `.claude/skills/` and their source commit is recorded in `skills-lock.json`. Without them, agents tend to guess at SurrealQL syntax and design schemas from other databases' habits. Use an agent that loads them (such as Claude Code, which picks them up automatically) whenever you work here.

| Skill | Use it for |
|---|---|
| `surrealql` | Writing and changing queries, schemas, graph relations and live queries |
| `surrealql-functions` | Finding built-in functions and their exact signatures |
| `surrealql-performance` | Record ID design, indexes, `EXPLAIN` and computed fields |
| `surrealdb-cli` | Running `surreal start`, `sql`, `import` and `export` |
| `surrealdb-docs` | Looking up the official documentation |
| `{{SKILL}}` | Using the SurrealDB SDK from {{LANG}} |

The skills work best with the `surreal` CLI and its in-memory engine. An agent can start a throwaway database in seconds, so it can validate its assumptions against a real engine, run tests and benchmark alternatives instead of guessing.

## Try it locally

Connection settings live in `.env`, not in the code. The values in `.env.example` are for a throwaway local server only. Run `just` to list the commands.

1. Create your `.env`:

   ```bash
   cp .env.example .env
   ```

2. Install the SDK:

   ```bash
   just install
   ```

3. Start an in-memory database:

   ```bash
   just db
   ```

4. In another terminal, run the example:

   ```bash
   just run
   ```

5. Stop the server with Ctrl+C. The data is gone, because it only lived in memory.

## Explore it in SurrealDB Studio

[SurrealDB Studio](https://surrealdb.com/studio) runs in the browser or as a desktop app, and can connect to the local server.

1. Open SurrealDB Studio, and create a new connection.
2. Set the endpoint to `http://127.0.0.1:8000`, the authentication to a root user, and the namespace and database, using the values in your `.env`.
3. Connect, then use the schema diagram and the query view.

Some browsers block a web page from reaching `http://` addresses. If the connection fails, use the desktop app.

## Deploy to SurrealDB Earth

When the POC needs to leave your machine, create a serverless [SurrealDB Earth](https://surrealdb.com/cloud) instance from the CLI. The cloud commands are a separate CLI component.

1. Install the component and sign in:

   ```bash
   surreal install cloud
   ```

   Then sign in to SurrealDB Cloud:

   ```bash
   surreal cloud login
   ```

2. Create the instance. Earth has a single region, so `--region earth` is always the same:

   ```bash
   surreal cloud instance create my-poc --region earth
   ```

3. Point the example at the new instance by changing `SURREAL_ENDPOINT`, `SURREAL_USER` and `SURREAL_PASS` in `.env`. Find the endpoint on the instance page in [SurrealDB Cloud](https://surrealdb.com/cloud), or with `surreal cloud instance list`.

Delete the instance when you are done, so it does not use your allowance.
