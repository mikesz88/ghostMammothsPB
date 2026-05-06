/**
 * Client-safe barrel: do not re-export `SiteHeader` here — it imports `next/headers`
 * via Supabase server client and would be pulled into any bundle that imports this path.
 * Server routes/shells: `import { SiteHeader } from "@/components/ui/header/site-header"`.
 */
export { Header } from "./header-client";
export type {
  HeaderProps,
  HeaderServerSnapshot,
} from "./header-client";
