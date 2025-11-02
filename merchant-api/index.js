import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS;
const PAYMENT_AMOUNT = process.env.PAYMENT_AMOUNT || '0.0001';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:4001';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'x402-merchant-api',
    merchant: MERCHANT_ADDRESS 
  });
});

/**
 * Main endpoint: Order Groceries
 * Implements 402 Payment Required pattern
 */
app.post('/api/order-groceries', async (req, res) => {
  try {
    const paymentHeader = req.headers['x-payment'];

    // No payment header → Return 402 Payment Required
    if (!paymentHeader) {
      return res.status(402).json({
        payment_required: {
          chain: 'rootstock-testnet',
          recipient: MERCHANT_ADDRESS,
          amount_tRBTC: PAYMENT_AMOUNT,
          facilitator: `${FACILITATOR_URL}/verify`
        }
      });
    }

    // Parse payment header
    let paymentData;
    try {
      paymentData = JSON.parse(paymentHeader);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid X-PAYMENT header format. Expected JSON with txHash.' 
      });
    }

    const { txHash } = paymentData;
    if (!txHash) {
      return res.status(400).json({ 
        error: 'Missing txHash in X-PAYMENT header' 
      });
    }

    // Verify payment with facilitator
    console.log(`Verifying payment: ${txHash}`);
    const verifyResponse = await axios.post(`${FACILITATOR_URL}/verify`, {
      txHash,
      recipient: MERCHANT_ADDRESS,
      amount: PAYMENT_AMOUNT
    }, {
      timeout: 10000 // 10 second timeout
    });

    const { valid, confirmations, reason } = verifyResponse.data;

    if (valid) {
      console.log(`✅ Payment verified! Confirmations: ${confirmations}`);
      return res.status(200).json({
        message: 'Payment received, order confirmed!',
        order: {
          id: `ORDER-${Date.now()}`,
          items: ['Apples', 'Bananas', 'Oranges', 'Milk', 'Bread'],
          status: 'confirmed',
          txHash,
          confirmations
        }
      });
    } else {
      console.log(`❌ Payment verification failed: ${reason}`);
      return res.status(402).json({
        error: 'Payment verification failed',
        reason,
        payment_required: {
          chain: 'rootstock-testnet',
          recipient: MERCHANT_ADDRESS,
          amount_tRBTC: PAYMENT_AMOUNT,
          facilitator: `${FACILITATOR_URL}/verify`
        }
      });
    }

  } catch (error) {
    console.error('Error processing order:', error.message);
    
    // If facilitator is unreachable
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'Payment verification service unavailable',
        details: 'Please ensure the facilitator service is running'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 x402 Merchant API running on http://localhost:${PORT}`);
  console.log(`📍 Merchant Address: ${MERCHANT_ADDRESS}`);
  console.log(`💰 Payment Amount: ${PAYMENT_AMOUNT} tRBTC`);
  console.log(`🔗 Facilitator: ${FACILITATOR_URL}\n`);
});
