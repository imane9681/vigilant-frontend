// pages/Auth/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Lock, Eye, EyeOff, AlertCircle, CheckCircle,
  ArrowLeft, Key, Sun, Moon
} from 'lucide-react';

const ResetPasswordPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(formData.password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(formData.password)) return 'Password must contain at least one number';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] || 'Very Weak';
  const strengthColor = [
    '#F08FAE',
    '#EE9C6C',
    '#8B7ABA',
    '#34D19C'
  ][strength - 1] || '#F08FAE';

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
          <h2 className="text-3xl font-bold mb-2">Set New Password</h2>
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Your new password must be different from previously used passwords
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 animate-slideIn">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Password reset successful!
              </p>
              <p className="text-xs text-green-500 dark:text-green-500 mt-1">
                Redirecting to login page...
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
            {/* New Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                New Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all
                    focus:outline-none focus:ring-2 focus:ring-[#EE9C6C]/50
                    ${darkMode 
                      ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-500' 
                      : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500 hover:text-neutral-400' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Password strength
                    </span>
                    <span className="text-xs font-medium" style={{ color: strengthColor }}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= strength 
                            ? 'opacity-100' 
                            : darkMode ? 'bg-neutral-700' : 'bg-neutral-200'
                        }`}
                        style={{ backgroundColor: level <= strength ? strengthColor : undefined }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all
                    focus:outline-none focus:ring-2 focus:ring-[#EE9C6C]/50
                    ${darkMode 
                      ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-500' 
                      : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500 hover:text-neutral-400' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
              <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Password requirements:
              </p>
              <ul className="space-y-2">
                {[
                  'At least 8 characters long',
                  'At least one uppercase letter',
                  'At least one number',
                  'Match confirmation password'
                ].map((req, index) => {
                  let isValid = false;
                  if (index === 0) isValid = formData.password.length >= 8;
                  if (index === 1) isValid = /[A-Z]/.test(formData.password);
                  if (index === 2) isValid = /[0-9]/.test(formData.password);
                  if (index === 3) isValid = formData.password && formData.password === formData.confirmPassword;

                  return (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      {isValid ? (
                        <CheckCircle size={12} className="text-[#34D19C]" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-neutral-400" />
                      )}
                      <span className={isValid ? 'text-[#34D19C]' : darkMode ? 'text-neutral-400' : 'text-neutral-500'}>
                        {req}
                      </span>
                    </li>
                  );
                })}
              </ul>
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
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    <span>Reset Password</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                   style={{ transition: 'transform 0.5s' }} />
            </button>
          </form>
        )}

        {/* Token Info */}
        {token && !success && (
          <p className={`text-center text-xs mt-6 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Reset token: <code className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{token.slice(0, 8)}...{token.slice(-8)}</code>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;