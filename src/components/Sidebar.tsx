
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Wand2, History, Crown, Trophy } from 'lucide-react';

interface SidebarProps {
  view: 'generate' | 'gallery';
  setView: (view: 'generate' | 'gallery') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-56 border-r border-muji-line bg-muji-paper hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="h-24 flex flex-col justify-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-muji-ink rounded-full"></div>
            <span className="font-serif text-xl tracking-muji text-muji-ink uppercase">MURO</span>
          </div>
          <p className="mt-1 text-[8px] text-muji-gray tracking-muji uppercase font-light">Minimalist Utility</p>
        </div>
        
        <nav className="px-4 py-6 flex-1 space-y-2">
          <button 
            onClick={() => setView('generate')} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-300 ${view === 'generate' ? 'text-muji-ink font-medium' : 'text-muji-gray hover:text-muji-ink'}`}
          >
            <Wand2 size={16} strokeWidth={1.5} />
            <span className="text-[11px] tracking-muji uppercase">設計工作台</span>
          </button>
          <button 
            onClick={() => setView('gallery')} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-300 ${view === 'gallery' ? 'text-muji-ink font-medium' : 'text-muji-gray hover:text-muji-ink'}`}
          >
            <History size={16} strokeWidth={1.5} />
            <span className="text-[11px] tracking-muji uppercase">作品集</span>
          </button>
        </nav>

        <div className="p-6 border-t border-muji-line space-y-3">
          <div className="flex items-center gap-2 text-[9px] text-muji-accent uppercase tracking-muji font-medium">
            <Crown size={10} />
            <span>Pro Mode</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-muji-paper border-t border-muji-line z-50 flex justify-around items-center h-16 px-6">
        <button 
          onClick={() => setView('generate')} 
          className={`flex flex-col items-center gap-1 ${view === 'generate' ? 'text-muji-ink' : 'text-muji-gray'}`}
        >
          <Wand2 size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-muji uppercase">工作台</span>
        </button>
        <button 
          onClick={() => setView('gallery')} 
          className={`flex flex-col items-center gap-1 ${view === 'gallery' ? 'text-muji-ink' : 'text-muji-gray'}`}
        >
          <History size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-muji uppercase">作品集</span>
        </button>
      </nav>
    </>
  );
};
