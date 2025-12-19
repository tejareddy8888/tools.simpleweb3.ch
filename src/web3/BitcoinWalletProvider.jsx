// src/web3/BitcoinWalletProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

/* =========================
   Debug / Logging
========================= */

const DEBUG = false; // set true when debugging locally

const log = (...args) => DEBUG && console.log(...args);
const warn = (...args) => DEBUG && console.warn(...args);
const errLog = (...args) => DEBUG && console.error(...args);

/* =========================
   Helpers
========================= */

function tryRequest(p, method, params) {
  if (!p?.request) return Promise.resolve(null);

  // Some wallets implement request({method, params})
  return p
    .request({ method, params })
    .catch(() =>
      // Some older providers implement request(method, params)
      typeof p.request === "function" ? p.request(method, params).catch(() => null) : null
    );
}

function normalizeNet(n) {
  if (!n) return "mainnet";
  return /test/i.test(n) ? "testnet" : "mainnet";
}

// Keep extractor robust, but remove noisy logs.
function extractAddressStruct(res) {
  if (!res) return { address: null, network: null };

  const pickAddr = (item) => {
    if (typeof item === "string") return item;
    return (
      item?.address?.address ||
      item?.address ||
      item?.payment?.address ||
      item?.publicKey ||
      item
    );
  };

  const extractFromItem = (item) => {
    const addr = pickAddr(item);
    return typeof addr === "string" && addr.length > 0 ? addr : null;
  };

  const pickFromArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;

    const pref =
      arr.find((x) => (x?.purpose || x?.type) === "payment") || arr[0];

    let addr = extractFromItem(pref);
    if (addr) return addr;

    for (const item of arr) {
      addr = extractFromItem(item);
      if (addr) return addr;
    }
    return null;
  };

  if (Array.isArray(res)) {
    return { address: pickFromArray(res), network: res?.[0]?.network || null };
  }

  if (Array.isArray(res.addresses)) {
    return {
      address: pickFromArray(res.addresses),
      network: res?.network || res?.addresses?.[0]?.network || null,
    };
  }

  if (Array.isArray(res.accounts)) {
    return {
      address: pickFromArray(res.accounts),
      network: res?.network || res?.accounts?.[0]?.network || null,
    };
  }

  if (res.address) {
    return { address: extractFromItem(res), network: res?.network || null };
  }

  if (res.publicKey) {
    return { address: res.publicKey, network: res?.network || null };
  }

  if (typeof res === "string") {
    return { address: res, network: null };
  }

  return { address: null, network: res?.network || null };
}

/* =========================
   Connection Methods
========================= */

// New: LeatherProvider style (Xverse modern)
async function connectLeather(p) {
  try {
    const addresses = await p.getAddresses?.();
    log("LeatherProvider.getAddresses() =>", addresses);

    if (!addresses || addresses.length === 0) {
      throw new Error(
        "Wallet returned empty address list. Make sure wallet is unlocked and you approved the connection."
      );
    }

    const paymentAddr =
      addresses.find((a) => a?.purpose === "payment" || a?.type === "payment") ||
      addresses[0];

    const address =
      typeof paymentAddr === "string" ? paymentAddr : paymentAddr?.address || paymentAddr;

    if (!address) {
      throw new Error("Could not extract address from wallet response.");
    }

    return { address, network: "mainnet", wallet: "Leather" };
  } catch (error) {
    throw new Error(
      `Leather/Xverse connection failed: ${error?.message || error}. Make sure: 1) Wallet is unlocked, 2) Site is approved, 3) Not in iframe`
    );
  }
}

// Legacy: Bitcoin Web Standard-ish
async function connectBws(p) {
  // Request approval (best-effort)
  const connectRes =
    (await tryRequest(p, "connect", {
      purposes: ["payment", "ordinals"],
      message: "Connect to SimpleWeb3",
    })) ||
    (await tryRequest(p, "wallet_connect", {
      purposes: ["payment", "ordinals"],
      message: "Connect to SimpleWeb3",
    })) ||
    null;

  log("connect response =>", connectRes);

  const attempt = async (fn) => {
    try {
      const r = await fn();
      return r || null;
    } catch {
      return null;
    }
  };

  // Common direct helpers
  let res =
    (await attempt(() => p.getAddresses?.())) ||
    (await attempt(() => p.getAccounts?.())) ||
    (await attempt(() => p.requestAccounts?.()));

  // Generic request fallbacks
  if (!res && typeof p.request === "function") {
    res =
      (await attempt(() =>
        p.request({ method: "getAddresses", params: { purposes: ["payment", "ordinals"] } })
      )) ||
      (await attempt(() =>
        p.request({ method: "wallet_getAddresses", params: { purposes: ["payment", "ordinals"] } })
      )) ||
      (await attempt(() => p.request({ method: "getAccounts" }))) ||
      (await attempt(() => p.request({ method: "wallet_getAccounts" }))) ||
      (await attempt(() => p.request({ method: "requestAccounts" }))) ||
      (await attempt(() =>
        p.request({ method: "connect", params: { purposes: ["payment"] } })
      )) ||
      (await attempt(() => p.request("getAddresses", { purposes: ["payment", "ordinals"] }))) ||
      null;
  }

  const { address, network } = extractAddressStruct(res);

  if (!address) {
    errLog("No address extracted. Raw response:", res);
    try {
      log("Provider methods:", Object.keys(p || {}));
    } catch {}

    throw new Error(
      "Bitcoin wallet returned no address.\n\n" +
        "TROUBLESHOOTING:\n" +
        "1. Open your wallet extension and UNLOCK it\n" +
        "2. Wallet SETTINGS → Allowed Sites → add your site\n" +
        "3. Click Connect and APPROVE the popup\n" +
        "4. Make sure you're NOT in an iframe\n" +
        "5. For Leather: ensure you're on Bitcoin network\n"
    );
  }

  const wallet =
    p?.name ||
    (window?.XverseProviders?.bitcoin ? "Xverse" :
     window?.leather?.bitcoin       ? "Leather" :
     window?.okxwallet?.bitcoin     ? "OKX" :
     window?.xfi?.bitcoin           ? "XDEFI" : "Bitcoin Wallet");

  return { address, network: normalizeNet(network), wallet };
}

/* =========================
   Detection (Less noisy, deduped)
========================= */

function getAllBtcProviders() {
  if (typeof window === "undefined") return [];

  const out = [];
  const seen = new Set();

  const add = (type, p, name) => {
    if (!p) return;
    const key = `${type}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ type, p, name });
  };

  // LeatherProvider (new)
  if (
    window.LeatherProvider?.bitcoin &&
    typeof window.LeatherProvider.bitcoin.getAddresses === "function"
  ) {
    add("leather", window.LeatherProvider.bitcoin, "Leather");
  }

  // Xverse (legacy)
  if (
    window.XverseProviders?.bitcoin &&
    typeof window.XverseProviders.bitcoin.request === "function"
  ) {
    add("xverse", window.XverseProviders.bitcoin, "Xverse");
  }

  // Leather legacy (avoid duplicates)
  if (window.leather?.bitcoin && typeof window.leather.bitcoin.request === "function") {
    add("leather_legacy", window.leather.bitcoin, "Leather");
  }

  // Generic
  if (window.btc && typeof window.btc.request === "function") {
    add("btc", window.btc, "Bitcoin Wallet");
  }

  // OKX
  if (window.okxwallet?.bitcoin && typeof window.okxwallet.bitcoin.request === "function") {
    add("okx", window.okxwallet.bitcoin, "OKX Wallet");
  }

  // XDEFI (xfi or ctrl)
  const xdefi = window.xfi?.bitcoin || window.ctrl?.bitcoin;
  if (xdefi && typeof xdefi.request === "function") {
    add("xdefi", xdefi, "XDEFI");
  }

  // Unisat
  if (window.unisat && typeof window.unisat.requestAccounts === "function") {
    add("unisat", window.unisat, "Unisat");
  }

  return out;
}

function sameWalletList(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.type !== b[i]?.type || a[i]?.name !== b[i]?.name) return false;
  }
  return true;
}

function getFirstBtcProvider() {
  const providers = getAllBtcProviders();
  return providers.length ? providers[0] : null;
}

/* =========================
   Context
========================= */

const BitcoinCtx = createContext(null);

export function BitcoinWalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [walletName, setWalletName] = useState(null);

  const [walletAvailable, setWalletAvailable] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);

  const providerRef = useRef(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const lastWalletsRef = useRef([]);

  /* ---- Detect wallets (optimized) ---- */
  useEffect(() => {
    const check = () => {
      const all = getAllBtcProviders();

      // Only update state if something actually changed (prevents rerenders + spam)
      if (!sameWalletList(all, lastWalletsRef.current)) {
        lastWalletsRef.current = all;
        setAvailableWallets(all);
        setWalletAvailable(all.length > 0);

        const first = all?.[0]?.p || null;
        providerRef.current = first;
        // Do NOT force override selectedProvider if user already chose one
        setSelectedProvider((prev) => prev || first);
      }
    };

    check();

    // Less aggressive than 2s. Still “detects”, but doesn’t churn.
    const id = setInterval(check, 6000);
    window.addEventListener("focus", check);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, []);

  /* ---- Restore from localStorage ---- */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wallet.btc") || "null");
      if (saved?.address) {
        setConnected(!!saved.connected);
        setAddress(saved.address);
        setNetwork(saved.network || "mainnet");
        setWalletName(saved.wallet || null);
      }
    } catch (e) {
      errLog("Failed to restore Bitcoin wallet state:", e);
    }
  }, []);

  /* ---- Persist to localStorage ---- */
  useEffect(() => {
    localStorage.setItem(
      "wallet.btc",
      JSON.stringify({ connected, address, network, wallet: walletName })
    );
  }, [connected, address, network, walletName]);

  /* ---- Subscribe to wallet events (only for chosen provider) ---- */
  useEffect(() => {
    const p = selectedProvider || providerRef.current;
    if (!p || typeof p.on !== "function") return;

    const onAccounts = (accs) => {
      const a = Array.isArray(accs) ? accs[0]?.address || accs[0] : null;

      if (a) {
        setConnected(true);
        setAddress(a);
        toast.success(`Bitcoin connected: ${a}`);
      } else {
        setConnected(false);
        setAddress(null);
        toast("Bitcoin disconnected");
      }
    };

    const onNetwork = (net) => {
      const n = typeof net === "string" ? net : net?.network || net?.chain || "";
      setNetwork(/test/i.test(n) ? "testnet" : "mainnet");
    };

    try { p.on("accountsChanged", onAccounts); } catch (e) { warn("attach accountsChanged failed", e); }
    try { p.on("networkChanged", onNetwork); } catch (e) { warn("attach networkChanged failed", e); }
    try { p.on("chainChanged", onNetwork); } catch (e) { warn("attach chainChanged failed", e); }

    return () => {
      try { p.removeListener?.("accountsChanged", onAccounts); } catch {}
      try { p.removeListener?.("networkChanged", onNetwork); } catch {}
      try { p.removeListener?.("chainChanged", onNetwork); } catch {}
    };
  }, [selectedProvider]);

  /* =========================
     Public API
  ========================= */

  const connect = useCallback(async () => {
    const found = getFirstBtcProvider();
    providerRef.current = found?.p || null;

    if (!found) {
      throw new Error(
        "No Bitcoin wallet detected. Install Xverse/Leather/Unisat, allow this site, then refresh."
      );
    }

    const { type, p } = found;
    setSelectedProvider(p);

    try {
      if (type === "leather" || type === "leather_legacy") {
        // Prefer new API if available, else fallback
        const data =
          typeof p.getAddresses === "function" ? await connectLeather(p) : await connectBws(p);

        setConnected(true);
        setAddress(data.address);
        setNetwork(data.network);
        setWalletName(data.wallet);
      } else if (type === "xverse" || type === "btc" || type === "okx" || type === "xdefi") {
        const data = await connectBws(p);
        setConnected(true);
        setAddress(data.address);
        setNetwork(data.network);
        setWalletName(data.wallet);
      } else if (type === "unisat") {
        const accs = await p.requestAccounts();
        if (!accs || accs.length === 0) {
          throw new Error("Unisat returned no accounts. Unlock wallet and approve connection.");
        }
        const addr = accs?.[0];
        if (!addr) throw new Error("Invalid address from Unisat");

        const net = await p.getNetwork?.();
        setConnected(true);
        setAddress(addr);
        setNetwork(net === "testnet" ? "testnet" : "mainnet");
        setWalletName("Unisat");
      } else {
        throw new Error(`Unsupported wallet type: ${type}`);
      }
    } catch (error) {
      errLog("Bitcoin wallet connection failed:", error);
      throw error;
    }
  }, []);

  const connectToWallet = useCallback(
    async (walletType) => {
      const wallet = availableWallets.find((w) => w.type === walletType);
      if (!wallet) throw new Error(`Wallet type ${walletType} not available`);

      const { type, p } = wallet;

      providerRef.current = p;
      setSelectedProvider(p);

      try {
        if (type === "leather" || type === "leather_legacy") {
          const data =
            typeof p.getAddresses === "function" ? await connectLeather(p) : await connectBws(p);

          setConnected(true);
          setAddress(data.address);
          setNetwork(data.network);
          setWalletName(data.wallet);
        } else if (type === "xverse" || type === "btc" || type === "okx" || type === "xdefi") {
          const data = await connectBws(p);
          setConnected(true);
          setAddress(data.address);
          setNetwork(data.network);
          setWalletName(data.wallet);
        } else if (type === "unisat") {
          const accs = await p.requestAccounts();
          if (!accs || accs.length === 0) {
            throw new Error("Unisat returned no accounts. Unlock wallet and approve connection.");
          }
          const addr = accs?.[0];
          if (!addr) throw new Error("Invalid address from Unisat");

          const net = await p.getNetwork?.();
          setConnected(true);
          setAddress(addr);
          setNetwork(net === "testnet" ? "testnet" : "mainnet");
          setWalletName("Unisat");
        } else {
          throw new Error(`Unsupported wallet type: ${type}`);
        }
      } catch (error) {
        errLog("Bitcoin wallet connection failed:", error);
        throw error;
      }
    },
    [availableWallets]
  );

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setNetwork(null);
    setWalletName(null);
    localStorage.removeItem("wallet.btc");
  }, []);

  const switchNetwork = useCallback(async (target) => {
    const p = providerRef.current;
    if (p?.switchChain && typeof p.switchChain === "function") {
      await p.switchChain(target === "testnet" ? "testnet" : "livenet");
      const net = await p.getNetwork?.();
      setNetwork(net === "testnet" ? "testnet" : "mainnet");
      return;
    }
    setNetwork(target);
  }, []);

  const value = useMemo(
    () => ({
      connected,
      address,
      network,
      walletName,
      walletAvailable,
      availableWallets,
      connect,
      connectToWallet,
      disconnect,
      switchNetwork,
    }),
    [
      connected,
      address,
      network,
      walletName,
      walletAvailable,
      availableWallets,
      connect,
      connectToWallet,
      disconnect,
      switchNetwork,
    ]
  );

  return <BitcoinCtx.Provider value={value}>{children}</BitcoinCtx.Provider>;
}

export function useBitcoin() {
  const ctx = useContext(BitcoinCtx);
  if (!ctx) throw new Error("useBitcoin must be used inside <BitcoinWalletProvider>");
  return ctx;
}
