import { LoginFormPrimaryFields } from "@/components/auth/login-form-primary-fields";
import { Button } from "@/components/ui/button";

import type { UseLoginFormReturn } from "@/lib/hooks/use-login-form";

type Props = {
  f: UseLoginFormReturn;
};

export function LoginFormFields({ f }: Props) {
  return (
    <form onSubmit={f.onSubmit} className="space-y-4">
      <LoginFormPrimaryFields f={f} />
      <Button type="submit" className="w-full" disabled={f.loading}>
        {f.loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}

