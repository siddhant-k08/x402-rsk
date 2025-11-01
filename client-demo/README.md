# Client Demo (CLI)

Command-line tool for testing the x402 payment flow programmatically.

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
WALLET_PRIVATE_KEY=0xYourBuyerPrivateKey
MERCHANT_API_URL=http://localhost:4000
```

⚠️ **Security Warning**: Never commit your private key! The `.env` file is gitignored.

## Running

```bash
npm start
```

## What It Does

The CLI automatically:

1. **Checks wallet balance** on Rootstock Testnet
2. **Requests order** from merchant API (receives 402)
3. **Displays payment details** (recipient, amount, chain)
4. **Sends payment transaction** using your wallet
5. **Waits for confirmation** (1 block)
6. **Retries order** with payment proof (X-PAYMENT header)
7. **Displays order confirmation** or error

## Example Output

```
🛒 x402 Client Demo - Order Groceries

📍 Wallet Address: 0x1234...5678
💰 Balance: 0.05 tRBTC

📡 Step 1: Requesting order without payment...

✅ Received 402 Payment Required:
   Chain: rootstock-testnet
   Recipient: 0xabcd...ef01
   Amount: 0.0001 tRBTC
   Facilitator: http://localhost:4001/verify

💸 Step 2: Sending payment transaction...

Sending 0.0001 tRBTC to 0xabcd...ef01...
✅ Transaction sent: 0x9876...5432
🔗 View on explorer: https://explorer.testnet.rsk.co/tx/0x9876...5432

⏳ Waiting for confirmation...
✅ Transaction confirmed in block 5234567

📡 Step 3: Submitting order with payment proof...

🎉 SUCCESS! Order confirmed!

{
  "message": "Payment received, order confirmed!",
  "order": {
    "id": "ORDER-1699999999999",
    "items": ["Apples", "Bananas", "Oranges", "Milk", "Bread"],
    "status": "confirmed",
    "txHash": "0x9876...5432",
    "confirmations": 1
  }
}

📦 Order Details:
   Order ID: ORDER-1699999999999
   Items: Apples, Bananas, Oranges, Milk, Bread
   Status: confirmed
   Transaction: 0x9876...5432
   Confirmations: 1

✨ Demo completed!
```

## Troubleshooting

### "WALLET_PRIVATE_KEY not configured"
- Add your private key to `.env` file
- Get private key from MetaMask: Account Details → Export Private Key

### "Wallet balance is 0"
- Get testnet tRBTC from https://faucet.rootstock.io/
- Wait 5-10 minutes for confirmation

### "Error connecting to merchant API"
- Ensure merchant-api is running: `cd merchant-api && npm start`
- Check `MERCHANT_API_URL` in `.env`

### "Transaction not found"
- Wait longer for transaction to be mined
- Check transaction on explorer
- Retry after 30-60 seconds
