import React from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="py-2 px-4 border-b border-neutral-900 bg-neutral-950/50">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
            (cat.name === 'All' && selectedCategory === '');

          const count =
            cat.name === 'All'
              ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
              : categoryCounts[cat.name] || 0;

          return (
            <button
              key={cat.id}
              onClick={() =>
                onSelectCategory(cat.name === 'All' ? '' : cat.name)
              }
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-900/40 ring-1 ring-red-400/30'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-black/30 text-white font-bold'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
