
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  Type, 
  List, 
  Plus, 
  Trash2, 
  Zap, 
  Fingerprint, 
  Tags, 
  Home, 
  Bed, 
  Bath, 
  Utensils, 
  Armchair, 
  LayoutGrid, 
  Check,
  Square,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { FileUploader } from './FileUploader';
import { ProductSpec, ProductFeature, ProductCategory, ImageCategory, ImageModel } from '../types';

interface ProductFormProps {
  productTitle: string;
  setProductTitle: (val: string) => void;
  mainImageTitle: string;
  setMainImageTitle: (val: string) => void;
  optimizationPrompt: string;
  setOptimizationPrompt: (val: string) => void;
  selectedModel: ImageModel;
  setSelectedModel: (model: ImageModel) => void;
  specs: ProductSpec[];
  setSpecs: (specs: ProductSpec[]) => void;
  features: ProductFeature[];
  setFeatures: (features: ProductFeature[]) => void;
  productCategory: ProductCategory;
  setProductCategory: (cat: ProductCategory) => void;
  selectedCategories: ImageCategory[];
  setSelectedCategories: (cats: ImageCategory[] | ((prev: ImageCategory[]) => ImageCategory[])) => void;
  mainUploadedPreviews: string[];
  handleMainFilesSelect: (files: File[]) => void;
  setMainUploadedPreviews: (previews: string[] | ((prev: string[]) => string[])) => void;
  detailUploadedPreviews: string[];
  handleDetailFilesSelect: (files: File[]) => void;
  setDetailUploadedPreviews: (previews: string[] | ((prev: string[]) => string[])) => void;
  categoryConfigs: any[];
  toggleCategory: (type: ImageCategory) => void;
  handleAddSpec: () => void;
  handleUpdateSpec: (index: number, field: 'key' | 'value', value: string) => void;
  handleRemoveSpec: (index: number) => void;
  handleAddFeature: () => void;
  handleUpdateFeature: (index: number, field: 'title', value: string) => void;
  handleRemoveFeature: (index: number) => void;
  handleStartProduction: () => void;
  handleReset: () => void;
  isGenerating: boolean;
  stopGeneration: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productTitle, setProductTitle,
  mainImageTitle, setMainImageTitle,
  optimizationPrompt, setOptimizationPrompt,
  selectedModel, setSelectedModel,
  specs, setSpecs,
  features, setFeatures,
  productCategory, setProductCategory,
  selectedCategories, setSelectedCategories,
  mainUploadedPreviews, handleMainFilesSelect, setMainUploadedPreviews,
  detailUploadedPreviews, handleDetailFilesSelect, setDetailUploadedPreviews,
  categoryConfigs, toggleCategory,
  handleAddSpec, handleUpdateSpec, handleRemoveSpec,
  handleAddFeature, handleUpdateFeature, handleRemoveFeature,
  handleStartProduction, handleReset, isGenerating, stopGeneration
}) => {
  return (
    <div className="muji-card p-4 md:p-5 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="space-y-3">
            <FileUploader 
              label="產品主圖素材" 
              onFilesSelect={handleMainFilesSelect} 
              previews={mainUploadedPreviews} 
              onRemove={idx => setMainUploadedPreviews(p => p.filter((_, i) => i !== idx))} 
              onClearAll={() => setMainUploadedPreviews([])} 
            />
            
            <FileUploader 
              label="詳情細節素材" 
              onFilesSelect={handleDetailFilesSelect} 
              previews={detailUploadedPreviews} 
              onRemove={idx => setDetailUploadedPreviews(p => p.filter((_, i) => i !== idx))} 
              onClearAll={() => setDetailUploadedPreviews([])} 
            />
          </div>

          <div className="flex items-center justify-center pt-4 pb-10">
            <div className="relative">
              {!isGenerating ? (
                <button 
                  onClick={handleStartProduction}
                  className="w-28 h-28 rounded-full bg-muji-accent text-muji-paper flex flex-col items-center justify-center shadow-xl hover:brightness-110 transition-all group relative overflow-hidden active:scale-95"
                  title="開始製作"
                >
                  <Zap size={32} className="relative z-10 group-hover:scale-110 transition-transform mb-1" />
                  <span className="relative z-10 text-[11px] font-bold tracking-muji">開始製作</span>
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
              ) : (
                <button 
                  onClick={stopGeneration}
                  className="w-28 h-28 rounded-sm bg-muji-ink text-muji-paper flex flex-col items-center justify-center shadow-xl hover:bg-black transition-all group active:scale-95"
                  title="停止渲染"
                >
                  <Square size={32} fill="currentColor" className="group-hover:scale-90 transition-transform mb-1" />
                  <span className="text-[11px] font-bold tracking-muji text-center">停止渲染</span>
                </button>
              )}
              
              <button 
                onClick={handleReset}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full border border-muji-line text-muji-gray hover:text-muji-ink hover:border-muji-ink flex items-center justify-center transition-all bg-white shadow-md z-20"
                title="全部清除"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-muji text-muji-gray">產品名稱</label>
              <input type="text" value={productTitle} onChange={e => setProductTitle(e.target.value)} placeholder="如：頂級蠶絲保濕面膜" className="muji-input text-sm py-2" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-muji text-muji-gray flex items-center gap-2"><Type size={10} /> 封面標題</label>
              <input type="text" value={mainImageTitle} onChange={e => setMainImageTitle(e.target.value)} placeholder="如：優雅、純粹、極致呵護" className="muji-input text-sm py-2" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-muji-line pb-1">
              <label className="text-[9px] uppercase tracking-muji text-muji-gray flex items-center gap-2">
                <List size={10} /> 產品規格參數
              </label>
              <button onClick={handleAddSpec} className="text-[9px] text-muji-accent hover:text-muji-ink flex items-center gap-1 transition-colors">
                <Plus size={10} /> 新增
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 bg-muji-bg/30 p-2 rounded-sm">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <input 
                    type="text" 
                    value={spec.key} 
                    onChange={(e) => handleUpdateSpec(index, 'key', e.target.value)}
                    placeholder="鍵"
                    className="w-16 text-[10px] py-1 border-b border-muji-line bg-transparent focus:border-muji-ink outline-none font-medium text-muji-gray uppercase tracking-muji" 
                  />
                  <input 
                    type="text" 
                    value={spec.value} 
                    onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                    placeholder="值"
                    className="flex-1 text-[10px] py-1 border-b border-muji-line bg-transparent focus:border-muji-ink outline-none text-muji-ink" 
                  />
                  <button onClick={() => handleRemoveSpec(index)} className="opacity-0 group-hover:opacity-100 text-muji-line hover:text-muji-ink transition-all p-0.5">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-muji-line pb-1">
              <label className="text-[9px] uppercase tracking-muji text-muji-gray flex items-center gap-2">
                <Zap size={10} /> 產品特點
              </label>
              <button onClick={handleAddFeature} className="text-[9px] text-muji-accent hover:text-muji-ink flex items-center gap-1 transition-colors">
                <Plus size={10} /> 新增
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 bg-muji-bg/30 p-2 rounded-sm">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 group bg-muji-paper p-2 border border-muji-line rounded-sm shadow-sm">
                  <input 
                    type="text" 
                    value={feature.title} 
                    onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                    placeholder="特點描述"
                    className="flex-1 text-[10px] py-1 border-b border-muji-line bg-transparent focus:border-muji-ink outline-none font-medium text-muji-ink uppercase tracking-muji" 
                  />
                  <button onClick={() => handleRemoveFeature(index)} className="opacity-0 group-hover:opacity-100 text-muji-line hover:text-muji-ink transition-all p-0.5">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-muji text-muji-gray flex items-center gap-2">
              <Fingerprint size={10} /> 優化指令
            </label>
            <textarea 
              value={optimizationPrompt} 
              onChange={e => setOptimizationPrompt(e.target.value)} 
              placeholder="例如：強調絲滑質感、溫潤柔光" 
              className="muji-input h-16 resize-none text-xs py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-muji text-muji-gray flex items-center gap-2">
                <Cpu size={10} /> 選取模型
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro (推薦)', desc: '最高品質渲染，適合最終成品' },
                  { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash', desc: '最新 3.1 系列，極速且高品質' },
                  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', desc: '經典穩定版本' }
                ].map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id as ImageModel)}
                    className={`flex flex-col items-start p-2 border rounded-sm transition-all text-left ${selectedModel === model.id ? 'border-muji-accent bg-muji-accent/5 ring-1 ring-muji-accent' : 'border-muji-line hover:border-muji-gray bg-white'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-bold uppercase tracking-muji ${selectedModel === model.id ? 'text-muji-ink' : 'text-muji-gray'}`}>
                        {model.name}
                      </span>
                      {selectedModel === model.id && <Check size={10} className="text-muji-accent" />}
                    </div>
                    <span className="text-[8px] text-muji-gray/70 mt-0.5">{model.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-muji text-muji-gray flex items-center gap-2">
                  <LayoutGrid size={10} /> 生成類型
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedCategories(['main', 'specs', 'features'])} className="text-[9px] text-muji-gray hover:text-muji-ink uppercase tracking-muji font-medium">全選</button>
                  <button onClick={() => setSelectedCategories([])} className="text-[9px] text-muji-gray hover:text-muji-ink uppercase tracking-muji font-medium">重設</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {categoryConfigs.map(config => {
                  const isSelected = selectedCategories.includes(config.type);
                  return (
                    <button 
                      key={config.type} 
                      onClick={() => toggleCategory(config.type)}
                      className={`relative py-2.5 px-2 border rounded-sm flex flex-col items-center gap-1.5 transition-all duration-300 group shadow-sm hover:shadow-md active:scale-95 ${isSelected ? 'border-muji-accent bg-muji-accent/5 ring-1 ring-muji-accent' : 'border-muji-line hover:border-muji-gray bg-white'}`}
                    >
                      <div className={`transition-colors ${isSelected ? 'text-muji-accent' : 'text-muji-line group-hover:text-muji-gray'}`}>
                        {config.icon}
                      </div>
                      <span className={`text-[9px] tracking-muji font-bold uppercase transition-colors ${isSelected ? 'text-muji-ink' : 'text-muji-gray'}`}>
                        {config.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <Check size={10} className="text-muji-accent" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
