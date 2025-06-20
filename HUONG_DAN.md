# Hướng dẫn sử dụng BalanCoffee - Mainflow mới

## 🚀 Mainflow hoạt động

### 1. **Nhân viên chọn thức uống theo order từ khách hàng**
- Khách hàng đặt món từ menu
- Nhân viên click vào món từ menu để thêm vào đơn hàng hiện tại
- Thông báo sẽ hiện lên khi thêm món thành công

### 2. **Thêm thức uống vào pop-up tab**
- Click nút "Tạo hóa đơn mới" từ sidebar để mở pop-up
- Trong pop-up có thể:
  - ➕ Tăng số lượng món
  - ➖ Giảm số lượng món  
  - 🗑️ Xóa món khỏi đơn hàng
- Hiển thị tổng tiền realtime

### 3. **Tạo hóa đơn**
- Sau khi khách hàng xác nhận order
- Nhân viên bấm nút "Tạo hóa đơn" 
- Hóa đơn được tạo với trạng thái "Chờ thanh toán"

### 4. **Hiển thị hóa đơn trên sidebar**
- Hóa đơn hiển thị dưới dạng item trong sidebar
- Mỗi item hiển thị:
  - 🆔 Số hóa đơn
  - 📊 Trạng thái (Chờ thanh toán/Đã thanh toán)
  - 🕐 Thời gian tạo
  - 💰 Tổng tiền

### 5. **Chỉnh sửa hóa đơn**
- Click vào hóa đơn từ sidebar để mở
- Có thể:
  - ➕ Thêm món mới từ menu
  - ✏️ Chỉnh sửa số lượng
  - ❌ Xóa món khỏi hóa đơn
- Bấm "Cập nhật hóa đơn" để lưu thay đổi

### 6. **Thanh toán**
- Trong pop-up hóa đơn, bấm nút "Thanh toán"
- Hiển thị:
  - 📋 Chi tiết hóa đơn đầy đủ
  - 📱 Mã QR thanh toán (qr_code.png)
  - 💳 Hướng dẫn thanh toán
- Bấm "Xác nhận đã thanh toán" để hoàn tất

## 🎯 Các trạng thái hóa đơn

### 🟡 Chờ thanh toán (pending)
- Hóa đơn vừa tạo
- Có thể chỉnh sửa
- Hiển thị nút thanh toán

### 🟢 Đã thanh toán (paid)
- Khách hàng đã thanh toán
- Không thể chỉnh sửa
- Được lưu vào lịch sử

## 📊 Quản lý doanh thu

### Truy cập
- Bấm nút "Quản lý" ở header
- Chuyển sang chế độ admin

### Tính năng
- 📅 Lọc theo ngày
- 📈 Thống kê tổng quan
- 📋 Lịch sử đơn hàng
- 💾 Xuất báo cáo JSON

## 🔧 Cài đặt QR thanh toán

1. **Thay file qr_code.png**:
   - Tạo mã QR thanh toán của bạn
   - Đặt tên file là `qr_code.png`
   - Copy vào thư mục dự án

2. **Hoặc cấu hình trong data.js**:
```javascript
const qrPaymentInfo = {
    bankName: "VIETCOMBANK",
    accountNumber: "1234567890", // Số tài khoản của bạn
    accountHolder: "BALANCOFFEE", // Tên chủ tài khoản
    content: "Thanh toan don hang"
};
```

## 📱 Responsive Design

### Mobile
- Sidebar full screen
- Pop-up tối ưu cho mobile
- Touch-friendly buttons
- Keyboard shortcuts

### Desktop  
- Sidebar cố định bên phải
- Multi-modal support
- Keyboard shortcuts (ESC để đóng)

## 💾 Lưu trữ dữ liệu

### Local Storage
- **balancoffee_invoices**: Danh sách hóa đơn
- **balancoffee_orders**: Lịch sử đã thanh toán

### Backup
- Xuất báo cáo JSON để backup
- Import lại khi cần thiết

## 🚨 Troubleshooting

### QR Code không hiển thị
1. Kiểm tra file `qr_code.png` có tồn tại
2. Nếu không có, hệ thống sẽ tự tạo QR bằng JavaScript

### Dữ liệu mất
1. Kiểm tra Local Storage của browser
2. Khôi phục từ file backup JSON

### Responsive không hoạt động
1. Clear cache browser
2. Kiểm tra file CSS đã load đúng

## 🎉 Demo Data

Lần đầu chạy sẽ có:
- 1 hóa đơn mẫu chờ thanh toán  
- 1 đơn hàng đã thanh toán trong lịch sử
- Menu 20 món đa dạng

---

**🏪 BalanCoffee - Hệ thống POS đơn giản cho quán cà phê Việt Nam**
