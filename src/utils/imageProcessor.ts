
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ImageCategory } from '../types';

export const processImage = async (
  base64Str: string, 
  category: ImageCategory, 
  targetPx: number = 800, 
  maxSizeMB: number = 1
): Promise<string> => {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    console.warn("Invalid image data provided to processImage");
    return base64Str;
  }

  return new Promise((resolve) => {
    const img = new Image();
    // 設置超時，防止 Image 載入掛掉
    const timeout = setTimeout(() => {
      console.warn("Image processing timed out, returning original");
      resolve(base64Str);
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetPx;
        canvas.height = targetPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn("Canvas context not available");
          return resolve(base64Str);
        }
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetPx, targetPx);
        
        if (category === 'main') {
          ctx.save();
          const watermarkText = "MURO";
          ctx.font = '300 15px "Inter", "sans-serif"';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.letterSpacing = '4px';
          const xPos = 40;
          const yPos = 40;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; 
          ctx.fillText(watermarkText, xPos, yPos);
          ctx.beginPath();
          const textWidth = ctx.measureText(watermarkText).width;
          ctx.arc(xPos + textWidth + 10, yPos + 8, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
          ctx.fill();
          ctx.restore();
        }

        let quality = 0.92;
        let result = canvas.toDataURL('image/jpeg', quality);
        
        // Final verification of mime type
        if (!result.startsWith('data:image/jpeg')) {
          console.warn("Canvas toDataURL failed to produce image/jpeg, forcing conversion");
          // Some browsers might fail to return jpeg if not supported, but it's standard.
        }

        while (result.length > maxSizeMB * 1024 * 1024 * 1.33 && quality > 0.1) {
          quality -= 0.05;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        
        console.log(`Image processed to JPEG. Length: ${result.length}, Quality: ${quality}`);
        resolve(result);
      } catch (e) {
        console.error("Canvas processing error:", e);
        resolve(base64Str);
      }
    };
    img.onerror = (e) => {
      clearTimeout(timeout);
      console.error("Image processing failed: base64 data invalid or load error", e);
      resolve(base64Str); // Fallback to raw if processing fails
    };
    img.src = base64Str;
  });
};
