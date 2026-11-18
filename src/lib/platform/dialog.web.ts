// Browser: Alert aus React Native zeigt im Web nichts an, daher die Browser-Dialoge.

export function confirm(opts: {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  if (window.confirm(`${opts.title}\n\n${opts.message}`)) opts.onConfirm();
}

export function notify(title: string, message: string) {
  window.alert(`${title}\n\n${message}`);
}

export function success() {
  try {
    navigator.vibrate?.(30);
  } catch {
    // nicht überall verfügbar
  }
}
