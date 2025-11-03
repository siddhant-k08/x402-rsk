import React from 'react';
import GithubIcon from './assets/GithubIcon';

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.243 3H21L13.5 11.627 21.5 21H15.828L10.828 14.879 5.2 21H3L10.914 11.914 3.2 3H8.972L13.586 8.707 18.243 3Z" fill="currentColor"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.369A16.3 16.3 0 0016.558 3c-.197.35-.42.82-.574 1.19a14.5 14.5 0 00-4.0 0A10.5 10.5 0 0011.41 3 16.3 16.3 0 007.652 4.37C4.614 8.75 3.977 12.99 4.27 17.176a16.42 16.42 0 004.986 2.534c.402-.554.762-1.143 1.073-1.763-.593-.226-1.16-.5-1.696-.82.142-.104.281-.212.414-.324a11.5 11.5 0 008.906 0c.134.112.273.22.414.324-.536.32-1.103.594-1.696.82.31.62.67 1.209 1.073 1.763a16.42 16.42 0 004.986-2.534c.33-4.558-.565-8.758-2.855-12.806ZM9.75 14.5c-.85 0-1.54-.86-1.54-1.92 0-1.06.69-1.92 1.54-1.92.86 0 1.55.86 1.55 1.92 0 1.06-.69 1.92-1.55 1.92Zm4.5 0c-.85 0-1.54-.86-1.54-1.92 0-1.06.69-1.92 1.54-1.92.86 0 1.55.86 1.55 1.92 0 1.06-.69 1.92-1.55 1.92Z" fill="currentColor"/>
  </svg>
);

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-black text-white border-t border-gray-700 mt-20">
      <div className="max-w-screen-xl mx-auto px-6 py-4 grid md:flex justify-between items-center text-sm">
        <div className="order-2 mt-3 md:order-1">
          <div className="flex gap-2 items-center">
            <span>Built for</span>
            <span className="text-lg font-bold">RootstockLabs</span>
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
      </div>
    </footer>
  );
};

export default Footer;
