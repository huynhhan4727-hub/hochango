/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Word, ActiveTab } from './types';
import { INITIAL_VOCABULARY } from './data/initialVocab';
import { Header } from './components/Header';
import { VocabularyView } from './components/VocabularyView';
import { GamesView } from './components/GamesView';
import { WordModal } from './components/WordModal';
import { WordDetailModal } from './components/WordDetailModal';
import { RotateCcw, Check } from 'lucide-react';

const STORAGE_KEY = 'hango_vocab_list_v1';

export default function App() {
  // Load vocabulary from localStorage or seed
  const [words, setWords] = useState<Word[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any new initial seed words that the user doesn't have yet
          const existingIds = new Set(parsed.map((w: Word) => w.id));
          const missingSeeds = INITIAL_VOCABULARY.filter((w) => !existingIds.has(w.id));
          return missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    return INITIAL_VOCABULARY;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('vocabulary');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [detailWord, setDetailWord] = useState<Word | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (e) {
      console.error('Error writing localStorage', e);
    }
  }, [words]);

  // Add or Update Word
  const handleSaveWord = (wordData: Omit<Word, 'id'>, existingId?: string) => {
    if (existingId) {
      // Update
      setWords((prev) =>
        prev.map((w) => (w.id === existingId ? { ...wordData, id: existingId } : w))
      );
      if (detailWord && detailWord.id === existingId) {
        setDetailWord({ ...wordData, id: existingId });
      }
      showToast('Đã cập nhật từ vựng thành công!');
    } else {
      // Add
      const newWord: Word = {
        ...wordData,
        id: 'word_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      };
      setWords((prev) => [newWord, ...prev]);
      showToast(`Đã thêm từ "${newWord.hangul}" vào danh sách!`);
    }
    setEditingWord(null);
  };

  // Batch import words from Excel
  const handleBatchImportWords = (importedWords: Omit<Word, 'id'>[]) => {
    if (!importedWords.length) return;
    const timestamp = Date.now();
    const newWords: Word[] = importedWords.map((item, idx) => ({
      ...item,
      id: `word_${timestamp}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    }));
    setWords((prev) => [...newWords, ...prev]);
    showToast(`Đã thêm thành công ${newWords.length} từ vựng từ file Excel!`);
  };

  // Delete Word
  const handleDeleteWord = (id: string) => {
    const deleted = words.find((w) => w.id === id);
    setWords((prev) => prev.filter((w) => w.id !== id));
    if (detailWord && detailWord.id === id) {
      setDetailWord(null);
    }
    showToast(`Đã xóa từ "${deleted?.hangul || ''}"`);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setWords((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const updated = { ...w, isFavorite: !w.isFavorite };
          if (detailWord && detailWord.id === id) {
            setDetailWord(updated);
          }
          return updated;
        }
        return w;
      })
    );
  };

  // Change Mastery Level
  const handleChangeMastery = (id: string, masteryLevel: number) => {
    setWords((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const updated = { ...w, masteryLevel, lastReviewed: Date.now() };
          if (detailWord && detailWord.id === id) {
            setDetailWord(updated);
          }
          return updated;
        }
        return w;
      })
    );
  };

  // Reset to initial seed dataset
  const handleResetVocab = () => {
    if (window.confirm('Khôi phục danh sách từ vựng gốc của Hango? Các từ bạn đã tạo thêm sẽ được đặt lại.')) {
      setWords(INITIAL_VOCABULARY);
      showToast('Đã khôi phục bộ từ vựng mặc định!');
    }
  };

  return (
    <div id="hango-app-root" className="min-h-screen pastel-app-canvas text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Decorative Ambient Pastel Glows (Blue, Red, White) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Pastel Blue Glow (Top Left) */}
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-sky-200/45 blur-3xl" />
        {/* Pastel Red / Rose Glow (Top Right) */}
        <div className="absolute -top-16 -right-20 w-[440px] h-[440px] rounded-full bg-rose-200/40 blur-3xl" />
        {/* Pastel Baby Blue Glow (Mid Left) */}
        <div className="absolute top-1/2 -left-28 w-[400px] h-[400px] rounded-full bg-blue-100/50 blur-3xl" />
        {/* Pastel Coral / Blush Red Glow (Lower Right) */}
        <div className="absolute top-2/3 -right-24 w-[460px] h-[460px] rounded-full bg-red-100/50 blur-3xl" />
        {/* Center luminous milky white halo for contrast */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-white/70 blur-2xl" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="hango-toast"
          className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw]"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Top Navigation Tabs */}
      <div className="relative z-10">
        <Header
          words={words}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            setEditingWord(null);
            setIsAddModalOpen(true);
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-3.5 sm:pt-6">
        {activeTab === 'vocabulary' ? (
          <VocabularyView
            words={words}
            onOpenAddModal={() => {
              setEditingWord(null);
              setIsAddModalOpen(true);
            }}
            onEditWord={(word) => {
              setEditingWord(word);
              setIsAddModalOpen(true);
            }}
            onDeleteWord={handleDeleteWord}
            onSelectWordDetail={(word) => setDetailWord(word)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <GamesView
            words={words}
            onSelectWordDetail={(word) => setDetailWord(word)}
            onUpdateMastery={handleChangeMastery}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Footer with Reset option & Brand quote */}
        <footer className="mt-8 mb-8 text-center text-xs text-slate-400 py-6 border-t border-slate-200/80 space-y-2">
          <p className="font-medium text-slate-500">
            Hango – Học và Tiến lên • Mỗi ngày một chút, tiếng Hàn vững vàng
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px]">
            <span>🇰🇷 한국어</span>
            <span>•</span>
            <span>🇻🇳 Tiếng Việt</span>
            <span>•</span>
            <span>🇬🇧 English</span>
            <span>•</span>
            <button
              onClick={handleResetVocab}
              className="text-slate-500 hover:text-blue-600 underline flex items-center gap-1 cursor-pointer ml-1"
              title="Khôi phục danh sách từ ban đầu"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục từ gốc</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Word Add/Edit Modal */}
      <WordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingWord(null);
        }}
        onSave={handleSaveWord}
        onBatchImport={handleBatchImportWords}
        initialWord={editingWord}
        existingWords={words}
      />

      {/* Word Detail Modal */}
      <WordDetailModal
        word={detailWord}
        onClose={() => setDetailWord(null)}
        onEdit={(word) => {
          setEditingWord(word);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteWord}
        onToggleFavorite={handleToggleFavorite}
        onChangeMastery={handleChangeMastery}
      />
    </div>
  );
}
