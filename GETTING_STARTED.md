# 🚀 Getting Started with x402 Payment Starter Kit

Welcome! This guide will get you up and running in **5 minutes**.

## 🎯 What You're Building

A complete payment system where users pay with cryptocurrency (tRBTC) to access your API. Think of it as "pay-per-request" using blockchain.

## 📺 Quick Demo Flow

1. User clicks "Order Groceries" 
2. System says "Payment Required: 0.0001 tRBTC"
3. User pays with MetaMask
4. System verifies payment on blockchain
5. User gets their order! 🎉

## ⚡ 5-Minute Setup

### Step 1: Install Everything (2 minutes)

```bash
cd x402

# Install all dependencies at once
cd merchant-api && npm install && cd ..
cd facilitator && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 2: Get Test Money (2 minutes)

1. Install [MetaMask](https://metamask.io/) if you don't have it
2. Add Rootstock Testnet to MetaMask:
   - Network: `Rootstock Testnet`
   - RPC: `https://public-node.testnet.rsk.co`
   - Chain ID: `31`
   - Symbol: `tRBTC`
3. Get free test money: https://faucet.rootstock.io/
4. Wait ~5 minutes for confirmation

### Step 3: Configure (1 minute)

**merchant-api/.env:**
```bash
cd merchant-api
cp .env.example .env
# Edit .env and set your wallet address as MERCHANT_ADDRESS
```

**facilitator/.env:**
```bash
cd facilitator
cp .env.example .env
# Default settings work fine!
```

**frontend/.env:**
```bash
cd frontend
cp .env.example .env
# Default settings work fine!
```

### Step 4: Start Services (30 seconds)

Open **3 terminals** and run:

```bash
# Terminal 1
cd facilitator && npm start

# Terminal 2  
cd merchant-api && npm start

# Terminal 3
cd frontend && npm run dev
```

### Step 5: Test It! (30 seconds)

1. Open http://localhost:3000
2. Click "Connect MetaMask"
3. Click "Order Groceries"
4. Click "Pay" and confirm in MetaMask
5. Wait ~30 seconds
6. See your order confirmation! 🎉

## 🎓 What Just Happened?

```
You (Browser)
    ↓
    1. Request order → Merchant API
    ↓
    2. "402 Payment Required" ← Merchant API
    ↓
    3. Send 0.0001 tRBTC → Rootstock Blockchain
    ↓
    4. Request order + txHash → Merchant API
    ↓
    5. Verify transaction → Facilitator → Blockchain
    ↓
    6. "Order Confirmed!" ← Merchant API
```

## 📚 Next Steps

### Learn More
- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup guide  
- **ARCHITECTURE.md** - How it works
- **CHECKLIST.md** - Verify everything works

### Customize
- Change payment amount in `merchant-api/.env`
- Modify order items in `merchant-api/index.js`
- Customize UI in `frontend/src/`

### Test More
- Use CLI: `cd client-demo && npm start`
- Run test script: `./test-flow.sh`
- Check explorer: https://explorer.testnet.rsk.co/

## 🐛 Quick Troubleshooting

**"MetaMask not connecting"**
- Make sure you're on Rootstock Testnet (chain ID 31)
- Refresh the page

**"Balance is 0"**
- Visit https://faucet.rootstock.io/
- Wait 5-10 minutes

**"Services won't start"**
- Check if ports 4000, 4001, 3000 are free
- Make sure Node.js v18+ is installed

**"Payment not confirming"**
- Wait 30-60 seconds for blockchain confirmation
- Check transaction on explorer

## 💡 Pro Tips

- Keep all 3 terminal windows visible to see logs
- Use small amounts for testing (0.0001 tRBTC)
- Check the block explorer to verify transactions
- Read the logs - they tell you what's happening!

## 🎉 You're Ready!

You now have a working cryptocurrency payment system! 

**What can you build with this?**
- Pay-per-API services
- Content paywalls
- Micro-transactions
- Subscription services
- And much more!

## 📞 Need Help?

1. Check **CHECKLIST.md** for detailed verification
2. Read **README.md** for full documentation
3. Review **TROUBLESHOOTING** section in README
4. Check terminal logs for errors

---

**Happy Building!** 🚀

Built with ❤️ for Rootstock | Powered by Bitcoin Security
