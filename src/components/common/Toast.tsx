import { useToastStore } from '../../stores/useToastStore';

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[9999]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-2 rounded-md shadow-lg text-xs font-medium animate-fade-in"
          style={{
            background: toast.type === 'success' ? 'var(--color-accent)' : toast.type === 'error' ? '#ef4444' : 'var(--color-bg-secondary)',
            color: toast.type === 'success' || toast.type === 'error' ? 'white' : 'var(--color-text-primary)',
          }}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}