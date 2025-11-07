"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Trophy, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/ui/header";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/membership-helpers";
import { PENDING_MEMBERSHIP_TIER_STORAGE_KEY } from "@/lib/constants";

interface MembershipTier {
  id: string;
  name: string;
  display_name: string;
  price: number;
  billing_period: string;
  description: string | null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skillLevel: "intermediate",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tierError, setTierError] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [successTierId, setSuccessTierId] = useState<string | null>(null);

  const selectedTier =
    tiers.find((tier) => tier.id === (successTierId ?? selectedTierId)) || null;
  const tierParam = searchParams.get("tier");
  const checkoutTierId = successTierId ?? selectedTierId;
  const canContinueToCheckout = Boolean(checkoutTierId);
  const noAvailablePlans = !tiersLoading && tiers.length === 0;
  const isSubmitDisabled =
    loading || tiersLoading || !selectedTierId || noAvailablePlans;
  const flowParam = searchParams.get("flow");

  useEffect(() => {
    const loadTiers = async () => {
      setTiersLoading(true);
      setTierError(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("membership_tiers")
          .select(
            "id, name, display_name, price, billing_period, description, sort_order"
          )
          .eq("is_active", true)
          .gt("price", 0)
          .order("sort_order");

        if (error) {
          console.error("Error loading membership tiers:", error);
          setTierError("Unable to load membership plans. Please try again later.");
          setTiers([]);
          setSelectedTierId("");
          return;
        }

        const tierList = (data as MembershipTier[]) || [];
        setTiers(tierList);

        if (tierParam && tierList.some((tier) => tier.id === tierParam)) {
          setSelectedTierId(tierParam);
        } else {
          setSelectedTierId(tierList[0]?.id || "");
        }
      } catch (err) {
        console.error("Unexpected error loading tiers:", err);
        setTierError("Unable to load membership plans. Please try again later.");
        setTiers([]);
        setSelectedTierId("");
      } finally {
        setTiersLoading(false);
      }
    };

    void loadTiers();
  }, [tierParam]);

  useEffect(() => {
    if (flowParam === "confirm-email") {
      let tierFromQuery = tierParam || "";

      if (!tierFromQuery && typeof window !== "undefined") {
        tierFromQuery =
          window.localStorage.getItem(
            PENDING_MEMBERSHIP_TIER_STORAGE_KEY
          ) || "";
      }

      setSuccess(true);

      if (tierFromQuery) {
        setSuccessTierId(tierFromQuery);
        setSelectedTierId((prev) => prev || tierFromQuery);
      }
    }
  }, [flowParam, tierParam]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ADD PASSWORD VALIDATION
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (tiersLoading) {
      setError("Membership plans are still loading. Please try again in a moment.");
      setLoading(false);
      return;
    }

    if (!selectedTierId) {
      setError("Please choose a membership plan to continue.");
      setLoading(false);
      return;
    }

    if (noAvailablePlans) {
      setError("Membership plans are not available right now. Please contact support.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        skillLevel: formData.skillLevel,
        phone: formData.phone || undefined,
      });

      if (error) {
        setError(error.message);
      } else {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            PENDING_MEMBERSHIP_TIER_STORAGE_KEY,
            selectedTierId
          );
        }
        setSuccessTierId(selectedTierId);
        setSuccess(true);
        // Don't auto-redirect - let user read the confirmation message
        // They'll need to check their email if confirmation is required
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Verify Your Email to Activate Membership
                </h2>
                <p className="text-muted-foreground mb-4">
                  Your account is almost ready. Check your inbox to confirm your
                  email address, then finish checkout to unlock full access.
                </p>
                {selectedTier && (
                  <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4 text-left space-y-1">
                    <p className="text-sm text-muted-foreground">Selected plan</p>
                    <p className="font-semibold text-foreground">
                      {selectedTier.display_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(selectedTier.price)} /
                      {selectedTier.billing_period === "annual"
                        ? "year"
                        : selectedTier.billing_period}
                    </p>
                    {selectedTier.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTier.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() =>
                      canContinueToCheckout &&
                      router.push(`/membership/checkout?tier=${checkoutTierId}`)
                    }
                    disabled={!canContinueToCheckout}
                  >
                    Continue to Payment
                  </Button>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/login">Return to Login</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Create Account</CardTitle>
              <CardDescription>
                Join the Ghost Mammoths pickleball community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill">Skill Level</Label>
                  <Select
                    value={formData.skillLevel}
                    onValueChange={(value) =>
                      handleInputChange("skillLevel", value)
                    }
                  >
                    <SelectTrigger id="skill">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipTier">Membership Plan</Label>
                  {tiersLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading membership plans...
                    </div>
                  ) : tiers.length > 0 ? (
                    <>
                      <Select
                        value={selectedTierId || undefined}
                        onValueChange={(value) => setSelectedTierId(value)}
                      >
                        <SelectTrigger id="membershipTier">
                          <SelectValue placeholder="Select your membership" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiers.map((tier) => {
                            const billingLabel =
                              tier.billing_period === "annual"
                                ? "year"
                                : tier.billing_period;
                            return (
                              <SelectItem key={tier.id} value={tier.id}>
                                {tier.display_name} • {formatPrice(tier.price)} /
                                {" "}
                                {billingLabel}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {selectedTier?.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedTier.description}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      No paid membership plans are available right now. Please
                      contact support.
                    </div>
                  )}
                  {tierError && (
                    <p className="text-sm text-destructive">{tierError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitDisabled}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account & Continue to Payment"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
