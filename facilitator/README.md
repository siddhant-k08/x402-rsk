# Facilitator

Transaction verification service for Rootstock payments.

## Setup

```bash
npm install
```

Create `.env`:
```env
ROOTSTOCK_RPC=https://rpc.testnet.rootstock.io/<YOUR_API_KEY>
MIN_CONFIRMATIONS=1
```

Get API key from [rpc.rootstock.io](https://rpc.rootstock.io/)

## Run

```bash
npm start
```

Runs on `http://localhost:4001`

## Endpoints

- `POST /verify` - Verify transaction
- `GET /health` - Health check

## Verification

Checks:
1. Transaction exists and succeeded
2. Recipient matches
3. Amount is sufficient
4. Confirmations meet minimum
