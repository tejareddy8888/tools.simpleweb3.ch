import React from "react";
import { useTransaction } from "../../context/TransactionContextCore";


const PixelInput = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  bg = "#fefcd0",
  textColor = "black",
  borderColor = "black",
}) => {
  return (
    <div
      className="relative w-full p-2 mb-4"
      style={{
        imageRendering: "pixelated",
        fontFamily: '"Press Start 2P", monospace',
        backgroundColor: bg,
        border: `3px solid ${borderColor}`,
        color: textColor,
      }}
    >
      {/* Flickering pixel corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-black flicker" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-black flicker" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black flicker" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-black flicker" />

      <label htmlFor={id} className="block text-[10px] mb-1" style={{ color: textColor }}>
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-2 py-2 text-xs outline-none"
        style={{
          backgroundColor: bg,
          color: textColor,
          fontFamily: '"Press Start 2P", monospace',
          imageRendering: "pixelated",
          border: `2px solid ${borderColor}`,
        }}
      />
    </div>
  );
};

const TransactionDetailsInput = () => {
  const {
    toAddress,
    setToAddress,
    data,
    setData,
    valueInWei,
    setEthValue,
    validateInputs,
  } = useTransaction();

  const handleSubmit = (e) => {
    e.preventDefault();
    validateInputs();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PixelInput
        label="To:"
        id="toAddress"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="0x4838B1..."
      />
      <PixelInput
        label="Data:"
        id="data"
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="0x prefixed hex string"
      />
      <PixelInput
        label="Value:"
        id="valueInWei"
        type="number"
        value={valueInWei}
        onChange={(e) => setEthValue(e.target.value)}
        placeholder="Value in Wei"
      />

      
    </form>
  );
};

export default TransactionDetailsInput;
