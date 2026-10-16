/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Word, Level, Category } from '../types';
import { LEVEL_LABELS, CATEGORY_LABELS } from '../data/initialVocab';
import { 
  X, 
  Volume2, 
  Check, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Languages, 
  HelpCircle,
  ArrowRight,
  FileSpreadsheet,
  Edit3
} from 'lucide-react';
import { playKoreanAudio } from '../utils/speech';
import { 
  getHanjaAnalysis, 
  ENGLISH_PARTS_OF_SPEECH, 
  getOnlineLookupUrls 
} from '../utils/bilingualLookup';
import { ExcelImportSection } from './ExcelImportSection';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: Omit<Word, 'id'>, existingId?: string) => void;
  onBatchImport?: (words: Omit<Word, 'id'>[]) => void;
  initialWord?: Word | null;
  existingWords?: Word[];
}

type LangTab = 'vietnamese' | 'english' | 'both';
type EntryMode = 'manual' | 'excel';

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onBatchImport,
  initialWord,
  existingWords = [],
}) => {
  // Mode: Manual or Excel
  const [entryMode, setEntryMode] = useState<EntryMode>('manual');

  // Common Korean fields
  const [hangul, setHangul] = useState('');
  const [romaja, setRomaja] = useState('');
  const [level, setLevel] = useState<Level>('beginner');
  const [category, setCategory] = useState<Category>('daily');
  const [exampleKo, setExampleKo] = useState('');

  // 🇻🇳 Vietnamese specific section fields
  const [vietnamese, setVietnamese] = useState('');
  const [hanja, setHanja] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [notes, setNotes] = useState('');

  // 🇬🇧 English specific section fields
  const [english, setEnglish] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [exampleEn, setExampleEn] = useState('');
  const [englishNotes, setEnglishNotes] = useState('');

  // Active language tab (separate Vietnamese & English views or both)
  const [activeLangTab, setActiveLangTab] = useState<LangTab>('both');

  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setEntryMode('manual');
    if (initialWord) {
      setHangul(initialWord.hangul);
      setRomaja(initialWord.romaja);
      setLevel(initialWord.level);
      setCategory(initialWord.category);
      setExampleKo(initialWord.exampleKo || '');

      setVietnamese(initialWord.vietnamese || '');
      setHanja(initialWord.hanja || '');
      setExampleVi(initialWord.exampleVi || '');
      setNotes(initialWord.notes || '');

      setEnglish(initialWord.english === '—' ? '' : initialWord.english || '');
      setPartOfSpeech(initialWord.partOfSpeech || 'noun');
      setExampleEn(initialWord.exampleEn || '');
      setEnglishNotes(initialWord.englishNotes || '');
    } else {
      setHangul('');
      setRomaja('');
      setLevel('beginner');
      setCategory('daily');
      setExampleKo('');

      setVietnamese('');
      setHanja('');
      setExampleVi('');
      setNotes('');

      setEnglish('');
      setPartOfSpeech('noun');
      setExampleEn('');
      setEnglishNotes('');
    }
    setError('');
  }, [initialWord, isOpen]);

  // Real-time Sino-Vietnamese (Hán - Hàn) analysis for Vietnamese learners
  const hanjaAnalysis = useMemo(() => {
    return getHanjaAnalysis(hangul);
  }, [hangul]);

  // Online dictionary lookup URLs for the entered Korean word
  const lookupUrls = useMemo(() => {
    return getOnlineLookupUrls(hangul || '한국어');
  }, [hangul]);

  if (!isOpen) return null;

  const handleTestAudio = async () => {
    if (!hangul.trim()) return;
    setIsPlaying(true);
    await playKoreanAudio(hangul.trim());
    setIsPlaying(false);
  };

  const handleApplyHanja = (suggestion: string) => {
    setHanja(suggestion);
    if (!notes) {
      setNotes(`Hán Hàn: ${suggestion}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hangul.trim()) {
      setError('Vui lòng nhập từ tiếng Hàn (Hangul) / Please enter Korean word');
      return;
    }
    
    // Ensure at least one meaning (Vietnamese or English) is provided
    if (!vietnamese.trim() && !english.trim()) {
      setError('Vui lòng nhập ít nhất nghĩa tiếng Việt hoặc tiếng Anh / Please enter at least Vietnamese or English meaning');
      return;
    }

    onSave(
      {
        hangul: hangul.trim(),
        romaja: romaja.trim() || '—',
        vietnamese: vietnamese.trim() || english.trim(),
        english: english.trim() || vietnamese.trim(),
        level,
        category,
        exampleKo: exampleKo.trim(),
        exampleVi: exampleVi.trim(),
        exampleEn: exampleEn.trim(),
        notes: notes.trim(),
        hanja: hanja.trim(),
        partOfSpeech: partOfSpeech.trim(),
        englishNotes: englishNotes.trim(),
        masteryLevel: initialWord ? initialWord.masteryLevel : 0,
        isFavorite: initialWord ? initialWord.isFavorite : false,
      },
      initialWord?.id
    );
    onClose();
  };

  return (
    <div 
      id="word-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="word-modal-container"
        className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile pull indicator */}
        <div className="pt-2 sm:hidden flex justify-center bg-slate-50/80">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                {initialWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
              </h3>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {entryMode === 'excel'
                  ? 'Nhập hàng loạt từ file Excel kèm file mẫu chuẩn có sẵn'
                  : 'Phân chia riêng biệt mục Tiếng Việt & Tiếng Anh giúp tra cứu dễ dàng'}
              </p>
            </div>
          </div>
          <button
            id="close-word-modal-btn"
            onClick={onClose}
            className="min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer active:scale-90"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs: Manual Entry vs Excel Import (Only when adding new word) */}
        {!initialWord && (
          <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1">
              <button
                type="button"
                id="tab-mode-manual"
                onClick={() => setEntryMode('manual')}
                className={`flex-1 min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none ${
                  entryMode === 'manual'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Nhập thủ công</span>
              </button>
              <button
                type="button"
                id="tab-mode-excel"
                onClick={() => setEntryMode('excel')}
                className={`flex-1 min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none ${
                  entryMode === 'excel'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nhập từ Excel</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Có file mẫu
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Render Excel Import View or Manual Form */}
        {entryMode === 'excel' && !initialWord ? (
          <ExcelImportSection
            existingWords={existingWords}
            onBatchImport={onBatchImport}
            onClose={onClose}
            onSwitchToManual={() => setEntryMode('manual')}
          />
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* =========================================
              PHẦN CHUNG: TIẾNG HÀN (KOREAN CORE)
             ========================================= */}
          <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Từ vựng Tiếng Hàn (한국어)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Bắt buộc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Hangul Word */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Từ tiếng Hàn (Hangul) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-hangul"
                    type="text"
                    placeholder="Ví dụ: 사과, 친구, 노력하다..."
                    value={hangul}
                    onChange={(e) => {
                      setHangul(e.target.value);
                      setError('');
                    }}
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-slate-900 placeholder:font-normal"
                    required
                  />
                  <button
                    type="button"
                    id="test-audio-btn"
                    onClick={handleTestAudio}
                    disabled={!hangul.trim() || isPlaying}
                    title="Nghe phát âm chuẩn"
                    aria-label="Nghe phát âm chuẩn"
                    className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer active:scale-95 shadow-xs"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Romaja Pronunciation */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phiên âm (Romaja)
                </label>
                <input
                  id="input-romaja"
                  type="text"
                  placeholder="Ví dụ: sa-gwa, chin-gu..."
                  value={romaja}
                  onChange={(e) => setRomaja(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Level & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cấp độ (Level)
                </label>
                <select
                  id="select-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white text-slate-800 cursor-pointer"
                >
                  <option value="beginner">Sơ cấp (초급 - Beginner)</option>
                  <option value="intermediate">Trung cấp (중급 - Intermediate)</option>
                  <option value="advanced">Cao cấp (고급 - Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ đề (Category)
                </label>
                <select
                  id="select-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white text-slate-800 cursor-pointer"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, catName]) => (
                    <option key={catKey} value={catKey}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Korean Example sentence */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Câu ví dụ Tiếng Hàn (한국어 예문)
              </label>
              <input
                id="input-example-ko"
                type="text"
                placeholder="Ví dụ: 저는 매일 한국어를 공부해요."
                value={exampleKo}
                onChange={(e) => setExampleKo(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* ==========================================================
              CHIA 2 MỤC TIẾNG VIỆT & TIẾNG ANH RIÊNG BIỆT (LANGUAGE TABS)
             ========================================================== */}
          <div className="space-y-3">
            {/* Tab Selection Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Languages className="w-4 h-4 text-blue-600" />
                <span>MỤC TRA CỨU & NGHĨA SONG NGỮ:</span>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  id="tab-vietnamese-btn"
                  onClick={() => setActiveLangTab('vietnamese')}
                  className={`flex-1 sm:flex-initial min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeLangTab === 'vietnamese'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>🇻🇳</span>
                  <span>Mục Tiếng Việt</span>
                </button>

                <button
                  type="button"
                  id="tab-english-btn"
                  onClick={() => setActiveLangTab('english')}
                  className={`flex-1 sm:flex-initial min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeLangTab === 'english'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>Mục Tiếng Anh</span>
                </button>

                <button
                  type="button"
                  id="tab-both-btn"
                  onClick={() => setActiveLangTab('both')}
                  className={`flex-1 sm:flex-initial min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeLangTab === 'both'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Hiển thị song song cả 2 mục để đối chiếu"
                >
                  <span>🌐</span>
                  <span>Cả 2 mục</span>
                </button>
              </div>
            </div>

            {/* Language Content Grid / Panels */}
            <div className={`grid gap-4 ${activeLangTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* ========================================================
                  MỤC 1: TIẾNG VIỆT (DÀNH CHO NGƯỜI VIỆT TRA CỨU)
                 ======================================================== */}
              {(activeLangTab === 'vietnamese' || activeLangTab === 'both') && (
                <div 
                  id="section-vietnamese"
                  className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 p-3.5 sm:p-4 space-y-3 relative transition-all"
                >
                  {/* Section Title & Lookup Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇻🇳</span>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-sm">
                          Mục Tiếng Việt
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          Dành cho người Việt tra cứu nghĩa & âm Hán-Hàn
                        </p>
                      </div>
                    </div>

                    {/* Quick Online Dictionary Lookup for Vietnamese */}
                    <a
                      href={lookupUrls.naverVi}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở Từ điển Naver Hàn - Việt"
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Từ điển Naver</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* Sino-Vietnamese (Hán Hàn) Auto Assistant / Syllable Lookup */}
                  {hangul.trim() && hanjaAnalysis.breakdown.length > 0 && (
                    <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-200/80 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Tra cứu Hán - Hàn (gốc chữ Hán tương đương tiếng Việt):
                        </span>
                        {hanjaAnalysis.fullSinoVi && (
                          <button
                            type="button"
                            onClick={() => handleApplyHanja(hanjaAnalysis.fullSinoVi)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                          >
                            Áp dụng "{hanjaAnalysis.fullSinoVi}"
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {hanjaAnalysis.breakdown.map((item, idx) => (
                          <div 
                            key={idx}
                            className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-200/60 text-[11px]"
                            title={item.note}
                          >
                            <span className="font-bold text-emerald-800">{item.syllable}</span>
                            <ArrowRight className="w-2.5 h-2.5 inline mx-1 text-emerald-400" />
                            <span className="font-semibold text-emerald-900">{item.sinoVi}</span>
                            {item.hanzi && <span className="text-slate-400 text-[10px] ml-1">({item.hanzi})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vietnamese Meaning (Required for VN tab) */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Nghĩa tiếng Việt <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="input-vietnamese"
                      type="text"
                      placeholder="Ví dụ: Quả táo, Bạn bè, Nỗ lực..."
                      value={vietnamese}
                      onChange={(e) => {
                        setVietnamese(e.target.value);
                        setError('');
                      }}
                      className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  {/* Sino-Vietnamese Hanja Root */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1 flex items-center justify-between">
                      <span>Âm Hán Việt / Chữ Hán (nếu có)</span>
                      <span className="text-[10px] font-normal text-emerald-700">Rất hữu ích khi nhớ từ vựng</span>
                    </label>
                    <input
                      id="input-hanja"
                      type="text"
                      placeholder="Ví dụ: Học hiệu (學校), Gia tộc (家族)..."
                      value={hanja}
                      onChange={(e) => setHanja(e.target.value)}
                      className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>

                  {/* Vietnamese Example Translation */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">
                      Dịch câu ví dụ (Tiếng Việt)
                    </label>
                    <input
                      id="input-example-vi"
                      type="text"
                      placeholder="Ví dụ: Tôi thích ăn táo mỗi sáng."
                      value={exampleVi}
                      onChange={(e) => setExampleVi(e.target.value)}
                      className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>

                  {/* Vietnamese Notes & Grammar tips */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">
                      Ghi chú tiếng Việt (Ngữ pháp, từ đồng nghĩa, mẹo nhớ)
                    </label>
                    <input
                      id="input-notes-vi"
                      type="text"
                      placeholder="Ví dụ: Đi với tiểu từ 을/를, từ kính ngữ là..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================
                  MỤC 2: TIẾNG ANH (FOR ENGLISH LEARNERS & SPEAKERS)
                 ======================================================== */}
              {(activeLangTab === 'english' || activeLangTab === 'both') && (
                <div 
                  id="section-english"
                  className="rounded-2xl border-2 border-blue-200 bg-blue-50/20 p-3.5 sm:p-4 space-y-3 relative transition-all"
                >
                  {/* Section Title & Lookup Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇬🇧</span>
                      <div>
                        <h4 className="font-bold text-blue-950 text-sm">
                          Mục Tiếng Anh (English Section)
                        </h4>
                        <p className="text-[11px] text-blue-700">
                          For English speakers & international reference
                        </p>
                      </div>
                    </div>

                    {/* Quick Online Dictionary Lookup for English */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <a
                        href={lookupUrls.naverEn}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Naver English-Korean Dictionary"
                        className="min-h-[30px] px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Naver En</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <a
                        href={lookupUrls.krdict}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open National Institute of Korean Language English Learners Dictionary (KRDICT)"
                        className="min-h-[30px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>KRDICT</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* English Meaning / Definition */}
                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      English Definition / Meaning <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="input-english"
                      type="text"
                      placeholder="e.g. Apple, Friend, To make an effort..."
                      value={english}
                      onChange={(e) => {
                        setEnglish(e.target.value);
                        setError('');
                      }}
                      className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  {/* Part of Speech (Từ loại tiếng Anh) */}
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">
                      Part of Speech (Từ loại tiếng Anh)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ENGLISH_PARTS_OF_SPEECH.map((pos) => (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => setPartOfSpeech(pos.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            partOfSpeech === pos.value
                              ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
                          }`}
                        >
                          {pos.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* English Example Translation */}
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">
                      English Example Sentence Translation
                    </label>
                    <input
                      id="input-example-en"
                      type="text"
                      placeholder="e.g. I like eating apples every morning."
                      value={exampleEn}
                      onChange={(e) => setExampleEn(e.target.value)}
                      className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                    />
                  </div>

                  {/* English Notes / Synonyms / Collocations */}
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">
                      English Notes / Nuances / Synonyms
                    </label>
                    <input
                      id="input-notes-en"
                      type="text"
                      placeholder="e.g. Formal tone, synonyms: companion, buddy..."
                      value={englishNotes}
                      onChange={(e) => setEnglishNotes(e.target.value)}
                      className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pb-2">
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Người dùng có thể nhập riêng tiếng Việt hoặc tiếng Anh tùy nhu cầu tra cứu.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="cancel-modal-btn"
                onClick={onClose}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center active:scale-95"
              >
                Hủy
              </button>
              <button
                type="submit"
                id="submit-word-btn"
                className="flex-1 sm:flex-initial min-h-[42px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{initialWord ? 'Cập nhật từ vựng' : 'Lưu từ mới'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  </div>
);
};
