
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { Package } from 'lucide-react';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border border-zinc-200 flex items-center justify-center rounded-sm">
          <Package size={32} className="text-muji-ink" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-[0.4em] text-zinc-800">MURO AI</h1>
          <p className="text-xs text-zinc-400 mt-2 tracking-[0.2em] uppercase">Pro Studio Edition</p>
        </div>
      </div>
    </div>
  );
};
