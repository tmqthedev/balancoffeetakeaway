# 🚀 Hướng dẫn khởi chạy BalanCoffee trên Localhost

## 📋 Yêu cầu hệ thống
- **Browser**: Chrome, Firefox, Safari, Edge (bất kỳ browser hiện đại nào)
- **Optional**: Python 3.x hoặc Node.js (để chạy local server)

---

## 🚀 **Cách 1: Live Server Extension (VS Code) - KHUYẾN NGHỊ**

### Bước 1: Cài đặt Live Server
1. Mở **VS Code**
2. Nhấn `Ctrl+Shift+X` để mở Extensions
3. Tìm kiếm **"Live Server"** của Ritwick Dey
4. Click **Install**

### Bước 2: Khởi chạy
1. Mở thư mục dự án trong VS Code
2. Click chuột phải vào file `index.html`
3. Chọn **"Open with Live Server"**
4. Website sẽ tự động mở tại: `http://127.0.0.1:5500`

### ✅ **Ưu điểm**:
- Auto-reload khi sửa code
- Không cần cài đặt thêm gì
- Hỗ trợ hot-reload cho development

---

## 🚀 **Cách 2: Python HTTP Server**

### Bước 1: Kiểm tra Python
```bash
python --version
# hoặc
python3 --version
```

### Bước 2: Khởi chạy server
```bash
# Mở terminal trong thư mục dự án
cd path/to/balancoffee_takeaway_order

# Python 3.x
python -m http.server 8000

# Python 2.x (nếu có)
python -m SimpleHTTPServer 8000
```

### Bước 3: Mở website
- Truy cập: `http://localhost:8000`
- Hoặc: `http://127.0.0.1:8000`

### ✅ **Ưu điểm**:
- Đơn giản, không cần cài đặt thêm
- Có sẵn trên hầu hết máy tính
- Suitable cho testing và demo

---

## 🚀 **Cách 3: Node.js HTTP Server**

### Bước 1: Cài đặt http-server
```bash
# Cài đặt global
npm install -g http-server

# Hoặc sử dụng npx (không cần cài global)
npx http-server
```

### Bước 2: Khởi chạy
```bash
# Trong thư mục dự án
http-server -p 8080

# Hoặc với npx
npx http-server -p 8080
```

### Bước 3: Mở website
- Truy cập: `http://localhost:8080`

### ✅ **Ưu điểm**:
- Nhiều options configure
- Hỗ trợ CORS, SSL
- Professional development server

---

## 🚀 **Cách 4: File Protocol (Không khuyến nghị)**

### Chỉ dành cho test nhanh:
1. Double-click vào file `index.html`
2. Website sẽ mở với URL: `file:///path/to/index.html`

### ⚠️ **Hạn chế**:
- LocalStorage có thể không hoạt động đúng
- CORS errors với một số features
- Không giống environment thực tế

---

## 🛠️ **Troubleshooting**

### ❌ **Lỗi favicon.ico 404**
- ✅ **Đã sửa**: Thêm favicon vào HTML và tạo file `favicon.ico`
- File `favicon.ico` đã được tạo trong thư mục root

### ❌ **Port đã được sử dụng**
```bash
# Thử port khác
python -m http.server 8001
http-server -p 8081
```

### ❌ **CORS errors**
- Không sử dụng file:// protocol
- Luôn dùng HTTP server (localhost)

### ❌ **LocalStorage không hoạt động**
- Đảm bảo sử dụng HTTP/HTTPS (không phải file://)
- Check browser developer tools console

---

## 📱 **Test trên Mobile**

### Cách 1: Same Network
1. Tìm IP address của máy tính:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
2. Trên mobile, truy cập: `http://[IP]:8000`
   
   Ví dụ: `http://192.168.1.100:8000`

### Cách 2: ngrok (Public URL)
```bash
# Cài đặt ngrok
npm install -g ngrok

# Tạo public URL
ngrok http 8000
```

---

## 🎯 **Recommended Setup**

### **Cho Development:**
- **VS Code + Live Server**: Auto-reload, easy debugging
- **Chrome DevTools**: Test responsive, performance

### **Cho Demo:**
- **Python HTTP Server**: Simple, reliable
- **Any modern browser**: Chrome, Firefox, Safari, Edge

### **Cho Production:**
- **Static hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare cho performance

---

## ✅ **Kiểm tra dự án hoạt động:**

1. **Menu hiển thị đúng** - 6 categories với món ăn
2. **Tạo hóa đơn** - Click món để tạo hóa đơn mới
3. **Sidebar** - Hiển thị danh sách hóa đơn
4. **Payment** - QR code generation hoạt động
5. **Admin panel** - Tổng kết doanh thu
6. **Responsive** - Hoạt động tốt trên mobile
7. **LocalStorage** - Dữ liệu được lưu khi refresh

### 🎉 **Nếu tất cả hoạt động tốt = Setup thành công!**

---

## 📞 **Support**

Nếu gặp vấn đề:
1. Check browser console (F12) cho errors
2. Đảm bảo sử dụng HTTP server (không phải file://)
3. Test trên browser khác
4. Clear browser cache và localStorage
5. Check network connectivity

**Happy coding! ☕**
