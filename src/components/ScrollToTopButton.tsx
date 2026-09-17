import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 280px
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      id="scroll-to-top-btn"
      type="button"
      onClick={scrollToTop}
      aria-label="Remonter en haut de page"
      title="Remonter en haut de page"
      className={`fixed z-50 right-4 sm:right-6 bottom-20 sm:bottom-8 p-3 sm:p-3.5 rounded-full bg-[#781524] hover:bg-[#99281a] text-white shadow-xl border-2 border-amber-400/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group touch-manipulation ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto shadow-[0_10px_25px_rgba(120,21,36,0.45)]'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 group-hover:-translate-y-1 transition-transform" />
    </button>
  );
};
