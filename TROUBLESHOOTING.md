# 🔧 Troubleshooting Guide - BalanCoffee

## 🐛 Lỗi Đã Phát Hiện và Sửa

### ✅ **Lỗi Syntax trong fallbackMenuData**
- **Vấn đề**: Thiếu dấu phẩy và ngoặc đóng object cuối cùng
- **Vị trí**: `script.js` dòng ~35
- **Đã sửa**: Thêm dấu phẩy và đóng object đúng cách

### ✅ **Lỗi Hoisting với Global Variables** 
- **Vấn đề**: Gọi `loadOrderHistory()` và `getShiftStartTime()` trước khi định nghĩa
- **Vị trí**: `script.js` dòng 7-8
- **Đã sửa**: Khởi tạo với giá trị mặc định, load trong DOMContentLoaded

## 🧪 Test Steps

### 1. Kiểm Tra Cơ Bản
```bash
# Kiểm tra server đang chạy
curl http://localhost:3000

# Kiểm tra files tồn tại
ls -la *.js *.html *.css
```

### 2. Test Browser Console
1. Mở `http://localhost:3000`
2. Mở DevTools (F12)
3. Kiểm tra tab Console có lỗi đỏ không
4. Chạy: `console.log(typeof menuData)`
5. Chạy: `console.log(typeof currentOrder)`

### 3. Test Simple Page
- Truy cập `http://localhost:3000/simple-test.html`
- Xem kết quả test tự động

### 4. Test Functions
```javascript
// Trong console browser
typeof formatPrice // should be 'function'
formatPrice(25000) // should return '25.000₫'
typeof showNotification // should be 'function'
typeof loadInvoices // should be 'function'
```

## 📋 Checklist Khắc Phục

### Files cần kiểm tra:
- [ ] `index.html` - Cú pháp HTML đúng
- [ ] `data.js` - MenuData export đúng
- [ ] `script.js` - Không có lỗi syntax
- [ ] `styles.css` - CSS không ảnh hưởng JS
- [ ] Server HTTP đang chạy

### JavaScript cần kiểm tra:
- [ ] Global variables khởi tạo đúng
- [ ] Functions được định nghĩa trước khi gọi
- [ ] Event listeners đúng thứ tự
- [ ] DOM elements tồn tại khi truy cập
- [ ] External libraries load thành công

### Browser Support:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🚨 Lỗi Thường Gặp

### 1. "ReferenceError: functionName is not defined"
- **Nguyên nhân**: Function được gọi trước khi định nghĩa
- **Giải pháp**: Di chuyển function lên trên hoặc wrap trong DOMContentLoaded

### 2. "Cannot read property of undefined"
- **Nguyên nhân**: DOM element chưa load
- **Giải pháp**: Kiểm tra element tồn tại trước khi truy cập

### 3. "SyntaxError: Unexpected token"
- **Nguyên nhân**: Lỗi cú pháp JS (thiếu dấu phẩy, ngoặc, etc.)
- **Giải pháp**: Kiểm tra syntax bằng validator

### 4. "Failed to load resource"
- **Nguyên nhân**: File không tồn tại hoặc đường dẫn sai
- **Giải pháp**: Kiểm tra đường dẫn và file tồn tại

## 🔧 Debug Commands

```javascript
// Kiểm tra global state
console.log('Global State:', {
    currentOrder,
    invoices: invoices.length,
    orderHistory: orderHistory.length,
    currentInvoiceId,
    isAdminMode,
    shiftStartTime
});

// Test key functions
const testFunctions = ['formatPrice', 'loadInvoices', 'showNotification'];
testFunctions.forEach(func => {
    console.log(`${func}:`, typeof window[func]);
});

// Test DOM elements
const testElements = ['menu-grid', 'invoice-list', 'sidebar'];
testElements.forEach(id => {
    console.log(`#${id}:`, document.getElementById(id) ? 'exists' : 'missing');
});
```

## 🆘 Emergency Reset

Nếu lỗi nghiêm trọng, thực hiện reset:

```javascript
// Clear localStorage
localStorage.clear();

// Reset global variables
currentOrder = [];
invoices = [];
orderHistory = [];
currentInvoiceId = null;
isAdminMode = false;

// Reload page
location.reload();
```

## 📞 Support Info

### Browser Requirements:
- ES6+ support
- localStorage support
- Canvas API (for QR code)

### Known Issues:
- Safari có thể yêu cầu user gesture cho localStorage
- Mobile browsers có thể có vấn đề với modal
- QR code library yêu cầu HTTPS trên production

---

**Status**: ✅ Lỗi syntax chính đã được sửa
**Last Updated**: June 20, 2025
**Tested On**: Chrome, Firefox, Local Server
