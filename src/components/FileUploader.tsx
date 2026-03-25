
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { Upload, X, ClipboardPaste } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  onFilesSelect: (files: File[]) => void;
  accept?: string;
  previews?: string[];
  onRemove?: (index: number) => void;
  onClearAll?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onFilesSelect,
  accept = ".jpg,.jpeg,.png,.webp",
  previews = [],
  onRemove,
  onClearAll
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
      // 重置 input 值，確保選擇同一張圖也能觸發 change
      e.target.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      onFilesSelect(files);
      e.preventDefault();
    }
  };

  const handleContainerClick = () => {
    // 點擊容器時觸發隱藏的 input
    inputRef.current?.click();
    // 同時讓 div 獲得焦點以便接收貼上事件
    containerRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* 隱藏的檔案輸入框 */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple
        onChange={handleChange}
      />

      {/* 點擊與貼上區域 */}
      <div
        ref={containerRef}
        tabIndex={0}
        onPaste={handlePaste}
        onClick={handleContainerClick}
        className={`relative w-full aspect-[21/6] rounded-sm border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group outline-none
          ${isDragging 
            ? 'border-muji-accent bg-muji-paper' 
            : 'border-muji-line border-dashed hover:border-muji-gray hover:bg-muji-paper/50 focus:border-muji-accent focus:bg-muji-paper/50 focus:ring-1 focus:ring-muji-accent/20'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-1 text-center pointer-events-none">
          <div className={`mx-auto w-4 h-4 flex items-center justify-center mb-0.5 transition-colors
            ${isDragging ? 'text-muji-accent' : 'text-muji-gray group-hover:text-muji-ink'}`}>
            <Upload size={12} strokeWidth={1.5} />
          </div>
          <p className="text-[8px] uppercase tracking-[0.1em] text-muji-gray">{label}</p>
        </div>
      </div>

      {/* 預覽列表 */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] uppercase tracking-[0.2em] text-muji-gray">已載入 ({previews.length})</span>
            <button 
              onClick={onClearAll}
              className="text-[8px] uppercase tracking-[0.2em] text-muji-gray hover:text-muji-ink"
            >
              清除
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-square rounded-sm border border-muji-line overflow-hidden bg-muji-paper">
                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-contain p-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(index);
                  }}
                  className="absolute top-1 right-1 p-1 bg-muji-ink/80 text-muji-bg rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
