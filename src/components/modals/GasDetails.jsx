// src/components/modals/GasDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { estimateGas } from "../../reducer/gasEstimation";
import { useTransaction } from "../../context/TransactionContextCore";

// ────────────────────────────── Constants ──────────────────────────────
const MAX_GAS = 1_000_000;
const MIN_GAS = 21_000;
const MAX_PRIORITY = 50;
const MIN_PRIORITY = 1;

const LOADING_FRAMES = [
  "░░░░░░░░",
  "▓░░░░░░░",
  "▓▓░░░░░░",
  "▓▓▓░░░░░",
  "▓▓▓▓░░░░",
  "▓▓▓▓▓░░░",
  "▓▓▓▓▓▓░░",
  "▓▓▓▓▓▓▓░",
  "▓▓▓▓▓▓▓▓",
];

// ────────────────────────── Small UI helpers ───────────────────────────
const PresetBtn = ({ label, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="px-2 py-1 text-[10px] border-2 border-black bg-[#d1ff03] hover:bg-[#c1ef00]
               shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px]"
    style={{ imageRendering: "pixelated" }}
  >
    {label}
  </button>
);

const HoldBtn = ({ label, onPressStart, onPressEnd, color = "#d1ff03", invertText = false }) => (
  <button
    type="button"
    onMouseDown={onPressStart}
    onMouseUp={onPressEnd}
    onMouseLeave={onPressEnd}
    onTouchStart={onPressStart}
    onTouchEnd={onPressEnd}
    className={`px-3 py-1 text-xs border-2 border-black shadow-[3px_3px_0_0_#000] ${
      invertText ? "text-white" : "text-black"
    }`}
    style={{ background: color, imageRendering: "pixelated" }}
  >
    {label}
  </button>
);

// Inline CSS for the pixel slider (no extra files)
const PixelRangeStyles = () => (
  <style>{`
    .pixel-range {
      -webkit-appearance: none; appearance: none;
      width: 100%; height: 18px;
      border: 2px solid #000;
      box-shadow: inset 0 0 0 2px #000, 3px 3px 0 0 #000;
      image-rendering: pixelated;
      background-image:
        linear-gradient(to right, #d1ff03 var(--fill, 0%), transparent var(--fill, 0%)),
        repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 12px),
        linear-gradient(#fffbe6, #fffbe6);
      background-size: 100% 100%, 100% 100%, 100% 100%;
      background-repeat: no-repeat;
    }
    .pixel-range:focus { outline: none; }
    .pixel-range::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 18px; height: 18px; background: #d1ff03;
      border: 2px solid #000; box-shadow: 2px 2px 0 #000; margin-top: -2px;
    }
    .pixel-range::-moz-range-thumb {
      width: 18px; height: 18px; background: #d1ff03;
      border: 2px solid #000; box-shadow: 2px 2px 0 #000;
    }
    .pixel-range::-moz-range-track { height: 18px; background: transparent; border: none; }
    .pixel-range:active::-webkit-slider-thumb,
    .pixel-range:active::-moz-range-thumb { transform: translate(1px,1px); }
  `}</style>
);

// ───────────────────────── Component ─────────────────────────
const GasDetailsOutput = ({ txType }) => {
  const dispatch = useDispatch();
  const {
    toAddress,
    data,
    valueInWei,
    account,
    client,
    isTxInputValid,
    setUserGasLimit,
  } = useTransaction();

  const { estimatedGas, status, error } = useSelector((s) => s.gasEstimation);

  // UI state
  const [gas, setGas] = useState(MIN_GAS);
  const [feeData, setFeeData] = useState({
    baseFeePerGas: "30",
    maxPriorityFeePerGas: "2",
  });

  // debounced “recalculating…” state + simple ASCII loader
  const [debouncing, setDebouncing] = useState(false);
  const [frame, setFrame] = useState(0);

  // timers for holding +/- buttons
  const gasIncTimer = useRef(null);
  const gasDecTimer = useRef(null);
  const priorityIncTimer = useRef(null);
  const priorityDecTimer = useRef(null);
  const debounceTimer = useRef(null);

  // ── Debounce re-estimates by 3s after any relevant input change
  useEffect(() => {
    if (!(isTxInputValid && client && account?.address)) return;
    setDebouncing(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      dispatch(
        estimateGas({
          client,
          account: account.address,
          from: account.address,
          to: toAddress,
          data,
          value: valueInWei,
        })
      );
      setDebouncing(false);
    }, 3000);

    return () => debounceTimer.current && clearTimeout(debounceTimer.current);
  }, [dispatch, isTxInputValid, client, account?.address, toAddress, data, valueInWei]);

  // ASCII progress animation while debouncing or Redux is loading
  useEffect(() => {
    if (debouncing || status === "loading") {
      const id = setInterval(() => setFrame((p) => (p + 1) % LOADING_FRAMES.length), 150);
      return () => clearInterval(id);
    }
  }, [debouncing, status]);

  // adopt estimate
  useEffect(() => {
    if (estimatedGas && status === "succeeded") {
      setGas(clamp(Number(estimatedGas)));
    }
  }, [estimatedGas, status]);

  // reflect gas into context (for the actual send)
  useEffect(() => {
    setUserGasLimit?.(gas);
  }, [gas, setUserGasLimit]);

  // hold-to-repeat helpers
  const startHold = (fn, ref) => {
    fn();
    ref.current = setInterval(fn, 100);
  };
  const stopHold = (ref) => {
    if (ref.current) clearInterval(ref.current);
    ref.current = null;
  };

  const percent = ((gas - MIN_GAS) / (MAX_GAS - MIN_GAS)) * 100;
  const maxFee =
    parseFloat(feeData.baseFeePerGas || "0") + parseFloat(feeData.maxPriorityFeePerGas || "0");

  const networkName = client?.chain?.name || "Unknown";

  // ── Error state
  if (status === "failed") {
    return (
      <>
        <PixelRangeStyles />
        <div className="relative p-4 bg-white border-4 border-red-600 text-red-600 font-mono shadow-[6px_6px_0_0_#000]">
          <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />
          <div className="text-xs font-bold">❌ GAS MODULE ERROR</div>
          <div className="mt-2 text-[11px]">{String(error || "Unknown error")}</div>
        </div>
      </>
    );
  }

  // ── Debounce/Loading state (calm, non‑glitchy)
  if (debouncing || status === "loading") {
    return (
      <>
        <PixelRangeStyles />
        <div
          className="relative p-4 bg-white border-[6px] border-black font-mono shadow-[6px_6px_0_0_#000]"
          style={{ imageRendering: "pixelated" }}
        >
          <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />

          <div className="text-xs font-bold">Recalculating Gas…</div>
          <pre className="mt-2 text-xs tracking-widest">[{LOADING_FRAMES[frame]}]</pre>

          <div className="mt-3 h-2 bg-black border-2 border-black">
            <div className="h-full bg-[#d1ff03] animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </>
    );
  }

  // ── Main UI
  return (
    <>
      <PixelRangeStyles />
      <div
        className="relative px-4 py-5 bg-white text-black border-[6px] border-black mb-6 w-full max-w-2xl mx-auto shadow-[6px_6px_0_0_#000]"
        style={{ imageRendering: "pixelated" }}
      >
        {/* corners */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />

        {/* Heading */}
        <h2 className="text-sm sm:text-base font-['Press_Start_2P'] mb-4">GAS LAB</h2>

        {/* Gas readout + presets */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="font-bold">→ Gas:</span>{" "}
            <span className="text-[#6200ea]">0x{parseFloat(gas).toString(16).toUpperCase()}</span>
            <span className="ml-1 text-gray-700">({gas} units)</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <PresetBtn label="LOW" onClick={() => setGas(clamp(MIN_GAS + 5_000))} />
            <PresetBtn label="AVG" onClick={() => setGas(clamp(Math.round((MIN_GAS + MAX_GAS) / 2)))} />
            <PresetBtn label="FAST" onClick={() => setGas(clamp(MAX_GAS - 5_000))} />
            <PresetBtn  
              label="EST"
              title="Use estimate"
              onClick={() => estimatedGas && setGas(clamp(Number(estimatedGas)))}
            />
          </div>
        </div>

        {/* Slider + hold buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HoldBtn
              label="-"
              onPressStart={() => startHold(() => setGas((p) => clamp(p - 1000)), gasDecTimer)}
              onPressEnd={() => stopHold(gasDecTimer)}
              color="#d1ff03"
            />
            <input
              type="range"
              min={MIN_GAS}
              max={MAX_GAS}
              step={1000}
              value={gas}
              onChange={(e) => setGas(clamp(Number(e.target.value)))}
              className="pixel-range flex-1"
              style={{ "--fill": `${percent}%` }}
            />
            <HoldBtn
              label="+"
              onPressStart={() => startHold(() => setGas((p) => clamp(p + 1000)), gasIncTimer)}
              onPressEnd={() => stopHold(gasIncTimer)}
              color="#d1ff03"
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-700">
            <span>MIN</span>
            <span>{Math.round(percent)}%</span>
            <span>MAX</span>
          </div>
        </div>

        {/* EIP‑1559 (Type 2) */}
        {txType === "id" && (
          <div className="mt-5 border-t-2 border-black pt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Priority fee */}
              <div>
                <div className="font-bold mb-2 text-sm">→ Max Priority Fee</div>
                <input
                  type="range"
                  min={MIN_PRIORITY}
                  max={MAX_PRIORITY}
                  step={1}
                  value={parseInt(feeData.maxPriorityFeePerGas) || MIN_PRIORITY}
                  onChange={(e) =>
                    setFeeData((p) => ({ ...p, maxPriorityFeePerGas: String(e.target.value) }))
                  }
                  className="pixel-range w-full"
                  style={{
                    "--fill": `${
                      ((parseInt(feeData.maxPriorityFeePerGas || "0") - MIN_PRIORITY) /
                        (MAX_PRIORITY - MIN_PRIORITY)) *
                      100
                    }%`,
                  }}
                />
                <div className="mt-2 flex items-center gap-3">
                  <HoldBtn
                    label="-"
                    color="#ff03e2"
                    invertText
                    onPressStart={() =>
                      startHold(
                        () =>
                          setFeeData((prev) => ({
                            ...prev,
                            maxPriorityFeePerGas: Math.max(
                              parseInt(prev.maxPriorityFeePerGas) - 1,
                              MIN_PRIORITY
                            ).toString(),
                          })),
                        priorityDecTimer
                      )
                    }
                    onPressEnd={() => stopHold(priorityDecTimer)}
                  />
                  <span className="text-xs text-gray-700">
                    {feeData.maxPriorityFeePerGas} GWEI
                  </span>
                  <HoldBtn
                    label="+"
                    color="#ff03e2"
                    invertText
                    onPressStart={() =>
                      startHold(
                        () =>
                          setFeeData((prev) => ({
                            ...prev,
                            maxPriorityFeePerGas: Math.min(
                              parseInt(prev.maxPriorityFeePerGas) + 1,
                              MAX_PRIORITY
                            ).toString(),
                          })),
                        priorityIncTimer
                      )
                    }
                    onPressEnd={() => stopHold(priorityIncTimer)}
                  />
                </div>
              </div>

              {/* Max fee (readout + quick presets) */}
              <div>
                <div className="font-bold text-sm mb-2">→ Max Fee</div>
                <div className="px-3 py-2 border-2 border-black bg-[#FFFCE5] inline-block text-sm">
                  {Number.isFinite(maxFee) ? maxFee.toFixed(2) : "--"} GWEI
                </div>
                <div className="mt-3 flex gap-2">
                  <PresetBtn
                    label="SAFE"
                    onClick={() => setFeeData((p) => ({ ...p, maxPriorityFeePerGas: "2" }))}
                  />
                  <PresetBtn
                    label="BOOST"
                    onClick={() => setFeeData((p) => ({ ...p, maxPriorityFeePerGas: "5" }))}
                  />
                  <PresetBtn
                    label="MAX"
                    onClick={() =>
                      setFeeData((p) => ({ ...p, maxPriorityFeePerGas: String(MAX_PRIORITY) }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network section */}
        <div className="mt-5 p-3 border-2 border-black bg-[#FFFCE5] inline-flex items-center gap-3 text-[11px]">
          <span className="font-bold">→ Network:</span>
          <span className="text-[#007bff]">{networkName}</span>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────── Helpers ───────────────────────────
function clamp(v) {
  return Math.max(MIN_GAS, Math.min(v, MAX_GAS));
}

export default GasDetailsOutput;
