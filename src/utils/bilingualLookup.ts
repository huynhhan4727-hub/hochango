/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Bảng tra cứu âm Hán - Việt cho các âm tiết tiếng Hàn phổ biến
// Hỗ trợ người học Việt Nam tra nghĩa gốc Hán (Hán-Hàn tương đồng Hán-Việt)
export const HANJA_ROOT_MAP: Record<string, { hanzi: string; sinoVi: string; note: string }> = {
  학: { hanzi: '學', sinoVi: 'Học', note: 'học tập, trường học (학교, 학생, 학원)' },
  교: { hanzi: '校/敎', sinoVi: 'Hiệu / Giáo', note: 'trường học, giáo dục, giáo viên (학교, 교사, 교육)' },
  생: { hanzi: '生', sinoVi: 'Sinh', note: 'sinh sống, học sinh, phát sinh (학생, 생활, 발생)' },
  사: { hanzi: '社/事/師', sinoVi: 'Xã / Sự / Sư', note: 'xã hội, công ty, sự việc, thầy giáo (회사, 사회, 의사)' },
  회: { hanzi: '會', sinoVi: 'Hội', note: 'công ty, hội nghị, cơ hội (회사, 회의, 기회)' },
  국: { hanzi: '國/局', sinoVi: 'Quốc / Cục', note: 'quốc gia, cơ quan, hiệu thuốc (한국, 외국, 약국)' },
  가: { hanzi: '家', sinoVi: 'Gia', note: 'gia đình, chuyên gia (가족, 작가, 전문가)' },
  족: { hanzi: '族', sinoVi: 'Tộc', note: 'gia tộc, dân tộc (가족, 민족)' },
  도: { hanzi: '圖/道/度', sinoVi: 'Đồ / Đạo / Độ', note: 'bản đồ, con đường, mức độ (지도, 도로, 온도)' },
  서: { hanzi: '書/西', sinoVi: 'Thư / Tây', note: 'sách vở, phương Tây (도서관, 서점, 서양)' },
  관: { hanzi: '館/官', sinoVi: 'Quán / Quan', note: 'nhà, viện, cơ quan (도서관, 미술관, 대사관)' },
  식: { hanzi: '食/式', sinoVi: 'Thực / Thức', note: 'ăn uống, hình thức, phương thức (음식, 식당, 방식)' },
  당: { hanzi: '堂', sinoVi: 'Đường', note: 'nhà lớn, quán (식당, 성당)' },
  음: { hanzi: '飮/音', sinoVi: 'Ẩm / Âm', note: 'uống, âm thanh (음료수, 음악, 발음)' },
  악: { hanzi: '樂/惡', sinoVi: 'Nhạc / Ác', note: 'âm nhạc, niềm vui, độc ác (음악, 악기)' },
  의: { hanzi: '醫/意/義', sinoVi: 'Y / Ý / Nghĩa', note: 'y học, ý kiến, ý nghĩa (의사, 의견, 의미)' },
  병: { hanzi: '病', sinoVi: 'Bệnh', note: 'bệnh viện, căn bệnh (병원, 병자)' },
  원: { hanzi: '院/員/原', sinoVi: 'Viện / Viên / Nguyên', note: 'bệnh viện, nhân viên (병원, 직원, 공원)' },
  인: { hanzi: '人', sinoVi: 'Nhân', note: 'con người, nhân vật (한국인, 외국인, 인기)' },
  대: { hanzi: '大/代', sinoVi: 'Đại / Đại', note: 'to lớn, đại diện (대학교, 대한민국, 대표)' },
  중: { hanzi: '中/重', sinoVi: 'Trung / Trọng', note: 'ở giữa, quan trọng (중학교, 중심, 중요)' },
  소: { hanzi: '小/所', sinoVi: 'Tiểu / Sở', note: 'nhỏ bé, nơi chốn (초등학교, 장소, 소문)' },
  초: { hanzi: '初', sinoVi: 'Sơ', note: 'ban đầu, sơ cấp (초급, 초등학교)' },
  고: { hanzi: '高/古', sinoVi: 'Cao / Cổ', note: 'cao cấp, xưa cũ (고급, 고등학교, 고대)' },
  동: { hanzi: '動/同/東', sinoVi: 'Động / Đồng / Đông', note: 'vận động, cùng, phía Đông (운동, 동호회, 동쪽)' },
  문: { hanzi: '文/門', sinoVi: 'Văn / Môn', note: 'văn hóa, cửa ra vào (문학, 문화, 정문)' },
  화: { hanzi: '話/化/花', sinoVi: 'Thoại / Hóa / Hoa', note: 'nói chuyện, biến hóa, hoa (대화, 전화, 문화)' },
  전: { hanzi: '電/前/全', sinoVi: 'Điện / Tiền / Toàn', note: 'điện thoại, trước, tất cả (전화, 이전, 전국)' },
  시: { hanzi: '市/時/始', sinoVi: 'Thị / Thời / Thủy', note: 'thành phố, thời gian, bắt đầu (서울시, 시간, 시작)' },
  간: { hanzi: '間', sinoVi: 'Gian', note: 'khoảng giữa, thời gian (시간, 인간, 공간)' },
  작: { hanzi: '作', sinoVi: 'Tác', note: 'sáng tác, bắt đầu (시작, 작가, 작품)' },
  행: { hanzi: '行/幸', sinoVi: 'Hành / Hạnh', note: 'đi lại, ngân hàng, hạnh phúc (은행, 여행, 행복)' },
  은: { hanzi: '銀', sinoVi: 'Ngân', note: 'bạc, ngân hàng (은행)' },
  여: { hanzi: '旅/女', sinoVi: 'Lữ / Nữ', note: 'du lịch, phụ nữ (여행, 여관, 여자)' },
  물: { hanzi: '物', sinoVi: 'Vật', note: 'động vật, đồ vật, thực vật (선물, 동물, 식물)' },
  선: { hanzi: '先/善/線', sinoVi: 'Tiên / Thiện / Tuyến', note: 'trước, tặng phẩm, tốt đẹp (선생님, 선물)' },
  자: { hanzi: '子/自', sinoVi: 'Tử / Tự', note: 'con cái, bản thân, tự do (모자, 의자, 자신, 자유)' },
  공: { hanzi: '公/空/工/功', sinoVi: 'Công / Không', note: 'công cộng, bầu trời, học tập, thành công (공원, 공항, 공부, 성공)' },
  항: { hanzi: '港/航', sinoVi: 'Cảng / Hàng', note: 'hải cảng, hàng không (공항, 항구, 항공)' },
  실: { hanzi: '室/實', sinoVi: 'Thất / Thực', note: 'căn phòng, thực tế (교실, 화장실, 사실)' },
  체: { hanzi: '體/遞', sinoVi: 'Thể / Đễ', note: 'cơ thể, thể dục, bưu điện (몸, 체육, 우체국)' },
  육: { hanzi: '育/肉', sinoVi: 'Dục / Nhục', note: 'nuôi dạy, thịt (교육, 체육, 고기)' },
  정: { hanzi: '情/定/正', sinoVi: 'Tình / Định / Chính', note: 'tình cảm, quyết định, chính xác (우정, 결정, 정확)' },
  우: { hanzi: '友/雨/郵', sinoVi: 'Hữu / Vũ / Bưu', note: 'bạn bè, mưa, bưu điện (친구, 우정, 우체국)' },
  친: { hanzi: '親', sinoVi: 'Thân', note: 'thân thiết, cha mẹ (친구, 친절, 친척)' },
  절: { hanzi: '切/節', sinoVi: 'Thiết / Tiết', note: 'thân thiết, ngày lễ, mùa (친절, 계절)' },
  기: { hanzi: '氣/機/期', sinoVi: 'Khí / Cơ / Kỳ', note: 'không khí, máy móc, kỳ hạn (날씨, 비행기, 기간)' },
  비: { hanzi: '飛/費', sinoVi: 'Phi / Phí', note: 'bay lượn, chi phí (비행기, 준비, 비상)' },
  준: { hanzi: '準', sinoVi: 'Chuẩn', note: 'tiêu chuẩn, chuẩn bị (준비, 기준)' },
  성: { hanzi: '成/性/聲', sinoVi: 'Thành / Tính / Thanh', note: 'thành công, tính cách, giọng (성공, 여성, 성격)' },
  력: { hanzi: '力', sinoVi: 'Lực', note: 'sức lực, nỗ lực (노력, 능력, 실력)' },
  노: { hanzi: '努', sinoVi: 'Nỗ', note: 'cố gắng, nỗ lực (노력)' },
  계: { hanzi: '計/界', sinoVi: 'Kế / Giới', note: 'kế hoạch, thế giới (계획, 세계, 시계)' },
  획: { hanzi: '劃', sinoVi: 'Hoạch', note: 'kế hoạch, quy hoạch (계획)' },
  세: { hanzi: '世', sinoVi: 'Thế', note: 'thế gian, thế giới (세계, 세상)' },
  신: { hanzi: '新/信/身', sinoVi: 'Tân / Tín / Thân', note: 'mới mẻ, tin tưởng, bản thân (신문, 신용, 자신)' },
  역: { hanzi: '驛/歷', sinoVi: 'Dịch / Lịch', note: 'nhà ga, lịch sử (서울역, 역사)' },
  약: { hanzi: '藥/約', sinoVi: 'Dược / Ước', note: 'thuốc tây, hứa hẹn (약국, 약속)' },
  명: { hanzi: '名/命', sinoVi: 'Danh / Mệnh', note: 'tên tuổi, sinh mệnh (이름, 유명, 생명)' },
  유: { hanzi: '有/油', sinoVi: 'Hữu / Du', note: 'có, dầu ăn (유명, 이유, 주유소)' },
  리: { hanzi: '理/利', sinoVi: 'Lý / Lợi', note: 'lý do, thuận lợi (이유, 요리, 편리)' },
  편: { hanzi: '便', sinoVi: 'Tiện', note: 'thuận tiện (편리, 편지, 남편)' },
  복: { hanzi: '福/服', sinoVi: 'Phúc / Phục', note: 'hạnh phúc, quần áo (행복, 양복, 회복)' },
  합: { hanzi: '合', sinoVi: 'Hợp', note: 'hợp nhất, tổng hợp (종합, 합격)' },
  격: { hanzi: '格', sinoVi: 'Cách', note: 'tư cách, đỗ đạt (합격, 성격)' },
};

export interface HanjaBreakdown {
  syllable: string;
  sinoVi: string;
  hanzi: string;
  note: string;
}

/**
 * Phân tích và gợi ý âm Hán Việt cho từ tiếng Hàn
 */
export function getHanjaAnalysis(hangul: string): {
  fullSinoVi: string;
  breakdown: HanjaBreakdown[];
} {
  const cleanHangul = hangul.replace(/[^\uAC00-\uD7A3]/g, '');
  if (!cleanHangul) return { fullSinoVi: '', breakdown: [] };

  const breakdown: HanjaBreakdown[] = [];
  const sinoWords: string[] = [];

  for (const char of cleanHangul) {
    if (HANJA_ROOT_MAP[char]) {
      const item = HANJA_ROOT_MAP[char];
      breakdown.push({
        syllable: char,
        sinoVi: item.sinoVi.split('/')[0].trim(),
        hanzi: item.hanzi,
        note: item.note,
      });
      sinoWords.push(item.sinoVi.split('/')[0].trim().split(' ')[0]);
    } else {
      breakdown.push({
        syllable: char,
        sinoVi: '—',
        hanzi: '',
        note: 'Từ thuần Hàn hoặc âm chưa có trong bộ tra',
      });
    }
  }

  const fullSinoVi = sinoWords.length === cleanHangul.length ? sinoWords.join(' ') : '';
  return { fullSinoVi, breakdown };
}

// Từ loại tiếng Anh phổ biến hỗ trợ người học nước ngoài
export const ENGLISH_PARTS_OF_SPEECH = [
  { value: 'noun', labelEn: 'Noun (n.)', labelVi: 'Danh từ' },
  { value: 'verb', labelEn: 'Verb (v.)', labelVi: 'Động từ' },
  { value: 'adjective', labelEn: 'Adjective (adj.)', labelVi: 'Tính từ' },
  { value: 'adverb', labelEn: 'Adverb (adv.)', labelVi: 'Trạng từ' },
  { value: 'pronoun', labelEn: 'Pronoun (pron.)', labelVi: 'Đại từ' },
  { value: 'phrase', labelEn: 'Expression / Phrase', labelVi: 'Cụm từ / Quán ngữ' },
  { value: 'conjunction', labelEn: 'Conjunction (conj.)', labelVi: 'Liên từ' },
] as const;

/**
 * Link từ điển trực tuyến tra cứu nhanh
 */
export function getOnlineLookupUrls(keyword: string) {
  const enc = encodeURIComponent(keyword.trim());
  return {
    // Từ điển Hàn - Việt của Naver (phổ biến nhất cho người Việt)
    naverVi: `https://vndic.naver.com/#/search?query=${enc}`,
    // Từ điển Hàn - Anh của Naver (cho người Anh)
    naverEn: `https://en.dict.naver.com/#/search?query=${enc}`,
    // Viện ngôn ngữ Quốc gia Hàn Quốc Krdict (Anh/Việt)
    krdict: `https://krdict.korean.go.kr/eng/dicSearch/search?nation=eng&nationCode=6&ParaWordNo=&mainSearchWord=${enc}`,
  };
}
