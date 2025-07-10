import React from 'react';

const RetroSendingPopup = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center font-mono">
      <div className="bg-yellow-200 border-4 border-black p-6 text-black w-80 shadow-lg relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />

        <h2 className="text-lg font-bold text-center mb-2">🚀 Sending Transaction</h2>
        <p className="text-sm text-center text-gray-700 animate-pulse">
          Broadcasting your transaction to the Ethereum network...
        </p>
        <div className="text-xs mt-4 text-center tracking-widest">▓▓▓▓░░░░ Loading...</div>
      </div>
    </div>
  );
};

export default RetroSendingPopup;
