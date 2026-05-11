export function TOTPVerification({ otp, setOtp, onVerify, isVerifying }) {
    const handleChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 6) setOtp(value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && otp.length === 6) onVerify();
    };

    return (
        <div className="my-8 p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-cyan-500/30 text-center animate-otp-slide">
            {/* Icon */}
            <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-cyan-pulse">
                    <span className="text-3xl">📱</span>
                </div>
            </div>

            <h3 className="text-cyan-400 text-2xl font-semibold mb-2">Two-Factor Authentication</h3>
            <p className="text-slate-300 text-sm mb-6">
                Open <span className="text-cyan-400 font-semibold">Google Authenticator</span> and enter the 6-digit code for BehaviorAuth.
            </p>

            {/* Code Input */}
            <div className="my-5">
                <label className="block mb-3 text-slate-300 font-semibold text-base">Authenticator Code</label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                    className="
                        w-full max-w-[250px] mx-auto px-5 py-4 text-3xl text-center
                        tracking-[12px] font-mono font-bold border-2
                        rounded-xl bg-slate-900/70 text-cyan-400
                        border-cyan-500
                        transition-all duration-300
                        focus:outline-none focus:border-cyan-400
                        hover:border-cyan-400
                    "
                />
            </div>

            <p className="text-slate-500 text-xs mb-6">⏱️ Code rotates every 30 seconds</p>

            {/* Verify Button */}
            <button
                onClick={onVerify}
                disabled={otp.length !== 6 || isVerifying}
                className="
                    w-full max-w-[300px] mx-auto px-6 py-3
                    bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                    rounded-xl text-base font-semibold cursor-pointer
                    transition-all duration-200 border-none
                    hover:shadow-lg hover:-translate-y-0.5 hover:from-cyan-600 hover:to-blue-700
                    active:translate-y-0
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    relative overflow-hidden flex items-center justify-center gap-2
                "
            >
                {isVerifying ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spinner" />
                        <span>Verifying...</span>
                    </>
                ) : (
                    '🔓 Verify Code'
                )}
            </button>
        </div>
    );
}
