import React from 'react';
import { HangoLogo } from './HangoLogo';
import { Plus, BookOpen, Gamepad2, Sparkles } from 'lucide-react';
import { Word, ActiveTab } from '../types';

interface HeaderProps {
  words: Word[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  words,
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <header 
      id="hango-main-header" 
      className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-xs transition-all"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        {/* Top row: Logo and Quick Action */}
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Brand & Slogan */}
          <div className="min-w-0 flex-1">
            <HangoLogo size="md" />
          </div>

          {/* Desktop Navigation Tabs (hidden on mobile, visible on sm and up) */}
          <nav
            id="top-nav-tabs-desktop"
            className="hidden sm:flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner"
            aria-label="Điều hướng chính"
          >
            {/* Tab: Từ vựng */}
            <button
              id="top-tab-vocabulary"
              onClick={() => onTabChange('vocabulary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-95 ${
                activeTab === 'vocabulary'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'vocabulary' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Từ vựng</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold leading-none transition-colors ${
                  activeTab === 'vocabulary'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {words.length}
              </span>
            </button>

            {/* Tab: Trò chơi & Bài tập */}
            <button
              id="top-tab-practice"
              onClick={() => onTabChange('practice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-95 ${
                activeTab === 'practice'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Gamepad2 className={`w-4 h-4 ${activeTab === 'practice' ? 'text-red-600' : 'text-slate-500'}`} />
              <span>Trò chơi & Bài tập</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </nav>

          {/* Quick Add Word Button */}
          <button
            id="header-quick-add-word-btn"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 min-h-[40px] px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:shadow cursor-pointer shrink-0 active:scale-95"
            aria-label="Thêm từ vựng mới"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Thêm từ</span>
          </button>
        </div>

        {/* Mobile Navigation Tabs (iOS/Android segmented tab bar) */}
        <div className="sm:hidden mt-2 pt-1.5 border-t border-slate-100">
          <nav
            id="top-nav-tabs-mobile"
            className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1"
            aria-label="Điều hướng tab di động"
          >
            <button
              id="mobile-tab-vocabulary"
              onClick={() => onTabChange('vocabulary')}
              className={`flex items-center justify-center gap-1.5 min-h-[42px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                activeTab === 'vocabulary'
                  ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'vocabulary' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Từ vựng</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                activeTab === 'vocabulary' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {words.length}
              </span>
            </button>

            <button
              id="mobile-tab-practice"
              onClick={() => onTabChange('practice')}
              className={`flex items-center justify-center gap-1.5 min-h-[42px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                activeTab === 'practice'
                  ? 'bg-white text-red-600 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gamepad2 className={`w-4 h-4 ${activeTab === 'practice' ? 'text-red-600' : 'text-slate-400'}`} />
              <span>Trò chơi & Bài tập</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
