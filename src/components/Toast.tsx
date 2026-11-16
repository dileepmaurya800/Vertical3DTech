import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '../store/store';

export const Toast: React.FC = () => {
  const toastMessage = useAppSelector((state) => state.cart.toastMessage);

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/95 text-slate-100 border border-brand-500/50 shadow-glass text-xs font-semibold backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
