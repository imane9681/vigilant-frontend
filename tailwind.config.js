// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // ✅ نظام الألوان الأساسي
      // ============================================
      colors: {
        // نظام ألوان أساسي مبني على #58419C
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#8B7ABA',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#58419C',  // ◀◀◀ اللون الأساسي المحدد
          900: '#4c1d95',
          950: '#2e1065',
          sidebar: '#58419C',
        },
        
        // نظام ألوان ثانوي متناسق
        secondary: {
          50: '#fdf2ff',
          100: '#fce8ff',
          200: '#fad1ff',
          300: '#f8b4e9',
          400: '#f28bd8',
          500: '#e879c1',
          600: '#d861a8',
          700: '#c2418f',
          800: '#a21c76',
          900: '#86195f',
        },
        
        // ألوان الحالات
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#99E7CD',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#F6CDB5',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#F08FAE',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // ألوان محايدة معززة
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        
        // ألوان مخصصة للسايدبار
        sidebar: {
          icon: '#ffffff',
          logo: '#EE9C6C',
          text: '#ffffff',
          button: '#EE9C6C',
          'active-icon': '#EE9C6C',
          'active-text': '#EE9C6C',
          'hover-bg': 'rgba(255, 167, 38, 0.1)',
          'border': 'rgba(255, 255, 255, 0.1)',
        },
        
        // ألوان مخصصة للوحة التحكم
        dashboard: {
          'card-bg-light': '#ffffff',
          'card-bg-dark': '#1f2937',
          'chart-primary': '#8b5cf6',
          'chart-secondary': '#f59e0b',
          'chart-tertiary': '#10b981',
          'gradient-start': '#58419C',
          'gradient-end': '#8b5cf6',
        },
        
        // نظام التباين المحسن للوصول
        accessible: {
          'text-light': '#374151',    // gray-700
          'text-dark': '#f3f4f6',     // gray-100
          'secondary-light': '#6b7280', // gray-500
          'secondary-dark': '#d1d5db',  // gray-300
        },

        // ✅ ألوان ديناميكية (لـ Accent Color)
        dynamic: {
          primary: 'var(--primary-color, #8B7ABA)',
          'primary-rgb': 'var(--primary-color-rgb, 139, 122, 186)',
          accent: 'var(--accent-color, #EE9C6C)',
          'accent-rgb': 'var(--accent-color-rgb, 238, 156, 108)',
          success: 'var(--success-color, #34D19C)',
          'success-rgb': 'var(--success-color-rgb, 52, 209, 156)',
          secondary: 'var(--secondary-color, #F08FAE)',
          'secondary-rgb': 'var(--secondary-color-rgb, 240, 143, 174)',
        },
      },
      
      // ============================================
      // ✅ نظام التباعد الموحد
      // ============================================
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1': '0.25rem',      // 4px
        '1.5': '0.375rem',   // 6px
        '2': '0.5rem',       // 8px
        '2.5': '0.625rem',   // 10px
        '3': '0.75rem',      // 12px
        '3.5': '0.875rem',   // 14px
        '4': '1rem',         // 16px
        '5': '1.25rem',      // 20px
        '6': '1.5rem',       // 24px
        '7': '1.75rem',      // 28px
        '8': '2rem',         // 32px
        '9': '2.25rem',      // 36px
        '10': '2.5rem',      // 40px
        '11': '2.75rem',     // 44px
        '12': '3rem',        // 48px
        '14': '3.5rem',      // 56px
        '16': '4rem',        // 64px
        '18': '4.5rem',      // 72px
        '20': '5rem',        // 80px
        '22': '5.5rem',      // 88px
        '24': '6rem',        // 96px
        '26': '6.5rem',      // 104px
        '28': '7rem',        // 112px
        '30': '7.5rem',      // 120px
        '32': '8rem',        // 128px
        '36': '9rem',        // 144px
        '40': '10rem',       // 160px
        '44': '11rem',       // 176px
        '48': '12rem',       // 192px
        '52': '13rem',       // 208px
        '56': '14rem',       // 224px
        '60': '15rem',       // 240px
        '64': '16rem',       // 256px
        '72': '18rem',       // 288px
        '80': '20rem',       // 320px
        '88': '22rem',       // 352px
        '96': '24rem',       // 384px
        '100': '25rem',      // 400px
        '112': '28rem',      // 448px
        '128': '32rem',      // 512px
      },
      
      // ============================================
      // ✅ نظام أحجام الخطوط الموحد
      // ============================================
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],     // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],           // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],       // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],          // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],       // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],           // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],      // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],        // 36px
        '5xl': ['3rem', { lineHeight: '1' }],                // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],             // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],              // 72px
        '8xl': ['6rem', { lineHeight: '1' }],                // 96px
        '9xl': ['8rem', { lineHeight: '1' }],                // 128px
      },
      
      // ============================================
      // ✅ نظام lineHeight موحد
      // ============================================
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      
      // ============================================
      // ✅ نظام أحجام الأيقونات
      // ============================================
      iconSize: {
        'xs': '0.75rem',    // 12px
        'sm': '1rem',       // 16px
        'md': '1.25rem',    // 20px
        'lg': '1.5rem',     // 24px
        'xl': '2rem',       // 32px
        '2xl': '2.5rem',    // 40px
      },
      
      // ============================================
      // ✅ الظلال
      // ============================================
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 20px 60px -15px rgba(0, 0, 0, 0.1)',
        'inner-lg': 'inset 0 2px 20px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 25px -5px rgba(88, 65, 156, 0.4)',
        'glow-lg': '0 0 40px -8px rgba(88, 65, 156, 0.5)',
        'glow-primary': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-orange': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        
        // ✅ ظلال ديناميكية (لـ Accent Color)
        'dynamic-primary': '0 0 25px -5px rgba(var(--primary-color-rgb, 139, 122, 186), 0.4)',
        'dynamic-primary-lg': '0 0 40px -8px rgba(var(--primary-color-rgb, 139, 122, 186), 0.5)',
        'dynamic-primary-sm': '0 0 15px -3px rgba(var(--primary-color-rgb, 139, 122, 186), 0.3)',
        'dynamic-accent': '0 0 25px -5px rgba(var(--accent-color-rgb, 238, 156, 108), 0.4)',
        'dynamic-success': '0 0 25px -5px rgba(var(--success-color-rgb, 52, 209, 156), 0.4)',
      },
      
      // ============================================
      // ✅ خلفيات متدرجة
      // ============================================
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #58419C 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FFA726 0%, #f59e0b 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-card-dark': 'linear-gradient(145deg, #171717 0%, #262626 90%)',
        'gradient-sidebar': 'linear-gradient(180deg, #58419C 0%, #4c1d95 100%)',
        'gradient-popup': 'linear-gradient(135deg, #58419C 0%, #8b5cf6 50%, #c4b5fd 100%)',
        'gradient-calendar': 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
        'gradient-calendar-dark': 'linear-gradient(145deg, #171717 0%, #262626 90%)',
        
        // ✅ تدرج ديناميكي (لـ Accent Color)
        'gradient-dynamic-primary': 'linear-gradient(135deg, var(--primary-color, #8B7ABA), var(--primary-color, #8B7ABA)dd)',
        'gradient-dynamic-secondary': 'linear-gradient(135deg, var(--primary-color, #8B7ABA), var(--secondary-color, #F08FAE))',
        'gradient-dynamic-accent': 'linear-gradient(135deg, var(--accent-color, #EE9C6C), var(--accent-color, #EE9C6C)dd)',
        'gradient-dynamic-success': 'linear-gradient(135deg, var(--success-color, #34D19C), var(--success-color, #34D19C)dd)',
      },
      
      // ============================================
      // ✅ خلفيات ديناميكية
      // ============================================
      backgroundColor: {
        'dynamic-primary': 'var(--primary-color, #8B7ABA)',
        'dynamic-primary-10': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.1)',
        'dynamic-primary-20': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.2)',
        'dynamic-primary-30': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.3)',
        'dynamic-primary-40': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.4)',
        'dynamic-primary-50': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.5)',
        'dynamic-accent': 'var(--accent-color, #EE9C6C)',
        'dynamic-accent-10': 'rgba(var(--accent-color-rgb, 238, 156, 108), 0.1)',
        'dynamic-success': 'var(--success-color, #34D19C)',
        'dynamic-success-10': 'rgba(var(--success-color-rgb, 52, 209, 156), 0.1)',
        'dynamic-secondary': 'var(--secondary-color, #F08FAE)',
        'dynamic-secondary-10': 'rgba(var(--secondary-color-rgb, 240, 143, 174), 0.1)',
      },
      
      // ============================================
      // ✅ حدود ديناميكية
      // ============================================
      borderColor: {
        'dynamic-primary': 'var(--primary-color, #8B7ABA)',
        'dynamic-primary-20': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.2)',
        'dynamic-primary-30': 'rgba(var(--primary-color-rgb, 139, 122, 186), 0.3)',
        'dynamic-accent': 'var(--accent-color, #EE9C6C)',
        'dynamic-success': 'var(--success-color, #34D19C)',
        'dynamic-secondary': 'var(--secondary-color, #F08FAE)',
      },
      
      // ============================================
      // ✅ حلقات ديناميكية
      // ============================================
      ringColor: {
        'dynamic-primary': 'var(--primary-color, #8B7ABA)',
        'dynamic-accent': 'var(--accent-color, #EE9C6C)',
        'dynamic-success': 'var(--success-color, #34D19C)',
      },
      
      // ============================================
      // ✅ ألوان النصوص الديناميكية
      // ============================================
      textColor: {
        'dynamic-primary': 'var(--primary-color, #8B7ABA)',
        'dynamic-accent': 'var(--accent-color, #EE9C6C)',
        'dynamic-success': 'var(--success-color, #34D19C)',
        'dynamic-secondary': 'var(--secondary-color, #F08FAE)',
      },
      
      // ============================================
      // ✅ الرسوم المتحركة
      // ============================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'blur-in': 'blurIn 0.3s ease-out',
        'pop-in': 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // ============================================
      // ✅ Keyframes
      // ============================================
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(88, 65, 156, 0.3)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(88, 65, 156, 0.5)'
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(88, 65, 156, 0.7)'
          },
          '70%': { 
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgba(88, 65, 156, 0)'
          },
        },
        shimmer: {
          '0%': { 
            backgroundPosition: '-500px 0',
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
          },
          '100%': { 
            backgroundPosition: '500px 0',
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
          },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blurIn: {
          '0%': { filter: 'blur(10px)', opacity: '0' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // ============================================
      // ✅ تأثيرات الخلفية
      // ============================================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      
      // ============================================
      // ✅ استدارة الزوايا
      // ============================================
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        'full': '9999px',
      },
      
      // ============================================
      // ✅ مدة الانتقال
      // ============================================
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
        '1200': '1200ms',
        '1500': '1500ms',
      },
      
      // ============================================
      // ✅ دالة الانتقال
      // ============================================
      transitionTimingFunction: {
        'linear': 'linear',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // ============================================
      // ✅ عرض الحدود
      // ============================================
      borderWidth: {
        '0': '0px',
        '1': '1px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px',
        '7': '7px',
        '8': '8px',
      },
      
      // ============================================
      // ✅ سطوع الخلفية
      // ============================================
      backdropBrightness: {
        '90': '.9',
        '110': '1.1',
      },
      
      // ============================================
      // ✅ نظام gaps الموحد
      // ============================================
      gap: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
      },
    },
  },
  
  plugins: [
    function({ addUtilities, theme }) {
      // ============================================
      // ✅ نظام الأيقونات الموحد
      // ============================================
      const iconUtilities = {
        '.icon-xs': {
          width: theme('iconSize.xs'),
          height: theme('iconSize.xs'),
        },
        '.icon-sm': {
          width: theme('iconSize.sm'),
          height: theme('iconSize.sm'),
        },
        '.icon-md': {
          width: theme('iconSize.md'),
          height: theme('iconSize.md'),
        },
        '.icon-lg': {
          width: theme('iconSize.lg'),
          height: theme('iconSize.lg'),
        },
        '.icon-xl': {
          width: theme('iconSize.xl'),
          height: theme('iconSize.xl'),
        },
        '.icon-2xl': {
          width: theme('iconSize.2xl'),
          height: theme('iconSize.2xl'),
        },
      };
      
      addUtilities(iconUtilities);
      
      // ============================================
      // ✅ نظام scrollbar محسن
      // ============================================
      const scrollbarUtilities = {
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(88, 65, 156, 0.3)',
            borderRadius: '3px',
            transition: 'background 0.2s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(88, 65, 156, 0.5)',
          },
        },
        '.scrollbar-dark': {
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(139, 92, 246, 0.3)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(139, 92, 246, 0.5)',
          },
        },
        '.scrollbar-sm': {
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
        },
        '.scrollbar-lg': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
        },
      };
      
      addUtilities(scrollbarUtilities, ['responsive', 'hover']);
      
      // ============================================
      // ✅ دعم RTL للغة العربية
      // ============================================
      const rtlUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
      };
      
      addUtilities(rtlUtilities);
    },
  ],
};