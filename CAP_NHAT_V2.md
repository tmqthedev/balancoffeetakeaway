# Cập nhật chức năng BalanCoffee v2.0

## 🆕 Tính năng mới đã thêm

### 1. **❌ Xóa hóa đơn**
- Nút "Xóa hóa đơn" xuất hiện khi chỉnh sửa hóa đơn hiện có
- Xác nhận trước khi xóa để tránh thao tác nhầm
- Tự động xóa khỏi cả danh sách hóa đơn và lịch sử (nếu đã thanh toán)

### 2. **✏️ Nhập món thủ công**
- **Không thể chọn từ menu** khi đang tạo/chỉnh sửa hóa đơn
- Form nhập thủ công với các trường:
  - 📝 **Tên món**: Nhập tên tùy ý
  - 💰 **Giá**: Nhập giá (VNĐ)
  - 🔢 **Số lượng**: Nhập số lượng
- Validation đầy đủ cho tất cả trường
- Hiển thị rõ món "Thủ công" trong danh sách

### 3. **🚫 Vô hiệu hóa menu khi tạo hóa đơn**
- Menu bị disabled (mờ) khi modal đang mở
- Nút "Thêm" thay đổi thành "Không khả dụng"
- Thông báo nếu cố gắng chọn từ menu khi modal mở

## 🔄 Mainflow mới

### **Tạo hóa đơn mới:**
1. Bấm "Tạo hóa đ�n mới" → Mở modal
2. Menu tự động bị vô hiệu hóa
3. Chỉ có thể nhập món thủ công:
   - Nhập tên món
   - Nhập giá
   - Nhập số lượng
   - Bấm "Thêm"
4. Điều chỉnh số lượng hoặc xóa món
5. Bấm "Tạo hóa đơn"

### **Chỉnh sửa hóa đơn:**
1. Click vào hóa đơn từ sidebar
2. Modal mở với dữ liệu hiện có
3. Có thể:
   - ➕ Thêm món mới (thủ công)
   - ✏️ Chỉnh sửa số lượng
   - 🗑️ Xóa món
   - ❌ **Xóa toàn bộ hóa đơn**
4. Bấm "Cập nhật hóa đơn" hoặc "Thanh toán"

### **Xóa hóa đơn:**
1. Mở hóa đơn cần xóa
2. Bấm nút "Xóa hóa đơn" (màu đỏ)
3. Xác nhận trong dialog
4. Hóa đơn bị xóa hoàn toàn

## 🎨 Giao diện cập nhật

### **Form nhập thủ công:**
```
┌─────────────────────────────────────┐
│ Thêm món thủ công                   │
├─────────────────────────────────────┤
│ Tên món: [_______________]          │
│ Giá:     [_______] VNĐ              │
│ SL:      [___] [Thêm]               │
└─────────────────────────────────────┘
```

### **Nút action trong modal:**
- 🔘 **Hủy** (gri)
- 🗑️ **Xóa hóa đơn** (đỏ) - chỉ khi edit
- ✅ **Tạo/Cập nhật hóa đơn** (xanh)
- 💳 **Thanh toán** (xanh lá) - chỉ khi pending

### **Menu disabled:**
- Opacity 50%
- Pointer events disabled
- Nút "Không khả dụng" màu xám

## 📋 Validation và Error Handling

### **Form validation:**
- ❌ Tên món trống → "Vui lòng nhập tên món"
- ❌ Giá <= 0 → "Vui lòng nhập giá hợp lệ"  
- ❌ Số lượng <= 0 → "Vui lòng nhập số lượng hợp lệ"

### **Chặn thao tác không hợp lệ:**
- Thêm từ menu khi modal mở → "Không thể chọn từ menu khi đang tạo/chỉnh sửa hóa đơn"
- Xóa hóa đơn → Confirm dialog

## 💾 Dữ liệu và Storage

### **Cấu trúc item thủ công:**
```javascript
{
    id: 'manual_1671234567890',  // unique timestamp
    name: 'Tên món',
    price: 25000,
    quantity: 2,
    isManual: true               // flag đánh dấu
}
```

### **Local Storage không đổi:**
- `balancoffee_invoices`: Danh sách hóa đơn
- `balancoffee_orders`: Lịch sử đã thanh toán

## 🔧 Responsive Design

### **Mobile (≤ 768px):**
- Form nhập thủ công thành cột dọc
- Buttons full-width
- Touch-friendly

### **Desktop:**
- Form ngang tiện lợi
- Hover effects
- Keyboard shortcuts (ESC)

## 🚀 Deploy không đổi

- Vercel, GitHub Pages, Netlify
- File static hoàn toàn
- Không cần server

---

## 🎯 **Tóm tắt cập nhật:**

✅ **Đã loại bỏ**: Chọn món từ menu khi tạo hóa đơn  
✅ **Đã thêm**: Form nhập thủ công với validation  
✅ **Đã thêm**: Chức năng xóa hóa đơn với confirm  
✅ **Đã cải thiện**: UX/UI rõ ràng hơn  
✅ **Đã tối ưu**: Responsive mobile-first  

**🏪 BalanCoffee v2.0 - Quản lý hóa đơn linh hoạt hơn!**
