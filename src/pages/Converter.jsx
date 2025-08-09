import React, { useState, useEffect } from 'react';
import RetroUltimateConverter from '../components/components/widgets/HexDecCalculator.jsx';
import SharedHeader from '../components/crucial/SharedHeader';

const Converter = () => {
    const [activeTab, setActiveTab] = useState('calculator');

    return (
        <div className="min-h-screen w-full px-4 py-12 bg-gradient-to-br from-customCyan to-customPurple">
            <SharedHeader showConnectButton={false} showMenu={true} />
            <div className="px-4 py-12 pt-24">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-['Press_Start_2P'] text-white mb-4">
                            Web3 Converter Tools
                        </h1>
                        <p className="text-lg text-white/80 font-open-sans">
                            Convert between different blockchain units and formats
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-black border-4 border-white p-2 flex gap-2">
                            {[
                                { id: 'calculator', label: 'Calculator' },
                                { id: 'solana', label: 'Solana' },
                                { id: 'custom', label: 'Custom' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                  px-6 py-3 border-2 border-black font-['Press_Start_2P'] text-xs
                  transition-all duration-200
                  ${activeTab === tab.id
                                            ? 'bg-customTangerine text-black shadow-[4px_4px_0_0_black]'
                                            : 'bg-white text-black hover:bg-gray-200'
                                        }
                `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex justify-center">
                        {activeTab === 'calculator' && <RetroUltimateConverter />}
                        {activeTab === 'solana' && <SolanaConverter />}
                        {activeTab === 'custom' && <CustomConverter />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Solana Converter Component
const SolanaConverter = () => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('SOL2LAMPORTS');
    const [result, setResult] = useState('0');

    // Auto-convert whenever input or mode changes
    useEffect(() => {
        convert();
    }, [input, mode]);

    const convert = () => {
        try {
            if (!input.trim()) {
                setResult('0');
                return;
            }

            let output;
            if (mode === 'SOL2LAMPORTS') {
                const sol = parseFloat(input);
                if (isNaN(sol)) throw new Error();
                output = BigInt(Math.round(sol * 1e9)).toString() + ' Lamports';
            } else {
                const lamports = BigInt(input.trim());
                const sol = Number(lamports) / 1e9;
                output = sol.toString() + ' SOL';
            }
            setResult(output);
        } catch {
            setResult('ERROR');
        }
    };

    const clear = () => {
        setInput('');
        setResult('0');
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text.trim());
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const copyResult = async () => {
        try {
            // Extract just the number part without the unit
            const numericResult = result.replace(/ (Lamports|SOL)$/, '');
            await navigator.clipboard.writeText(numericResult);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <div className="bg-white border-4 border-black p-6 w-80 font-['Press_Start_2P']">
            <h3 className="text-lg mb-4 text-center">Solana Converter</h3>

            {/* Mode Toggle */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                {[
                    { label: 'SOL → Lamports', val: 'SOL2LAMPORTS' },
                    { label: 'Lamports → SOL', val: 'LAMPORTS2SOL' }
                ].map(({ label, val }) => (
                    <button
                        key={val}
                        onClick={() => setMode(val)}
                        className={`
              p-2 text-xs border-2 border-black
              ${mode === val ? 'bg-customTangerine' : 'bg-gray-200'}
            `}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="mb-4">
                <label className="block text-xs mb-2">
                    {mode === 'SOL2LAMPORTS' ? 'SOL Amount:' : 'Lamports Amount:'}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border-2 border-black text-xs"
                        placeholder={mode === 'SOL2LAMPORTS' ? '1.5' : '1500000000'}
                    />
                    <button
                        onClick={handlePaste}
                        className="px-3 py-2 bg-blue-500 text-white border-2 border-black text-xs hover:bg-blue-600"
                        title="Paste from clipboard"
                    >
                        📋
                    </button>
                </div>
            </div>

            {/* Result */}
            <div className="mb-4">
                <label className="block text-xs mb-2">Result:</label>
                <div className="flex gap-2">
                    <div className="flex-1 p-2 border-2 border-black bg-gray-100 text-xs min-h-[40px] break-all">
                        {result}
                    </div>
                    <button
                        onClick={copyResult}
                        className="px-3 py-2 bg-green-500 text-white border-2 border-black text-xs hover:bg-green-600"
                        title="Copy result to clipboard"
                    >
                        📄
                    </button>
                </div>
            </div>

            {/* Clear Button */}
            <div className="flex justify-center">
                <button
                    onClick={clear}
                    className="px-6 py-2 bg-gray-300 border-2 border-black text-xs hover:bg-gray-400"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

// Custom Converter Component
const CustomConverter = () => {
    const [input, setInput] = useState('');
    const [fromUnit, setFromUnit] = useState('wei');
    const [toUnit, setToUnit] = useState('ether');
    const [customDecimals, setCustomDecimals] = useState('18');
    const [result, setResult] = useState('0');

    const predefinedUnits = [
        { value: 'wei', label: 'Wei (0 decimals)', decimals: 0 },
        { value: 'gwei', label: 'Gwei (9 decimals)', decimals: 9 },
        { value: 'ether', label: 'Ether (18 decimals)', decimals: 18 },
        { value: 'lamports', label: 'Lamports (0 decimals)', decimals: 0 },
        { value: 'sol', label: 'SOL (9 decimals)', decimals: 9 },
        { value: 'custom', label: 'Custom Decimals', decimals: null }
    ];

    // Auto-convert whenever input, units, or custom decimals change
    useEffect(() => {
        convert();
    }, [input, fromUnit, toUnit, customDecimals]);

    const getDecimals = (unit) => {
        if (unit === 'custom') return parseInt(customDecimals) || 0;
        return predefinedUnits.find(u => u.value === unit)?.decimals || 0;
    };

    const convert = () => {
        try {
            if (!input.trim()) {
                setResult('0');
                return;
            }

            const fromDec = getDecimals(fromUnit);
            const toDec = getDecimals(toUnit);

            let value;
            if (input.includes('.')) {
                // Handle decimal input
                const [whole, fraction = ''] = input.split('.');
                const wholeBig = BigInt(whole || '0');
                const fractionBig = BigInt(fraction.padEnd(fromDec, '0').slice(0, fromDec));
                value = wholeBig * BigInt(10 ** fromDec) + fractionBig;
            } else {
                value = BigInt(input) * BigInt(10 ** fromDec);
            }

            // Convert to target unit
            if (fromDec === toDec) {
                setResult(input);
            } else if (fromDec > toDec) {
                const divisor = BigInt(10 ** (fromDec - toDec));
                setResult((value / divisor).toString());
            } else {
                const multiplier = BigInt(10 ** (toDec - fromDec));
                setResult((value * multiplier).toString());
            }
        } catch (error) {
            setResult('ERROR');
        }
    };

    const clear = () => {
        setInput('');
        setResult('0');
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text.trim());
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const copyResult = async () => {
        try {
            await navigator.clipboard.writeText(result);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <div className="bg-white border-4 border-black p-6 w-96 font-['Press_Start_2P']">
            <h3 className="text-lg mb-4 text-center">Custom Converter</h3>

            {/* Input */}
            <div className="mb-4">
                <label className="block text-xs mb-2">Amount:</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border-2 border-black text-xs"
                        placeholder="Enter amount"
                    />
                    <button
                        onClick={handlePaste}
                        className="px-3 py-2 bg-blue-500 text-white border-2 border-black text-xs hover:bg-blue-600"
                        title="Paste from clipboard"
                    >
                        📋
                    </button>
                </div>
            </div>


            {/* From Unit */}
            <div className="mb-4">
                <label className="block text-xs mb-2">From:</label>
                <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full p-2 border-2 border-black text-xs"
                >
                    {predefinedUnits.map(unit => (
                        <option key={unit.value} value={unit.value}>
                            {unit.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* To Unit */}
            <div className="mb-4">
                <label className="block text-xs mb-2">To:</label>
                <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full p-2 border-2 border-black text-xs"
                >
                    {predefinedUnits.map(unit => (
                        <option key={unit.value} value={unit.value}>
                            {unit.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Custom Decimals */}
            {(fromUnit === 'custom' || toUnit === 'custom') && (
                <div className="mb-4">
                    <label className="block text-xs mb-2">Custom Decimals:</label>
                    <input
                        type="number"
                        value={customDecimals}
                        onChange={(e) => setCustomDecimals(e.target.value)}
                        className="w-full p-2 border-2 border-black text-xs"
                        min="0"
                        max="77"
                        placeholder="18"
                    />
                </div>
            )}

            {/* Result */}
            <div className="mb-4">
                <label className="block text-xs mb-2">Result:</label>
                <div className="flex gap-2">
                    <div className="flex-1 p-2 border-2 border-black bg-gray-100 text-xs min-h-[40px] break-all">
                        {result}
                    </div>
                    <button
                        onClick={copyResult}
                        className="px-3 py-2 bg-green-500 text-white border-2 border-black text-xs hover:bg-green-600"
                        title="Copy result to clipboard"
                    >
                        📄
                    </button>
                </div>
            </div>

            {/* Unit Info Display */}
            <div className="mb-4 p-2 bg-gray-50 border-2 border-gray-300 text-xs">
                <div className="mb-1">
                    <strong>From:</strong> {fromUnit === 'custom' ? `Custom (${customDecimals} decimals)` : predefinedUnits.find(u => u.value === fromUnit)?.label}
                </div>
                <div>
                    <strong>To:</strong> {toUnit === 'custom' ? `Custom (${customDecimals} decimals)` : predefinedUnits.find(u => u.value === toUnit)?.label}
                </div>
            </div>

            {/* Clear Button */}
            <div className="flex justify-center">
                <button
                    onClick={clear}
                    className="px-6 py-2 bg-gray-300 border-2 border-black text-xs hover:bg-gray-400"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default Converter;