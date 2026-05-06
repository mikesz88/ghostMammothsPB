import { Trophy } from "lucide-react";

export function SignupVerifyEmailMessage() {
  return (
    <>
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trophy className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Verify Your Email
      </h2>
      <p className="text-muted-foreground mb-4">
        Your account is almost ready. Check your inbox to confirm your email
        address. Once confirmed, you can log in and join queues on-site.
      </p>
    </>
  );
}
