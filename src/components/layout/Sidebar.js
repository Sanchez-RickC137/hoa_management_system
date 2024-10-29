import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Home, User, CreditCard, MessageCircle, LayoutDashboard, Megaphone, Files, ClipboardList, LogOut, Sun, Moon, Menu, X, UserCog } from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, to, onClick, isCollapsed }) => {
  const { isDarkMode } = useTheme();
  const baseClasses = "flex items-center w-full p-2 transition-colors duration-200 rounded-lg";
  const activeClasses = `${isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'} hover:bg-[#34495E]`;
  const buttonClasses = `${baseClasses} ${activeClasses}`;
  const iconClasses = `w-7 h-7 ${isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'}`;

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={buttonClasses}
        title={text}
      >
        <Icon className={iconClasses} />
        {!isCollapsed && <span className={`ml-3 ${isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'}`}>{text}</span>}
      </button>
    );
  }

  return (
    <Link 
      to={to} 
      className={buttonClasses}
      title={text}
    >
      <Icon className={iconClasses} />
      {!isCollapsed && <span className={`ml-3 ${isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'}`}>{text}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const { logout, isBoardMember } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const mainMenuContent = (
    <ul className="space-y-2 font-medium">
      <li><SidebarItem icon={Home} text="HOA Home" to="/" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={LayoutDashboard} text="Dashboard" to="/dashboard" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={User} text="Owner" to="/owner-info" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={CreditCard} text="Account" to="/payments" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={MessageCircle} text="Messages" to="/messages" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={Megaphone} text="News & Events" to="/news-events" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={Files} text="Documents" to="/documents" isCollapsed={isCollapsed} /></li>
      <li><SidebarItem icon={ClipboardList} text="Survey" to="/surveys" isCollapsed={isCollapsed} /></li>
    </ul>
  );

  const bottomMenuContent = (
    <ul className="space-y-2 font-medium">
      {isBoardMember() && (
        <li>
          <SidebarItem 
            icon={UserCog} 
            text="Board Actions" 
            to="/board-dashboard" 
            isCollapsed={isCollapsed} 
          />
        </li>
      )}
      <li>
        <SidebarItem 
          icon={isDarkMode ? Sun : Moon} 
          text={isDarkMode ? 'Light Mode' : 'Dark Mode'} 
          onClick={toggleTheme} 
          isCollapsed={isCollapsed} 
        />
      </li>
      <li className="border-t border-gray-700 pt-2">
        <SidebarItem 
          icon={LogOut} 
          text="Logout" 
          onClick={logout} 
          isCollapsed={isCollapsed} 
        />
      </li>
    </ul>
  );

  const mobileContent = (
    <>
      <ul className="grid grid-cols-2 gap-4 font-medium">
        <li><SidebarItem icon={Home} text="HOA Home" to="/" isCollapsed={false} /></li>
        <li><SidebarItem icon={LayoutDashboard} text="Dashboard" to="/dashboard" isCollapsed={false} /></li>
        <li><SidebarItem icon={User} text="Owner" to="/owner-info" isCollapsed={false} /></li>
        <li><SidebarItem icon={CreditCard} text="Account" to="/payments" isCollapsed={false} /></li>
        <li><SidebarItem icon={MessageCircle} text="Messages" to="/messages" isCollapsed={false} /></li>
        <li><SidebarItem icon={Megaphone} text="News & Events" to="/news-events" isCollapsed={false} /></li>
        <li><SidebarItem icon={Files} text="Documents" to="/documents" isCollapsed={false} /></li>
        <li><SidebarItem icon={ClipboardList} text="Survey" to="/surveys" isCollapsed={false} /></li>
      </ul>
      {/* Board Actions on its own line */}
      {isBoardMember() && (
        <ul className="grid grid-cols-2 gap-4 font-medium pt-4">
          <li className="col-span-2 border-t">
            <SidebarItem 
              icon={UserCog} 
              text="Board Actions" 
              to="/board-dashboard" 
              isCollapsed={false}
            />
          </li>
        </ul>
      )}
      <ul className="grid grid-cols-2 gap-4 pt-4 font-medium">
        <li>
          <SidebarItem 
            icon={isDarkMode ? Sun : Moon} 
            text={isDarkMode ? 'Light Mode' : 'Dark Mode'} 
            onClick={toggleTheme} 
            isCollapsed={false} 
          />
        </li>
        <li>
          <SidebarItem 
            icon={LogOut} 
            text="Logout" 
            onClick={logout} 
            isCollapsed={false} 
          />
        </li>
      </ul>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${isDarkMode ? 'bg-[#2C3E50]' : 'bg-[#34495E]'} hidden lg:block`}
        style={{ width: isCollapsed ? '64px' : '256px' }}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className={`p-2 rounded-lg text-[#ECF0F1] hover:bg-[#3498DB]`}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className={`w-6 h-6 ${isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'}`} />
            </button>
            {/* {!isCollapsed && <span className={`text-lg font-semibold text-[#ECF0F1]`}>Menu</span>} */}
          </div>
          
          {/* Main menu items */}
          <div className="flex-grow">
            {mainMenuContent}
          </div>

          {/* Bottom menu items */}
          <div className="mt-auto">
            {bottomMenuContent}
          </div>
        </div>
      </aside>
      
      {/* Mobile Sticky Header and Menu - unchanged */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 ${isDarkMode ? 'bg-[#2C3E50]' : 'bg-[#34495E]'} p-4 z-50 flex justify-between items-center`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'}`}>Summit Ridge HOA</h2>
        <button onClick={toggleMobileMenu} className={`p-2 rounded-full hover:bg-[#3498DB]`}>
          {isMobileMenuOpen ? <X size={24} className={isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'} /> : <Menu size={24} className={isDarkMode ? 'text-[#ECF0F1]' : 'text-tanish-light'} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`lg:hidden fixed top-16 left-0 right-0 ${isDarkMode ? 'bg-[#2C3E50]' : 'bg-[#34495E]'} z-40 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'} overflow-hidden`}>
        <nav className="p-4">
          {mobileContent}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;