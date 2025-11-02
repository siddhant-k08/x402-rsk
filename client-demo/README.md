# Client Demo

CLI tool for testing x402 payment flow.

## Setup

```bash
npm install
```

Create `.env`:
```env
ROOTSTOCK_RPC=https://rpc.testnet.rootstock.io/<YOUR_API_KEY>
WALLET_PRIVATE_KEY=0xYourPrivateKey
MERCHANT_API_URL=http://localhost:4000
```

Get API key from [rpc.rootstock.io](https://rpc.rootstock.io/)

⚠️ **Never commit private keys!**

## Run

```bash
npm start
```

## Flow

1. Check wallet balance
2. Request order (get 402)
3. Send payment transaction
4. Wait for confirmation
5. Submit payment proof
6. Display order confirmation

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Private key not configured | Add to `.env` file |
| Balance is 0 | Get tRBTC from [faucet.rootstock.io](https://faucet.rootstock.io/) |
| API connection error | Start merchant-api first |
| Transaction not found | Wait 30-60 seconds |
