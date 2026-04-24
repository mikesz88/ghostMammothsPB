Before finalizing this change:

0. If this PR **touches a route or adds client UI**, does it follow [`phase-1-rsc-conventions.md`](phase-1-rsc-conventions.md) (server `page.tsx`, leaf components under the right `components/{events,admin/events,settings,auth,membership}/`)?
1. Is logic in the correct layer?
2. Is business logic separated from UI?
3. Is data flow clear and traceable?
4. Is state ownership correct?
5. Did I reduce complexity?
6. Would this pass the PR checklist?
7. If this touches a cleanup hotspot or is a refactor, does it follow `docs/engineering/cleanup/` (especially the two-dev agreement when applicable)?
8. If this isn’t an intentional policy change, did I avoid loosening `eslint.config.mjs` or `tsconfig.json`? (See `docs/engineering/LINT_POLICY_LOCK.md`.)
9. For phased refactors: is the team backlog in `docs/engineering/refactor-inventory.md` still accurate, or should you run `npm run inventory:phase0` and update priorities?

If not, fix it before committing.
