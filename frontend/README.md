# Frontend

React web interface for x402 payments with MetaMask.

## Setup

```bash
npm install
```

Create `.env`:
```env
VITE_MERCHANT_API_URL=http://localhost:4000
VITE_ROOTSTOCK_RPC=https://rpc.testnet.rootstock.io/<YOUR_API_KEY>
```

Get API key from [rpc.rootstock.io](https://rpc.rootstock.io/)

## Run

```bash
npm run dev
```

Open `http://localhost:3000`

## Tech Stack

- React 18 + Vite
- Wagmi + Viem (Web3)
- TailwindCSS
- Axios

## Usage

1. Connect MetaMask
2. Switch to Rootstock Testnet (Chain ID 31)
3. Click "Start Order"
4. Click "Pay" and confirm
5. Wait ~30 seconds
6. See order confirmation


## Troubleshooting

| Issue | Solution |
|-------|----------|
| MetaMask not detected | Install MetaMask extension |
| Wrong network | Click "Switch to Rootstock Testnet" |
| Transaction failed | Check tRBTC balance |
| Payment not confirmed | Wait 30-60 seconds |
