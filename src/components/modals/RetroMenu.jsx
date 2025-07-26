import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ── Pixel shell (same card look) ── */
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

/* ── Animations ── */
const menuVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.92, rotate: -4 },
  show: {
    opacity: 1, y: 0, scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 320, damping: 18 },
  },
  exit:  { opacity: 0, y: -10, scale: 0.9, rotate: 2, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.05 * i, type: "spring", stiffness: 400, damping: 20 },
  }),
};

const ComingSoonSticker = () => (
  <div
    className="absolute -top-3 -left-3 z-20 bg-[#FF2EDD] text-black border-2 border-black
               px-1.5 py-0.5 text-[8px] leading-[9px] font-['Press_Start_2P']
               rotate-[-12deg] shadow-[2px_2px_0_0_#000]"
    style={{ imageRendering: "pixelated" }}
  >
    SOON
  </div>
);

const RetroMenu = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const items = [
    { label: "About", to: "/about" },
    { label: "EtherScan", href: "https://etherscan.io/address/0x48a66CBeFa58CC0f1c2bDc6Fb7e9A4560Aa40eD0" },
    { label: "Contact", to: "/contact" },
    { label: "Blog", to: "/blog", comingSoon: true },
  ];

  // Close when clicking outside (but ignore the trigger itself)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return; // let toggle handle it
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const handleToggle = () => setOpen((o) => !o);
  const handleItemClick = () => setOpen(false);

  return (
    <div className="relative z-[9999]">
      {/* Trigger */}
      <button
        ref={triggerRef}
        className="font-[Jersey_10] text-[#fffcfc] text-xl flicker cursor-pointer"
        onClick={handleToggle}
      >
        +Menu
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="retro-menu"
            ref={menuRef}
            className="absolute right-0 mt-2 w-56"
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <PixelShell className="overflow-hidden">
              <ul className="relative flex flex-col gap-2 font-[Jersey_10]">
                {items.map((item, i) => (
                  <motion.li
                    key={item.label}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="relative"
                  >
                    {item.comingSoon && <ComingSoonSticker />}
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full px-2 py-2 border-2 border-black bg-black text-white hover:bg-[#c1ef00] hover:text-black transition"
                        onClick={handleItemClick}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        className="block w-full px-2 py-2 border-2 border-black bg-black text-white hover:bg-[#c1ef00] hover:text-black transition"
                        onClick={handleItemClick}
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </PixelShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RetroMenu;
