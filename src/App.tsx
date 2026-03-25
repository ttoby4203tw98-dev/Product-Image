
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  LayoutGrid, 
  RefreshCw, 
  Square, 
  RotateCcw, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

// Components
import { Button } from './components/Button';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { GenerationGrid } from './components/GenerationGrid';
import { GalleryView } from './components/GalleryView';
import { ImageZoom, MockupPreview } from './components/Overlays';
import { IntroSequence } from './components/IntroSequence';
import { UsageDisplay } from './components/UsageDisplay';

// Hooks
import { useApiKey } from './hooks/useApiKey';
import { useMuroState } from './hooks/useMuroState';
import { useGeneration } from './hooks/useGeneration';

// Types & Utils
import { ImageCategory, GeneratedMockup, ProductCategory } from './types';
import { processImage } from './utils/imageProcessor';
import { arrayMove } from '@dnd-kit/sortable';

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('muro_intro_shown');
    }
    return true;
  });

  const state = useMuroState();
  const {
    view, setView,
    selectedMockup, setSelectedMockup,
    zoomedImage, setZoomedImage,
    productTitle, setProductTitle,
    mainImageTitle, setMainImageTitle,
    optimizationPrompt, setOptimizationPrompt,
    selectedModel, setSelectedModel,
    specs, setSpecs,
    features, setFeatures,
    optLogs, setOptLogs,
    mainUploadedPreviews, setMainUploadedPreviews,
    detailUploadedPreviews, setDetailUploadedPreviews,
    currentGeneration, setCurrentGeneration,
    activeIndices, setActiveIndices,
    displayFilter, setDisplayFilter,
    gallery, setGallery,
    loading, setLoading,
    latestUsage, setLatestUsage,
    productCategory, setProductCategory,
    currentRatings, setCurrentRatings,
    selectedCategories, setSelectedCategories,
    getInitialSpecs, getInitialFeatures
  } = state;

  const { isKeySet, validateApiKey, resetAndOpen } = useApiKey();

  const addLog = (msg: string) => {
    setOptLogs(prev => [msg, ...prev].slice(0, 8));
  };

  const generation = useGeneration({
    productTitle,
    mainUploadedPreviews,
    optimizationPrompt,
    mainImageTitle,
    specs,
    detailUploadedPreviews,
    productCategory,
    features,
    selectedModel,
    currentGeneration,
    currentRatings,
    setLoading,
    setLatestUsage,
    setCurrentGeneration,
    setActiveIndices,
    addLog,
    resetAndOpen
  });

  const {
    currentlyRendering,
    generationProgress,
    generationErrors,
    stopGenerationRef,
    generateProcess,
    setGenerationProgress,
    setGenerationErrors
  } = generation;

  const resultsRef = useRef<HTMLDivElement>(null);

  const categoryConfigs: {type: ImageCategory; name: string; indices: number[]; icon: React.ReactNode}[] = [
    { type: 'main', name: '產品主圖', indices: [0, 1, 2], icon: <Sparkles size={16} /> },
    { type: 'features', name: '產品特點圖', indices: [3, 4, 5], icon: <RefreshCw size={16} /> },
    { type: 'specs', name: '產品規格圖', indices: [6, 7, 8], icon: <LayoutGrid size={16} /> }
  ];

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (loading.isGenerating) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading.isGenerating]);

  const handleReset = () => {
    setProductTitle('');
    setMainImageTitle('');
    setOptimizationPrompt('');
    setSelectedModel('gemini-3.1-flash-image-preview');
    setSpecs(getInitialSpecs()); 
    setFeatures(getInitialFeatures());
    setMainUploadedPreviews([]);
    setDetailUploadedPreviews([]);
    setCurrentGeneration(Array(9).fill(null));
    setGenerationProgress(Array(9).fill(0));
    setGenerationErrors(Array(9).fill(null));
    setActiveIndices([]);
    setDisplayFilter(null);
    setSelectedCategories(['main', 'specs', 'features']);
    setProductCategory('living');
    setCurrentRatings(Array(9).fill(0));
    setLoading({ isGenerating: false, message: '' });
    
    localStorage.clear();
    addLog("已重置所有工作區資訊。");
  };

  const downloadImage = async (url: string, filename: string) => {
    const timestamp = new Date().getTime().toString().slice(-6); // Last 6 digits of timestamp
    const safeBase = (filename || 'muro-design').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const safeFilename = `${safeBase}-${timestamp}`;
    
    // If it's a data URL, we can download it directly without fetch
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeFilename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For remote URLs, use fetch to get a blob (handles CORS if configured)
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${safeFilename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Final fallback: open in new tab or direct link
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.download = `${safeFilename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleStartProduction = async (specificCategories?: ImageCategory[] | React.MouseEvent) => {
    try {
      const categoriesToGenerate = Array.isArray(specificCategories) 
        ? specificCategories 
        : (selectedCategories || []);
      
      if (!productTitle.trim() && mainUploadedPreviews.length === 0) {
        setLoading({ isGenerating: false, message: "提示：請先輸入產品名稱或上傳主圖素材。" });
        return;
      }
      
      if (categoriesToGenerate.length === 0) {
        setLoading({ isGenerating: false, message: "提示：請先選擇至少一種生成類型。" });
        return;
      }
      
      setLoading({ isGenerating: true, message: '執行選定渲染任務...' });
      // 移除強制驗證，改為嘗試執行，若金鑰無效則由 API 層報錯
      await validateApiKey(); 

      const allTargetIndices: number[] = [];
      for (let i = 0; i < 3; i++) {
        categoryConfigs.forEach(config => {
          if (categoriesToGenerate.includes(config.type)) {
            allTargetIndices.push(config.indices[i]);
          }
        });
      }

      setDisplayFilter('all');
      setLoading({ isGenerating: true, message: '執行選定渲染任務...' });
      
      setCurrentGeneration(prev => {
        const next = [...prev];
        allTargetIndices.forEach(idx => next[idx] = null);
        return next;
      });
      setGenerationErrors(prev => {
        const next = [...prev];
        allTargetIndices.forEach(idx => next[idx] = null);
        return next;
      });
      
      setActiveIndices(allTargetIndices);
      stopGenerationRef.current = false;

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
      await generateProcess(allTargetIndices);
      setLoading(prev => ({ ...prev, isGenerating: false }));
    } catch (error: any) {
      console.error("handleStartProduction error:", error);
      setLoading({ isGenerating: false, message: `錯誤：${error.message || "發生未知錯誤"}` });
    }
  };

  const handleReorderImages = (sectionType: ImageCategory, oldIndex: number, newIndex: number) => {
    const section = categoryConfigs.find(c => c.type === sectionType);
    if (!section) return;

    const indices = section.indices;
    
    setCurrentGeneration(prev => {
      const next = [...prev];
      const items = indices.map(i => next[i]);
      const movedItems = arrayMove(items, oldIndex, newIndex);
      indices.forEach((idx, i) => next[idx] = movedItems[i]);
      return next;
    });

    setCurrentRatings(prev => {
      const next = [...prev];
      const items = indices.map(i => next[i]);
      const movedItems = arrayMove(items, oldIndex, newIndex);
      indices.forEach((idx, i) => next[idx] = movedItems[i]);
      return next;
    });
  };

  if (showIntro) return <IntroSequence onComplete={() => {
    setShowIntro(false);
    sessionStorage.setItem('muro_intro_shown', 'true');
  }} />;

  return (
    <div className="min-h-screen bg-muji-bg text-muji-ink font-sans flex flex-col">
      <main className="flex-1 overflow-y-auto bg-muji-bg/50">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-8">
          {view === 'generate' && (
            <div className="animate-fade-in space-y-6">
              <Header onKeyClick={resetAndOpen} isKeySet={isKeySet} />

              <ProductForm 
                {...state}
                categoryConfigs={categoryConfigs}
                toggleCategory={(type) => setSelectedCategories(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                handleAddSpec={() => setSpecs([...specs, { key: '', value: '' }])}
                handleUpdateSpec={(index, field, value) => {
                  const newSpecs = [...specs];
                  newSpecs[index][field] = value;
                  setSpecs(newSpecs);
                }}
                handleUpdateFeature={(index, field, value) => {
                  const newFeatures = [...features];
                  newFeatures[index][field] = value;
                  setFeatures(newFeatures);
                }}
                handleRemoveFeature={(index) => setFeatures(features.filter((_, i) => i !== index))}
                handleMainFilesSelect={async (files) => {
                  const newItems = await Promise.all(files.map(async (file) => {
                    const base64 = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });
                    return processImage(base64, 'main', 512, 0.5);
                  }));
                  setMainUploadedPreviews(prev => [...prev, ...newItems]);
                }}
                handleDetailFilesSelect={async (files) => {
                  const newItems = await Promise.all(files.map(async (file) => {
                    const base64 = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });
                    return processImage(base64, 'specs', 512, 0.5);
                  }));
                  setDetailUploadedPreviews(prev => [...prev, ...newItems]);
                }}
                handleRemoveSpec={(index) => setSpecs(specs.filter((_, i) => i !== index))}
                handleAddFeature={() => setFeatures([...features, { title: '' }])}
                handleStartProduction={handleStartProduction}
                handleReset={handleReset}
                isGenerating={loading.isGenerating}
                stopGeneration={() => { 
                  stopGenerationRef.current = true; 
                  setLoading({isGenerating: false, message: '已中斷'}); 
                  setActiveIndices([]);
                }}
              />

              {loading.message && !loading.isGenerating && (
                <div className="flex items-center gap-4 px-6 py-4 border animate-fade-in rounded-sm bg-muji-line/20 border-muji-line shadow-sm">
                  <AlertCircle size={20} className="text-muji-ink" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-muji text-muji-ink font-bold">渲染中斷</span>
                    <span className="text-[12px] text-muji-ink font-medium">{loading.message}</span>
                  </div>
                </div>
              )}


              <div ref={resultsRef} className={(displayFilter || activeIndices.length > 0 || currentGeneration.some(Boolean) || selectedCategories.includes('main')) ? "block" : "hidden"}>
                <div className="flex justify-end mb-2">
                  <UsageDisplay usage={state.latestUsage} />
                </div>
                <GenerationGrid 
                  {...state}
                  {...generation}
                  categoryConfigs={categoryConfigs}
                  loading={loading.isGenerating}
                  handleStartProduction={handleStartProduction}
                  handleRateImage={(index, rating) => {
                    setCurrentRatings(prev => {
                      const next = [...prev];
                      next[index] = rating;
                      return next;
                    });
                  }}
                  handleDeleteImage={(index) => {
                    setCurrentGeneration(prev => {
                      const next = [...prev];
                      next[index] = null;
                      return next;
                    });
                    setGenerationErrors(prev => {
                      const next = [...prev];
                      next[index] = null;
                      return next;
                    });
                  }}
                  handleReorderImages={handleReorderImages}
                  downloadImage={downloadImage}
                />
              </div>
            </div>
          )}

          {view === 'gallery' && (
            <GalleryView 
              gallery={gallery}
              setGallery={setGallery}
              setSelectedMockup={setSelectedMockup}
              handleUpdateGalleryRating={(mockupId, rating) => {
                setGallery(prev => prev.map(item => 
                  item.id === mockupId ? { ...item, rating } : item
                ));
              }}
              setView={setView}
              addLog={addLog}
            />
          )}
        </div>
      </main>

      {zoomedImage && (
        <ImageZoom 
          zoomedImage={zoomedImage} 
          setZoomedImage={setZoomedImage} 
          productTitle={productTitle} 
          downloadImage={downloadImage} 
        />
      )}

      {selectedMockup && (
        <MockupPreview 
          selectedMockup={selectedMockup} 
          setSelectedMockup={setSelectedMockup} 
          downloadImage={downloadImage} 
        />
      )}
    </div>
  );
}
