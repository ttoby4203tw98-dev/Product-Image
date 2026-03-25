
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { RefreshCw, AlertCircle, Star, X, GripVertical, Sparkles, Download } from 'lucide-react';
import { ImageCategory } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageProps {
  id: number;
  url: string | null;
  sectionName: string;
  indexInSection: number;
  currentlyRendering: number | null;
  generationProgress: number[];
  generationErrors: (string | null)[];
  currentRatings: number[];
  activeIndices: number[];
  loading: boolean;
  handleRateImage: (index: number, rating: number) => void;
  handleDeleteImage: (index: number) => void;
  setZoomedImage: (img: {url: string, title: string} | null) => void;
  downloadImage: (url: string, filename: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({
  id,
  url,
  sectionName,
  indexInSection,
  currentlyRendering,
  generationProgress,
  generationErrors,
  currentRatings,
  activeIndices,
  loading,
  handleRateImage,
  handleDeleteImage,
  setZoomedImage,
  downloadImage
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    downloadImage(url, `muji-ai-${sectionName}-${indexInSection + 1}`);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        onClick={() => url && setZoomedImage({url: url!, title: `${sectionName} ${indexInSection + 1}`})} 
        className={`aspect-square bg-muji-paper border border-muji-line flex items-center justify-center overflow-hidden transition-all duration-500 shadow-sm ${url ? 'cursor-zoom-in hover:shadow-md' : 'bg-muji-bg/20'}`}
      >
        {url ? (
          <img src={url!} className="w-full h-full object-cover animate-fade-in" alt={sectionName} />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
            {currentlyRendering === id && (
              <>
                <div className="absolute inset-0 animate-pulse bg-muji-bg/40" />
                <div className="absolute bottom-0 left-0 h-0.5 bg-muji-accent transition-all duration-300" style={{ width: `${generationProgress[id]}%` }} />
              </>
            )}
            <span className={`text-[9px] uppercase tracking-muji ${activeIndices.includes(id) ? 'text-muji-gray' : 'text-muji-line'}`}>
              {currentlyRendering === id ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="animate-pulse">渲染中...</span>
                  <span className="text-[14px] font-medium text-muji-ink font-mono">{generationProgress[id]}%</span>
                </div>
              ) : activeIndices.includes(id) ? (
                <div className="flex flex-col items-center gap-2 opacity-60">
                  <RefreshCw size={14} className="animate-spin mb-1 text-muji-accent" />
                </div>
              ) : generationErrors[id] ? (
                <div className="flex flex-col items-center gap-2 text-muji-ink animate-pulse group/error">
                  <AlertCircle size={24} />
                  <span className="text-[9px] uppercase tracking-muji text-center px-4 leading-relaxed">渲染失敗</span>
                  <div className="absolute inset-0 bg-muji-paper/95 flex items-center justify-center p-6 opacity-0 group-hover/error:opacity-100 transition-opacity z-10">
                    <p className="text-[10px] text-muji-ink leading-normal text-center">{generationErrors[id]}</p>
                  </div>
                </div>
              ) : '等待中'}
            </span>
          </div>
        )}
      </div>

      {/* Drag Handle */}
      {url && !loading && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-3 left-3 p-2 bg-muji-paper/90 text-muji-gray hover:text-muji-ink rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-muji-line cursor-grab active:cursor-grabbing z-20"
        >
          <GripVertical size={14} />
        </div>
      )}

      {/* Download Button - Always visible for better UX */}
      {url && !loading && (
        <button 
          onClick={handleDownload}
          className="absolute top-3 right-12 p-2 bg-muji-accent text-white rounded-sm shadow-lg hover:scale-110 transition-transform z-20 flex items-center gap-1"
          title="立即下載 JPG"
        >
          <Download size={14} />
          <span className="text-[8px] font-bold tracking-tight">JPG</span>
        </button>
      )}

      {url && !loading && (
        <div className="absolute bottom-3 left-3 flex gap-1 bg-muji-paper/90 backdrop-blur-sm px-2 py-1.5 rounded-sm border border-muji-line opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {[1, 2, 3].map((star) => (
            <button
              key={star}
              onClick={(e) => {
                e.stopPropagation();
                handleRateImage(id, star);
              }}
              className="transition-transform hover:scale-110"
            >
              <Star 
                size={12} 
                className={star <= currentRatings[id] ? "fill-muji-accent text-muji-accent" : "text-muji-line"} 
              />
            </button>
          ))}
        </div>
      )}
      {url && !loading && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteImage(id);
          }}
          className="absolute top-3 right-3 p-2 bg-muji-paper/90 text-muji-gray hover:text-muji-ink rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-muji-line z-20"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

interface GenerationGridProps {
  currentGeneration: (string | null)[];
  activeIndices: number[];
  currentlyRendering: number | null;
  generationProgress: number[];
  generationErrors: (string | null)[];
  currentRatings: number[];
  selectedCategories: ImageCategory[];
  categoryConfigs: any[];
  loading: boolean;
  handleStartProduction: (cats: ImageCategory[]) => void;
  handleRateImage: (index: number, rating: number) => void;
  handleDeleteImage: (index: number) => void;
  setZoomedImage: (img: {url: string, title: string} | null) => void;
  handleReorderImages: (sectionType: ImageCategory, oldIndex: number, newIndex: number) => void;
  downloadImage: (url: string, filename: string) => void;
}

export const GenerationGrid: React.FC<GenerationGridProps> = ({
  currentGeneration,
  activeIndices,
  currentlyRendering,
  generationProgress,
  generationErrors,
  currentRatings,
  selectedCategories,
  categoryConfigs,
  loading,
  handleStartProduction,
  handleRateImage,
  handleDeleteImage,
  setZoomedImage,
  handleReorderImages,
  downloadImage
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allIndices = Array.from({ length: 9 }, (_, i) => i);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find which section this index belongs to
      const activeId = active.id as number;
      const overId = over.id as number;
      
      const section = categoryConfigs.find(c => c.indices.includes(activeId));
      if (section) {
        const oldIndex = section.indices.indexOf(activeId);
        const newIndex = section.indices.indexOf(overId);
        if (newIndex !== -1) {
          handleReorderImages(section.type, oldIndex, newIndex);
        }
      }
    }
  };

  const hasAnyContent = currentGeneration.some(Boolean) || activeIndices.length > 0;

  if (!hasAnyContent) return null;

  return (
    <div className="space-y-8 animate-fade-in pt-6 border-t border-muji-line">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muji-ink uppercase tracking-muji font-bold flex items-center gap-2">
          <Sparkles size={14} className="text-muji-accent" />
          生成結果預覽
        </p>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              currentGeneration.forEach((url, i) => {
                if (url) {
                  setTimeout(() => {
                    downloadImage(url, `muji-ai-batch-${i+1}`);
                  }, i * 300);
                }
              });
            }}
            className="text-[9px] bg-muji-accent text-white px-3 py-1 rounded-sm tracking-muji font-bold uppercase hover:bg-muji-accent/90 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download size={12} /> 下載全部 JPG
          </button>
          <span className="text-[8px] bg-muji-ink text-muji-paper px-2 py-0.5 rounded-sm tracking-muji font-medium uppercase">
            800px High Quality
          </span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-10">
          {categoryConfigs.map((section) => {
            const sectionIndices = section.indices;
            const hasSectionContent = sectionIndices.some(i => currentGeneration[i] || activeIndices.includes(i));
            
            if (!hasSectionContent) return null;

            return (
              <div key={section.type} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-muji-accent">
                    {section.icon}
                  </div>
                  <h3 className="text-[11px] uppercase tracking-muji font-bold text-muji-ink">
                    {section.name}
                  </h3>
                  <div className="h-[1px] flex-grow bg-muji-line/30"></div>
                </div>

                <SortableContext
                  items={sectionIndices}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-3 gap-4">
                    {sectionIndices.map((i, idxInSection) => (
                      <SortableImage
                        key={i}
                        id={i}
                        url={currentGeneration[i]}
                        sectionName={section.name}
                        indexInSection={idxInSection}
                        currentlyRendering={currentlyRendering}
                        generationProgress={generationProgress}
                        generationErrors={generationErrors}
                        currentRatings={currentRatings}
                        activeIndices={activeIndices}
                        loading={loading}
                        handleRateImage={handleRateImage}
                        handleDeleteImage={handleDeleteImage}
                        setZoomedImage={setZoomedImage}
                        downloadImage={downloadImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};
