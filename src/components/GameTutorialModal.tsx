import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  VolumeX, 
  ChevronRight, 
  Sparkles, 
  Gamepad2, 
  Puzzle, 
  BrainCircuit, 
  Trophy, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Clock, 
  FastForward, 
  Rewind, 
  Subtitles, 
  MousePointer, 
  Check, 
  Lightbulb,
  Shuffle,
  Languages
} from 'lucide-react';
import { stopAllSpeech } from '../utils/speech';
import { GameMode } from '../types';

interface GameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: (mode: GameMode) => void;
}

interface SubtitleItem {
  time: number;
  textVi: string;
  textEn: string;
  koText?: string;
}

interface Chapter {
  id: number;
  timeStart: number; // in seconds
  timeEnd: number;
  title: string;
  shortDesc: string;
  gameMode?: GameMode;
  subtitles: SubtitleItem[];
}

const TOTAL_DURATION = 150; // 2 minutes 30 seconds

const CHAPTERS: Chapter[] = [
  {
    id: 0,
    timeStart: 0,
    timeEnd: 25,
    title: '1. Giao diện & Bộ từ đổi mới',
    shortDesc: 'Khám phá chuỗi ngày học Streak, mục tiêu ngày và bộ 12 từ vựng đổi mới mỗi ngày.',
    subtitles: [
      { 
        time: 0, 
        textVi: 'Chào mừng bạn đến với mục Trò chơi & Bài tập của Hango!', 
        textEn: 'Welcome to the Games & Exercises section of Hango!' 
      },
      { 
        time: 5, 
        textVi: 'Mỗi ngày hệ thống tự động chọn 12 từ vựng trọng tâm từ các chủ đề khác nhau.', 
        textEn: 'Every day, the system selects 12 core vocabulary words from various topics.' 
      },
      { 
        time: 12, 
        textVi: 'Bạn có thể nhấn nút "Đổi 12 từ khác" hoặc lọc theo cấp độ Sơ cấp, Trung cấp, Cao cấp.', 
        textEn: 'You can click "Shuffle 12 Words" or filter by Beginner, Intermediate, and Advanced levels.' 
      },
      { 
        time: 19, 
        textVi: 'Duy trì Chuỗi ngày học liên tục (Streak) bằng cách hoàn thành ít nhất 1 bài tập mỗi ngày.', 
        textEn: 'Maintain your daily learning Streak by completing at least one exercise every day.' 
      },
    ],
  },
  {
    id: 1,
    timeStart: 25,
    timeEnd: 55,
    title: '2. Trắc nghiệm 4 đáp án',
    shortDesc: 'Rèn luyện phản xạ dịch nghĩa nhanh 2 chiều giữa tiếng Hàn và tiếng Việt.',
    gameMode: 'quiz',
    subtitles: [
      { 
        time: 25, 
        textVi: 'Dạng 1: Trắc nghiệm phản xạ từ vựng với 10 câu hỏi mỗi lượt.', 
        textEn: 'Type 1: Vocabulary reflex quiz with 10 questions per practice round.' 
      },
      { 
        time: 30, 
        textVi: 'Quan sát từ tiếng Hàn và chọn nghĩa tiếng Việt đúng, hoặc ngược lại.', 
        textEn: 'Observe the Korean word and choose the correct Vietnamese meaning, or vice versa.', 
        koText: '안녕하세요' 
      },
      { 
        time: 38, 
        textVi: 'Chạm biểu tượng loa để nghe phát âm chuẩn của người bản xứ.', 
        textEn: 'Tap the speaker icon anytime to hear native Korean pronunciation.' 
      },
      { 
        time: 45, 
        textVi: 'Chọn đáp án đúng sẽ hiện màu xanh lá, nếu sai hệ thống lưu lại để ôn từ yếu.', 
        textEn: 'Correct answers highlight in green; incorrect ones are saved for weak word review.' 
      },
    ],
  },
  {
    id: 2,
    timeStart: 55,
    timeEnd: 85,
    title: '3. Ghép thẻ từ vựng',
    shortDesc: 'Thử thách trí nhớ bàn cờ với 6 cặp thẻ tiếng Hàn và tiếng Việt tương ứng.',
    gameMode: 'matching',
    subtitles: [
      { 
        time: 55, 
        textVi: 'Dạng 2: Ghép thẻ từ vựng trên bàn cờ tương tác gồm 12 thẻ.', 
        textEn: 'Type 2: Match vocabulary cards on an interactive 12-card board.' 
      },
      { 
        time: 61, 
        textVi: 'Nhiệm vụ của bạn là chạm 1 thẻ tiếng Hàn và 1 thẻ tiếng Việt có cùng ý nghĩa.', 
        textEn: 'Your task is to tap 1 Korean card and 1 Vietnamese card that share the same meaning.' 
      },
      { 
        time: 69, 
        textVi: 'Mỗi khi chạm thẻ tiếng Hàn, âm thanh phát âm vang lên giúp bạn ghi nhớ kép.', 
        textEn: 'Tapping a Korean card plays the pronunciation to reinforce audio-visual memory.' 
      },
      { 
        time: 76, 
        textVi: 'Ghép đúng thẻ sẽ đổi màu xanh và mờ đi. Hãy hoàn thành trong thời gian ngắn nhất!', 
        textEn: 'Matched pairs turn green and dim out. Try to complete the board in the fastest time!' 
      },
    ],
  },
  {
    id: 3,
    timeStart: 85,
    timeEnd: 110,
    title: '4. Sắp xếp âm tiết Hangul',
    shortDesc: 'Luyện tập chính tả, nhớ trật tự ghép các khối âm tiết tiếng Hàn chuẩn xác.',
    gameMode: 'fillblank',
    subtitles: [
      { 
        time: 85, 
        textVi: 'Dạng 3: Sắp xếp âm tiết Hangul giúp bạn nhớ chính xác mặt chữ và chính tả.', 
        textEn: 'Type 3: Hangul syllable unscrambling helps master spelling and character structure.' 
      },
      { 
        time: 92, 
        textVi: 'Hệ thống đưa ra nghĩa tiếng Việt và các âm tiết bị xáo trộn kèm âm gây nhiễu.', 
        textEn: 'The system gives the meaning and scrambled syllable blocks with distractors.' 
      },
      { 
        time: 99, 
        textVi: 'Nhấn vào từng âm tiết theo đúng trật tự từ trái qua phải, có nút Xóa để sửa.', 
        textEn: 'Tap each syllable in the correct left-to-right order; click Delete to undo.' 
      },
      { 
        time: 104, 
        textVi: 'Bấm "Kiểm tra đáp án" để xem kết quả và nghe phát âm chuẩn của từ vừa ghép.', 
        textEn: 'Click "Check Answer" to verify the result and hear the standard pronunciation.' 
      },
    ],
  },
  {
    id: 4,
    timeStart: 110,
    timeEnd: 130,
    title: '5. Flashcard lật thẻ siêu tốc',
    shortDesc: 'Phương pháp lặp lại ngắt quãng, tự đánh giá mức độ ghi nhớ của não bộ.',
    gameMode: 'flashcard',
    subtitles: [
      { 
        time: 110, 
        textVi: 'Dạng 4: Thẻ ghi nhớ Flashcard 3D giúp bạn tự ôn tập không áp lực thời gian.', 
        textEn: 'Type 4: 3D Flashcards let you review at your own pace without time pressure.' 
      },
      { 
        time: 116, 
        textVi: 'Mặt trước hiển thị chữ Hangul và phiên âm. Chạm vào thẻ để lật sang mặt sau xem nghĩa.', 
        textEn: 'Front side shows Hangul and Romaja. Tap the card to flip and view the meanings.' 
      },
      { 
        time: 122, 
        textVi: 'Tự đánh giá bằng cách nhấn "Đã thuộc" nếu nhớ tốt, hoặc "Chưa nhớ" để ôn lại sau.', 
        textEn: 'Self-assess by clicking "Mastered" if remembered, or "Needs Review" to practice later.' 
      },
    ],
  },
  {
    id: 5,
    timeStart: 130,
    timeEnd: 150,
    title: '6. Bảng kết quả & Ôn từ yếu',
    shortDesc: 'Theo dõi số câu đúng/sai, đối chiếu đáp án chính xác và nhận gợi ý ôn từ còn yếu.',
    subtitles: [
      { 
        time: 130, 
        textVi: 'Sau mỗi bài tập, bảng kết quả hiển thị chi tiết số câu đúng, câu sai và tỉ lệ chính xác.', 
        textEn: 'After each exercise, the results board shows correct/incorrect counts and accuracy %.' 
      },
      { 
        time: 137, 
        textVi: 'Bạn có thể xem lại chi tiết từng câu hỏi kèm đáp án chính xác và câu ví dụ minh họa.', 
        textEn: 'Review every question with exact answers, Hanja roots, and sample sentences.' 
      },
      { 
        time: 143, 
        textVi: 'Đặc biệt, hệ thống liệt kê các từ chưa nhớ tốt kèm gợi ý ôn tập và nút "Luyện tập lại ngay"!', 
        textEn: 'Weak vocabulary words are singled out with review tips and an instant Re-practice button!' 
      },
    ],
  },
];

export const GameTutorialModal: React.FC<GameTutorialModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'guide'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Guarantee all speech is stopped - Video is completely silent
  useEffect(() => {
    stopAllSpeech();
    return () => {
      stopAllSpeech();
    };
  }, [isOpen, activeTab]);

  const currentChapter = CHAPTERS.find(
    (ch) => currentTime >= ch.timeStart && currentTime < ch.timeEnd
  ) || CHAPTERS[0];

  // Active subtitle for current time
  const activeSubtitle = currentChapter.subtitles
    .slice()
    .reverse()
    .find((sub) => currentTime >= sub.time);

  // Auto-play timer (completely silent, no speech audio)
  useEffect(() => {
    if (!isOpen || activeTab !== 'video') return;

    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return Math.min(TOTAL_DURATION, prev + 1);
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed, activeTab]);

  // Handle Seek
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, newTime));
    setCurrentTime(clamped);
  };

  // Jump to Chapter
  const handleJumpToChapter = (chapter: Chapter) => {
    handleSeek(chapter.timeStart);
    setIsPlaying(true);
  };

  const handleStartPractice = (mode?: GameMode) => {
    stopAllSpeech();
    onClose();
    if (mode && onStartGame) {
      onStartGame(mode);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      id="game-tutorial-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="game-tutorial-modal-container"
        className="relative bg-white w-full max-w-4xl max-h-[94vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Video Hướng Dẫn Cho Người Mới Bắt Đầu
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                  <Languages className="w-3 h-3 text-blue-600" />
                  Phụ đề Tiếng Việt & Dịch Tiếng Anh
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
                  <VolumeX className="w-3 h-3 text-slate-500" />
                  Không có tiếng
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mô phỏng chân thực giao diện ứng dụng • Phụ đề song ngữ Tiếng Việt & Tiếng Anh
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: Video Walkthrough vs Quick Feature Guide */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => {
                setActiveTab('video');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Video mô phỏng giao diện ứng dụng</span>
            </button>

            <button
              onClick={() => {
                stopAllSpeech();
                setActiveTab('guide');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cẩm nang chức năng & Luật chơi</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="hidden md:inline">Đang chiếu:</span>
            <span className="font-extrabold text-blue-700 max-w-[240px] sm:max-w-none truncate">
              {currentChapter.title}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* TAB 1: REALISTIC APP WALKTHROUGH VIDEO SIMULATION */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              {/* Screen Mockup Container formatted like the actual Hango Application */}
              <div className="relative aspect-[16/10] sm:aspect-video w-full rounded-2xl sm:rounded-3xl bg-slate-900 overflow-hidden shadow-xl border-2 sm:border-4 border-slate-800 flex flex-col justify-between select-none">
                
                {/* 1. App Window Titlebar (macOS / Browser Mockup) */}
                <div className="bg-slate-900/95 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 pl-2 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                      <span>🔒 hango.app/tro-choi-bai-tap</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      <VolumeX className="w-3 h-3 text-slate-400" />
                      VIDEO KHÔNG TIẾNG
                    </span>
                    <span className="text-[10px] text-blue-300 font-bold px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-700">
                      VI & EN SUBTITLES
                    </span>
                  </div>
                </div>

                {/* 2. Mock Application Canvas (Exact replica of Hango app pastel canvas & header) */}
                <div className="relative flex-1 p-3 sm:p-5 flex flex-col justify-between overflow-hidden bg-slate-100 pastel-app-canvas">
                  
                  {/* Mock Hango Header Inside the App Window */}
                  <div className="bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200/80 px-3 py-1.5 flex items-center justify-between shadow-2xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 bg-clip-text text-transparent flex items-center gap-1">
                        <span>🇰🇷</span> Hango
                      </span>
                      <span className="hidden md:inline-block text-[10px] text-slate-400">• Học tiếng Hàn thông minh</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold text-slate-600">
                        <span className="px-2 py-0.5 rounded-md">Từ vựng (100)</span>
                        <span className="px-2 py-0.5 rounded-md bg-white text-red-600 shadow-2xs flex items-center gap-1">
                          <Gamepad2 className="w-3 h-3 text-red-500" />
                          <span>Trò chơi & Bài tập</span>
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white hidden sm:inline">
                        + Thêm từ
                      </span>
                    </div>
                  </div>

                  {/* 3. Screen Content Dynamically Rendered Based on Chapter */}
                  <div className="relative flex-1 flex flex-col justify-center items-center">
                    
                    {/* Chapter 0: App Overview & Daily Rotated Words */}
                    {currentChapter.id === 0 && (
                      <div className="w-full max-w-xl mx-auto space-y-2.5 animate-in fade-in duration-300">
                        {/* Header Banner */}
                        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 sm:p-4 text-white shadow-sm flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" /> Chuỗi 7 ngày liên tục
                            </div>
                            <h4 className="text-sm sm:text-base font-black">🎮 Trò chơi & Bài tập tương tác</h4>
                            <p className="text-[11px] text-blue-100">Ôn luyện 4 dạng bài, nhận diện từ nhanh gấp 3 lần</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-400 text-emerald-950 font-extrabold block">
                              Mục tiêu: 1/1 Xong
                            </span>
                          </div>
                        </div>

                        {/* Daily Rotated Vocab Card */}
                        <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-extrabold text-slate-800">
                                Bộ từ vựng trọng tâm hôm nay (12 từ)
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                                Tự động đổi mới
                              </span>
                            </div>
                            <button className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                              <Shuffle className="w-3 h-3 text-blue-600" /> Đổi 12 từ khác
                            </button>
                          </div>

                          {/* Level Filter Pills */}
                          <div className="flex items-center gap-1 text-[10px] font-bold pt-1">
                            <span className="text-slate-400">Lọc cấp độ:</span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white">Tất cả (12)</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Sơ cấp (8)</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Trung cấp (4)</span>
                          </div>
                        </div>

                        {/* Animated Cursor Pointer Simulation */}
                        <div className="absolute top-1/2 left-2/3 pointer-events-none animate-bounce">
                          <div className="flex items-center gap-1 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded-full shadow-lg font-bold">
                            <MousePointer className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>Bấm để đổi bộ từ vựng</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chapter 1: Quiz Mode Simulation (Exact App Quiz UI) */}
                    {currentChapter.id === 1 && (
                      <div className="w-full max-w-lg mx-auto space-y-2.5 animate-in fade-in duration-300">
                        {/* Quiz Header Bar */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-[11px]">
                              Câu hỏi 1 / 10
                            </span>
                            <span className="text-slate-500 font-semibold text-[11px]">Trắc nghiệm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-600 font-extrabold text-xs flex items-center gap-0.5">
                              <Flame className="w-3.5 h-3.5 fill-amber-500" /> Chuỗi 3
                            </span>
                            <span className="text-emerald-600 font-bold text-xs">Điểm: 100</span>
                          </div>
                        </div>

                        {/* Question Card */}
                        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-1 relative">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Chọn nghĩa tiếng Việt chính xác của từ:
                          </span>
                          <div className="flex items-center justify-center gap-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                              안녕하세요
                            </h3>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500">[an-nyeong-ha-se-yo]</p>
                        </div>

                        {/* 4 Choices Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                          <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-800 flex items-center justify-between shadow-2xs relative">
                            <span>A. Xin chào / Chào bạn</span>
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            {/* Simulated cursor on correct answer */}
                            <div className="absolute -top-3 -right-2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold shadow-md">
                              <MousePointer className="w-2.5 h-2.5 text-emerald-400" /> Đáp án đúng
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                            <span>B. Cảm ơn</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                            <span>C. Xin lỗi</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                            <span>D. Tạm biệt</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chapter 2: Matching Game Mode Simulation (Exact App Board UI) */}
                    {currentChapter.id === 2 && (
                      <div className="w-full max-w-lg mx-auto space-y-2 animate-in fade-in duration-300">
                        {/* Matching Header */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                            <Puzzle className="w-3.5 h-3.5 text-red-500" />
                            <span>Đã ghép: 1 / 6 cặp thẻ</span>
                          </span>
                          <span className="font-mono text-slate-500 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" /> 00:15
                          </span>
                        </div>

                        {/* Matching Cards Grid */}
                        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                          {/* Card 1: Selected Korean */}
                          <div className="p-2.5 rounded-xl bg-blue-600 text-white border-2 border-blue-700 shadow-sm text-center relative ring-2 ring-blue-300">
                            <span className="text-sm block">학교</span>
                            <span className="text-[9px] text-blue-200 font-mono">[hak-gyo]</span>
                          </div>

                          {/* Card 2: Selected Vietnamese */}
                          <div className="p-2.5 rounded-xl bg-blue-600 text-white border-2 border-blue-700 shadow-sm text-center flex flex-col justify-center ring-2 ring-blue-300">
                            <span className="text-xs block">Trường học</span>
                            <span className="text-[9px] text-blue-200 font-bold">✓ Cặp khớp!</span>
                          </div>

                          {/* Card 3: Already Matched pair */}
                          <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-800 opacity-60 text-center flex flex-col justify-center">
                            <span className="text-xs line-through">친구 (Bạn bè)</span>
                            <span className="text-[9px] text-emerald-700">Đã ghép xong</span>
                          </div>

                          {/* Unmatched Cards */}
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 text-center shadow-2xs">
                            <span className="text-xs block">선생님</span>
                            <span className="text-[9px] text-slate-400">Giáo viên</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 text-center shadow-2xs">
                            <span className="text-xs block">책</span>
                            <span className="text-[9px] text-slate-400">Sách</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 text-center shadow-2xs">
                            <span className="text-xs block">Gia đình</span>
                            <span className="text-[9px] text-slate-400">가족</span>
                          </div>
                        </div>

                        {/* Hint note */}
                        <p className="text-[10px] text-center text-slate-500 italic">
                          Chạm 1 thẻ tiếng Hàn và 1 thẻ nghĩa tiếng Việt tương ứng để nối thành cặp đúng!
                        </p>
                      </div>
                    )}

                    {/* Chapter 3: Fill-in-the-blank / Syllable Arranging (Exact App UI) */}
                    {currentChapter.id === 3 && (
                      <div className="w-full max-w-md mx-auto space-y-2.5 animate-in fade-in duration-300 text-center">
                        {/* Meaning Prompt Card */}
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <span className="font-extrabold flex items-center gap-1">
                            <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
                            Nghĩa: Cảm ơn (Trang trọng)
                          </span>
                          <span className="text-[10px] text-amber-700 font-mono">Thank you</span>
                        </div>

                        {/* Assembled Syllable Slots */}
                        <div className="p-3 bg-white rounded-2xl border-2 border-blue-500/80 shadow-xs flex items-center justify-center gap-2">
                          {['감', '사', '합', '니', '다'].map((syllable, idx) => (
                            <span
                              key={idx}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white font-black text-base sm:text-lg flex items-center justify-center shadow-xs"
                            >
                              {syllable}
                            </span>
                          ))}
                        </div>

                        {/* Scrambled Syllable Bank */}
                        <div className="flex justify-center gap-1.5 flex-wrap pt-1">
                          {['감', '사', '합', '니', '다', '고', '로'].map((s, idx) => (
                            <span
                              key={idx}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                idx < 5 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60' 
                                  : 'bg-white text-slate-700 border-slate-300 shadow-2xs'
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Bottom Buttons */}
                        <div className="flex justify-center gap-2 pt-1">
                          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold">
                            Xóa 1 ký tự
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3" /> Kiểm tra đáp án
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Chapter 4: Flashcard 3D Card (Exact App Flashcard UI) */}
                    {currentChapter.id === 4 && (
                      <div className="w-full max-w-sm mx-auto space-y-2.5 animate-in fade-in duration-300 text-center">
                        {/* 3D Flashcard Mockup */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-blue-400/90 shadow-md space-y-2 relative">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold">
                            Chạm thẻ để lật xem nghĩa
                          </span>
                          <h4 className="text-2xl sm:text-3xl font-black text-slate-900">사랑하다</h4>
                          <p className="text-xs font-mono text-slate-500">[sa-rang-ha-da]</p>
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-sm font-black text-blue-700">❤️ Yêu thương, yêu mến</p>
                            <p className="text-[11px] text-slate-500 italic">Ví dụ: 나는 너를 사랑해 (Tôi yêu bạn)</p>
                          </div>
                        </div>

                        {/* Rate buttons */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Chưa nhớ (Ôn lại)
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center gap-1 shadow-2xs relative">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Đã thuộc (+Mastery)
                            <div className="absolute -top-3 -right-2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold shadow-md">
                              <MousePointer className="w-2.5 h-2.5 text-emerald-400" /> Bấm để lưu
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chapter 5: Results & Weak Words List (Exact App GameResultView UI) */}
                    {currentChapter.id === 5 && (
                      <div className="w-full max-w-lg mx-auto space-y-2 animate-in fade-in duration-300">
                        {/* Trophy & Stats */}
                        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-extrabold text-slate-900">Hoàn thành bài tập!</h5>
                              <p className="text-[10px] text-slate-500">Đã lưu tiến độ học tập</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-center text-xs">
                            <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              Đúng: 8
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px]">
                              Sai: 2
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px]">
                              Chính xác: 80%
                            </div>
                          </div>
                        </div>

                        {/* Weak Words Box */}
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs space-y-1">
                          <div className="flex items-center justify-between text-rose-800 font-extrabold text-[11px]">
                            <span>⚠️ Danh sách 2 từ chưa ghi nhớ tốt:</span>
                            <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold">
                              Cần ôn tập
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-white border border-rose-200 text-slate-800 font-bold">
                              선생님 (Giáo viên)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white border border-rose-200 text-slate-800 font-bold">
                              어렵다 (Khó khăn)
                            </span>
                            <span className="text-blue-700 font-bold underline cursor-pointer text-[10px]">
                              [Xem đáp án chuẩn & giải thích]
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-center gap-2 pt-0.5">
                          <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                            <RotateCcw className="w-3 h-3" /> Luyện lại 2 từ yếu này
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3" /> Đổi 12 từ khác & Luyện tiếp
                          </span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* 4. Subtitle Bar in Video: VIETNAMESE + ENGLISH TRANSLATION */}
                  {showSubtitles && activeSubtitle && (
                    <div className="mt-2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 text-center animate-in fade-in duration-150 shadow-lg max-w-2xl mx-auto w-full">
                      {/* Vietnamese Subtitle */}
                      <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                        {activeSubtitle.textVi}
                        {activeSubtitle.koText && (
                          <span className="text-[11px] font-mono text-amber-300 font-bold ml-1.5 inline-block">
                            ({activeSubtitle.koText})
                          </span>
                        )}
                      </p>
                      {/* English Subtitle Translation */}
                      <p className="text-[11px] sm:text-xs text-blue-200 font-medium leading-snug italic mt-0.5 tracking-normal">
                        {activeSubtitle.textEn}
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Video Player Controls Bar (No Sound / Silent) */}
                <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex flex-col gap-1.5">
                  {/* Timeline Scrubber */}
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={TOTAL_DURATION}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Playback action buttons */}
                  <div className="flex items-center justify-between text-white text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Play/Pause */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-xs"
                        title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      {/* Rewind / Fast Forward 5s */}
                      <button
                        onClick={() => handleSeek(currentTime - 5)}
                        className="text-slate-400 hover:text-white cursor-pointer p-1"
                        title="Tua lại 5 giây"
                      >
                        <Rewind className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSeek(currentTime + 5)}
                        className="text-slate-400 hover:text-white cursor-pointer p-1"
                        title="Tua tới 5 giây"
                      >
                        <FastForward className="w-4 h-4" />
                      </button>

                      {/* Time display */}
                      <span className="font-mono text-slate-300 text-xs">
                        {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Silent Mode Indicator Badge */}
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                        <VolumeX className="w-3 h-3 text-slate-500" />
                        <span>Không có tiếng</span>
                      </span>

                      {/* Subtitles toggle */}
                      <button
                        onClick={() => setShowSubtitles(!showSubtitles)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                          showSubtitles ? 'bg-blue-600/40 text-blue-300 border border-blue-500/50' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Bật/Tắt phụ đề song ngữ Tiếng Việt & Tiếng Anh"
                      >
                        <Subtitles className="w-3.5 h-3.5" />
                        <span>Phụ đề VI / EN</span>
                      </button>

                      {/* Playback speed */}
                      <div className="flex items-center gap-1">
                        {[1, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              playbackSpeed === speed
                                ? 'bg-white/20 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      {/* Replay */}
                      <button
                        onClick={() => {
                          handleSeek(0);
                          setIsPlaying(true);
                        }}
                        className="text-slate-400 hover:text-white cursor-pointer p-1"
                        title="Xem lại từ đầu"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Selector Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Danh mục các chương trong video (Chạm để nhảy đến phần mong muốn):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {CHAPTERS.map((ch) => {
                    const isCurrent = ch.id === currentChapter.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleJumpToChapter(ch)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-blue-50/90 border-blue-400 shadow-xs ring-1 ring-blue-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-extrabold ${isCurrent ? 'text-blue-700' : 'text-slate-900'}`}>
                              {ch.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                              {formatTime(ch.timeStart)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {ch.shortDesc}
                          </p>
                        </div>

                        {ch.gameMode && (
                          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">Luyện tập ngay:</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartPractice(ch.gameMode);
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Bắt đầu dạng này</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FUNCTION MANUAL & GAME RULES */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold">Cẩm nang hướng dẫn chi tiết 4 dạng bài tập trong Hango:</p>
                  <p className="text-blue-800 text-[11px]">
                    Nắm vững luật chơi và cách thức hoạt động của từng dạng bài giúp bạn học từ vựng nhanh gấp 3 lần và duy trì chuỗi Streak mỗi ngày.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Trắc nghiệm */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Trắc nghiệm 4 phương án</h4>
                      <span className="text-[11px] text-slate-500">10 câu hỏi / lượt ôn tập</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Rèn luyện khả năng nhận diện nghĩa và phản xạ 2 chiều (Hàn - Việt / Việt - Hàn).</li>
                    <li>Có nút loa phát âm giọng bản xứ trước khi chọn đáp án.</li>
                    <li>Câu sai sẽ tự động đưa vào <b>"Danh sách từ vựng chưa nhớ"</b> để ôn tập lại sau.</li>
                  </ul>
                  <button
                    onClick={() => handleStartPractice('quiz')}
                    className="w-full mt-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Luyện tập Trắc nghiệm ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Ghép thẻ */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Ghép thẻ từ vựng</h4>
                      <span className="text-[11px] text-slate-500">6 cặp thẻ / bàn cờ</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Chạm 1 thẻ tiếng Hàn và 1 thẻ nghĩa tiếng Việt tương ứng.</li>
                    <li>Mỗi lần chọn thẻ Hangul đều phát âm chuẩn để ghi nhớ liên kết âm - nghĩa.</li>
                    <li>Có đồng hồ đếm giây để kích thích rèn luyện sự nhanh nhạy của mắt và trí nhớ.</li>
                  </ul>
                  <button
                    onClick={() => handleStartPractice('matching')}
                    className="w-full mt-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Luyện tập Ghép thẻ ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. Sắp xếp âm tiết */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Sắp xếp âm tiết Hangul</h4>
                      <span className="text-[11px] text-slate-500">Chính tả & Cấu trúc chữ</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Khắc phục triệt để lỗi viết sai chính tả và nhầm phụ âm cuối (patchim).</li>
                    <li>Chọn từng khối âm tiết theo đúng trật tự từ trái qua phải.</li>
                    <li>Nút "Xóa 1 ký tự" giúp bạn điều chỉnh nhanh khi bấm nhầm.</li>
                  </ul>
                  <button
                    onClick={() => handleStartPractice('fillblank')}
                    className="w-full mt-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Luyện tập Điền từ ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. Flashcard */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Flashcard lật thẻ siêu tốc</h4>
                      <span className="text-[11px] text-slate-500">Phương pháp ghi nhớ sâu</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Chạm vào thẻ để lật qua lại giữa chữ Hangul và nghĩa tiếng Việt + Anh.</li>
                    <li>Có câu ví dụ thực tế kèm bản dịch nghĩa để hiểu ngữ cảnh sử dụng.</li>
                    <li>Chủ động đánh giá "Đã thuộc" hoặc "Chưa nhớ" để nâng điểm ghi nhớ (Mastery).</li>
                  </ul>
                  <button
                    onClick={() => handleStartPractice('flashcard')}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Lật Flashcard ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Mỗi ngày ôn tập 5 - 10 phút để ghi nhớ từ vựng tiếng Hàn hiệu quả!</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                stopAllSpeech();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-200/60 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Đóng hướng dẫn
            </button>

            <button
              onClick={() => handleStartPractice('quiz')}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <span>Bắt đầu bài tập ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
