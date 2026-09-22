import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileCheck2,
  FileText,
  Building2,
  Calendar,
  Layers,
  BookOpen,
} from 'lucide-react';

/**
 * ============================================================================
 * COMPONENT: DataTable
 * ============================================================================
 * Bảng tra cứu và thẩm định chi tiết hồ sơ nghiên cứu khoa học:
 * - Phân trang (10, 25, 50, 100 dòng)
 * - Sắp xếp đa trường: Điểm HĐGS, Ngày xuất bản, Tên bài báo, Tạp chí
 * - Badge màu sắc điểm HĐGS theo chuẩn Y Dược
 * - Nút "🔗 Xem PDF" mở trực tiếp minh chứng Google Drive
 * - Modal thẩm định chi tiết từng bài báo
 * - Hiển thị 100% các cột từ Google Sheet gốc của người dùng
 * ============================================================================
 */
export const DataTable = ({ records = [], loading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('publishDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Logic sắp xếp
  const sortedRecords = useMemo(() => {
    const list = [...records];
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = (Number(a.score) || 0) - (Number(b.score) || 0);
      } else if (sortField === 'publishDate') {
        const dateA = a.publishDate || a.publishYear || '';
        const dateB = b.publishDate || b.publishYear || '';
        comparison = String(dateA).localeCompare(String(dateB));
      } else if (sortField === 'title') {
        comparison = String(a.title || '').localeCompare(String(b.title || ''));
      } else if (sortField === 'journal') {
        comparison = String(a.journal || '').localeCompare(String(b.journal || ''));
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [records, sortField, sortOrder]);

  // Logic phân trang
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Xử lý đổi chiều sắp xếp
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Badge màu điểm HĐGS
  const getScoreBadge = (score, display) => {
    const num = Number(score) || 0;
    const label = display || num.toString();

    if (num >= 1.0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
          {label} điểm
        </span>
      );
    }
    if (num >= 0.75) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10">
          {label} điểm
        </span>
      );
    }
    if (num >= 0.5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10">
          {label} điểm
        </span>
      );
    }
    if (num >= 0.25) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30">
          {label} điểm
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        {label || '0'} điểm
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/4"></div>
          <div className="h-10 bg-slate-800/60 rounded w-full"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-800/40 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:base font-bold text-white flex items-center gap-2">
            Bảng Tra cứu & Thẩm định Chi tiết
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              {records.length} bản ghi
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu đồng bộ trực tiếp từ Google Sheets, tự động chuẩn hóa HĐGS và xác thực minh chứng
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400">Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10 dòng / trang</option>
            <option value={25}>25 dòng / trang</option>
            <option value={50}>50 dòng / trang</option>
            <option value={100}>100 dòng / trang</option>
          </select>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th
                onClick={() => handleSort('title')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tên bài báo</span>
                  {sortField === 'title' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4">Tác giả liên hệ</th>
              <th
                onClick={() => handleSort('journal')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tạp chí / Kỷ yếu</span>
                  {sortField === 'journal' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Điểm HĐGS</span>
                  {sortField === 'score' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('publishDate')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Ngày xuất bản</span>
                  {sortField === 'publishDate' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4">Tập / Số / Trang</th>
              <th className="py-3 px-4 text-center">Minh chứng</th>
              <th className="py-3 px-3 text-center">Thẩm định</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p className="font-medium text-slate-300">Không tìm thấy bài báo nào khớp với bộ lọc</p>
                    <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh điều kiện lọc năm / điểm</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-center text-xs text-slate-500 font-mono">
                      {globalIndex}
                    </td>

                    {/* Tên bài báo */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-medium text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug" title={item.title}>
                        {item.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                        {item.qRank && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                            {item.qRank}
                          </span>
                        )}
                        {item.category && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300 font-medium border border-blue-500/30 truncate max-w-[120px]">
                            {item.category}
                          </span>
                        )}
                        {item.authorCount > 1 && (
                          <span className="text-[11px] text-slate-400">
                            {item.authorCount} tác giả
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tác giả liên hệ */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-slate-200">
                      {item.correspondingAuthor || '—'}
                    </td>

                    {/* Tạp chí / Kỷ yếu */}
                    <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs">
                      <p className="line-clamp-2 font-medium" title={item.journal}>
                        {item.journal}
                      </p>
                      {item.issn && (
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                          ISSN: {item.issn}
                        </span>
                      )}
                    </td>

                    {/* Điểm HĐGS */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getScoreBadge(item.score, item.scoreDisplay)}
                    </td>

                    {/* Ngày xuất bản */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap text-xs text-slate-300">
                      {item.publishDate || (item.publishYear ? `Năm ${item.publishYear}` : '—')}
                    </td>

                    {/* Tập / Số / Trang */}
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[150px] truncate" title={item.volumeIssuePage}>
                      {item.volumeIssuePage || '—'}
                    </td>

                    {/* Minh chứng PDF */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.proofLinks && item.proofLinks.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={item.proofLinks[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover:text-emerald-200 border border-emerald-500/40 transition-all shadow-sm"
                            title="Mở tài liệu minh chứng trong tab mới"
                          >
                            <span>🔗 Xem PDF</span>
                          </a>
                          {item.proofLinks.length > 1 && (
                            <span className="text-[10px] text-slate-500 font-mono" title={`Còn ${item.proofLinks.length - 1} link minh chứng khác`}>
                              +{item.proofLinks.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Không có link</span>
                      )}
                    </td>

                    {/* Nút Xem chi tiết */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
                        title="Xem chi tiết hồ sơ thẩm định"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 bg-slate-950/40">
        <div>
          Trang <span className="text-white font-bold">{currentPage}</span> / <span className="text-white font-bold">{totalPages}</span> (Tổng cộng {sortedRecords.length} bài báo)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 transition-colors"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white font-bold">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 transition-colors"
            title="Trang tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Thẩm định Chi tiết Hồ sơ */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <span>Hồ sơ Thẩm định Bài báo Nghiên cứu Khoa học</span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-white mb-4 leading-snug">
              {selectedRecord.title}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Tác giả liên hệ:</span>
                <span className="text-slate-100 font-bold text-sm">
                  {selectedRecord.correspondingAuthor}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Điểm HĐGS công nhận:</span>
                {getScoreBadge(selectedRecord.score, selectedRecord.scoreDisplay)}
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Tên Tạp chí / Kỷ yếu:</span>
                <span className="text-slate-200 font-medium">
                  {selectedRecord.journal}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Thời gian xuất bản:</span>
                <span className="text-slate-200">
                  {selectedRecord.publishDate || (selectedRecord.publishYear ? `Năm ${selectedRecord.publishYear}` : 'Chưa rõ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Tập, số, trang:</span>
                <span className="text-slate-200">
                  {selectedRecord.volumeIssuePage || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Mã ISSN:</span>
                <span className="text-slate-200 font-mono">
                  {selectedRecord.issn || '—'}
                </span>
              </div>
              {selectedRecord.qRank && (
                <div>
                  <span className="text-slate-400 block mb-1">Phân hạng Q (Scopus/ISI):</span>
                  <span className="text-purple-300 font-bold">
                    {selectedRecord.qRank}
                  </span>
                </div>
              )}
              {selectedRecord.category && (
                <div>
                  <span className="text-slate-400 block mb-1">Danh mục Tạp chí:</span>
                  <span className="text-blue-300 font-semibold">
                    {selectedRecord.category}
                  </span>
                </div>
              )}
              {selectedRecord.impactFactor && (
                <div>
                  <span className="text-slate-400 block mb-1">Chỉ số IF (Impact Factor):</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedRecord.impactFactor}
                  </span>
                </div>
              )}
              {selectedRecord.doi && (
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Mã DOI:</span>
                  <span className="text-slate-300 font-mono break-all">
                    {selectedRecord.doi}
                  </span>
                </div>
              )}
            </div>

            {/* Danh sách đồng tác giả */}
            <div className="mb-4">
              <span className="text-xs text-slate-400 block mb-1.5">
                Nhóm tác giả ({selectedRecord.authorCount} người):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRecord.authors && selectedRecord.authors.length > 0 ? (
                  selectedRecord.authors.map((auth, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                    >
                      {auth}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Chưa cập nhật danh sách</span>
                )}
              </div>
            </div>

            {/* Tất cả các cột từ Google Sheet gốc (Hiển thị đầy đủ mọi dữ liệu tùy biến) */}
            {selectedRecord.rawRecord && Object.keys(selectedRecord.rawRecord).length > 0 && (
              <div className="mb-4 pt-3 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Toàn bộ các cột từ Google Sheet ({Object.keys(selectedRecord.rawRecord).length} cột):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  {Object.entries(selectedRecord.rawRecord).map(([key, val], i) => (
                    <div key={i} className="flex flex-col bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-blue-400/90 font-mono font-bold truncate" title={key}>{key}</span>
                      <span className="text-slate-200 text-xs break-words mt-0.5">{String(val || '—')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer modal with links */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Email khai báo: {selectedRecord.email || '—'}
              </span>
              {selectedRecord.proofLinks && selectedRecord.proofLinks.length > 0 ? (
                <a
                  href={selectedRecord.proofLinks[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md shadow-emerald-900/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  Mở Minh Chứng PDF (Google Drive)
                </a>
              ) : (
                <span className="text-xs text-slate-500 italic">Không có liên kết minh chứng</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
