
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Trash2, Crown, Star } from 'lucide-react';
import { Button } from './Button';
import { GeneratedMockup } from '../types';

interface GalleryViewProps {
  gallery: GeneratedMockup[];
  setGallery: (gallery: GeneratedMockup[] | ((prev: GeneratedMockup[]) => GeneratedMockup[])) => void;
  setSelectedMockup: (mockup: GeneratedMockup | null) => void;
  handleUpdateGalleryRating: (id: string, rating: number) => void;
  setView: (view: 'generate' | 'gallery') => void;
  addLog: (msg: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  gallery,
  setGallery,
  setSelectedMockup,
  handleUpdateGalleryRating,
  setView,
  addLog
}) => {
  return (
    <div className="animate-fade-in space-y-16">
      <header className="text-center relative py-8 border-b border-muji-line">
        <h2 className="text-4xl font-serif font-light tracking-muji text-muji-ink">設計作品集</h2>
        <p className="text-[10px] text-muji-gray mt-3 tracking-muji uppercase font-light">Pro Quality Design Collection</p>
        
        {gallery.length > 0 && (
          <button 
            onClick={() => {
              // In a real app, we'd use a custom modal. For now, we'll just clear it or add a simple toggle.
              setGallery([]);
              localStorage.removeItem('muro_gallery');
              addLog("作品集已清空。");
            }}
            className="absolute right-0 bottom-4 flex items-center gap-2 text-[10px] text-muji-gray hover:text-muji-ink transition-colors uppercase tracking-muji"
          >
            <Trash2 size={12} />
            清空
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {gallery.map(item => (
          <div key={item.id} className="muji-card bg-muji-paper shadow-md overflow-hidden group border-muji-line">
            <div className="overflow-hidden aspect-[4/3]">
              <img 
                src={item.imageUrl} 
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-1000" 
                onClick={() => setSelectedMockup(item)} 
                alt={item.prompt} 
              />
            </div>
            <div className="p-6 border-t border-muji-line flex justify-between items-center bg-muji-paper">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Crown size={12} className="text-muji-accent" />
                  <span className="text-xs text-muji-ink tracking-muji font-medium uppercase">{item.prompt}</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(star => (
                    <button 
                      key={star} 
                      onClick={() => handleUpdateGalleryRating(item.id, star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        size={12} 
                        className={star <= (item.rating || 0) ? "fill-muji-accent text-muji-accent" : "text-muji-line"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-muji-gray uppercase tracking-muji">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="py-32 text-center text-muji-gray font-light tracking-muji uppercase text-sm">
          尚未有儲存的作品。
        </div>
      )}

      <div className="flex justify-center pt-8">
        <Button onClick={() => setView('generate')} variant="secondary" className="px-16 py-6 uppercase tracking-[0.4em] text-lg">
          返回工作台
        </Button>
      </div>
    </div>
  );
};
