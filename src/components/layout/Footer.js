import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Facebook, Twitter, Instagram, Mail, Phone, Clock, MapPin } from 'lucide-react';
import XIcon from '../../assets/images/XIcon';

const Footer = () => {
  const { isDarkMode } = useTheme();

  const IconLink = ({ href, icon: Icon, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 hover:${isDarkMode ? 'text-softcoral' : 'text-tanish-light'} transition-colors duration-200`}
    >
      <Icon size={18} />
      {children}
    </a>
  );

  const FooterLink = ({ to, children }) => (
    <li>
      <Link
        to={to}
        className={`hover:${isDarkMode ? 'text-softcoral' : 'text-tanish-light'} transition-colors duration-200`}
      >
        {children}
      </Link>
    </li>
  );

  return (
    <footer className={`${isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-darkblue-light text-tanish-light'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h5 className="text-lg font-semibold mb-3">Contact Us</h5>
            <div className="space-y-2">
              <p className="font-medium">Summit Ridge HOA</p>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <p>1234 Summit Lane, Somewhere, FL 33865</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <a href="mailto:info@summitridgehoa.com" className="hover:text-softcoral transition-colors duration-200">
                  TheSummitRidgeHOA@proton.me
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <p>(123) 456-7890</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <p>Mon-Fri, 9 AM - 5 PM</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold mb-3">Quick Links</h5>
            <ul className="space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/login">Login</FooterLink>
              <FooterLink to="/public-announcements">News & Events</FooterLink>
              <FooterLink to="/contact">Help Center</FooterLink>
            </ul>
          </div>

          {/* Legal and Social */}
          <div>
            <h5 className="text-lg font-semibold mb-3">Legal & Social</h5>
            <ul className="space-y-2 mb-4">
              <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
           
            <div className="space-y-2">
              <h6 className="font-medium">Connect With Us</h6>
              <div className="flex gap-4">
                <IconLink href="https://facebook.com" icon={Facebook}>
                  Facebook
                </IconLink>
                <IconLink href="https://x.com" icon={XIcon}>
                  X
                </IconLink>
                <IconLink href="https://instagram.com" icon={Instagram}>
                  Instagram
                </IconLink>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-4 text-center">
          <p>&copy; {new Date().getFullYear()} Summit Ridge HOA. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;