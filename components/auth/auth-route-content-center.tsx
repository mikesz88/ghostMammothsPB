import type { ReactNode } from "react";

export function AuthRouteContentCenter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
