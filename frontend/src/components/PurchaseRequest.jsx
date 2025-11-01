import React, { useState } from 'react';
import { useAccount, useWalletClient, useSwitchChain, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import axios from 'axios';
import { rootstockTestnet } from '../lib/wagmiConfig';

const MERCHANT_API_URL = import.meta.env.VITE_MERCHANT_API_URL || 'http://localhost:4000';

function PurchaseRequest() {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();

  const [status, setStatus] = useState('idle'); // idle, loading, payment_required, paying, success, error
  const [query, setQuery] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const resetState = () => {
    setStatus('idle');
    setPaymentInfo(null);
    setOrderData(null);
    setError(null);
    setTxHash(null);
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter what you want to buy');
      return;
    }

    try {
      resetState();
      setStatus('loading');

      // Check if on correct network
      if (chain?.id !== rootstockTestnet.id) {
        setStatus('error');
        setError('Please switch to Rootstock Testnet');
        return;
      }

      // Step 1: Request purchase with natural language query
      console.log('Submitting purchase request:', query);
      const response = await axios.post(
        `${MERCHANT_API_URL}/api/purchase`,
        { query },
        { validateStatus: () => true }
      );

      if (response.status === 402) {
        // Payment required
        const payment = response.data.payment_required;
        setPaymentInfo(payment);
        setStatus('payment_required');
        console.log('Payment required:', payment);
      } else if (response.status === 400) {
        setStatus('error');
        setError(response.data.message || 'Invalid request');
      } else {
        setStatus('error');
        setError('Unexpected response from merchant API');
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
      setError(err.message || 'Failed to connect to merchant API');
    }
  };

  const handlePayment = async () => {
    try {
      setStatus('paying');
      setError(null);

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      // Send transaction
      console.log('Sending payment transaction...');
      const hash = await walletClient.sendTransaction({
        to: paymentInfo.recipient,
        value: parseEther(paymentInfo.amount_tRBTC),
        account: address,
        chain: rootstockTestnet,
      });

      setTxHash(hash);
      console.log('Transaction sent:', hash);

      // Wait for transaction to be mined (properly wait for confirmation)
      setStatus('paying');
      console.log('Waiting for transaction confirmation...');
      
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });
      
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      // Step 2: Submit purchase request with payment proof
      console.log('Submitting purchase with payment proof...');
      const finalResponse = await axios.post(
        `${MERCHANT_API_URL}/api/purchase`,
        { query: paymentInfo.query },
        {
          headers: {
            'X-PAYMENT': JSON.stringify({ txHash: hash }),
          },
          validateStatus: () => true,
        }
      );

      if (finalResponse.status === 200) {
        setOrderData(finalResponse.data);
        setStatus('success');
        console.log('Purchase confirmed!', finalResponse.data);
      } else if (finalResponse.status === 402) {
        // Still waiting for confirmations (shouldn't happen now with proper wait)
        setStatus('error');
        const reason = finalResponse.data.reason || 'Payment verification failed';
        setError(
          `${reason}. The transaction was confirmed but verification failed. Please try again or contact support.`
        );
      } else {
        setStatus('error');
        setError(`Purchase verification failed (Status: ${finalResponse.status}). Please try again.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setStatus('error');
      setError(err.message || 'Payment failed');
    }
  };

  const switchToRootstock = async () => {
    try {
      await switchChain({ chainId: rootstockTestnet.id });
    } catch (err) {
      console.error('Failed to switch network:', err);
      setError('Failed to switch network. Please switch manually in MetaMask.');
    }
  };

  // Example queries
  const exampleQueries = [
    'I want to buy a book',
    'I want to buy a car',
    'I want to buy a phone',
    'I want to buy a laptop',
    'I want to buy groceries',
    'I want to buy coffee',
  ];

  return (
    <div className="space-y-6">
      {/* Idle State - Input Form */}
      {status === 'idle' && (
        <div>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              What would you like to buy?
            </h2>
            <p className="text-gray-600">
              Enter your request in natural language
            </p>
          </div>

          <form onSubmit={handleSubmitQuery} className="space-y-4">
            <div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I want to buy a book"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🔍 Find & Purchase
            </button>
          </form>

          {/* Example Queries */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">💡 Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(example)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <div className="text-center py-8">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Processing your request...</p>
        </div>
      )}

      {/* Payment Required State */}
      {status === 'payment_required' && paymentInfo && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">{paymentInfo.emoji}</span>
                {paymentInfo.itemType.charAt(0).toUpperCase() + paymentInfo.itemType.slice(1)} Found!
              </h3>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Your request:</p>
              <p className="font-semibold text-gray-800 mb-3">"{paymentInfo.query}"</p>
              
              <p className="text-sm text-gray-600 mb-2">Available items:</p>
              <ul className="space-y-1">
                {paymentInfo.preview.map((item, idx) => (
                  <li key={idx} className="text-gray-800">• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Chain:</span>
                <span className="font-semibold text-gray-800">{paymentInfo.chain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-800">
                  {paymentInfo.amount_tRBTC} tRBTC
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-mono text-xs text-gray-800 break-all text-right ml-2">
                  {paymentInfo.recipient}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            💸 Pay {paymentInfo.amount_tRBTC} tRBTC
          </button>

          <button
            onClick={resetState}
            className="w-full text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Try a different search
          </button>
        </div>
      )}

      {/* Paying State */}
      {status === 'paying' && (
        <div className="text-center py-8">
          <div className="animate-pulse text-6xl mb-4">💸</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Processing Payment...
          </h3>
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your transaction
          </p>
          {txHash && (
            <a
              href={`https://explorer.testnet.rsk.co/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on Explorer →
            </a>
          )}
        </div>
      )}

      {/* Success State */}
      {status === 'success' && orderData && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">
              {orderData.order?.emoji || '✅'}
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Purchase Confirmed!
            </h3>
            <p className="text-green-700 mb-4">{orderData.message}</p>

            {orderData.order && (
              <div className="bg-white rounded-lg p-4 text-left space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">{orderData.order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold">{orderData.order.itemType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">
                    {orderData.order.status}
                  </span>
                </div>
                {orderData.order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-semibold">{orderData.order.estimatedDelivery}</span>
                  </div>
                )}
                {orderData.order.items && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 block mb-2">Items:</span>
                    <ul className="space-y-1">
                      {orderData.order.items.map((item, idx) => (
                        <li key={idx} className="text-gray-800">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {orderData.order.txHash && (
                  <div className="pt-2 border-t">
                    <a
                      href={`https://explorer.testnet.rsk.co/tx/${orderData.order.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View Transaction →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={resetState}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            🛍️ Make Another Purchase
          </button>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>

          {error?.includes('switch') && (
            <button
              onClick={switchToRootstock}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all"
            >
              Switch to Rootstock Testnet
            </button>
          )}

          <button
            onClick={resetState}
            className="w-full text-gray-600 hover:text-gray-800"
          >
            ← Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default PurchaseRequest;
