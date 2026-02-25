import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility tests run WCAG 2.x Level A & AA, WCAG 2.2, and best-practice
 * rules so the build fails if the dev forgets common a11y requirements
 * (e.g. nested interactive, contrast, labels, focus, headings).
 * Manual review and periodic audits (e.g. PowerMapper, screen reader testing)
 * are still recommended for compliance and lawsuit risk mitigation.
 */

test.setTimeout(60_000);

const routesToCheck = [
  // Public
  { path: "/", name: "Home" },
  { path: "/login", name: "Login" },
  { path: "/signup", name: "Signup" },
  { path: "/events", name: "Events" },
  { path: "/about", name: "About" },
  { path: "/calendar", name: "Calendar" },
  { path: "/sitemap", name: "Sitemap" },
  // Membership (including pre-Stripe checkout and post-payment)
  { path: "/membership", name: "Membership" },
  { path: "/membership/checkout", name: "Membership Checkout (pre-Stripe)" },
  { path: "/membership/success", name: "Membership Success" },
  { path: "/membership/cancel", name: "Membership Cancel" },
  // Settings
  { path: "/settings", name: "Settings" },
  { path: "/settings/membership", name: "Settings Membership" },
  { path: "/settings/notifications", name: "Settings Notifications" },
  // Admin (may redirect to login if unauthenticated)
  { path: "/admin", name: "Admin" },
  { path: "/admin/users", name: "Admin Users" },
  { path: "/admin/email-stats", name: "Admin Email Stats" },
  // Dynamic routes – use a placeholder id; replace with a real id if you have test data
  { path: "/events/test", name: "Event detail" },
  { path: "/admin/events/test", name: "Admin Event detail" },
  { path: "/admin/users/test", name: "Admin User detail" },
];

/** All tags we care about: WCAG 2.0/2.1/2.2 A & AA + best-practice (catches nested-interactive, etc.) */
const a11yTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22a",
  "wcag22aa",
  "best-practice",
];

async function gotoAndWaitForReady(
  page: import("@playwright/test").Page,
  path: string,
  maxAttempts = 3
) {
  const msg = (e: Error) => String(e.message);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto(path, {
        waitUntil: "commit",
        timeout: 20_000,
      });
      await page.waitForSelector("#main-content", {
        state: "visible",
        timeout: 20_000,
      });
      return;
    } catch (e) {
      const err = e as Error;
      const aborted =
        msg(err).includes("ERR_ABORTED") || msg(err).includes("frame was detached");
      if (aborted) {
        const main = await page.locator("#main-content").first();
        const visible = await main.isVisible().catch(() => false);
        if (visible) return;
      }
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1_500));
        continue;
      }
      throw e;
    }
  }
}

for (const { path, name } of routesToCheck) {
  test(`${name} (${path}) has no accessibility violations`, async ({
    page,
  }) => {
    await gotoAndWaitForReady(page, path);

    const builder = new AxeBuilder({ page }).withTags(a11yTags);
    // Calendar embeds Google Calendar iframe; we don't control its DOM (target-size, etc.).
    if (path === "/calendar") {
      builder.exclude(["iframe"]).disableRules(["target-size"]);
    }
    const results = await builder.analyze();

    const violations = results.violations;

    if (violations.length > 0) {
      const report = violations
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.help}\n  ${v.nodes.length} node(s) affected.`
        )
        .join("\n\n");
      expect(violations, `A11y violations on ${path}:\n\n${report}`).toHaveLength(
        0
      );
    }
  });
}
