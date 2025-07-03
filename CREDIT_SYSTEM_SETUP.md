# Credit System Setup Guide

## Overview
The credit system has been fully integrated with your backend. All API endpoints now proxy requests to your backend server.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Backend API Configuration
BACKEND_URL=http://localhost:3001

# Optional: Stripe Configuration (if you want to handle payments on frontend)
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Backend Integration

The frontend now proxies all credit-related requests to your backend:

### API Endpoints
- `GET /api/credits/pricing` → `${BACKEND_URL}/api/credits/pricing`
- `GET /api/credits/balance` → `${BACKEND_URL}/api/credits/balance`
- `GET /api/credits/history` → `${BACKEND_URL}/api/credits/history`
- `POST /api/credits/purchase` → `${BACKEND_URL}/api/credits/purchase`

### Authentication
All authenticated endpoints forward the `x-clerk-user-id` header to your backend.

## New Features Added

### 1. Credit Purchase Modal
- Reusable component for buying credits
- Available at `/src/components/credit-purchase-modal.tsx`
- Used in dashboard and landing page

### 2. Success/Cancel Pages
- `/credits/success` - Handles successful Stripe payments
- `/credits/cancel` - Handles cancelled/failed payments

### 3. Updated Components
- Dashboard now shows credit balance and purchase button
- Landing page has new pricing section with credit purchase modal
- All credit displays use real backend data

## Usage

### In Components
```tsx
import { CreditPurchaseModal } from '@/components/credit-purchase-modal';

// Basic usage
<CreditPurchaseModal />

// With custom trigger
<CreditPurchaseModal 
  trigger={<Button>Buy Credits</Button>}
  onSuccess={() => console.log('Purchase successful')}
/>
```

### Credit Hooks
```tsx
import { useCredits } from '@/hooks/use-credits';

const { balance, pricing, buyCredits } = useCredits();
```

## Stripe Integration

The system expects your backend to:
1. Create Stripe checkout sessions
2. Handle webhooks for payment confirmation
3. Update user credit balance after successful payment

### Expected Backend Response
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

## Testing

1. Set `BACKEND_URL` to your backend server
2. Test credit balance display in dashboard
3. Test credit purchase flow
4. Verify Stripe redirects work correctly

## Error Handling

All endpoints now properly handle and forward backend errors. Users will see meaningful error messages if:
- Backend is unavailable
- Authentication fails
- Payment processing fails
- Invalid credit amounts

## Next Steps

1. Ensure your backend is running and accessible
2. Test the credit purchase flow end-to-end
3. Verify Stripe webhooks are working
4. Monitor credit balance updates 