import * as XLSX from 'xlsx';
import { Word, Level, Category } from '../types';
import { CATEGORY_LABELS } from '../data/initialVocab';

export interface ParsedExcelWord {
  word: Omit<Word, 'id'>;
  isValid: boolean;
  isDuplicate: boolean;
  errorMessage?: string;
  rowNumber: number;
}

// Sample dataset for template download
const SAMPLE_TEMPLATE_ROWS = [
  {
    'Từ tiếng Hàn (Hangul)*': '행복하다',
    'Phiên âm (Romaja)': 'haeng-bok-ha-da',
    'Nghĩa tiếng Việt*': 'Hạnh phúc, vui sướng',
    'Nghĩa tiếng Anh (English)': 'To be happy',
    'Cấp độ (Level)': 'Sơ cấp',
    'Chủ đề (Category)': 'Cảm xúc',
    'Hán Hàn / Hanja': 'Hạnh phúc (幸福)',
    'Từ loại (Part of Speech)': 'Adjective',
    'Ví dụ tiếng Hàn (Example Ko)': '가족과 함께 있어서 정말 행복해요.',
    'Dịch ví dụ tiếng Việt (Example Vi)': 'Ở bên gia đình tôi cảm thấy thật hạnh phúc.',
    'Dịch ví dụ tiếng Anh (Example En)': 'I am really happy being with my family.',
    'Ghi chú (Notes)': 'Từ trái nghĩa: 불행하다 (bất hạnh)'
  },
  {
    'Từ tiếng Hàn (Hangul)*': '도서관',
    'Phiên âm (Romaja)': 'do-seo-gwan',
    'Nghĩa tiếng Việt*': 'Thư viện',
    'Nghĩa tiếng Anh (English)': 'Library',
    'Cấp độ (Level)': 'Sơ cấp',
    'Chủ đề (Category)': 'Trường học',
    'Hán Hàn / Hanja': 'Đồ thư quán (圖書館)',
    'Từ loại (Part of Speech)': 'Noun',
    'Ví dụ tiếng Hàn (Example Ko)': '주말에 도서관에서 책을 빌렸어요.',
    'Dịch ví dụ tiếng Việt (Example Vi)': 'Tôi đã mượn sách ở thư viện vào cuối tuần.',
    'Dịch ví dụ tiếng Anh (Example En)': 'I borrowed books from the library on the weekend.',
    'Ghi chú (Notes)': 'Gốc Hán: Đồ (bản đồ/sách) - Thư (sách) - Quán (tòa nhà)'
  },
  {
    'Từ tiếng Hàn (Hangul)*': '커피',
    'Phiên âm (Romaja)': 'keo-pi',
    'Nghĩa tiếng Việt*': 'Cà phê',
    'Nghĩa tiếng Anh (English)': 'Coffee',
    'Cấp độ (Level)': 'Sơ cấp',
    'Chủ đề (Category)': 'Ẩm thực',
    'Hán Hàn / Hanja': '',
    'Từ loại (Part of Speech)': 'Noun',
    'Ví dụ tiếng Hàn (Example Ko)': '아침마다 따뜻한 커피를 마셔요.',
    'Dịch ví dụ tiếng Việt (Example Vi)': 'Mỗi buổi sáng tôi đều uống cà phê ấm.',
    'Dịch ví dụ tiếng Anh (Example En)': 'I drink warm coffee every morning.',
    'Ghi chú (Notes)': 'Từ mượn tiếng Anh'
  },
  {
    'Từ tiếng Hàn (Hangul)*': '출장',
    'Phiên âm (Romaja)': 'chul-jjang',
    'Nghĩa tiếng Việt*': 'Chuyến công tác',
    'Nghĩa tiếng Anh (English)': 'Business trip',
    'Cấp độ (Level)': 'Trung cấp',
    'Chủ đề (Category)': 'Công việc',
    'Hán Hàn / Hanja': 'Xuất trương (出張)',
    'Từ loại (Part of Speech)': 'Noun',
    'Ví dụ tiếng Hàn (Example Ko)': '다음 주에 서울로 출장을 가요.',
    'Dịch ví dụ tiếng Việt (Example Vi)': 'Tuần tới tôi đi công tác ở Seoul.',
    'Dịch ví dụ tiếng Anh (Example En)': 'I am going on a business trip to Seoul next week.',
    'Ghi chú (Notes)': 'Thường đi với động cơ: 출장을 가다 (đi công tác)'
  },
  {
    'Từ tiếng Hàn (Hangul)*': '경험하다',
    'Phiên âm (Romaja)': 'gyeong-heom-ha-da',
    'Nghĩa tiếng Việt*': 'Trải nghiệm, kinh nghiệm',
    'Nghĩa tiếng Anh (English)': 'To experience',
    'Cấp độ (Level)': 'Trung cấp',
    'Chủ đề (Category)': 'Đời sống',
    'Hán Hàn / Hanja': 'Kinh nghiệm (經驗)',
    'Từ loại (Part of Speech)': 'Verb',
    'Ví dụ tiếng Hàn (Example Ko)': '한국 문화를 직접 경험하고 싶어요.',
    'Dịch ví dụ tiếng Việt (Example Vi)': 'Tôi muốn trực tiếp trải nghiệm văn hóa Hàn Quốc.',
    'Dịch ví dụ tiếng Anh (Example En)': 'I want to experience Korean culture firsthand.',
    'Ghi chú (Notes)': 'Danh từ: 경험 (kinh nghiệm/trải nghiệm)'
  },
  {
    'Từ tiếng Hàn (Hangul)*': '다양성',
    'Phiên âm (Romaja)': 'da-yang-seong',
    'Nghĩa tiếng Việt*': 'Tính đa dạng',
    'Nghĩa tiếng Anh (English)': 'Diversity',
    'Cấp độ (Level)': 'Cao cấp',
    'Chủ đề (Category)': 'Xã hội',
    'Hán Hàn / Hanja': 'Đa dạng tính (多樣性)',
    'Từ loại (Part of Speech)': 'Noun',
    'Ví dụ tiếng Hàn (Example Ko)': '문화적 다양성을 존중하는 사회가 되어야 한다.',
    'Dịch ví dụ tiếng Việt (Example Vi)': 'Cần phải trở thành một xã hội tôn trọng sự đa dạng văn hóa.',
    'Dịch ví dụ tiếng Anh (Example En)': 'We must become a society that respects cultural diversity.',
    'Ghi chú (Notes)': 'Hậu tố -성 (-tính) tạo danh từ trừu tượng'
  }
];

const GUIDE_SHEET_ROWS = [
  { 'Mục': 'Cột bắt buộc (*)', 'Mô tả & Giá trị hợp lệ': 'Cần điền tối thiểu cột "Từ tiếng Hàn (Hangul)" và một trong hai cột nghĩa ("Nghĩa tiếng Việt" hoặc "Nghĩa tiếng Anh").' },
  { 'Mục': 'Cấp độ (Level)', 'Mô tả & Giá trị hợp lệ': 'Điền một trong các giá trị: Sơ cấp (hoặc beginner), Trung cấp (hoặc intermediate), Cao cấp (hoặc advanced). Mặc định là Sơ cấp.' },
  { 'Mục': 'Chủ đề (Category)', 'Mô tả & Giá trị hợp lệ': 'Điền tên chủ đề như: Chào hỏi, Gia đình, Trường học, Ẩm thực, Đời sống, Công việc, Cảm xúc, Du lịch, Xã hội, Học thuật, Thành ngữ (hoặc mã tiếng Anh: greeting, family, school, food, daily, work, emotion, travel, society, academic, idiom).' },
  { 'Mục': 'Hán Hàn / Hanja', 'Mô tả & Giá trị hợp lệ': 'Âm Hán Việt hoặc chữ Hán tương ứng (ví dụ: 學校 - Học hiệu, 幸福 - Hạnh phúc). Giúp người Việt nhớ từ qua mối liên hệ từ nguyên.' },
  { 'Mục': 'Từ loại (Part of Speech)', 'Mô tả & Giá trị hợp lệ': 'Noun (Danh từ), Verb (Động từ), Adjective (Tính từ), Adverb (Phó từ), Phrase (Cụm từ)...' },
  { 'Mục': 'Mẹo nhập nhanh', 'Mô tả & Giá trị hợp lệ': 'Bạn có thể xóa các dòng mẫu trong trang "Danh_Sach_Tu_Vung" và dán danh sách từ của bạn vào. Các cột không bắt buộc có thể để trống.' }
];

/**
 * Downloads a pre-formatted Excel template file
 */
export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Main vocabulary template
  const wsVocab = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);

  // Set column widths for readability
  wsVocab['!cols'] = [
    { wch: 18 }, // Từ tiếng Hàn
    { wch: 18 }, // Romaja
    { wch: 25 }, // Nghĩa tiếng Việt
    { wch: 22 }, // Nghĩa tiếng Anh
    { wch: 14 }, // Cấp độ
    { wch: 16 }, // Chủ đề
    { wch: 22 }, // Hán Hàn
    { wch: 16 }, // Từ loại
    { wch: 35 }, // Ví dụ tiếng Hàn
    { wch: 35 }, // Dịch tiếng Việt
    { wch: 35 }, // Dịch tiếng Anh
    { wch: 30 }, // Ghi chú
  ];

  XLSX.utils.book_append_sheet(wb, wsVocab, 'Danh_Sach_Tu_Vung');

  // Sheet 2: Guide & reference
  const wsGuide = XLSX.utils.json_to_sheet(GUIDE_SHEET_ROWS);
  wsGuide['!cols'] = [
    { wch: 24 },
    { wch: 80 }
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Huong_Dan_Nhap');

  // Generate and download
  XLSX.writeFile(wb, 'Hango_Mau_Nhap_Tu_Vung.xlsx');
}

/**
 * Normalize level string to Level type
 */
function normalizeLevel(val: any): Level {
  if (!val) return 'beginner';
  const str = String(val).toLowerCase().trim();
  if (str.includes('cao') || str.includes('advanced') || str.includes('고급') || str === '3') {
    return 'advanced';
  }
  if (str.includes('trung') || str.includes('intermediate') || str.includes('중급') || str === '2') {
    return 'intermediate';
  }
  return 'beginner';
}

/**
 * Normalize category string to Category type
 */
function normalizeCategory(val: any): Category {
  if (!val) return 'daily';
  const str = String(val).toLowerCase().trim();

  if (str.includes('chào') || str.includes('greeting') || str.includes('인사')) return 'greeting';
  if (str.includes('gia') || str.includes('đình') || str.includes('family') || str.includes('가족')) return 'family';
  if (str.includes('trường') || str.includes('học') && !str.includes('thuật') || str.includes('school') || str.includes('학교')) return 'school';
  if (str.includes('ẩm') || str.includes('thực') || str.includes('ăn') || str.includes('uống') || str.includes('food') || str.includes('음식')) return 'food';
  if (str.includes('công') || str.includes('việc') || str.includes('work') || str.includes('nghề') || str.includes('업무') || str.includes('직장')) return 'work';
  if (str.includes('cảm') || str.includes('xúc') || str.includes('emotion') || str.includes('감정')) return 'emotion';
  if (str.includes('du') || str.includes('lịch') || str.includes('giao') || str.includes('thông') || str.includes('travel') || str.includes('여행')) return 'travel';
  if (str.includes('xã') || str.includes('hội') || str.includes('society') || str.includes('사회')) return 'society';
  if (str.includes('học') && str.includes('thuật') || str.includes('academic') || str.includes('학술')) return 'academic';
  if (str.includes('thành') || str.includes('ngữ') || str.includes('idiom') || str.includes('사자성어')) return 'idiom';

  return 'daily';
}

/**
 * Normalizes string keys in an object to find fields flexibly
 */
function getFieldValue(row: Record<string, any>, candidateKeys: string[]): string {
  const rowKeys = Object.keys(row);
  for (const candidate of candidateKeys) {
    const candLower = candidate.toLowerCase();
    for (const k of rowKeys) {
      const kLower = k.toLowerCase().replace(/[*_\s]/g, '');
      const testCand = candLower.replace(/[*_\s]/g, '');
      if (kLower === testCand || kLower.includes(testCand) || testCand.includes(kLower)) {
        const val = row[k];
        if (val !== undefined && val !== null) {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

/**
 * Parses an Excel or CSV file into a list of words with validation
 */
export async function parseExcelVocabFile(
  file: File,
  existingWords: Word[]
): Promise<ParsedExcelWord[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Use the first sheet or the sheet with vocabulary
  let sheetName = workbook.SheetNames[0];
  const preferredSheet = workbook.SheetNames.find(
    (name) => name.toLowerCase().includes('tu') || name.toLowerCase().includes('danh') || name.toLowerCase().includes('vocab')
  );
  if (preferredSheet) {
    sheetName = preferredSheet;
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Không tìm thấy bảng tính hợp lệ trong file Excel.');
  }

  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (!rawJson || rawJson.length === 0) {
    throw new Error('File Excel không có dữ liệu dòng nào.');
  }

  const existingHangulSet = new Set(
    existingWords.map((w) => w.hangul.trim().toLowerCase())
  );

  const seenInFile = new Set<string>();
  const parsedResults: ParsedExcelWord[] = [];

  rawJson.forEach((row, idx) => {
    const rowNum = idx + 2; // Row number in Excel (header is row 1)

    // Extract Hangul
    const hangul = getFieldValue(row, ['từ tiếng hàn', 'hangul', 'từ hàn', 'korean', 'hàn ngữ', 'từ vựng']);
    
    // Extract Romaja
    const romaja = getFieldValue(row, ['phiên âm', 'romaja', 'romanization', 'phát âm']);

    // Extract Vietnamese meaning
    const vietnamese = getFieldValue(row, ['nghĩa tiếng việt', 'tiếng việt', 'vietnamese', 'nghĩa việt', 'nghĩa']);

    // Extract English meaning
    const english = getFieldValue(row, ['nghĩa tiếng anh', 'english', 'tiếng anh', 'nghĩa anh', 'definition']);

    // Extract Level
    const rawLevel = getFieldValue(row, ['cấp độ', 'level', 'trình độ', 'độ khó']);
    const level = normalizeLevel(rawLevel);

    // Extract Category
    const rawCategory = getFieldValue(row, ['chủ đề', 'category', 'nhóm']);
    const category = normalizeCategory(rawCategory);

    // Extract Hanja / Hán Hàn
    const hanja = getFieldValue(row, ['hán hàn', 'hanja', 'âm hán', 'hán việt', 'chữ hán']);

    // Extract Part of Speech
    const partOfSpeech = getFieldValue(row, ['từ loại', 'part of speech', 'pos', 'loại từ']) || 'noun';

    // Extract Examples
    const exampleKo = getFieldValue(row, ['ví dụ tiếng hàn', 'example ko', 'ví dụ hàn', 'ví dụ câu hàn', 'korean example']);
    const exampleVi = getFieldValue(row, ['dịch ví dụ tiếng việt', 'example vi', 'dịch ví dụ', 'ví dụ việt', 'vietnamese example']);
    const exampleEn = getFieldValue(row, ['dịch ví dụ tiếng anh', 'example en', 'ví dụ anh', 'english example']);

    // Extract Notes
    const notes = getFieldValue(row, ['ghi chú', 'notes', 'mẹo nhớ', 'chú thích']);

    // Validation
    const cleanHangul = hangul.trim();
    const cleanVi = vietnamese.trim();
    const cleanEn = english.trim();

    let isValid = true;
    let errorMessage = '';

    if (!cleanHangul) {
      isValid = false;
      errorMessage = 'Thiếu từ tiếng Hàn (Hangul)';
    } else if (!cleanVi && !cleanEn) {
      isValid = false;
      errorMessage = 'Thiếu cả nghĩa tiếng Việt lẫn tiếng Anh';
    }

    const hangulKey = cleanHangul.toLowerCase();
    const isDuplicate = existingHangulSet.has(hangulKey) || seenInFile.has(hangulKey);
    if (cleanHangul) {
      seenInFile.add(hangulKey);
    }

    // Build the Word object
    const word: Omit<Word, 'id'> = {
      hangul: cleanHangul,
      romaja: romaja || '—',
      vietnamese: cleanVi || cleanEn,
      english: cleanEn || cleanVi,
      level,
      category,
      exampleKo,
      exampleVi,
      exampleEn,
      notes,
      hanja,
      partOfSpeech,
      englishNotes: notes,
      isFavorite: false,
      masteryLevel: 0,
    };

    parsedResults.push({
      word,
      isValid,
      isDuplicate,
      errorMessage,
      rowNumber: rowNum,
    });
  });

  return parsedResults;
}
