// frontend/src/components/ToastContainer.jsx
import { useToast } from '../contexts/ToastContext';

function Toast({ t, onClose }) {
    const palette = t.type === 'success'
        ? 'border-green-300 bg-green-50 text-green-900'
        : t.type === 'error'
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-blue-300 bg-blue-50 text-blue-900';

    return (
        <div
            className={`pointer-events-auto w-80 rounded-xl border shadow-lg p-3 mb-3 ${palette} animate-slide-in`}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-start gap-2">
                <div className="mt-0.5">
                    {t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}
                </div>
                <div className="flex-1">
                    {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
                    <div className="text-sm leading-snug">{t.message}</div>
                </div>
                <button
                    onClick={() => onClose(t.id)}
                    className="ml-2 text-xs opacity-70 hover:opacity-100"
                    aria-label="Fechar notificação"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts, dismiss } = useToast();
    if (!toasts.length) return null;
    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
            {toasts.map(t => <Toast key={t.id} t={t} onClose={dismiss} />)}
        </div>
    );
}
