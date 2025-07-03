"use client";
import { useCredits } from "@/hooks/use-credits";

export function CreditBalance() {
  const { balance, loading: balanceLoading } = useCredits();
  return (
    <span className="bg-muted px-3 py-1 rounded-full text-sm font-semibold">
      {balanceLoading ? "Loading credits..." : `${balance ?? 0} credits`}
    </span>
  );
}
