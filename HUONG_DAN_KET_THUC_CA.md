# Hướng Dẫn Tính Năng "Kết Thúc Ca" - BalanCoffee

## Tổng Quan
Tính năng "Kết thúc ca" đã được thêm vào hệ thống BalanCoffee để thay thế tính năng xuất dữ liệu cũ. Tính năng này giúp quản lý ca làm việc một cách tối ưu và tự động xóa dữ liệu cũ sau khi xuất báo cáo.

## Các Tính Năng Chính

### 1. Quản Lý Ca Làm Việc
- **Theo dõi thời gian bắt đầu ca**: Tự động ghi nhận thời gian bắt đầu ca khi khởi động ứng dụng
- **Hiển thị thông tin ca hiện tại**: Thống kê đơn hàng, doanh thu, và món bán chạy trong ca
- **Xem chi tiết đơn hàng**: Danh sách tất cả đơn hàng trong ca hiện tại

### 2. Kết Thúc Ca
- **Tổng kết toàn diện**: Hiển thị thông tin chi tiết về ca làm việc
- **Xuất báo cáo JSON**: Tạo file báo cáo tương thích với iOS và Android
- **Tự động xóa dữ liệu**: Xóa tất cả dữ liệu ca cũ sau khi xuất thành công

## Cách Sử Dụng

### Truy Cập Quản Lý Ca
1. Nhấn nút **"Quản lý"** ở góc trên bên phải
2. Giao diện sẽ chuyển sang chế độ quản lý ca làm việc

### Xem Thông Tin Ca Hiện Tại
1. Trong chế độ quản lý, nhấn **"Xem ca hiện tại"**
2. Hệ thống sẽ cập nhật và hiển thị:
   - Số đơn hàng trong ca
   - Tổng doanh thu trong ca
   - Món bán chạy nhất
   - Danh sách chi tiết các đơn hàng

### Kết Thúc Ca Làm Việc
1. Nhấn nút **"Kết thúc ca"** (màu đỏ)
2. Hệ thống sẽ hiển thị modal tổng kết với:
   - Thời gian bắt đầu và kết thúc ca
   - Tổng số đơn hàng
   - Tổng doanh thu
   - Món bán chạy nhất
   - Chi tiết tất cả đơn hàng trong ca

3. Kiểm tra thông tin và nhấn **"Xác nhận và xuất báo cáo"**
4. File báo cáo JSON sẽ được tải xuống tự động
5. Dữ liệu ca cũ sẽ được xóa khỏi hệ thống

## Định Dạng File Báo Cáo

File báo cáo được xuất với định dạng JSON, tương thích với cả iOS và Android:

```json
{
  "shiftInfo": {
    "startTime": "2025-06-20T10:00:00.000Z",
    "endTime": "2025-06-20T18:00:00.000Z",
    "totalOrders": 25,
    "totalRevenue": 750000
  },
  "orders": [
    // Chi tiết tất cả đơn hàng
  ],
  "summary": {
    "itemsSold": {
      "Cà phê đen": 15,
      "Cà phê sữa": 10
    },
    "categoryRevenue": {
      "cafe-viet": 500000,
      "cafe-y": 250000
    },
    "averageOrderValue": 30000
  }
}
```

## Tên File Báo Cáo
Format: `BalanCoffee-Ca-YYYY-MM-DD-HH-MM-SS.json`
Ví dụ: `BalanCoffee-Ca-2025-06-20-10-00-00.json`

## Lưu Ý Quan Trọng

### ⚠️ Xóa Dữ Liệu Tự Động
- Sau khi xác nhận kết thúc ca, **TẤT CẢ** dữ liệu của ca cũ sẽ bị xóa vĩnh viễn
- Chỉ file báo cáo JSON được giữ lại
- Không thể hoàn tác sau khi đã xác nhận

### 💾 Sao Lưu Dữ Liệu
- File JSON có thể mở trên mọi thiết bị và hệ điều hành
- Có thể import vào Excel, Google Sheets để phân tích
- Khuyến nghị lưu trữ file báo cáo an toàn

### 🔄 Ca Làm Việc Mới
- Sau khi kết thúc ca, hệ thống tự động bắt đầu ca mới
- Thời gian bắt đầu ca mới được ghi nhận tự động
- Các đơn hàng mới sẽ thuộc ca làm việc mới

## Khắc Phục Sự Cố

### Không Có Đơn Hàng Trong Ca
- Hệ thống sẽ hiển thị thông báo cảnh báo
- Không thể kết thúc ca khi chưa có đơn hàng nào

### Lỗi Tải File
- Kiểm tra quyền tải xuống của trình duyệt
- Thử lại sau vài giây
- Liên hệ quản trị viên nếu vấn đề tiếp tục

### Dữ Liệu Không Chính Xác
- Kiểm tra kết nối internet
- Làm mới trang và thử lại
- Đảm bảo không có nhiều tab cùng mở ứng dụng

## Hỗ Trợ
Nếu gặp vấn đề khi sử dụng tính năng này, vui lòng liên hệ với nhóm phát triển qua các kênh hỗ trợ.
