# Facilitator (Payment Verifier)

Service for verifying Rootstock Testnet transactions.

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
PORT=4001
ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
MIN_CONFIRMATIONS=1
```

## Running

```bash
npm start
```

## API Endpoints

### POST /verify

Verify a payment transaction.

**Request:**
```bash
curl -X POST http://localhost:4001/verify \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x...",
    "recipient": "0x...",
    "amount": "0.0001"
  }'
```

**Success Response:**
```json
{
  "valid": true,
  "confirmations": 2,
  "transaction": {
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "value": "0.0001",
    "blockNumber": 5234567,
    "timestamp": null
  }
}
```

**Failure Response:**
```json
{
  "valid": false,
  "reason": "Wrong recipient. Expected 0x..., got 0x..."
}
```

### GET /health

Health check with network status.

```bash
curl http://localhost:4001/health
```

Response:
```json
{
  "status": "ok",
  "service": "x402-facilitator",
  "network": "rootstock-testnet",
  "currentBlock": 5234567,
  "rpc": "https://public-node.testnet.rsk.co"
}
```

## Verification Logic

The facilitator checks:

1. **Transaction exists** on Rootstock Testnet
2. **Transaction succeeded** (status = 1)
3. **Recipient matches** expected address
4. **Amount is sufficient** (>= expected amount)
5. **Confirmations meet minimum** (default: 1)

All checks must pass for `valid: true`.
