import { forwardRef, useState } from 'react';

export const Input = forwardRef(({
    type = 'text',
    label,
    error,
    onMouseEnter,
    onMouseLeave,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="mb-6 relative">
            {label && (
                <label className={`
          block mb-2 text-slate-300 font-semibold transition-all duration-200
          ${isFocused ? 'text-cyan-400' : ''}
        `}>
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    ref={ref}
                    type={inputType}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            w-full px-4 py-3 border-2 rounded-xl text-base
            transition-all duration-300
            bg-slate-800/50 text-slate-100 placeholder-slate-500
            focus:outline-none focus:bg-slate-800
            ${error
                            ? 'border-red-500 animate-shake'
                            : isFocused
                                ? 'border-cyan-500 animate-border-glow'
                                : 'border-slate-700'
                        }
            ${isPassword ? 'pr-12' : ''}
            hover:border-cyan-600
          `}
                    {...props}
                />
                {/* Focus ring indicator */}
                <div className={`
          absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300
          ${isFocused ? 'opacity-100' : 'opacity-0'}
        `} />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="
              absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none 
              cursor-pointer text-xl p-2 text-slate-400
              transition-all duration-200
              hover:text-cyan-400 hover:scale-110
              active:scale-95
            "
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
