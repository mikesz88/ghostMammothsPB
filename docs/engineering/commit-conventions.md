# Commit Convention

## Format

<type>(scope): <clear description>

[optional body]

---

## Allowed Types

* feat: new feature
* fix: bug fix
* refactor: structural improvement without behavior change
* perf: performance improvement
* chore: non-functional work (deps, config, cleanup)
* docs: documentation only

---

## Rules

* Describe what changed and where
* Keep the subject line clear and specific
* Use scope when it adds clarity
* Do not use vague commits like:

  * fix bug
  * update code
  * stuff
  * wip

---

## Examples

feat(queue): add court assignment rotation logic

fix(token-flow): restrict invoice query to token-scoped access

refactor(service): extract matchmaking logic into queue service

perf(api): reduce redundant DB calls in event assignment

chore(db): add index for projectId on notes table

docs(rules): add token-flow and RLS guidance

---

## When to Add a Body

Add a body when:

* architecture changed
* tradeoffs were made
* the change is not obvious from the title alone

Example:

refactor(auth): move session validation into service layer

Moves validation out of route handlers to ensure consistent enforcement
across API routes and server actions.
