import React, { useState, useRef, useEffect } from 'react';

export default function RetroUltimateConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('ETH2WEI');
  const [display, setDisplay] = useState('0');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const inputRef = useRef(null);

  const switchMode = (m) => {
    setMode(m);
    setInput('');
    setDisplay('0');
  };

  const appendChar = (ch) => {
    if (input.length < 24) setInput((prev) => prev + ch.toUpperCase());
  };

  const compute = () => {
    try {
      let out;
      switch (mode) {
        case 'ETH2WEI': {
          const eth = parseFloat(input);
          if (isNaN(eth)) throw new Error();
          out = BigInt(Math.round(eth * 1e18)).toString() + ' Wei';
          break;
        }
        case 'WEI2ETH': {
          const wei = BigInt(input.trim());
          const whole = wei / BigInt('1000000000000000000');
          const rem = wei % BigInt('1000000000000000000');
          const frac = rem.toString().padStart(18, '0').replace(/0+$/, '');
          out = whole.toString() + (frac ? '.' + frac : '') + ' ETH';
          break;
        }
        case 'HEX2DEC': {
          out = parseInt(input, 16).toString(10) + ' Dec';
          break;
        }
        case 'DEC2HEX': {
          const dec = parseInt(input, 10);
          if (isNaN(dec)) throw new Error();
          out = '0x' + dec.toString(16).toUpperCase();
          break;
        }
        default:
          out = 'ERROR';
      }
      setDisplay(out);
    } catch {
      setDisplay('ERROR');
    }
  };

  const clearAll = () => {
    setInput('');
    setDisplay('0');
  };

  const isHexMode = mode === 'HEX2DEC';
  const isDecimalMode = mode === 'DEC2HEX';
  const isEthWeiMode = mode === 'ETH2WEI' || mode === 'WEI2ETH';

  const keys = isHexMode
    ? ['A', 'B', 'C', 'D', 'E', 'F', '7', '8', '9', '4', '5', '6', '1', '2', '3', '0']
    : ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', ...(isEthWeiMode ? ['.'] : [])];


  // Add these new functions after the existing functions
  const validateInput = (value) => {
    const cleanValue = value.trim();

    switch (mode) {
      case 'ETH2WEI':
        return /^[0-9]*\.?[0-9]*$/.test(cleanValue) && cleanValue.length <= 24;
      case 'WEI2ETH':
        return /^[0-9]*$/.test(cleanValue) && cleanValue.length <= 24;
      case 'HEX2DEC':
        return /^[0-9A-Fa-f]*$/.test(cleanValue) && cleanValue.length <= 24;
      case 'DEC2HEX':
        return /^[0-9]*$/.test(cleanValue) && cleanValue.length <= 24;
      default:
        return false;
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanText = text.trim().replace(/^0x/i, '');

      if (validateInput(cleanText)) {
        setInput(cleanText.toUpperCase());
      } else {
        setDisplay('INVALID PASTE');
        setTimeout(() => setDisplay('0'), 2000);
      }
    } catch (error) {
      setDisplay('PASTE FAILED');
      setTimeout(() => setDisplay('0'), 2000);
    }
  };

  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 1500);
    } catch (error) {
      setDisplay('COPY FAILED');
      setTimeout(() => setDisplay('0'), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      handlePaste();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && display !== '0' && display !== 'ERROR') {
      e.preventDefault();
      handleCopy(display);
    }
  };

  // Add this useEffect after existing state declarations
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  return (
    <div
      className="
    relative w-[272px] h-[520px] mx-auto mt-8 p-0
    bg-[#4ba3d1] border-4 border-black
    text-black font-[Press_Start_2P]
  "
      style={{ imageRendering: 'pixelated' }}
      tabIndex={0}
      ref={inputRef}
      onKeyDown={handleKeyDown}
    >

      {showCopySuccess && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-[8px] z-10 border-2 border-black">
          COPIED!
        </div>
      )}
      {/* Top bevel */}
      <div className="h-4 bg-[#0c5671] border-b-2 border-black" />

      {/* Display */}
      <div
        className="h-16 bg-[#ccc] border-4 border-black m-2 p-1 text-xs whitespace-pre-wrap break-all cursor-pointer hover:bg-[#ddd] transition-colors"
        onClick={() => {
          if (display !== '0' && display !== 'ERROR') {
            handleCopy(display);
          }
        }}
        title="Click to copy result"
      >
        {display}
      </div>

      {/* Mode toggles (4 modes) */}
      <div className="mx-2 mb-2 grid grid-cols-2 gap-1">
        {[
          { label: 'ETH→Wei', val: 'ETH2WEI' },
          { label: 'Wei→ETH', val: 'WEI2ETH' },
          { label: 'Hex→Dec', val: 'HEX2DEC' },
          { label: 'Dec→Hex', val: 'DEC2HEX' },
        ].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => switchMode(val)}
            className={`
              h-8 text-[10px] border-4 border-black
              ${mode === val ? 'bg-[#ffdb2a]' : 'bg-[#e0e0e0]'}
            `}
            style={{ boxShadow: '-2px -2px 0 #777 inset,2px 2px 0 #777 inset' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input console */}
      <div
        className="mx-2 mb-2 h-8 bg-black border-4 border-black px-1 text-xs text-green-400 flex items-center justify-between whitespace-nowrap overflow-hidden cursor-pointer hover:bg-gray-900 transition-colors"
        onClick={handlePaste}
        title="Click to paste or Ctrl+V"
      >
        <span className="flex-1 text-right">
          {input || <span className="text-green-700">Enter...</span>}
        </span>
        <span className="text-green-600 ml-2 text-[8px]">📋</span>
      </div>

      <div className="mx-2 mb-2 grid grid-cols-2 gap-1">
        <button
          onClick={handlePaste}
          className="h-8 bg-[#9370db] border-4 border-black flex items-center justify-center text-[8px] text-white"
          style={{ boxShadow: '-2px -2px 0 #663399 inset,2px 2px 0 #663399 inset' }}
          title="Paste from clipboard"
        >
          PASTE
        </button>
        <button
          onClick={() => {
            if (display !== '0' && display !== 'ERROR') {
              handleCopy(display);
            }
          }}
          className="h-8 bg-[#32cd32] border-4 border-black flex items-center justify-center text-[8px] text-white"
          style={{ boxShadow: '-2px -2px 0 #228b22 inset,2px 2px 0 #228b22 inset' }}
          title="Copy result"
        >
          COPY
        </button>
      </div>
      {/* Keypad grid */}
      <div className={`mx-2 grid grid-cols-3 ${keys.length > 12 ? 'grid-rows-6' : 'grid-rows-4'} gap-2`}>
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => appendChar(k)}
            className="bg-[#f5f1de] border-4 border-black flex items-center justify-center text-lg"
            style={{ boxShadow: '-2px -2px 0 #777 inset,2px 2px 0 #777 inset' }}
          >
            {k}
          </button>
        ))}

        {/* Compute */}
        <button
          onClick={compute}
          className="row-span-2 bg-[#d14b4b] border-4 border-black flex items-center justify-center text-2xl"
          style={{ boxShadow: '-2px -2px 0 #771d1d inset,2px 2px 0 #771d1d inset' }}
        >
          =
        </button>

        {/* CLR & SET */}
        <button
          onClick={clearAll}
          className="bg-[#e0e0e0] border-4 border-black flex items-center justify-center text-base"
          style={{ boxShadow: '-2px -2px 0 #777 inset,2px 2px 0 #777 inset' }}
        >
          CLR
        </button>
        <button
          onClick={() => setDisplay(input)}
          className="bg-[#e0e0e0] border-4 border-black flex items-center justify-center text-base"
          style={{ boxShadow: '-2px -2px 0 #777 inset,2px 2px 0 #777 inset' }}
        >
          SET
        </button>
      </div>

      {/* Bottom shell */}
      <div className="h-4 bg-[#2a8ec3] border-t-2 border-black mt-2" />
    </div>
  );
}
