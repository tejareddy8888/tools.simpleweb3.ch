import React from 'react';
import Header from '../components/crucial/SiteHeader';
import Footer from '../components/crucial/SiteFooter';
import Body from './Body';
import { TransactionProvider } from '../context/TransactionContext';

const Home = () => {
  return (
    <div>
      <div className='fixed top-0 left-0 right-0 z-50'>
        <Header />
      </div>
      <div className="min-h-screen bg-[url('/Users/teja/tools.simpleweb3.ch/public/chainIcons/background1.jpg')] bg-cover bg-center">
        <main className="flex-grow flex items-center justify-center mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 w-full py-4">
          <TransactionProvider>
            <Body />
          </TransactionProvider>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Home;