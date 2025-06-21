# Test Chức Năng Thanh Toán - BalanCoffee

## Hướng Dẫn Test Nhanh

### 1. Tạo Hóa Đơn Test
```javascript
// Mở console trình duyệt (F12) và chạy:
testPaymentModal();
```

### 2. Test QR Code
```javascript
// Mở console trình duyệt (F12) và chạy:
testQRCode();
```

### 3. Test Thanh Toán Hoàn Chỉnh
```javascript
// Mở console trình duyệt (F12) và chạy:
testPaymentConfirmation();
```

## Kiểm Tra Thủ Công

### Bước 1: Tạo hóa đơn mới
1. Nhấn "Tạo hóa đơn mới"
2. Chọn vài món từ menu
3. Nhấn "Tạo hóa đơn"
4. Nhấn "Thanh toán"

### Bước 2: Kiểm tra modal thanh toán
- Modal có hiển thị không?
- Thông tin hóa đơn có đúng không?
- QR code có hiển thị không?
- Nút "Xác nhận đã thanh toán" có hoạt động không?

### Bước 3: Hoàn tất thanh toán
1. Nhấn "Xác nhận đã thanh toán"
2. Kiểm tra thông báo thành công
3. Hóa đơn có biến mất khỏi sidebar không?
4. Modal success có hiển thị không?

## Các Lỗi Thường Gặp

### Modal không mở
- Kiểm tra console có lỗi JavaScript không
- Đảm bảo tất cả script đã load
- Thử refresh trang

### QR Code không hiển thị
- Kiểm tra file qr_code.png có tồn tại không
- Kiểm tra thư viện QRCode đã load chưa
- QR fallback sẽ tự động tạo nếu ảnh lỗi

### Thanh toán không hoạt động
- Kiểm tra console có lỗi không
- Đảm bảo hóa đơn có trạng thái 'pending'
- Kiểm tra localStorage có dữ liệu không

## Debug Commands

```javascript
// Kiểm tra invoices hiện tại
console.log('Invoices:', invoices);

// Kiểm tra order history
console.log('Order History:', orderHistory);

// Kiểm tra invoice hiện tại
console.log('Current Invoice:', window.currentPaymentInvoice);

// Test mở modal với invoice có sẵn
if (invoices.length > 0) {
    openPaymentModal(invoices[0]);
}

// Tạo invoice test nhanh
const testInv = {
    id: Date.now(),
    items: [{name: 'Test Coffee', price: 25000, quantity: 1}],
    total: 25000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    discount: 0
};
invoices.push(testInv);
openPaymentModal(testInv);
```

## Checklist Test

- [ ] Modal payment mở được
- [ ] Thông tin hóa đơn hiển thị đúng
- [ ] QR code hiển thị (ảnh hoặc generated)
- [ ] Nút thanh toán hoạt động
- [ ] Thông báo thành công hiển thị
- [ ] Hóa đơn chuyển trạng thái 'paid'
- [ ] Dữ liệu được lưu vào localStorage
- [ ] Modal đóng sau khi thanh toán
- [ ] Sidebar cập nhật danh sách hóa đơn

## Liên Hệ Support

Nếu vẫn gặp lỗi, vui lòng cung cấp:
1. Thông báo lỗi trong console
2. Các bước đã thực hiện
3. Trình duyệt đang sử dụng
4. Screenshot nếu có thể
