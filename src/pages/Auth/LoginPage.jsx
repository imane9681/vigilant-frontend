// frontend/src/pages/Auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, LogIn,
  AlertCircle, ArrowRight,
  Shield, Database, Server, Users, Sun, Moon,
  Sparkles, Copy
} from 'lucide-react';
import { authService } from '../../services/api';

const LoginPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid email or password');
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

            <h2 className="text-4xl font-bold mb-6">Welcome Back! 👋</h2>
            <p className="text-xl text-white/80 mb-12">
              The ultimate admin dashboard for managing your business with powerful analytics and real-time insights.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Database size={20} />
                </div>
                <div>
                  <p className="font-semibold">Database</p>
                  <p className="text-sm text-white/60">Real-time sync</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-semibold">Security</p>
                  <p className="text-sm text-white/60">2FA enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Server size={20} />
                </div>
                <div>
                  <p className="font-semibold">Performance</p>
                  <p className="text-sm text-white/60">99.9% uptime</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-semibold">Analytics</p>
                  <p className="text-sm text-white/60">Real-time data</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <p className="text-lg italic mb-4">
                "The best admin dashboard I've ever used. Saves me hours every day!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-semibold">Imane Bouasla</p>
                  <p className="text-sm text-white/60">CEO, TechStart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
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
              Sign In
            </h2>
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Welcome back! Please enter your details
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 animate-slideIn">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-[#EE9C6C] focus:ring-[#EE9C6C]"
                />
                <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className={`text-sm font-medium hover:underline transition-colors`}
                style={{ color: colors.accent }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Demo Credentials - Premium Minimalist Design */}
            <div className={`relative rounded-xl p-4 border transition-all duration-300 ${
              darkMode 
                ? 'bg-neutral-800/40 border-neutral-700/50 hover:border-neutral-600' 
                : 'bg-white/60 border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(139,122,186,0.1)] hover:shadow-[0_4px_15px_-3px_rgba(139,122,186,0.2)] backdrop-blur-sm hover:border-purple-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${
                    darkMode ? 'bg-neutral-700 text-neutral-300' : 'bg-purple-100/50 text-[#8B7ABA]'
                  }`}>
                    <Sparkles size={14} />
                  </div>
                  <span className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                    Demo Access
                  </span>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  darkMode ? 'bg-[#EE9C6C]' : 'bg-[#8B7ABA]'
                }`} />
              </div>
              
              <div className="flex gap-2 mb-3">
                <div className={`flex-1 rounded-md p-2 border ${
                  darkMode ? 'bg-neutral-800/80 border-neutral-700/50' : 'bg-white border-neutral-100'
                }`}>
                  <span className={`text-[10px] font-medium uppercase tracking-wider block mb-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Email
                  </span>
                  <span className={`text-sm font-mono font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    admin@example.com
                  </span>
                </div>
                <div className={`flex-1 rounded-md p-2 border ${
                  darkMode ? 'bg-neutral-800/80 border-neutral-700/50' : 'bg-white border-neutral-100'
                }`}>
                  <span className={`text-[10px] font-medium uppercase tracking-wider block mb-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Password
                  </span>
                  <span className={`text-sm font-mono font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    admin123
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'admin@example.com', password: 'admin123' });
                  setError('');
                }}
                className={`w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  darkMode
                    ? 'bg-neutral-700/80 text-white hover:bg-neutral-600'
                    : 'bg-[#8B7ABA]/10 text-[#8B7ABA] hover:bg-[#8B7ABA]/20'
                }`}
              >
                <Copy size={14} />
                Auto-fill Credentials
              </button>
            </div>

            {/* Submit Button */}
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                   style={{ transition: 'transform 0.5s' }} />
            </button>

            {/* Register Link */}
            <p className={`text-center text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium hover:underline transition-colors"
                style={{ color: colors.accent }}
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;