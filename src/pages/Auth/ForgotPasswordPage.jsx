// pages/Auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, ArrowLeft, AlertCircle, CheckCircle,
  Send, Sun, Moon
} from 'lucide-react';

const ForgotPasswordPage = ({ darkMode, setDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900' 
        : 'bg-gradient-to-br from-[#f3f0feff] via-white to-purple-50/30'
    }`}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-all duration-200 border
            ${darkMode 
              ? 'bg-neutral-800 border-neutral-700 text-yellow-400 hover:bg-neutral-700' 
              : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`w-full max-w-md ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10">
              <img 
                src="/logo.png"  
                alt="Vigilant Logo"
                className="w-full h-full object-contain"   
              />
            </div>
            <h1 className="text-2xl font-bold">Vigilant</h1>
          </Link>
        </div>

        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm mb-6 hover:underline transition-colors"
          style={{ color: colors.accent }}
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            No worries! Enter your email and we'll send you reset instructions
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 animate-slideIn">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Reset email sent!
              </p>
              <p className="text-xs text-green-500 dark:text-green-500 mt-1">
                Check your inbox for password reset instructions
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 animate-slideIn">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all
                    focus:outline-none focus:ring-2 focus:ring-[#EE9C6C]/50
                    ${darkMode 
                      ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-500' 
                      : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 px-4 rounded-lg text-white font-medium
                       transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0
                       overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                   style={{ transition: 'transform 0.5s' }} />
            </button>
          </form>
        )}

        {/* Success Actions */}
        {success && (
          <div className="text-center space-y-4">
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 rounded-lg text-white font-medium
                       transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
            >
              Return to Login
            </Link>
            
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className={`text-sm hover:underline transition-colors ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}
              style={{ color: colors.accent }}
            >
              Try another email
            </button>
          </div>
        )}

        {/* Help Text */}
        <p className={`text-center text-xs mt-8 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={handleSubmit}
            disabled={loading || !email}
            className="font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: colors.accent }}
          >
            resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;