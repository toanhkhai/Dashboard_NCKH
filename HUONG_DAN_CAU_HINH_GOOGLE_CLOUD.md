# HƯỚNG DẪN CẤU HÌNH ĐĂNG NHẬP GMAIL (GOOGLE OAUTH 2.0) TRÊN GOOGLE CLOUD CONSOLE

Tài liệu này hướng dẫn chi tiết từng bước tạo và cấu hình **Google OAuth 2.0 Client ID** để sử dụng tính năng **Đăng nhập bằng Gmail** cho hệ thống **Dashboard Nghiên Cứu Khoa Học - Trường Đại học Y Dược Cần Thơ (CTUMP)**.

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
2. Đăng nhập bằng tài khoản Google của bạn (nên dùng tài khoản Gmail quản trị hoặc email Google Workspace của trường).
3. Nhấp vào thanh chọn dự án (Project dropdown) ở góc trên bên trái thanh điều hướng (kế bên logo Google Cloud).
4. Nhấn nút **New Project** (Dự án mới) ở góc trên bên phải của bảng chọn.
5. Điền thông tin:
   - **Project Name:** Nhập `CTUMP-Dashboard-NCKH`
   - **Organization:** Để mặc định hoặc chọn tổ chức của bạn.
6. Nhấn nút **Create** (Tạo) và chờ vài giây để Google tạo xong dự án.
7. Chọn dự án vừa tạo trên thanh điều hướng.

---

### BƯỚC 2: Cấu Hình Màn Hình Chấp Thuận OAuth (OAuth Consent Screen)

Google yêu cầu thiết lập màn hình này trước khi tạo Client ID để người dùng biết ứng dụng nào đang yêu cầu truy cập thông tin họ tên và email.

1. Tại menu thanh bên trái (Navigation menu ☰), vào:
   👉 **APIs & Services** > **OAuth consent screen** (Màn hình chấp thuận OAuth).
2. Tại mục **User Type**:
   - Nếu bạn dùng tài khoản Google cá nhân thông thường: Chọn **External** (Ngoài tổ chức).
   - Nếu bạn dùng Google Workspace có tên miền trường (`@ctump.edu.vn`): Chọn **Internal** (Nội bộ tổ chức) hoặc **External**.
   - Nhấn **Create**.
3. Điền các thông tin cơ bản:
   - **App name (Tên ứng dụng):** `CTUMP Dashboard NCKH`
   - **User support email (Email hỗ trợ người dùng):** Chọn email của bạn.
   - **App logo:** Có thể bỏ qua hoặc tải ảnh logo CTUMP lên.
   - **Developer contact information (Thông tin liên hệ nhà phát triển):** Nhập địa chỉ email của bạn.
4. Nhấn nút **Save and Continue** (Lưu và tiếp tục).
5. **Scopes (Phạm vi truy cập):**
   - Mặc định Google Identity Services chỉ cần các phạm vi cơ bản (`userinfo.email`, `userinfo.profile`, `openid`).
   - Bạn có thể giữ nguyên mặc định và nhấn **Save and Continue**.
6. **Test Users (Người dùng thử nghiệm):**
   - *Rất quan trọng nếu App đang ở trạng thái Testing (Thử nghiệm):*
   - Nhấn **+ Add Users**, nhập địa chỉ Gmail của bạn và các email đồng nghiệp sẽ dùng để đăng nhập thử nghiệm.
   - Nhấn **Save and Continue**.
7. Xem lại tóm tắt và nhấn **Back to Dashboard**.

---

### BƯỚC 3: Tạo OAuth 2.0 Client ID

1. Tại menu thanh bên trái, vào mục:
   👉 **APIs & Services** > **Credentials** (Thông tin xác thực).
2. Nhấn vào nút **+ CREATE CREDENTIALS** ở thanh trên cùng, chọn:
   👉 **OAuth client ID**.
3. Điền các trường cấu hình như sau:
   - **Application type (Loại ứng dụng):** Chọn **Web application** (Ứng dụng web).
   - **Name (Tên):** Nhập `CTUMP Web Client` (hoặc tên tùy ý).
4. **Authorized JavaScript origins (Nguồn gốc JavaScript được ủy quyền):**
   - Nhấn **+ ADD URI** và nhập lần lượt các dòng sau:
     ```text
     http://localhost:3000
     ```
     ```text
     http://localhost:5173
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
7. Hộp thoại **OAuth client created** sẽ xuất hiện:
   - Sao chép chuỗi tại mục **Client ID** (chuỗi ký tự có đuôi `.apps.googleusercontent.com`).
   - *(Bạn không cần dùng Client Secret vì đây là ứng dụng client-side SPA).*

---

### BƯỚC 4: Kích Hoạt Client ID Vào Dự Án

Bạn có thể áp dụng 1 trong 2 cách sau:

#### Cách 1: Thêm vào file `.env` (Khuyên dùng - Cố định lâu dài)
1. Mở file `.env` ở thư mục gốc của dự án.
2. Dán Client ID của bạn vào:
   ```env
   VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   ```
3. Khởi động lại dev server nếu đang chạy (`npm run dev`).

#### Cách 2: Nhập trực tiếp trên giao diện Dashboard (Cực nhanh - Không cần restart)
1. Mở trang web Dashboard trên trình duyệt (`http://localhost:3000`).
2. Nhấn vào nút **"Cấu hình Google Cloud"** (hoặc **"Xem hướng dẫn & Nhập Client ID"**).
3. Dán chuỗi Client ID vào ô input và nhấn **"Lưu & Kích hoạt"**.
4. Nút đăng nhập Google chính thức sẽ hiển thị ngay lập tức!

---

## 🔒 Các Tính Năng Đã Được Tích Hợp

1. **Chuẩn Google Identity Services (GIS) mới nhất:** Không bị lỗi thời như các thư viện GAPI cũ, bảo mật cao và tương thích chuẩn HTML5.
2. **Duy trì phiên đăng nhập (Persistent Session):** Thông tin đăng nhập được lưu an toàn trong trình duyệt (`localStorage`), khi F5 tải lại trang không cần đăng nhập lại.
3. **Hiển thị thông tin người dùng:** Ở thanh Header hiển thị ảnh đại diện Google (Avatar), Họ tên và Email người dùng.
4. **Hỗ trợ Đăng xuất an toàn:** Nhấn "Đăng xuất" sẽ xóa phiên và gọi `google.accounts.id.disableAutoSelect()`.
5. **Chế độ Khách (Demo Mode):** Cho phép giảng viên hoặc người thẩm định truy cập nhanh để xem trước Dashboard khi chưa kịp thiết lập Google Cloud.
