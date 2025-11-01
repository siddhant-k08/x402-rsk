# 🚀 Quick Setup Guide

Follow these steps to get the x402 payment system running in under 5 minutes!

## Step 1: Install Dependencies

```bash
# From the root directory
npm run install-all
```

Or manually:
```bash
cd merchant-api && npm install && cd ..
cd facilitator && npm install && cd ..
cd client-demo && npm install && cd ..
cd frontend && npm install && cd ..
```

## Step 2: Get Testnet Funds

1. **Install MetaMask** (if not already installed)
   - Visit: https://metamask.io/

2. **Add Rootstock Testnet to MetaMask**
   - Network Name: `Rootstock Testnet`
   - RPC URL: `https://public-node.testnet.rsk.co`
   - Chain ID: `31`
   - Currency Symbol: `tRBTC`
   - Block Explorer: `https://explorer.testnet.rsk.co`

3. **Get Test tRBTC**
   - Visit: https://faucet.rootstock.io/
   - Enter your wallet address
   - Wait for confirmation (usually < 5 minutes)

## Step 3: Configure Environment

### Create merchant-api/.env
```bash
cd merchant-api
cp .env.example .env
```

Edit `merchant-api/.env`:
```env
PORT=4000
MERCHANT_ADDRESS=0xYourMerchantWalletAddress  # ← Change this
PAYMENT_AMOUNT=0.0001
FACILITATOR_URL=http://localhost:4001
```

### Create facilitator/.env
```bash
cd facilitator
cp .env.example .env
```

Edit `facilitator/.env`:
```env
PORT=4001
ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
MIN_CONFIRMATIONS=1
```

### Create frontend/.env
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_MERCHANT_API_URL=http://localhost:4000
VITE_ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
```

### (Optional) Create client-demo/.env
Only needed if you want to test with CLI:

```bash
cd client-demo
cp .env.example .env
```

Edit `client-demo/.env`:
```env
ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
WALLET_PRIVATE_KEY=0xYourBuyerPrivateKey  # ← Change this
MERCHANT_API_URL=http://localhost:4000
```

## Step 4: Start Services

Open **3 separate terminal windows**:

### Terminal 1: Facilitator
```bash
cd facilitator
npm start
```

You should see:
```
🔐 x402 Facilitator running on http://localhost:4001
🌐 Network: Rootstock Testnet
✅ Connected to Rootstock successfully
```

### Terminal 2: Merchant API
```bash
cd merchant-api
npm start
```

You should see:
```
🚀 x402 Merchant API running on http://localhost:4000
📍 Merchant Address: 0x...
💰 Payment Amount: 0.0001 tRBTC
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3000/
```

## Step 5: Test the System

### Option A: Web Interface (Recommended)

1. Open browser to **http://localhost:3000**
2. Click **"Connect MetaMask"**
3. Approve the connection
4. Ensure you're on **Rootstock Testnet** (chain ID 31)
5. Click **"Order Groceries"**
6. Review payment details
7. Click **"Pay"** and confirm in MetaMask
8. Wait ~30 seconds for confirmation
9. See your order confirmation! 🎉

### Option B: CLI Testing

In a 4th terminal:
```bash
cd client-demo
npm start
```

The CLI will automatically:
- Request order (receive 402)
- Send payment transaction
- Wait for confirmation
- Retry with payment proof
- Display order details

## Step 6: Verify Everything Works

### Check Facilitator Health
```bash
curl http://localhost:4001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "x402-facilitator",
  "network": "rootstock-testnet",
  "currentBlock": 5234567,
  "rpc": "https://public-node.testnet.rsk.co"
}
```

### Check Merchant API Health
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "x402-merchant-api",
  "merchant": "0x..."
}
```

### Test 402 Response
```bash
curl -X POST http://localhost:4000/api/order-groceries
```

Expected response (402 status):
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

## 🎉 Success!

Your x402 payment system is now running! You can:

- **Test payments** via the web interface
- **Monitor logs** in each terminal
- **View transactions** on https://explorer.testnet.rsk.co/
- **Customize** payment amounts and behavior

## 🐛 Troubleshooting

### "Cannot connect to Rootstock RPC"
- Check your internet connection
- Try alternative RPC: `https://public-node.testnet.rsk.co`
- Wait a few minutes and retry

### "Wallet balance is 0"
- Visit https://faucet.rootstock.io/
- Request testnet tRBTC
- Wait 5-10 minutes for confirmation

### "MetaMask not connecting"
- Ensure MetaMask is installed
- Add Rootstock Testnet manually
- Refresh the page

### "Transaction not found"
- Wait 30-60 seconds for mining
- Check transaction on explorer
- Retry the request

### "Port already in use"
- Change port in .env file
- Or stop the conflicting process

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Explore the code in each module
- Customize payment amounts
- Add your own features
- Deploy to production (see README for considerations)

## 💡 Tips

- Keep all 3 services running while testing
- Check terminal logs for detailed information
- Use the block explorer to verify transactions
- Start with small payment amounts for testing

---

**Need help?** Check the main README.md or open an issue on GitHub.
