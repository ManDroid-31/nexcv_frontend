"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CheckCircle, ArrowLeft, Receipt, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCredits } from '@/hooks/use-credits';
import { toast } from 'sonner';
import { CreditBalance } from '@/components/CreditBalance';
import type { CreditTransaction } from '@/hooks/use-credits';
import React, { Suspense } from 'react';

function CreditSuccessPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { fetchBalance, fetchHistory, history } = useCredits();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<CreditTransaction | null>(null);
  const [noTransaction, setNoTransaction] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const initializePage = async () => {
      try {
        // Get URL parameters
        const sessionId = searchParams?.get('session_id');

        // Refresh user's credit balance and history
        await fetchBalance();
        await fetchHistory();

        // Wait a bit for backend to update (in case of delay)
        timeout = setTimeout(async () => {
          await fetchHistory();
        }, 1500);

        // Try to find the transaction by sessionId if available
        let foundTx: CreditTransaction | undefined;
        if (sessionId && history && history.length > 0) {
          foundTx = history.find(tx => tx.sessionId && tx.sessionId === sessionId);
        }

        if (foundTx) {
          setTransaction(foundTx);
          toast.success(`Successfully purchased ${foundTx.amount} credits!`);
        } else if (history && history.length > 0) {
          // If no sessionId match, use the latest positive transaction within the last 5 minutes
          const now = Date.now();
          const latest = history.find(tx => tx.amount > 0 && now - new Date(tx.createdAt).getTime() < 5 * 60 * 1000);
          if (latest) {
            setTransaction(latest);
            toast.success(`Successfully purchased ${latest.amount} credits!`);
          } else {
            setNoTransaction(true);
          }
        } else {
          setNoTransaction(true);
        }
      } catch (error) {
        console.error('Error initializing success page:', error);
        toast.error('Error loading payment details');
        setNoTransaction(true);
      } finally {
        setLoading(false);
        if (timeout) clearTimeout(timeout);
      }
    };

    initializePage();
  }, [searchParams, fetchBalance, fetchHistory, history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/60 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  // Get session_id from URL for fallback logic
  const sessionId = searchParams?.get('session_id');

  // If no transaction found, but session_id is present, show payment success (test mode)
  if ((noTransaction || !transaction) && sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/60 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-muted/80 rounded-xl shadow-lg border border-border p-8 text-center">
          {/* TEST MODE WARNING */}
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <span>Heads up: Since Manas doesn&apos;t have a business account yet, we&apos;re using a test environment.<br />Payments and credits are mocked — no real transactions will occur.</span>
          </div>
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful (Test Mode)</h2>
          <p className="text-muted-foreground mb-4">
            Your payment was processed successfully.<br />
            <span className="font-semibold">However, since this is a test environment, no credits have been added to your account.</span>
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push('/credits/transactions')} className="w-full">
            <Calendar className="w-4 h-4 mr-2" /> View Transaction History
          </Button>
        </div>
      </div>
    );
  }

  // If no transaction and no session_id, show the original 'No Transaction Found' message
  if (noTransaction || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/60 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-muted/80 rounded-xl shadow-lg border border-border p-8 text-center">
          {/* TEST MODE WARNING */}
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <span>Heads up: Since Manas doesn&apos;t have a business account yet, we&apos;re using a test environment.<br />Payments and credits are mocked — no real transactions will occur.</span>
          </div>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">No Transaction Found</h2>
          <p className="text-muted-foreground mb-4">
            No recent credit purchase transaction was found for your account.<br />
            If you believe this is an error, please check your transaction history or contact support.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push('/credits/transactions')} className="w-full">
            <Calendar className="w-4 h-4 mr-2" /> View Transaction History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/60">
      {/* Header */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl tracking-tight text-primary">NexCV</span>
            <span className="hidden md:inline text-muted-foreground font-medium text-sm ml-2">AI Resume Builder</span>
          </div>
          <CreditBalance />
        </div>
      </nav>

      {/* Success Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Card className="border-0 shadow-xl">
          {/* TEST MODE WARNING */}
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold text-center flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <span>Heads up: Since Manas doesn&apos;t have a business account yet, we&apos;re using a test environment.<br />Payments and credits are mocked — no real transactions will occur.</span>
          </div>
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground">
              Thank you for your payment! This is a test account, so no credits have been added.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Payment Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits Purchased:</span>
                  <span className="font-semibold">{transaction.amount} credits</span>
                </div>
                {transaction.price && transaction.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold">₹{((transaction.price) / 100).toFixed(2)}</span>
                  </div>
                )}
                {transaction.sessionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {transaction.sessionId.slice(-8)}...
                    </span>
                  </div>
                )}
                {transaction.id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {transaction.id.slice(-8)}...
                    </span>
                  </div>
                )}
                {transaction.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium text-sm">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {transaction.status === 'success' ? 'Completed' : (transaction.status || 'Completed')}
                  </span>
                </div>
              </div>
            </div>
            {/* User Info */}
            {user && (
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Account Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.emailAddresses[0]?.emailAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{user.fullName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Current Credits */}
            <div className="bg-muted/50 rounded-lg p-6 flex items-center gap-4">
              <span className="font-semibold">Current Balance:</span>
              <CreditBalance />
            </div>
            {/* What you can do now */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">What you can do now:</h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li>• Use AI features to enhance your resume</li>
                <li>• Import your profile from LinkedIn (7 credits)</li>
                <li>• Access premium templates</li>
                <li>• Get AI-powered suggestions for improvements</li>
              </ul>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/credits/transactions')}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Transaction History
              </Button>
            </div>
            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                You can now use your credits for AI features and premium templates.
                <br />
                A receipt has been sent to your email address.
                <br />
                <span className="text-xs">Credits never expire and can be used anytime.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreditSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreditSuccessPageInner />
    </Suspense>
  );
} 