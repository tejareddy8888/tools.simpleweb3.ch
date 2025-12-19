import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { sendSolTransfer } from '../../utils/solanaTransaction';

export default function SolanaTransactionForm() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txSig, setTxSig] = useState(null);

  

  const getExplorerUrl = (sig) => {
    try {
      const ep = (connection && connection.rpcEndpoint) || '';
      const cluster = ep.includes('devnet') ? 'devnet' : ep.includes('testnet') ? 'testnet' : 'mainnet';
      return `https://explorer.solana.com/tx/${sig}${cluster === 'mainnet' ? '' : `?cluster=${cluster}`}`;
    } catch (e) {
      return `https://explorer.solana.com/tx/${sig}`;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) return toast.error('Solana wallet not connected');
    let to;
    try {
      to = new PublicKey(recipient);
    } catch (err) {
      return toast.error('Invalid recipient address');
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');

    setSending(true);
    setTxSig(null);
    const t = toast.loading('Signing & sending transaction...');
    try {
      // Prefer wallet adapter's sendTransaction (handles signing + sending) when available
      let sig;
      if (typeof sendTransaction === 'function') {
        // Build a TX and let wallet send it
        const { Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
        const lamports = Math.round(Number(amt) * LAMPORTS_PER_SOL);
        const tx = new Transaction().add(
          SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: to, lamports })
        );
        sig = await sendTransaction(tx, connection);
        // wait for confirmation
        await connection.confirmTransaction(sig);
      } else if (typeof signTransaction === 'function') {
        // Fallback: sign locally then send raw
        sig = await sendSolTransfer({
          connection,
          fromPubkey: publicKey,
          signTransaction,
          to,
          amountSol: amt,
        });
      } else {
        throw new Error('Wallet does not support send or signTransaction');
      }

      setTxSig(sig);
      toast.success('Transaction sent');
      // show explorer link in toast
      const url = getExplorerUrl(sig);
      console.log('Solana tx:', sig, url);
    } catch (err) {
      console.error('Solana send error', err);
      toast.error(err?.message || 'Failed to send Solana transaction');
    } finally {
      toast.dismiss(t);
      setSending(false);
    }
  };

  return (
    <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md border border-white/20">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] text-white">Recipient (Solana)</label>
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full p-2 text-black" placeholder="Recipient address" />
        </div>
        <div>
          <label className="block text-[11px] text-white">Amount (SOL)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 text-black" placeholder="0.01" />
        </div>
        <div className="flex items-center gap-2">
          <button disabled={sending} type="submit" className="px-4 py-2 border-2 border-black bg-[#00FE77] text-black">
            {sending ? 'Sending...' : 'Send SOL'}
          </button>
          {txSig && (
            <a className="text-[11px] underline text-white" target="_blank" rel="noreferrer" href={`https://explorer.solana.com/tx/${txSig}`}>
              View tx
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
