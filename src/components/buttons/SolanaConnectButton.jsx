import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SolanaConnectButton() {
  const { publicKey, connected, signMessage } = useWallet();

  // ✅ dynamically import Solflare so Vite skips pre-bundling @toruslabs/eccrypto
  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        await import('@solana/wallet-adapter-solflare');
      }
    })();
  }, []);

  useEffect(() => {
    async function verifyWallet() {
      if (!connected || !publicKey) return;

      const address = publicKey.toBase58();
      console.log(`🔹 Connected to Solana wallet: ${address}`);

      try {
        const { data } = await axios.post('http://localhost:3001/api/request-nonce', {
          address,
          chain: 'solana',
        });

        const encoded = new TextEncoder().encode(data.nonce);
        const signature = await signMessage(encoded);
        const signatureBase58 = bs58.encode(signature);

        const verifyRes = await axios.post('http://localhost:3001/api/verify-signature', {
          address,
          chain: 'solana',
          signature: signatureBase58,
          nonce: data.nonce,
        });

        if (verifyRes.data.success) console.log('✅ Solana wallet verified!');
        else console.error('❌ Verification failed:', verifyRes.data);
        toast.success(`Solana connected: ${address}`);
      } catch (err) {
        console.error('⚠️ Verification error:', err);
        toast.error('Solana verification error');
      }
    }

    verifyWallet();
  }, [connected, publicKey, signMessage]);

  useEffect(() => {
    if (!connected) {
      toast('Solana disconnected');
    }
  }, [connected]);

  return (
    <div className="flex justify-center">
      <WalletMultiButton className="!bg-green-500 !text-black hover:!bg-green-400" />
    </div>
  );
}
