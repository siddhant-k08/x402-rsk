import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const ROOTSTOCK_RPC = process.env.ROOTSTOCK_RPC || 'https://public-node.testnet.rsk.co';
const MIN_CONFIRMATIONS = parseInt(process.env.MIN_CONFIRMATIONS || '1');

// Initialize Rootstock provider
const provider = new ethers.JsonRpcProvider(ROOTSTOCK_RPC);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({ 
      status: 'ok', 
      service: 'x402-facilitator',
      network: 'rootstock-testnet',
      currentBlock: blockNumber,
      rpc: ROOTSTOCK_RPC
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Cannot connect to Rootstock RPC',
      error: error.message 
    });
  }
});

/**
 * Verify payment transaction on Rootstock Testnet
 * POST /verify
 * Body: { txHash, recipient, amount }
 */
app.post('/verify', async (req, res) => {
  try {
    const { txHash, recipient, amount } = req.body;

    // Validate input
    if (!txHash || !recipient || !amount) {
      return res.status(400).json({
        valid: false,
        reason: 'Missing required fields: txHash, recipient, or amount'
      });
    }

    // Validate addresses
    if (!ethers.isAddress(recipient)) {
      return res.status(400).json({
        valid: false,
        reason: 'Invalid recipient address format'
      });
    }

    console.log(`\n🔍 Verifying transaction: ${txHash}`);
    console.log(`   Expected recipient: ${recipient}`);
    console.log(`   Expected amount: ${amount} tRBTC`);

    // Fetch transaction
    let tx;
    try {
      tx = await provider.getTransaction(txHash);
    } catch (error) {
      console.error(`   ❌ Error fetching transaction:`, error.message);
      return res.status(200).json({
        valid: false,
        reason: 'Transaction not found or invalid hash'
      });
    }

    if (!tx) {
      return res.status(200).json({
        valid: false,
        reason: 'Transaction not found'
      });
    }

    // Fetch transaction receipt
    let receipt;
    try {
      receipt = await provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error(`   ❌ Error fetching receipt:`, error.message);
      return res.status(200).json({
        valid: false,
        reason: 'Transaction receipt not available'
      });
    }

    if (!receipt) {
      return res.status(200).json({
        valid: false,
        reason: 'Transaction not yet mined'
      });
    }

    // Check if transaction was successful
    if (receipt.status !== 1) {
      console.log(`   ❌ Transaction failed (status: ${receipt.status})`);
      return res.status(200).json({
        valid: false,
        reason: 'Transaction failed or reverted'
      });
    }

    // Verify recipient
    const txRecipient = tx.to ? tx.to.toLowerCase() : null;
    const expectedRecipient = recipient.toLowerCase();
    
    if (txRecipient !== expectedRecipient) {
      console.log(`   ❌ Recipient mismatch`);
      console.log(`      Expected: ${expectedRecipient}`);
      console.log(`      Got: ${txRecipient}`);
      return res.status(200).json({
        valid: false,
        reason: `Wrong recipient. Expected ${recipient}, got ${tx.to || 'null'}`
      });
    }

    // Verify amount
    const expectedAmount = ethers.parseEther(amount.toString());
    const actualAmount = tx.value;

    if (actualAmount < expectedAmount) {
      console.log(`   ❌ Insufficient amount`);
      console.log(`      Expected: ${ethers.formatEther(expectedAmount)} tRBTC`);
      console.log(`      Got: ${ethers.formatEther(actualAmount)} tRBTC`);
      return res.status(200).json({
        valid: false,
        reason: `Insufficient payment. Expected ${amount} tRBTC, got ${ethers.formatEther(actualAmount)} tRBTC`
      });
    }

    // Check confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;

    if (confirmations < MIN_CONFIRMATIONS) {
      console.log(`   ⏳ Insufficient confirmations: ${confirmations}/${MIN_CONFIRMATIONS}`);
      return res.status(200).json({
        valid: false,
        reason: `Waiting for confirmations. Current: ${confirmations}, Required: ${MIN_CONFIRMATIONS}`
      });
    }

    // All checks passed!
    console.log(`   ✅ Payment verified successfully!`);
    console.log(`      From: ${tx.from}`);
    console.log(`      To: ${tx.to}`);
    console.log(`      Amount: ${ethers.formatEther(actualAmount)} tRBTC`);
    console.log(`      Confirmations: ${confirmations}`);
    console.log(`      Block: ${receipt.blockNumber}\n`);

    return res.status(200).json({
      valid: true,
      confirmations,
      transaction: {
        hash: txHash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(actualAmount),
        blockNumber: receipt.blockNumber,
        timestamp: tx.timestamp || null
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      valid: false,
      reason: 'Internal server error during verification',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🔐 x402 Facilitator running on http://localhost:${PORT}`);
  console.log(`🌐 Network: Rootstock Testnet`);
  console.log(`🔗 RPC: ${ROOTSTOCK_RPC}`);
  
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`📦 Current Block: ${blockNumber}`);
    console.log(`✅ Connected to Rootstock successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to connect to Rootstock RPC:`, error.message);
    console.log(`⚠️  Service started but RPC connection failed\n`);
  }
});
