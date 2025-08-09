import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { motion } from 'framer-motion';
import SharedHeader from '../components/crucial/SharedHeader';

const Sign = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { isConnected, address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    // Clear signature when message changes
    useEffect(() => {
        setSignature('');
        setError('');
    }, [message]);

    const handleSign = async () => {
        if (!message.trim()) {
            setError('Please enter a message to sign');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const sig = await signMessageAsync({ message: message.trim() });
            setSignature(sig);
        } catch (err) {
            console.error('Signing failed:', err);
            setError(err.message || 'Failed to sign message');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setMessage('');
        setSignature('');
        setError('');
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (err) {
            console.error(`Failed to copy ${type}:`, err);
        }
    };

    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setMessage(text);
        } catch (err) {
            console.error('Failed to paste from clipboard:', err);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-customCyan to-customPurple">
            {/* Add SharedHeader */}
            <SharedHeader showConnectButton={true} showMenu={true} />

            <div className="px-4 py-12 pt-24">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl font-['Press_Start_2P'] text-white mb-4">
                            Message Signer
                        </h1>
                        <p className="text-lg text-white/80 font-open-sans">
                            Sign raw messages with your connected wallet
                        </p>
                    </motion.div>

                    {/* Wallet Connection Status */}
                    <motion.div
                        className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                                <span className="text-white font-['Press_Start_2P'] text-sm">
                                    {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                                </span>
                            </div>
                            {isConnected && (
                                <span className="text-white/70 font-mono text-xs">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Message Input Section */}
                    <motion.div
                        className="bg-black bg-opacity-25 p-6 rounded-lg shadow-md mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h3 className="text-white font-['Press_Start_2P'] text-lg mb-4">
                            Message to Sign
                        </h3>

                        <div className="mb-4">
                            <label className="block text-white/80 font-['Press_Start_2P'] text-xs mb-2">
                                Raw Message:
                            </label>
                            <div className="flex gap-2">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your raw message here..."
                                    className="flex-1 p-3 border-2 border-white bg-white/90 text-black font-mono text-sm rounded resize-none"
                                    rows={4}
                                />
                                <button
                                    onClick={pasteFromClipboard}
                                    className="px-3 py-2 bg-blue-500 text-white border-2 border-white font-['Press_Start_2P'] text-xs hover:bg-blue-600 transition-colors"
                                    title="Paste from clipboard"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        {/* Sign Button or Connection Message */}
                        <div className="flex flex-col items-center gap-4">
                            {isConnected ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSign}
                                        disabled={!message.trim() || isLoading}
                                        className={`
                                        px-8 py-3 border-2 border-white font-['Press_Start_2P'] text-sm
                                        transition-all duration-200 shadow-[4px_4px_0_0_white]
                                        ${!message.trim() || isLoading
                                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                                : 'bg-customTangerine text-black hover:bg-opacity-80 hover:shadow-[6px_6px_0_0_white]'
                                            }
                                    `}
                                    >
                                        {isLoading ? 'Signing...' : 'Sign Message'}
                                    </button>

                                    <button
                                        onClick={handleClear}
                                        className="px-6 py-3 bg-gray-600 text-white border-2 border-white font-['Press_Start_2P'] text-sm hover:bg-gray-700 transition-colors shadow-[4px_4px_0_0_white]"
                                    >
                                        Clear
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-white/80 font-['Press_Start_2P'] text-sm mb-2">
                                        Please connect wallet first
                                    </p>
                                    <div className="w-16 h-1 bg-red-400 mx-auto"></div>
                                </div>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <motion.div
                                className="mt-4 p-3 bg-red-500/20 border-2 border-red-400 rounded"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-red-200 font-['Press_Start_2P'] text-xs">
                                    Error: {error}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Signature Output Section */}
                    {signature && (
                        <motion.div
                            className="bg-black bg-opacity-25 p-6 rounded-lg shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-white font-['Press_Start_2P'] text-lg mb-4">
                                Signature Result
                            </h3>

                            <div className="space-y-4">
                                {/* Original Message */}
                                <div>
                                    <label className="block text-white/80 font-['Press_Start_2P'] text-xs mb-2">
                                        Original Message:
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-3 bg-gray-800 border-2 border-white/30 rounded font-mono text-sm text-white/90 break-all">
                                            {message}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(message, 'message')}
                                            className="px-3 py-2 bg-green-500 text-white border-2 border-white font-['Press_Start_2P'] text-xs hover:bg-green-600 transition-colors"
                                            title="Copy message"
                                        >
                                            📄
                                        </button>
                                    </div>
                                </div>

                                {/* Signature */}
                                <div>
                                    <label className="block text-white/80 font-['Press_Start_2P'] text-xs mb-2">
                                        Signature:
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-3 bg-gray-800 border-2 border-white/30 rounded font-mono text-sm text-green-400 break-all">
                                            {signature}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(signature, 'signature')}
                                            className="px-3 py-2 bg-green-500 text-white border-2 border-white font-['Press_Start_2P'] text-xs hover:bg-green-600 transition-colors"
                                            title="Copy signature"
                                        >
                                            📄
                                        </button>
                                    </div>
                                </div>

                                {/* Signer Address */}
                                <div>
                                    <label className="block text-white/80 font-['Press_Start_2P'] text-xs mb-2">
                                        Signer Address:
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-3 bg-gray-800 border-2 border-white/30 rounded font-mono text-sm text-blue-400">
                                            {address}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(address, 'address')}
                                            className="px-3 py-2 bg-green-500 text-white border-2 border-white font-['Press_Start_2P'] text-xs hover:bg-green-600 transition-colors"
                                            title="Copy address"
                                        >
                                            📄
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sign;