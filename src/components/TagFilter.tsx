import React from 'react';
import { Tag, LayoutList, LayoutGrid, SlidersHorizontal, X } from 'lucide-react';
import { ViewMode } from '../types';

interface TagFilterProps {
  tagsWithCounts: { tag: string; count: number }[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categories: string[];
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  sortBy: 'latest' | 'popular' | 'readTime';
  onChangeSortBy: (sort: 'latest' | 'popular' | 'readTime') => void;
  totalPostsCount: number;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tagsWithCounts,
  selectedTag,
  onSelectTag,
  selectedCategory,
  onSelectCategory,
  categories,
  viewMode,
  onChangeViewMode,
  sortBy,
  onChangeSortBy,
  totalPostsCount,
}) => {
  return (
    <div className="space-y-4 mb-8">
      
      {/* Category Pills & Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
              selectedCategory === null
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            All Categories ({totalPostsCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Layout & Sort */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs">
          
          {/* Sort Select */}
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer border-none"
            >
              <option value="latest" className="dark:bg-zinc-900">Latest First</option>
              <option value="popular" className="dark:bg-zinc-900">Most Read</option>
              <option value="readTime" className="dark:bg-zinc-900">Read Time</option>
            </select>
          </div>

          <div className="w-px h-4 bg-zinc-200 dark:border-zinc-800"></div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onChangeViewMode('editorial')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'editorial'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="Editorial list view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Tag Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-mono text-zinc-400 mr-1 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Tags:
        </span>
        {tagsWithCounts.map(({ tag, count }) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(isSelected ? null : tag)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-xs transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80'
              }`}
            >
              <span>#{tag}</span>
              <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-zinc-400'}`}>
                {count}
              </span>
              {isSelected && <X className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}

        {selectedTag && (
          <button
            onClick={() => onSelectTag(null)}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 ml-2"
          >
            Clear tag filter
          </button>
        )}
      </div>

    </div>
  );
};
