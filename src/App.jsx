import React, { useState, useMemo, useEffect } from 'react';
import { useGoogleSheet } from './hooks/useGoogleSheet.js';
import { exportToCleanCSV } from './utils/cleanData.js';
import { convertToGvizUrl } from './utils/urlConverter.js';
import { Header } from './components/Header.jsx';
import { KPICards } from './components/KPICards.jsx';
import { ChartsSection } from './components/ChartsSection.jsx';
import { DataTable } from './components/DataTable.jsx';
import { GlobalFilterBar } from './components/GlobalFilterBar.jsx';
import { SheetSettingsModal } from './components/SheetSettingsModal.jsx';
import { AlertCircle, RefreshCw, Settings, FileSpreadsheet } from 'lucide-react';
import { DEFAULT_SHEET1_URL, DEFAULT_SHEET2_URL } from './data/rawSheetData.js';

/**
 * ============================================================================
 * CTUMP RESEARCH METRICS & AUDIT PORTAL - MAIN APPLICATION
 * ============================================================================
 * Đọc TRỰC TIẾP 100% từ link Google Sheets của người dùng:
 * - Không dùng dữ liệu tĩnh / bản sao lưu cố định
 * - Quăng link Google Sheet vào là hiển thị Dashboard trực tiếp
 * - Tự động nhận diện cấu trúc cột, trích xuất điểm HĐGS, tác giả, bài báo
 * ============================================================================
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('source1');

  // Quản lý Theme: 'dark' (Black) hoặc 'light' (White)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ctump_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ctump_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [sheet1Url, setSheet1Url] = useState(() => {
    const saved = localStorage.getItem('ctump_sheet1_url');
    return saved ? convertToGvizUrl(saved) : DEFAULT_SHEET1_URL;
  });
  const [sheet2Url, setSheet2Url] = useState(() => {
    const saved = localStorage.getItem('ctump_sheet2_url');
    return saved ? convertToGvizUrl(saved) : DEFAULT_SHEET2_URL;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sheet1 = useGoogleSheet(sheet1Url, 'source1');
  const sheet2 = useGoogleSheet(sheet2Url, 'source2');

  const [filters, setFilters] = useState({
    search: '',
    year: 'all',
    score: 'all',
    journal: 'all',
    qRank: 'all',
  });

  const activeRecords = useMemo(() => {
    if (activeTab === 'source1') return sheet1.data;
    if (activeTab === 'source2') return sheet2.data;
    return [...sheet1.data, ...sheet2.data];
  }, [activeTab, sheet1.data, sheet2.data]);

  const availableYears = useMemo(() => {
    const set = new Set();
    activeRecords.forEach((r) => {
      const y = String(r.publishYear || '');
      if (y && y !== 'Chưa rõ' && y !== 'Khác' && (y.startsWith('20') || y.startsWith('19'))) {
        set.add(y);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [activeRecords]);

  const availableScores = useMemo(() => {
    const set = new Set();
    activeRecords.forEach((r) => {
      if (r.score > 0) {
        set.add(r.score.toString());
      }
    });
    return Array.from(set).sort((a, b) => parseFloat(b) - parseFloat(a));
  }, [activeRecords]);

  const availableJournals = useMemo(() => {
    const map = new Map();
    activeRecords.forEach((r) => {
      const j = r.journal;
      if (j && j !== 'Chưa phân loại') {
        map.set(j, (map.get(j) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([j]) => j);
  }, [activeRecords]);

  const filteredRecords = useMemo(() => {
    return activeRecords.filter((record) => {
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchTitle = (record.title || '').toLowerCase().includes(query);
        const matchAuthor = (record.correspondingAuthor || '').toLowerCase().includes(query);
        const matchJournal = (record.journal || '').toLowerCase().includes(query);
        const matchAllAuthors = Array.isArray(record.authors)
          ? record.authors.some((a) => a.toLowerCase().includes(query))
          : false;

        if (!matchTitle && !matchAuthor && !matchJournal && !matchAllAuthors) {
          return false;
        }
      }

      if (filters.year !== 'all') {
        if (String(record.publishYear) !== filters.year) return false;
      }

      if (filters.score !== 'all') {
        const targetScore = parseFloat(filters.score);
        if (Math.abs(Number(record.score) - targetScore) > 0.01) return false;
      }

      if (filters.journal !== 'all') {
        if (record.journal !== filters.journal) return false;
      }

      if (filters.qRank !== 'all') {
        if (record.qRank !== filters.qRank) return false;
      }

      return true;
    });
  }, [activeRecords, filters]);

  const currentLoading =
    activeTab === 'source1'
      ? sheet1.loading
      : activeTab === 'source2'
        ? sheet2.loading
        : sheet1.loading || sheet2.loading;

  const currentError =
    activeTab === 'source1'
      ? sheet1.error
      : activeTab === 'source2'
        ? sheet2.error
        : (sheet1.error && sheet2.error ? `${sheet1.error} | ${sheet2.error}` : null);

  const currentWarning =
    activeTab === 'source1'
      ? sheet1.warning
      : activeTab === 'source2'
        ? sheet2.warning
        : (sheet1.warning || sheet2.warning || (sheet1.error ? `Nguồn 1: ${sheet1.error}` : sheet2.error ? `Nguồn 2: ${sheet2.error}` : null));

  const currentLastUpdated =
    activeTab === 'source1'
      ? sheet1.lastUpdated
      : activeTab === 'source2'
        ? sheet2.lastUpdated
        : sheet1.lastUpdated || sheet2.lastUpdated;

  const handleRefresh = () => {
    sheet1.refetch();
    sheet2.refetch();
  };

  const handleExportCSV = () => {
    const tabName =
      activeTab === 'source1'
        ? 'NgoaiTruong'
        : activeTab === 'source2'
          ? 'MoRong_QuocTe'
          : 'TongHop';
    const filename = `CTUMP_Research_${tabName}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCleanCSV(filteredRecords, filename);
  };

  const handleSaveUrls = (url1, url2) => {
    const finalUrl1 = convertToGvizUrl(url1);
    const finalUrl2 = convertToGvizUrl(url2);
    setSheet1Url(finalUrl1);
    setSheet2Url(finalUrl2);
    localStorage.setItem('ctump_sheet1_url', finalUrl1);
    localStorage.setItem('ctump_sheet2_url', finalUrl2);
  };

  const handleResetDefaults = () => {
    setSheet1Url(DEFAULT_SHEET1_URL);
    setSheet2Url(DEFAULT_SHEET2_URL);
    localStorage.removeItem('ctump_sheet1_url');
    localStorage.removeItem('ctump_sheet2_url');
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900 light' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200`}>
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setFilters((f) => ({ ...f, qRank: 'all', journal: 'all' }));
        }}
        recordCount={activeRecords.length}
        lastUpdated={currentLastUpdated}
        loading={currentLoading}
        error={currentError}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3.5 text-red-200 text-xs sm:text-sm shadow-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-red-300">Không thể đọc dữ liệu từ Google Sheets:</div>
              <p className="text-red-200/90 mt-1 leading-relaxed">{currentError}</p>
              <div className="mt-3 flex items-center flex-wrap gap-2.5">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-100 text-xs font-semibold border border-red-500/40 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử tải lại</span>
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Kiểm tra / Đổi link Google Sheet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentError && currentWarning && (
          <div className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center gap-3 text-blue-200 text-xs animate-fadeIn">
            <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="flex-1">{currentWarning}</p>
          </div>
        )}

        {!currentLoading && activeRecords.length === 0 && !currentError && (
          <div className="my-12 text-center p-8 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-lg mx-auto">
            <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-200 mb-1">Chưa có dữ liệu từ Google Sheet</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Bảng tính hiện tại chưa có dữ liệu hoặc bạn chưa cấu hình link Google Sheet.
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Dán link Google Sheet để bắt đầu</span>
            </button>
          </div>
        )}

        {activeRecords.length > 0 && (
          <>
            <GlobalFilterBar
              filters={filters}
              onFilterChange={setFilters}
              availableYears={availableYears}
              availableScores={availableScores}
              availableJournals={availableJournals}
              isSource2={activeTab === 'source2' || activeTab === 'combined'}
            />

            <KPICards
              records={filteredRecords}
              isSource2={activeTab === 'source2'}
              loading={currentLoading}
            />

            <ChartsSection records={filteredRecords} theme={theme} />

            <DataTable
              records={filteredRecords}
              loading={currentLoading}
            />
          </>
        )}
      </main>

      <footer className="bg-slate-900/80 border-t border-slate-800/80 py-5 px-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">
          CTUMP Research Metrics & Audit Portal • Trường Đại học Y Dược Cần Thơ
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Đồng bộ trực tiếp 100% từ Google Sheets • Tự động chuẩn hóa HĐGS, nhận diện cấu trúc bảng & Thẩm định minh chứng Drive PDF
        </p>
      </footer>

      <SheetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sheet1Url={sheet1Url}
        sheet2Url={sheet2Url}
        onSaveUrls={handleSaveUrls}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
