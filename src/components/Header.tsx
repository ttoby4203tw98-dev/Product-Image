
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Zap, ChevronRight, KeyRound } from 'lucide-react';

interface HeaderProps {
  children?: React.ReactNode;
  onKeyClick?: () => void;
  isKeySet?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ children, onKeyClick, isKeySet }) => {
  return (
    <header className="flex items-center justify-between py-2 border-b border-muji-line mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-serif font-bold tracking-[0.3em] text-muji-ink uppercase">
          MURO
        </h1>
        {onKeyClick && (
          <button 
            onClick={onKeyClick}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-muji-line text-muji-gray hover:text-muji-ink hover:border-muji-ink transition-all text-[10px] uppercase tracking-muji font-medium bg-white/50 backdrop-blur-sm group"
            title="更換 API 金鑰"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isKeySet ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
            <KeyRound size={12} className="group-hover:rotate-12 transition-transform" />
            <span>{isKeySet ? '金鑰已就緒' : '金鑰設定 (選填)'}</span>
          </button>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </header>
  );
};
