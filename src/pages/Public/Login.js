import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/authService';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import SummitRidgeBackground from '../../assets/images/SummitRidge_Background.webp';
import RegistrationModal from '../../components/RegistrationModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';

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
      if (result.token) {
        localStorage.setItem('token', result.token);
        if (result.isTemporaryPassword) {
          setTempLoginData(result.user);
          setShowChangePasswordModal(true);
        } else {
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

  const inputStyle = `w-full px-3 py-3 rounded-lg shadow-sm ${
    isDarkMode 
      ? 'border-darkblue-dark bg-mutedolive text-darkolive' 
      : 'border-tanish-dark bg-palebluegrey text-darkblue-light'
  } focus:outline-none focus:ring-darkblue-light focus:border-darkblue-light`;

  const buttonStyle = `w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium ${
    isDarkMode 
      ? 'text-tanish-dark bg-darkblue-dark hover:bg-darkblue-light' 
      : 'text-tanish-light bg-greenblack-light hover:bg-darkblue-light'
  }`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
         style={{
           backgroundImage: `url(${SummitRidgeBackground})`,
           backgroundPosition: 'center center',
           backgroundAttachment: 'fixed'
         }}>
      {/* Desktop View */}
      <div className="hidden md:block max-w-6xl w-full mx-4">
        <div className={`${isDarkMode ? 'bg-greenblack-dark bg-opacity-90' : 'bg-tanish-light bg-opacity-90'} rounded-xl shadow-2xl overflow-hidden`}>
          <div className="flex transition-transform duration-500 ease-in-out" 
               style={{ width: '200%', transform: isLoginView ? 'translateX(0)' : 'translateX(-50%)' }}>
            {/* Registration Section */}
            <div className="w-1/4 p-12 bg-[#34495E] text-tanish-light">
              <h2 className="text-4xl font-bold mb-6">Join Summit Ridge HOA</h2>
              <p className="text-lg mb-6">Register to become a part of our community.</p>
              <button onClick={toggleView} 
                      className={`px-4 py-2 rounded ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}>
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
                  <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Account Number</label>
                  <input
                    type="text"
                    value={regAccount}
                    onChange={(e) => setRegAccount(e.target.value)}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Owner ID</label>
                  <input
                    type="text"
                    value={regOwner}
                    onChange={(e) => setRegOwner(e.target.value)}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Temporary Code</label>
                  <input
                    type="password"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    className={inputStyle}
                    required
                  />
                </div>
                <button type="submit" className={buttonStyle}>
                  Verify Registration
                </button>
              </form>
            </div>
            
            {/* Login Section */}
            <div className="w-1/4 p-12 bg-[#34495E] text-tanish-light">
              <h2 className="text-4xl font-bold mb-6">Welcome to Summit Ridge HOA</h2>
              <p className="text-lg mb-6">Log in to access your account and community information.</p>
              <button onClick={toggleView} 
                      className={`px-4 py-2 rounded ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}>
                Need to Register?
              </button>
              <div className="mt-4">
                <p>Ada.Nolcrest@coldmail.com</p>
                <p>Pas$w0rd1!</p>
              </div>
            </div>
            <div className="w-1/4 p-12">
              <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-6`}>
                Login
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputStyle}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} text-sm hover:underline`}
                  >
                    Forgot Password?
                  </button>
                </div>
                <button type="submit" className={buttonStyle}>
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full max-w-md mx-4">
        <div className={`${isDarkMode ? 'bg-greenblack-dark bg-opacity-90' : 'bg-tanish-light bg-opacity-90'} rounded-xl shadow-2xl p-6`}>
          {/* Mobile Tab Navigation */}
          <div className="flex mb-6 border-b">
          <button
            onClick={() => setIsLoginView(false)}
            className={`flex-1 py-3 px-4 text-center ${
              !isLoginView 
                ? isDarkMode 
                  ? 'border-b-2 border-darkblue-dark text-tanish-dark'
                  : 'border-b-2 border-greenblack-light text-darkblue-light'
                : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginView(true)}
            className={`flex-1 py-3 px-4 text-center ${
              isLoginView 
                ? isDarkMode 
                  ? 'border-b-2 border-darkblue-dark text-tanish-dark'
                  : 'border-b-2 border-greenblack-light text-darkblue-light'
                : 'text-gray-500'
            }`}
          >
            Register
          </button>
          </div>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          {!isLoginView ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div>
                <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} text-sm hover:underline`}
                >
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className={buttonStyle}>
                Sign in
              </button>
              <div className="mt-4 text-sm text-center">
                <p>Test Account:</p>
                <p>Ada.Nolcrest@coldmail.com</p>
                <p>Pas$w0rd1!</p>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div>
                <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Account Number</label>
                <input
                  type="text"
                  value={regAccount}
                  onChange={(e) => setRegAccount(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div>
                <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Owner ID</label>
                <input
                  type="text"
                  value={regOwner}
                  onChange={(e) => setRegOwner(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div>
                <label className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} block text-sm font-medium mb-1`}>Temporary Code</label>
                <input
                  type="password"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <button type="submit" className={buttonStyle}>
                Verify Registration
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modals */}
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