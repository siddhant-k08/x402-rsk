# Frontend (React Web App)

Modern React web interface for x402 payments with MetaMask integration.

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
VITE_MERCHANT_API_URL=http://localhost:4000
VITE_ROOTSTOCK_RPC=https://public-node.testnet.rsk.co
```

## Running

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Features

- **MetaMask Integration**: Connect wallet with one click
- **Network Switching**: Automatic Rootstock Testnet detection
- **Payment Flow**: Guided step-by-step payment process
- **Transaction Tracking**: Real-time status updates
- **Explorer Links**: View transactions on RSK Explorer
- **Error Handling**: Clear error messages and retry logic
- **Responsive Design**: Works on desktop and mobile
- **Beautiful UI**: Modern gradient design with Tailwind CSS

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls

## Usage

1. **Start the app**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Connect MetaMask**: Click "Connect MetaMask"
4. **Switch network**: Ensure you're on Rootstock Testnet (chain ID 31)
5. **Order groceries**: Click "Order Groceries"
6. **Review payment**: See amount and recipient
7. **Pay**: Click "Pay" and confirm in MetaMask
8. **Wait**: Transaction confirmation (~30 seconds)
9. **Success**: View your order confirmation!

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── components/
│   │   └── OrderGroceries.jsx     # Order component with payment flow
│   └── lib/
│       └── wagmiConfig.js         # Wagmi/Web3 configuration
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
└── postcss.config.js              # PostCSS configuration
```

## Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Change Payment Amount Display

Edit `src/components/OrderGroceries.jsx`:

```javascript
// Customize the payment info display
<span className="font-semibold text-gray-800">
  {paymentInfo.amount_tRBTC} tRBTC
</span>
```

### Add More Order Items

Edit the merchant-api to return different items, or customize the display in the success state.

## Troubleshooting

### "MetaMask not detected"
- Install MetaMask browser extension
- Refresh the page

### "Wrong network"
- Click "Switch to Rootstock Testnet" button
- Or manually switch in MetaMask

### "Transaction failed"
- Check wallet balance (need tRBTC)
- Ensure sufficient gas
- Try again with higher gas limit

### "Payment not confirmed"
- Wait 30-60 seconds for mining
- Check transaction on explorer
- Retry the order submission

### Build errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
