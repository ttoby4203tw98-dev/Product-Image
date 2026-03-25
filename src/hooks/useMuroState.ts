
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { 
  GeneratedMockup, 
  LoadingState, 
  ProductCategory, 
  ImageCategory, 
  ProductSpec, 
  ProductFeature,
  ImageModel,
  UsageMetadata
} from '../types';

export const useMuroState = () => {
  const [view, setView] = useState<'generate' | 'gallery'>('generate');
  const [selectedMockup, setSelectedMockup] = useState<GeneratedMockup | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{url: string, title: string} | null>(null);
  
  const [productTitle, setProductTitle] = useState(() => localStorage.getItem('muro_productTitle') || '');
  const [mainImageTitle, setMainImageTitle] = useState(() => localStorage.getItem('muro_mainImageTitle') || '');
  const [optimizationPrompt, setOptimizationPrompt] = useState(() => localStorage.getItem('muro_optimizationPrompt') || '');
  const [selectedModel, setSelectedModel] = useState<ImageModel>(() => {
    const saved = localStorage.getItem('muro_selectedModel');
    return (saved as ImageModel) || 'gemini-3-pro-image-preview';
  });
  
  const getInitialSpecs = (): ProductSpec[] => [
    { key: '材質', value: '' },
    { key: '規格', value: '' },
    { key: '重量', value: '' },
    { key: '顏色', value: '' }
  ];

  const getInitialFeatures = (): ProductFeature[] => [
    { title: '極簡設計' },
    { title: '舒適體驗' },
    { title: '匠心工藝' }
  ];
  
  const [specs, setSpecs] = useState<ProductSpec[]>(() => {
    const saved = localStorage.getItem('muro_specs');
    return saved ? JSON.parse(saved) : getInitialSpecs();
  });

  const [features, setFeatures] = useState<ProductFeature[]>(() => {
    const saved = localStorage.getItem('muro_features');
    return saved ? JSON.parse(saved) : getInitialFeatures();
  });

  const [optLogs, setOptLogs] = useState<string[]>(["Gemini 3.0 Pro 渲染引擎已鎖定。"]);
  const [mainUploadedPreviews, setMainUploadedPreviews] = useState<string[]>(() => {
    const saved = localStorage.getItem('muro_mainUploadedPreviews');
    return saved ? JSON.parse(saved) : [];
  });
  const [detailUploadedPreviews, setDetailUploadedPreviews] = useState<string[]>(() => {
    const saved = localStorage.getItem('muro_detailUploadedPreviews');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentGeneration, setCurrentGeneration] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem('muro_currentGeneration');
    return saved ? JSON.parse(saved) : Array(9).fill(null);
  });
  const [activeIndices, setActiveIndices] = useState<number[]>(() => {
    const saved = localStorage.getItem('muro_activeIndices');
    return saved ? JSON.parse(saved) : [];
  }); 
  const [displayFilter, setDisplayFilter] = useState<ImageCategory | 'all' | null>(null); 
  const [gallery, setGallery] = useState<GeneratedMockup[]>(() => {
    const saved = localStorage.getItem('muro_gallery');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<LoadingState>(() => {
    const saved = localStorage.getItem('muro_loading');
    return saved ? JSON.parse(saved) : { isGenerating: false, message: '' };
  });
  const [latestUsage, setLatestUsage] = useState<UsageMetadata | null>(null);
  const [productCategory, setProductCategory] = useState<ProductCategory>(() => {
    const saved = localStorage.getItem('muro_productCategory');
    return (saved as ProductCategory) || 'living';
  });
  const [currentRatings, setCurrentRatings] = useState<number[]>(() => {
    const saved = localStorage.getItem('muro_currentRatings');
    return saved ? JSON.parse(saved) : Array(9).fill(0);
  });
  const [selectedCategories, setSelectedCategories] = useState<ImageCategory[]>(() => {
    const saved = localStorage.getItem('muro_selectedCategories');
    return saved ? JSON.parse(saved) : ['main', 'specs', 'features'];
  });

  // 持久化狀態
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('muro_productTitle', productTitle);
        localStorage.setItem('muro_mainImageTitle', mainImageTitle);
        localStorage.setItem('muro_optimizationPrompt', optimizationPrompt);
        localStorage.setItem('muro_specs', JSON.stringify(specs));
        localStorage.setItem('muro_features', JSON.stringify(features));
        localStorage.setItem('muro_productCategory', productCategory);
        localStorage.setItem('muro_selectedModel', selectedModel);
        localStorage.setItem('muro_selectedCategories', JSON.stringify(selectedCategories));
        localStorage.setItem('muro_currentRatings', JSON.stringify(currentRatings));
        localStorage.setItem('muro_mainUploadedPreviews', JSON.stringify(mainUploadedPreviews));
        localStorage.setItem('muro_detailUploadedPreviews', JSON.stringify(detailUploadedPreviews));
        localStorage.setItem('muro_currentGeneration', JSON.stringify(currentGeneration));
        localStorage.setItem('muro_gallery', JSON.stringify(gallery));
        localStorage.setItem('muro_activeIndices', JSON.stringify(activeIndices));
        localStorage.setItem('muro_loading', JSON.stringify({ ...loading, isGenerating: false }));
      } catch (e) {
        console.warn('LocalStorage quota exceeded, some data might not be saved.');
      }
    }, 1000); // Debounce save
    return () => clearTimeout(timer);
  }, [productTitle, mainImageTitle, optimizationPrompt, specs, selectedCategories, selectedModel, mainUploadedPreviews, detailUploadedPreviews, currentGeneration, gallery, activeIndices, loading]);

  return {
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
  };
};
