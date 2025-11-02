# Merchant API

Express API implementing HTTP 402 Payment Required pattern.

## Setup

```bash
npm install
```

Create `.env`:
```env
MERCHANT_ADDRESS=0xYourMerchantWalletAddress
PAYMENT_AMOUNT=0.0001
FACILITATOR_URL=http://localhost:4001
```

## Run

```bash
npm start
```

Runs on `http://localhost:4000`

## Endpoints

- `POST /api/order-groceries` - Main 402 endpoint
- `GET /health` - Health check
