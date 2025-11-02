import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { RootstockLogo } from './assets/RootstockLogo';

const Header = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex h-14 px-4 lg:px-8 justify-between border-b border-gray-700">
      <div className="flex items-center">
        <a href="/" className="flex items-center gap-2">
          <RootstockLogo className="cursor-pointer" />
        </a>
      </div>
      <div className="flex items-center gap-4">
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-white text-black hover:bg-white-200 font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-white-100 hidden sm:inline">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="text-white-200 hover:text-white-100 text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
