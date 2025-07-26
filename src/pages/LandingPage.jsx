// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import RetroMenu from "../components/modals/RetroMenu";
import { Button } from "pixel-retroui";


// ────────────────────────────── Tiny Card helpers ─────────────────────────────
const Card = ({ className = "", children }) => (
  <div className={`bg-white border-4 border-black p-2 shadow-[4px_4px_0_0_black] ${className}`}>
    {children}
  </div>
);
const CardContent = ({ className = "", children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// ────────────────────────────── Retro “Coming Soon” sticker ───────────────────
const ComingSoonSticker = () => (
  <div
    className="
      absolute -top-4 -left-4 z-20
      bg-[#FF2EDD] text-black
      border-2 border-black
      px-2 py-1 text-[9px] leading-[10px] font-['Press_Start_2P']
      rotate-[-12deg]
      shadow-[3px_3px_0_0_#000]
    "
    style={{ imageRendering: "pixelated" }}
  >
    COMING<br />SOON
  </div>
);

// ────────────────────────────── Motion variants ───────────────────────────────
// Roll-in animation. Cards alternate rolling from left/right.
const rollVariants = {
  hidden: (i) => ({
    opacity: 0,
    x: i % 2 === 0 ? -140 : 140,
    rotate: i % 2 === 0 ? -45 : 45,
    scale: 0.8,
  }),
  show: (i) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 22,
      delay: i * 0.08,
    },
  }),
  hover: {
    y: -6,
    rotate: -2,
    transition: { type: "spring", stiffness: 260, damping: 16 },
    filter: "drop-shadow(4px 4px 0 #00FE77)",
  },
  tap: {
    y: 0,
    rotate: 0,
    scale: 0.97,
    filter: "drop-shadow(2px 2px 0 #00FE77)",
    transition: { duration: 0.06 },
  },
};

// Wrapper to apply motion + sticker logic
const AnimatedCard = ({ i, children, comingSoon = false }) => (
  <motion.div
    custom={i}
    variants={rollVariants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
    whileHover="hover"
    whileTap="tap"
    className="relative"
    style={{ imageRendering: "pixelated" }}
  >
    {comingSoon && <ComingSoonSticker />}
    {children}
  </motion.div>
);

// ───────────────────────────── Landing Page ───────────────────────────────────
const LandingPage = () => {
  const [showMenu, setShowMenu] = useState(false);

  // Reusable CTA row so buttons don’t overflow or shrink
  const CtaRow = ({ to, label }) => (
    <div className="flex border-t-2 border-black">
      <Link to={to} className="flex flex-1">
        <Button
          className="
            w-full rounded-none border-r-2 border-black font-bold
            px-4 py-2 text-sm sm:text-base whitespace-nowrap
          "
        >
          {label}
        </Button>
      </Link>
      <div className="flex shrink-0" />
    </div>
  );

  // Single card defs
  const SendTxCard = () => (
    <Card className="flex flex-col rounded-none border-[6px] border-black shadow-[6px_6px_0_0_black]">
      <div
        className="w-full h-40 sm:h-52 md:h-60 bg-cover bg-center"
        style={{ backgroundImage: "url('/chainIcons/sendimage.png')" }}
      />
      <Link to="/transaction">
        <CardContent className="space-y-3">
          <h2 className="text-2xl leading-snug text-customOlive">Send Transaction</h2>
        </CardContent>
      </Link>
      <CtaRow to="/transaction" label="Initiate Transaction" />
    </Card>
  );

  const LoginCard = () => (
    <Card className="flex flex-col rounded-none border-[6px] border-black shadow-[6px_6px_0_0_black]">
      <div
        className="w-full h-40 sm:h-52 md:h-60 bg-cover bg-center"
        style={{ backgroundImage: "url('/chainIcons/login.png')" }}
      />
      <Link to="">
        <CardContent className="space-y-3">
          <h2 className="text-2xl leading-snug text-customOlive">Login</h2>
        </CardContent>
      </Link>
      <CtaRow to="/login" label="Login" />
    </Card>
  );

  const VerifyCard = () => (
    <Card className="flex flex-col rounded-none border-[6px] border-black shadow-[6px_6px_0_0_black]">
      <div
        className="w-full h-40 sm:h-52 md:h-60 bg-cover bg-center"
        style={{ backgroundImage: "url('/chainIcons/verify.png')" }}
      />
      <Link to="">
        <CardContent className="space-y-3">
          <h2 className="text-2xl leading-snug text-customOlive">Verify</h2>
        </CardContent>
      </Link>
      <CtaRow to="/login" label="Login" />
    </Card>
  );

  const ReadCard = () => (
    <Card className="flex flex-col rounded-none border-[6px] border-black shadow-[6px_6px_0_0_black]">
      <div
        className="w-full h-40 sm:h-52 md:h-60 bg-cover bg-center"
        style={{ backgroundImage: "url('/chainIcons/verify.png')" }}
      />
      <Link to="">
        <CardContent className="space-y-3">
          <h2 className="text-2xl leading-snug text-customOlive">Read</h2>
        </CardContent>
      </Link>
      <CtaRow to="/login" label="Login" />
    </Card>
  );

  return (
    <div className="bg-black min-h-screen w-full flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full px-4 sm:px-8 md:px-16 py-4 flex justify-between items-center bg-black z-50 border-b-[2px] border-white">
        <NavLink to="/" className="flex items-center gap-0 sm:gap-2 cursor-pointer">
          <img className="h-10 w-auto flicker" src="/logo/mdi_cube-outline.svg" alt="SimpleWeb3 Logo" />
          <p className="hidden sm:block font-[Jersey_10] text-[#fffcfc] text-base sm:text-lg md:text-xl tracking-wide whitespace-nowrap">
            Simple<span className="text-[#00FE77]">Web3</span>
          </p>
        </NavLink>

        <button
          className="sm:hidden font-[Jersey_10] text-[#fffcfc] text-xl "
          onClick={() => setShowMenu(true)}
        >
          <RetroMenu />
        </button>
        <button
          className="hidden sm:block font-[Jersey_10] text-[#fffcfc] text-xl "
          onClick={() => setShowMenu(true)}
        >
          <RetroMenu />
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex justify-center px-4 pt-[144px] md:pt-[160px] pb-24">
        <div className="max-w-[1280px] w-full">
          {/* Heading */}
          <h2
            id="cards-heading"
            className="
              font-['Press_Start_2P']
              text-white
              text-base sm:text-xl md:text-2xl
              tracking-tight mb-6 mt-2
            "
            style={{ imageRendering: "pixelated" }}
          >
            Fast and user-friendly blockchain tools
          </h2>

          {/* Cards Grid */}
          <section className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {/* i = index to stagger & direction; comingSoon = true except first */}
            <AnimatedCard i={0} comingSoon={false}><SendTxCard /></AnimatedCard>
            <AnimatedCard i={1} comingSoon={true}><LoginCard /></AnimatedCard>
            <AnimatedCard i={2} comingSoon={true}><VerifyCard /></AnimatedCard>
            <AnimatedCard i={3} comingSoon={true}><ReadCard /></AnimatedCard>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <motion.footer
        className="bg-black text-[#fffcfc] text-center py-6 font-['Press_Start_2P'] text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        © {new Date().getFullYear()} SimpleWeb3. All rights reserved.
        <p className="text-white text-sm mt-2">
          Developed by{" "}
          <a
            href="https://etherscan.io/address/0x48a66CBeFa58CC0f1c2bDc6Fb7e9A4560Aa40eD0"
            target="_blank"
            rel="noreferrer"
            className="text-blue-300"
          >
            simpleweb3.eth
          </a>
        </p>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
