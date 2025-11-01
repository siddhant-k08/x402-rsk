# 🚀 x402 Payment Starter Kit - Rootstock Testnet

A complete implementation of the **402 Payment Required** HTTP status code pattern for cryptocurrency payments on Rootstock Testnet. This starter kit demonstrates how to build a payment-gated API with native tRBTC (Test Rootstock Bitcoin) payments.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Module Details](#module-details)
- [Testing Flow](#testing-flow)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

The x402 protocol implements HTTP 402 "Payment Required" to gate API access behind cryptocurrency payments. When a client requests a protected resource without payment:

1. **Server returns 402** with payment details (recipient address, amount, chain)
2. **Client sends payment** on-chain (native tRBTC transfer)
3. **Client retries request** with payment proof (transaction hash)
4. **Facilitator verifies** the transaction on Rootstock
5. **Server grants access** if payment is valid

### Why Rootstock?

- **Bitcoin-secured**: Rootstock is merge-mined with Bitcoin, inheriting its security
- **EVM-compatible**: Use familiar Ethereum tools (Ethers.js, MetaMask, Wagmi)
- **Low fees**: Testnet transactions are free; mainnet fees are minimal
- **Native payments**: Simple tRBTC transfers, no token contracts needed

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │ (Frontend/CLI)
│  (Buyer)    │
└──────┬──────┘
       │
       │ 1. POST /api/order-groceries
       │    (no payment)
       ▼
┌─────────────┐
│  Merchant   │
│     API     │ ◄──── Returns 402 with payment details
└──────┬──────┘
       │
       │ 2. Send tRBTC transaction
       │    on Rootstock Testnet
       ▼
┌─────────────┐
│  Rootstock  │
│  Blockchain │
└──────┬──────┘
       │
       │ 3. POST /api/order-groceries
       │    X-PAYMENT: {"txHash": "0x..."}
       ▼
┌─────────────┐      ┌─────────────┐
│  Merchant   │─────▶│ Facilitator │
│     API     │      │  (Verifier) │
└─────────────┘      └──────┬──────┘
       │                    │
       │                    │ Verify transaction:
       │                    │ - Correct recipient?
       │                    │ - Sufficient amount?
       │                    │ - Confirmed on-chain?
       │                    │
       │◄───────────────────┘
       │
       ▼
   200 OK - Order confirmed!
```

## 📁 Project Structure

```
x402/
├── merchant-api/          # Express API with 402 pattern
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── facilitator/           # Transaction verification service
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── client-demo/           # CLI testing tool
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── frontend/              # React web app with MetaMask
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── OrderGroceries.jsx
│   │   └── lib/
│   │       └── wagmiConfig.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── .env.example           # Root environment template
├── .gitignore
└── README.md
```

## ✅ Prerequisites

### Required Software

- **Node.js** v18+ and npm
- **MetaMask** browser extension (for frontend testing)
- **Git** (for cloning)

### Rootstock Testnet Setup

1. **Add Rootstock Testnet to MetaMask**:
   - Network Name: `Rootstock Testnet`
   - RPC URL: `https://public-node.testnet.rsk.co`
   - Chain ID: `31`
   - Currency Symbol: `tRBTC`
   - Block Explorer: `https://explorer.testnet.rsk.co`

2. **Get Test tRBTC**:
   - Visit [https://faucet.rootstock.io/](https://faucet.rootstock.io/)
   - Enter your wallet address
   - Receive 0.05 tRBTC (usually within minutes)

3. **Create Test Wallets**:
   - **Merchant wallet**: For receiving payments
   - **Buyer wallet**: For sending payments (needs tRBTC from faucet)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
cd x402

# Install dependencies for all modules
cd merchant-api && npm install && cd ..
cd facilitator && npm install && cd ..
cd client-demo && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure Environment Variables

Create `.env` files in each module directory:

#### merchant-api/.env
```env
PORT=4000
MERCHANT_ADDRESS=0xYourMerchantWalletAddress
PAYMENT_AMOUNT=0.0001
FACILITATOR_URL=http://localhost:4001
```

#### facilitator/.env
```env
PORT=4001
ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
MIN_CONFIRMATIONS=1
```

#### client-demo/.env
```env
ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
WALLET_PRIVATE_KEY=0xYourBuyerPrivateKey
MERCHANT_API_URL=http://localhost:4000
```

#### frontend/.env
```env
VITE_MERCHANT_API_URL=http://localhost:4000
VITE_ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
```

### 3. Start Services

Open **three separate terminals**:

**Terminal 1 - Facilitator:**
```bash
cd facilitator
npm start
```

**Terminal 2 - Merchant API:**
```bash
cd merchant-api
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Test the Flow

#### Option A: Web Interface (Recommended)

1. Open browser to `http://localhost:3000`
2. Click "Connect MetaMask"
3. Ensure you're on Rootstock Testnet
4. Click "Order Groceries"
5. Review payment details
6. Click "Pay" and confirm in MetaMask
7. Wait for confirmation (~30 seconds)
8. See order confirmation!

#### Option B: CLI Testing

```bash
cd client-demo
npm start
```

The CLI will:
- Request order (receive 402)
- Send payment transaction
- Retry with payment proof
- Display order confirmation

## 📦 Module Details

### 1. merchant-api

**Purpose**: Implements the 402 Payment Required pattern

**Key Features**:
- Returns 402 with payment details when no payment provided
- Validates X-PAYMENT header with transaction hash
- Calls facilitator to verify payments
- Returns 200 with order details on successful payment

**Endpoints**:
- `GET /health` - Health check
- `POST /api/order-groceries` - Main order endpoint

**Tech Stack**: Express, Axios, dotenv

### 2. facilitator

**Purpose**: Verifies Rootstock transactions independently

**Key Features**:
- Connects to Rootstock Testnet RPC
- Fetches transaction and receipt data
- Validates recipient address
- Checks payment amount (must be >= expected)
- Verifies confirmations (configurable minimum)
- Returns detailed verification results

**Endpoints**:
- `GET /health` - Health check with network status
- `POST /verify` - Verify transaction

**Tech Stack**: Express, Ethers.js v6, dotenv

### 3. client-demo

**Purpose**: CLI tool for programmatic testing

**Key Features**:
- Automated payment flow
- Wallet management with private key
- Transaction sending and monitoring
- Colored console output for clarity
- Error handling and validation

**Usage**: `npm start` (after configuring .env)

**Tech Stack**: Node.js, Axios, Ethers.js, dotenv

### 4. frontend

**Purpose**: User-friendly web interface for payments

**Key Features**:
- MetaMask integration via Wagmi
- Network switching support
- Real-time transaction status
- Beautiful, responsive UI with Tailwind
- Transaction explorer links
- Error handling with retry logic

**Tech Stack**: React, Vite, Wagmi, Viem, TailwindCSS, Axios

## 🧪 Testing Flow

### Complete Test Scenario

1. **Start all services** (facilitator, merchant-api, frontend)

2. **Verify services are running**:
   ```bash
   curl http://localhost:4001/health  # Facilitator
   curl http://localhost:4000/health  # Merchant API
   ```

3. **Test 402 response**:
   ```bash
   curl -X POST http://localhost:4000/api/order-groceries
   ```
   
   Expected response:
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

4. **Send payment** (via frontend or CLI)

5. **Verify payment manually** (optional):
   ```bash
   curl -X POST http://localhost:4001/verify \
     -H "Content-Type: application/json" \
     -d '{
       "txHash": "0x...",
       "recipient": "0x...",
       "amount": "0.0001"
     }'
   ```

6. **Submit order with payment**:
   ```bash
   curl -X POST http://localhost:4000/api/order-groceries \
     -H "X-PAYMENT: {\"txHash\": \"0x...\"}"
   ```

## ⚙️ Configuration

### Payment Amount

Adjust in `merchant-api/.env`:
```env
PAYMENT_AMOUNT=0.0001  # Change to any amount
```

### Confirmation Requirements

Adjust in `facilitator/.env`:
```env
MIN_CONFIRMATIONS=1  # Increase for more security
```

### RPC Endpoint

For better reliability, consider using:
- Rootstock's public node (default)
- Your own Rootstock node
- Third-party RPC providers

## 🔧 Troubleshooting

### Common Issues

#### "Transaction not found"
- **Cause**: Transaction hasn't been mined yet
- **Solution**: Wait 30-60 seconds and retry

#### "Insufficient confirmations"
- **Cause**: Transaction needs more blocks
- **Solution**: Wait for more confirmations or reduce `MIN_CONFIRMATIONS`

#### "Wrong recipient"
- **Cause**: Payment sent to wrong address
- **Solution**: Verify `MERCHANT_ADDRESS` matches in both merchant-api and payment

#### "MetaMask not connecting"
- **Cause**: Wrong network or MetaMask not installed
- **Solution**: 
  - Install MetaMask extension
  - Add Rootstock Testnet manually
  - Refresh page

#### "Facilitator unavailable"
- **Cause**: Facilitator service not running
- **Solution**: Start facilitator first: `cd facilitator && npm start`

#### "Balance is 0"
- **Cause**: No testnet tRBTC
- **Solution**: Visit [https://faucet.rootstock.io/](https://faucet.rootstock.io/)

### Debug Mode

Enable detailed logging:

**Merchant API**:
```javascript
// Add to merchant-api/index.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.headers);
  next();
});
```

**Facilitator**:
```javascript
// Already includes detailed console logs
// Check terminal output for verification steps
```

## 🎨 Customization

### Change Payment Token

To accept ERC-20 tokens (e.g., USDC.e) instead of native tRBTC:

1. **Update facilitator** to check token transfers:
   ```javascript
   // Use ethers.Contract to read Transfer events
   const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
   const filter = tokenContract.filters.Transfer(from, to);
   const events = await tokenContract.queryFilter(filter, blockNumber, blockNumber);
   ```

2. **Update frontend** to use token approval + transfer:
   ```javascript
   // Approve token spending
   await tokenContract.approve(recipient, amount);
   // Transfer tokens
   await tokenContract.transfer(recipient, amount);
   ```

### Add Order Database

Store orders in a database:

```javascript
// merchant-api/index.js
import { MongoClient } from 'mongodb';

const orders = db.collection('orders');
await orders.insertOne({
  orderId: `ORDER-${Date.now()}`,
  txHash,
  customer: req.body.customer,
  items: ['Apples', 'Bananas'],
  status: 'confirmed',
  createdAt: new Date()
});
```

### Add Authentication

Require user authentication before ordering:

```javascript
// merchant-api/index.js
app.use('/api/order-groceries', authenticateUser);

function authenticateUser(req, res, next) {
  const token = req.headers.authorization;
  // Verify JWT token
  next();
}
```

## 🚀 Future Enhancements

### Planned Features

- [ ] **ERC-20 Support**: Accept USDC.e, USDT, DAI
- [ ] **Transaction History**: View past orders and payments
- [ ] **QR Code Payments**: Display QR codes for mobile wallets
- [ ] **Webhook Notifications**: Real-time payment notifications
- [ ] **Multi-chain Support**: Extend to Ethereum, Polygon, etc.
- [ ] **Payment Expiry**: Time-limited payment windows
- [ ] **Refund System**: Automated refund processing
- [ ] **Admin Dashboard**: Monitor payments and orders
- [ ] **Rate Limiting**: Prevent abuse with request limits
- [ ] **Formal x402 Headers**: Implement Coinbase's x402 specification

### Production Considerations

Before deploying to production:

1. **Security**:
   - Use HTTPS for all services
   - Implement rate limiting
   - Add request validation
   - Secure private keys with HSM/KMS
   - Add CORS restrictions

2. **Reliability**:
   - Use redundant RPC endpoints
   - Add database for order persistence
   - Implement retry logic
   - Add monitoring and alerts
   - Use load balancers

3. **Scalability**:
   - Cache verification results
   - Use message queues for async processing
   - Implement horizontal scaling
   - Optimize database queries

4. **Compliance**:
   - Add KYC/AML checks if required
   - Implement transaction limits
   - Add audit logging
   - Follow local regulations

## 📚 Resources

### Rootstock

- [Rootstock Docs](https://dev.rootstock.io/)
- [Rootstock Testnet Faucet](https://faucet.rootstock.io/)
- [Rootstock Explorer](https://explorer.testnet.rsk.co/)
- [Rootstock GitHub](https://github.com/rsksmart)

### x402 Protocol

- [HTTP 402 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)
- [Coinbase x402 Proposal](https://github.com/coinbase/x402)

### Development Tools

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

MIT License - feel free to use this starter kit for your projects!

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 💬 Support

- **Issues**: Open a GitHub issue
- **Questions**: Check existing issues or start a discussion
- **Rootstock Support**: Visit [Rootstock Discord](https://rootstock.io/discord)

---

**Built with ❤️ for the Rootstock ecosystem**

*Powered by Bitcoin security, EVM compatibility, and the x402 protocol*
