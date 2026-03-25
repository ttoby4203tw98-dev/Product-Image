
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { generateAsset } from '../services/geminiService';
import { processImage } from '../utils/imageProcessor';
import { ImageCategory, ProductSpec, ProductFeature, LoadingState, ProductCategory, ImageModel, UsageMetadata } from '../types';

interface GenerationProps {
  productTitle: string;
  mainUploadedPreviews: string[];
  optimizationPrompt: string;
  mainImageTitle: string;
  specs: ProductSpec[];
  detailUploadedPreviews: string[];
  productCategory: ProductCategory;
  features: ProductFeature[];
  selectedModel: ImageModel;
  currentGeneration: (string | null)[];
  currentRatings: number[];
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  setLatestUsage: React.Dispatch<React.SetStateAction<UsageMetadata | null>>;
  setCurrentGeneration: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  setActiveIndices: React.Dispatch<React.SetStateAction<number[]>>;
  addLog: (msg: string) => void;
  resetAndOpen: () => void;
}

export const useGeneration = ({
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
}: GenerationProps) => {
  const [currentlyRendering, setCurrentlyRendering] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number[]>(Array(9).fill(0));
  const [generationErrors, setGenerationErrors] = useState<(string | null)[]>(Array(9).fill(null));
  const stopGenerationRef = useRef(false);

  const categoryConfigs: {type: ImageCategory; name: string; indices: number[]}[] = [
    { type: 'main', name: '產品主圖', indices: [0, 1, 2] },
    { type: 'features', name: '產品特點圖', indices: [3, 4, 5] },
    { type: 'specs', name: '產品規格圖', indices: [6, 7, 8] }
  ];

  const generateProcess = async (targetIndices: number[]) => {
    if (targetIndices.length === 0) return;
    setLoading({ isGenerating: true, message: '初始化渲染引擎...' });

    const pastFeedback = currentGeneration
      .map((url, idx) => ({ url, rating: currentRatings[idx] }))
      .filter((f): f is { url: string, rating: number } => f.url !== null && (f.rating === 1 || f.rating === 3))
      .slice(0, 3);

    const concurrencyLimit = 2;
    const queue = [...targetIndices];
    const activePromises: Set<Promise<void>> = new Set();

    const processNext = async (): Promise<void> => {
      if (queue.length === 0 || stopGenerationRef.current) return;

      const globalIndex = queue.shift()!;
      setCurrentlyRendering(globalIndex);
      const config = categoryConfigs.find(c => c.indices.includes(globalIndex))!;
      const subIndex = config.indices.indexOf(globalIndex) + 1;

      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const next = [...prev];
          if (next[globalIndex] < 95) {
            const increment = Math.max(1, Math.floor(Math.random() * 3));
            next[globalIndex] = Math.min(95, next[globalIndex] + increment);
          }
          return next;
        });
      }, 300);

      try {
        setLoading(prev => ({ ...prev, message: `正在渲染：${config.name} (${subIndex}/3)...` }));
        setGenerationErrors(prev => {
          const next = [...prev];
          next[globalIndex] = null;
          return next;
        });
        setGenerationProgress(prev => {
          const next = [...prev];
          next[globalIndex] = 1;
          return next;
        });

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("渲染超時 (120s)，請重試。")), 120000)
        );

        addLog(`正在請求 AI 渲染：${config.name} (${subIndex}/3)...`);
        const result = await Promise.race([
          generateAsset(
            productTitle, 
            config.type, 
            mainUploadedPreviews, 
            optimizationPrompt,
            mainImageTitle,
            specs,
            detailUploadedPreviews,
            productCategory,
            pastFeedback,
            features,
            selectedModel
          ),
          timeoutPromise
        ]);

        if (stopGenerationRef.current) {
          clearInterval(progressInterval);
          return;
        }

        const rawB64 = result.imageUrl;
        if (result.usage) {
          setLatestUsage(result.usage);
        }

        if (!rawB64 || !rawB64.startsWith('data:image')) {
          throw new Error("模型未回傳有效的影像數據。");
        }

        const processedB64 = await processImage(rawB64, config.type, 800, 1);
        
        clearInterval(progressInterval);
        setGenerationProgress(prev => {
          const next = [...prev];
          next[globalIndex] = 100;
          return next;
        });
        setGenerationErrors(prev => {
          const next = [...prev];
          next[globalIndex] = null;
          return next;
        });
        setCurrentGeneration(prev => {
          const next = [...prev];
          next[globalIndex] = processedB64;
          return next;
        });
        setActiveIndices(prev => prev.filter(idx => idx !== globalIndex));
        addLog(`完成：${config.name} (${subIndex}/3) 已渲染。`);
      } catch (e: any) {
        clearInterval(progressInterval);
        const errStr = e.message || String(e);
        setGenerationProgress(prev => {
          const next = [...prev];
          next[globalIndex] = 0;
          return next;
        });
        addLog(`失敗：${config.name} (${subIndex}/3) 渲染出錯：${errStr}`);
        setGenerationErrors(prev => {
          const next = [...prev];
          next[globalIndex] = errStr;
          return next;
        });
        
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota") || errStr.includes("金鑰") || errStr.includes("API") || errStr.includes("not found")) {
          setLoading({ isGenerating: false, message: `渲染中斷：${errStr}` });
          stopGenerationRef.current = true;
          if (errStr.includes("金鑰") || errStr.includes("API") || errStr.includes("not found")) {
            resetAndOpen();
          }
        }
        setActiveIndices(prev => prev.filter(idx => idx !== globalIndex));
      } finally {
        setCurrentlyRendering(null);
        if (!stopGenerationRef.current) {
          await processNext();
        }
      }
    };

    const workers = [];
    for (let i = 0; i < Math.min(concurrencyLimit, queue.length); i++) {
      workers.push(processNext());
    }
    await Promise.all(workers);
    setLoading(prev => ({ ...prev, isGenerating: false }));
  };

  return {
    currentlyRendering,
    generationProgress,
    generationErrors,
    stopGenerationRef,
    generateProcess,
    setGenerationProgress,
    setGenerationErrors
  };
};
