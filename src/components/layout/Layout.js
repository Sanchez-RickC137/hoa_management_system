import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import SummitRidgeBackground from '../../assets/images/SummitRidge_Background.webp';

const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [isCollapsed] = useSidebar();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isPublicRoute = ['/', '/about', '/amenities', '/contact', '/privacy-policy', '/terms'].includes(location.pathname);
  const isProtectedRoute = user && (
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/documents') ||
    location.pathname.startsWith('/payments') ||
    location.pathname.startsWith('/messages') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/owner') ||
    location.pathname.startsWith('/surveys') ||
    location.pathname.startsWith('/news-events') ||
    location.pathname.startsWith('/board-dashboard') ||
    location.pathname.startsWith('/account')
  );

  // if (isLoginPage) {
  //   return <div className="min-h-screen">{children}</div>;
  // }

  const mainStyle = {
    backgroundImage: `url(${SummitRidgeBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {(isPublicRoute || !isProtectedRoute) && <Header />}
      <div className="flex-grow flex relative">
        {isProtectedRoute && <Sidebar />}
        <main 
          className={`flex-grow transition-all duration-300`}
          style={mainStyle}
        >
          <div className="relative z-10 min-h-screen p-4 md:p-8">
            <div className="container mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      {!isProtectedRoute && <Footer />}
    </div>
  );
};

export default Layout;

// Adjust to the right with sidebar. Leave out for now
// ${
//   isProtectedRoute ? (isCollapsed ? 'md:ml-16 ' : 'md:ml-64') : ''
// }

