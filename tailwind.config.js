/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#DBEAFE',
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        panel: {
          dark: '#1E293B',
          light: '#F1F5F9',
        },
      },
      // ================================================================
      // 呼吸灯动画 — Tailwind 工具类注册
      // 配合 tailwindcss-animate 插件，可直接使用：
      //   animate-breathe-saved / animate-breathe-saving / animate-breathe-error
      // ================================================================
      keyframes: {
        'breathe-saved': {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(0.85)',
            boxShadow: '0 0 2px rgba(34, 197, 94, 0.15), 0 0 4px rgba(34, 197, 94, 0.05)',
          },
          '40%, 50%': {
            opacity: '1',
            transform: 'scale(1.18)',
            boxShadow: '0 0 4px rgba(34, 197, 94, 0.45), 0 0 12px rgba(34, 197, 94, 0.2)',
          },
          '90%': {
            opacity: '0.4',
            transform: 'scale(0.85)',
            boxShadow: '0 0 2px rgba(34, 197, 94, 0.15), 0 0 4px rgba(34, 197, 94, 0.05)',
          },
        },
        'breathe-saving': {
          '0%, 100%': {
            opacity: '0.35',
            transform: 'scale(0.8)',
            boxShadow: '0 0 3px rgba(59, 130, 246, 0.25), 0 0 6px rgba(59, 130, 246, 0.08)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)',
            boxShadow: '0 0 6px rgba(59, 130, 246, 0.55), 0 0 16px rgba(59, 130, 246, 0.25)',
          },
        },
        'breathe-error': {
          '0%, 100%': {
            opacity: '0.35',
            transform: 'scale(0.8)',
            boxShadow: '0 0 3px rgba(239, 68, 68, 0.25), 0 0 6px rgba(239, 68, 68, 0.08)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)',
            boxShadow: '0 0 6px rgba(239, 68, 68, 0.55), 0 0 16px rgba(239, 68, 68, 0.25)',
          },
        },
        'pulse-confirm': {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.6)',
          },
          '50%': {
            transform: 'scale(1.5)',
            boxShadow: '0 0 0 6px rgba(34, 197, 94, 0)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)',
          },
        },
      },
      animation: {
        'breathe-saved': 'breathe-saved 4s ease-in-out infinite',
        'breathe-saving': 'breathe-saving 1.2s ease-in-out infinite',
        'breathe-error': 'breathe-error 1s ease-in-out infinite',
        'pulse-confirm': 'pulse-confirm 0.6s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
