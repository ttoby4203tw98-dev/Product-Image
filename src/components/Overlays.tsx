
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Download, X, Package } from 'lucide-react';
import { Button } from './Button';
import { GeneratedMockup } from '../types';

interface ImageZoomProps {
  zoomedImage: {url: string, title: string};
  setZoomedImage: (img: null) => void;
  productTitle: string;
  downloadImage: (url: string, filename: string) => void;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({ zoomedImage, setZoomedImage, productTitle, downloadImage }) => {
  return (
    <div className="fixed inset-0 z-[120] bg-muji-ink/95 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-16 animate-fade-in">
      <div className="absolute top-8 right-8 flex items-center gap-4 z-[130]">
        <button 
          onClick={() => downloadImage(zoomedImage.url, `${productTitle}-${zoomedImage.title}`)}
          className="flex items-center gap-3 px-10 py-4 bg-muji-accent text-white hover:bg-muji-accent/90 rounded-sm transition-all text-xs tracking-muji font-bold shadow-2xl uppercase"
        >
          <Download size={18} /> 下載 JPG 檔案
        </button>
        <button 
          onClick={() => setZoomedImage(null)}
          className="p-4 bg-white/10 hover:bg-white/20 text-muji-paper rounded-sm transition-all border border-white/20 shadow-2xl"
        >
          <X size={28} />
        </button>
      </div>
      
      <div className="relative group max-w-5xl w-full flex flex-col items-center">
        <div className="relative group/img">
          <img 
            src={zoomedImage.url} 
            className="max-h-[70vh] max-w-full object-contain shadow-2xl animate-fade-in border border-white/5" 
            alt={zoomedImage.title}
          />
        </div>
      </div>
      
      <div className="mt-10 text-center space-y-4">
        <h4 className="text-muji-paper font-serif font-light tracking-muji text-2xl uppercase">{productTitle}</h4>
        <p className="text-muji-paper/40 text-[10px] tracking-muji uppercase">{zoomedImage.title} • MURO 800px Optimized</p>
        <div className="pt-4">
          <button 
            onClick={() => downloadImage(zoomedImage.url, `${productTitle}-${zoomedImage.title}`)}
            className="flex items-center gap-3 px-12 py-5 bg-muji-accent text-white hover:bg-muji-accent/90 rounded-sm transition-all text-sm tracking-muji font-bold shadow-2xl uppercase mx-auto"
          >
            <Download size={20} /> 立即下載 JPG 圖片
          </button>
        </div>
      </div>
    </div>
  );
};

interface MockupPreviewProps {
  selectedMockup: GeneratedMockup;
  setSelectedMockup: (mockup: null) => void;
  downloadImage: (url: string, filename: string) => void;
}

export const MockupPreview: React.FC<MockupPreviewProps> = ({ selectedMockup, setSelectedMockup, downloadImage }) => {
  const handleDownloadAll = () => {
    selectedMockup.allImages?.forEach((img, i) => {
      setTimeout(() => {
        downloadImage(img, `${selectedMockup.prompt}-all-${i+1}`);
      }, i * 300); // Stagger to avoid browser blocking
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-muji-bg overflow-y-auto p-8 md:p-24" onClick={() => setSelectedMockup(null)}>
      <div className="max-w-6xl mx-auto space-y-16" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-6 border-b border-muji-line pb-12 relative">
          <Package size={40} className="text-muji-accent" />
          <h3 className="text-3xl text-center font-serif font-light tracking-muji text-muji-ink uppercase">{selectedMockup.prompt}</h3>
          <p className="text-[10px] text-muji-gray uppercase tracking-muji">MURO Studio Presentation Set</p>
          
          <div className="mt-8">
            <button 
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-8 py-3 bg-muji-accent text-white hover:bg-muji-accent/90 rounded-sm transition-all text-[10px] tracking-muji font-bold uppercase shadow-lg"
            >
              <Download size={14} /> 下載全組 JPG 圖片
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {selectedMockup.allImages?.map((img, i) => (
            <div 
              key={i} 
              className="relative group border border-muji-line overflow-hidden shadow-md aspect-square bg-muji-paper"
            >
              <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={`${selectedMockup.prompt} ${i}`} />
              
              {/* Always visible download icon on mobile, hover on desktop */}
              <div className="absolute bottom-4 right-4 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => downloadImage(img, `${selectedMockup.prompt}-set-${i+1}`)}
                  className="p-3 bg-muji-accent text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                >
                  <Download size={20} />
                </button>
              </div>

              <div className="absolute inset-0 bg-muji-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-muji-paper gap-3">
                <button 
                  onClick={() => downloadImage(img, `${selectedMockup.prompt}-set-${i+1}`)}
                  className="bg-muji-accent text-white px-6 py-3 rounded-sm flex items-center gap-2 font-bold tracking-muji text-xs uppercase shadow-2xl"
                >
                  <Download size={18} /> 下載 JPG
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center pt-12">
          <Button variant="secondary" onClick={() => setSelectedMockup(null)} className="px-16 py-6 uppercase tracking-[0.4em] text-lg">關閉預覽</Button>
        </div>
      </div>
    </div>
  );
};
