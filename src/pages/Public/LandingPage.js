import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SummitLodge from '../../assets/images/SummitLodgeClubhouse.png';
import Announce from '../../assets/images/Announcements.jpeg';
import MemberPortal from '../../assets/images/MemberPortal.jpeg';
import LogoLight from '../../assets/images/SummitRidgeLogoLight.png';
import LogoDark from '../../assets/images/SummitRidgeLogoDark.png';
import { useTheme } from '../../contexts/ThemeContext';

const LandingPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-12">
        <div className={`${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} p-6 rounded-lg shadow-lg text-center`}>
          <div className="flex justify-center align-center">
            {isDarkMode && <img src={LogoLight} alt="Summit Ridge Logo"></img>}
            {!isDarkMode && <img src={LogoDark} alt="Summit Ridge Logo"></img>}
          </div>
          <p className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} text-3xl mb-4`}>Reaching New Heights in Florida Living</p>
          <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'} p-6 rounded-lg shadow-lg`}>
            <p className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-4`}>
              Nestled in the heart of Somewhere, Florida, Summit Ridge is a one-of-a-kind community that embraces the humor and charm of a mountain-themed neighborhood. While Florida's highest peak might just be our clubhouse roof, we aim to deliver a unique living experience rooted in a strong sense of community, fun, and top-quality HOA services.
            </p>
            <Link to="/about" className={`${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} px-4 py-2 rounded hover:bg-opacity-80 transition-colors inline-block`}>
              Learn More
            </Link>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} p-6 rounded-lg shadow-lg`}>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-6 text-center`}>Community Features</h2>
          <div className="grid grid-cols-1 gap-8">
          
            <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark': 'bg-oldlace text-darkblue-light'} rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row h-full`}>
              <div className="md:w-1/2 h-64">
                <img src={SummitLodge} alt="Summit Lodge" className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Summit Lodge</h3>
                  <p className=" mb-4">Our central clubhouse serves as the social hub for the community, offering ample space for resident events, private bookings, and HOA meetings</p>
                </div>
                <Link 
                  to="/amenities"
                  className={`${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} px-4 py-2 rounded hover:bg-opacity-80 transition-colors inline-block px-4 py-2 rounded hover:bg-opacity-80 transition-colors self-start mt-auto`}>
                  Learn More
                </Link>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark': 'bg-oldlace text-darkblue-light'} bg-opacity-80 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row md:flex-row-reverse h-full`}>
              <div className="md:w-1/2 h-64">
                <img src={Announce} alt="Community Events" className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Community Events</h3>
                  <p className="mb-4">From our famous "Peak Pool Party" to the annual "Summit BBQ," we aim to create a calendar full of fun, adventure, and meaningful connections.</p>
                </div>
                <Link 
                  to="/public-announcements"
                  className={`${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} px-4 py-2 rounded hover:bg-opacity-80 transition-colors inline-block px-4 py-2 rounded hover:bg-opacity-80 transition-colors self-start mt-auto`}>
                  View Events
                </Link>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark': 'bg-oldlace text-darkblue-light'} rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row h-full`}>
              <div className="md:w-1/2 h-64">
                <img src={MemberPortal} alt="Member Portal" className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Member Portal</h3>
                  <p className="mb-4">Access our comprehensive suite of resident services, including landscaping, maintenance, and security patrols, for a hassle-free living experience.</p>
                </div>
                <Link 
                  to="/login"  // Changed from button to Link with proper route
                  className={`${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} px-4 py-2 rounded hover:bg-opacity-80 transition-colors inline-block px-4 py-2 rounded hover:bg-opacity-80 transition-colors self-start mt-auto`}>
                  Access Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} p-6 rounded-lg shadow-lg text-center`}>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-4 text-center`}>Our Vision</h2>
          <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark': 'bg-oldlace text-darkblue-light'} rounded-lg shadow-lg overflow-hidden h-full`}>
            <div>
              <p className="mb-4">
                At Summit Ridge, we strive to elevate the quality of life for our residents while fostering a sense of fun, community, and pride in where we live. We aim to create a living experience that transcends the ordinary, turning everyday life into a series of small adventures.
              </p>
            </div>
            <div>
              <div className="text-center">
                <Link to="/about" className={`mb-4 ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} px-4 py-2 rounded hover:bg-opacity-80 transition-colors inline-block`}>
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
