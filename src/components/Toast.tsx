import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  visible: boolean;
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white font-bold px-5 py-2.5 rounded-full shadow-2xl text-xs flex items-center gap-2 border border-[#99281a]/50 animate-bounce">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
