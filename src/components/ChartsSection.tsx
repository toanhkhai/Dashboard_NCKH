import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/**
 * ============================================================================
 * COMPONENT: ChartsSection
 * ============================================================================
 * Cụm 3 biểu đồ trực quan hóa dữ liệu Recharts:
 * 1. Bar Chart: Số lượng bài báo công bố theo năm
 * 2. Donut / Pie Chart: Phân bổ tỷ lệ % theo mốc điểm HĐGS
 * 3. Horizontal Bar Chart: Top 10 tạp chí có số bài đăng nhiều nhất
 * ============================================================================
 */

const SCORE_COLORS: Record<string, string> = {
  '1.0 điểm': '#10B981', // emerald-500
  '0.75 điểm': '#3B82F6', // blue-500
  '0.5 điểm': '#F59E0B', // amber-500
  '0.25 điểm': '#94A3B8', // slate-400
  'Khác/0đ': '#64748B', // slate-500
};

export interface ChartsSectionProps {
  records?: any[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ records = [] }) => {
  // 1. Chuẩn bị dữ liệu số bài báo theo từng năm
  const yearData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      const yr = String(r.publishYear || 'Khác');
      if (yr.length === 4 && (yr.startsWith('20') || yr.startsWith('19'))) {
        counts[yr] = (counts[yr] || 0) + 1;
      } else {
        counts['Khác'] = (counts['Khác'] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .sort((a, b) => {
        if (a === 'Khác') return 1;
        if (b === 'Khác') return -1;
        return a.localeCompare(b);
      })
      .map((yr) => ({
        year: yr,
        count: counts[yr],
      }));
  }, [records]);

  // 2. Chuẩn bị dữ liệu phân bổ điểm HĐGS
  const scoreData = useMemo(() => {
    const counts: Record<string, number> = {
      '1.0 điểm': 0,
      '0.75 điểm': 0,
      '0.5 điểm': 0,
      '0.25 điểm': 0,
      'Khác/0đ': 0,
    };

    records.forEach((r) => {
      const score = Number(r.score) || 0;
      if (Math.abs(score - 1.0) < 0.01) counts['1.0 điểm']++;
      else if (Math.abs(score - 0.75) < 0.01) counts['0.75 điểm']++;
      else if (Math.abs(score - 0.5) < 0.01) counts['0.5 điểm']++;
      else if (Math.abs(score - 0.25) < 0.01) counts['0.25 điểm']++;
      else counts['Khác/0đ']++;
    });

    const total = records.length || 1;
    return Object.entries(counts)
      .filter(([_, val]) => val > 0)
      .map(([name, val]) => ({
        name,
        value: val,
        percentage: ((val / total) * 100).toFixed(1),
      }));
  }, [records]);

  // 3. Chuẩn bị dữ liệu Top 10 tạp chí
  const topJournalsData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      const j = r.journal || 'Chưa phân loại';
      if (j && j !== 'Chưa phân loại') {
        counts[j] = (counts[j] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
      }));
  }, [records]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Biểu đồ 1: Số lượng bài báo theo năm */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
          Bài báo công bố theo năm
        </h4>
        <div className="h-64 w-full">
          {yearData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Bar dataKey="count" name="Số bài" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Biểu đồ 2: Phân bổ tỷ lệ % điểm HĐGS */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          Phân bổ tỷ lệ điểm HĐGS
        </h4>
        <div className="h-64 w-full">
          {scoreData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {scoreData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={SCORE_COLORS[entry.name] || '#64748B'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} bài (${item.payload.percentage}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Biểu đồ 3: Top 10 Tạp chí có số lượng bài đăng nhiều nhất */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          Top 10 Tạp chí đăng nhiều nhất
        </h4>
        <div className="h-64 w-full">
          {topJournalsData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topJournalsData}
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                  tickFormatter={(val) => (val.length > 16 ? `${val.slice(0, 16)}...` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Bar dataKey="count" name="Số bài" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
