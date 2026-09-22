/**
 * ============================================================================
 * UTILITY: URL CONVERTER - GOOGLE SHEETS AUTO-DETECTION & MULTI-ENDPOINT SUPPORT
 * ============================================================================
 */

export interface ParsedGoogleSheetUrl {
  isGoogleSheet: boolean;
  isPublished: boolean;
  spreadsheetId: string | null;
  pubId: string | null;
  gid: string | null;
  primaryUrl: string;
  exportUrl: string | null;
}

export function parseGoogleSheetUrl(rawUrl: string): ParsedGoogleSheetUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isGoogleSheet: false,
      isPublished: false,
      spreadsheetId: null,
      pubId: null,
      gid: null,
      primaryUrl: '',
      exportUrl: null,
    };
  }

  const trimmed = rawUrl.trim();

  // 1. Trích xuất gid nếu có trong URL (?gid=xxx hoặc #gid=xxx hoặc &gid=xxx)
  const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : null;
  const gidParam = gid ? `&gid=${gid}` : '';

  // 2. Nhận diện dạng Google Sheets Xuất Bản Lên Web (/d/e/2PACX-.../pubhtml hoặc pub)
  const publishedMatch = trimmed.match(
    /docs\.google\.com\/spreadsheets\/d\/e\/([a-zA-Z0-9_-]+)/
  );
  if (publishedMatch) {
    const pubId = publishedMatch[1];
    const pubCsvUrl = `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv${gidParam}`;
    return {
      isGoogleSheet: true,
      isPublished: true,
      spreadsheetId: null,
      pubId,
      gid,
      primaryUrl: pubCsvUrl,
      exportUrl: pubCsvUrl,
    };
  }

  // 3. Nhận diện dạng Google Sheets tiêu chuẩn (/spreadsheets/d/{ID})
  const standardMatch = trimmed.match(
    /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/
  );
  if (standardMatch) {
    const spreadsheetId = standardMatch[1];
    const primaryGvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${gidParam}`;
    const exportCsvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gidParam ? `?gid=${gid}` : ''}`;

    return {
      isGoogleSheet: true,
      isPublished: false,
      spreadsheetId,
      pubId: null,
      gid,
      primaryUrl: primaryGvizUrl,
      exportUrl: exportCsvUrl,
    };
  }

  return {
    isGoogleSheet: false,
    isPublished: false,
    spreadsheetId: null,
    pubId: null,
    gid,
    primaryUrl: trimmed,
    exportUrl: null,
  };
}

export function convertToGvizUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const parsed = parseGoogleSheetUrl(rawUrl);
  return parsed.primaryUrl || rawUrl.trim();
}
