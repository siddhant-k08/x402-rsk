# 🎉 Natural Language Purchase Feature

## Overview

The x402 payment system has been upgraded to support **natural language purchase requests**! Instead of being limited to ordering groceries, users can now buy anything by simply describing what they want in plain English.

## What's New

### ✨ Key Features

- **Natural Language Input**: Users can type requests like "I want to buy a book" or "I want to buy a car"
- **Smart Item Recognition**: System automatically detects item types and suggests relevant products
- **Dynamic Responses**: Each item type gets custom emojis, product lists, and messaging
- **Backward Compatible**: Old `/api/order-groceries` endpoint still works

### 🛍️ Supported Item Types

The system recognizes and handles these categories:

| Category | Keywords | Example Items | Emoji |
|----------|----------|---------------|-------|
| **Books** | book | The Great Gatsby, To Kill a Mockingbird, 1984 | 📚 |
| **Cars** | car | Tesla Model 3, Toyota Camry, Honda Civic | 🚗 |
| **Phones** | phone, mobile | iPhone 15 Pro, Samsung Galaxy S24, Google Pixel 8 | 📱 |
| **Laptops** | laptop, computer | MacBook Pro, Dell XPS 15, ThinkPad X1 Carbon | 💻 |
| **Groceries** | food, groceries, grocery | Apples, Bananas, Oranges, Milk, Bread | 🛒 |
| **Clothing** | clothes, clothing, shirt, pants | T-Shirt, Jeans, Sneakers, Jacket | 👕 |
| **Beverages** | coffee, drink | Espresso, Cappuccino, Latte, Americano | ☕ |
| **Meals** | pizza, burger, meal | Margherita Pizza, Cheeseburger, Caesar Salad, Fries | 🍕 |
| **Generic** | anything else | Premium Item A, Premium Item B, Premium Item C | 🎁 |

## Changes Made

### 1. Merchant API (`merchant-api/index.js`)

#### New Endpoint: `POST /api/purchase`

Replaces the fixed grocery ordering with flexible purchase requests.

**Request:**
```json
{
  "query": "I want to buy a book"
}
```

**Response (402):**
```json
{
  "payment_required": {
    "chain": "rootstock-testnet",
    "recipient": "0x...",
    "amount_tRBTC": "0.0001",
    "facilitator": "http://localhost:4001/verify",
    "query": "I want to buy a book",
    "itemType": "book",
    "preview": ["The Great Gatsby", "To Kill a Mockingbird", "1984"],
    "emoji": "📚"
  }
}
```

**Response (200 - After Payment):**
```json
{
  "message": "Payment received! Your book order is confirmed!",
  "order": {
    "id": "ORDER-1234567890",
    "query": "I want to buy a book",
    "itemType": "book",
    "items": ["The Great Gatsby", "To Kill a Mockingbird", "1984"],
    "emoji": "📚",
    "status": "confirmed",
    "txHash": "0x...",
    "confirmations": 2,
    "estimatedDelivery": "2-3 business days"
  }
}
```

#### New Function: `parsePurchaseRequest(query)`

Analyzes natural language queries and returns:
- `itemType`: Category of the item
- `items`: Array of relevant products
- `emoji`: Visual representation

#### Backward Compatibility

The old `/api/order-groceries` endpoint still works and redirects to `/api/purchase` with a groceries query.

### 2. Frontend (`frontend/src/`)

#### New Component: `PurchaseRequest.jsx`

Replaces `OrderGroceries.jsx` with a more flexible interface.

**Features:**
- Text input for natural language queries
- Example query buttons for quick testing
- Dynamic display of item types and previews
- Custom emojis for each category
- Improved success messages with delivery estimates

**User Flow:**
1. User types "I want to buy a laptop"
2. System shows: 💻 Laptop Found! with preview items
3. User pays 0.0001 tRBTC
4. System confirms: "Payment received! Your laptop order is confirmed!"

#### Updated: `App.jsx`

- Changed title from "x402 Payment Demo" to "x402 Smart Purchase"
- Updated subtitle to "Buy anything with tRBTC"
- Imports `PurchaseRequest` instead of `OrderGroceries`

### 3. CLI Client (`client-demo/index.js`)

#### Command Line Arguments Support

**Usage:**
```bash
# Default (groceries)
npm start

# Custom query
npm start "I want to buy a book"

# Another example
npm start "I want to buy a car"
```

#### Enhanced Output

Shows item type, preview, emoji, and delivery estimate:

```
🛍️ x402 Client Demo - Smart Purchase

📝 Purchase Request: "I want to buy a book"

✅ Received 402 Payment Required:
   📚 Item Type: book
   Preview: The Great Gatsby, To Kill a Mockingbird, 1984
   Chain: rootstock-testnet
   ...

📚 Order Details:
   Order ID: ORDER-1234567890
   Type: book
   Items: The Great Gatsby, To Kill a Mockingbird, 1984
   Status: confirmed
   Delivery: 2-3 business days
   ...
```

## Usage Examples

### Frontend (Web Interface)

1. Open http://localhost:3000
2. Connect MetaMask
3. Type in the search box:
   - "I want to buy a book"
   - "I want to buy a phone"
   - "I want to buy coffee"
4. Click "Find & Purchase"
5. Review the items and pay
6. Receive confirmation!

### CLI (Command Line)

```bash
# Books
cd client-demo
npm start "I want to buy a book"

# Cars
npm start "I want to buy a car"

# Phones
npm start "I want to buy a phone"

# Laptops
npm start "I want to buy a laptop"

# Coffee
npm start "I want to buy coffee"

# Groceries (default)
npm start
```

### API (Direct)

```bash
# Step 1: Request purchase
curl -X POST http://localhost:4000/api/purchase \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to buy a book"}'

# Response: 402 with payment details

# Step 2: Send payment on Rootstock Testnet
# (use MetaMask or ethers.js)

# Step 3: Submit with payment proof
curl -X POST http://localhost:4000/api/purchase \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: {\"txHash\": \"0x...\"}" \
  -d '{"query": "I want to buy a book"}'

# Response: 200 with order confirmation
```

## Adding New Item Types

Want to add support for more items? Edit `merchant-api/index.js`:

```javascript
function parsePurchaseRequest(query) {
  const lowerQuery = query.toLowerCase();
  
  // Add your new category
  if (lowerQuery.includes('watch') || lowerQuery.includes('clock')) {
    itemType = 'watch';
    items = ['Rolex Submariner', 'Apple Watch', 'Casio G-Shock'];
    emoji = '⌚';
  }
  // ... existing categories
}
```

That's it! The system will automatically handle the new category.

## Testing

### Test Different Categories

```bash
# Start services
cd merchant-api && npm start  # Terminal 1
cd facilitator && npm start   # Terminal 2
cd frontend && npm run dev    # Terminal 3

# Test via CLI
cd client-demo
npm start "I want to buy a book"
npm start "I want to buy a car"
npm start "I want to buy a phone"
npm start "I want to buy coffee"
```

### Test via Web

1. Open http://localhost:3000
2. Try the example queries (click the buttons)
3. Or type your own custom queries
4. Pay and verify the order details match your request

## Migration Guide

### For Existing Users

**No changes required!** The old `/api/order-groceries` endpoint still works:

```javascript
// This still works
await axios.post('/api/order-groceries', {});

// Internally redirects to:
await axios.post('/api/purchase', { query: 'I want to buy groceries' });
```

### For New Integrations

Use the new `/api/purchase` endpoint:

```javascript
// New way
await axios.post('/api/purchase', {
  query: 'I want to buy a book'
});
```

## Benefits

### For Users
- ✅ More flexible - buy anything, not just groceries
- ✅ Natural language - no need to learn specific commands
- ✅ Visual feedback - emojis and item previews
- ✅ Better UX - see what you're buying before paying

### For Developers
- ✅ Easy to extend - add new categories in minutes
- ✅ Backward compatible - existing code still works
- ✅ Well documented - clear examples and usage
- ✅ Flexible API - supports any purchase request

## Future Enhancements

Potential improvements for the future:

- [ ] **AI-Powered Parsing**: Use GPT/Claude to understand complex queries
- [ ] **Price Variations**: Different prices for different item types
- [ ] **Quantity Support**: "I want to buy 3 books"
- [ ] **Filters**: "I want to buy a red car under $30,000"
- [ ] **Recommendations**: "Similar items you might like"
- [ ] **Search History**: Remember past purchases
- [ ] **Favorites**: Save frequently purchased items
- [ ] **Multi-Item Orders**: "I want to buy a book and a coffee"

## API Reference

### POST /api/purchase

**Request Body:**
```typescript
{
  query: string  // Natural language purchase request
}
```

**Headers (for payment):**
```typescript
{
  "X-PAYMENT": string  // JSON: {"txHash": "0x..."}
}
```

**Response (402 - Payment Required):**
```typescript
{
  payment_required: {
    chain: string           // "rootstock-testnet"
    recipient: string       // Merchant wallet address
    amount_tRBTC: string    // Payment amount
    facilitator: string     // Verification endpoint
    query: string           // Original query
    itemType: string        // Detected category
    preview: string[]       // Sample items (3)
    emoji: string           // Category emoji
  }
}
```

**Response (200 - Success):**
```typescript
{
  message: string  // Success message
  order: {
    id: string                  // Order ID
    query: string               // Original query
    itemType: string            // Item category
    items: string[]             // All items
    emoji: string               // Category emoji
    status: string              // "confirmed"
    txHash: string              // Transaction hash
    confirmations: number       // Block confirmations
    estimatedDelivery: string   // Delivery estimate
  }
}
```

## Troubleshooting

### "Missing or invalid query parameter"

Make sure you're sending the query in the request body:

```javascript
// ❌ Wrong
await axios.post('/api/purchase', {});

// ✅ Correct
await axios.post('/api/purchase', { query: 'I want to buy a book' });
```

### Items not recognized

The system uses keyword matching. Make sure your query includes one of the supported keywords:

```
✅ "I want to buy a book"
✅ "buy book"
✅ "book please"
❌ "I want to purchase literature"  // Use "book" instead
```

### Old endpoint not working

The `/api/order-groceries` endpoint should still work. If it doesn't:

1. Restart the merchant-api service
2. Check that you're on the latest code
3. Verify the endpoint exists in `merchant-api/index.js`

## Summary

The x402 payment system now supports **natural language purchase requests**, making it more flexible and user-friendly. Users can buy books, cars, phones, laptops, groceries, and more by simply describing what they want.

**Key Changes:**
- ✅ New `/api/purchase` endpoint with query parameter
- ✅ Frontend input field for natural language
- ✅ CLI support for custom queries
- ✅ Smart item recognition with 9+ categories
- ✅ Dynamic responses with emojis and previews
- ✅ Backward compatible with old endpoint

**Ready to use!** Just restart your services and try it out! 🚀

---

**Questions?** Check the main README.md or open an issue.
