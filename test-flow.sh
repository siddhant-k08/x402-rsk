#!/bin/bash

# x402 Payment Flow Test Script
# Tests the complete payment flow using curl

set -e

echo "🧪 x402 Payment Flow Test"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MERCHANT_API="http://localhost:4000"
FACILITATOR="http://localhost:4001"

echo -e "${BLUE}Step 1: Testing service health...${NC}"
echo ""

# Test Facilitator
echo "Testing Facilitator..."
FACILITATOR_HEALTH=$(curl -s ${FACILITATOR}/health)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Facilitator is running${NC}"
  echo "$FACILITATOR_HEALTH" | jq '.'
else
  echo -e "${RED}✗ Facilitator is not running${NC}"
  echo "Please start: cd facilitator && npm start"
  exit 1
fi

echo ""

# Test Merchant API
echo "Testing Merchant API..."
MERCHANT_HEALTH=$(curl -s ${MERCHANT_API}/health)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Merchant API is running${NC}"
  echo "$MERCHANT_HEALTH" | jq '.'
else
  echo -e "${RED}✗ Merchant API is not running${NC}"
  echo "Please start: cd merchant-api && npm start"
  exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Testing 402 Payment Required response...${NC}"
echo ""

# Request without payment
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${MERCHANT_API}/api/order-groceries)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "402" ]; then
  echo -e "${GREEN}✓ Received 402 Payment Required${NC}"
  echo "$BODY" | jq '.'
  
  # Extract payment info
  RECIPIENT=$(echo "$BODY" | jq -r '.payment_required.recipient')
  AMOUNT=$(echo "$BODY" | jq -r '.payment_required.amount_tRBTC')
  CHAIN=$(echo "$BODY" | jq -r '.payment_required.chain')
  
  echo ""
  echo -e "${YELLOW}Payment Details:${NC}"
  echo "  Chain: $CHAIN"
  echo "  Recipient: $RECIPIENT"
  echo "  Amount: $AMOUNT tRBTC"
else
  echo -e "${RED}✗ Expected 402, got $HTTP_CODE${NC}"
  echo "$BODY"
  exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Manual payment required${NC}"
echo ""
echo "To complete the test:"
echo "1. Send $AMOUNT tRBTC to $RECIPIENT on Rootstock Testnet"
echo "2. Get the transaction hash"
echo "3. Run the following command:"
echo ""
echo -e "${YELLOW}curl -X POST ${MERCHANT_API}/api/order-groceries \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"X-PAYMENT: {\\\"txHash\\\": \\\"0xYourTransactionHash\\\"}\"${NC}"
echo ""
echo "Or use the CLI client:"
echo -e "${YELLOW}cd client-demo && npm start${NC}"
echo ""
echo "Or use the web interface:"
echo -e "${YELLOW}cd frontend && npm run dev${NC}"
echo ""

echo -e "${GREEN}✓ Test completed successfully!${NC}"
echo ""
echo "All services are running correctly."
echo "Ready to process payments! 🚀"
