// src/components/header/HeaderPixelRK_ThreeChains.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import SolanaConnectButton from "../buttons/SolanaConnectButton.jsx";

import { useBitcoin } from "../../web3/BitcoinWalletProvider";

/* =========================
   Pixel primitives
========================= */

const PixelShell = ({ children, className = "" }) => (
  <div
    className={`relative bg-white border-[4px] border-black p-3 shadow-[4px_4px_0_0_black] ${className}`}
    style={{ imageRendering: "pixelated" }}
  >
    <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
    <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
    <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
    <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />
    {children}
  </div>
);

const pixelBtnBase =
  "inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] text-[11px] leading-none font-['Press_Start_2P'] px-6 py-3 transition-all duration-75 ease-in";
const pixelBtnActive =
  "bg-[#00FE77] hover:bg-[#c1ef00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc]";

function PixelButton({ onClick, children, className = "", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${pixelBtnBase} ${pixelBtnActive} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
      style={{ imageRendering: "pixelated" }}
    >
      {children}
    </button>
  );
}

/* =========================
   Animations
========================= */

const drawerVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 26 } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98, rotate: -1.5 },
  show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 320, damping: 24 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.1 } },
};

/* =========================
   Generic helpers
========================= */

const shortAddr = (a, L = 6, R = 4) => (a ? `${a.slice(0, L)}…${a.slice(-R)}` : "");

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function useOutsideClose(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();

    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return ref;
}

/* =========================
   Solana helpers
========================= */

const solShort = (pk) => (pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : "");

function solClusterFromEndpoint(endpoint) {
  const e = (endpoint || "").toLowerCase();
  if (e.includes("mainnet")) return "Mainnet";
  if (e.includes("devnet")) return "Devnet";
  if (e.includes("testnet")) return "Testnet";
  if (e.includes("localhost") || e.includes("127.0.0.1")) return "Localnet";
  return "Custom";
}

function solExplorerUrl(address, clusterLabel) {
  const cluster =
    clusterLabel === "Devnet" ? "devnet" :
    clusterLabel === "Testnet" ? "testnet" :
    clusterLabel === "Localnet" ? "custom" : "mainnet-beta";
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

/* =========================
   Bitcoin helpers
========================= */

function btcExplorerUrl(address, network) {
  // Choose one explorer. Keep simple & predictable.
  const isTest = network === "testnet";
  const host = isTest ? "https://mempool.space/testnet" : "https://mempool.space";
  return `${host}/address/${address}`;
}

const BTC_WALLET_META = {
  leather: { label: "Leather", icon: "/logo/leather.png" },
  leather_legacy: { label: "Leather", icon: "/logo/leather.png" },
  xverse: { label: "Xverse", icon: "/logo/xverse.png" },
  okx: { label: "OKX", icon: "/logo/okx.png" },
  xdefi: { label: "XDEFI", icon: "/logo/xdefi.png" },
  unisat: { label: "Unisat", icon: "/logo/unisat.png" },
  btc: { label: "Bitcoin Wallet", icon: "/logo/bitcoin.svg" },
};

/* =========================
   Small dropdown menu component
========================= */

function PixelDropdown({ open, onClose, children, className = "" }) {
  const ref = useOutsideClose(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className={`absolute right-0 top-[110%] z-[80] min-w-[220px] border-2 border-black bg-white shadow-[4px_4px_0_#000] ${className}`}
          variants={dropdownVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          style={{ imageRendering: "pixelated" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DropdownItem({ onClick, children, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-[10px] font-['Press_Start_2P'] border-b-2 border-black last:border-b-0 hover:bg-[#c1ef00] ${
        danger ? "text-[#ff2edd]" : "text-black"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================
   Solana pill (now with menu)
========================= */

function PixelSolanaPill() {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const { connection } = useConnection();
  const [openMenu, setOpenMenu] = useState(false);

  const address = useMemo(() => (connected && publicKey ? publicKey.toBase58() : null), [connected, publicKey]);
  if (!address) return null;

  const cluster = solClusterFromEndpoint(connection?.rpcEndpoint);
  const icon = wallet?.adapter?.icon;
  const name = wallet?.adapter?.name || "Solana";

  const onCopy = async () => {
    const ok = await copyToClipboard(address);
    setOpenMenu(false);
    if (!ok) alert("Copy failed");
  };

  const onExplorer = () => {
    window.open(solExplorerUrl(address, cluster), "_blank", "noreferrer");
    setOpenMenu(false);
  };

  const onDisconnect = () => {
    setOpenMenu(false);
    disconnect();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu((s) => !s)}
        className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0_#000] text-[10px] font-['Press_Start_2P']"
        style={{ imageRendering: "pixelated" }}
        title={`${name} · ${cluster} · ${address}`}
      >
        {icon ? (
          <img src={icon} alt={`${name} logo`} className="h-3 w-3" style={{ imageRendering: "pixelated" }} />
        ) : (
          <span className="inline-block h-3 w-3 bg-black" />
        )}
        <span className="text-black">{cluster} · {solShort(address)}</span>
        <span className="ml-1 border-2 border-black px-1 text-[9px]">⋯</span>
      </button>

      <PixelDropdown open={openMenu} onClose={() => setOpenMenu(false)}>
        <div className="px-3 py-2 border-b-2 border-black text-[9px] font-['Press_Start_2P']">
          {name} · {cluster}
          <div className="mt-1 text-black/70 break-all">{address}</div>
        </div>
        <DropdownItem onClick={onCopy}>Copy Address</DropdownItem>
        <DropdownItem onClick={onExplorer}>Open Explorer</DropdownItem>
        <DropdownItem onClick={onDisconnect} danger>Disconnect</DropdownItem>
      </PixelDropdown>
    </div>
  );
}

/* =========================
   Bitcoin pill (now with menu)
========================= */

function PixelBitcoinPill({ onOpenWalletPicker }) {
  const btc = useBitcoin();
  const [openMenu, setOpenMenu] = useState(false);

  if (!btc.connected || !btc.address) return null;

  const netHuman = btc.network === "testnet" ? "Testnet" : "Mainnet";
  const walletHuman = btc.walletName || "Wallet";
  const logo = (btc.walletName === "Unisat") ? "/logo/unisat.png" : "/logo/bitcoin.svg";

  const onCopy = async () => {
    const ok = await copyToClipboard(btc.address);
    setOpenMenu(false);
    if (!ok) alert("Copy failed");
  };

  const onExplorer = () => {
    window.open(btcExplorerUrl(btc.address, btc.network), "_blank", "noreferrer");
    setOpenMenu(false);
  };

  const onDisconnect = () => {
    setOpenMenu(false);
    btc.disconnect();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu((s) => !s)}
        className="inline-flex items-center gap-2 border-2 border-black bg-white px-2.5 py-1.5 shadow-[3px_3px_0_#000] text-[10px] font-['Press_Start_2P']"
        style={{ imageRendering: "pixelated" }}
        title={`Bitcoin (${walletHuman}) · ${netHuman} · ${btc.address}`}
      >
        <img src={logo} alt="BTC" className="h-3 w-3" style={{ imageRendering: "pixelated" }} />
        <span className="text-black truncate">{netHuman} · {shortAddr(btc.address, 5, 4)}</span>
        <span className="ml-1 border-2 border-black px-1 text-[9px]">⋯</span>
      </button>

      <PixelDropdown open={openMenu} onClose={() => setOpenMenu(false)}>
        <div className="px-3 py-2 border-b-2 border-black text-[9px] font-['Press_Start_2P']">
          Bitcoin · {walletHuman}
          <div className="mt-1 text-black/70">{netHuman}</div>
          <div className="mt-1 text-black/70 break-all">{btc.address}</div>
        </div>

        <div className="px-3 py-2 border-b-2 border-black">
          <div className="text-[9px] font-['Press_Start_2P'] mb-2">Network</div>
          <select
            className="w-full px-2 py-1 border-2 border-black bg-white text-[10px] font-['Press_Start_2P']"
            value={btc.network || "mainnet"}
            onChange={(e) => btc.switchNetwork(e.target.value)}
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>

        <DropdownItem onClick={onCopy}>Copy Address</DropdownItem>
        <DropdownItem onClick={onExplorer}>Open Explorer</DropdownItem>

        <DropdownItem
          onClick={() => {
            setOpenMenu(false);
            onOpenWalletPicker?.();
          }}
        >
          Change Wallet
        </DropdownItem>

        <DropdownItem onClick={onDisconnect} danger>Disconnect</DropdownItem>
      </PixelDropdown>
    </div>
  );
}

/* =========================
   Wallet modal pieces
========================= */

function EvmConnectTrigger({ onBeforeOpen }) {
  const { openConnectModal } = useConnectModal();
  const handle = () => {
    try { onBeforeOpen?.(); } catch {}
    setTimeout(() => openConnectModal?.(), 80);
  };
  return <PixelButton onClick={handle}>Connect EVM Wallet</PixelButton>;
}

function BitcoinWalletPicker({ onClose }) {
  const btc = useBitcoin();

  const wallets = useMemo(() => {
    const list = (btc.availableWallets || []).map((w) => {
      const meta = BTC_WALLET_META[w.type] || {};
      return {
        ...w,
        label: meta.label || w.name || w.type,
        icon: meta.icon || "/logo/bitcoin.svg",
      };
    });

    // Sort nicely: Leather/Xverse first, then the rest
    const order = ["leather", "leather_legacy", "xverse", "okx", "xdefi", "unisat", "btc"];
    list.sort((a, b) => (order.indexOf(a.type) - order.indexOf(b.type)));
    return list;
  }, [btc.availableWallets]);

  if (!btc.walletAvailable) {
    return (
      <div className="text-[9px] text-red-600 font-['Press_Start_2P']">
        No Bitcoin wallet detected. Install{" "}
        <a className="underline" href="https://www.xverse.app" target="_blank" rel="noreferrer">Xverse</a>,{" "}
        <a className="underline" href="https://leather.io" target="_blank" rel="noreferrer">Leather</a>,{" "}
        <a className="underline" href="https://unisat.io" target="_blank" rel="noreferrer">Unisat</a>, then allow site access & refresh.
      </div>
    );
  }

  if (!wallets.length) {
    return (
      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
        Bitcoin wallets detected, but list is empty. Try refreshing or opening the wallet extension once.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-['Press_Start_2P']">Choose a Bitcoin wallet</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {wallets.map((w) => (
          <button
            key={w.type}
            onClick={async () => {
              try {
                await btc.connectToWallet(w.type);
                onClose?.();
              } catch (e) {
                alert(e?.message || "Failed to connect");
              }
            }}
            className="flex items-center gap-2 px-2 py-2 border-2 border-black bg-white text-[10px] font-['Press_Start_2P'] hover:bg-[#c1ef00]"
            title={`Connect using ${w.label}`}
          >
            <img src={w.icon} alt="" className="h-4 w-4" style={{ imageRendering: "pixelated" }} />
            <span className="truncate">{w.label}</span>
          </button>
        ))}
      </div>

      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
        Tip: Some wallets require network switching inside the wallet UI.
      </div>
    </div>
  );
}

function PixelWalletModal({ open, onClose, onOpenBitcoinPicker }) {
  const { isConnected: evmConnected } = useAccount();
  const { connected: solConnected } = useWallet();
  const btc = useBitcoin();
  const [tab, setTab] = useState("EVM");
  const panelRef = useOutsideClose(open, onClose);

  // Auto-close when any chain connects
  useEffect(() => {
    if (open && (evmConnected || solConnected || btc.connected)) onClose();
  }, [open, evmConnected, solConnected, btc.connected, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="fixed inset-0 z-[61] grid place-items-center px-4" variants={modalVariants} initial="hidden" animate="show" exit="exit">
            <div ref={panelRef} className="w-full max-w-[560px]">
              <PixelShell>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-['Press_Start_2P']">Select Wallet Type</div>
                  <button
                    onClick={onClose}
                    className="px-2 py-1 border-2 border-black bg-black text-white text-[10px] font-['Press_Start_2P']"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="mt-3 inline-flex border-2 border-black">
                  {["EVM", "Solana", "Bitcoin"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-2 text-[10px] font-['Press_Start_2P'] border-r-2 border-black last:border-r-0 ${
                        tab === t ? "bg-[#00FE77]" : "bg-white hover:bg-[#c1ef00]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {tab === "EVM" && (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">RainbowKit-supported wallets</div>
                      <EvmConnectTrigger onBeforeOpen={onClose} />
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
                        Chain switcher & wallet list appear in the RainbowKit modal.
                      </div>
                    </>
                  )}

                  {tab === "Solana" && (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">Phantom, Solflare, Backpack & more</div>
                      <div><SolanaConnectButton /></div>
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
                        Wallet list is handled by Solana Wallet Adapter.
                      </div>
                    </>
                  )}

                  {tab === "Bitcoin" && (
                    <>
                      <BitcoinWalletPicker onClose={onClose} />
                      <button
                        onClick={() => {
                          // also allow opening picker from outside
                          onOpenBitcoinPicker?.();
                        }}
                        className="hidden"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </div>
              </PixelShell>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* =========================
   Header
========================= */

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/transaction", label: "Send Transaction", icon: "💸" },
  { path: "/converter", label: "Converter", icon: "🔄" },
  { path: "/sign", label: "Sign Message", icon: "✍️" },
  { path: "/verify", label: "Verify", icon: "✅", comingSoon: true },
  { path: "/read", label: "Read Data", icon: "📖", comingSoon: true },
  { path: "/about", label: "About", icon: "ℹ️" },
];

export default function HeaderPixelRK_ThreeChains() {
  const { isConnected: evmConnected } = useAccount();
  const { connected: solConnected, publicKey } = useWallet();
  const btc = useBitcoin();

  const solReady = !!(solConnected && publicKey);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Used by BTC pill "Change Wallet" action
  const openWalletModal = useCallback(() => setIsWalletModalOpen(true), []);
  const closeWalletModal = useCallback(() => setIsWalletModalOpen(false), []);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const closeMenu = () => setIsMenuOpen(false);

  const showGlobalConnect =
    !evmConnected && !solReady && !btc.connected;

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-black" />

      <header className="fixed top-[0px] left-0 w-full z-[46] bg-black border-b border-white">
        <div className="px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between">
          <NavLink to="/" className="group flex items-center gap-2 cursor-pointer">
            <img
              className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105"
              src="/logo/mdi_cube-outline.svg"
              alt="SimpleWeb3 Logo"
            />
            <p className="hidden sm:block font-[Jersey_10] text-white text-lg md:text-xl tracking-wide">
              Simple<span className="text-[#00FE77]">Web3</span>
            </p>
          </NavLink>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* EVM */}
            {evmConnected ? (
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
            ) : null}

            {/* Solana (now has dropdown menu) */}
            {solReady ? <PixelSolanaPill /> : null}

            {/* Bitcoin (now has dropdown menu + Change Wallet) */}
            {btc.connected ? <PixelBitcoinPill onOpenWalletPicker={openWalletModal} /> : null}

            {/* If none connected -> open multi-chain modal */}
            {showGlobalConnect && (
              <PixelButton onClick={openWalletModal}>Connect Wallet</PixelButton>
            )}

            {/* Burger */}
            <button
              onClick={toggleMenu}
              className="relative p-2 rounded-lg border border-white/20 text-white/90 hover:text-[#00FE77] hover:border-[#00FE77]/60 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="block w-5 h-[2px] bg-current" />
                <span className="block w-5 h-[2px] bg-current" />
                <span className="block w-5 h-[2px] bg-current" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MENU Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              aria-label="Close menu overlay"
            />
            <motion.nav
              className="fixed top-[66px] right-4 sm:right-8 md:right-16 w-[90vw] sm:w-80 bg-[#0a0a0a]/95 border border-white/20 rounded-2xl z-50 shadow-2xl"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
                <h3 className="font-['Press_Start_2P'] text-white text-[11px]">Navigation</h3>
                <button
                  onClick={closeMenu}
                  className="text-white/80 hover:text-[#00FE77] font-['Press_Start_2P'] text-[10px]"
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Wallet status inside drawer */}
              <div className="px-4 py-3 border-b border-white/15 flex flex-wrap gap-2 items-center">
                <span className="text-white/70 text-[10px] font-['Press_Start_2P']">Wallets:</span>
                {evmConnected ? (
                  <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
                ) : null}
                {solReady ? <PixelSolanaPill /> : null}
                {btc.connected ? <PixelBitcoinPill onOpenWalletPicker={openWalletModal} /> : null}

                <PixelButton
                  onClick={() => {
                    openWalletModal();
                    closeMenu();
                  }}
                >
                  {showGlobalConnect ? "Connect Wallet" : "Add / Switch Wallet"}
                </PixelButton>
              </div>

              <ul className="p-2 max-h-[56vh] overflow-auto">
                {NAV_ITEMS.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="relative"
                  >
                    {item.comingSoon ? (
                      <div className="relative">
                        <div className="flex items-center gap-3 p-3 text-white/40 cursor-not-allowed">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-['Press_Start_2P'] text-[11px]">{item.label}</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#FF2EDD] text-black px-1 py-0.5 text-[9px] font-['Press_Start_2P'] rotate-6 rounded">
                          SOON
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 ${
                            isActive ? "bg-[#00FE77]/15 text-[#00FE77]" : "text-white hover:text-[#00FE77]"
                          }`
                        }
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-['Press_Start_2P'] text-[11px]">{item.label}</span>
                      </NavLink>
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="px-4 py-3 border-t border-white/15">
                <p className="text-white/60 font-['Press_Start_2P'] text-[10px] text-center">
                  SimpleWeb3 Tools v1.0
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Wallet Modal */}
      <PixelWalletModal open={isWalletModalOpen} onClose={closeWalletModal} />

      {/* Spacer for fixed header */}
      <div className="h-[66px]" />
    </>
  );
}
