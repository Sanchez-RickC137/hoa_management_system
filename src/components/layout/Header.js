import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Info, Umbrella, Mail, LogIn, Sun, Moon, Menu, X, User, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const menuItems = [
    { to: '/', icon: <Home size={24} />, text: 'Home' },
    { to: '/about', icon: <Info size={24} />, text: 'About' },
    { to: '/amenities', icon: <Umbrella size={24} />, text: 'Amenities' },
    { to: '/contact', icon: <Mail size={24} />, text: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className={`${isDarkMode ? 'bg-[#2C3E50] text-[#ECF0F1]' : 'bg-[#34495E] text-tanish-light'} p-4 relative z-50`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold">Summit Ridge HOA</Link>
        <nav className="hidden md:flex items-center">
          <ul className="flex space-x-4 mr-4">
            {menuItems.map((item, index) => (
              <li key={index} className="text-lg">
                <Link to={item.to} className="flex items-center hover:text-[#3498DB]">
                  {item.icon}
                  <span className="ml-1">{item.text}</span>
                </Link>
              </li>
            ))}
            {user ? (
              <li className="relative">
                <button onClick={toggleDropdown} className="flex items-center hover:text-[#3498DB]">
                  <User size={24} />
                  <span className="ml-1">Account</span>
                </button>
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${isDarkMode ? 'bg-[#2C3E50] text-[#ECF0F1]' : 'bg-[#34495E] text-tanish-light'}`}>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-[#3498DB] hover:text-white">Dashboard</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#3498DB] hover:text-white">Logout</button>
                  </div>
                )}
              </li>
            ) : (
              <li className="text-lg">
                <Link to="/login" className="flex items-center hover:text-[#3498DB]">
                  <LogIn size={24} />
                  <span className="ml-1">Login</span>
                </Link>
              </li>
            )}
          </ul>
          <button onClick={toggleTheme} className={`p-2 rounded-full hover:bg-[#3498DB] transition-colors`}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </nav>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li className="text-lg" key={index}>
                <Link to={item.to} className="flex items-center p-2 hover:bg-[#3498DB] rounded" onClick={toggleMenu}>
                  {item.icon}
                  <span className="ml-2">{item.text}</span>
                </Link>
              </li>
            ))}
            <div className="md:hidden text-lg">
              <Link to={''} className="flex items-center p-2 hover:bg-[#3498DB] rounded" onClick={toggleTheme}>
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                <span className="ml-2">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </Link>
            </div>
            {user ? (
              <>
                <li className="text-lg">
                  <Link to="/dashboard" className="flex items-center p-2 hover:bg-[#3498DB] rounded" onClick={toggleMenu}>
                    <User size={24} />
                    <span className="ml-2">Dashboard</span>
                  </Link>
                </li>
                <li className="text-lg">
                  <button onClick={handleLogout} className="flex items-center p-2 hover:bg-[#3498DB] rounded w-full text-left">
                    <LogOut size={24} />
                    <span className="ml-2">Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li className="text-lg">
                <Link to="/login" className="flex items-center p-2 hover:bg-[#3498DB] rounded" onClick={toggleMenu}>
                  <LogIn size={24} />
                  <span className="ml-2">Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;