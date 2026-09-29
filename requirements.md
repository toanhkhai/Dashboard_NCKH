# PROJECT REQUIREMENTS & CONTEXT ANCHOR

## 1. Tổng quan & Tech Stack
- **Dự án:** Dashboard Quản lý & Tra cứu Nghiên cứu Khoa học Trường Đại Học Y Dược Cần Thơ (CTUMP).
- **Mục tiêu:** Hiển thị trực quan dữ liệu NCKH từ Google Sheets qua GViz API, hỗ trợ lọc, xem biểu đồ, tra cứu và xuất CSV UTF-8.
- **Tech Stack:**
  - Runtime/Bundler: Vite (React JSX, thuần JavaScript).
  - Styling: TailwindCSS.
  - Visualization: Recharts, Lucide React (icons).
  - Data Parsing: PapaParse.
  - Hosting: Client-side Single Page Application (SPA), không có Backend Node/Express (tạm thời, tương lai mở rộng Backend + DB cho RBAC).
- **Nguồn dữ liệu (Google Sheets GViz API):**
  - Nguồn 1 (source1): Bài báo Ngoài Trường (HĐGS) - GID: 287019159
    URL: `https://docs.google.com/spreadsheets/d/1T36gWiDQkD07cXwHUA82J4hfFWHEC9pj4VD-PwHNADo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=287019159`
  - Nguồn 2 (source2): Danh mục NCKH Mở rộng & Quốc tế (Scopus/ISI) - GID: 1298748218
    URL: `https://docs.google.com/spreadsheets/d/1Tg9evoX-lIykGi_F5z4FwXU2Hhy9af7UFGNz30f4lwo/gviz/tq?tqx=out:csv&tq=SELECT%20*&gid=1298748218`

## 2. Cấu trúc thư mục chuẩn (KHÔNG TỰ Ý ĐỔI TÊN/TẠO THƯ MỤC LẠ)
- `public/logo/logo.png`: Assets tĩnh, logo và favicon.
- `src/`:
  - `components/`:
    - `Header.jsx`: Thanh điều hướng, theme toggle, bộ nút chuyển Tabs (Nguồn 1 / Nguồn 2 / Tổng hợp 2 Nguồn), Live Sync và nút xuất CSV.
    - `KPICards.jsx`: 4 thẻ chỉ số thống kê chính theo dữ liệu Tab đang chọn.
    - `GlobalFilterBar.jsx`: Bộ lọc năm, khoa, phân loại, tạp chí, điểm HĐGS theo ngữ cảnh Tab.
    - `ChartsSection.jsx`: Cụm biểu đồ Recharts (tối đa ~5 biểu đồ hiển thị trực quan).
    - `DataTable.jsx`: Bảng tra cứu, phân trang, modal chi tiết bài báo/đề tài.
    - `SheetSettingsModal.jsx`: Modal cấu hình đường dẫn Google Sheet.
    - `ErrorBoundary.jsx`: Bắt lỗi crash giao diện.
  - `data/`:
    - `rawSheetData.js`: URLs mặc định GViz API cho 2 nguồn Sheets.
  - `hooks/`:
    - `useGoogleSheet.js`: Hook xử lý tải dữ liệu từ Google Sheets URLs / GViz endpoint.
  - `utils/`:
    - `cleanData.js`: Logic chuẩn hóa dòng dữ liệu, định dạng số, xuất file CSV (UTF-8 BOM).
    - `urlConverter.js`: Parse link Google Sheets sang endpoint JSON/CSV.
  - `App.jsx`: Component chính quản lý state tập trung (activeTab: 'source1' | 'source2' | 'combined', theme, filters).
  - `main.jsx`: Entrypoint React.
  - `index.css`: Cấu hình styles TailwindCSS & Light/Dark Theme.
  - `vite-env.d.ts`: Khai báo môi trường Vite.

## 3. Luồng dữ liệu & Quy tắc nghiệp vụ (Business Logic)
1. **Cơ chế Tabs chuyển nguồn:**
   - Tabs chuyển đổi được tích hợp sẵn ngay trong `Header.jsx` (`source1`, `source2`, `combined`)[cite: 4].
   - `App.jsx` nạp song song dữ liệu qua `useGoogleSheet(sheet1Url)` và `useGoogleSheet(sheet2Url)`[cite: 3].
   - Khi chuyển Tab: `activeRecords` tự động cập nhật và phân phối đồng thời xuống `GlobalFilterBar`, `KPICards`, `ChartsSection` và `DataTable`[cite: 3].
2. **Nạp & Xử lý dữ liệu:**
   - Dữ liệu fetch từ Google Sheet qua `useGoogleSheet.js` -> chạy qua hàm chuẩn hóa `cleanData.js`.
   - Xử lý mượt mà trạng thái `loading`, `error` và fallback proxy nếu direct fetch bị chặn CORS[cite: 3].
3. **Bộ lọc (GlobalFilterBar):**
   - Bộ lọc hoạt động realtime theo từ khóa tìm kiếm, năm, điểm HĐGS, tạp chí và Q-Rank[cite: 3].
4. **Bảng & Xuất dữ liệu:**
   - File CSV tải về bắt buộc phải có tiền tố `\uFEFF` (UTF-8 BOM) để Excel mở tiếng Việt không bị lỗi font.

## 4. Nguyên tắc hoạt động dành cho AI Agent (Strict Guardrails)
- **Không tự ý chuyển đổi sang TypeScript:** Dự án chạy 100% bằng `.jsx` và `.js`.
- **Không tạo file chuyển Tab mới:** Thanh Tab Switcher đã nằm sẵn trong `Header.jsx`, không tạo thêm component ngoài[cite: 4].
- **Không cài thêm thư viện mới:** Chỉ dùng các thư viện đã có trong `package.json`. Nếu bắt buộc cần package mới, phải hỏi trước.
- **Không phá vỡ logic cũ:** Mọi thay đổi phải đảm bảo build chạy lệnh `npm run build` không phát sinh lỗi.
- **Giữ cấu trúc component:** Tránh gom tất cả code vào `App.jsx`; tuân thủ cấu trúc thư mục quy định ở mục 2.