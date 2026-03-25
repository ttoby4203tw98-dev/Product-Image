
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { UsageMetadata } from '../types';

interface UsageDisplayProps {
  usage: UsageMetadata | null;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({ usage }) => {
  if (!usage) return null;

  // Gemini 3.0 Pro rates: $2/1M input, $12/1M output
  // Exchange rate: 32
  const inputCostUsd = (usage.promptTokenCount / 1000000) * 2;
  const outputCostUsd = (usage.candidatesTokenCount / 1000000) * 12;
  const totalCostUsd = inputCostUsd + outputCostUsd;
  const totalCostTwd = totalCostUsd * 32;

  return (
    <div className="flex flex-col items-end gap-0.5 px-1 py-2 animate-fade-in">
      <div className="flex items-center gap-2 text-[10px] tracking-muji text-muji-gray/60 uppercase">
        <span>Tokens: {usage.totalTokenCount.toLocaleString()}</span>
        <span className="w-px h-2 bg-muji-line/30"></span>
        <span>In: {usage.promptTokenCount.toLocaleString()}</span>
        <span className="w-px h-2 bg-muji-line/30"></span>
        <span>Out: {usage.candidatesTokenCount.toLocaleString()}</span>
      </div>
      <div className="text-[10px] tracking-muji text-muji-gray/80 font-medium">
        Est. Cost: ${totalCostUsd.toFixed(6)} USD / 約 NT${totalCostTwd.toFixed(4)}
      </div>
    </div>
  );
};
