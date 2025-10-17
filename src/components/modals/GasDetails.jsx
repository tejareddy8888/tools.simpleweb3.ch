// src/components/modals/GasDetailsOutput.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { estimateGas } from "../../reducer/gasEstimation";
import { useTransaction } from "../../context/TransactionContextCore";
import { TxType, MAX_GAS, MIN_GAS, INC_GAS, MAX_PRIORITY, MIN_PRIORITY, INC_PRIORITY } from "../../web3/web3-constants";

// ──────────────────────────── Small UI helpers ────────────────────────────
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

const LOADING_FRAMES = [
    "░░░░░░░░", "▓░░░░░░░", "▓▓░░░░░░", "▓▓▓░░░░░",
    "▓▓▓▓░░░░", "▓▓▓▓▓░░░", "▓▓▓▓▓▓░░", "▓▓▓▓▓▓▓░", "▓▓▓▓▓▓▓▓"
];

// ──────────────────────────── Component ────────────────────────────
const GasDetailsOutput = ({ txType, networkFeeData }) => {
    const dispatch = useDispatch();
    const {
        toAddress, data, valueInWei,
        account, client, isTxInputValid, setUserGasLimit
    } = useTransaction();

    const { estimatedGas, status, error } = useSelector((s) => s.gasEstimation);

    // local UI state
    const [gas, setGas] = useState(MIN_GAS);
    const [feeData, setFeeData] = useState({
        baseFeePerGas: networkFeeData?.formatted?.gasPrice || "30",
        maxPriorityFeePerGas: networkFeeData?.formatted?.maxPriorityFeePerGas || "2"
    });

    const [debouncing, setDebouncing] = useState(false);
    const [frame, setFrame] = useState(0);
    const gasIncTimer = useRef(null);
    const gasDecTimer = useRef(null);
    const priorityIncTimer = useRef(null);
    const priorityDecTimer = useRef(null);
    const debounceTimer = useRef(null);

    // ── Debounced Gas Estimate
    useEffect(() => {
        if (!(isTxInputValid && client && account?.address)) return;
        setDebouncing(true);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            dispatch(estimateGas({
                client,
                from: account.address,
                to: toAddress,
                data,
                value: valueInWei
            }));
            setDebouncing(false);
        }, 2000);

        return () => debounceTimer.current && clearTimeout(debounceTimer.current);
    }, [dispatch, isTxInputValid, client, account?.address, toAddress, data, valueInWei]);

    // Animate loader
    useEffect(() => {
        if (debouncing || status === "loading") {
            const id = setInterval(() => setFrame((p) => (p + 1) % LOADING_FRAMES.length), 150);
            return () => clearInterval(id);
        }
    }, [debouncing, status]);

    useEffect(() => {
        if (estimatedGas && status === "succeeded") {
            setGas(clamp(Number(estimatedGas)));
        }
    }, [estimatedGas, status]);

    useEffect(() => {
        setUserGasLimit?.(gas);
    }, [gas, setUserGasLimit]);

    // Hold-to-repeat
    const startHold = (fn, ref) => { fn(); ref.current = setInterval(fn, 100); };
    const stopHold = (ref) => { if (ref.current) clearInterval(ref.current); ref.current = null; };

    const percent = ((gas - MIN_GAS) / (MAX_GAS - MIN_GAS)) * 100;
    const maxFee = parseFloat(feeData.baseFeePerGas) + parseFloat(feeData.maxPriorityFeePerGas);
    const networkName = client?.chain?.name || "Unknown Network";

    // ── Error
    if (status === "failed") {
        return (
            <>
                <PixelRangeStyles />
                <div className="p-4 bg-white border-4 border-red-600 text-red-600 font-mono shadow-[6px_6px_0_0_#000]">
                    <div className="text-xs font-bold">❌ GAS MODULE ERROR</div>
                    <div className="mt-2 text-[11px]">{String(error || "Unknown error")}</div>
                </div>
            </>
        );
    }

    // ── Loading
    if (debouncing || status === "loading") {
        return (
            <>
                <PixelRangeStyles />
                <div className="p-4 bg-white border-[6px] border-black font-mono shadow-[6px_6px_0_0_#000] text-center">
                    <div className="text-xs font-bold">Recalculating Gas…</div>
                    <pre className="mt-2 text-xs tracking-widest">[{LOADING_FRAMES[frame]}]</pre>
                </div>
            </>
        );
    }

    // ── Main UI
    return (
        <>
            <PixelRangeStyles />
            <div
                className="px-4 py-5 bg-white text-black border-[6px] border-black w-full max-w-md mx-auto font-mono shadow-[6px_6px_0_0_#000]"
                style={{ imageRendering: "pixelated" }}
            >
                <h2 className="text-base font-['Press_Start_2P'] mb-4">⚙ GAS MODULE</h2>

                {/* GAS ADJUST */}
                <div className="flex flex-wrap items-center justify-between mb-3 text-xs">
                    <div>
                        <span className="font-bold">→ Gas:</span>{" "}
                        <span className="text-[#6200ea]">0x{parseFloat(gas).toString(16).toUpperCase()}</span>{" "}
                        <span className="text-gray-700">({gas} units)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <PresetBtn label="LOW" onClick={() => setGas(MIN_GAS + 5000)} />
                        <PresetBtn label="AVG" onClick={() => setGas(Math.round((MIN_GAS + MAX_GAS) / 2))} />
                        <PresetBtn label="FAST" onClick={() => setGas(MAX_GAS - 5000)} />
                        <PresetBtn label="EST" onClick={() => estimatedGas && setGas(Number(estimatedGas))} />
                    </div>
                </div>

                {/* GAS SLIDER */}
                <div className="flex items-center gap-2">
                    <HoldBtn
                        label="-"
                        onPressStart={() => startHold(() => setGas((p) => clamp(p - INC_GAS)), gasDecTimer)}
                        onPressEnd={() => stopHold(gasDecTimer)}
                    />
                    <input
                        type="range"
                        min={MIN_GAS}
                        max={MAX_GAS}
                        step={INC_GAS}
                        value={gas}
                        onChange={(e) => setGas(clamp(Number(e.target.value)))}
                        className="pixel-range flex-1"
                        style={{ "--fill": `${percent}%` }}
                    />
                    <HoldBtn
                        label="+"
                        onPressStart={() => startHold(() => setGas((p) => clamp(p + INC_GAS)), gasIncTimer)}
                        onPressEnd={() => stopHold(gasIncTimer)}
                    />
                </div>

                {/* TYPE 2 (EIP-1559) */}
                {txType === TxType.EIP1559 && (
                    <div className="mt-5 border-t-2 border-black pt-4">
                        <div className="font-bold text-sm mb-2">→ Max Priority Fee</div>
                        <div className="flex items-center gap-2">
                            <HoldBtn
                                label="-"
                                color="#ff03e2"
                                invertText
                                onPressStart={() =>
                                    startHold(
                                        () =>
                                            setFeeData((p) => ({
                                                ...p,
                                                maxPriorityFeePerGas: Math.max(
                                                    parseInt(p.maxPriorityFeePerGas) - INC_PRIORITY,
                                                    MIN_PRIORITY
                                                ).toString(),
                                            })),
                                        priorityDecTimer
                                    )
                                }
                                onPressEnd={() => stopHold(priorityDecTimer)}
                            />
                            <input
                                type="range"
                                min={MIN_PRIORITY}
                                max={MAX_PRIORITY}
                                step={INC_PRIORITY}
                                value={parseInt(feeData.maxPriorityFeePerGas)}
                                onChange={(e) =>
                                    setFeeData((p) => ({ ...p, maxPriorityFeePerGas: e.target.value }))
                                }
                                className="pixel-range flex-1"
                                style={{
                                    "--fill": `${
                                        ((parseInt(feeData.maxPriorityFeePerGas) - MIN_PRIORITY) /
                                            (MAX_PRIORITY - MIN_PRIORITY)) *
                                        100
                                    }%`,
                                }}
                            />
                            <HoldBtn
                                label="+"
                                color="#ff03e2"
                                invertText
                                onPressStart={() =>
                                    startHold(
                                        () =>
                                            setFeeData((p) => ({
                                                ...p,
                                                maxPriorityFeePerGas: Math.min(
                                                    parseInt(p.maxPriorityFeePerGas) + INC_PRIORITY,
                                                    MAX_PRIORITY
                                                ).toString(),
                                            })),
                                        priorityIncTimer
                                    )
                                }
                                onPressEnd={() => stopHold(priorityIncTimer)}
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-700">
                            {feeData.maxPriorityFeePerGas} GWEI | Max Fee: {maxFee.toFixed(2)} GWEI
                        </div>
                    </div>
                )}

                {/* NETWORK */}
                <div className="mt-5 text-xs">
                    <span className="font-bold">→ Network:</span>{" "}
                    <span className="text-[#007bff]">{networkName}</span>
                </div>
            </div>
        </>
    );
};

// ──────────────────────────── Helpers ────────────────────────────
function clamp(v) {
    return Math.max(MIN_GAS, Math.min(v, MAX_GAS));
}

export default GasDetailsOutput;
