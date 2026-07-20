import { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { CheckCircle, X, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 space-y-2">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; color: string; border: string; bg: string }> = {
    success: {
        icon: CheckCircle,
        color: 'text-emerald-500',
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/5',
    },
    error: {
        icon: X,
        color: 'text-red-500',
        border: 'border-red-500/20',
        bg: 'bg-red-500/5',
    },
    info: {
        icon: Info,
        color: 'text-primary',
        border: 'border-primary/20',
        bg: 'bg-primary/5',
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/5',
    },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${config.border} ${config.bg} backdrop-blur-xl bg-background/80 px-4 py-3 shadow-lg shadow-black/5 animate-in fade-in-up duration-300`}
        >
            <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${config.color}`} />
            <span className="text-sm font-medium text-foreground">{toast.message}</span>
            <button
                onClick={onDismiss}
                className="ml-2 flex-shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
