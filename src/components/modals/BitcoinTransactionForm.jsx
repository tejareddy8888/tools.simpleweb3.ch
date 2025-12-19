// src/components/modals/BitcoinTransactionForm.jsx
import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useBitcoin } from '../../web3/BitcoinWalletProvider';
import {
  sendBitcoinTransaction,
  validateBitcoinAddress,
  detectBitcoinNetwork,
  estimateBitcoinFee,
  getBitcoinBalance,
  getBitcoinExplorerUrl,
} from '../../utils/bitcoinTransaction';

/**
 * Bitcoin Transaction Form Component
 * Handles Bitcoin address input, amount entry, and transaction sending
 */
export default function BitcoinTransactionForm() {
  const btc = useBitcoin();
  const [toAddress, setToAddress] = useState('');
  const [amountBTC, setAmountBTC] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balance, setBalance] = useState(null);
  const [feeEstimate, setFeeEstimate] = useState(null);

  // Check if Bitcoin wallet is connected
  const isConnected = btc?.connected && btc?.address;

  // Fetch balance when component mounts or wallet changes
  React.useEffect(() => {
    if (!isConnected) return;

    const fetchBalance = async () => {
      if (!btc?.address) return;

      setIsLoadingBalance(true);
      try {
        const detectedNetwork = detectBitcoinNetwork(btc.address);
        const bal = await getBitcoinBalance(btc.address, detectedNetwork);
        setBalance(bal);
      } catch (error) {
        console.warn('Failed to fetch Bitcoin balance:', error);
        setBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [btc?.address, isConnected]);

  // Estimate fee when amount changes
  React.useEffect(() => {
    if (!isConnected) return;

    const estimateFee = async () => {
      if (!amountBTC || parseFloat(amountBTC) <= 0) {
        setFeeEstimate(null);
        return;
      }

      try {
        const network = detectBitcoinNetwork(btc.address);
        const feeRate = await estimateBitcoinFee(network, 'normal');
        // Rough estimation: ~150 bytes for a standard TX (simplified)
        const estimatedBytes = 150;
        const estimatedFee = (feeRate * estimatedBytes) / 100000000; // Convert to BTC
        setFeeEstimate(estimatedFee);
      } catch (error) {
        console.warn('Fee estimation failed:', error);
        setFeeEstimate(null);
      }
    };

    estimateFee();
  }, [amountBTC, btc?.address, isConnected]);

  // Validate inputs
  const validateInputs = useCallback(() => {
    if (!toAddress.trim()) {
      toast.error('Please enter a recipient address');
      return false;
    }

    if (!validateBitcoinAddress(toAddress)) {
      toast.error('Invalid Bitcoin address format');
      return false;
    }

    if (!amountBTC || parseFloat(amountBTC) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    const amount = parseFloat(amountBTC);
    if (balance !== null && amount > balance) {
      toast.error(`Insufficient balance. Available: ${balance.toFixed(8)} BTC`);
      return false;
    }

    // Prevent sending to same address
    if (toAddress.toLowerCase() === btc.address.toLowerCase()) {
      toast.error('Cannot send to the same address');
      return false;
    }

    return true;
  }, [toAddress, amountBTC, balance, btc.address]);

  // Handle Bitcoin transaction send
  const handleSendBitcoin = useCallback(async () => {
    if (isSending) return;

    if (!validateInputs()) {
      return;
    }

    setIsSending(true);
    const toastId = toast.loading('Sending Bitcoin transaction...');

    try {
      const network = detectBitcoinNetwork(btc.address);

      // Send the transaction via wallet provider
      const txId = await sendBitcoinTransaction({
        btcProvider: btc.provider,
        fromAddress: btc.address,
        toAddress,
        amountBTC: parseFloat(amountBTC),
        network,
        wallet: btc.wallet,
      });

      // Success!
      toast.dismiss(toastId);
      toast.success('Bitcoin transaction sent!');

      // Show explorer link
      const explorerUrl = getBitcoinExplorerUrl(txId, network);
      if (explorerUrl) {
        toast((t) => (
          <div className="space-y-2">
            <p>View on explorer:</p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300 break-words"
              onClick={() => toast.dismiss(t.id)}
            >
              {txId.substring(0, 16)}...
            </a>
          </div>
        ), { duration: 10000 });
      }

      // Reset form
      setToAddress('');
      setAmountBTC('');
      setFeeEstimate(null);

      console.log('Bitcoin tx:', txId);
    } catch (error) {
      console.error('Bitcoin send error:', error);
      toast.dismiss(toastId);

      let errorMessage = error.message || 'Failed to send Bitcoin transaction';

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by your wallet.';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this transaction.';
      } else if (error.message?.includes('Invalid address')) {
        errorMessage = 'Invalid recipient address.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  }, [btc, toAddress, amountBTC, isSending, validateInputs]);

  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-900/30 border border-yellow-600/50 rounded">
        <p className="text-yellow-400 font-['Press_Start_2P'] text-xs">
          ⚠ Bitcoin wallet not connected. Please connect a Bitcoin wallet to send transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border-2 border-orange-500/40 rounded-lg bg-orange-950/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-orange-400 font-['Press_Start_2P'] text-sm">₿ Bitcoin</span>
        <span className="text-orange-300 text-xs font-['Press_Start_2P']">
          {btc.address ? `${btc.address.substring(0, 12)}...${btc.address.substring(btc.address.length - 8)}` : 'Not connected'}
        </span>
      </div>

      {/* Balance display */}
      {isLoadingBalance ? (
        <div className="text-orange-300 text-xs font-['Press_Start_2P']">
          Loading balance...
        </div>
      ) : balance !== null ? (
        <div className="text-orange-300 text-xs font-['Press_Start_2P']">
          Balance: {balance.toFixed(8)} BTC
        </div>
      ) : null}

      {/* Recipient Address */}
      <div>
        <label className="text-orange-300 font-['Press_Start_2P'] text-xs block mb-2">
          To Address:
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="bc1... or 1... or 3... (Bitcoin address)"
          className="w-full px-3 py-2 bg-black border-2 border-orange-500 text-orange-300 placeholder-orange-600 font-mono text-sm focus:outline-none focus:border-orange-300"
          disabled={isSending}
        />
        {toAddress && !validateBitcoinAddress(toAddress) && (
          <p className="text-red-400 text-xs font-['Press_Start_2P'] mt-1">Invalid address</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="text-orange-300 font-['Press_Start_2P'] text-xs block mb-2">
          Amount (BTC):
        </label>
        <input
          type="number"
          value={amountBTC}
          onChange={(e) => setAmountBTC(e.target.value)}
          placeholder="0.001"
          step="0.00000001"
          min="0"
          className="w-full px-3 py-2 bg-black border-2 border-orange-500 text-orange-300 placeholder-orange-600 font-mono text-sm focus:outline-none focus:border-orange-300"
          disabled={isSending}
        />
      </div>

      {/* Fee estimate */}
      {feeEstimate !== null && (
        <div className="text-orange-300 text-xs font-['Press_Start_2P'] bg-black/50 p-2 rounded">
          Est. fee: {feeEstimate.toFixed(8)} BTC
          {amountBTC && balance !== null && (
            <div className="text-orange-400 mt-1">
              Total: {(parseFloat(amountBTC) + feeEstimate).toFixed(8)} BTC
            </div>
          )}
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSendBitcoin}
        disabled={isSending || !toAddress || !amountBTC}
        className={`
          w-full px-4 py-3 font-['Press_Start_2P'] text-xs
          border-2 rounded
          transition-all duration-200
          ${isSending || !toAddress || !amountBTC
            ? 'bg-orange-950/50 border-orange-700/50 text-orange-700/50 cursor-not-allowed'
            : 'bg-orange-600 border-orange-300 text-black hover:bg-orange-500 hover:border-orange-200 cursor-pointer'
          }
        `}
      >
        {isSending ? 'Sending...' : 'Send Bitcoin'}
      </button>

      {/* Info text */}
      <div className="text-orange-300/70 text-xs font-['Press_Start_2P']">
        💡 Confirm the transaction in your wallet to proceed.
      </div>
    </div>
  );
}
