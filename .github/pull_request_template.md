# Pull Request

## Summary

What changed?

```text
<!-- 1–3 sentences. Be specific. -->
```

Why is it needed?

```text
<!-- Bug fix, feature, cleanup, refactor, etc. -->
```

---

## Type of Change

Check one:

* [ ] Bug fix
* [ ] Feature
* [ ] Refactor / cleanup
* [ ] Docs / config / tooling
* [ ] Other:

---

## Behavior

* [ ] Behavior-preserving
* [ ] Intentional behavior change

If behavior changed, explain:

```text
<!-- What changed for users/admins/devs? -->
```

---

## Architecture Notes

Briefly explain where the main logic lives now.

```text
<!-- Example: Server page fetches initial data → client island handles form state → server action persists changes. -->
```

Call out any important boundaries:

```text
<!-- Server/client split, service layer, DB access, token/auth scope, webhook flow, etc. -->
```

---

## Risk Areas

Check any that apply:

* [ ] Queue / matchmaking logic
* [ ] Notifications / email
* [ ] Stripe / billing / webhooks
* [ ] Auth / permissions
* [ ] RLS / token-scoped access
* [ ] Database schema / migrations
* [ ] Large component or route file
* [ ] None

Notes:

```text
<!-- Anything reviewers should pay extra attention to? -->
```

---

## Verification

Commands run:

```text
<!-- Example:
npm run lint
npm run typecheck
npm run test
npm run pr
-->
```

Manual testing:

```text
<!-- Example:
- joined event queue
- ended game as admin
- verified notification send path
-->
```

---

## Debt / Follow-up

```text
<!-- List known follow-up work, or write "None". -->
```

---

## Reviewer Checklist

Reviewer only:

* [ ] Change matches the summary
* [ ] Behavior change is intentional or absent
* [ ] Logic is in the right layer
* [ ] No obvious new debt added
* [ ] Risk areas were tested or explained
