// frontend/src/contexts/ToastContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({ show: () => { }, dismiss: () => { }, toasts: [] });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const show = useCallback((message, opts = {}) => {
        const id = Math.random().toString(36).slice(2);
        const toast = {
            id,
            title: opts.title || null,
            message,
            type: opts.type || 'info', // 'success' | 'error' | 'info'
            duration: typeof opts.duration === 'number' ? opts.duration : 4500
        };
        setToasts(prev => [...prev, toast]);
        if (toast.duration !== Infinity) {
            setTimeout(() => dismiss(id), toast.duration);
        }
        return id;
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ show, dismiss, toasts }}>
            {children}
        </ToastContext.Provider>
    );
}
