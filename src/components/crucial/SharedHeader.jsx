import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const SharedHeader = ({ showConnectButton = true, showMenu = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/transaction', label: 'Send Transaction', icon: '💸' },
    { path: '/converter', label: 'Converter', icon: '🔄' },
    { path: '/sign', label: 'Sign Message', icon: '✍️' },
    { path: '/verify', label: 'Verify', icon: '✅', comingSoon: true },
    { path: '/read', label: 'Read Data', icon: '📖', comingSoon: true },
    { path: '/about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full px-4 sm:px-8 md:px-16 py-4 flex justify-between items-center bg-black z-50 border-b-[2px] border-white">
        {/* Logo - Always clickable to go home */}
        <NavLink to="/" className="flex items-center gap-0 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img className="h-10 w-auto flicker" src="/logo/mdi_cube-outline.svg" alt="SimpleWeb3 Logo" />
          <p className="hidden sm:block font-[Jersey_10] text-[#fffcfc] text-base sm:text-lg md:text-xl tracking-wide whitespace-nowrap">
            Simple<span className="text-[#00FE77]">Web3</span>
          </p>
        </NavLink>

        {/* Right side - Menu and Connect Button */}
        <div className="flex items-center gap-4">
          {/* Connect Button */}
          {showConnectButton && (
            <div className="hidden sm:block">
              <ConnectButton />
            </div>
          )}

          {/* Menu Button */}
          {showMenu && (
            <button
              onClick={toggleMenu}
              className="relative font-[Jersey_10] text-[#fffcfc] text-xl hover:text-[#00FE77] transition-colors"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="block w-6 h-[2px] bg-current transition-transform" />
                <span className="block w-6 h-[2px] bg-current transition-transform" />
                <span className="block w-6 h-[2px] bg-current transition-transform" />
              </div>
            </button>
          )}

          {/* Mobile Connect Button */}
          {showConnectButton && (
            <div className="sm:hidden">
              <ConnectButton showBalance={false} />
            </div>
          )}
        </div>
      </header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-[80px] right-4 sm:right-8 md:right-16 w-80 bg-black border-2 border-white z-50 shadow-xl"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Menu Header */}
              <div className="flex justify-between items-center p-4 border-b-2 border-white">
                <h3 className="font-['Press_Start_2P'] text-white text-sm">Navigation</h3>
                <button 
                  onClick={closeMenu}
                  className="text-white hover:text-[#00FE77] font-['Press_Start_2P'] text-xs"
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {item.comingSoon ? (
                      <div className="relative">
                        <div className="flex items-center gap-3 p-3 text-white/50 cursor-not-allowed">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-['Press_Start_2P'] text-xs">{item.label}</span>
                        </div>
                        <div className="absolute top-1 right-2 bg-[#FF2EDD] text-black px-1 py-0.5 text-[8px] font-['Press_Start_2P'] rotate-12">
                          SOON
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-3 transition-colors hover:bg-white/10 ${
                            isActive ? 'bg-[#00FE77]/20 text-[#00FE77]' : 'text-white hover:text-[#00FE77]'
                          }`
                        }
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-['Press_Start_2P'] text-xs">{item.label}</span>
                      </NavLink>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Menu Footer */}
              <div className="p-4 border-t-2 border-white">
                <p className="text-white/60 font-['Press_Start_2P'] text-[8px] text-center">
                  SimpleWeb3 Tools v1.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SharedHeader;