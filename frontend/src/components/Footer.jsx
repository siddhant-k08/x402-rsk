import React from 'react';
import GithubIcon from './assets/GithubIcon';
import XIcon from './assets/XIcon';
import DiscordIcon from './assets/DiscordIcon';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full grid md:flex justify-between items-center px-6 py-4 border-t border-gray-700 text-sm mt-20">
      <div className="order-2 mt-3 md:order-1">
        <div className="flex gap-2 items-center">
          <span>Built by</span>
          <span className="text-lg font-bold">RootstockLabs</span>
        </div>
        <div className="text-xs text-gray-400">
          Copyright &copy; {year} RootstockLabs. All rights reserved.
        </div>
      </div>
      <div className="flex gap-4 flex-wrap mt-3 order-1 md:order-2">
        <a className="hover:underline" href="https://rootstock.io/" target="_blank" rel="noopener noreferrer">
          About RootstockLabs
        </a>
        <a className="hover:underline" href="https://rootstock.io/contact/" target="_blank" rel="noopener noreferrer">
          Help
        </a>
        <a className="hover:underline" href="https://rootstock.io/terms-conditions/" target="_blank" rel="noopener noreferrer">
          Terms & Conditions
        </a>
        <a className="hover:underline" href="https://dev.rootstock.io/" target="_blank" rel="noopener noreferrer">
          Documentation
        </a>
      </div>
      <div className="flex gap-4 mt-6 order-3">
        <a href="https://twitter.com/rootstock_io" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
          <XIcon />
        </a>
        <a href="https://github.com/rsksmart" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <GithubIcon />
        </a>
        <a href="https://discord.com/invite/rootstock" target="_blank" rel="noopener noreferrer" aria-label="Discord">
          <DiscordIcon />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
