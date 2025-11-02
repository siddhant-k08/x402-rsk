import React from 'react';
import GithubIcon from './assets/GithubIcon';

const Footer = () => {
  return (
    <footer className="p-8 bg-black border-t border-gray-700 text-white mt-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-screen-xl mx-auto">
        <div className="text-sm text-white-200">
          Built with <span className="text-brand-orange">❤️</span> for <span className="font-bold text-white-100">Rootstock</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="https://dev.rootstock.io/" target="_blank" rel="noopener noreferrer" className="text-white-200 hover:text-white-100 transition-colors">
            Documentation
          </a>
          <a href="https://faucet.rootstock.io/" target="_blank" rel="noopener noreferrer" className="text-white-200 hover:text-white-100 transition-colors">
            Faucet
          </a>
          <a href="https://github.com/rsksmart" target="_blank" rel="noopener noreferrer" className="text-white-200 hover:text-white-100 transition-colors">
            <GithubIcon />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
