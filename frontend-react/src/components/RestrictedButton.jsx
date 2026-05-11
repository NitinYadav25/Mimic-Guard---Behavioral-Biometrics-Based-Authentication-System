export function RestrictedButton({
    children,
    requiredTrust = 'HIGH',
    currentTrust,
    onClick,
    className = '',
    tooltip = 'Biometric verification required',
    ...props
}) {
    const trustLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
    const isRestricted = trustLevels[currentTrust] < trustLevels[requiredTrust];

    if (isRestricted) {
        return (
            <div className="relative group inline-block">
                <button
                    disabled
                    className={`
            px-6 py-3 rounded-xl font-semibold
            bg-slate-700 text-slate-500 border-2 border-slate-600
            cursor-not-allowed opacity-50
            flex items-center gap-2
            ${className}
          `}
                    {...props}
                >
                    {children}
                    <span className="text-xl">🔒</span>
                </button>

                {/* Tooltip */}
                <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-4 py-2 bg-slate-900 text-cyan-400 text-sm rounded-lg
          border border-cyan-500/30
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none whitespace-nowrap
        ">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`
        px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 
        text-white rounded-xl font-semibold
        hover:from-cyan-600 hover:to-blue-700
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-lg
        active:translate-y-0
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}
