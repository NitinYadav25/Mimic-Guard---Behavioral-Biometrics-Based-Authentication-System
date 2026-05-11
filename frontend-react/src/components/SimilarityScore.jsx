export function SimilarityScore({ similarity }) {
    if (!similarity) return null;

    const isSuccess = similarity.overall >= 70;

    return (
        <div className="my-6 p-5 bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-cyan-500/30 animate-slide-in">
            <h3 className="text-cyan-400 text-base font-semibold mb-4 text-center">🎯 Authentication Score</h3>
            <div className="grid grid-cols-2 gap-4">
                {/* Typing Score */}
                <div className="flex flex-col gap-1 p-3 bg-slate-900/70 rounded-lg transform transition-transform hover:scale-105 border border-slate-700">
                    <span className="text-slate-300 text-sm font-medium">Typing Match:</span>
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                        <div
                            className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-progress-fill"
                            style={{ '--progress-width': `${similarity.typing}%` }}
                        />
                    </div>
                    <span className="text-cyan-400 text-2xl font-bold mt-1">{similarity.typing}%</span>
                </div>

                {/* Mouse Score */}
                <div className="flex flex-col gap-1 p-3 bg-slate-900/70 rounded-lg transform transition-transform hover:scale-105 border border-slate-700">
                    <span className="text-slate-300 text-sm font-medium">Mouse Match:</span>
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                        <div
                            className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-progress-fill"
                            style={{ '--progress-width': `${similarity.mouse}%` }}
                        />
                    </div>
                    <span className="text-cyan-400 text-2xl font-bold mt-1">{similarity.mouse}%</span>
                </div>

                {/* Device Score */}
                <div className="flex flex-col gap-1 p-3 bg-slate-900/70 rounded-lg transform transition-transform hover:scale-105 border border-slate-700">
                    <span className="text-slate-300 text-sm font-medium">Device Match:</span>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-3 h-3 rounded-full ${similarity.fingerprint === 100 ? 'bg-cyan-500 animate-dot-pulse' : 'bg-red-500'}`} />
                        <span className={`text-2xl font-bold ${similarity.fingerprint === 100 ? 'text-cyan-400' : 'text-red-400'}`}>
                            {similarity.fingerprint}%
                        </span>
                    </div>
                </div>

                {/* Overall Score */}
                <div className={`
          flex flex-col gap-1 p-3 rounded-lg col-span-2 border-2
          ${isSuccess
                        ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-500 animate-success-glow'
                        : 'bg-gradient-to-r from-red-900/50 to-red-800/50 border-red-500 animate-error-glow'
                    }
        `}>
                    <span className="text-slate-200 text-base font-medium">Overall Score:</span>
                    <div className="flex items-center justify-center gap-3">
                        {isSuccess && <span className="text-4xl">✓</span>}
                        {!isSuccess && <span className="text-4xl">✗</span>}
                        <span className={`text-4xl font-bold ${isSuccess ? 'text-cyan-300' : 'text-red-300'}`}>{similarity.overall}%</span>
                    </div>
                    <span className={`text-center text-sm mt-1 ${isSuccess ? 'text-cyan-200' : 'text-red-200'}`}>
                        {isSuccess ? '🔓 Access Granted' : '🔒 Access Denied'}
                    </span>
                </div>
            </div>
        </div>
    );
}
