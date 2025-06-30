import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink } from 'react-router-dom';
// import { ConnectBtn } from '../web3/web3.connect';

const Header = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

  return (
    <nav className='bg-blur-700  border-teel-800'>
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='flex h-12 items-center justify-between'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <NavLink className='flex items-center' to='/'>
              <img className="h-11 w-auto" src="/logo/mdi_cube-outline.svg" alt="SimpleWeb3" />
              <img className="h-5 ml-0 w-auto" src="/logo/Simpleweb3.svg" alt="SimpleWeb3" />
            </NavLink>
          </div>

          {/* NavLinks */}
          <div className='hidden md:flex flex-grow justify-center'>
            <div className='space-x-4'>
              <NavLink to='/' >
                Home
              </NavLink>
              <NavLink to='/about' >
                About
              </NavLink>
            </div>
          </div>

          {/* ConnectButton */}
          <div className='flex-shrink md:flex-shrink-0'>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav >
  );
};
export default Header;
