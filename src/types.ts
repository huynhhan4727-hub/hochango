export type Level = 'beginner' | 'intermediate' | 'advanced';

export type Category = 
  | 'greeting' 
  | 'family' 
  | 'school' 
  | 'food' 
  | 'daily' 
  | 'work' 
  | 'emotion' 
  | 'travel' 
  | 'society' 
  | 'academic' 
  | 'idiom';

export interface Word {
  id: string;
  hangul: string; // Từ tiếng Hàn, ví dụ: 안녕하세요
  romaja: string; // Phát âm Romaja, ví dụ: an-nyeong-ha-se-yo
  vietnamese: string; // Nghĩa tiếng Việt, ví dụ: Xin chào
  english: string; // Nghĩa tiếng Anh, ví dụ: Hello / Hi
  level: Level; // Sơ cấp, Trung cấp, Cao cấp
  category: Category;
  exampleKo: string; // Câu ví dụ tiếng Hàn
  exampleVi: string; // Dịch ví dụ tiếng Việt
  exampleEn: string; // Dịch ví dụ tiếng Anh
  notes?: string; // Ghi chú ngữ pháp, từ đồng nghĩa/trái nghĩa tiếng Việt
  hanja?: string; // Âm Hán Hàn / Hán Việt hỗ trợ tra cứu cho người Việt (ví dụ: 學校 - Học hiệu)
  partOfSpeech?: string; // Từ loại (Noun, Verb, Adj... hỗ trợ người học tiếng Anh)
  englishNotes?: string; // Ghi chú, từ đồng nghĩa/ngữ pháp tiếng Anh
  isFavorite?: boolean;
  masteryLevel?: number; // 0: Mới học, 1: Đang ôn, 2: Đã nhớ
  lastReviewed?: number;
}

export type ActiveTab = 'vocabulary' | 'practice';

export type GameMode = 'quiz' | 'matching' | 'fillblank' | 'flashcard';

export interface QuizResult {
  total: number;
  correct: number;
  incorrectWords: Word[];
  date: number;
  mode: GameMode;
}
