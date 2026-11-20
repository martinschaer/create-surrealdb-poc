#!/bin/sh
# Re-vendor skills from surrealdb/agent-skills. Run before publishing.
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
git clone -q --depth 1 https://github.com/surrealdb/agent-skills.git "$tmp"
rm -rf skills && mkdir skills
for s in surrealql surrealql-functions surrealql-performance surrealdb-cli surrealdb-docs surrealdb-js surrealdb-python; do
  cp -R "$tmp/skills/$s" skills/
done
rm -rf "$tmp"
