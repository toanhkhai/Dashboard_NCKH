/**
 * ============================================================================
 * UTILITY: URL CONVERTER - GOOGLE SHEETS AUTO-DETECTION & MULTI-ENDPOINT SUPPORT
 * ============================================================================
 * Tự động nhận diện và chuyển đổi BẤT KỲ link Google Sheets nào thành
 * endpoint đọc dữ liệu CSV tương thích 100%.
 *
 * Hỗ trợ tất cả các định dạng URL:
 * 1. Link chia sẻ:    https://docs.google.com/spreadsheets/d/{ID}/edit?usp=sharing
 * 2. Link edit có gid: https://docs.google.com/spreadsheets/d/{ID}/edit#gid=123
 * 3. Link export CSV: https://docs.google.com/spreadsheets/d/{ID}/export?format=csv
 * 4. Link GViz:       https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv
 * 5. Link xuất bản web (Publish to web):
 *    https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml
 *    https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
 * 6. Link rút gọn/trực tiếp: https://docs.google.com/spreadsheets/d/{ID}
 * ============================================================================
 */

/**
 * Phân tích và trích xuất thông tin từ URL Google Sheet
 * @param {string} rawUrl - URL do người dùng cung cấp
 * @returns {{
 *   isGoogleSheet: boolean,
 *   isPublished: boolean,
 *   spreadsheetId: string | null,
 *   pubId: string | null,
 *   gid: string | null,
 *   primaryUrl: string,
 *   exportUrl: string | null
 * }}
 */
export function parseGoogleSheetUrl(rawUrl) {
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

    // GViz endpoint (Primary - có hỗ trợ CORS đầy đủ)
    // QUAN TRỌNG: KHÔNG ép gid=0 nếu link gốc không có gid!
    // Khi không truyền gid, Google GViz sẽ tự động lấy Sheet đầu tiên của bảng tính.
    // Nếu truyền gid=0 vào bảng tính mà sheet đầu tiên có ID khác 0, Google sẽ báo lỗi Sheet not found!
    const primaryGvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${gidParam}`;

    // Direct Export endpoint (Fallback nếu GViz gặp sự cố)
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

  // Không phải link docs.google.com tiêu chuẩn
  // Có thể là link CSV trực tiếp khác hoặc URL bên ngoài
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

/**
 * Chuyển đổi bất kỳ link Google Sheet nào sang endpoint CSV chuẩn
 * @param {string} rawUrl - URL gốc
 * @returns {string} URL endpoint GViz CSV hoặc CSV export
 */
export function convertToGvizUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const parsed = parseGoogleSheetUrl(rawUrl);
  return parsed.primaryUrl || rawUrl.trim();
}
