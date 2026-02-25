This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Accessibility (a11y) compliance

The project is set up to catch common accessibility issues so the site stays compliant and reduces legal risk.

- **Lint (runs on `npm run build`):** ESLint with **strict** jsx-a11y rules. Catches missing labels, invalid ARIA, interactive elements without keyboard support, and similar issues in JSX.
- **E2E a11y tests (`npm run test:a11y`):** Playwright + axe-core run on every route. Rules include **WCAG 2.0/2.1/2.2 Level A & AA** and **best-practice** (e.g. nested interactive, contrast, focus, headings). Any violation fails the run.
- **CI:** `npm run ci` runs lint, build, and a11y tests; fix any reported violations before merging.

For stronger assurance, still do periodic manual audits (e.g. PowerMapper, WAVE, screen reader testing) and resolve any findings.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
