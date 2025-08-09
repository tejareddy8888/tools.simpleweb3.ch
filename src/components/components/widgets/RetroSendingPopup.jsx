import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RetroSendingPopup = ({ status = "sending", txHash, onClose }) => {
  const [copied, setCopied] = useState(false);

  const isSending = status === "sending";
  const isSuccess = status === "success";
  const isError   = status === "error";

  const copyHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        style={{ imageRendering: "pixelated", fontFamily: '"Press Start 2P", monospace' }}
      >
        {/* CRT Scanlines */}
        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent 0 2px, rgba(0,0,0,0.35) 2px 3px)",
          }}
        />

        {/* Glitchy card */}
        <motion.div
          key="card"
          initial={{ scale: 0.8, rotate: -6, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.9, rotate: 6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative w-80 max-w-[90vw] bg-yellow-200 border-[6px] border-black p-6 text-black shadow-[8px_8px_0_0_#000]"
        >
          {/* pixel corners */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />

          {/* Title */}
          <h2 className="text-lg font-bold text-center mb-3">
            {isSending && "🚀 SENDING TRANSACTION"}
            {isSuccess && "✅ SENT!"}
            {isError   && "❌ FAILED!"}
          </h2>

          {/* ASCII status text */}
          <div className="text-xs text-center tracking-widest mb-3">
            {isSending && "▓▓▓▓░░░░  LOADING..."}
            {isSuccess && "████████  DONE"}
            {isError   && "░░░░░░░░  ERROR"}
          </div>

          {/* Animated pixel blocks (only while sending) */}
          {isSending && (
            <div className="mt-2 flex justify-center">
              <div className="grid grid-cols-3 gap-1 w-16">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-black"
                    animate={{ opacity: [1, 0.2, 1], scale: [1, 0.6, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.07,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success UI */}
          {isSuccess && (
            <div className="mt-2 text-[9px] leading-5 text-center text-gray-900">
              Your tx is on chain!
              {txHash && (
                <>
                  <br />
                  HASH:
                  <br />
                  <span className="break-all block mt-1 px-1 py-1 bg-white border-2 border-black">
                    {txHash}
                  </span>
                  <div className="mt-2 flex gap-2 justify-center">
                    <button
                      onClick={copyHash}
                      className="px-2 py-1 border-2 border-black bg-[#d1ff03] hover:bg-[#c1ef00] shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      {copied ? "COPIED!" : "COPY"}
                    </button>
                    {/* Add your own chain explorer link if you have chainId */}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error UI */}
          {isError && (
            <p className="mt-2 text-[9px] leading-5 text-center text-gray-900">
              Something exploded in cyberspace. Try again!
            </p>
          )}

          {/* Close button */}
          {!isSending && (
            <button
              onClick={onClose}
              className="mt-5 block w-full border-2 border-black bg-[#d1ff03] hover:bg-[#c1ef00]
                         active:translate-x-[1px] active:translate-y-[1px]
                         shadow-[3px_3px_0_0_#000] text-[10px] py-2"
            >
              CLOSE
            </button>
          )}

          {/* Tiny green scanline at bottom */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 w-28 bg-[#00FE77]" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RetroSendingPopup;
