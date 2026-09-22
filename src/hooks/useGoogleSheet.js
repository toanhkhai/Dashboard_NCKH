import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { cleanDataset, validateSheetStructure } from '../utils/cleanData.js';
import { parseGoogleSheetUrl } from '../utils/urlConverter.js';

/**
 * ============================================================================
 * CUSTOM HOOK: useGoogleSheet
 * ============================================================================
 * Nạp dữ liệu TRỰC TIẾP từ link Google Sheets:
 * - Đọc trực tiếp qua Google Visualization API (GViz CSV) hoặc Direct Export CSV
 * - Chống Cache: Gắn tham số `&_nocache=${Date.now()}` và `{ cache: 'no-store' }`
 * - Chống mất dòng / gãy dòng: PapaParse chuẩn quoteChar: '"', escapeChar: '"'
 * - Không sử dụng bản sao lưu tĩnh, chỉ hiển thị dữ liệu trực tiếp từ link
 * ============================================================================
 */
export function useGoogleSheet(sheetUrl, sourceType = 'source1') {
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isMounted = useRef(true);

  // Hàm fetch nội dung từ URL với chế độ chống cache
  const fetchUrlText = async (targetUrl) => {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const antiCacheUrl = `${targetUrl}${separator}_nocache=${Date.now()}`;
    const response = await fetch(antiCacheUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  };

  // Hàm nạp và xử lý dữ liệu trực tiếp từ Google Sheets
  const fetchData = useCallback(async () => {
    if (!sheetUrl || !sheetUrl.trim()) {
      setData([]);
      setRawData([]);
      setLoading(false);
      setError('Chưa có liên kết Google Sheet. Vui lòng bấm vào Cấu hình (biểu tượng bánh răng) để dán link Google Sheet.');
      setWarning(null);
      return;
    }

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const parsed = parseGoogleSheetUrl(sheetUrl);
      const targetUrl = parsed.primaryUrl || sheetUrl.trim();

      let csvText = '';
      let fetchSuccess = false;

      // 1. Thử fetch bằng Primary URL (GViz hoặc Published CSV)
      try {
        csvText = await fetchUrlText(targetUrl);

        if (csvText.includes('google.visualization.Query.setResponse') && csvText.includes('"status":"error"')) {
          throw new Error('GViz API báo lỗi truy vấn dữ liệu hoặc ID trang tính (gid) không tồn tại.');
        }

        // Kiểm tra nếu link trả về trang HTML đăng nhập Google (Bảng tính riêng tư)
        if (
          csvText.includes('<!DOCTYPE html>') &&
          (csvText.includes('accounts.google.com') ||
            csvText.includes('ServiceLogin') ||
            csvText.includes('Sign in - Google Accounts'))
        ) {
          throw new Error(
            'Google Sheet này đang ở chế độ Riêng tư (Private). Vui lòng mở quyền: "Bất kỳ ai có đường liên kết đều có thể xem".'
          );
        }

        fetchSuccess = true;
      } catch (primaryErr) {
        // 2. Nếu Primary URL thất bại và có Export URL dự phòng -> Thử tiếp Export URL
        if (parsed.exportUrl && parsed.exportUrl !== targetUrl && !primaryErr.message?.includes('Riêng tư')) {
          try {
            csvText = await fetchUrlText(parsed.exportUrl);
            if (!csvText.includes('<!DOCTYPE html>')) {
              fetchSuccess = true;
            }
          } catch (exportErr) {
            console.warn('[Fallback Failed] Direct Export không thành công:', exportErr.message);
          }
        }

        if (!fetchSuccess) {
          throw primaryErr;
        }
      }

      // 3. Phân tích chuỗi CSV bằng PapaParse
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: 'greedy',
        quoteChar: '"',
        escapeChar: '"',
        transformHeader: (h) => (h ? h.trim() : ''),
        complete: (results) => {
          if (!isMounted.current) return;
          const rows = results.data || [];
          const headers = results.meta.fields || (rows[0] ? Object.keys(rows[0]) : []);

          if (rows.length === 0 || headers.length === 0) {
            setError('Bảng tính Google Sheet rỗng hoặc không chứa dòng dữ liệu nào.');
            setData([]);
            setRawData([]);
            setLoading(false);
            return;
          }

          const validation = validateSheetStructure(headers, sourceType);

          setRawData(rows);
          const cleaned = cleanDataset(rows, sourceType);
          setData(cleaned);
          setLastUpdated(new Date());
          setLoading(false);
          setError(null);

          if (!validation.isStandardCtump) {
            setWarning(
              `Đã đọc thành công ${rows.length} dòng từ Google Sheet (${headers.length} cột). Tự động nhận diện dữ liệu.`
            );
          } else {
            setWarning(null);
          }
        },
        error: (parseErr) => {
          if (!isMounted.current) return;
          console.error('PapaParse error:', parseErr);
          setError(`Lỗi đọc CSV: ${parseErr.message}`);
          setData([]);
          setRawData([]);
          setLoading(false);
        },
      });
    } catch (err) {
      if (!isMounted.current) return;
      setError(`Không thể kết nối đến Google Sheet: ${err.message}`);
      setData([]);
      setRawData([]);
      setLoading(false);
    }
  }, [sheetUrl, sourceType]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  return {
    data,
    rawData,
    loading,
    error,
    warning,
    lastUpdated,
    refetch: fetchData,
  };
}
