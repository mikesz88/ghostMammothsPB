import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routesToCheck = [
  // Public
  { path: "/", name: "Home" },
  { path: "/login", name: "Login" },
  { path: "/signup", name: "Signup" },
  { path: "/events", name: "Events" },
  { path: "/about", name: "About" },
  { path: "/calendar", name: "Calendar" },
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

for (const { path, name } of routesToCheck) {
  test(`${name} (${path}) has no critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

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
