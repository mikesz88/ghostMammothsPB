import { MembershipMarketingFaqBlock } from "@/components/membership/membership-marketing-faq-block";
import { MEMBERSHIP_MARKETING_FAQ_ITEMS } from "@/lib/membership/membership-marketing-faq-copy";

export function MembershipMarketingFaqSection() {
  return (
    <div className="max-w-3xl mx-auto mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {MEMBERSHIP_MARKETING_FAQ_ITEMS.map((item) => (
          <MembershipMarketingFaqBlock
            key={item.question}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  );
}
