// frontend/src/pages/Auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, User,
  AlertCircle, CheckCircle, ArrowRight, UserPlus,
  Shield, Database, Server, Users, Sun, Moon
} from 'lucide-react';
import { authService } from '../../services/api';

const RegisterPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(formData.password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(formData.password)) return 'Password must contain at least one number';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeTerms) return 'You must agree to the terms and conditions';
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
      const response = await authService.register({
        username: formData.email.split('@')[0],
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,  
        first_name: formData.name.split(' ')[0],
        last_name: formData.name.split(' ').slice(1).join(' ') || '',
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorDetail = err.response?.data?.detail;
      
      if (typeof errorDetail === 'object') {
        const firstError = Object.values(errorDetail)[0]?.[0];
        setError(firstError || 'Registration failed. Please try again.');
      } else {
        setError(errorDetail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900' 
        : 'bg-gradient-to-br from-[#f3f0feff] via-white to-purple-50/30'
    }`}>
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B7ABA] to-[#EE9C6C] opacity-90"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
        </div>

        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12">
                <img 
                  src="/logo.png"  
                  alt="Vigilant Logo"
                  className="w-full h-full object-contain brightness-0 invert"   
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Vigilant</h1>
            </div>

            <h2 className="text-4xl font-bold mb-6">Join Us Today! 🚀</h2>
            <p className="text-xl text-white/80 mb-12">
              Create your account and start managing your business with our powerful tools.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg mt-1">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enterprise-Grade Security</h3>
                  <p className="text-sm text-white/60">Your data is protected with industry-standard encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg mt-1">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-Time Analytics</h3>
                  <p className="text-sm text-white/60">Get insights into your business with live data updates</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg mt-1">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">24/7 Support</h3>
                  <p className="text-sm text-white/60">Our team is always here to help you succeed</p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-sm text-white/60">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold">99.9%</p>
                <p className="text-sm text-white/60">Uptime</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-white/60">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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

          {/* Logo for Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10">
                <img 
                  src="/logo.png"  
                  alt="Vigilant Logo"
                  className="w-full h-full object-contain"   
                />
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Vigilant
              </h1>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Create Account
            </h2>
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Join thousands of businesses using Vigilant
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3 animate-slideIn">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Registration successful!
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Full Name *
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all
                    focus:outline-none focus:ring-2 focus:ring-[#EE9C6C]/50
                    ${darkMode 
                      ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-500' 
                      : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Email Address *
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all
                    focus:outline-none focus:ring-2 focus:ring-[#EE9C6C]/50
                    ${darkMode 
                      ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-500' 
                      : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'
                    }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Password *
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
              <p className={`text-xs mt-2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Must be at least 8 characters with 1 uppercase and 1 number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Confirm Password *
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

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-1 rounded border-neutral-300 text-[#EE9C6C] focus:ring-[#EE9C6C]"
              />
              <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                I agree to the{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: colors.accent }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: colors.accent }}>
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Sign Up</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                   style={{ transition: 'transform 0.5s' }} />
            </button>

            {/* Login Link */}
            <p className={`text-center text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium hover:underline transition-colors"
                style={{ color: colors.accent }}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;