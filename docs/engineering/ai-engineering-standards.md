# AI Engineering Standards

This project uses three layers of enforcement to keep generated and human-written code aligned with the architecture.

## 1. `rules.mdc`

Defines the hard rules for code generation and modification.

## 2. Cursor enforcement prompt

Defines how AI should reason before producing code.

## 3. PR checklist

Defines what must be true before code is merged.

## 4. Commit convention

Keeps repo history clear, intentional, and reviewable.

## Standard

The goal is not just code that works.

The goal is code that:

* fits the architecture
* preserves system boundaries
* maintains single ownership of state
* respects tenant, token, and RLS boundaries
* is reviewable by an experienced engineer

## Expected engineering behavior

* Prefer server-first architecture
* Keep UI thin
* Put business logic in services
* Treat the database as the source of truth
* Use token context carefully
* Keep external systems out of hot paths
* Refactor touched messy code when needed
* Reduce complexity wherever possible
