# Cập nhật V5.6 - Sửa lỗi không thể thêm món sau khi tạo hóa đơn mới

## Vấn đề đã sửa
- **Lỗi chính**: Khi click nút "Tạo hóa đơn mới" từ sidebar, không thể thêm món từ menu vì các nút trong menu bị disabled.

## Chi tiết sửa lỗi

### 1. Sửa logic renderMenu()
**File:** `script.js`
**Vấn đề:** Khi không có `currentInvoiceId`, menu hiển thị nút "Tạo hóa đơn mới" nhưng bị disabled và không thể click.
**Giải pháp:**
- Thay đổi text nút từ "Tạo hóa đơn mới" thành "Chọn món" khi không có hóa đơn nào được chọn
- Loại bỏ trạng thái disabled cho nút khi không có hóa đơn
- Loại bỏ class "disabled" khỏi menu-item-card khi không có hóa đơn

```javascript
// Trước
if (currentInvoiceId) {
    buttonText = 'Thêm';
    buttonClass = 'add-to-cart';
    buttonDisabled = '';
} else {
    buttonText = 'Tạo hóa đơn mới';
    buttonClass = 'add-to-cart disabled';
    buttonDisabled = 'disabled';
}

// Sau
if (currentInvoiceId) {
    buttonText = 'Thêm';
    buttonClass = 'add-to-cart';
    buttonDisabled = '';
} else {
    buttonText = 'Chọn món';
    buttonClass = 'add-to-cart';
    buttonDisabled = '';
}
```

### 2. Thêm renderMenu() vào createNewInvoiceWithItem()
**Vấn đề:** Sau khi tạo hóa đơn mới từ menu (click món), menu không cập nhật text nút từ "Chọn món" thành "Thêm".
**Giải pháp:** Thêm `renderMenu()` vào cuối hàm để cập nhật trạng thái menu.

### 3. Thêm renderMenu() vào addToCurrentOrder()
**Vấn đề:** Menu có thể không đồng bộ với trạng thái hóa đơn hiện tại.
**Giải pháp:** Đảm bảo menu luôn được cập nhật sau khi thêm món.

### 4. Thêm renderMenu() vào deleteInvoiceById()
**Vấn đề:** Khi xóa hóa đơn đang được chọn, menu không cập nhật về trạng thái "Chọn món".
**Giải pháp:** Thêm `renderMenu()` khi xóa hóa đơn để cập nhật trạng thái menu.

## Flow mới hoạt động như sau:

1. **Lúc đầu (không có hóa đơn nào):**
   - Menu hiển thị nút "Chọn món" (có thể click)
   - Click món → tự động tạo hóa đơn mới với món đó
   - Menu cập nhật thành nút "Thêm"

2. **Khi có hóa đơn đang chọn:**
   - Menu hiển thị nút "Thêm" 
   - Click món → thêm vào hóa đơn hiện tại

3. **Từ sidebar "Tạo hóa đơn mới":**
   - Tạo hóa đơn trống
   - Set làm hóa đơn hiện tại
   - Menu cập nhật thành nút "Thêm"
   - Có thể click món để thêm ngay

4. **Khi deselect/xóa hóa đơn:**
   - Menu quay về trạng thái "Chọn món"

## Kết quả
- ✅ Có thể tạo hóa đơn mới từ sidebar và thêm món ngay lập tức
- ✅ Menu luôn đồng bộ với trạng thái hóa đơn hiện tại
- ✅ Text nút menu phù hợp với context (Chọn món / Thêm)
- ✅ Không còn nút bị disabled khi không cần thiết
- ✅ UX mượt mà hơn khi thao tác với hóa đơn

## Ngày cập nhật
20/06/2025
