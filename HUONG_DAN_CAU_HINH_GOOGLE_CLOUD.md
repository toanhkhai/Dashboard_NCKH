# HƯỚNG DẪN CẤU HÌNH ĐĂNG NHẬP GMAIL (GOOGLE OAUTH 2.0) TRÊN GOOGLE CLOUD CONSOLE

Tài liệu này hướng dẫn chi tiết từng bước tạo và cấu hình **Google OAuth 2.0 Client ID** để sử dụng tính năng **Đăng nhập bằng Gmail** cho hệ thống **Dashboard Nghiên Cứu Khoa Học - Trường Đại học Y Dược Cần Thơ (CTUMP)**.

---

## ⚠️ GIẢI QUYẾT VẤN ĐỀ: DÙNG GMAIL CÁ NHÂN & CHỌN EXTERNAL

### 1. Tại sao Google không cho chọn "Internal"?
* Google chỉ cho phép chọn **Internal** (Nội bộ) khi tài khoản bạn dùng để đăng nhập vào Google Cloud Console là **tài khoản Google Workspace của trường** (`...ctump.edu.vn`).
* Khi bạn dùng **Gmail cá nhân** (`...gmail.com`), Google **bắt buộc chọn External** (Ngoài tổ chức).

### 2. Làm sao để "Chỉ có Gmail CTUMP được vào login" khi chọn External?
* Khi chọn **External**, Google sẽ cho phép mở bảng chọn tài khoản Google.
* **Hệ thống web của chúng ta đã được tích hợp bộ lọc kiểm tra tên miền tự động**:
  * Khi người dùng đăng nhập bằng tài khoản `@ctump.edu.vn` hoặc `@student.ctump.edu.vn` (hoặc tài khoản trong danh sách Whitelist): Hệ thống chấp nhận đăng nhập.
  * Nếu người dùng chọn bất kỳ tài khoản Gmail cá nhân nào khác (`@gmail.com`): Hệ thống sẽ **từ chối đăng nhập ngay lập tức, hiển thị thông báo lỗi màu đỏ và ngắt phiên**.
  * Vì vậy, bạn hoàn toàn yên tâm chọn **External** mà vẫn đảm bảo 100% chỉ có người của CTUMP mới đăng nhập được vào hệ thống!

### 3. Tại sao web hiện tại đang bị lỗi Login và cách sửa ngay lập tức?
Khi bạn chọn **External**, Google Cloud sẽ để ứng dụng ở chế độ **Testing (Thử nghiệm)**:
👉 Ở chế độ Testing, Google sẽ **chặn tất cả các email** nào không được khai báo trước trong danh sách **Test users** với thông báo lỗi: `Error 403: access_denied` hoặc `Access blocked`.

**👉 CÁCH SỬA LỖI (Chọn 1 trong 2 cách):**

* **Cách 1: Nhấn "PUBLISH APP" (Khuyên dùng - Để toàn bộ giảng viên CTUMP đăng nhập được)**
  1. Vào Google Cloud Console > **APIs & Services** > **OAuth consent screen**.
  2. Dưới mục **Publishing status**, bạn nhấn nút **PUBLISH APP** (Xuất bản ứng dụng) > Chọn **Confirm**.
  3. Trạng thái sẽ chuyển thành **In production**.
  4. *Lưu ý:* Vì ứng dụng chỉ sử dụng quyền đọc cơ bản (`email`, `profile`, `openid`), Google cho phép Publish ngay lập tức mà **KHÔNG CẦN xác minh (Verification) phức tạp**.
  5. Sau khi Publish, mọi email `@ctump.edu.vn` đều có thể đăng nhập bình thường!

* **Cách 2: Thêm email vào mục "Test users" (Nếu vẫn muốn giữ ở chế độ Testing)**
  1. Vào **APIs & Services** > **OAuth consent screen**.
  2. Kéo xuống mục **Test users** > Nhấn **+ ADD USERS**.
  3. Nhập địa chỉ email trường `@ctump.edu.vn` mà bạn đang dùng để thử đăng nhập.
  4. Nhấn **Save**. Lúc này tài khoản đó sẽ được Google cho phép đăng nhập thử nghiệm.

---

## 📌 Tổng Quan Các Thông Số Cần Chuẩn Bị

| Thông số | Giá trị cấu hình | Ghi chú |
| :--- | :--- | :--- |
| **Loại ứng dụng** | Web application (Ứng dụng web) | Bắt buộc |
| **Tên ứng dụng** | CTUMP Dashboard NCKH | Đặt tùy ý |
| **Authorized JavaScript origins** | `http://localhost:3000`<br>`http://localhost:5173`<br>`http://localhost` | Địa chỉ chạy ứng dụng ở máy local hoặc domain khi deploy |
| **Authorized redirect URIs** | `http://localhost:3000`<br>`http://localhost:5173` | Hỗ trợ chuyển hướng xác thực |
| **Biến môi trường cần thêm** | `VITE_GOOGLE_CLIENT_ID` | Điền vào file `.env` |

---

## 🚀 Các Bước Thực Hiện Chi Tiết

### BƯỚC 1: Truy Cập Google Cloud Console & Tạo Project Mới

1. Mở trình duyệt và truy cập: [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn.
3. Nhấp vào thanh chọn dự án (Project dropdown) ở góc trên bên trái thanh điều hướng (kế bên logo Google Cloud).
4. Nhấn nút **New Project** (Dự án mới) ở góc trên bên phải của bảng chọn.
5. Điền thông tin:
   - **Project Name:** Nhập `CTUMP-Dashboard-NCKH`
6. Nhấn nút **Create** (Tạo) và chờ vài giây để Google tạo xong dự án.
7. Chọn dự án vừa tạo trên thanh điều hướng.

---

### BƯỚC 2: Cấu Hình Màn Hình Chấp Thuận OAuth (OAuth Consent Screen)

1. Tại menu thanh bên trái (Navigation menu ☰), vào:
   👉 **APIs & Services** > **OAuth consent screen** (Màn hình chấp thuận OAuth).
2. Tại mục **User Type**:
   - Chọn **External** (Ngoài tổ chức).
   - Nhấn **Create**.
3. Điền các thông tin cơ bản:
   - **App name (Tên ứng dụng):** `CTUMP Dashboard NCKH`
   - **User support email (Email hỗ trợ người dùng):** Chọn email của bạn.
   - **Developer contact information (Thông tin liên hệ nhà phát triển):** Nhập địa chỉ email của bạn.
4. Nhấn nút **Save and Continue** (Lưu và tiếp tục).
5. **Scopes (Phạm vi truy cập):**
   - Giữ nguyên các quyền cơ bản mặc định (`userinfo.email`, `userinfo.profile`, `openid`).
   - Nhấn **Save and Continue**.
6. **Test Users (Người dùng thử nghiệm):**
   - Nhấn **+ Add Users**, nhập địa chỉ email trường `@ctump.edu.vn` của bạn vào danh sách.
   - Nhấn **Save and Continue**.
7. Nhấn **Back to Dashboard**.
8. **QUAN TRỌNG:** Nhấn nút **PUBLISH APP** (ở mục Publishing status) để chuyển sang chế độ **In production** giúp toàn thể cán bộ CTUMP đăng nhập được.

---

### BƯỚC 3: Tạo OAuth 2.0 Client ID

1. Tại menu thanh bên trái, vào mục:
   👉 **APIs & Services** > **Credentials** (Thông tin xác thực).
2. Nhấn vào nút **+ CREATE CREDENTIALS** ở thanh trên cùng, chọn:
   👉 **OAuth client ID**.
3. Điền các trường cấu hình như sau:
   - **Application type (Loại ứng dụng):** Chọn **Web application** (Ứng dụng web).
   - **Name (Tên):** Nhập `CTUMP Web Client`.
4. **Authorized JavaScript origins (Nguồn gốc JavaScript được ủy quyền):**
   - Nhấn **+ ADD URI** và nhập lần lượt các dòng sau:
     ```text
     http://localhost:3000
     ```
     ```text
     http://localhost:5173
     ```
     ```text
     http://localhost
     ```
     *(Nếu sau này bạn triển khai web lên Vercel, Netlify hoặc domain trường, ví dụ `https://nckh.ctump.edu.vn`, chỉ cần nhấn + ADD URI và thêm domain đó vào).*
5. **Authorized redirect URIs (URI chuyển hướng được ủy quyền):**
   - Nhấn **+ ADD URI** và thêm:
     ```text
     http://localhost:3000
     ```
     ```text
     http://localhost:5173
     ```
6. Nhấn nút **CREATE** (Tạo).
7. Sao chép chuỗi **Client ID** (chuỗi ký tự có đuôi `.apps.googleusercontent.com`).

---

### BƯỚC 4: Điền Client ID Vào File .env

1. Mở file `.env` ở thư mục gốc của dự án.
2. Dán Client ID của bạn vào:
   ```env
   VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   ```
3. Lưu file và khởi động lại dev server:
   ```bash
   npm run dev
   ```
