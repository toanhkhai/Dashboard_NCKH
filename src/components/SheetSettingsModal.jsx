import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, RotateCcw, HelpCircle, Check, Wand2, Link2, Sparkles } from 'lucide-react';
import { convertToGvizUrl, parseGoogleSheetUrl } from '../utils/urlConverter.js';

/**
 * ============================================================================
 * COMPONENT: SheetSettingsModal
 * ============================================================================
 * Modal cấu hình đường dẫn Google Sheets:
 * - Hỗ trợ dán BẤT KỲ link Google Sheet nào (chia sẻ, edit, pub, csv...)
 * - Tự động nhận diện và chuyển đổi sang endpoint tương thích cao nhất
 * - Hướng dẫn mở quyền chia sẻ công khai
 * - Đọc trực tiếp 100% từ link Google Sheets
 * ============================================================================
 */
export const SheetSettingsModal = ({
  isOpen,
  onClose,
  sheet1Url,
  sheet2Url,
  onSaveUrls,
  onResetDefaults,
}) => {
  const [url1, setUrl1] = useState(sheet1Url || '');
  const [url2, setUrl2] = useState(sheet2Url || '');
  const [savedMessage, setSavedMessage] = useState(false);
  const [autoConvertMsg, setAutoConvertMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl1(sheet1Url || '');
      setUrl2(sheet2Url || '');
      setSavedMessage(false);
      setAutoConvertMsg('');
    }
  }, [isOpen, sheet1Url, sheet2Url]);

  const handleAutoConvert = useCallback(() => {
    const converted1 = convertToGvizUrl(url1);
    const converted2 = convertToGvizUrl(url2);
    let changed = false;
    if (converted1 !== url1) { setUrl1(converted1); changed = true; }
    if (converted2 !== url2) { setUrl2(converted2); changed = true; }
    setAutoConvertMsg(
      changed
        ? '✅ Đã tự động chuyển đổi sang endpoint Google Sheets tối ưu!'
        : 'ℹ️ Các link đã ở đúng định dạng tương thích rồi.'
    );
    setTimeout(() => setAutoConvertMsg(''), 3000);
  }, [url1, url2]);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalUrl1 = convertToGvizUrl(url1);
    const finalUrl2 = convertToGvizUrl(url2);
    onSaveUrls(finalUrl1, finalUrl2);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    onResetDefaults();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm ">
      <div className="bg-white border border-slate-200 rounded-sm max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 p-1.5 rounded-sm hover:bg-slate-100 transition-colors"
          title="Đóng modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Cấu hình Liên Kết Google Sheets</span>
        </div>

        <h3 className="text-base font-extrabold text-slate-800 mb-2">
          Kết nối trực tiếp link Google Sheets của bạn
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Chỉ cần quăng link Google Sheet vào đây — hệ thống sẽ tự động fetch và hiển thị trực tiếp lên Dashboard thời gian thực.
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nguồn 1: Bài báo Ngoài Trường (HĐGS) hoặc Google Sheet bài báo
            </label>
            <input
              type="text"
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-sm p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="Dán link Google Sheet Nguồn 1 (link chia sẻ, edit, gviz...)"
            />
            {url1.trim() && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                {parseGoogleSheetUrl(url1).isGoogleSheet ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Đã nhận diện: Google Sheet (ID: {parseGoogleSheetUrl(url1).spreadsheetId?.slice(0, 10)}...
                    {parseGoogleSheetUrl(url1).gid !== null ? ` | Tab: gid=${parseGoogleSheetUrl(url1).gid}` : ' | Tab đầu tiên'})
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    Link ngoài / tùy biến
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nguồn 2: Danh mục NCKH Mở rộng / Quốc tế (Scopus/ISI) hoặc Sheet thứ 2
            </label>
            <input
              type="text"
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-sm p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="Dán link Google Sheet Nguồn 2 (link chia sẻ, edit, gviz...)"
            />
            {url2.trim() && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                {parseGoogleSheetUrl(url2).isGoogleSheet ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Đã nhận diện: Google Sheet (ID: {parseGoogleSheetUrl(url2).spreadsheetId?.slice(0, 10)}...
                    {parseGoogleSheetUrl(url2).gid !== null ? ` | Tab: gid=${parseGoogleSheetUrl(url2).gid}` : ' | Tab đầu tiên'})
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    Link ngoài / tùy biến
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Nút chuyển đổi tự động URL */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoConvert}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 transition-all"
              title="Tự động kiểm tra và chuyển đổi link thường sang endpoint tối ưu"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Tự động tối ưu URL</span>
            </button>
            {autoConvertMsg && (
              <span className="text-[11px] text-emerald-600 font-medium ">
                {autoConvertMsg}
              </span>
            )}
          </div>

          {/* Lưu ý quan trọng về Quyền chia sẻ */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-blue-800 text-[11px] leading-relaxed flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-900">Yêu cầu quyền truy cập Google Sheets:</strong>
              <p className="mt-1 text-slate-700">
                Để ứng dụng đọc trực tiếp dữ liệu từ Google Sheets:
              </p>
              <ol className="mt-1 space-y-1 text-slate-700 list-decimal list-inside pl-1">
                <li>Mở file Google Sheet của bạn trên trình duyệt.</li>
                <li>Bấm nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải.</li>
                <li>Ở mục "Quyền truy cập chung", chọn <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong> (Anyone with the link can view).</li>
                <li>Copy link và dán vào ô bên trên rồi bấm <strong>Lưu & Nạp lại</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Hướng dẫn các định dạng URL được hỗ trợ */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-800 text-[11px] leading-relaxed flex items-start gap-2.5">
            <Link2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-900">Hỗ trợ tất cả định dạng link Google Sheets:</strong>
              <ul className="mt-1 space-y-0.5 text-emerald-700 list-disc list-inside">
                <li>Link chia sẻ: <code className="bg-emerald-100 text-emerald-800 px-1 rounded border border-emerald-200">.../d/ID/edit?usp=sharing</code></li>
                <li>Link edit tab cụ thể: <code className="bg-emerald-100 text-emerald-800 px-1 rounded border border-emerald-200">.../d/ID/edit#gid=123</code></li>
                <li>Link xuất bản web: <code className="bg-emerald-100 text-emerald-800 px-1 rounded border border-emerald-200">.../d/e/2PACX-.../pub?output=csv</code></li>
                <li>Link tải CSV hoặc GViz API</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-300 transition-colors"
            title="Khôi phục về link Google Sheets mặc định của CTUMP"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Dùng URL Mặc Định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-sm text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30"
            >
              {savedMessage ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedMessage ? 'Đã lưu!' : 'Lưu & Nạp lại'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

