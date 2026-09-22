/**
 * ============================================================================
 * CTUMP RESEARCH METRICS & AUDIT PORTAL - UNIVERSAL DATA PIPELINE
 * ============================================================================
 */

export function normalizeStr(str: any): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function findColKey(row: Record<string, any>, candidates: string[]): string | undefined {
  if (!row || typeof row !== 'object') return undefined;
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const normCand = normalizeStr(candidate);
    const found = keys.find((k) => normalizeStr(k).includes(normCand));
    if (found) return found;
  }
  return undefined;
}

export interface SheetValidationResult {
  isValid: boolean;
  isStandardCtump: boolean;
  missingCols: string[];
  message: string;
}

export function validateSheetStructure(headers: string[], sourceType: 'source1' | 'source2' = 'source1'): SheetValidationResult {
  if (!Array.isArray(headers) || headers.length === 0) {
    return {
      isValid: false,
      isStandardCtump: false,
      missingCols: ['Không có cột dữ liệu'],
      message: 'Bảng tính không có dữ liệu hoặc file không đúng định dạng CSV.',
    };
  }

  const headerRow: Record<string, boolean> = {};
  headers.forEach((h) => {
    if (h) headerRow[h] = true;
  });

  const missingCols: string[] = [];

  const hasTitle = Boolean(findColKey(headerRow, [
    'tên bài báo', 'tiêu đề', 'title', 'tên đề tài', 'tên bài', 'bài báo', 'tên công trình', 'công trình', 'tên', 'name'
  ]));
  if (!hasTitle) missingCols.push('Tên bài báo / Tiêu đề');

  const hasJournal = Boolean(findColKey(headerRow, [
    'tạp chí', 'journal', 'kỷ yếu', 'nơi công bố', 'nơi xuất bản', 'đơn vị', 'nguồn', 'source'
  ]));
  if (!hasJournal) missingCols.push('Tên tạp chí / Nơi công bố');

  if (sourceType === 'source1') {
    const hasScore = Boolean(findColKey(headerRow, ['số điểm', 'điểm của tạp chí', 'điểm', 'score', 'hdgs']));
    if (!hasScore) missingCols.push('Số điểm HĐGS');
  } else {
    const hasSource2Col = Boolean(
      findColKey(headerRow, [
        'xếp hạng chất lượng q', 'xếp hạng q', 'q-rank', 'chất lượng q', 'danh mục', 'chỉ số if', 'impact factor', 'họ và tên người nhập'
      ])
    );
    if (!hasSource2Col) missingCols.push('Phân hạng Q / Danh mục');
  }

  const isStandardCtump = missingCols.length === 0;

  return {
    isValid: headers.length > 0,
    isStandardCtump,
    missingCols,
    message: isStandardCtump
      ? 'Cấu trúc danh mục NCKH chuẩn xác.'
      : `Bảng tính tùy biến (${headers.length} cột). Hệ thống tự động trích xuất thông tin phù hợp.`,
  };
}

export function extractScore(val: any): { score: number; display: string } {
  if (val === null || val === undefined) return { score: 0, display: '0' };
  const str = String(val).trim();
  if (!str) return { score: 0, display: '0' };

  const normalizedStr = str.replace(/,/g, '.');
  const match = normalizedStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num)) {
      return { score: num, display: num.toString() };
    }
  }
  return { score: 0, display: '0' };
}

export function extractYear(val: any): { year: string; fullDate: string } {
  if (!val) return { year: 'Chưa rõ', fullDate: '' };
  const str = String(val).trim();

  const yearMatch = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    return { year: yearMatch[1], fullDate: str };
  }

  const parts = str.split(/[/.-]/);
  if (parts.length >= 3) {
    const lastPart = parts[2].trim();
    if (lastPart.length === 4 && !isNaN(Number(lastPart))) {
      return { year: lastPart, fullDate: str };
    }
    const firstPart = parts[0].trim();
    if (firstPart.length === 4 && !isNaN(Number(firstPart))) {
      return { year: firstPart, fullDate: str };
    }
  }

  return { year: 'Khác', fullDate: str };
}

export function extractProofLinks(val: any): string[] {
  if (!val) return [];
  const str = String(val);
  const urlRegex = /(https?:\/\/[^\s,;"<>]+)/g;
  const matches = str.match(urlRegex) || [];
  return Array.from(new Set(matches.map((url) => url.trim().replace(/[.,;)]+$/, ''))));
}

export function normalizeJournalName(rawName: any): string {
  if (!rawName) return 'Chưa phân loại';
  let cleaned = String(rawName)
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Chưa phân loại';

  const lower = cleaned.toLowerCase();

  if (lower.includes('y học việt nam') || lower.includes('y hoc viet nam') || lower === 'vietnam medical journal') {
    return 'Tạp chí Y học Việt Nam';
  }
  if (lower.includes('nghiên cứu y học') || lower.includes('nghien cuu y hoc')) {
    return 'Tạp chí Nghiên cứu Y học';
  }
  if (lower.includes('y học cộng đồng') || lower.includes('y hoc cong dong') || lower.includes('community medicine')) {
    return 'Tạp chí Y học Cộng đồng';
  }
  if (lower.includes('y dược học cần thơ') || lower.includes('y duoc hoc can tho')) {
    return 'Tạp chí Y Dược học Cần Thơ';
  }
  if (lower.includes('tim mạch học việt nam') || lower.includes('tim mach hoc')) {
    return 'Tạp chí Tim mạch học Việt Nam';
  }
  if (lower.includes('hồng bàng') || lower.includes('hong bang')) {
    return 'Tạp chí Khoa học ĐH Quốc tế Hồng Bàng';
  }
  if (lower.includes('đại học cần thơ') || lower.includes('dai hoc can tho')) {
    return 'Tạp chí Khoa học ĐH Cần Thơ';
  }
  if (lower.includes('giáo dục và xã hội') || lower.includes('giao duc va xa hoi')) {
    return 'Tạp chí Giáo dục và Xã hội';
  }
  if (lower.includes('y dược huế') || lower.includes('y duoc hue')) {
    return 'Tạp chí Y Dược Huế';
  }
  if (lower.includes('y dược học quân sự') || lower.includes('y duoc hoc quan su')) {
    return 'Tạp chí Y Dược học Quân sự';
  }
  if (lower.includes('khoa học điều dưỡng') || lower.includes('dieu duong')) {
    return 'Tạp chí Khoa học Điều dưỡng';
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function parseAuthors(val: any): string[] {
  if (!val) return [];
  const str = String(val);
  return str
    .split(/[,;\n]/)
    .map((author) => {
      return author
        .replace(/[0-9*†‡§]+/g, '')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .trim();
    })
    .filter((a) => a.length > 1);
}

export function cleanRawRecord(row: Record<string, any>, index: number, forcedSource?: 'source1' | 'source2'): any {
  if (!row || typeof row !== 'object') {
    return {
      id: `rec-empty-${index}`,
      title: `Bản ghi #${index + 1}`,
      journal: '—',
      score: 0,
      scoreDisplay: '0',
      publishDate: '',
      publishYear: 'Chưa rõ',
      authors: [],
      authorCount: 0,
      correspondingAuthor: '—',
      proofLinks: [],
      rawRecord: {},
    };
  }

  const entries = Object.entries(row);

  const hasQRank = findColKey(row, ['chất lượng q', 'xếp hạng q', 'q-rank', 'ranking q']);
  const hasCategory = findColKey(row, ['danh mục', 'category', 'scopus', 'isi']);
  const isSource2 = forcedSource === 'source2' || (!forcedSource && (hasQRank || hasCategory || findColKey(row, ['họ và tên người nhập'])));
  const sourceType = isSource2 ? 'source2' : (forcedSource || 'source1');

  const titleKey = findColKey(row, [
    'tên bài báo', 'tiêu đề', 'title', 'tên đề tài', 'tên bài', 'bài báo',
    'tên công trình', 'công trình', 'tên', 'name', 'đề tài', 'chủ đề', 'topic',
    'nội dung', 'content', 'mô tả', 'description', 'sản phẩm', 'nhiệm vụ'
  ]);

  let title = '';
  if (titleKey && row[titleKey]) {
    title = String(row[titleKey]).replace(/^["'\s]+|["'\s]+$/g, '').trim();
  }

  if (!title) {
    const textEntry = entries.find(([k, v]) => {
      if (!v) return false;
      const str = String(v).trim();
      const normK = normalizeStr(k);
      if (normK === 'stt' || normK === 'id' || normK === 'no' || normK.includes('link') || normK.includes('url')) return false;
      return str.length >= 3 && !/^\d+$/.test(str) && !str.startsWith('http');
    });
    if (textEntry) {
      title = String(textEntry[1]).trim();
    }
  }
  if (!title) {
    title = `Bản ghi #${index + 1}`;
  }

  const journalKey = findColKey(row, [
    'tên tạp chí', 'tên tạp chí, kỷ yếu', 'tạp chí', 'journal', 'kỷ yếu',
    'nơi công bố', 'nơi xuất bản', 'đơn vị', 'nguồn', 'source', 'publisher',
    'khoa', 'phòng', 'bộ môn', 'chuyên ngành', 'danh mục', 'category', 'cơ quan', 'tổ chức'
  ]);
  let rawJournal = journalKey && row[journalKey] ? String(row[journalKey]) : '';
  
  if (!rawJournal) {
    const secondTextEntry = entries.find(([k, v]) => {
      if (!v) return false;
      const str = String(v).trim();
      const normK = normalizeStr(k);
      if (k === titleKey || normK === 'stt' || normK === 'id' || normK.includes('link')) return false;
      return str.length >= 2 && !/^\d+$/.test(str) && !str.startsWith('http');
    });
    if (secondTextEntry) {
      rawJournal = String(secondTextEntry[1]).trim();
    }
  }
  const journal = rawJournal ? normalizeJournalName(rawJournal) : 'Chưa phân loại';

  const scoreKey = findColKey(row, [
    'số điểm', 'điểm của tạp chí', 'điểm', 'score', 'hdgs', 'hội đồng giáo sư',
    'point', 'points', 'giá trị', 'điểm số', 'thang điểm', 'kết quả'
  ]);
  let { score, display: scoreDisplay } = scoreKey ? extractScore(row[scoreKey]) : { score: 0, display: '0' };

  const dateKey = findColKey(row, [
    'ngày, tháng, năm', 'ngày xuất bản', 'ngày công bố', 'ngày', 'date',
    'thời gian xuất bản', 'thời gian', 'năm', 'year', 'năm xuất bản', 'thời điểm'
  ]);
  const { year: publishYear, fullDate: publishDate } = dateKey ? extractYear(row[dateKey]) : { year: 'Chưa rõ', fullDate: '' };

  const authorsKey = findColKey(row, [
    'nhóm tác giả', 'danh sách tác giả', 'tác giả', 'authors', 'author',
    'họ và tên', 'họ tên', 'người thực hiện', 'chủ nhiệm', 'thành viên',
    'họ và tên người nhập', 'người nhập', 'cán bộ', 'nhân sự'
  ]);
  const authors = authorsKey ? parseAuthors(row[authorsKey]) : [];
  const authorCount = authors.length || 1;

  const correspondingKey = findColKey(row, [
    'tác giả liên hệ', 'corresponding', 'tác giả chịu trách nhiệm',
    'chủ nhiệm', 'chủ trì', 'người liên hệ', 'người phụ trách'
  ]);
  let correspondingAuthor = correspondingKey && row[correspondingKey] ? String(row[correspondingKey]).trim() : '';
  correspondingAuthor = correspondingAuthor.replace(/[0-9*†‡§]+/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim();

  if (!correspondingAuthor && authors.length > 0) {
    correspondingAuthor = authors[0];
  }

  const proofKey = findColKey(row, [
    'minh chứng', 'tải file minh chứng', 'drive.google.com', 'proof', 'link file',
    'link', 'url', 'liên kết', 'tài liệu', 'file minh chứng', 'file', 'đường dẫn'
  ]);
  let proofLinks = proofKey ? extractProofLinks(row[proofKey]) : [];

  entries.forEach(([_, val]) => {
    if (val && typeof val === 'string' && val.includes('http')) {
      const foundUrls = extractProofLinks(val);
      foundUrls.forEach((u) => {
        if (!proofLinks.includes(u)) proofLinks.push(u);
      });
    }
  });

  const volumeKey = findColKey(row, ['tập, số, trang', 'tập (số), trang', 'volume', 'issue', 'page', 'số trang']);
  const volumeIssuePage = volumeKey && row[volumeKey] ? String(row[volumeKey]).trim() : '';

  const issnKey = findColKey(row, ['issn', 'isbn']);
  const issn = issnKey && row[issnKey] ? String(row[issnKey]).trim() : '';

  const categoryKey = findColKey(row, ['tạp chí nằm trong danh mục', 'danh mục', 'category', 'loại']);
  const category = categoryKey && row[categoryKey] ? String(row[categoryKey]).trim() : '';

  const qRankKey = findColKey(row, ['xếp hạng chất lượng q', 'xếp hạng q', 'q-rank', 'ranking q', 'chất lượng q', 'q rank', 'hạng q']);
  let qRank = qRankKey && row[qRankKey] ? String(row[qRankKey]).trim().toUpperCase() : '';
  if (qRank && !['Q1', 'Q2', 'Q3', 'Q4'].includes(qRank)) {
    const qMatch = qRank.match(/\b(Q[1-4])\b/i);
    qRank = qMatch ? qMatch[1].toUpperCase() : (qRank.length > 15 ? `${qRank.slice(0, 15)}...` : qRank);
  }

  const ifKey = findColKey(row, ['chỉ số if', 'impact factor', 'if']);
  const impactFactor = ifKey && row[ifKey] ? String(row[ifKey]).trim() : '';

  const doiKey = findColKey(row, ['số doi', 'doi']);
  const doi = doiKey && row[doiKey] ? String(row[doiKey]).trim() : '';

  const emailKey = findColKey(row, ['địa chỉ email', 'email']);
  const email = emailKey && row[emailKey] ? String(row[emailKey]).trim() : '';

  const timeKey = findColKey(row, ['dấu thời gian', 'timestamp']);
  const timestamp = timeKey && row[timeKey] ? String(row[timeKey]).trim() : '';

  if (score === 0 && qRank) {
    if (qRank === 'Q1') score = 1.0;
    else if (qRank === 'Q2') score = 0.75;
    else if (qRank === 'Q3') score = 0.5;
    else if (qRank === 'Q4') score = 0.25;
    if (score > 0) scoreDisplay = score.toString();
  }

  return {
    id: `rec-${sourceType}-${index}-${Date.now() % 100000}`,
    timestamp,
    email,
    title,
    journal,
    issn,
    score,
    scoreDisplay: score > 0 ? score.toString() : (scoreDisplay || '0'),
    publishDate,
    publishYear,
    authors,
    authorCount,
    correspondingAuthor: correspondingAuthor || 'Chưa cập nhật',
    volumeIssuePage,
    proofLinks,
    category,
    qRank,
    impactFactor,
    doi,
    sourceType,
    rawRecord: row,
  };
}

export function cleanDataset(rawData: Array<Record<string, any>>, sourceType?: 'source1' | 'source2'): any[] {
  if (!Array.isArray(rawData)) return [];
  return rawData
    .filter((row) => {
      if (!row || typeof row !== 'object') return false;
      const values = Object.values(row).join('').trim();
      return values.length > 0;
    })
    .map((row, idx) => cleanRawRecord(row, idx, sourceType));
}

export function exportToCleanCSV(records: any[], filename = 'CTUMP_NCKH_Cleaned.csv'): void {
  if (!records || records.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const headers = [
    'STT',
    'Nguồn Dữ Liệu',
    'Tên Bài Báo',
    'Tác Giả Liên Hệ',
    'Tên Tạp Chí / Kỷ Yếu',
    'Điểm HĐGS',
    'Năm Xuất Bản',
    'Ngày Xuất Bản',
    'Số Lượng Tác Giả',
    'Danh Sách Tác Giả',
    'Tập, Số, Trang',
    'Mã ISSN',
    'Minh Chứng PDF / Drive',
    'Phân Hạng Q',
    'Chỉ Số IF',
    'Email Liên Hệ'
  ];

  const rows = records.map((r, i) => [
    i + 1,
    r.sourceType === 'source1' ? 'Nguồn 1' : 'Nguồn 2',
    `"${(r.title || '').replace(/"/g, '""')}"`,
    `"${(r.correspondingAuthor || '').replace(/"/g, '""')}"`,
    `"${(r.journal || '').replace(/"/g, '""')}"`,
    r.score,
    r.publishYear,
    `"${(r.publishDate || '').replace(/"/g, '""')}"`,
    r.authorCount,
    `"${(r.authors || []).join(', ').replace(/"/g, '""')}"`,
    `"${(r.volumeIssuePage || '').replace(/"/g, '""')}"`,
    `"${(r.issn || '').replace(/"/g, '""')}"`,
    `"${(r.proofLinks || []).join(' | ').replace(/"/g, '""')}"`,
    r.qRank || 'N/A',
    r.impactFactor || 'N/A',
    `"${(r.email || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
