/**
 * x402 Client Demo - Smart Purchase CLI
 * 
 * Usage:
 *   npm start                              # Default: "I want to buy groceries"
 *   npm start "I want to buy a book"       # Custom query
 *   npm start "I want to buy a car"        # Another example
 * 
 * Supports: books, cars, phones, laptops, groceries, clothing, coffee, meals, and more!
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const ROOTSTOCK_RPC = process.env.ROOTSTOCK_RPC || 'https://public-node.testnet.rsk.co';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const MERCHANT_API_URL = process.env.MERCHANT_API_URL || 'http://localhost:4000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  try {
    // Get query from command line args or use default
    const query = process.argv.slice(2).join(' ') || 'I want to buy groceries';
    
    log('\n🛍️ x402 Client Demo - Smart Purchase\n', 'bright');
    log(`📝 Purchase Request: "${query}"\n`, 'cyan');

    // Validate configuration
    if (!WALLET_PRIVATE_KEY || WALLET_PRIVATE_KEY === '0xYourPrivateKeyForTesting') {
      log('❌ Error: WALLET_PRIVATE_KEY not configured in .env file', 'red');
      log('Please add your private key to client-demo/.env', 'yellow');
      process.exit(1);
    }

    // Initialize wallet
    const provider = new ethers.JsonRpcProvider(ROOTSTOCK_RPC);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    
    log(`📍 Wallet Address: ${wallet.address}`, 'cyan');
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    log(`💰 Balance: ${ethers.formatEther(balance)} tRBTC`, 'cyan');
    
    if (balance === 0n) {
      log('\n⚠️  Warning: Wallet balance is 0. Get testnet tRBTC from:', 'yellow');
      log('   https://faucet.rootstock.io/', 'yellow');
      process.exit(1);
    }

    log('\n📡 Step 1: Submitting purchase request without payment...\n', 'blue');

    // Step 1: Call API without payment
    let response;
    try {
      response = await axios.post(`${MERCHANT_API_URL}/api/purchase`, { query }, {
        validateStatus: () => true // Accept any status code
      });
    } catch (error) {
      log(`❌ Error connecting to merchant API: ${error.message}`, 'red');
      log('Make sure the merchant-api is running on port 4000', 'yellow');
      process.exit(1);
    }

    if (response.status !== 402) {
      log(`❌ Expected 402 Payment Required, got ${response.status}`, 'red');
      log(JSON.stringify(response.data, null, 2));
      process.exit(1);
    }

    const paymentInfo = response.data.payment_required;
    log('✅ Received 402 Payment Required:', 'green');
    log(`   ${paymentInfo.emoji} Item Type: ${paymentInfo.itemType}`, 'cyan');
    log(`   Preview: ${paymentInfo.preview.join(', ')}`, 'cyan');
    log(`   Chain: ${paymentInfo.chain}`, 'cyan');
    log(`   Recipient: ${paymentInfo.recipient}`, 'cyan');
    log(`   Amount: ${paymentInfo.amount_tRBTC} tRBTC`, 'cyan');
    log(`   Facilitator: ${paymentInfo.facilitator}`, 'cyan');

    // Step 2: Send payment
    log('\n💸 Step 2: Sending payment transaction...\n', 'blue');

    const amountWei = ethers.parseEther(paymentInfo.amount_tRBTC);
    
    log(`Sending ${paymentInfo.amount_tRBTC} tRBTC to ${paymentInfo.recipient}...`, 'yellow');
    
    const tx = await wallet.sendTransaction({
      to: paymentInfo.recipient,
      value: amountWei
    });

    log(`✅ Transaction sent: ${tx.hash}`, 'green');
    log(`🔗 View on explorer: https://explorer.testnet.rsk.co/tx/${tx.hash}`, 'cyan');
    log('\n⏳ Waiting for confirmation...', 'yellow');

    const receipt = await tx.wait(1);
    
    log(`✅ Transaction confirmed in block ${receipt.blockNumber}`, 'green');

    // Step 3: Retry purchase with payment proof
    log('\n📡 Step 3: Submitting purchase with payment proof...\n', 'blue');

    const paymentHeader = JSON.stringify({ txHash: tx.hash });
    
    const finalResponse = await axios.post(
      `${MERCHANT_API_URL}/api/purchase`,
      { query },
      {
        headers: {
          'X-PAYMENT': paymentHeader
        },
        validateStatus: () => true
      }
    );

    if (finalResponse.status === 200) {
      log('🎉 SUCCESS! Purchase confirmed!\n', 'green');
      log(JSON.stringify(finalResponse.data, null, 2), 'cyan');
      
      if (finalResponse.data.order) {
        log(`\n${finalResponse.data.order.emoji} Order Details:`, 'bright');
        log(`   Order ID: ${finalResponse.data.order.id}`, 'cyan');
        log(`   Type: ${finalResponse.data.order.itemType}`, 'cyan');
        log(`   Items: ${finalResponse.data.order.items.join(', ')}`, 'cyan');
        log(`   Status: ${finalResponse.data.order.status}`, 'green');
        log(`   Delivery: ${finalResponse.data.order.estimatedDelivery || 'N/A'}`, 'cyan');
        log(`   Transaction: ${finalResponse.data.order.txHash}`, 'cyan');
        log(`   Confirmations: ${finalResponse.data.order.confirmations}`, 'cyan');
      }
    } else {
      log(`❌ Purchase failed with status ${finalResponse.status}`, 'red');
      log(JSON.stringify(finalResponse.data, null, 2), 'red');
    }

    log('\n✨ Demo completed!\n', 'bright');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.response) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    process.exit(1);
  }
}

// Run the demo
main();
