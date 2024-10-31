import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Shield, 
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Send,
  CheckCircle,
  HelpCircle,
  Globe
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import XIcon from '../../assets/images/XIcon';  // Using our custom X icon

const ContactSection = ({ title, icon: Icon, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mb-8 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className={`${isDarkMode ? 'text-darkblue-light' : 'text-greenblack-light'}`} />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey'}`}>
        {children}
      </div>
    </div>
  );
};

const ContactLink = ({ icon: Icon, href, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <a 
      href={href}
      className={`flex items-center gap-2 hover:${isDarkMode ? 'text-darkblue-light' : 'text-greenblack-light'} transition-colors duration-200`}
    >
      <Icon size={18} />
      {children}
    </a>
  );
};

const ContactForm = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Construct message content with additional info for non-logged-in users
      const messageContent = user 
        ? formData.message
        : `From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`;

      const response = await apiService.sendSystemMessage({
        subject: formData.subject,
        message: messageContent,
        senderType: user ? 'user' : 'guest',
        senderId: user?.OWNER_ID || null,
        // Include guest info if not logged in
        guestInfo: !user ? {
          name: formData.name,
          email: formData.email
        } : undefined
      });

      setStatus({
        type: 'success',
        message: 'Your message has been sent successfully. We will get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!user && (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-mutedolive border-darkblue-dark text-darkolive' 
                  : 'bg-palebluegrey border-darkblue-light text-darkblue-light'
              }`}
            />
          </div>
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-mutedolive border-darkblue-dark text-darkolive' 
                  : 'bg-palebluegrey border-darkblue-light text-darkblue-light'
              }`}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>Subject</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-mutedolive border-darkblue-dark text-darkolive' 
              : 'bg-palebluegrey border-darkblue-light text-darkblue-light'
          }`}
        />
      </div>

      <div>
        <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>Message</label>
        <textarea
          id="message"
          name="message"
          rows="6"
          value={formData.message}
          onChange={handleChange}
          required
          className={`w-full p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-mutedolive border-darkblue-dark text-darkolive' 
              : 'bg-palebluegrey border-darkblue-light text-darkblue-light'
          }`}
        />
      </div>

      {status.message && (
        <div className={`p-4 rounded-lg ${
          status.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <p className="flex items-center gap-2">
            {status.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {status.message}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg ${
          isDarkMode 
            ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
            : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin">⌛</span>
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
};

const Contact = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} rounded-lg shadow-lg`}>
      <div className="container mx-auto px-6 py-12">
        <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'} rounded-lg shadow-lg p-8`}>
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Contact Summit Ridge HOA
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              We're here to help! Whether you have a question, need assistance with HOA-related matters, 
              or want to provide feedback, the Summit Ridge HOA team is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ContactSection title="General Inquiries" icon={Mail}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail size={18} />
                    <span>TheSummitRidgeHOA@proton.me</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} />
                    <span>(123) 456-7890</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>Monday to Friday, 9:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </ContactSection>

              <ContactSection title="Visit Us" icon={MapPin}>
                <address className="not-italic">
                  <strong>Summit Ridge HOA Office</strong><br />
                  1234 Summit Lane<br />
                  Somewhere, FL 33865
                </address>
              </ContactSection>

              <ContactSection title="Board Members" icon={Shield}>
                <div className="space-y-3">
                  <p><strong>Susan Meadows, President</strong><br />president@summitridgehoa.com</p>
                  <p><strong>Tom Wilkins, Vice President</strong><br />vicepresident@summitridgehoa.com</p>
                  <p><strong>Elaine Fisher, Treasurer</strong><br />treasurer@summitridgehoa.com</p>
                  <p><strong>John Doe, Secretary</strong><br />secretary@summitridgehoa.com</p>
                </div>
              </ContactSection>

              <ContactSection title="Emergency Contacts" icon={AlertCircle}>
                <div className="space-y-3">
                  <p><strong>Security Hotline:</strong> (123) 987-6543 (24/7)</p>
                  <p><strong>Emergency Maintenance:</strong> (123) 456-7891 (After hours)</p>
                  <p><strong>Local Authorities:</strong> (123) 555-1212</p>
                  <p className="text-red-500"><strong>For life-threatening emergencies, dial 911</strong></p>
                </div>
              </ContactSection>

              <ContactSection title="Stay Connected" icon={Globe}>
                <div className="flex flex-wrap gap-6">
                  <ContactLink href="https://facebook.com/SummitRidgeHOA" icon={Facebook}>
                    Summit Ridge HOA
                  </ContactLink>
                  <ContactLink href="https://x.com/SummitRidgeHOA" icon={XIcon}>
                    @SummitRidgeHOA
                  </ContactLink>
                  <ContactLink href="https://instagram.com/SummitRidgeHOA" icon={Instagram}>
                    @SummitRidgeHOA
                  </ContactLink>
                </div>
              </ContactSection>
            </div>

            <div>
              <ContactSection title="Send Us a Message" icon={Send}>
                <ContactForm />
              </ContactSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;