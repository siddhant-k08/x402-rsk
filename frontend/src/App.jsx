import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import PurchaseRequest from './components/PurchaseRequest';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛍️ x402 Smart Purchase
          </h1>
          <p className="text-xl text-white/90">
            Buy anything with tRBTC on Rootstock Testnet
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Network Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
              🔗 Rootstock Testnet
            </div>
          </div>

          {/* Wallet Connection */}
          {!isConnected ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Connect your MetaMask wallet to get started
              </p>
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🦊 Connect MetaMask
              </button>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Make sure MetaMask is set to Rootstock Testnet.
                  <br />
                  Need testnet tRBTC? Visit{' '}
                  <a
                    href="https://faucet.rootstock.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    faucet.rootstock.io
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Connected Wallet Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Connected Wallet</p>
                    <p className="font-mono text-sm font-semibold text-gray-800">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Purchase Component */}
              <PurchaseRequest />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>
            Built with ❤️ for Rootstock | Powered by x402 Protocol
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
