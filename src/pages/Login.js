import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import SummitRidgeBackground from '../assets/images/SummitRidge_Background.webp';
import RegistrationModal from '../components/RegistrationModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regAccount, setRegAccount] = useState('');
  const [regOwner, setRegOwner] = useState('');
  const [regCode, setRegCode] = useState('');
  const [error, setError] = useState('');
  const [isLoginView, setIsLoginView] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [tempLoginData, setTempLoginData] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await authService.login(email, password);
      console.log('Login result:', result);
      
      if (result.token) {
        localStorage.setItem('token', result.token);  // Make sure token is set
        if (result.isTemporaryPassword) {
          setTempLoginData(result.user);
          setShowChangePasswordModal(true);
        } else {
          console.log('Login successful, navigating to dashboard');
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await authService.verifyRegistration(regAccount, regOwner, regCode);
      console.log('Registration verification result:', result);
      if (result.valid) {
        setShowRegistrationModal(true);
      } else {
        setError(result.error || 'Invalid registration information');
      }
    } catch (err) {
      console.error('Registration verification error:', err);
      setError('An error occurred during registration verification');
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
         style={{
           backgroundImage: `url(${SummitRidgeBackground})`,
           backgroundPosition: 'center center',
           backgroundAttachment: 'fixed'
         }}>
      <div className={`max-w-6xl w-full mx-4 ${isDarkMode ? 'bg-greenblack-dark bg-opacity-90' : 'bg-tanish-light bg-opacity-90'} rounded-xl shadow-2xl overflow-hidden`}>
        <div className="flex transition-transform duration-500 ease-in-out" style={{ width: '200%', transform: isLoginView ? 'translateX(0)' : 'translateX(-50%)' }}>
          {/* Registration Section */}
          <div className="w-1/4 p-12 bg-[#34495E] text-tanish-light">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Summit Ridge HOA</h2>
            <p className="text-lg mb-6">Register to become a part of our community.</p>
            <button onClick={toggleView} className={`justify-center mt-4 px-4 py-2 rounded ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}>
              Already have an account?
            </button>
          </div>
          <div className="w-1/4 p-12">
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-6`}>
              Register
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <div>
                <label htmlFor="reg-account" className={`block text-sm font-medium ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                  Account Number
                </label>
                <input
                  id="reg-account"
                  name="account"
                  type="text"
                  required
                  className={`mt-1 block w-full px-3 py-2 ${isDarkMode ? 'border-darkblue-dark bg-mutedolive text-darkolive' : 'border-tanish-dark bg-palebluegrey text-darkblue-light'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-darkblue-light focus:border-darkblue-light sm:text-sm`}
                  placeholder="Enter your account id"
                  value={regAccount}
                  onChange={(e) => setRegAccount(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-owner" className={`block text-sm font-medium ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                  Owner ID
                </label>
                <input
                  id="reg-owner"
                  name="owner"
                  type="text"
                  required
                  className={`mt-1 block w-full px-3 py-2 ${isDarkMode ? 'border-darkblue-dark bg-mutedolive text-darkolive' : 'border-tanish-dark bg-palebluegrey text-darkblue-light'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-darkblue-light focus:border-darkblue-light sm:text-sm`}
                  placeholder="Enter your owner id"
                  value={regOwner}
                  onChange={(e) => setRegOwner(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-code" className={`block text-sm font-medium ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                  Temporary Code
                </label>
                <input
                  id="reg-code"
                  name="code"
                  type="password"
                  required
                  className={`mt-1 block w-full px-3 py-2 ${isDarkMode ? 'border-darkblue-dark bg-mutedolive text-darkolive' : 'border-tanish-dark bg-palebluegrey text-darkblue-light'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-darkblue-light focus:border-darkblue-light sm:text-sm`}
                  placeholder="Enter your temporary code"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'text-tanish-dark bg-darkblue-dark hover:bg-darkblue-light' : 'text-tanish-light bg-greenblack-light hover:bg-darkblue-light'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkblue-light`}
                >
                  Verify Registration
                </button>
              </div>
            </form>
          </div>
          {/* Welcome Section */}
          <div className="w-1/4 p-12 bg-[#34495E] text-tanish-light">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome to Summit Ridge HOA</h2>
            <p className="text-lg mb-6">Log in to access your account and community information.</p>
            <button onClick={toggleView} className={`mt-4 px-4 py-2 rounded ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}>
              Need to Register?
            </button>
            <div>
              <p>Ada.Nolcrest@coldmail.com</p>
              <p>Pas$w0rd1!</p>
            </div>
          </div>
          {/* Login Section */}
          <div className="w-1/4 p-12">
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-6`}>
              Login
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="login-email" className={`block text-sm font-medium ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  className={`mt-1 block w-full px-3 py-3  ${isDarkMode ? 'border-darkblue-dark bg-mutedolive text-darkolive' : 'border-tanish-dark bg-palebluegrey text-darkblue-light'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-darkblue-light focus:border-darkblue-light sm:text-sm`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="login-password" className={`block text-sm font-medium ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className={`mt-1 block w-full px-3 py-3  ${isDarkMode ? 'border-darkblue-dark bg-mutedolive text-darkolive' : 'border-tanish-dark bg-palebluegrey text-darkblue-light'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-darkblue-light focus:border-darkblue-light sm:text-sm`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'text-tanish-dark bg-darkblue-dark hover:bg-darkblue-light' : 'text-tanish-light bg-greenblack-light hover:bg-darkblue-light'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkblue-light`}
                >
                  Sign in
                </button>
              </div>
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className={`text-sm hover:underline ${
                    isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                  }`}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showRegistrationModal && (
        <RegistrationModal 
          accountId={regAccount}
          ownerId={regOwner}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setShowRegistrationModal(false);
            setIsLoginView(true);
          }}
        />
      )}
      {showChangePasswordModal && (
        <ChangePasswordModal
          user={tempLoginData}
          onClose={() => {
            setShowChangePasswordModal(false);
            setError('You must change your password before proceeding.');
          }}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default Login;