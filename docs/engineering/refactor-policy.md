# Refactor Policy

This codebase is in a transition state.

The architecture standards in `rules.mdc` define the target state for the repository.
They are enforced gradually rather than retroactively across the entire codebase at once.

## Current enforcement model

* New code should follow the current standards
* Touched code should be improved when reasonably adjacent to the requested change
* Existing legacy structure may remain temporarily if refactoring it would create excessive scope

## Expectations

When modifying existing code:

1. Do not make the structure worse
2. Improve naming when it is obviously weak
3. Extract repeated logic when it is clearly adjacent
4. Avoid introducing new business logic into weak layers
5. Prefer moving toward services, smaller components, and clearer ownership over time

## Rule for legacy areas

Legacy code may remain until it is practical to refactor, but new changes must move the codebase toward the target architecture rather than away from it.
