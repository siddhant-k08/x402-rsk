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
 * Helper function to parse natural language purchase requests
 */
function parsePurchaseRequest(query) {
  const lowerQuery = query.toLowerCase();
  
  // Extract item type from query
  let itemType = 'item';
  let items = [];
  let emoji = '📦';
  
  if (lowerQuery.includes('book')) {
    itemType = 'book';
    items = ['The Great Gatsby', 'To Kill a Mockingbird', '1984'];
    emoji = '📚';
  } else if (lowerQuery.includes('car')) {
    itemType = 'car';
    items = ['Tesla Model 3', 'Toyota Camry', 'Honda Civic'];
    emoji = '🚗';
  } else if (lowerQuery.includes('phone') || lowerQuery.includes('mobile')) {
    itemType = 'phone';
    items = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Google Pixel 8'];
    emoji = '📱';
  } else if (lowerQuery.includes('laptop') || lowerQuery.includes('computer')) {
    itemType = 'laptop';
    items = ['MacBook Pro', 'Dell XPS 15', 'ThinkPad X1 Carbon'];
    emoji = '💻';
  } else if (lowerQuery.includes('food') || lowerQuery.includes('groceries') || lowerQuery.includes('grocery')) {
    itemType = 'groceries';
    items = ['Apples', 'Bananas', 'Oranges', 'Milk', 'Bread'];
    emoji = '🛒';
  } else if (lowerQuery.includes('clothes') || lowerQuery.includes('clothing') || lowerQuery.includes('shirt') || lowerQuery.includes('pants')) {
    itemType = 'clothing';
    items = ['T-Shirt', 'Jeans', 'Sneakers', 'Jacket'];
    emoji = '👕';
  } else if (lowerQuery.includes('coffee') || lowerQuery.includes('drink')) {
    itemType = 'beverage';
    items = ['Espresso', 'Cappuccino', 'Latte', 'Americano'];
    emoji = '☕';
  } else if (lowerQuery.includes('pizza') || lowerQuery.includes('burger') || lowerQuery.includes('meal')) {
    itemType = 'meal';
    items = ['Margherita Pizza', 'Cheeseburger', 'Caesar Salad', 'Fries'];
    emoji = '🍕';
  } else {
    // Generic items
    items = ['Premium Item A', 'Premium Item B', 'Premium Item C'];
    emoji = '🎁';
  }
  
  return { itemType, items, emoji };
}

/**
 * Main endpoint: Process Purchase Request
 * Implements 402 Payment Required pattern
 * Accepts natural language queries in request body
 */
app.post('/api/purchase', async (req, res) => {
  try {
    const paymentHeader = req.headers['x-payment'];
    const { query } = req.body;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid query parameter',
        message: 'Please provide a purchase request in the "query" field (e.g., "I want to buy a book")'
      });
    }

    // No payment header → Return 402 Payment Required
    if (!paymentHeader) {
      const { itemType, items, emoji } = parsePurchaseRequest(query);
      
      return res.status(402).json({
        payment_required: {
          chain: 'rootstock-testnet',
          recipient: MERCHANT_ADDRESS,
          amount_tRBTC: PAYMENT_AMOUNT,
          facilitator: `${FACILITATOR_URL}/verify`,
          query: query,
          itemType: itemType,
          preview: items.slice(0, 3),
          emoji: emoji
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
      
      // Parse the purchase request
      const { itemType, items, emoji } = parsePurchaseRequest(query || 'generic item');
      
      return res.status(200).json({
        message: `Payment received! Your ${itemType} order is confirmed!`,
        order: {
          id: `ORDER-${Date.now()}`,
          query: query,
          itemType: itemType,
          items: items,
          emoji: emoji,
          status: 'confirmed',
          txHash,
          confirmations,
          estimatedDelivery: '2-3 business days'
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

/**
 * Backward compatibility endpoint: Order Groceries
 * Redirects to /api/purchase with groceries query
 */
app.post('/api/order-groceries', async (req, res) => {
  // Forward to new endpoint with groceries query
  req.body.query = req.body.query || 'I want to buy groceries';
  
  // Call the purchase handler
  return app._router.handle(
    Object.assign(req, { url: '/api/purchase', originalUrl: '/api/purchase' }),
    res,
    () => {}
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 x402 Merchant API running on http://localhost:${PORT}`);
  console.log(`📍 Merchant Address: ${MERCHANT_ADDRESS}`);
  console.log(`💰 Payment Amount: ${PAYMENT_AMOUNT} tRBTC`);
  console.log(`🔗 Facilitator: ${FACILITATOR_URL}`);
  console.log(`\n📝 Endpoints:`);
  console.log(`   POST /api/purchase - Natural language purchase requests`);
  console.log(`   POST /api/order-groceries - Legacy grocery ordering\n`);
});
