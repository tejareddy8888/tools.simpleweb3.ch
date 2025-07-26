// OverrideButton.jsx
import React from "react";

const base =
  "inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] text-[11px] leading-none font-['Press_Start_2P'] px-6 py-3 transition-all duration-75 ease-in w-full sm:w-auto";
const active =
  "bg-[#00FE77] hover:bg-[#c1ef00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc]";
const disabled = "bg-gray-300 cursor-not-allowed opacity-70";

export default function OverrideButton({ shouldBeActive, onClick, className = "" }) {
  return (
    <button
      type="button"
      disabled={!shouldBeActive}
      onClick={onClick}
      className={`${base} ${shouldBeActive ? active : disabled} ${className}`}
      style={{ imageRendering: "pixelated" }}
    >
      Override
    </button>
  );
}
