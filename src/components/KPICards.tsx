import React from 'react';
import { FileText, Award, BarChart3, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENT: KPICards
 * ============================================================================
 * Hiển thị các thẻ chỉ số KPI cốt lõi của nghiên cứu khoa học:
 * - Tổng số bài báo công bố
 * - Tổng điểm HĐGS tích lũy (Sum)
 * - Điểm HĐGS trung bình / bài (Avg)
 * - Số lượng Tác giả liên hệ độc lập (hoặc số bài Q1/Q2)
 * ============================================================================
 */
export const KPICards = ({ records = [], isSource2 = false, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg animate-pulse"
          >
            <div className="h-4 bg-slate-800 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-slate-700/60 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalArticles = records.length;

  // Tính tổng điểm HĐGS tích lũy
  const totalScore = records.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);

  // Điểm trung bình / bài
  const avgScore = totalArticles > 0 ? (totalScore / totalArticles).toFixed(2) : '0.00';

  // Số lượng tác giả liên hệ độc lập (lọc bỏ các giá trị rỗng hoặc mặc định)
  const uniqueAuthors = new Set(
    records
      .map((r) => r.correspondingAuthor)
      .filter((a) => a && a !== 'Chưa cập nhật' && a !== '—')
  ).size;

  // Thống kê minh chứng Google Drive
  const proofCount = records.filter((r) => r.proofLinks && r.proofLinks.length > 0).length;
  const proofPercentage = totalArticles > 0 ? Math.round((proofCount / totalArticles) * 100) : 0;

  // Thống kê phân hạng Q1 & Q2 cho nguồn Mở rộng / Quốc tế
  const q1Count = records.filter((r) => r.qRank === 'Q1').length;
  const q2Count = records.filter((r) => r.qRank === 'Q2').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Tổng số bài báo công bố */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/40 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Tổng số bài báo
            </p>
            <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              {totalArticles.toLocaleString('vi-VN')}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã kiểm tra hồ sơ</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* KPI 2: Tổng điểm HĐGS tích lũy */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Tổng điểm HĐGS tích lũy
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1 tracking-tight">
              {totalScore.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Điểm quy đổi HĐ Giáo sư Nhà nước
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* KPI 3: Điểm HĐGS Trung bình / Bài */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Điểm HĐGS trung bình
            </p>
            <h3 className="text-3xl font-extrabold text-cyan-400 mt-1 tracking-tight">
              {avgScore}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Điểm trung bình / mỗi bài báo
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* KPI 4: Tác giả liên hệ độc lập hoặc Phân hạng Q */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {isSource2 ? 'Bài báo Q1 / Q2 (Scopus/ISI)' : 'Tác giả liên hệ độc lập'}
            </p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1 tracking-tight">
              {isSource2 ? `${q1Count + q2Count} bài` : uniqueAuthors}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isSource2
                ? `Q1: ${q1Count} | Q2: ${q2Count} bài`
                : `Minh chứng Drive: ${proofPercentage}%`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            {isSource2 ? <ShieldCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </div>
  );
};
