# x402 Payment System Architecture

## System Overview

The x402 payment system consists of four main components that work together to enable cryptocurrency-gated API access:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Web Frontend   │              │   CLI Client     │        │
│  │  (React + Wagmi) │              │   (Node.js)      │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼───────────────────┘
            │                                  │
            │         HTTP Requests            │
            │         (with/without            │
            │          X-PAYMENT)              │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Merchant API (Express.js)                  │    │
│  │                                                          │    │
│  │  • Implements 402 Payment Required pattern             │    │
│  │  • Returns payment details on unpaid requests          │    │
│  │  • Validates X-PAYMENT header                          │    │
│  │  • Calls facilitator for verification                  │    │
│  │  • Returns order confirmation on valid payment         │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │                                          │
│                       │ POST /verify                             │
│                       │ {txHash, recipient, amount}              │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Facilitator (Verification Service)            │    │
│  │                                                          │    │
│  │  • Connects to Rootstock RPC                           │    │
│  │  • Fetches transaction data                            │    │
│  │  • Validates recipient address                         │    │
│  │  • Checks payment amount                               │    │
│  │  • Verifies confirmations                              │    │
│  │  • Returns validation result                           │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ JSON-RPC Calls
                        │ (eth_getTransactionByHash,
                        │  eth_getTransactionReceipt, etc.)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            Rootstock Testnet Blockchain                 │    │
│  │                                                          │    │
│  │  • Stores transaction data                             │    │
│  │  • Processes tRBTC transfers                           │    │
│  │  • Provides JSON-RPC interface                         │    │
│  │  • Secured by Bitcoin merge-mining                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Payment Flow Sequence

### 1. Initial Request (No Payment)

```
Client                  Merchant API              Facilitator         Blockchain
  │                          │                         │                   │
  │  POST /api/order        │                         │                   │
  │  (no X-PAYMENT)         │                         │                   │
  ├────────────────────────>│                         │                   │
  │                          │                         │                   │
  │                          │ Check X-PAYMENT header  │                   │
  │                          │ (not present)           │                   │
  │                          │                         │                   │
  │  402 Payment Required    │                         │                   │
  │  {recipient, amount}     │                         │                   │
  │<────────────────────────┤                         │                   │
  │                          │                         │                   │
```

### 2. Payment Transaction

```
Client                  Merchant API              Facilitator         Blockchain
  │                          │                         │                   │
  │ User approves payment    │                         │                   │
  │ in MetaMask/Wallet       │                         │                   │
  │                          │                         │                   │
  │  sendTransaction({       │                         │                   │
  │    to: recipient,        │                         │                   │
  │    value: amount         │                         │                   │
  │  })                      │                         │                   │
  ├─────────────────────────┼─────────────────────────┼──────────────────>│
  │                          │                         │                   │
  │                          │                         │    Transaction    │
  │                          │                         │    mined in       │
  │                          │                         │    block N        │
  │                          │                         │                   │
  │  Transaction Hash        │                         │                   │
  │  0x123...                │                         │                   │
  │<─────────────────────────┼─────────────────────────┼───────────────────┤
  │                          │                         │                   │
```

### 3. Payment Verification

```
Client                  Merchant API              Facilitator         Blockchain
  │                          │                         │                   │
  │  POST /api/order        │                         │                   │
  │  X-PAYMENT:             │                         │                   │
  │  {txHash: "0x123..."}   │                         │                   │
  ├────────────────────────>│                         │                   │
  │                          │                         │                   │
  │                          │  POST /verify           │                   │
  │                          │  {txHash, recipient,    │                   │
  │                          │   amount}               │                   │
  │                          ├────────────────────────>│                   │
  │                          │                         │                   │
  │                          │                         │  eth_getTransaction│
  │                          │                         │  ByHash(txHash)   │
  │                          │                         ├──────────────────>│
  │                          │                         │                   │
  │                          │                         │  Transaction data │
  │                          │                         │<──────────────────┤
  │                          │                         │                   │
  │                          │                         │  eth_getTransaction│
  │                          │                         │  Receipt(txHash)  │
  │                          │                         ├──────────────────>│
  │                          │                         │                   │
  │                          │                         │  Receipt data     │
  │                          │                         │<──────────────────┤
  │                          │                         │                   │
  │                          │                         │ Validate:         │
  │                          │                         │ • tx.to == recipient│
  │                          │                         │ • tx.value >= amount│
  │                          │                         │ • confirmations >= 1│
  │                          │                         │                   │
  │                          │  {valid: true,          │                   │
  │                          │   confirmations: 2}     │                   │
  │                          │<────────────────────────┤                   │
  │                          │                         │                   │
  │  200 OK                  │                         │                   │
  │  {order confirmed}       │                         │                   │
  │<────────────────────────┤                         │                   │
  │                          │                         │                   │
```

## Component Details

### Merchant API (Port 4000)

**Responsibilities:**
- Implement HTTP 402 status code pattern
- Generate payment requests with recipient and amount
- Parse and validate X-PAYMENT headers
- Coordinate with facilitator for verification
- Return order confirmations

**Key Endpoints:**
- `POST /api/order-groceries` - Main order endpoint
- `GET /health` - Health check

**Technologies:**
- Express.js (web framework)
- Axios (HTTP client for facilitator calls)
- dotenv (environment configuration)

### Facilitator (Port 4001)

**Responsibilities:**
- Connect to Rootstock Testnet RPC
- Fetch transaction and receipt data
- Validate payment parameters
- Check confirmation count
- Return verification results

**Key Endpoints:**
- `POST /verify` - Verify transaction
- `GET /health` - Health check with network status

**Technologies:**
- Express.js (web framework)
- Ethers.js v6 (blockchain interaction)
- dotenv (environment configuration)

**Verification Checks:**
1. Transaction exists on blockchain
2. Transaction succeeded (status = 1)
3. Recipient address matches expected
4. Payment amount >= expected amount
5. Confirmations >= minimum required

### Client Demo (CLI)

**Responsibilities:**
- Demonstrate programmatic payment flow
- Manage wallet and private keys
- Send transactions to Rootstock
- Retry requests with payment proof

**Technologies:**
- Node.js (runtime)
- Axios (HTTP client)
- Ethers.js v6 (wallet and transactions)
- dotenv (environment configuration)

### Frontend (Port 3000)

**Responsibilities:**
- Provide user-friendly web interface
- Integrate with MetaMask wallet
- Guide users through payment flow
- Display transaction status and results

**Technologies:**
- React 18 (UI framework)
- Vite (build tool)
- Wagmi (React hooks for Ethereum)
- Viem (Ethereum library)
- TailwindCSS (styling)
- Axios (API calls)

## Data Flow

### Payment Request Data

```json
{
  "payment_required": {
    "chain": "rootstock-testnet",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount_tRBTC": "0.0001",
    "facilitator": "http://localhost:4001/verify"
  }
}
```

### Payment Proof Data

```json
{
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

### Verification Request Data

```json
{
  "txHash": "0x1234567890abcdef...",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.0001"
}
```

### Verification Response Data

```json
{
  "valid": true,
  "confirmations": 2,
  "transaction": {
    "hash": "0x1234567890abcdef...",
    "from": "0xBuyerAddress...",
    "to": "0xMerchantAddress...",
    "value": "0.0001",
    "blockNumber": 5234567,
    "timestamp": null
  }
}
```

## Security Considerations

### Current Implementation

1. **No Authentication**: Anyone can make requests
2. **Self-Hosted Facilitator**: Merchant controls verification
3. **Minimal Confirmations**: Default is 1 block
4. **No Rate Limiting**: Unlimited requests allowed
5. **HTTP Only**: No TLS encryption

### Production Recommendations

1. **Add Authentication**: JWT tokens or API keys
2. **Use HTTPS**: TLS encryption for all traffic
3. **Rate Limiting**: Prevent abuse and DoS
4. **Increase Confirmations**: 6+ blocks for mainnet
5. **Database Storage**: Persist orders and payments
6. **Monitoring**: Track all transactions and errors
7. **Backup RPC**: Multiple Rootstock endpoints
8. **Input Validation**: Sanitize all user inputs
9. **CORS Configuration**: Restrict allowed origins
10. **Private Key Security**: Use HSM/KMS for production

## Scalability Considerations

### Current Limitations

- Single instance of each service
- Synchronous verification
- In-memory state only
- No caching

### Scaling Strategies

1. **Horizontal Scaling**: Multiple instances behind load balancer
2. **Async Processing**: Message queue for verifications
3. **Caching**: Redis for verification results
4. **Database**: PostgreSQL for order persistence
5. **CDN**: Static frontend assets
6. **Microservices**: Separate services for different functions

## Error Handling

### Merchant API Errors

- `400 Bad Request`: Invalid X-PAYMENT format
- `402 Payment Required`: No payment or invalid payment
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Facilitator unreachable

### Facilitator Errors

- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Blockchain RPC error

### Client Errors

- Network errors (ECONNREFUSED, ETIMEDOUT)
- Transaction errors (insufficient funds, gas)
- Wallet errors (user rejection, wrong network)

## Future Enhancements

### Planned Features

1. **ERC-20 Support**: Accept USDC, USDT, DAI
2. **Multi-Chain**: Support Ethereum, Polygon, etc.
3. **Webhooks**: Real-time payment notifications
4. **Refunds**: Automated refund processing
5. **Subscriptions**: Recurring payment support
6. **Analytics**: Payment tracking and reporting
7. **Admin Dashboard**: Monitor system health
8. **Mobile App**: Native iOS/Android clients

### Architecture Evolution

```
Current: Monolithic services
  ↓
Next: Microservices with message queue
  ↓
Future: Event-driven serverless architecture
```

## Deployment Architecture

### Development (Current)

```
localhost:4001 ← Facilitator
localhost:4000 ← Merchant API
localhost:3000 ← Frontend
```

### Production (Recommended)

```
                    ┌─────────────┐
                    │   CDN       │
                    │  (Frontend) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                   │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │Merchant │        │Merchant │        │Merchant │
   │ API 1   │        │ API 2   │        │ API 3   │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                   │
        └──────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Facilitator │
                    │  (Cluster)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Rootstock  │
                    │     RPC     │
                    └─────────────┘
```

## Monitoring and Observability

### Key Metrics

1. **Request Rate**: Requests per second
2. **Payment Success Rate**: Successful payments / total attempts
3. **Verification Time**: Time to verify transactions
4. **Error Rate**: Errors per minute
5. **Blockchain Lag**: Current block vs latest block

### Logging

- All payment requests
- All verification attempts
- All errors and exceptions
- Transaction hashes and amounts
- Response times

### Alerts

- Service downtime
- High error rate
- Blockchain RPC failures
- Unusual payment patterns
- Low confirmation counts

---

**Last Updated**: 2024
**Version**: 1.0.0
