import React, { useState } from 'react';
import { useAccount, useWalletClient, useSwitchChain, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import axios from 'axios';
import toast from 'react-hot-toast';
import { rootstockTestnet } from '../lib/wagmiConfig';

const MERCHANT_API_URL = import.meta.env.VITE_MERCHANT_API_URL || 'http://localhost:4000';

function OrderGroceries() {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();

  const [status, setStatus] = useState('idle');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const resetState = () => {
    setStatus('idle');
    setPaymentInfo(null);
    setOrderData(null);
    setTxHash(null);
  };

  const handleOrderClick = async () => {
    try {
      resetState();
      setStatus('loading');

      if (chain?.id !== rootstockTestnet.id) {
        toast.error('Please switch to Rootstock Testnet');
        setStatus('error');
        return;
      }

      const response = await axios.post(
        `${MERCHANT_API_URL}/api/order-groceries`,
        {},
        { validateStatus: () => true }
      );

      if (response.status === 402) {
        const payment = response.data.payment_required;
        setPaymentInfo(payment);
        setStatus('payment_required');
        toast.success('Payment details received!');
      } else {
        toast.error('Unexpected response from merchant API');
        setStatus('error');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Failed to connect to merchant API');
      setStatus('error');
    }
  };

  const handlePayment = async () => {
    try {
      setStatus('paying');

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      toast.loading('Sending transaction...', { id: 'tx' });

      const hash = await walletClient.sendTransaction({
        to: paymentInfo.recipient,
        value: parseEther(paymentInfo.amount_tRBTC),
        account: address,
        chain: rootstockTestnet,
      });

      setTxHash(hash);
      toast.success('Transaction sent!', { id: 'tx' });
      toast.loading('Waiting for confirmation...', { id: 'confirm' });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      toast.success(`Confirmed in block ${receipt.blockNumber}`, { id: 'confirm' });
      toast.loading('Verifying payment...', { id: 'verify' });

      const finalResponse = await axios.post(
        `${MERCHANT_API_URL}/api/order-groceries`,
        {},
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
        toast.success('Order confirmed!', { id: 'verify' });
      } else {
        toast.error('Payment verification failed', { id: 'verify' });
        setStatus('error');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  const switchToRootstock = async () => {
    try {
      await switchChain({ chainId: rootstockTestnet.id });
      toast.success('Switched to Rootstock Testnet');
    } catch (err) {
      console.error('Failed to switch network:', err);
      toast.error('Failed to switch network');
    }
  };

  return (
    <div className="space-y-6">
      {/* Idle State */}
      {status === 'idle' && (
        <div className="border border-gray-700 rounded-xl p-8 bg-secondary hover:border-brand-orange transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">🛒</div>
            <div>
              <h3 className="text-2xl font-bold text-white-100">
                Order Groceries
              </h3>
              <p className="text-sm text-white-400">HTTP 402 Payment Demo</p>
            </div>
          </div>
          <p className="text-white-200 mb-6">
            Experience blockchain-gated API access. Start your order to see payment details and complete the transaction with tRBTC.
          </p>
          <button
            onClick={handleOrderClick}
            className="bg-brand-orange hover:bg-brand-orange/80 text-black font-bold py-4 px-8 rounded-lg transition-all w-full text-lg shadow-lg hover:shadow-xl"
          >
            🛍️ Start Order
          </button>
        </div>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <div className="border border-gray-700 rounded-xl p-12 bg-secondary">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-lime"></div>
            <p className="mt-6 text-white-100 text-lg font-semibold">Processing your request...</p>
            <p className="text-white-400 text-sm mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Payment Required State */}
      {status === 'payment_required' && paymentInfo && (
        <div className="border border-brand-orange rounded-xl p-8 bg-secondary">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">💳</div>
            <div>
              <h3 className="text-2xl font-bold text-white-100">Payment Required</h3>
              <p className="text-sm text-white-400">Complete payment to proceed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black border border-gray-700 rounded-lg p-6">
              <div className="text-white-400 text-sm mb-2">Amount</div>
              <div className="text-3xl font-bold text-brand-orange">{paymentInfo.amount_tRBTC} tRBTC</div>
              <div className="text-white-400 text-xs mt-1">Rootstock Testnet</div>
            </div>
            
            <div className="bg-black border border-gray-700 rounded-lg p-6">
              <div className="text-white-400 text-sm mb-2">Network</div>
              <div className="text-2xl font-bold text-white-100">{paymentInfo.chain}</div>
              <div className="text-white-400 text-xs mt-1">Chain ID: 31</div>
            </div>
          </div>

          <div className="bg-black border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-brand-lime text-xl">ℹ️</div>
              <div className="flex-1">
                <h4 className="font-bold text-white-100 text-sm mb-1">Recipient Address</h4>
                <div className="text-xs font-mono text-white-400 break-all">{paymentInfo.recipient}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetState}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white-100 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="flex-[2] bg-brand-orange hover:bg-brand-orange/80 text-black font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              💸 Pay {paymentInfo.amount_tRBTC} tRBTC
            </button>
          </div>
        </div>
      )}

      {/* Paying State */}
      {status === 'paying' && (
        <div className="border border-brand-green rounded-xl p-12 bg-secondary">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-pulse text-6xl mb-4">💸</div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mb-6"></div>
            <p className="text-white-100 text-xl font-bold">Processing Payment...</p>
            <p className="text-white-400 text-sm mt-2">Confirming transaction on Rootstock</p>
            {txHash && (
              <a
                href={`https://explorer.testnet.rootstock.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-brand-lime hover:text-brand-lime/80 font-semibold text-sm transition-colors"
              >
                View on Explorer →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && orderData && (
        <div className="space-y-6">
          <div className="bg-brand-green/10 border border-brand-green rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">✅</div>
              <div>
                <h3 className="font-bold text-brand-green text-xl">Order Confirmed!</h3>
                <p className="text-white-200 text-sm">{orderData.message}</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-700 rounded-xl p-8 bg-secondary">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">📦</div>
              <h3 className="text-2xl font-bold text-white-100">Order Details</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-white-400">Order ID</span>
                <span className="font-mono text-sm bg-black px-3 py-1 rounded text-brand-lime">{orderData.order?.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-white-400">Status</span>
                <span className="bg-brand-green/20 text-brand-green px-3 py-1 rounded-full text-sm font-semibold">{orderData.order?.status}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-white-400">Confirmations</span>
                <span className="bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-sm font-semibold">{orderData.order?.confirmations}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white-100 font-semibold mb-3">Items Ordered</h4>
              <div className="bg-black border border-gray-700 rounded-lg divide-y divide-gray-700">
                {orderData.order?.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4">
                    <span className="bg-brand-orange text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <span className="text-white-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {orderData.order?.txHash && (
              <a
                href={`https://explorer.testnet.rootstock.io/tx/${orderData.order.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black border border-gray-700 hover:border-brand-lime rounded-lg p-4 mb-6 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white-400 text-xs mb-1">Transaction Hash</div>
                    <div className="font-mono text-sm text-white-100 group-hover:text-brand-lime transition-colors">View on Block Explorer</div>
                  </div>
                  <div className="text-brand-lime text-xl">→</div>
                </div>
              </a>
            )}

            <button
              onClick={resetState}
              className="bg-brand-orange hover:bg-brand-orange/80 text-black font-bold py-4 px-8 rounded-lg transition-all w-full shadow-lg hover:shadow-xl"
            >
              🛒 Place Another Order
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="border border-brand-red rounded-xl p-8 bg-secondary">
          <div className="bg-brand-red/10 border border-brand-red rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">❌</div>
              <div>
                <h3 className="font-bold text-brand-red text-xl">Error</h3>
                <p className="text-white-200 text-sm">Something went wrong. Please try again.</p>
              </div>
            </div>
          </div>

          {chain?.id !== rootstockTestnet.id && (
            <button
              onClick={switchToRootstock}
              className="bg-brand-yellow hover:bg-brand-yellow/80 text-black font-bold py-3 px-6 rounded-lg transition-all w-full mb-3"
            >
              Switch to Rootstock Testnet
            </button>
          )}

          <button
            onClick={resetState}
            className="bg-gray-700 hover:bg-gray-600 text-white-100 font-semibold py-3 px-6 rounded-lg transition-colors w-full"
          >
            ← Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderGroceries;
