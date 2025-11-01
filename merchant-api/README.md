# Merchant API

Express.js API implementing the 402 Payment Required pattern.

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
PORT=4000
MERCHANT_ADDRESS=0xYourMerchantWalletAddress
PAYMENT_AMOUNT=0.0001
FACILITATOR_URL=http://localhost:4001
```

## Running

```bash
npm start
```

## API Endpoints

### POST /api/order-groceries

Main endpoint implementing 402 pattern.

**Without payment:**
```bash
curl -X POST http://localhost:4000/api/order-groceries
```

Response (402):
```json
{
  "payment_required": {
    "chain": "rootstock-testnet",
    "recipient": "0x...",
    "amount_tRBTC": "0.0001",
    "facilitator": "http://localhost:4001/verify"
  }
}
```

**With payment:**
```bash
curl -X POST http://localhost:4000/api/order-groceries \
  -H "X-PAYMENT: {\"txHash\": \"0x...\"}"
```

Response (200):
```json
{
  "message": "Payment received, order confirmed!",
  "order": {
    "id": "ORDER-1234567890",
    "items": ["Apples", "Bananas", "Oranges", "Milk", "Bread"],
    "status": "confirmed",
    "txHash": "0x...",
    "confirmations": 2
  }
}
```

### GET /health

Health check endpoint.

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "service": "x402-merchant-api",
  "merchant": "0x..."
}
```
