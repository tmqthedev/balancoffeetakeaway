/**
 * Script để kiểm tra đồng bộ class và ID giữa HTML và CSS
 */

const fs = require('fs');
const path = require('path');

// Đọc file HTML
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Đọc file CSS
const cssContent = fs.readFileSync('styles.css', 'utf8');

// Trích xuất các class từ HTML
const classMatches = htmlContent.match(/class="([^"]+)"/g) || [];
const htmlClasses = new Set();

classMatches.forEach(match => {
    const classes = match.replace('class="', '').replace('"', '').split(/\s+/);
    classes.forEach(cls => {
        if (cls.trim() && !cls.startsWith('fa')) { // Bỏ qua FontAwesome classes
            htmlClasses.add(cls.trim());
        }
    });
});

// Trích xuất các ID từ HTML
const idMatches = htmlContent.match(/id="([^"]+)"/g) || [];
const htmlIds = new Set();

idMatches.forEach(match => {
    const id = match.replace('id="', '').replace('"', '');
    if (id.trim()) {
        htmlIds.add(id.trim());
    }
});

// Trích xuất các class từ CSS
const cssClassMatches = cssContent.match(/\.([a-zA-Z0-9_-]+)/g) || [];
const cssClasses = new Set();

cssClassMatches.forEach(match => {
    const className = match.substring(1); // Bỏ dấu chấm
    cssClasses.add(className);
});

// Trích xuất các ID từ CSS
const cssIdMatches = cssContent.match(/#([a-zA-Z0-9_-]+)/g) || [];
const cssIds = new Set();

cssIdMatches.forEach(match => {
    const idName = match.substring(1); // Bỏ dấu #
    cssIds.add(idName);
});

// Tìm các class trong HTML nhưng không có trong CSS
const missingClasses = [];
htmlClasses.forEach(cls => {
    if (!cssClasses.has(cls)) {
        missingClasses.push(cls);
    }
});

// Tìm các ID trong HTML nhưng không có trong CSS
const missingIds = [];
htmlIds.forEach(id => {
    if (!cssIds.has(id)) {
        missingIds.push(id);
    }
});

// Báo cáo kết quả
console.log('='.repeat(60));
console.log('BÁO CÁO ĐỒNG BỘ HTML - CSS');
console.log('='.repeat(60));

console.log(`\nTổng số classes trong HTML: ${htmlClasses.size}`);
console.log(`Tổng số classes trong CSS: ${cssClasses.size}`);
console.log(`Tổng số IDs trong HTML: ${htmlIds.size}`);
console.log(`Tổng số IDs trong CSS: ${cssIds.size}`);

if (missingClasses.length > 0) {
    console.log(`\n❌ CLASSES THIẾU TRONG CSS (${missingClasses.length}):`);
    missingClasses.forEach(cls => console.log(`   .${cls}`));
} else {
    console.log('\n✅ Tất cả classes trong HTML đều có trong CSS');
}

if (missingIds.length > 0) {
    console.log(`\n❌ IDS THIẾU TRONG CSS (${missingIds.length}):`);
    missingIds.forEach(id => console.log(`   #${id}`));
} else {
    console.log('\n✅ Tất cả IDs trong HTML đều có trong CSS');
}

// Xuất danh sách classes và IDs để tham khảo
console.log('\n📋 DANH SÁCH CLASSES TRONG HTML:');
Array.from(htmlClasses).sort().forEach(cls => console.log(`   .${cls}`));

console.log('\n📋 DANH SÁCH IDS TRONG HTML:');
Array.from(htmlIds).sort().forEach(id => console.log(`   #${id}`));

console.log('\n' + '='.repeat(60));

// Tạo CSS cho các class/ID thiếu (nếu có)
if (missingClasses.length > 0 || missingIds.length > 0) {
    let additionalCSS = '\n/* ===== CSS CHO CÁC ELEMENTS THIẾU ===== */\n\n';
    
    if (missingClasses.length > 0) {
        additionalCSS += '/* Classes thiếu */\n';
        missingClasses.forEach(cls => {
            additionalCSS += `.${cls} {\n    /* Thêm styles cho .${cls} */\n}\n\n`;
        });
    }
    
    if (missingIds.length > 0) {
        additionalCSS += '/* IDs thiếu */\n';
        missingIds.forEach(id => {
            additionalCSS += `#${id} {\n    /* Thêm styles cho #${id} */\n}\n\n`;
        });
    }
    
    fs.writeFileSync('missing-styles.css', additionalCSS);
    console.log('\n📝 Đã tạo file "missing-styles.css" với CSS template cho các elements thiếu');
}
