/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'oklch(0.656 0.241 354.308)',
            },
            animation: {
                // Page load animations
                'slide-in': 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-in': 'fadeIn 0.3s ease-in',
                'gradient-shift': 'gradientShift 8s ease infinite',

                // Input & interaction animations
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'border-glow': 'borderGlow 0.3s ease',
                'label-float': 'labelFloat 0.2s ease',

                // Button animations
                'button-lift': 'buttonLift 0.2s ease',
                'ripple': 'ripple 0.6s ease-out',
                'spinner': 'spin 0.8s linear infinite',

                // Feedback animations
                'shake': 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
                'success-pop': 'successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'progress-fill': 'progressFill 1s ease-out forwards',

                // OTP animations
                'otp-slide': 'otpSlide 0.3s ease-out',
                'timer-pulse': 'timerPulse 1s ease-in-out infinite',
                'check-mark': 'checkMark 0.5s ease-out forwards',

                // Biometric indicators
                'dot-pulse': 'dotPulse 1.5s ease-in-out infinite',
                'success-glow': 'successGlow 0.6s ease-out',
                'error-glow': 'errorGlow 0.6s ease-out',

                // Blue glow effects for dark theme
                'blue-glow': 'blueGlow 2s ease-in-out infinite',
                'cyan-pulse': 'cyanPulse 1.5s ease-in-out infinite',
            },
            keyframes: {
                // Page load
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },

                // Input animations
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.4)' },
                    '50%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.4)' },
                },
                borderGlow: {
                    '0%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
                    '100%': { boxShadow: '0 0 0 4px rgba(6, 182, 212, 0.2), 0 0 15px rgba(6, 182, 212, 0.3)' },
                },
                labelFloat: {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-24px) scale(0.85)' },
                },

                // Button animations
                buttonLift: {
                    '0%': { transform: 'translateY(0)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' },
                    '100%': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.5)' },
                },
                ripple: {
                    '0%': { transform: 'scale(0)', opacity: '0.5' },
                    '100%': { transform: 'scale(4)', opacity: '0' },
                },

                // Feedback animations
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
                },
                successPop: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                progressFill: {
                    '0%': { width: '0%' },
                    '100%': { width: 'var(--progress-width)' },
                },

                // OTP animations
                otpSlide: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                timerPulse: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.05)', opacity: '0.9' },
                },
                checkMark: {
                    '0%': { strokeDashoffset: '100' },
                    '100%': { strokeDashoffset: '0' },
                },

                // Biometric indicators
                dotPulse: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
                    '50%': { transform: 'scale(1.3)', opacity: '1' },
                },
                successGlow: {
                    '0%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0)' },
                    '50%': { boxShadow: '0 0 20px 10px rgba(6, 182, 212, 0.6)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0)' },
                },
                errorGlow: {
                    '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
                    '50%': { boxShadow: '0 0 20px 10px rgba(239, 68, 68, 0.4)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
                },

                // Blue glow effects
                blueGlow: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' },
                    '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)' },
                },
                cyanPulse: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)', transform: 'scale(1)' },
                    '50%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.9)', transform: 'scale(1.05)' },
                },
            },
            backgroundSize: {
                '200%': '200% 200%',
            },
        },
    },
    plugins: [],
}
