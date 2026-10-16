import React, { useState, useRef } from 'react';
import { Word } from '../types';
import { LEVEL_LABELS, CATEGORY_LABELS } from '../data/initialVocab';
import { 
  downloadExcelTemplate, 
  parseExcelVocabFile, 
  ParsedExcelWord 
} from '../utils/excelVocab';
import { 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Volume2, 
  X, 
  RefreshCw,
  FileCheck2,
  Sparkles,
  Info
} from 'lucide-react';
import { playKoreanAudio } from '../utils/speech';

interface ExcelImportSectionProps {
  existingWords?: Word[];
  onBatchImport?: (words: Omit<Word, 'id'>[]) => void;
  onClose: () => void;
  onSwitchToManual: () => void;
}

export const ExcelImportSection: React.FC<ExcelImportSectionProps> = ({
  existingWords = [],
  onBatchImport,
  onClose,
  onSwitchToManual,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedList, setParsedList] = useState<ParsedExcelWord[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [playingHangul, setPlayingHangul] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle template download
  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
  };

  // Handle file reading
  const handleProcessFile = async (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = selectedFile.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValidExt) {
      setError('Vui lòng chọn file Excel đúng định dạng (.xlsx, .xls hoặc .csv)');
      return;
    }

    setLoading(true);
    setError(null);
    setFile(selectedFile);

    try {
      const results = await parseExcelVocabFile(selectedFile, existingWords);
      setParsedList(results);

      // Auto-select valid items (excluding duplicates if skipDuplicates is on)
      const initialSelected = new Set<number>();
      results.forEach((item, idx) => {
        if (item.isValid) {
          if (!skipDuplicates || !item.isDuplicate) {
            initialSelected.add(idx);
          }
        }
      });
      setSelectedIndices(initialSelected);
    } catch (err: any) {
      setError(err?.message || 'Không thể đọc nội dung file Excel. Vui lòng kiểm tra lại cấu trúc file.');
      setParsedList([]);
      setSelectedIndices(new Set());
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Toggle selection for a single row
  const toggleSelectRow = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const validIndices = parsedList
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.isValid && (!skipDuplicates || !item.isDuplicate))
      .map(({ idx }) => idx);

    if (selectedIndices.size === validIndices.length && validIndices.length > 0) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(validIndices));
    }
  };

  // Handle changing duplicate skip setting
  const handleToggleSkipDuplicates = (newVal: boolean) => {
    setSkipDuplicates(newVal);
    setSelectedIndices((prev) => {
      const next = new Set<number>();
      parsedList.forEach((item, idx) => {
        if (item.isValid) {
          if (newVal) {
            if (!item.isDuplicate && prev.has(idx)) {
              next.add(idx);
            }
          } else {
            if (prev.has(idx) || item.isDuplicate) {
              next.add(idx);
            }
          }
        }
      });
      return next;
    });
  };

  // Play audio preview
  const handlePlayAudio = async (hangul: string) => {
    setPlayingHangul(hangul);
    await playKoreanAudio(hangul, 0.9);
    setPlayingHangul(null);
  };

  // Reset file
  const handleResetFile = () => {
    setFile(null);
    setParsedList([]);
    setSelectedIndices(new Set());
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Perform import
  const handleImportSubmit = () => {
    if (!onBatchImport) return;

    const wordsToImport: Omit<Word, 'id'>[] = [];
    selectedIndices.forEach((idx) => {
      const item = parsedList[idx];
      if (item && item.isValid) {
        wordsToImport.push(item.word);
      }
    });

    if (wordsToImport.length === 0) {
      setError('Vui lòng chọn ít nhất 1 từ vựng hợp lệ để thêm vào kho từ.');
      return;
    }

    onBatchImport(wordsToImport);
    onClose();
  };

  // Stats
  const totalCount = parsedList.length;
  const validCount = parsedList.filter((item) => item.isValid).length;
  const duplicateCount = parsedList.filter((item) => item.isDuplicate).length;
  const invalidCount = parsedList.filter((item) => !item.isValid).length;
  const selectedCount = selectedIndices.size;

  return (
    <div id="excel-import-section" className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
      {/* Step 1: Download Sample Excel Template */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-sky-50/80 rounded-2xl p-4 sm:p-5 border border-blue-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                  File mẫu Excel chuẩn của Hango (.xlsx)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  Có sẵn mẫu
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tải file mẫu để điền hàng loạt từ vựng. Gồm đầy đủ các cột: <strong>Từ Hàn (Hangul)</strong>, Romaja, Nghĩa Việt, Nghĩa Anh, Cấp độ, Chủ đề, Hán Hàn, Từ loại, Câu ví dụ.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="download-excel-template-btn"
            onClick={handleDownloadTemplate}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            title="Tải về máy tính file mẫu Excel .xlsx"
          >
            <Download className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Tải file mẫu Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 2: Upload Zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs mb-3 transition-colors">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h5 className="font-bold text-slate-800 text-sm sm:text-base mb-1">
            Kéo thả hoặc nhấp để chọn file Excel (.xlsx, .xls, .csv)
          </h5>
          <p className="text-xs text-slate-500 max-w-md">
            Hệ thống sẽ tự động nhận diện các cột tiếng Hàn, nghĩa tiếng Việt, tiếng Anh và phân loại tương ứng.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200/70 text-slate-700 text-[11px] font-semibold">
            <span>Hỗ trợ: Microsoft Excel, Google Sheets, LibreOffice Calc</span>
          </div>
        </div>
      ) : (
        /* Step 3: Parsed Data Overview & Table Preview */
        <div className="space-y-4">
          {/* File Header Bar */}
          <div className="bg-slate-100/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                  {file.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  Dung lượng: {(file.size / 1024).toFixed(1)} KB • {totalCount} dòng dữ liệu
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFile}
                className="min-h-[34px] px-3 py-1 rounded-xl border border-slate-300 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Chọn file khác</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Tổng số từ</span>
              <div className="text-lg font-black text-slate-800">{totalCount}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
              <span className="text-[11px] text-emerald-700 font-medium">Hợp lệ</span>
              <div className="text-lg font-black text-emerald-700">{validCount}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
              <span className="text-[11px] text-amber-700 font-medium">Đã có trong kho</span>
              <div className="text-lg font-black text-amber-700">{duplicateCount}</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center">
              <span className="text-[11px] text-rose-700 font-medium">Lỗi / Thiếu cột</span>
              <div className="text-lg font-black text-rose-700">{invalidCount}</div>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer select-none"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedIndices.size === validCount && validCount > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả hợp lệ'}</span>
              </button>

              <span className="text-slate-300">|</span>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => handleToggleSkipDuplicates(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Tự động bỏ qua các từ đã có trong kho từ ({duplicateCount})</span>
              </label>
            </div>

            <div className="text-xs font-bold text-slate-700">
              Đã chọn: <span className="text-blue-600">{selectedCount}</span> / {validCount} từ
            </div>
          </div>

          {/* Scrollable Preview Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 shadow-xs select-none">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                    <th className="py-2.5 px-3 font-bold min-w-[130px]">Từ Hàn (Hangul)</th>
                    <th className="py-2.5 px-3 font-bold min-w-[140px]">Nghĩa tiếng Việt</th>
                    <th className="py-2.5 px-3 font-bold min-w-[130px]">Nghĩa tiếng Anh</th>
                    <th className="py-2.5 px-2 font-bold min-w-[90px]">Cấp độ</th>
                    <th className="py-2.5 px-2 font-bold min-w-[110px]">Chủ đề</th>
                    <th className="py-2.5 px-3 font-bold min-w-[110px]">Hán Hàn</th>
                    <th className="py-2.5 px-3 font-bold min-w-[100px] text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedList.map((item, idx) => {
                    const isSelected = selectedIndices.has(idx);
                    const isAudioPlaying = playingHangul === item.word.hangul;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !item.isValid
                            ? 'bg-rose-50/40 text-slate-400'
                            : item.isDuplicate
                            ? 'bg-amber-50/30'
                            : isSelected
                            ? 'bg-blue-50/30'
                            : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!item.isValid}
                            onChange={() => toggleSelectRow(idx)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer disabled:opacity-40"
                          />
                        </td>

                        {/* Hangul + Audio */}
                        <td className="py-2 px-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{item.word.hangul || '—'}</span>
                            {item.word.hangul && (
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(item.word.hangul)}
                                disabled={isAudioPlaying}
                                title="Nghe phát âm"
                                className="min-w-[22px] min-h-[22px] flex items-center justify-center rounded text-blue-600 hover:bg-blue-100 cursor-pointer active:scale-90"
                              >
                                <Volume2 className={`w-3.5 h-3.5 ${isAudioPlaying ? 'animate-pulse text-amber-500' : ''}`} />
                              </button>
                            )}
                          </div>
                          {item.word.romaja && item.word.romaja !== '—' && (
                            <span className="text-[10px] text-slate-400 font-normal block">
                              {item.word.romaja}
                            </span>
                          )}
                        </td>

                        {/* Vietnamese */}
                        <td className="py-2 px-3 text-slate-800 font-medium max-w-[180px] truncate" title={item.word.vietnamese}>
                          {item.word.vietnamese || '—'}
                        </td>

                        {/* English */}
                        <td className="py-2 px-3 text-slate-600 max-w-[160px] truncate" title={item.word.english}>
                          {item.word.english || '—'}
                        </td>

                        {/* Level */}
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              LEVEL_LABELS[item.word.level]?.badgeBg || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.word.level === 'beginner'
                              ? 'Sơ cấp'
                              : item.word.level === 'intermediate'
                              ? 'Trung cấp'
                              : 'Cao cấp'}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-2 px-2 text-slate-600 text-[11px] truncate max-w-[120px]">
                          {CATEGORY_LABELS[item.word.category] || item.word.category}
                        </td>

                        {/* Hanja */}
                        <td className="py-2 px-3 text-slate-600 text-[11px] truncate max-w-[120px]" title={item.word.hanja}>
                          {item.word.hanja || '—'}
                        </td>

                        {/* Status */}
                        <td className="py-2 px-3 text-center">
                          {!item.isValid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 inline-flex items-center gap-0.5" title={item.errorMessage}>
                              <AlertCircle className="w-2.5 h-2.5" />
                              Lỗi
                            </span>
                          ) : item.isDuplicate ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-0.5" title="Từ này đã có trong kho từ">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Đã có
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              Hợp lệ
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSwitchToManual}
          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>← Quay lại Nhập thủ công</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          >
            Đóng
          </button>

          {file && (
            <button
              type="button"
              id="confirm-import-excel-btn"
              onClick={handleImportSubmit}
              disabled={selectedCount === 0}
              className="flex-1 sm:flex-initial min-h-[42px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Thêm {selectedCount} từ vào kho từ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
