import React, { useState, useMemo, useEffect } from 'react';
import { Word, Level, GameMode, QuizResult } from '../types';
import { LEVEL_LABELS, CATEGORY_LABELS } from '../data/initialVocab';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  Gamepad2, 
  BrainCircuit, 
  Layers, 
  Puzzle, 
  HelpCircle,
  Clock,
  ArrowLeft,
  Flame,
  BookOpen,
  Calendar,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  CheckCircle2,
  Play
} from 'lucide-react';
import { playKoreanAudio } from '../utils/speech';
import { 
  getTodayDateKey, 
  getFormattedTodayDateVi, 
  getDailyRotatedWords, 
  getDailyStreak, 
  recordDailyCompletion, 
  DailyStreakData 
} from '../utils/dailyVocab';
import { GameTutorialModal } from './GameTutorialModal';
import { GameResultView, QuestionResultItem } from './GameResultView';

interface GamesViewProps {
  words: Word[];
  onSelectWordDetail: (word: Word) => void;
  onUpdateMastery: (id: string, level: number) => void;
  onToggleFavorite?: (id: string) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  words,
  onSelectWordDetail,
  onUpdateMastery,
  onToggleFavorite,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [poolWords, setPoolWords] = useState<Word[]>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [questionResults, setQuestionResults] = useState<QuestionResultItem[]>([]);
  const [matchingSubsetWords, setMatchingSubsetWords] = useState<Word[]>([]);

  // Daily Rotating Vocabulary System State
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const formattedDateVi = useMemo(() => getFormattedTodayDateVi(), []);
  const [dailyShuffleOffset, setDailyShuffleOffset] = useState(0);
  const [practiceScope, setPracticeScope] = useState<'daily' | 'all' | 'unmastered' | 'favorites'>('daily');
  const [dailyStreakData, setDailyStreakData] = useState<DailyStreakData>(() => getDailyStreak());
  const [showDailyPreview, setShowDailyPreview] = useState(true);
  
  // Memorized count (masteryLevel === 2)
  const memorizedCount = useMemo(
    () => words.filter((w) => w.masteryLevel === 2).length,
    [words]
  );

  const unmasteredCount = useMemo(
    () => words.filter((w) => (w.masteryLevel ?? 0) < 2).length,
    [words]
  );

  const favoritesCount = useMemo(
    () => words.filter((w) => w.isFavorite).length,
    [words]
  );

  // Compute Daily Rotated Words (Intelligently varied across topics each calendar day)
  const dailyWords = useMemo(() => {
    return getDailyRotatedWords(words, todayDateKey, dailyShuffleOffset, 12, selectedLevel);
  }, [words, todayDateKey, dailyShuffleOffset, selectedLevel]);

  // Compute Active Practice Pool based on selected practice scope
  const activePracticePool = useMemo(() => {
    if (practiceScope === 'daily') {
      return dailyWords.length >= 4 ? dailyWords : words;
    }
    if (practiceScope === 'unmastered') {
      const unmastered = words.filter((w) => (w.masteryLevel ?? 0) < 2);
      const filtered = selectedLevel === 'all' ? unmastered : unmastered.filter((w) => w.level === selectedLevel);
      return filtered.length >= 4 ? filtered : (selectedLevel === 'all' ? words : words.filter((w) => w.level === selectedLevel));
    }
    if (practiceScope === 'favorites') {
      const favs = words.filter((w) => w.isFavorite);
      const filtered = selectedLevel === 'all' ? favs : favs.filter((w) => w.level === selectedLevel);
      return filtered.length >= 4 ? filtered : (selectedLevel === 'all' ? words : words.filter((w) => w.level === selectedLevel));
    }
    if (selectedLevel === 'all') return words;
    return words.filter((w) => w.level === selectedLevel);
  }, [practiceScope, dailyWords, words, selectedLevel]);
  
  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    targetWord: Word;
    options: string[];
    correctOption: string;
    questionType: 'ko-to-vi' | 'vi-to-ko';
  }>>([]);
  const [incorrectWords, setIncorrectWords] = useState<Word[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Matching Game State
  const [matchCards, setMatchCards] = useState<Array<{
    id: string;
    wordId: string;
    text: string;
    type: 'hangul' | 'meaning';
    isMatched: boolean;
  }>>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [matchTimer, setMatchTimer] = useState(0);
  const [isMatchOver, setIsMatchOver] = useState(false);

  // Fill in the Blank / Builder State
  const [fillAnswer, setFillAnswer] = useState('');
  const [scrambledSyllables, setScrambledSyllables] = useState<string[]>([]);
  const [fillFeedback, setFillFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Handle game finished and update streak
  const handleFinishExercise = () => {
    const updated = recordDailyCompletion();
    setDailyStreakData(updated);
    setShowResult(true);
  };

  // Start a game mode
  const startMode = (mode: GameMode, customWordList?: Word[]) => {
    const list = customWordList || activePracticePool;
    if (list.length < 4) {
      alert('Cần ít nhất 4 từ vựng trong danh mục này để bắt đầu bài tập.');
      return;
    }

    // Shuffle words
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setPoolWords(shuffled);
    setActiveMode(mode);
    setShowResult(false);
    setIncorrectWords([]);
    setQuestionResults([]);
    setCurrentIdx(0);
    setScore(0);
    setIsAnswerChecked(false);
    setSelectedOption(null);

    if (mode === 'quiz') {
      setupQuizQuestions(shuffled);
    } else if (mode === 'matching') {
      setupMatchingGame(shuffled);
    } else if (mode === 'fillblank') {
      setupFillBlank(shuffled, 0);
    } else if (mode === 'flashcard') {
      // flashcard uses poolWords directly
    }
  };

  // 1. SETUP QUIZ
  const setupQuizQuestions = (wordList: Word[]) => {
    const limit = Math.min(10, wordList.length);
    const selectedSubset = wordList.slice(0, limit);

    const questions = selectedSubset.map((targetWord) => {
      const isKoToVi = Math.random() > 0.3;
      const questionType: 'ko-to-vi' | 'vi-to-ko' = isKoToVi ? 'ko-to-vi' : 'vi-to-ko';

      // Pick 3 distractors
      const otherWords = words.filter((w) => w.id !== targetWord.id);
      const distractors = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);

      const correctOption = questionType === 'ko-to-vi' ? targetWord.vietnamese : targetWord.hangul;
      const wrongOptions = distractors.map((w) => (questionType === 'ko-to-vi' ? w.vietnamese : w.hangul));

      const options = [correctOption, ...wrongOptions].sort(() => 0.5 - Math.random());

      return {
        targetWord,
        options,
        correctOption,
        questionType,
      };
    });

    setQuizQuestions(questions);
  };

  // Handle Quiz Answer Selection
  const handleSelectQuizOption = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const currentQ = quizQuestions[currentIdx];
    const isCorrect = option === currentQ.correctOption;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Auto upgrade mastery slightly
      onUpdateMastery(currentQ.targetWord.id, 2);
    } else {
      setIncorrectWords((prev) => [...prev, currentQ.targetWord]);
      onUpdateMastery(currentQ.targetWord.id, 1);
    }

    // Record question result for detailed answer review
    setQuestionResults((prev) => [
      ...prev,
      {
        id: `quiz-${currentIdx}-${Date.now()}`,
        word: currentQ.targetWord,
        questionTitle: currentQ.questionType === 'ko-to-vi' 
          ? `Từ tiếng Hàn: ${currentQ.targetWord.hangul}` 
          : `Nghĩa tiếng Việt: ${currentQ.targetWord.vietnamese}`,
        userAnswer: option,
        correctAnswer: currentQ.correctOption,
        isCorrect,
        questionType: currentQ.questionType,
      },
    ]);

    // Play pronunciation of Korean word
    playKoreanAudio(currentQ.targetWord.hangul);
  };

  const handleNextQuiz = () => {
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      handleFinishExercise();
    }
  };

  // 2. SETUP MATCHING GAME
  const setupMatchingGame = (wordList: Word[]) => {
    const pickCount = Math.min(6, wordList.length);
    const subset = wordList.slice(0, pickCount);
    setMatchingSubsetWords(subset);

    const cards: Array<{
      id: string;
      wordId: string;
      text: string;
      type: 'hangul' | 'meaning';
      isMatched: boolean;
    }> = [];

    subset.forEach((w) => {
      cards.push({
        id: `card-ko-${w.id}`,
        wordId: w.id,
        text: w.hangul,
        type: 'hangul',
        isMatched: false,
      });
      cards.push({
        id: `card-vi-${w.id}`,
        wordId: w.id,
        text: w.vietnamese,
        type: 'meaning',
        isMatched: false,
      });
    });

    setMatchCards(cards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchScore(0);
    setMatchTimer(0);
    setIsMatchOver(false);
  };

  // Handle matching card click
  const handleCardClick = (cardId: string) => {
    if (selectedCards.includes(cardId)) return;
    if (selectedCards.length === 2) return;

    const targetCard = matchCards.find((c) => c.id === cardId);
    if (!targetCard || targetCard.isMatched) return;

    if (targetCard.type === 'hangul') {
      playKoreanAudio(targetCard.text);
    }

    const nextSelected = [...selectedCards, cardId];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      const [id1, id2] = nextSelected;
      const c1 = matchCards.find((c) => c.id === id1)!;
      const c2 = matchCards.find((c) => c.id === id2)!;

      if (c1.wordId === c2.wordId && c1.type !== c2.type) {
        // Match!
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) => (c.wordId === c1.wordId ? { ...c, isMatched: true } : c))
          );
          setSelectedCards([]);
          setMatchScore((prev) => prev + 10);

          // Check if all matched
          const remaining = matchCards.filter((c) => !c.isMatched && c.wordId !== c1.wordId);
          if (remaining.length === 0) {
            setIsMatchOver(true);
            // Record question results for each matched pair
            const results: QuestionResultItem[] = matchingSubsetWords.map((w) => {
              const wasIncorrect = incorrectWords.some((iw) => iw.id === w.id);
              return {
                id: `match-${w.id}-${Date.now()}`,
                word: w,
                questionTitle: `Ghép thẻ từ vựng: ${w.hangul} ↔ ${w.vietnamese}`,
                userAnswer: wasIncorrect ? 'Có lần ghép chưa đúng' : `Ghép chuẩn xác (${w.vietnamese})`,
                correctAnswer: `${w.hangul} = ${w.vietnamese}`,
                isCorrect: !wasIncorrect,
                questionType: 'matching',
              };
            });
            setQuestionResults(results);
            setScore(matchingSubsetWords.filter((w) => !incorrectWords.some((iw) => iw.id === w.id)).length);
            handleFinishExercise();
          }
        }, 400);
      } else {
        // No match: track mismatched words into incorrectWords
        const w1 = poolWords.find((w) => w.id === c1.wordId);
        const w2 = poolWords.find((w) => w.id === c2.wordId);
        setIncorrectWords((prev) => {
          const list = [...prev];
          if (w1 && !list.some((x) => x.id === w1.id)) list.push(w1);
          if (w2 && !list.some((x) => x.id === w2.id)) list.push(w2);
          return list;
        });

        setTimeout(() => {
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  // 3. SETUP FILL BLANK
  const setupFillBlank = (wordList: Word[], idx: number) => {
    const target = wordList[idx];
    if (!target) return;

    // Split target into characters/syllables and add some distractor syllables
    const realSyllables = target.hangul.split('');
    const commonDistractors = ['가', '다', '하', '고', '사', '물', '자', '신', '이', '기', '로', '에'];
    const randomDistractors = commonDistractors
      .filter((s) => !realSyllables.includes(s))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.max(3, 8 - realSyllables.length));

    const allSyllables = [...realSyllables, ...randomDistractors].sort(() => 0.5 - Math.random());

    setScrambledSyllables(allSyllables);
    setFillAnswer('');
    setFillFeedback(null);
  };

  const handleAppendSyllable = (s: string) => {
    if (fillFeedback) return;
    const next = fillAnswer + s;
    setFillAnswer(next);
  };

  const handleBackspaceFill = () => {
    if (fillFeedback) return;
    setFillAnswer((prev) => prev.slice(0, -1));
  };

  const handleCheckFillBlank = () => {
    const target = poolWords[currentIdx];
    if (!target) return;

    const isCorrect = fillAnswer.trim() === target.hangul.trim();
    if (isCorrect) {
      setFillFeedback('correct');
      setScore((prev) => prev + 1);
      playKoreanAudio(target.hangul);
    } else {
      setFillFeedback('wrong');
      setIncorrectWords((prev) => [...prev, target]);
    }

    // Record question result
    setQuestionResults((prev) => [
      ...prev,
      {
        id: `fill-${currentIdx}-${Date.now()}`,
        word: target,
        questionTitle: `Ghép từ Hangul có nghĩa: "${target.vietnamese}"`,
        userAnswer: fillAnswer.trim() || '(Để trống)',
        correctAnswer: target.hangul,
        isCorrect,
        questionType: 'fillblank',
      },
    ]);
  };

  const handleNextFillBlank = () => {
    if (currentIdx + 1 < Math.min(10, poolWords.length)) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setupFillBlank(poolWords, nextIdx);
    } else {
      handleFinishExercise();
    }
  };

  // 4. FLASHCARD SPRINT
  const [isFlipped, setIsFlipped] = useState(false);

  const handleRateFlashcard = (remembered: boolean) => {
    const target = poolWords[currentIdx];
    if (!remembered) {
      setIncorrectWords((prev) => [...prev, target]);
      onUpdateMastery(target.id, 1);
    } else {
      setScore((prev) => prev + 1);
      onUpdateMastery(target.id, 2);
    }

    // Record question result
    setQuestionResults((prev) => [
      ...prev,
      {
        id: `flash-${currentIdx}-${Date.now()}`,
        word: target,
        questionTitle: `Thẻ từ: ${target.hangul} [${target.romaja}]`,
        userAnswer: remembered ? 'Đã thuộc làu' : 'Chưa nhớ rõ',
        correctAnswer: `${target.hangul}: ${target.vietnamese}`,
        isCorrect: remembered,
        questionType: 'flashcard',
      },
    ]);

    setIsFlipped(false);
    if (currentIdx + 1 < Math.min(10, poolWords.length)) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleFinishExercise();
    }
  };

  // Timer for matching game
  useEffect(() => {
    let timer: any;
    if (activeMode === 'matching' && !isMatchOver && !showResult) {
      timer = setInterval(() => setMatchTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeMode, isMatchOver, showResult]);

  return (
    <div id="games-view-container" className="space-y-6 pb-12">
      {/* MODE SELECTION SCREEN (When no active game or wanting to change) */}
      {!activeMode && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Ôn tập thông minh & Vui nhộn
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
                Trò chơi & Bài tập củng cố
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Biến việc học từ vựng thành thói quen mỗi ngày với các dạng bài tập tương tác, giúp ghi nhớ sâu từ vựng tiếng Hàn nhanh chóng.
              </p>
            </div>

            {/* Decorative background badges */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white font-extrabold text-8xl sm:text-9xl select-none pointer-events-none">
              한국
            </div>
          </div>

          {/* VIDEO TUTORIAL FOR BEGINNERS BANNER */}
          <div 
            id="beginner-tutorial-banner"
            className="group relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl border border-indigo-500/40 p-4 sm:p-6 shadow-md overflow-hidden text-white transition-all hover:border-indigo-400"
          >
            {/* Background glowing aura */}
            <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 text-blue-300 text-xs font-bold border border-blue-400/30">
                    <Play className="w-3.5 h-3.5 fill-blue-300" />
                    Video Hướng Dẫn Cho Người Mới Bắt Đầu (2 phút)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <span>🔇 Không tiếng • Phụ đề Tiếng Việt & Tiếng Anh</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                  Làm quen giao diện, hiểu luật chơi & làm chủ 4 dạng bài tập cùng Hango
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Video mô phỏng sinh động cách chơi từng dạng bài (Trắc nghiệm, Ghép thẻ, Điền từ, Flashcard), hướng dẫn sử dụng nút phát âm, đổi bộ từ mới và đối chiếu đáp án chính xác để ôn tập từ còn yếu.
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300/80 flex-wrap">
                  <span>✔ Nhận diện giao diện</span>
                  <span>•</span>
                  <span>✔ Luật 4 trò chơi</span>
                  <span>•</span>
                  <span>✔ Cách dùng các nút</span>
                  <span>•</span>
                  <span>✔ Bảng kết quả & Đáp án chuẩn</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center gap-2.5 shrink-0">
                <button
                  id="open-video-tutorial-btn"
                  onClick={() => setIsTutorialOpen(true)}
                  className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all group-hover:scale-[1.02]"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                  <span>Xem video hướng dẫn</span>
                </button>

                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/15 cursor-pointer text-center transition-colors"
                >
                  Cẩm nang luật chơi
                </button>
              </div>
            </div>
          </div>

          {/* Level Filter for Practice (2-column on mobile, flex on desktop) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Chọn cấp độ ôn luyện:
              </span>
              {selectedLevel !== 'all' && (
                <button
                  onClick={() => setSelectedLevel('all')}
                  className="text-xs text-blue-600 font-semibold sm:hidden hover:underline cursor-pointer"
                >
                  Xem tất cả
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                id="practice-level-all"
                onClick={() => setSelectedLevel('all')}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95 select-none ${
                  selectedLevel === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tất cả từ ({words.length})
              </button>
              <button
                id="practice-level-beginner"
                onClick={() => setSelectedLevel('beginner')}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95 select-none ${
                  selectedLevel === 'beginner'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70'
                }`}
              >
                Sơ cấp ({words.filter((w) => w.level === 'beginner').length})
              </button>
              <button
                id="practice-level-intermediate"
                onClick={() => setSelectedLevel('intermediate')}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95 select-none ${
                  selectedLevel === 'intermediate'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/70'
                }`}
              >
                Trung cấp ({words.filter((w) => w.level === 'intermediate').length})
              </button>
              <button
                id="practice-level-advanced"
                onClick={() => setSelectedLevel('advanced')}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95 select-none ${
                  selectedLevel === 'advanced'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/70'
                }`}
              >
                Cao cấp ({words.filter((w) => w.level === 'advanced').length})
              </button>
            </div>
          </div>

          {/* Daily Rotating Vocabulary Showcase & Practice Scope Selector */}
          <div
            id="daily-vocab-rotation-card"
            className="bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-blue-200/90 p-4 sm:p-6 shadow-xs space-y-4"
          >
            {/* Top header row with Date and Shuffle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-900 text-xs font-black">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    {formattedDateVi}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Đổi mới mỗi ngày
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Bộ từ vựng trọng tâm hôm nay ({dailyWords.length} từ)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  Mỗi ngày hệ thống tự động chọn lọc 12 từ vựng đa dạng từ các chủ đề (Ẩm thực, Giao thông, Công việc, Đời sống, Cảm xúc...) giúp việc luyện tập luôn phong phú và không nhàm chán.
                </p>
              </div>

              {/* Shuffle button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="shuffle-daily-vocab-btn"
                  onClick={() => setDailyShuffleOffset((prev) => prev + 1)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                  title="Xáo trộn sang bộ 12 từ khác cho hôm nay"
                >
                  <Shuffle className="w-4 h-4 text-blue-600" />
                  <span>Đổi bộ từ khác</span>
                  {dailyShuffleOffset > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-200/80 text-[10px] font-extrabold text-blue-900">
                      +{dailyShuffleOffset}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowDailyPreview((prev) => !prev)}
                  className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title={showDailyPreview ? 'Thu gọn danh sách từ' : 'Xem danh sách từ hôm nay'}
                >
                  <span>{showDailyPreview ? 'Thu gọn' : 'Xem từ'}</span>
                  {showDailyPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Scope selector tabs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Nguồn từ vựng áp dụng cho bài tập:
              </span>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <button
                  id="scope-tab-daily"
                  onClick={() => setPracticeScope('daily')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    practiceScope === 'daily'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bộ từ hôm nay ({dailyWords.length})</span>
                </button>

                <button
                  id="scope-tab-all"
                  onClick={() => setPracticeScope('all')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    practiceScope === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Toàn bộ từ ({words.length})</span>
                </button>

                <button
                  id="scope-tab-unmastered"
                  onClick={() => setPracticeScope('unmastered')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    practiceScope === 'unmastered'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Cần ôn tập ({unmasteredCount})</span>
                </button>

                <button
                  id="scope-tab-favorites"
                  onClick={() => setPracticeScope('favorites')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    practiceScope === 'favorites'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Yêu thích ({favoritesCount})</span>
                </button>
              </div>
            </div>

            {/* Daily Vocabulary Preview Chips (Visible when expanded) */}
            {showDailyPreview && (
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Danh sách 12 từ của hôm nay:</span>
                  <span className="text-[11px] text-slate-500 font-medium">Bấm vào loa để nghe phát âm</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                  {dailyWords.map((word) => (
                    <div
                      key={word.id}
                      className="group bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 rounded-xl p-2.5 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {word.hangul}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{word.romaja}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5" title={word.vietnamese}>
                          {word.vietnamese}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playKoreanAudio(word.hangul);
                          }}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-blue-100 text-slate-600 hover:text-blue-700 border border-slate-200 flex items-center justify-center cursor-pointer shadow-2xs active:scale-90 transition-all"
                          title="Phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin theo dõi việc học di chuyển xuống dưới vị trí "Chọn cấp độ ôn luyện" (Widget Grid on Mobile) */}
          <div
            id="learning-progress-tracker"
            className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs space-y-2.5"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Theo dõi việc học & Chuỗi ngày:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {/* Streak badge: Chuỗi học thực tế */}
              <div
                id="streak-indicator-badge"
                className="flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs sm:text-sm font-semibold shadow-xs"
                title="Chuỗi ngày học tập chăm chỉ"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100/90 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-amber-600 font-bold uppercase leading-none mb-0.5">Chuỗi ngày học</div>
                  <span className="font-extrabold truncate block">
                    {dailyStreakData.currentStreak} ngày liên tục
                  </span>
                </div>
              </div>

              {/* Mục tiêu hoàn thành hôm nay */}
              <div
                id="daily-goal-status-badge"
                className={`flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-xs ${
                  dailyStreakData.completedToday
                    ? 'bg-emerald-50 border-emerald-200/90 text-emerald-900'
                    : 'bg-indigo-50 border-indigo-200/90 text-indigo-900'
                }`}
                title="Mục tiêu bài tập mỗi ngày"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  dailyStreakData.completedToday ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {dailyStreakData.completedToday ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-[10px] font-bold uppercase leading-none mb-0.5 ${
                    dailyStreakData.completedToday ? 'text-emerald-600' : 'text-indigo-600'
                  }`}>
                    Mục tiêu hôm nay
                  </div>
                  <span className="font-extrabold truncate block">
                    {dailyStreakData.completedToday ? 'Đã hoàn thành 🎉' : 'Chưa hoàn thành (0/1)'}
                  </span>
                </div>
              </div>

              {/* Words count: từ đã thuộc */}
              <div
                id="words-stats-pill"
                className="flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-xl bg-blue-50 border border-blue-200/90 text-blue-900 text-xs sm:text-sm font-semibold shadow-xs"
                title="Từ vựng đã thuộc"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100/90 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-blue-600 font-bold uppercase leading-none mb-0.5">Đã thuộc làu</div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold whitespace-nowrap">{memorizedCount}/{words.length}</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                      {words.length > 0 ? Math.round((memorizedCount / words.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Interactive Game Mode Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-blue-600" />
                Chọn dạng bài tập ({activePracticePool.length} từ khả dụng):
              </span>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Đang dùng: <span className="font-bold text-blue-600">{practiceScope === 'daily' ? '🌟 Bộ từ hôm nay' : practiceScope === 'unmastered' ? '⚡ Cần ôn tập' : practiceScope === 'favorites' ? '⭐ Yêu thích' : '📚 Toàn bộ từ'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            {/* Mode 1: Trắc nghiệm 4 đáp án */}
            <div 
              id="start-mode-quiz"
              onClick={() => startMode('quiz')}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Trắc nghiệm từ vựng
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Phổ biến
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Chọn đáp án chính xác giữa tiếng Hàn và tiếng Việt trong 4 phương án. Rèn luyện phản xạ nhanh chóng.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">10 câu hỏi / lượt</span>
                <span className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
                  Bắt đầu <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Mode 2: Ghép thẻ từ vựng */}
            <div 
              id="start-mode-matching"
              onClick={() => startMode('matching')}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-red-400 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
            >
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                  <Puzzle className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                    Ghép thẻ từ vựng
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                    Thử thách
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3 sm:mb-4">
                  Ghép đôi thẻ tiếng Hàn với nghĩa tiếng Việt tương ứng trên bàn cờ. Thử thách trí nhớ và tốc độ.
                </p>
              </div>
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">6 cặp thẻ / lượt</span>
                <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95">
                  Luyện tập <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Mode 3: Điền từ & Sắp xếp ký tự */}
            <div 
              id="start-mode-fillblank"
              onClick={() => startMode('fillblank')}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
            >
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Sắp xếp & Điền từ Hangul
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Chính tả
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3 sm:mb-4">
                  Nhìn nghĩa và chọn ghép các âm tiết tiếng Hàn theo đúng trật tự. Giúp nhớ chắc chắn mặt chữ.
                </p>
              </div>
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">10 từ vựng / lượt</span>
                <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-600 group-hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95">
                  Bắt đầu <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Mode 4: Flashcard phản xạ */}
            <div 
              id="start-mode-flashcard"
              onClick={() => startMode('flashcard')}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
            >
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Lật thẻ Flashcard siêu tốc
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ôn nhanh
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3 sm:mb-4">
                  Lật thẻ xem nghĩa, nghe phát âm và tự đánh giá mức độ ghi nhớ: "Đã thuộc" hoặc "Cần xem lại".
                </p>
              </div>
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tự ôn tập tự do</span>
                <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95">
                  Lật thẻ <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* RESULT & SUMMARY SCREEN USING GameResultView */}
      {showResult && activeMode && (
        <GameResultView
          activeMode={activeMode}
          totalQuestions={
            activeMode === 'matching'
              ? matchingSubsetWords.length
              : questionResults.length > 0
                ? questionResults.length
                : Math.min(10, poolWords.length)
          }
          score={score}
          incorrectWords={incorrectWords}
          questionResults={questionResults}
          practiceScope={practiceScope}
          dailyStreak={dailyStreakData.currentStreak}
          onReplay={() => startMode(activeMode)}
          onNextDailyBatch={
            practiceScope === 'daily'
              ? () => {
                  setDailyShuffleOffset((prev) => prev + 1);
                  startMode(activeMode);
                }
              : undefined
          }
          onBackToMenu={() => {
            setActiveMode(null);
            setShowResult(false);
          }}
          onSelectWordDetail={onSelectWordDetail}
          onPracticeWeakWords={(mode, weakWords) => {
            startMode(mode, weakWords);
          }}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* GAMEPLAY: MODE 1 - TRẮC NGHIỆM */}
      {activeMode === 'quiz' && !showResult && quizQuestions.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Top navigation within game */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveMode(null)}
              className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát</span>
            </button>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
              Câu {currentIdx + 1} / {quizQuestions.length}
            </span>

            <span className="text-xs font-bold text-emerald-600">
              Đúng: {score}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Prompt */}
          <div className="text-center py-4 sm:py-6 bg-slate-50/80 rounded-2xl border border-slate-100 p-3 sm:p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {quizQuestions[currentIdx].questionType === 'ko-to-vi'
                ? 'Nghĩa tiếng Việt của từ này là gì?'
                : 'Từ tiếng Hàn tương ứng với nghĩa này:'}
            </span>

            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans break-words">
                {quizQuestions[currentIdx].questionType === 'ko-to-vi'
                  ? quizQuestions[currentIdx].targetWord.hangul
                  : quizQuestions[currentIdx].targetWord.vietnamese}
              </h2>

              {quizQuestions[currentIdx].questionType === 'ko-to-vi' && (
                <button
                  onClick={() => playKoreanAudio(quizQuestions[currentIdx].targetWord.hangul)}
                  className="min-w-[40px] min-h-[40px] rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer flex items-center justify-center active:scale-90"
                  title="Nghe lại"
                  aria-label="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {quizQuestions[currentIdx].questionType === 'ko-to-vi' && (
              <p className="text-xs font-mono text-blue-600 font-semibold mt-1">
                [{quizQuestions[currentIdx].targetWord.romaja}]
              </p>
            )}
          </div>

          {/* 4 Options Grid (Easy Thumb Tapping: min-h-[52px]) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {quizQuestions[currentIdx].options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === quizQuestions[currentIdx].correctOption;

              let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800';
              if (isAnswerChecked) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  id={`quiz-opt-${idx}`}
                  onClick={() => handleSelectQuizOption(opt)}
                  disabled={isAnswerChecked}
                  className={`min-h-[52px] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left font-medium text-sm transition-all cursor-pointer flex items-center justify-between active:scale-[0.98] ${btnStyle}`}
                >
                  <span className="leading-snug">{opt}</span>
                  {isAnswerChecked && isCorrectOpt && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next button once answered */}
          {isAnswerChecked && (
            <div className="pt-2 sm:pt-4 flex justify-end animate-in fade-in duration-200">
              <button
                id="next-quiz-question-btn"
                onClick={handleNextQuiz}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{currentIdx + 1 < quizQuestions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAMEPLAY: MODE 2 - GHÉP THẺ (MATCHING) */}
      {activeMode === 'matching' && !showResult && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveMode(null)}
              className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát</span>
            </button>

            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian: {matchTimer}s</span>
            </div>

            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Điểm: {matchScore}
            </span>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Nhấn vào một thẻ tiếng Hàn và thẻ nghĩa tiếng Việt tương ứng để ghép cặp.
            </p>
          </div>

          {/* Matching Cards Grid (2-cols on mobile, 3 on sm, 4 on md) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {matchCards.map((card) => {
              const isSelected = selectedCards.includes(card.id);
              const isMatched = card.isMatched;

              let cardStyle = 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-400 shadow-2xs';
              if (isMatched) {
                cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-40 pointer-events-none';
              } else if (isSelected) {
                cardStyle = 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400 font-bold';
              }

              return (
                <button
                  key={card.id}
                  id={`match-card-${card.id}`}
                  onClick={() => handleCardClick(card.id)}
                  disabled={isMatched}
                  className={`min-h-[72px] sm:h-24 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center text-center transition-all cursor-pointer active:scale-95 select-none ${cardStyle}`}
                >
                  <span className={`text-xs sm:text-base leading-snug ${card.type === 'hangul' ? 'font-extrabold font-sans text-base sm:text-lg' : 'font-medium'}`}>
                    {card.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAMEPLAY: MODE 3 - ĐIỀN TỪ & SẮP XẾP */}
      {activeMode === 'fillblank' && !showResult && poolWords[currentIdx] && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-xs max-w-xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveMode(null)}
              className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát</span>
            </button>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
              Từ {currentIdx + 1} / {Math.min(10, poolWords.length)}
            </span>

            <span className="text-xs font-bold text-emerald-600">
              Đúng: {score}
            </span>
          </div>

          {/* Meaning Prompt */}
          <div className="text-center py-4 sm:py-5 bg-amber-50/50 rounded-2xl border border-amber-100 p-3 sm:p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
              Ghép từ tiếng Hàn có nghĩa:
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {poolWords[currentIdx].vietnamese}
            </h3>
            {poolWords[currentIdx].english && (
              <p className="text-xs text-slate-500 mt-0.5">
                ({poolWords[currentIdx].english})
              </p>
            )}
          </div>

          {/* User Built Word Display */}
          <div className="flex items-center justify-center min-h-[56px] sm:min-h-[64px] p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 tracking-widest text-2xl sm:text-3xl font-extrabold text-blue-700 font-sans break-words">
            {fillAnswer || (
              <span className="text-slate-300 font-normal text-xs sm:text-sm tracking-normal text-center">
                Nhấn các âm tiết bên dưới để ghép từ...
              </span>
            )}
          </div>

          {/* Syllable pool buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {scrambledSyllables.map((syl, i) => (
              <button
                key={i}
                onClick={() => handleAppendSyllable(syl)}
                disabled={!!fillFeedback}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-base sm:text-lg font-bold text-slate-800 shadow-2xs hover:shadow transition-all active:scale-90 cursor-pointer select-none"
              >
                {syl}
              </button>
            ))}
          </div>

          {/* Controls: Backspace & Check */}
          <div className="flex items-center justify-between gap-2.5 pt-2">
            <button
              onClick={handleBackspaceFill}
              disabled={!fillAnswer || !!fillFeedback}
              className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
            >
              Xóa 1 ký tự
            </button>

            {!fillFeedback ? (
              <button
                onClick={handleCheckFillBlank}
                disabled={!fillAnswer.trim()}
                className="min-h-[44px] px-5 sm:px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <button
                onClick={handleNextFillBlank}
                className="min-h-[44px] px-5 sm:px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Feedback banner */}
          {fillFeedback && (
            <div className={`p-3 sm:p-3.5 rounded-xl text-xs font-bold text-center border ${
              fillFeedback === 'correct'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              {fillFeedback === 'correct'
                ? '🎉 Chính xác!'
                : `❌ Chưa chính xác! Đáp án đúng là: ${poolWords[currentIdx].hangul}`}
            </div>
          )}
        </div>
      )}

      {/* GAMEPLAY: MODE 4 - FLASHCARD SPRINT */}
      {activeMode === 'flashcard' && !showResult && poolWords[currentIdx] && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-xs max-w-md mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveMode(null)}
              className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát</span>
            </button>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              Thẻ {currentIdx + 1} / {Math.min(10, poolWords.length)}
            </span>
          </div>

          {/* 3D Flippable Card */}
          <div
            id="flashcard-interactive"
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[260px] sm:min-h-[300px] p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-blue-50/50 to-white border-2 border-blue-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center relative select-none active:scale-[0.99]"
          >
            <span className="absolute top-3.5 right-3.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {isFlipped ? 'Mặt sau (Nghĩa)' : 'Mặt trước (Chạm để lật)'}
            </span>

            {!isFlipped ? (
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans break-words">
                  {poolWords[currentIdx].hangul}
                </h2>
                <p className="text-sm font-mono text-blue-600 font-semibold">
                  [{poolWords[currentIdx].romaja}]
                </p>
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playKoreanAudio(poolWords[currentIdx].hangul);
                    }}
                    className="min-w-[44px] min-h-[44px] rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer inline-flex items-center justify-center active:scale-90"
                    title="Nghe phát âm"
                    aria-label="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nghĩa của từ:
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {poolWords[currentIdx].vietnamese}
                </h3>
                {poolWords[currentIdx].english && (
                  <p className="text-xs sm:text-sm text-slate-500">
                    🇬🇧 {poolWords[currentIdx].english}
                  </p>
                )}
                {poolWords[currentIdx].exampleKo && (
                  <div className="pt-2.5 text-xs text-slate-600 max-w-xs border-t border-slate-100 mt-2">
                    <p className="font-semibold text-slate-800">{poolWords[currentIdx].exampleKo}</p>
                    <p className="text-slate-500">{poolWords[currentIdx].exampleVi}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Self-Rating Buttons (Touch Friendly: min-h-[48px]) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              id="flashcard-need-review-btn"
              onClick={() => handleRateFlashcard(false)}
              className="min-h-[48px] py-2.5 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <XCircle className="w-4 h-4" />
              <span>Chưa nhớ</span>
            </button>
            <button
              id="flashcard-mastered-btn"
              onClick={() => handleRateFlashcard(true)}
              className="min-h-[48px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Đã thuộc</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Tutorial Video Modal for Beginners */}
      <GameTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartGame={(mode) => {
          setIsTutorialOpen(false);
          startMode(mode);
        }}
      />
    </div>
  );
};
