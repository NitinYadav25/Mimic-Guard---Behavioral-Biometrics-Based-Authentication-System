export function TrustBanner({ trustLevel, remainingTime, formattedTime }) {
    if (trustLevel === 'HIGH') return null;

    return (
        <div className={`
      w-full px-6 py-4 rounded-xl border-2 mb-6
      flex items-center justify-between gap-4
      ${trustLevel === 'MEDIUM'
                ? 'bg-yellow-900/30 border-yellow-500'
                : 'bg-red-900/30 border-red-500'
            }
    `}>
            <div className="flex items-center gap-3">
                <span className="text-3xl">
                    {trustLevel === 'MEDIUM' ? '⚠️' : '🔒'}
                </span>
                <div>
                    <h3 className={`font-bold text-lg ${trustLevel === 'MEDIUM' ? 'text-yellow-300' : 'text-red-300'}`}>
                        {trustLevel === 'MEDIUM' ? 'Limited Access Mode' : 'View-Only Mode'}
                    </h3>
                    <p className="text-sm text-slate-300">
                        {trustLevel === 'MEDIUM'
                            ? 'Biometric verification failed. Some features are restricted.'
                            : 'Additional verification required for full access.'
                        }
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {trustLevel !== 'HIGH' && (
                    <div className={`
            px-4 py-2 rounded-lg border-2 font-mono font-bold
            ${remainingTime < 60
                            ? 'bg-red-900/50 border-red-500 text-red-300 animate-timer-pulse'
                            : 'bg-slate-800 border-slate-600 text-slate-300'
                        }
          `}>
                        ⏱️ {formattedTime}
                    </div>
                )}
                <button className="
          px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 
          text-white rounded-lg font-semibold
          hover:from-cyan-600 hover:to-blue-700
          transition-all duration-200
        ">
                    Verify Biometrics
                </button>
            </div>
        </div>
    );
}
