#!/bin/bash

# Script to check Stripe API setup and provide guidance

# Print banner
echo "====================================================="
echo "         Checking Stripe Integration Setup           "
echo "====================================================="

# Check for .env file
if [ ! -f ".env" ]; then
  echo "❌ No .env file found. Please create one from .env.example first."
  exit 1
fi

# Check for Stripe secret key in server environment
if grep -q "STRIPE_SECRET_KEY=" .env; then
  STRIPE_SECRET_KEY=$(grep "STRIPE_SECRET_KEY=" .env | cut -d '=' -f2)
  
  if [[ $STRIPE_SECRET_KEY == sk_test_* ]]; then
    echo "✅ Stripe secret key found (Test mode)"
  elif [[ $STRIPE_SECRET_KEY == sk_live_* ]]; then
    echo "✅ Stripe secret key found (Live mode)"
  else
    echo "❌ Stripe secret key doesn't match expected format"
    echo "   Expected: sk_test_* or sk_live_*"
    echo "   Found: $STRIPE_SECRET_KEY"
  fi
else
  echo "❌ Stripe secret key not found in .env file"
fi

# Check for Stripe publishable key in client environment
if grep -q "VITE_STRIPE_PUBLIC_KEY=" .env; then
  VITE_STRIPE_PUBLIC_KEY=$(grep "VITE_STRIPE_PUBLIC_KEY=" .env | cut -d '=' -f2)
  
  if [[ $VITE_STRIPE_PUBLIC_KEY == pk_test_* ]]; then
    echo "✅ Stripe publishable key found (Test mode)"
  elif [[ $VITE_STRIPE_PUBLIC_KEY == pk_live_* ]]; then
    echo "✅ Stripe publishable key found (Live mode)"
  else
    echo "❌ Stripe publishable key doesn't match expected format"
    echo "   Expected: pk_test_* or pk_live_*"
    echo "   Found: $VITE_STRIPE_PUBLIC_KEY"
  fi
else
  echo "❌ Stripe publishable key not found in .env file"
fi

# Check for mode consistency
if grep -q "STRIPE_SECRET_KEY=sk_test_" .env && grep -q "VITE_STRIPE_PUBLIC_KEY=pk_test_" .env; then
  echo "✅ Stripe keys are both in test mode (recommended for development)"
elif grep -q "STRIPE_SECRET_KEY=sk_live_" .env && grep -q "VITE_STRIPE_PUBLIC_KEY=pk_live_" .env; then
  echo "✅ Stripe keys are both in live mode (for production use)"
elif grep -q "STRIPE_SECRET_KEY=sk_" .env && grep -q "VITE_STRIPE_PUBLIC_KEY=pk_" .env; then
  echo "❌ Warning: Stripe keys have inconsistent modes (one is test, one is live)"
  echo "   This will cause payment processing errors"
fi

# Provide instructions for missing or invalid keys
if ! grep -q "STRIPE_SECRET_KEY=sk_" .env || ! grep -q "VITE_STRIPE_PUBLIC_KEY=pk_" .env; then
  echo ""
  echo "====================================================="
  echo "          Stripe Integration Instructions            "
  echo "====================================================="
  echo ""
  echo "To set up Stripe integration, you need to:"
  echo ""
  echo "1. Create a Stripe account at https://stripe.com"
  echo "2. Go to Developers > API keys in your Stripe Dashboard"
  echo "3. Get your API keys:"
  echo "   - Secret key (starts with sk_)"
  echo "   - Publishable key (starts with pk_)"
  echo ""
  echo "4. Add these keys to your .env file:"
  echo "   STRIPE_SECRET_KEY=sk_test_your_secret_key"
  echo "   VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key"
  echo ""
  echo "For testing, use the following test card information:"
  echo "   Card number: 4242 4242 4242 4242"
  echo "   Expiry: Any future date (e.g., 12/25)"
  echo "   CVC: Any 3 digits (e.g., 123)"
  echo "   ZIP: Any 5 digits (e.g., 12345)"
  echo ""
  echo "For comprehensive documentation, visit: https://stripe.com/docs"
fi

echo "====================================================="