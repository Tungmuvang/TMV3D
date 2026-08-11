# 📜 NHẬT KÝ TRÒ CHUYỆN & HƯỚNG DẪN VẬN HÀNH HỆ THỐNG TMV IN3D

---

## 📅 Thời Gian Cập Nhật: 11/08/2026

---

## 📋 1. TỔNG HỢP CÁC YÊU CẦU ĐÃ HOÀN THÀNH

### 1.1. Tối Ưu Giao Diện Trang Chủ (`index.html` & `styles.css`)
- **Yêu cầu**: Thu gọn khoảng cách các thẻ tính năng (`Nhựa Nguyên sinh PETG, PLA`, `Độ Chính Xác Cao`, `Giao Hàng Toàn Quốc`, `Kiểm Tra Thanh Toán`) ở Hero Banner.
- **Thực hiện**:
  - Giảm lề dưới của tiêu đề & đoạn mô tả (`margin-bottom: 0.8rem` & `1rem`).
  - Thu gọn khoảng cách giữa các thẻ tính năng (`gap: 0.6rem 0.8rem`).
  - Điều chỉnh lớp `.feature-pill` với `padding: 0.4rem 0.85rem` và `font-size: 0.84rem`.

### 1.2. Tách Biệt Tab Trong Trang Quản Trị Admin (`admintmv.html` & `app.js`)
- **Yêu cầu**: Tách biệt hoàn toàn phần "Danh sách sản phẩm" và "Thêm/sửa sản phẩm". Khi bấm nút **"Sửa"** mô hình thì hiển thị giao diện sửa riêng ở ngay đầu trang chứ không bắt cuộn xuống dưới.
- **Thực hiện**:
  - **Tab 1 (`#tab-products`)**: Chỉ chứa Quản Lý Sản Phẩm Nổi Bật và Bảng Danh Sách Sản Phẩm.
  - **Tab 2 (`#tab-add-product`)**: Được tách riêng hoàn toàn. Thêm thanh tiêu đề thông báo trạng thái (`Chỉnh Sửa Sản Phẩm: [Tên Sản Phẩm]` hoặc `Thêm Sản Phẩm Mô Hình Mới`) và nút **`← Quay Lại Danh Sách Sản Phẩm`**.
  - Khi bấm nút **"Sửa"** bất kỳ sản phẩm nào, hệ thống chuyển sang Tab 2 và cuộn mượt lên đầu trang.

---

## 📊 2. CẤU TRÚC GOOGLE SHEETS 11 CỘT MỚI

- **Link Google Sheets Mới**: `https://docs.google.com/spreadsheets/d/1NmZ3Ui1LIuPTQbiPRsqBVpsDgKJCMWncSivCtkVKaD4/edit?gid=0#gid=0`
- **Link Web App Webhook Endpoint Mới**: `https://script.google.com/macros/s/AKfycbziyxNEuLR_ncZKC1ACW3QZBLr4wyTQMaTnQhvaWdJonQPLb78jkk8itPCri2wXk13k/exec`

| Cột | Tên Cột | Mô Tả / Nội Dung Lưu |
|---|---|---|
| **A** | **Thời gian** | Ngày giờ tạo đơn / chuyển cọc (`dd/MM/yyyy HH:mm:ss`) |
| **B** | **Tên khách hàng** | Họ tên người nhận |
| **C** | **Địa chỉ người nhận** | *(Đổi từ Link FB/Zalo)*: Địa chỉ giao hàng |
| **D** | **Số điện thoại** | SĐT khách hàng |
| **E** | **Tên đơn hàng** | Tên mô hình, phân loại, kích thước, màu sắc |
| **F** | **Tổng tiền** | Giá trị đơn hàng (VNĐ) |
| **G** | **Đã cọc** | Số tiền khách đã cọc (VNĐ) |
| **H** | **Còn lại** | Số tiền thu COD còn lại khi giao hàng (VNĐ) |
| **I** | **Lưu ý / Ghi chú** | *(Đổi từ Nguồn)*: Ghi chú của khách + Mã CK (`Mã CK: ...`) |
| **J** | **Trạng thái** | Trạng thái cọc (`ĐÃ CỌC ✅`, `Chờ cọc ⏳`, `Đã xác nhận`) |
| **K** | **Tiến độ** | Tiến độ gia công (`Chưa làm`, `Đang làm`, `Hoàn thành`, `Hủy`) |

---

## ⚙️ 3. MÃ NGUỒN GOOGLE APPS SCRIPT (`filescript.gs`)

### Các Điểm Nâng Cấp Nổi Bật:
1. **Tự Động Hủy ĐơnQuá 15 Phút**:
   - Quét ngầm mỗi 1 phút/lần.
   - Bất kỳ đơn hàng nào có trạng thái `Chờ cọc ⏳` (hoặc chứa chữ `Chờ`) nếu quá **15 phút** chưa cọc sẽ **tự động bị xóa dòng khỏi Google Sheets** và bắn thông báo hủy đơn qua Telegram Bot.
   - Sửa lỗi hàm `parseVietDateTime` để nhận dạng chính xác định dạng Date.
2. **Cập Nhật Cột C & Cột I**:
   - Ghi địa chỉ nhận hàng vào **Cột C**.
   - Ghi lưu ý + Mã chuyển khoản vào **Cột I**.
3. **Quét Tiền Cọc Timo Tự Động Qua Gmail**:
   - Quét Gmail tự động 6 giây/lần. Nhận diện mã cọc và cập nhật `ĐÃ CỌC ✅` tức thì.
4. **Hàm Chạy Thử `runAutoCancelCheck()`**:
   - Cho phép bấm **Chạy (Run)** thủ công trong Apps Script Editor để kiểm tra dọn đơn quá 15 phút ngay lập tức.

---

## 🛠️ 4. HƯỚNG DẪN TRIỂN KHAI & ĐỒNG BỘ NGHỆ AN - TOÀN CẦU

### **Bước 1: Cập Nhật Code Lên Google Apps Script**
1. Mở file [filescript.gs](file:///i:/auto%20magimir/Huongdan/3d-store/filescript.gs), copy toàn bộ nội dung.
2. Mở trình chỉnh sửa Google Apps Script của bạn, dán đè vào và bấm **Lưu 💾** (`Ctrl + S`).

### **Bước 2: Triển Khai Bản Mới (Deploy)**
1. Nhấn nút **Triển khai (Deploy)** ở góc trên bên phải -> chọn **Triển khai bản mới (New deployment)**.
2. Mục *Người có quyền truy cập (Who has access)*: Chọn **Ai cũng có truy cập (Anyone)**.
3. Bấm **Triển khai (Deploy)** -> Cấp quyền nếu Google yêu cầu.
4. Sao chép (Copy) **URL Ứng dụng web (Web App URL)** dạng: `https://script.google.com/macros/s/AKfycb.../exec`.

### **Bước 3: Dán Web App URL Vào Trang Admin Website**
1. Mở trang Admin cửa hàng [admintmv.html](file:///i:/auto%20magimir/Huongdan/3d-store/admintmv.html).
2. Chọn Tab **Tài Khoản & Tích Hợp**.
3. Dán Web App URL vừa copy ở **Bước 2** vào ô **Google Apps Script WebApp URL Endpoint**.
4. Nhấn **Lưu Cấu Hình Tùy Chỉnh**.

### **Bước 4: Đăng Ký Telegram Webhook & Trigger Tự Động**
1. Trong trình chỉnh sửa Apps Script, chọn hàm **`setupSonicTriggersAndWebhook`** từ menu hàm.
2. Nhấn nút **Chạy (Run)** 1 lần.
3. Kiểm tra nhật ký xem hiển thị: `✅ ĐÃ CÀI ĐẶT THÀNH CÔNG TELEGRAM WEBHOOK VÀ TRIGGER TỰ ĐỘNG QUÉT MAIL/HỦY ĐƠN 1 PHÚT/LẦN!`.

---

## 📦 5. THÔNG TIN THÀNH PHẦN & GITHUB REPOSITORY

- **GitHub Repository**: `https://github.com/Tungmuvang/TMV3D` (Branch `main`).
- **Mã Commit Mới Nhất**:
  - `b357ac1`: Tách tab admin & thu gọn feature pills.
  - `cbc16f9`: Đổi link Google Sheet & 11 cột mới.
  - `304366f`: Tối ưu hóa hợp nhất mã nguồn filescript.gs.
  - `e301f1a`: Cập nhật phiên bản web v12 & đồng bộ Sheet ID.
  - `e16f6fc`: Nâng cấp tự động hủy đơn sau 15 phút & hàm runAutoCancelCheck.
