import React from 'react';
import { useAccount } from 'wagmi';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderGroceries from './components/OrderGroceries';
import CubeImg from './components/assets/CubeImg';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black text-white-100">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#131313',
            color: '#fbfbfb',
            border: '1px solid #484848',
          },
        }} 
      />
      <Header />
      
      <div className="mt-10 max-w-screen-lg xl:max-w-screen-xl mx-auto px-5">
        {/* Hero Section */}
        <div className="flex justify-between items-center mb-20">
          <div>
            <h1 className="flex font-bold text-5xl lg:text-[64px] gap-2 text-black">
              <span className="bg-brand-orange p-1">x402</span>
              <span className="bg-white p-1">Payment</span>
            </h1>
            <p className="text-white-200 mt-6 text-lg max-w-xl">
              Experience blockchain-gated API access with native tRBTC payments on Rootstock Testnet
            </p>
          </div>
          
          {/* 3D Cube Graphic */}
          <div className="hidden lg:block">
            <CubeImg />
          </div>
        </div>

        {/* Payment Section */}
        {isConnected ? (
          <div className="max-w-3xl mx-auto">
            <OrderGroceries />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="border border-gray-700 rounded-xl p-12 bg-secondary">
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-white-200 mb-6">
                Connect your wallet to try the x402 payment demo
              </p>
              <div className="text-sm text-white-400 space-y-2">
                <div>Network: <span className="text-brand-orange font-mono">Rootstock Testnet</span></div>
                <div>Chain ID: <span className="text-brand-orange font-mono">31</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;
