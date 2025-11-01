# ✅ x402 Setup Checklist

Use this checklist to ensure everything is configured correctly.

## 📋 Pre-Setup

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MetaMask browser extension installed
- [ ] Git installed (optional, for cloning)

## 🔧 Installation

- [ ] Navigate to project directory: `cd x402`
- [ ] Install merchant-api: `cd merchant-api && npm install && cd ..`
- [ ] Install facilitator: `cd facilitator && npm install && cd ..`
- [ ] Install client-demo: `cd client-demo && npm install && cd ..`
- [ ] Install frontend: `cd frontend && npm install && cd ..`

**Or use**: `npm run install-all` from root

## 🌐 Rootstock Testnet Setup

### MetaMask Configuration
- [ ] Open MetaMask
- [ ] Click network dropdown
- [ ] Click "Add Network" → "Add network manually"
- [ ] Enter network details:
  - Network Name: `Rootstock Testnet`
  - RPC URL: `https://public-node.testnet.rsk.co`
  - Chain ID: `31`
  - Currency Symbol: `tRBTC`
  - Block Explorer: `https://explorer.testnet.rsk.co`
- [ ] Click "Save"
- [ ] Switch to Rootstock Testnet

### Get Test Funds
- [ ] Copy your wallet address from MetaMask
- [ ] Visit https://faucet.rootstock.io/
- [ ] Paste your address
- [ ] Complete CAPTCHA
- [ ] Click "Get tRBTC"
- [ ] Wait 5-10 minutes for confirmation
- [ ] Verify balance in MetaMask (should show ~0.05 tRBTC)

### Create Merchant Wallet (Optional)
- [ ] Create a second MetaMask account for merchant
- [ ] Copy merchant address
- [ ] Save for configuration

## ⚙️ Configuration

### merchant-api/.env
- [ ] Copy template: `cd merchant-api && cp .env.example .env`
- [ ] Edit `.env` file
- [ ] Set `MERCHANT_ADDRESS` to your merchant wallet address
- [ ] Set `PAYMENT_AMOUNT` (default: 0.0001)
- [ ] Set `FACILITATOR_URL` (default: http://localhost:4001)
- [ ] Save file

### facilitator/.env
- [ ] Copy template: `cd facilitator && cp .env.example .env`
- [ ] Edit `.env` file
- [ ] Set `ROOTSTOCK_RPC` (default: https://public-node.testnet.rsk.co)
- [ ] Set `MIN_CONFIRMATIONS` (default: 1)
- [ ] Save file

### frontend/.env
- [ ] Copy template: `cd frontend && cp .env.example .env`
- [ ] Edit `.env` file
- [ ] Set `VITE_MERCHANT_API_URL` (default: http://localhost:4000)
- [ ] Set `VITE_ROOTSTOCK_RPC` (default: https://public-node.testnet.rsk.co)
- [ ] Save file

### client-demo/.env (Optional - for CLI testing)
- [ ] Copy template: `cd client-demo && cp .env.example .env`
- [ ] Edit `.env` file
- [ ] Set `WALLET_PRIVATE_KEY` (your buyer wallet private key)
  - ⚠️ **WARNING**: Never share or commit this!
- [ ] Set `MERCHANT_API_URL` (default: http://localhost:4000)
- [ ] Save file

## 🚀 Starting Services

### Terminal 1: Facilitator
- [ ] Open new terminal
- [ ] Navigate: `cd facilitator`
- [ ] Start: `npm start`
- [ ] Verify output shows:
  - ✅ "x402 Facilitator running on http://localhost:4001"
  - ✅ "Connected to Rootstock successfully"
  - ✅ Current block number displayed

### Terminal 2: Merchant API
- [ ] Open new terminal
- [ ] Navigate: `cd merchant-api`
- [ ] Start: `npm start`
- [ ] Verify output shows:
  - ✅ "x402 Merchant API running on http://localhost:4000"
  - ✅ Merchant address displayed
  - ✅ Payment amount displayed

### Terminal 3: Frontend
- [ ] Open new terminal
- [ ] Navigate: `cd frontend`
- [ ] Start: `npm run dev`
- [ ] Verify output shows:
  - ✅ "VITE ready"
  - ✅ "Local: http://localhost:3000"
- [ ] Browser should open automatically

## 🧪 Testing

### Health Checks
- [ ] Test facilitator: `curl http://localhost:4001/health`
  - Should return JSON with status "ok"
- [ ] Test merchant API: `curl http://localhost:4000/health`
  - Should return JSON with status "ok"

### 402 Response Test
- [ ] Run: `curl -X POST http://localhost:4000/api/order-groceries`
- [ ] Verify response:
  - ✅ HTTP status 402
  - ✅ Contains `payment_required` object
  - ✅ Shows recipient address
  - ✅ Shows amount (0.0001 tRBTC)

### Web Interface Test
- [ ] Open browser to http://localhost:3000
- [ ] Verify page loads with "x402 Payment Demo" title
- [ ] Click "Connect MetaMask"
- [ ] Approve connection in MetaMask popup
- [ ] Verify wallet address shown
- [ ] Verify "Rootstock Testnet" badge visible
- [ ] Click "Order Groceries"
- [ ] Verify payment details displayed:
  - ✅ Chain: rootstock-testnet
  - ✅ Amount: 0.0001 tRBTC
  - ✅ Recipient address shown
- [ ] Click "Pay" button
- [ ] Confirm transaction in MetaMask
- [ ] Wait for "Processing Payment..." message
- [ ] Verify success message appears
- [ ] Verify order details shown:
  - ✅ Order ID
  - ✅ Items list
  - ✅ Status: confirmed
  - ✅ Transaction hash link

### CLI Test (Optional)
- [ ] Open new terminal
- [ ] Navigate: `cd client-demo`
- [ ] Run: `npm start`
- [ ] Verify output shows:
  - ✅ Wallet address
  - ✅ Balance
  - ✅ 402 response received
  - ✅ Payment transaction sent
  - ✅ Transaction hash
  - ✅ Order confirmed
  - ✅ Order details

### Explorer Verification
- [ ] Copy transaction hash from success message
- [ ] Visit https://explorer.testnet.rsk.co/
- [ ] Paste transaction hash in search
- [ ] Verify transaction details:
  - ✅ Status: Success
  - ✅ From: Your wallet
  - ✅ To: Merchant address
  - ✅ Value: 0.0001 tRBTC

## 🐛 Troubleshooting

### Services Won't Start
- [ ] Check if ports are available (4000, 4001, 3000)
- [ ] Kill existing processes: `lsof -ti:4000 | xargs kill -9`
- [ ] Check Node.js version: `node --version` (should be v18+)
- [ ] Reinstall dependencies: `rm -rf node_modules && npm install`

### MetaMask Issues
- [ ] Verify MetaMask is unlocked
- [ ] Verify on Rootstock Testnet (chain ID 31)
- [ ] Try disconnecting and reconnecting
- [ ] Clear MetaMask activity data (Settings → Advanced → Clear activity)
- [ ] Refresh browser page

### Transaction Issues
- [ ] Verify wallet has tRBTC balance
- [ ] Check transaction on explorer
- [ ] Wait 30-60 seconds for mining
- [ ] Increase gas limit in MetaMask
- [ ] Try with different wallet

### API Errors
- [ ] Check all services are running
- [ ] Verify .env files are configured
- [ ] Check terminal logs for errors
- [ ] Test health endpoints
- [ ] Verify CORS settings

### Facilitator Errors
- [ ] Check Rootstock RPC is accessible
- [ ] Try alternative RPC endpoint
- [ ] Verify transaction hash is correct
- [ ] Check network connectivity
- [ ] Increase MIN_CONFIRMATIONS

## 📊 Success Criteria

You've successfully set up the system when:

- ✅ All 3 services start without errors
- ✅ Health checks return "ok"
- ✅ 402 response received for unpaid requests
- ✅ MetaMask connects to frontend
- ✅ Payment transaction sends successfully
- ✅ Order confirmation received
- ✅ Transaction visible on explorer

## 🎉 Next Steps

Once everything is working:

- [ ] Read the main README.md for detailed documentation
- [ ] Explore the code in each module
- [ ] Try customizing payment amounts
- [ ] Experiment with different order items
- [ ] Add your own features
- [ ] Deploy to production (see README for considerations)

## 📚 Additional Resources

- [ ] Main README: `./README.md`
- [ ] Setup Guide: `./SETUP.md`
- [ ] Architecture: `./ARCHITECTURE.md`
- [ ] Project Summary: `./PROJECT_SUMMARY.md`
- [ ] Test Script: `./test-flow.sh`

## 💡 Pro Tips

- Keep all terminal windows visible for monitoring logs
- Use the block explorer to verify all transactions
- Start with small payment amounts for testing
- Check terminal logs when debugging issues
- Save your merchant address for future use
- Back up your .env files (but never commit them!)

---

**Need Help?**

- Check the troubleshooting section above
- Review the main README.md
- Check terminal logs for error messages
- Verify all configuration files
- Ensure services are running in correct order

**Ready to Go?** Start with Terminal 1 (Facilitator) and work your way through! 🚀
