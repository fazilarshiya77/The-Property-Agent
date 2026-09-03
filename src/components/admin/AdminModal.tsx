import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AdminModal({ title, onClose, children, footer }: AdminModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-neutral-100 w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <h3 className="text-base font-display font-bold text-navy-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
