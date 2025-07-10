import React, { useEffect } from "react";
import { NavLink, Link } from "react-router-dom";

const LandingPage = () => {
  useEffect(() => {
    // Apply retro pixel cursor
    document.body.style.cursor = 'url("/cursor/pixel-sword.cur"), auto';
    document.body.style.imageRendering = 'pixelated';

    return () => {
      // Cleanup on unmount
      document.body.style.cursor = 'auto';
      document.body.style.imageRendering = 'auto';
    };
  }, []);

  return (
    <div className="bg-black min-h-screen w-full flex flex-col">
      {/* Main Container */}
      <main className="flex-grow flex justify-center px-4">
        <div className="bg-black max-w-[1280px] w-full">
          {/* Background Frame */}
          <div className="relative w-full bg-[url(/frame-1.svg)] bg-cover" style={{ imageRendering: "pixelated" }}>

            {/* Header */}
            <header className="fixed top-0 left-0 w-full px-16 py-4 flex justify-between items-center bg-black z-50">
              <NavLink to="/" className="flex items-center space-x-2 cursor-pointer">
                <img className="h-11 w-auto flicker" src="/logo/mdi_cube-outline.svg" alt="SimpleWeb3 Logo" />
                <p className="[font-family:Jersey_10,Helvetica] text-[#fffcfc] text-xl tracking-wide leading-normal whitespace-nowrap">
                  Simple<span className="text-[#2cec1e]">Web3</span>
                </p>
              </NavLink>
              <button className="font-[Jersey_10] text-[#fffcfc] text-xl flicker cursor-pointer">+Menu</button>
            </header>

            {/* Hero Section */}
            <section className="px-4 mt-20 md:mt-36 text-left">
              <h2 className="font-['Press_Start_2P'] text-[#fffcfc] text-2xl md:text-4xl lg:text-5xl leading-snug tracking-tight mb-6 text-balance">
                <span className="block md:hidden">Simplest EVM Transaction Submission</span>
                <span className="hidden md:block">
                  <span className="block mb-4">Simplest EVM Transaction</span>
                  <span>Submission</span>
                </span>
              </h2>
              <p className="font-['Press_Start_2P'] text-[#fffcfc] text-xs md:text-base max-w-xl mb-14">
                <span className="block mb-2">Developer Friendly Ethereum</span>
                <span>transaction submission through UI.</span> 
              </p>

              <div className="mt-8 relative w-fit">
                <div className="absolute inset-0 bg-[#955ff9] translate-y-2" />
                <Link to="/transaction">
                  <button className="relative z-10 px-6 py-3 bg-[#d1ff03] hover:bg-[#c1ef00] font-['Press_Start_2P'] text-black text-xs md:text-sm pixel-pulse border-2 border-black shadow-[4px_4px_0_#000]">
                    Send Transaction
                  </button>
                </Link>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="px-4 mt-24 mb-24">
              <h3 className="font-['Press_Start_2P'] text-[#fffcfc] text-lg md:text-2xl mb-6">
                How It Works
              </h3>

              <div className="flex flex-col md:flex-row gap-6">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className="relative w-full md:w-[365px] bg-white border-[4px] border-black shadow-[4px_4px_0_#000] p-4 pixel-frame"
                    style={{ imageRendering: "pixelated" }}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 bg-black flicker flicker-delay-1" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-black flicker flicker-delay-2" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-black flicker flicker-delay-3" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-black flicker flicker-delay-4" />

                    <h4 className="font-['Jersey_10'] text-black text-xl mb-2">Step {step}</h4>

                    {step === 1 && (
                      <>
                        <p className="text-black text-sm mb-4 font-mono">Connect the wallet</p>
                        <button className="w-full bg-[#d1ff03] hover:bg-[#c1ef00] font-[Jersey_10] text-black text-sm rounded-none border-2 border-black shadow-[2px_2px_0_#000] p-4">
                          Connect Wallet
                        </button>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <p className="text-black text-xs font-mono mb-4">Validate the Details</p>
                        <button className="w-full bg-[#d1ff03] hover:bg-[#c1ef00] font-[Jersey_10] text-black text-sm rounded-none border-2 border-black shadow-[2px_2px_0_#000] p-4">
                          Validate
                        </button>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <p className="text-black text-xs font-mono mb-4">Send the Transaction To The network</p>
                        <button className="w-full bg-[#d1ff03] hover:bg-[#c1ef00] font-[Jersey_10] text-black text-sm rounded-none border-2 border-black shadow-[2px_2px_0_#000] p-4">
                          Send Transaction
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#fffcfc] text-center py-6 font-['Press_Start_2P'] text-xs">
        © {new Date().getFullYear()} SimpleWeb3. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
