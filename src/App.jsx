import React, { useState, useMemo } from 'react';
import { useGoogleSheet } from './hooks/useGoogleSheet.js';
import { exportToCleanCSV } from './utils/cleanData.js';
import { Header } from './components/Header.jsx';
import { KPICards } from './components/KPICards.jsx';
import { ChartsSection } from './components/ChartsSection.jsx';
import { DataTable } from './components/DataTable.jsx';
import { GlobalFilterBar } from './components/GlobalFilterBar.jsx';
import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import { DEFAULT_SHEET1_URL, DEFAULT_SHEET2_URL } from './data/rawSheetData.js';

export default function App() {
  const sheet1Url = DEFAULT_SHEET1_URL;
  const sheet2Url = DEFAULT_SHEET2_URL;

  const sheet1 = useGoogleSheet(sheet1Url, 'source1');
  const sheet2 = useGoogleSheet(sheet2Url, 'source2');

  const [filters, setFilters] = useState({
    search: '',
    year: '',
    score: 'all',
    journal: 'all',
    qRank: 'all',
    sourceType: 'all',
  });

  const activeView = filters.sourceType === 'all' ? 'combined' : filters.sourceType;

  const activeRecords = useMemo(() => {
    if (activeView === 'source1') return sheet1.data;
    if (activeView === 'source2') return sheet2.data;
    return [...sheet1.data, ...sheet2.data];
  }, [activeView, sheet1.data, sheet2.data]);

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

      if (filters.year && filters.year !== 'all') {
        const query = String(filters.year).trim();
        if (query) {
          const recYearStr = String(record.publishYear || '').trim();
          const recYearNum = parseInt(recYearStr, 10);

          // Hỗ trợ lọc theo khoảng năm: VD "2020-2024" hoặc "2020 - 2024"
          const rangeMatch = query.match(/^(\d{4})\s*[-–—:]\s*(\d{4})$/);
          // Hỗ trợ so sánh: VD ">=2020", ">2020", "<=2024", "<2024"
          const gteMatch = query.match(/^(?:>=|>)\s*(\d{4})$/);
          const lteMatch = query.match(/^(?:<=|<)\s*(\d{4})$/);

          if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            if (isNaN(recYearNum) || recYearNum < min || recYearNum > max) {
              return false;
            }
          } else if (gteMatch) {
            const threshold = parseInt(gteMatch[1], 10);
            const isStrict = query.startsWith('>');
            if (isNaN(recYearNum) || (isStrict ? recYearNum <= threshold : recYearNum < threshold)) {
              return false;
            }
          } else if (lteMatch) {
            const threshold = parseInt(lteMatch[1], 10);
            const isStrict = query.startsWith('<');
            if (isNaN(recYearNum) || (isStrict ? recYearNum >= threshold : recYearNum > threshold)) {
              return false;
            }
          } else {
            // So sánh chính xác năm (Ví dụ: gõ "1" thì tìm đúng năm "1" -> 0 kết quả; gõ "2025" -> ra đúng năm 2025)
            if (recYearStr !== query) return false;
          }
        }
      }

      if (filters.score !== 'all') {
        if (record.sourceType === 'source2' && Number(record.score) === 0) return false;
        const targetScore = parseFloat(filters.score);
        if (Math.abs(Number(record.score) - targetScore) > 0.01) return false;
      }

      if (filters.journal !== 'all') {
        if (record.journal !== filters.journal) return false;
      }

      if (filters.qRank !== 'all') {
        if (filters.qRank === 'Khác') {
          if (record.sourceType !== 'source2') return false;
          if (['Q1', 'Q2', 'Q3', 'Q4'].includes(record.qRank)) return false;
        } else {
          if (record.qRank !== filters.qRank) return false;
        }
      }

      if (filters.sourceType && filters.sourceType !== 'all') {
        if (record.sourceType !== filters.sourceType) return false;
      }

      return true;
    });
  }, [activeRecords, filters]);

  const currentLoading =
    activeView === 'source1'
      ? sheet1.loading
      : activeView === 'source2'
        ? sheet2.loading
        : sheet1.loading || sheet2.loading;

  const currentError =
    activeView === 'source1'
      ? sheet1.error
      : activeView === 'source2'
        ? sheet2.error
        : (sheet1.error && sheet2.error ? `${sheet1.error} | ${sheet2.error}` : null);

  const currentWarning =
    activeView === 'source1'
      ? sheet1.warning
      : activeView === 'source2'
        ? sheet2.warning
        : (sheet1.warning || sheet2.warning || (sheet1.error ? `Nguồn 1: ${sheet1.error}` : sheet2.error ? `Nguồn 2: ${sheet2.error}` : null));

  const currentLastUpdated =
    activeView === 'source1'
      ? sheet1.lastUpdated
      : activeView === 'source2'
        ? sheet2.lastUpdated
        : sheet1.lastUpdated || sheet2.lastUpdated;

  const handleExportCSV = () => {
    const tabName =
      activeView === 'source1'
        ? 'NgoaiTruong'
        : activeView === 'source2'
          ? 'MoRong_QuocTe'
          : 'TongHop';
    const filename = `CTUMP_Research_${tabName}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCleanCSV(filteredRecords, filename);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200`}>
      <Header
        activeTab={activeView}
        onTabChange={() => {}}
        recordCount={activeRecords.length}
        source1Count={sheet1.data.length}
        source2Count={sheet2.data.length}
        lastUpdated={currentLastUpdated}
        loading={currentLoading}
        error={currentError}
        onExportCSV={handleExportCSV}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentError && (
          <div className="mb-6 p-4 rounded-sm bg-red-50 border border-red-200 flex items-start gap-3.5 text-red-800 text-xs sm:text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-red-900">Không thể đọc dữ liệu từ Google Sheets:</div>
              <p className="mt-1 leading-relaxed">{currentError}</p>
              <div className="mt-3 flex items-center flex-wrap gap-2.5">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                >
                  <span>Tải lại trang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentError && currentWarning && (
          <div className="mb-6 p-3 rounded-sm bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-800 text-xs">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="flex-1">{currentWarning}</p>
          </div>
        )}

        {!currentLoading && activeRecords.length === 0 && !currentError && (
          <div className="my-12 text-center p-8 bg-white border border-slate-200 max-w-lg mx-auto shadow-sm">
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có dữ liệu từ Google Sheet</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bảng tính hiện tại chưa có dữ liệu hoặc bạn chưa cấu hình link Google Sheet.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Tải lại trang để thử lại</span>
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
              isSource2={activeView === 'source2'}
              isCombined={true}
            />

            <KPICards
              records={filteredRecords}
              isSource2={activeView === 'source2'}
              activeTab={activeView}
              loading={currentLoading}
            />

            <ChartsSection records={filteredRecords} activeTab={activeView} />

            <DataTable
              records={filteredRecords}
              loading={currentLoading}
            />
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 px-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-600">
          Trường Đại học Y Dược Cần Thơ - Phòng Khoa học và Công nghệ
        </p>
      </footer>
    </div>
  );
}
