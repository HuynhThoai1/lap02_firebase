# Tasker 🌟

**Môn học:** Tư duy tính toán  
**Giảng viên hướng dẫn:** Lê Đức Khoan

## I. Thông tin thực hiện
* **Họ và tên:** Huỳnh Chí Thoại
* **MSSV:** 24120457

## II. Truy cập trực tuyến 🌐
Ứng dụng đã được triển khai tại:
[**https://lap02-firebase.web.app**](https://lap02-firebase.web.app)

## III. Hướng dẫn chạy nhanh (Quick Start)
Thực hiện các bước sau để thiết lập và chạy dự án cục bộ từ thư mục gốc.

### 1. Thiết lập môi trường (Environment)
```bash
# Tạo môi trường ảo
python -m venv .venv

# Kích hoạt môi trường ảo (Git Bash)
source .venv/Scripts/activate

# Cài đặt các thư viện cần thiết
pip install -r requirements.txt
```

### 2. Cấu hình Firebase
- **Backend:** Đặt file `firebase-key.json` của bạn vào trong thư mục `backend/`.
- **Frontend:** Cập nhật thông tin Web SDK của bạn trong file `frontend/js/firebase-config.js`.

### 3. Chạy Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 4. Chạy Frontend (Mở Terminal mới)
```bash
cd frontend
python -m http.server 3000
```
Truy cập: `http://localhost:3000`

## IV. Các tính năng chính 🌟
- **Xác thực (Auth):** Đăng nhập bằng Google và Đăng ký/Đăng nhập bằng Email/Mật khẩu.
- **Chế độ xem:** Chuyển đổi linh hoạt giữa Danh sách (List View) Lịch tháng (Calendar View) và Lịch tuần (Weekly View).
- **Logic quản lý Task:** Tự động sắp xếp theo hạn chót, làm nổi bật các task quá hạn và hỗ trợ gắn nhãn (label) tùy chỉnh.
- **Thiết kế:** Giao diện Glassmorphism hiện đại, chuyên nghiệp và phản hồi tốt (responsive).
- **Triển khai (Deployment):** Ứng dụng đã được deploy lên Firebase Hosting cho Frontend và các nền tảng đám mây cho Backend.

## V. Video Demo 🎥
Bạn có thể xem video hướng dẫn sử dụng ứng dụng Tasker tại đây:
[Link đến Video Demo](https://your-video-demo-link.com)

## VI. Tùy chỉnh giao diện 🎨
Chỉnh sửa file `frontend/css/styles.css` để thay đổi màu sắc chủ đạo:
```css
:root {
    --primary: #3b82f6; /* Màu chính */
    --bg: #0f172a;      /* Màu nền */
}
```

