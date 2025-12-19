import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Send a simple SOL transfer using wallet adapter's signTransaction
 * @param {Object} params
 * @param {import('@solana/web3.js').Connection} params.connection
 * @param {import('@solana/web3.js').PublicKey} params.fromPubkey
 * @param {Function} params.signTransaction - wallet.signTransaction
 * @param {string|import('@solana/web3.js').PublicKey} params.to
 * @param {number|string} params.amountSol
 */
export async function sendSolTransfer({ connection, fromPubkey, signTransaction, to, amountSol }) {
  if (!connection) throw new Error('No connection provided');
  if (!fromPubkey) throw new Error('No fromPubkey provided');
  if (!signTransaction) throw new Error('No signTransaction function provided');
  if (!to) throw new Error('No recipient provided');

  const lamports = Math.round(Number(amountSol) * LAMPORTS_PER_SOL);
  if (!Number.isFinite(lamports) || lamports <= 0) throw new Error('Invalid amount');

  const toPub = typeof to === 'string' ? new (await import('@solana/web3.js')).PublicKey(to) : to;

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: toPub,
      lamports,
    })
  );

  // recent blockhash & fee payer
  const latest = await connection.getLatestBlockhash();
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = fromPubkey;

  // Ask wallet to sign
  const signed = await signTransaction(tx);

  // Send raw transaction
  const sig = await connection.sendRawTransaction(signed.serialize());

  // Wait for confirmation
  await connection.confirmTransaction({
    signature: sig,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  });

  return sig;
}

export async function estimateSolFee(connection) {
  if (!connection) return null;
  try {
    const { value } = await connection.getFeeForMessage(
      (await import('@solana/web3.js')).MessageV0 ? new (await import('@solana/web3.js')).Message() : null
    );
    return value || null;
  } catch (e) {
    return null;
  }
}
