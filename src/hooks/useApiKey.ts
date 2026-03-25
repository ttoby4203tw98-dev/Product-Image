
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useCallback, useEffect, useState, useRef} from 'react';

interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

export const useApiKey = () => {
  const [isKeySet, setIsKeySet] = useState(false);
  const hasAttemptedSelection = useRef(false);

  const validateApiKey = useCallback(async (force = false): Promise<boolean> => {
    // 如果剛剛才手動選取過（hasAttemptedSelection 為 true），則直接信任並通過
    // 這是為了避開平台 hasSelectedApiKey 狀態更新延遲的 race condition
    if (hasAttemptedSelection.current && !force) {
      setIsKeySet(true);
      return true;
    }

    const aistudio = (window as any).aistudio as AIStudio | undefined;
    
    // 如果有環境變數金鑰，優先使用
    const envKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                  (import.meta as any).env?.VITE_API_KEY;
    
    if (envKey) {
      setIsKeySet(true);
      return true;
    }

    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      try {
        const hasKey = await Promise.race([
          aistudio.hasSelectedApiKey(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000))
        ]).catch(() => false);
        
        if (hasKey) {
          setIsKeySet(true);
          return true;
        }

        setIsKeySet(false);
        return false;
      } catch (error) {
        console.warn('API Key check failed', error);
        setIsKeySet(false);
        return false;
      }
    }
    
    setIsKeySet(false);
    return false;
  }, []);

  const resetAndOpen = useCallback(async () => {
    hasAttemptedSelection.current = false;
    setIsKeySet(false);
    
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      try {
        await aistudio.openSelectKey();
        hasAttemptedSelection.current = true;
        setIsKeySet(true);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  }, []);

  // 只在初始掛載時執行一次靜默檢查，不彈窗
  useEffect(() => {
    const silentCheck = async () => {
      const envKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                    (import.meta as any).env?.VITE_API_KEY;
      if (envKey) {
        setIsKeySet(true);
        return;
      }

      const aistudio = (window as any).aistudio as AIStudio | undefined;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        try {
          const hasKey = await aistudio.hasSelectedApiKey();
          if (hasKey) setIsKeySet(true);
        } catch (e) {}
      }
    };
    silentCheck();
  }, []);

  return {
    isKeySet,
    validateApiKey,
    resetAndOpen,
  };
};
