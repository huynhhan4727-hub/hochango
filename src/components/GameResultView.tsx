import React, { useState } from 'react';
import { Word, GameMode } from '../types';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Star, 
  BookOpen, 
  Lightbulb, 
  Shuffle, 
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Layers,
  HelpCircle,
  BrainCircuit,
  Puzzle,
  Filter
} from 'lucide-react';
import { playKoreanAudio } from '../utils/speech';

export interface QuestionResultItem {
  id: string;
  word: Word;
  questionTitle: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  questionType?: 'ko-to-vi' | 'vi-to-ko' | 'matching' | 'fillblank' | 'flashcard';
}

interface GameResultViewProps {
  activeMode: GameMode;
  totalQuestions: number;
  score: number;
  incorrectWords: Word[];
  questionResults: QuestionResultItem[];
  practiceScope: 'daily' | 'all' | 'unmastered' | 'favorites';
  dailyStreak: number;
  onReplay: () => void;
  onNextDailyBatch?: () => void;
  onBackToMenu: () => void;
  onSelectWordDetail: (word: Word) => void;
  onPracticeWeakWords: (mode: GameMode, words: Word[]) => void;
  onToggleFavorite?: (id: string) => void;
}

export const GameResultView: React.FC<GameResultViewProps> = ({
  activeMode,
  totalQuestions,
  score,
  incorrectWords,
  questionResults,
  practiceScope,
  dailyStreak,
  onReplay,
  onNextDailyBatch,
  onBackToMenu,
  onSelectWordDetail,
  onPracticeWeakWords,
  onToggleFavorite,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [showWeakWordModeSelector, setShowWeakWordModeSelector] = useState(false);
  const [markedAllFavorites, setMarkedAllFavorites] = useState(false);

  const accuracyPercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Filtered question results
  const filteredResults = questionResults.filter((q) => {
    if (filterTab === 'incorrect') return !q.isCorrect;
    if (filterTab === 'correct') return q.isCorrect;
    return true;
  });

  // Mode display title
  const getModeTitle = (mode: GameMode) => {
    switch (mode) {
      case 'quiz': return 'Trắc nghiệm từ vựng';
      case 'matching': return 'Ghép thẻ từ vựng';
      case 'fillblank': return 'Sắp xếp & Điền từ Hangul';
      case 'flashcard': return 'Lật thẻ Flashcard siêu tốc';
      default: return 'Bài tập ôn luyện';
    }
  };

  // Performance rating message
  const getPerformanceRating = () => {
    if (accuracyPercent >= 90) {
      return {
        badge: 'Xuất sắc!',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        message: 'Bạn đã làm chủ hầu hết các từ vựng trong bài tập này. Trí nhớ phản xạ rất tuyệt vời!',
      };
    }
    if (accuracyPercent >= 70) {
      return {
        badge: 'Rất tốt!',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        message: 'Bạn nắm vững đa số từ vựng. Chỉ cần ôn lại vài từ chưa nhớ để đạt điểm tối đa.',
      };
    }
    if (accuracyPercent >= 50) {
      return {
        badge: 'Khá tốt!',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        message: 'Khởi đầu tích cực! Hãy dành thêm 2 phút ôn lại các từ chưa nhớ bên dưới để củng cố nhé.',
      };
    }
    return {
      badge: 'Cần luyện tập thêm!',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      message: 'Đừng nản lòng! Hãy xem kỹ phần đáp án chính xác bên dưới và bấm nút ôn tập lại ngay nhé.',
    };
  };

  const rating = getPerformanceRating();

  // Mark all weak words as favorite
  const handleMarkAllFavorites = () => {
    if (!onToggleFavorite) return;
    incorrectWords.forEach((w) => {
      if (!w.isFavorite) {
        onToggleFavorite(w.id);
      }
    });
    setMarkedAllFavorites(true);
  };

  return (
    <div id="game-results-card" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-sm space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto">
      {/* 1. TOP HEADER & CELEBRATION */}
      <div className="text-center max-w-lg mx-auto space-y-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-900 flex items-center justify-center mx-auto shadow-md transform hover:scale-105 transition-transform">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
        </div>

        <div className="pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {getModeTitle(activeMode)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hoàn thành bài tập!
          </h2>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${rating.color}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{rating.badge}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          {rating.message}
        </p>
      </div>

      {/* 2. STATS 4-GRID (Total, Correct, Incorrect, Accuracy) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-2xl mx-auto">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Tổng câu hỏi
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {totalQuestions}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
            Số câu đúng
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">
            {score}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-0.5">
            Số câu sai
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-700">
            {incorrectWords.length}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
            Chính xác
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-700">
            {accuracyPercent}%
          </span>
        </div>
      </div>

      {/* Streak Notification Banner */}
      <div className="max-w-2xl mx-auto p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="font-extrabold text-amber-900 block">
              Chuỗi học liên tục: {dailyStreak} ngày 🔥
            </span>
            <span className="text-[11px] text-amber-700">
              Mục tiêu bài tập ngày hôm nay đã hoàn thành xuất sắc!
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold shrink-0 hidden sm:inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Đã đạt chỉ tiêu
        </span>
      </div>

      {/* 3. SECTION: WEAK WORDS & INTELLIGENT REVIEW SUGGESTIONS */}
      {incorrectWords.length > 0 ? (
        <div className="max-w-3xl mx-auto rounded-3xl bg-rose-50/70 border border-rose-200/90 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-rose-950">
                  Danh sách từ vựng chưa ghi nhớ tốt ({incorrectWords.length} từ)
                </h3>
                <p className="text-[11px] text-rose-700">
                  Những từ cần củng cố lại để biến thành trí nhớ dài hạn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  onClick={handleMarkAllFavorites}
                  disabled={markedAllFavorites}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95 disabled:opacity-60"
                  title="Thêm tất cả các từ này vào danh sách Yêu thích để học lại sau"
                >
                  <Star className={`w-3.5 h-3.5 ${markedAllFavorites ? 'fill-amber-400 text-amber-400' : 'text-rose-500'}`} />
                  <span>{markedAllFavorites ? 'Đã thêm yêu thích ⭐' : 'Gắn sao tất cả từ yếu'}</span>
                </button>
              )}
            </div>
          </div>

          {/* SMART SYSTEM RECOMMENDATIONS BOX */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-rose-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Gợi ý lộ trình ôn tập lại cho các từ còn yếu:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                <span className="font-extrabold text-amber-900 block flex items-center gap-1">
                  <span>💡 1. Nghe & Lật thẻ Flashcard</span>
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Nghe phát âm chuẩn nhiều lần kết hợp xem nghĩa để não bộ ghi nhớ âm thanh và mặt chữ mà không bị áp lực.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-1">
                <span className="font-extrabold text-blue-900 block flex items-center gap-1">
                  <span>💡 2. Ghép âm tiết Hangul</span>
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Tập ghép từng âm tiết để khắc phục triệt để lỗi chính tả và các phụ âm cuối (patchim) khó nhớ.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-1">
                <span className="font-extrabold text-emerald-900 block flex items-center gap-1">
                  <span>💡 3. Làm lại Trắc nghiệm</span>
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Thử lại ngay với bài tập trắc nghiệm riêng cho nhóm từ này để kiểm tra xem bạn đã nhớ chắc chắn chưa.
                </p>
              </div>
            </div>

            {/* Quick Practice Weak Words Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Ôn tập ngay nhóm từ này bằng:</span>
              <button
                onClick={() => onPracticeWeakWords('flashcard', incorrectWords)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lật Flashcard</span>
              </button>

              <button
                onClick={() => onPracticeWeakWords('quiz', incorrectWords)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Làm Trắc nghiệm</span>
              </button>

              <button
                onClick={() => onPracticeWeakWords('fillblank', incorrectWords)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Sắp xếp âm tiết</span>
              </button>
            </div>
          </div>

          {/* List of Weak Words Cards */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">
              Chi tiết các từ vựng chưa nhớ:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {incorrectWords.map((word) => (
                <div 
                  key={word.id}
                  className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-2xs flex flex-col justify-between space-y-2 hover:border-rose-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-sans">
                          {word.hangul}
                        </span>
                        <span className="text-[11px] font-mono text-blue-600 font-semibold">
                          [{word.romaja}]
                        </span>
                        {word.hanja && (
                          <span className="text-[10px] text-slate-500 font-serif">
                            ({word.hanja})
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                        {word.vietnamese}
                      </p>
                      {word.english && (
                        <p className="text-[11px] text-slate-500">
                          🇬🇧 {word.english}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => playKoreanAudio(word.hangul)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(word.id)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-400 hover:text-amber-500 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                          title="Gắn sao yêu thích"
                        >
                          <Star className={`w-4 h-4 ${word.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Example sentence */}
                  {word.exampleKo && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                      <p className="font-medium text-slate-800">{word.exampleKo}</p>
                      <p className="text-slate-500">{word.exampleVi}</p>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onSelectWordDetail(word)}
                      className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tra cứu chi tiết & Từ điển Naver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-emerald-950">
            Không có từ vựng nào bị trả lời sai!
          </h3>
          <p className="text-xs text-emerald-700">
            Bạn đã ghi nhớ rất chính xác toàn bộ các từ trong lượt ôn tập này. Hãy tiếp tục duy trì phong độ nhé!
          </p>
        </div>
      )}

      {/* 4. SECTION: COMPLETE QUESTION BREAKDOWN & EXACT ANSWERS */}
      {questionResults.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>Đáp án chính xác & Xem lại từng câu</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {questionResults.length} câu
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Đối chiếu câu trả lời của bạn với đáp án chính xác của hệ thống
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({questionResults.length})
              </button>

              <button
                onClick={() => setFilterTab('incorrect')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  filterTab === 'incorrect' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                <span>Câu sai ({incorrectWords.length})</span>
              </button>

              <button
                onClick={() => setFilterTab('correct')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  filterTab === 'correct' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span>Câu đúng ({score})</span>
              </button>
            </div>
          </div>

          {/* Questions review items */}
          <div className="space-y-3">
            {filteredResults.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isCorrect
                    ? 'bg-white border-slate-200/90 hover:border-emerald-300'
                    : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Question Prompt and Answer comparison */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">
                        Câu {idx + 1}
                      </span>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                          <XCircle className="w-3 h-3 text-rose-600" /> Chưa chính xác
                        </span>
                      )}
                    </div>

                    {/* Word display & Question title */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => playKoreanAudio(item.word.hangul)}
                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center cursor-pointer active:scale-90 shrink-0"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-slate-900 font-sans">
                            {item.word.hangul}
                          </span>
                          <span className="text-xs font-mono text-blue-600 font-semibold">
                            [{item.word.romaja}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{item.word.vietnamese}</p>
                      </div>
                    </div>

                    {/* Answer Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {/* User's choice */}
                      <div className={`p-2.5 rounded-xl border ${
                        item.isCorrect 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : 'bg-rose-100/70 border-rose-300 text-rose-950'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 mb-0.5">
                          Lựa chọn của bạn:
                        </span>
                        <span className="font-extrabold break-words">{item.userAnswer}</span>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                          Đáp án chính xác:
                        </span>
                        <span className="font-extrabold break-words">{item.correctAnswer}</span>
                      </div>
                    </div>

                    {/* Context sentence */}
                    {item.word.exampleKo && (
                      <div className="pt-2 text-xs text-slate-600 bg-white/70 p-2 rounded-xl border border-slate-100">
                        <p className="font-semibold text-slate-800">🇰🇷 {item.word.exampleKo}</p>
                        <p className="text-slate-500">🇻🇳 {item.word.exampleVi}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Word detail quick button */}
                  <div className="shrink-0 flex sm:flex-col items-center gap-1.5 self-end sm:self-start">
                    <button
                      onClick={() => onSelectWordDetail(item.word)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      title="Xem chi tiết từ vựng"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BOTTOM NAVIGATION ACTIONS */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 max-w-2xl mx-auto">
        {practiceScope === 'daily' && onNextDailyBatch && (
          <button
            id="next-daily-batch-btn"
            onClick={onNextDailyBatch}
            className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            <span>Đổi 12 từ khác & Luyện tiếp</span>
          </button>
        )}

        <button
          id="replay-game-btn"
          onClick={onReplay}
          className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Chơi lại bài tập này</span>
        </button>

        <button
          id="back-to-game-menu-btn"
          onClick={onBackToMenu}
          className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center active:scale-95"
        >
          <span>Chọn bài tập khác</span>
        </button>
      </div>
    </div>
  );
};
