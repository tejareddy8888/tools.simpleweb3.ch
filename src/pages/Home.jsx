import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Body from '../components/Body';
import { TransactionProvider } from '../context/TransactionContext';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-grow flex items-center justify-center mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 w-full py-8">
        <TransactionProvider>
          <Body />
        </TransactionProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
