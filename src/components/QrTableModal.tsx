import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode as QrIcon, Copy, Check, Table2 } from 'lucide-react';
import { Language } from '../types';
import { I18N_DICT } from '../data/i18n';

interface QrTableModalProps {
  isOpen: boolean;
  restaurantName: string;
  currentLang: Language;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const QrTableModal: React.FC<QrTableModalProps> = ({
  isOpen,
  restaurantName,
  currentLang,
  onClose,
  onShowToast,
}) => {
  const t = (key: string) => I18N_DICT[currentLang]?.[key] || key;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tableNum, setTableNum] = useState<number>(4);
  const [copied, setCopied] = useState(false);

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?table=${tableNum}&lang=${currentLang}`
    : `https://nutrimenu.fr?table=${tableNum}`;

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: 200,
        margin: 1.5,
        color: {
          dark: '#231d19',
          light: '#ffffff',
        },
      });
    }
  }, [isOpen, qrUrl, tableNum]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    onShowToast(t('qrLinkCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-300 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
          <QrIcon className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            {t('qrModalTitle')}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {restaurantName} • {t('qrModalDesc')}
          </p>
        </div>

        {/* Table selector */}
        <div className="flex items-center justify-center gap-2 bg-stone-50 p-2 rounded-2xl border border-stone-200 text-xs">
          <Table2 className="w-4 h-4 text-stone-500" />
          <span className="font-semibold text-stone-700">{t('qrTableNumber')} :</span>
          <select
            value={tableNum}
            onChange={(e) => setTableNum(Number(e.target.value))}
            className="bg-white border border-stone-300 rounded-xl px-2.5 py-1 font-bold text-stone-900 focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 20].map((n) => (
              <option key={n} value={n}>
                Table n° {n}
              </option>
            ))}
          </select>
        </div>

        {/* Canvas QR */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex justify-center shadow-inner">
          <canvas ref={canvasRef} className="rounded-xl shadow-xs" />
        </div>

        {/* Copy button */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-stone-600" />
            )}
            <span>{t('qrCopyLink')}</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#99281a] hover:bg-[#781524] text-white font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
