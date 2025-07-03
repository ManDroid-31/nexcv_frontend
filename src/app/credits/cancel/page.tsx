"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreditCancelPage() {
  const router = useRouter();

  useEffect(() => {
    toast.error('Payment was cancelled or failed');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/60">
      {/* Header */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl tracking-tight text-primary">NexCV</span>
            <span className="hidden md:inline text-muted-foreground font-medium text-sm ml-2">AI Resume Builder</span>
          </div>
        </div>
      </nav>

      {/* Cancel Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Payment Cancelled
            </CardTitle>
            <p className="text-muted-foreground">
              Your payment was cancelled or failed. No charges were made to your account.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* What happened */}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">What happened?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• You cancelled the payment process</li>
                <li>• There was an issue with your payment method</li>
                <li>• The payment session expired</li>
                <li>• There was a technical error</li>
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
                onClick={() => router.push('/')}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                If you believe this was an error, please contact our support team.
                <br />
                Your account and credits remain unchanged.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 