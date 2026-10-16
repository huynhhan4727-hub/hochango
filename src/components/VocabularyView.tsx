import React, { useState, useMemo } from 'react';
import { Word, Level, Category } from '../types';
import { LEVEL_LABELS, CATEGORY_LABELS } from '../data/initialVocab';
import { 
  Search, 
  Volume2, 
  Plus, 
  Bookmark, 
  LayoutGrid, 
  List, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  X,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { playKoreanAudio } from '../utils/speech';

interface VocabularyViewProps {
  words: Word[];
  onOpenAddModal: () => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (id: string) => void;
  onSelectWordDetail: (word: Word) => void;
  onToggleFavorite: (id: string) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  words,
  onOpenAddModal,
  onEditWord,
  onDeleteWord,
  onSelectWordDetail,
  onToggleFavorite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      // Level filter
      if (selectedLevel !== 'all' && w.level !== selectedLevel) return false;
      // Category filter
      if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;
      // Favorites filter
      if (onlyFavorites && !w.isFavorite) return false;

      // Search term
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        w.hangul.toLowerCase().includes(q) ||
        w.romaja.toLowerCase().includes(q) ||
        w.vietnamese.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.hanja && w.hanja.toLowerCase().includes(q)) ||
        (w.exampleKo && w.exampleKo.toLowerCase().includes(q))
      );
    });
  }, [words, selectedLevel, selectedCategory, onlyFavorites, searchTerm]);

  const handlePlayAudio = async (e: React.MouseEvent, word: Word) => {
    e.stopPropagation();
    setPlayingId(word.id);
    await playKoreanAudio(word.hangul, 0.85);
    setPlayingId(null);
  };

  const categoriesInUse = useMemo(() => {
    const set = new Set(words.map((w) => w.category));
    return Array.from(set) as Category[];
  }, [words]);

  return (
    <div id="vocabulary-view-container" className="space-y-4 sm:space-y-6 pb-12">
      {/* Search & Filter Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs space-y-3">
        {/* Search Input (Height 48px, Font 16px to prevent iOS Safari auto-zoom) */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="vocab-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm từ vựng (한국어, Tiếng Việt, English, Hán-Hàn, phiên âm)..."
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm font-medium text-slate-900 placeholder-slate-400 transition-colors"
          />
          {searchTerm && (
            <button
              id="clear-search-btn"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 active:bg-slate-200 cursor-pointer"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Switcher: Horizontal Swipeable on Mobile */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 hidden sm:inline">
              Cấp độ:
            </span>
            <button
              id="filter-level-all"
              onClick={() => setSelectedLevel('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95 select-none ${
                selectedLevel === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả ({words.length})
            </button>
            <button
              id="filter-level-beginner"
              onClick={() => setSelectedLevel('beginner')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95 select-none ${
                selectedLevel === 'beginner'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70'
              }`}
            >
              Sơ cấp ({words.filter((w) => w.level === 'beginner').length})
            </button>
            <button
              id="filter-level-intermediate"
              onClick={() => setSelectedLevel('intermediate')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95 select-none ${
                selectedLevel === 'intermediate'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/70'
              }`}
            >
              Trung cấp ({words.filter((w) => w.level === 'intermediate').length})
            </button>
            <button
              id="filter-level-advanced"
              onClick={() => setSelectedLevel('advanced')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95 select-none ${
                selectedLevel === 'advanced'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/70'
              }`}
            >
              Cao cấp ({words.filter((w) => w.level === 'advanced').length})
            </button>
          </div>
        </div>

        {/* Secondary controls row: Favorites filter, Category toggle & Layout switcher */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {/* Favorites filter toggle */}
            <button
              id="filter-favorites-toggle"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95 select-none ${
                onlyFavorites
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`} />
              <span>Đã lưu ({words.filter((w) => w.isFavorite).length})</span>
            </button>

            {/* Category toggle button */}
            <button
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className={`min-h-[36px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95 select-none ${
                selectedCategory !== 'all' || showCategoryFilter
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Chủ đề</span>
              {selectedCategory !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
          </div>

          {/* View Mode layout toggle (Grid / List) */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              id="view-mode-grid"
              onClick={() => setViewLayout('grid')}
              className={`min-w-[34px] min-h-[32px] p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                viewLayout === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Dạng lưới thẻ"
              aria-label="Xem dạng lưới"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewLayout('list')}
              className={`min-w-[34px] min-h-[32px] p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                viewLayout === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Dạng danh sách gọn"
              aria-label="Xem dạng danh sách"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Horizontal Pills (Expandable or when active) */}
        {showCategoryFilter && (
          <div className="pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả chủ đề
              </button>
              {categoriesInUse.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level description banner */}
        {selectedLevel !== 'all' && (
          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="font-bold text-slate-800">
                {LEVEL_LABELS[selectedLevel].label}:
              </span>{' '}
              <span className="text-slate-500">{LEVEL_LABELS[selectedLevel].sub}</span>
            </div>
            <button
              onClick={() => setSelectedLevel('all')}
              className="text-blue-600 hover:underline font-bold text-[11px] shrink-0 cursor-pointer"
            >
              Tất cả
            </button>
          </div>
        )}
      </div>

      {/* Vocabulary Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500">
          Hiển thị <span className="font-bold text-slate-800">{filteredWords.length}</span> từ vựng
          {selectedLevel !== 'all' && ` (${LEVEL_LABELS[selectedLevel].label.split(' ')[0]})`}
          {onlyFavorites && ' (yêu thích)'}
        </p>

        <button
          id="btn-add-word-inline"
          onClick={onOpenAddModal}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer py-1 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm từ mới</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredWords.length === 0 && (
        <div id="vocab-empty-state" className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Không tìm thấy từ vựng phù hợp
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Thử tìm kiếm với từ khóa khác hoặc thêm từ vựng mới vào bộ từ điển của bạn.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(searchTerm || selectedLevel !== 'all' || selectedCategory !== 'all' || onlyFavorites) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                  setSelectedCategory('all');
                  setOnlyFavorites(false);
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer active:scale-95"
              >
                Đặt lại bộ lọc
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95 shadow-sm"
            >
              Thêm từ vựng ngay
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout View (Mobile-First Card) */}
      {viewLayout === 'grid' && filteredWords.length > 0 && (
        <div id="vocab-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredWords.map((word) => {
            const levelInfo = LEVEL_LABELS[word.level];
            const isPlaying = playingId === word.id;

            return (
              <div
                key={word.id}
                id={`word-card-${word.id}`}
                onClick={() => onSelectWordDetail(word)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
              >
                <div>
                  {/* Card top badges & actions */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${levelInfo.badgeBg}`}>
                        {levelInfo.label.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 rounded bg-slate-100">
                        {CATEGORY_LABELS[word.category]}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      {/* Bookmark button */}
                      <button
                        onClick={() => onToggleFavorite(word.id)}
                        className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-90 ${
                          word.isFavorite
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={word.isFavorite ? 'Bỏ lưu' : 'Lưu từ'}
                        aria-label="Lưu từ yêu thích"
                      >
                        <Bookmark className={`w-4 h-4 ${word.isFavorite ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => onEditWord(word)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer active:scale-90"
                        title="Sửa từ"
                        aria-label="Chỉnh sửa từ vựng"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa từ "${word.hangul}" khỏi danh sách?`)) {
                            onDeleteWord(word.id);
                          }
                        }}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer active:scale-90"
                        title="Xóa từ"
                        aria-label="Xóa từ vựng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hangul, Romaja & Big Audio Button */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans group-hover:text-blue-600 transition-colors break-words">
                        {word.hangul}
                      </h4>
                      <p className="text-xs font-semibold text-blue-700 font-mono mt-0.5">
                        [{word.romaja}]
                      </p>
                    </div>

                    {/* Audio Play Button (Mobile Thumb Friendly: 44x44) */}
                    <button
                      id={`audio-play-${word.id}`}
                      onClick={(e) => handlePlayAudio(e, word)}
                      disabled={isPlaying}
                      className="min-w-[44px] min-h-[44px] rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-90"
                      title="Nghe phát âm"
                      aria-label="Nghe phát âm tiếng Hàn"
                    >
                      <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-blue-600' : ''}`} />
                    </button>
                  </div>

                  {/* Meanings */}
                  <div className="space-y-1 my-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 line-clamp-2">
                      🇻🇳 {word.vietnamese}
                    </p>
                    {word.hanja && (
                      <p className="text-[11px] text-emerald-800 font-semibold line-clamp-1">
                        🌸 {word.hanja}
                      </p>
                    )}
                    {word.english && word.english !== '—' && (
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">
                        🇬🇧 {word.english}
                        {word.partOfSpeech && (
                          <span className="text-[10px] ml-1 px-1 py-0.2 rounded bg-slate-200/60 text-slate-600 uppercase font-mono">
                            {word.partOfSpeech}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Example snippet if exists */}
                  {word.exampleKo && (
                    <div className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100/70 mb-2">
                      <span className="font-semibold text-slate-700 block truncate">
                        {word.exampleKo}
                      </span>
                      {word.exampleVi && (
                        <span className="text-[11px] text-slate-500 block truncate">
                          {word.exampleVi}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card footer: mastery status and detail link */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        word.masteryLevel === 2 
                          ? 'bg-emerald-500' 
                          : word.masteryLevel === 1 
                          ? 'bg-blue-500' 
                          : 'bg-slate-300'
                      }`} 
                    />
                    <span className="text-[11px] font-medium text-slate-600">
                      {word.masteryLevel === 2 ? 'Đã thuộc' : word.masteryLevel === 1 ? 'Đang ôn' : 'Mới học'}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Layout View (Mobile-First List) */}
      {viewLayout === 'list' && filteredWords.length > 0 && (
        <div id="vocab-cards-list" className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredWords.map((word) => {
            const levelInfo = LEVEL_LABELS[word.level];
            const isPlaying = playingId === word.id;

            return (
              <div
                key={word.id}
                onClick={() => onSelectWordDetail(word)}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer active:bg-slate-50"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={(e) => handlePlayAudio(e, word)}
                    disabled={isPlaying}
                    className="min-w-[42px] min-h-[42px] rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition-colors cursor-pointer flex items-center justify-center shrink-0 active:scale-90 mt-0.5 sm:mt-0"
                    title="Nghe phát âm"
                    aria-label="Nghe phát âm"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-blue-600' : ''}`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-extrabold text-slate-900 font-sans">
                        {word.hangul}
                      </h4>
                      <span className="text-xs font-mono text-blue-700 font-semibold">
                        [{word.romaja}]
                      </span>
                      <span className={`px-2 py-0.2 text-[10px] font-bold rounded border ${levelInfo.badgeBg}`}>
                        {levelInfo.label.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-slate-600 mt-0.5">
                      <span className="font-bold text-slate-900">🇻🇳 {word.vietnamese}</span>
                      {word.hanja && (
                        <span className="text-emerald-700 font-semibold text-[11px]">({word.hanja})</span>
                      )}
                      {word.english && word.english !== '—' && (
                        <span className="text-slate-500">🇬🇧 {word.english}</span>
                      )}
                      {word.partOfSpeech && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                          {word.partOfSpeech}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100">
                    {CATEGORY_LABELS[word.category]}
                  </span>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onToggleFavorite(word.id)}
                      className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-90 ${
                        word.isFavorite
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                      aria-label="Lưu từ yêu thích"
                    >
                      <Bookmark className={`w-4 h-4 ${word.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onEditWord(word)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer active:scale-90"
                      aria-label="Sửa từ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa từ "${word.hangul}"?`)) {
                          onDeleteWord(word.id);
                        }
                      }}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer active:scale-90"
                      aria-label="Xóa từ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
