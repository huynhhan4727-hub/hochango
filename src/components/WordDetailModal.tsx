/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Word } from '../types';
import { LEVEL_LABELS, CATEGORY_LABELS } from '../data/initialVocab';
import { 
  X, 
  Volume2, 
  Bookmark, 
  Edit3, 
  Trash2, 
  Snail,
  BookOpen,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Languages
} from 'lucide-react';
import { playKoreanAudio } from '../utils/speech';
import { getHanjaAnalysis, getOnlineLookupUrls } from '../utils/bilingualLookup';

interface WordDetailModalProps {
  word: Word | null;
  onClose: () => void;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onChangeMastery: (id: string, level: number) => void;
}

type LangDetailView = 'vietnamese' | 'english' | 'both';

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onChangeMastery,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);
  const [viewMode, setViewMode] = useState<LangDetailView>('both');

  const hanjaAnalysis = useMemo(() => {
    if (!word) return { fullSinoVi: '', breakdown: [] };
    return getHanjaAnalysis(word.hangul);
  }, [word?.hangul]);

  const lookupUrls = useMemo(() => {
    if (!word) return { naverVi: '', naverEn: '', krdict: '' };
    return getOnlineLookupUrls(word.hangul);
  }, [word?.hangul]);

  if (!word) return null;

  const levelInfo = LEVEL_LABELS[word.level];
  const categoryName = CATEGORY_LABELS[word.category];

  const handlePlayWord = async (slow = false) => {
    if (slow) {
      setIsSlowPlaying(true);
      await playKoreanAudio(word.hangul, 0.6);
      setIsSlowPlaying(false);
    } else {
      setIsPlaying(true);
      await playKoreanAudio(word.hangul, 0.85);
      setIsPlaying(false);
    }
  };

  const handlePlaySentence = async () => {
    if (!word.exampleKo) return;
    setIsPlayingSentence(true);
    await playKoreanAudio(word.exampleKo, 0.85);
    setIsPlayingSentence(false);
  };

  return (
    <div 
      id="word-detail-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="word-detail-container"
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile top pull handle */}
        <div className="pt-2 sm:hidden flex justify-center bg-slate-50">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Top bar with level and actions */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${levelInfo.badgeBg}`}>
              {levelInfo.label.split(' ')[0]}
            </span>
            <span className="text-xs text-slate-600 font-medium px-2 py-0.5 rounded bg-slate-200/70">
              {categoryName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Bookmark */}
            <button
              id="detail-bookmark-btn"
              onClick={() => onToggleFavorite(word.id)}
              className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition-colors cursor-pointer active:scale-90 ${
                word.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={word.isFavorite ? 'Bỏ lưu từ này' : 'Lưu từ yêu thích'}
              aria-label="Lưu từ yêu thích"
            >
              <Bookmark className={`w-4 h-4 ${word.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Edit */}
            <button
              id="detail-edit-btn"
              onClick={() => {
                onClose();
                onEdit(word);
              }}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer active:scale-90"
              title="Chỉnh sửa từ này"
              aria-label="Chỉnh sửa từ này"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              id="detail-delete-btn"
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn xóa từ "${word.hangul}"?`)) {
                  onDelete(word.id);
                  onClose();
                }
              }}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer active:scale-90"
              title="Xóa từ vựng"
              aria-label="Xóa từ vựng"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer active:scale-90"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* Main Korean Word Banner & Audio */}
          <div className="text-center py-3 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border border-blue-100/70 p-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans mb-1 break-words">
              {word.hangul}
            </h2>
            <p className="text-sm font-semibold text-blue-700 tracking-wide font-mono">
              [{word.romaja}]
            </p>

            {/* Audio action buttons */}
            <div className="flex items-center justify-center gap-2.5 mt-3">
              <button
                id="play-normal-audio-btn"
                onClick={() => handlePlayWord(false)}
                disabled={isPlaying}
                className="min-h-[40px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                <span>Phát âm chuẩn</span>
              </button>

              <button
                id="play-slow-audio-btn"
                onClick={() => handlePlayWord(true)}
                disabled={isSlowPlaying}
                className="min-h-[40px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
              >
                <Snail className="w-4 h-4 text-slate-500" />
                <span>Đọc chậm</span>
              </button>
            </div>
          </div>

          {/* Language Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span>TRA CỨU THEO NGÔN NGỮ:</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('vietnamese')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'vietnamese'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                type="button"
                onClick={() => setViewMode('english')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'english'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'both'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🌐 Cả 2
              </button>
            </div>
          </div>

          {/* Distinct Language Sections */}
          <div className={`grid gap-3.5 ${viewMode === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* 🇻🇳 Mục Tiếng Việt */}
            {(viewMode === 'vietnamese' || viewMode === 'both') && (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🇻🇳</span>
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                      Mục Tiếng Việt
                    </h4>
                  </div>
                  <a
                    href={lookupUrls.naverVi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[28px] px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Naver Từ điển</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Vietnamese Meaning */}
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                    Nghĩa Tiếng Việt
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-slate-900">
                    {word.vietnamese}
                  </p>
                </div>

                {/* Sino-Vietnamese Hanja analysis */}
                {(word.hanja || hanjaAnalysis.breakdown.length > 0) && (
                  <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-200/80 text-xs space-y-1.5">
                    <div className="flex items-center gap-1 text-emerald-900 font-bold text-[11px]">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Gốc Hán - Hàn (Sino-Vietnamese):</span>
                    </div>
                    {word.hanja ? (
                      <p className="font-semibold text-emerald-800 text-xs">{word.hanja}</p>
                    ) : hanjaAnalysis.fullSinoVi ? (
                      <p className="font-semibold text-emerald-800 text-xs">
                        {hanjaAnalysis.fullSinoVi}
                      </p>
                    ) : null}

                    {hanjaAnalysis.breakdown.some(b => b.sinoVi !== '—') && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {hanjaAnalysis.breakdown
                          .filter(b => b.sinoVi !== '—')
                          .map((item, idx) => (
                            <span 
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px]"
                            >
                              <b>{item.syllable}</b>: {item.sinoVi} {item.hanzi ? `(${item.hanzi})` : ''}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Example sentence in Vietnamese */}
                {word.exampleVi && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                      Dịch câu ví dụ
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium">
                      {word.exampleVi}
                    </p>
                  </div>
                )}

                {/* Notes in Vietnamese */}
                {word.notes && (
                  <div className="pt-2 border-t border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                      Ghi chú ngữ pháp & mẹo nhớ
                    </span>
                    <p className="text-xs text-slate-700">
                      {word.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 🇬🇧 Mục Tiếng Anh */}
            {(viewMode === 'english' || viewMode === 'both') && (
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/20 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🇬🇧</span>
                    <h4 className="font-bold text-blue-950 text-xs sm:text-sm">
                      English Section
                    </h4>
                  </div>
                  <a
                    href={lookupUrls.naverEn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[28px] px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Naver English</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* English Definition */}
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                    English Meaning
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-slate-900">
                    {word.english && word.english !== '—' ? word.english : 'No English definition yet'}
                  </p>
                </div>

                {/* Part of Speech */}
                {word.partOfSpeech && (
                  <div className="bg-white/80 rounded-xl p-2 border border-blue-200/80 text-xs">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                      Part of Speech
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold capitalize text-xs">
                      {word.partOfSpeech}
                    </span>
                  </div>
                )}

                {/* English Example Translation */}
                {word.exampleEn && (
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                      English Example
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium italic">
                      "{word.exampleEn}"
                    </p>
                  </div>
                )}

                {/* English Notes */}
                {word.englishNotes && (
                  <div className="pt-2 border-t border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                      English Notes & Usage
                    </span>
                    <p className="text-xs text-slate-700">
                      {word.englishNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Korean Example sentence */}
          {word.exampleKo && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Câu ví dụ tiếng Hàn (한국어 예문)
                </span>
                <button
                  id="play-example-sentence-btn"
                  onClick={handlePlaySentence}
                  disabled={isPlayingSentence}
                  className="min-h-[30px] px-2 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingSentence ? 'animate-pulse' : ''}`} />
                  <span>Nghe câu mẫu</span>
                </button>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {word.exampleKo}
              </p>
            </div>
          )}

          {/* Mastery Level Status Selector */}
          <div className="pt-1 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Trạng thái ghi nhớ
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="mastery-lvl-0"
                onClick={() => onChangeMastery(word.id, 0)}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center text-center active:scale-95 ${
                  (word.masteryLevel ?? 0) === 0
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Mới học
              </button>
              <button
                type="button"
                id="mastery-lvl-1"
                onClick={() => onChangeMastery(word.id, 1)}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center text-center active:scale-95 ${
                  word.masteryLevel === 1
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Đang ôn tập
              </button>
              <button
                type="button"
                id="mastery-lvl-2"
                onClick={() => onChangeMastery(word.id, 2)}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center text-center active:scale-95 ${
                  word.masteryLevel === 2
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Đã thuộc lòng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
