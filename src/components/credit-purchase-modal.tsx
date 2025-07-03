"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, Zap, Crown, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface CreditPurchaseModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

// Type for a credit package (from backend)
type CreditPackage = {
  credits: number;
  price: number;
};

// Helper to get icon for a package
function getPackageIcon(credits: number) {
  if (credits >= 100) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (credits >= 50) return <Sparkles className="w-6 h-6 text-blue-500" />;
  if (credits >= 25) return <Zap className="w-6 h-6 text-green-500" />;
  return <CreditCard className="w-6 h-6 text-gray-500" />;
}

export function CreditPurchaseModal({ trigger, onSuccess }: CreditPurchaseModalProps) {
  const { pricing, loading: pricingLoading, error: pricingError, buyCredits } = useCredits();
  const [open, setOpen] = useState(false);
  const [buying, setBuying] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [spinner, setSpinner] = useState(false);

  // Find the most popular plan (e.g., 50 credits)
  const mostPopular = pricing?.packages?.find((pkg: CreditPackage) => pkg.credits === 50);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleBuy = async (credits: number) => {
    setBuying(credits);
    setSpinner(true);
    setErrorMsg(null);
    try {
      const response = await buyCredits(credits);
      if (response.url) {
        // Try to open in new tab first (for popup blockers)
        const newTab = window.open(response.url, '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
          // If popup blocked, fallback to redirect
          window.location.href = response.url;
        }
        setOpen(false);
        onSuccess?.();
      } else if (response.session_id) {
        // If backend provides session_id, credits, amount, redirect to success page
        window.location.href = `/credits/success?session_id=${response.session_id}&credits=${credits}&amount=${response.amount ?? ''}`;
        setOpen(false);
        onSuccess?.();
      } else {
        setErrorMsg('No Stripe session URL returned. Please try again.');
      }
    } catch (err: unknown) {
      let message = 'Failed to start checkout. Please try again.';
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        message = (err as { message: string }).message;
      }
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSpinner(false);
      setBuying(null);
    }
  };

  const modalContent = open && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-900 shadow-2xl rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        tabIndex={-1}
        aria-label="Credit purchase dialog"
      >
        {/* Spinner overlay */}
        {spinner && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
          </div>
        )}
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <CardHeader className="text-center mb-6 p-0">
            <CardTitle className="text-2xl md:text-3xl font-bold mb-2">Choose Your Credit Package</CardTitle>
            <p className="text-muted-foreground text-sm md:text-base">
              More credits = better value. Each AI request costs 1 credit,
              <br className="hidden sm:block" />
              LinkedIn import costs 7 credits.
            </p>
          </CardHeader>
          {/* Error Message */}
          {errorMsg && <div className="text-center text-red-500 mb-4">{errorMsg}</div>}
          {/* Loading/Error State */}
          {pricingLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : pricingError ? (
            <div className="text-center py-6 text-red-500">{pricingError}</div>
          ) : pricing && pricing.packages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {pricing.packages.map((pkg: CreditPackage) => {
                const isPopular = mostPopular && pkg.credits === mostPopular.credits;
                return (
                  <Card
                    key={pkg.credits}
                    className={`relative rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl
                      ${isPopular ? "border-primary scale-105 ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10" : "border-muted bg-background hover:border-primary/50"}
                    `}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm px-3 py-1 shadow-lg">
                        Most Popular
                      </Badge>
                    )}
                    {/* Priority badge for 100+ credits */}
                    {pkg.credits >= 100 && (
                      <Badge className="absolute -top-3 right-4 bg-yellow-500 text-yellow-900 text-sm px-3 py-1 shadow-lg">
                        Priority
                      </Badge>
                    )}
                    <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-4">
                      <div className="p-3 rounded-full bg-primary/10">{getPackageIcon(pkg.credits)}</div>
                      <CardTitle className="text-xl font-bold text-center">{pkg.credits} Credits</CardTitle>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">₹{(pkg.price / 100).toFixed(0)}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{(pricing.pricePerCredit / 100).toFixed(2)} per credit
                        </div>
                      </div>
                      {pkg.credits >= 100 && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                          Includes Priority Support
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <Button
                        onClick={() => handleBuy(pkg.credits)}
                        disabled={buying === pkg.credits || spinner}
                        className={`w-full py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                          isPopular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                            : "hover:shadow-md"
                        }`}
                        size="lg"
                        aria-label={`Buy ${pkg.credits} credits`}
                      >
                        {buying === pkg.credits || spinner ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          `Buy ${pkg.credits} Credits`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No credit packages available at the moment.
            </div>
          )}
          {/* Additional info */}
          <div className="border-t pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Secure Stripe Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span>Instant Credit Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>No Expiry, Use Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="cursor-pointer" onClick={() => { setOpen(false); window.location.href = '/credits/transactions'; }}>
                View Transaction History
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline">
          Buy Credits
        </Button>
      )}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
} 