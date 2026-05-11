export function Message({ text, type }) {
    if (!text) return null;

    const isSuccess = type === 'success';
    const isError = type === 'error';

    return (
        <div
            className={`
        border-2 rounded-xl px-5 py-4 my-5 font-medium text-center
        ${isSuccess
                    ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500 animate-success-pop'
                    : 'bg-red-900/30 text-red-300 border-red-500 animate-shake'
                }
      `}
        >
            <div className="flex items-center justify-center gap-2">
                {isSuccess && (
                    <span className="text-2xl">✓</span>
                )}
                {isError && (
                    <span className="text-2xl">✗</span>
                )}
                <span>{text}</span>
            </div>
        </div>
    );
}
