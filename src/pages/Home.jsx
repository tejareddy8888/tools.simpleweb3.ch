import React, { useEffect } from 'react';
import Header from '../components/crucial/SiteHeader';
import Footer from '../components/crucial/SiteFooter';
import Body from './Body';
import { TransactionProvider } from '../context/TransactionContext';

const Home = () => {
  useEffect(() => {
    // Apply retro pixelated cursor
    document.body.style.cursor = 'url("/cursor/pixel-sword.cur"), auto';
    document.body.style.imageRendering = 'pixelated';

    return () => {
      // Cleanup when component unmounts
      document.body.style.cursor = 'auto';
      document.body.style.imageRendering = 'auto';
    };
  }, []);

  return (
    <div>
      {/* Fixed Header */}
      <div className='fixed top-0 left-0 right-0 z-50'>
        <Header />
      </div>

      {/* Main Content Area */}
      <div className="min-h-screen bg-[Black] bg-cover bg-center">
        <main className="flex-grow flex items-center justify-center mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 w-full py-16">
          <TransactionProvider>
            <Body />
          </TransactionProvider>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
