
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Asset {
  id: string;
  type: 'logo' | 'product';
  name: string;
  data: string; // Base64
  mimeType: string;
}

export interface PlacedLayer {
  uid: string; // unique instance id
  assetId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 1 = 100%
  rotation: number;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface GeneratedMockup {
  id: string;
  imageUrl: string;
  allImages?: string[]; // Array for the 9 images generated
  prompt: string;
  createdAt: number;
  layers?: PlacedLayer[];
  productId?: string;
  rating?: number; // 1-3 stars (for main image)
  ratings?: number[]; // 1-3 stars for each in allImages
  usage?: UsageMetadata;
}

export type AppView = 'generate' | 'gallery';

export type ProductCategory = 'loungewear' | 'bedroom' | 'bathroom' | 'kitchen' | 'living';

export type ImageCategory = 'main' | 'specs' | 'features';

export type ImageModel = 'gemini-3.1-flash-image-preview' | 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductFeature {
  title: string;
}

export interface GenerationFailure {
  originalPrompt: string;
  failureReason: string;
  correctedPrompt: string;
  category: string;
  timestamp: string;
}

export interface LoadingState {
  isGenerating: boolean;
  message: string;
}
