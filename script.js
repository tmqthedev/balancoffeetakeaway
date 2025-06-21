// BalanCoffee - Main Application Script
// Version: 6.0 - Fixed All Issues

// Global variables
let currentOrder = [];
let invoices = [];
let currentInvoiceId = null;
let currentCategory = 'all';
let isAdminMode = false;
let orderHistory = [];
let shiftStartTime = null;

// Expose globals to window for diagnostic detection
window.currentOrder = currentOrder;
window.invoices = invoices;
window.orderHistory = orderHistory;
window.shiftStartTime = shiftStartTime;
window.currentInvoiceId = currentInvoiceId;
window.isAdminMode = isAdminMode;
window.currentCategory = currentCategory;
// Note: qrPaymentInfo and menuData are declared in data.js

// Fallback menu data
const fallbackMenuData = [
    {
        id: 1,
        name: "Cà phê đen",
        description: "Cà phê đen truyền thống",
        price: 25000,
        category: "cafe-viet"
    },
    {
        id: 2,
        name: "Cà phê sữa",
        description: "Cà phê với sữa đặc",
        price: 30000,
        category: "cafe-viet"
    },
    {
        id: 3,
        name: "Americano",
        description: "Espresso pha loãng",
        price: 40000,
        category: "cafe-y"
    }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Format price to Vietnamese currency
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = Number(price) || 0;
    }
    return price.toLocaleString('vi-VN') + '₫';
}

// Format date time to Vietnamese format
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Show notification
function showNotification(message, type = 'info') {
    try {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                                type === 'error' ? 'fa-exclamation-circle' : 
                                type === 'warning' ? 'fa-exclamation-triangle' : 
                                'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error showing notification:', error);
    }
}

// Utility function to wait for element to be available
function waitForElement(elementId, callback, maxRetries = 20, delay = 250) {
    const element = document.getElementById(elementId);
    
    if (element) {
        console.log(`✅ Element found: ${elementId}`, element);
        try {
            callback(element);
        } catch (error) {
            console.error(`❌ Error in callback for ${elementId}:`, error);
        }
    } else if (maxRetries > 0) {
        console.log(`⏳ Waiting for element: ${elementId} (${maxRetries} retries left)`);
        setTimeout(() => {
            waitForElement(elementId, callback, maxRetries - 1, delay);
        }, delay);
    } else {
        console.error(`❌ Element not found after retries: ${elementId}`);
        console.log('🔍 Document ready state:', document.readyState);
        console.log('🔍 Available elements with IDs:', 
            Array.from(document.querySelectorAll('[id]')).map(el => `${el.id} (${el.tagName})`));
        console.log('🔍 Body innerHTML length:', document.body ? document.body.innerHTML.length : 'No body');
        console.log('🔍 App container:', document.querySelector('.app-container') ? 'Found' : 'Missing');
        
        // Try alternative selectors
        const byClass = document.querySelector(`.${elementId}`);
        const byAttribute = document.querySelector(`[data-id="${elementId}"]`);
        if (byClass) console.log(`🔍 Found element by class: .${elementId}`, byClass);
        if (byAttribute) console.log(`🔍 Found element by data-id: [data-id="${elementId}"]`, byAttribute);
        
        // Try to proceed anyway if we have critical functions ready
        if (typeof callback === 'function') {
            console.log(`⚠️ Attempting to call callback without element for ${elementId}`);
            try {
                callback(null);
            } catch (error) {
                console.error(`❌ Callback failed for missing element ${elementId}:`, error);
            }
        }
    }
}

// Enhanced element finder with multiple strategies
function findElement(elementId) {
    // Strategy 1: getElementById
    let element = document.getElementById(elementId);
    if (element) return element;
    
    // Strategy 2: querySelector with ID
    element = document.querySelector(`#${elementId}`);
    if (element) return element;
    
    // Strategy 3: querySelector with escaped ID (in case of special characters)
    element = document.querySelector(`[id="${elementId}"]`);
    if (element) return element;
    
    // Strategy 4: Check if element exists but has different casing
    const allElements = Array.from(document.querySelectorAll('[id]'));
    const similarElement = allElements.find(el => el.id.toLowerCase() === elementId.toLowerCase());
    if (similarElement) {
        console.warn(`⚠️ Found element with different casing: ${similarElement.id} instead of ${elementId}`);
        return similarElement;
    }
    
    return null;
}

// Utility function to ensure DOM is ready
function ensureDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// =============================================================================
// LOCALSTORAGE FUNCTIONS
// =============================================================================

function loadInvoices() {
    try {
        const saved = localStorage.getItem('balancoffee_invoices');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                console.log('✅ Loaded invoices from localStorage:', parsed.length);
                return parsed;
            }
        }
        console.log('📝 No saved invoices found, starting fresh');
        return [];
    } catch (error) {
        console.error('❌ Error loading invoices:', error);
        return [];
    }
}

function saveInvoices() {
    try {
        localStorage.setItem('balancoffee_invoices', JSON.stringify(invoices));
        console.log('✅ Invoices saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving invoices:', error);
        showNotification('Lỗi lưu dữ liệu hóa đơn', 'error');
    }
}

function loadOrderHistory() {
    try {
        const saved = localStorage.getItem('balancoffee_order_history');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                console.log('✅ Loaded order history from localStorage:', parsed.length);
                return parsed;
            }
        }
        console.log('📝 No saved order history found, starting fresh');
        return [];
    } catch (error) {
        console.error('❌ Error loading order history:', error);
        return [];
    }
}

function saveOrderHistory() {
    try {
        localStorage.setItem('balancoffee_order_history', JSON.stringify(orderHistory));
        console.log('✅ Order history saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving order history:', error);
        showNotification('Lỗi lưu lịch sử đơn hàng', 'error');
    }
}

function getShiftStartTime() {
    try {
        let startTime = localStorage.getItem('shiftStartTime');
        if (!startTime) {
            startTime = new Date().toISOString();
            localStorage.setItem('shiftStartTime', startTime);
            console.log('🆕 Created new shift start time:', startTime);
        } else {
            console.log('📅 Loaded shift start time:', startTime);
        }
        return startTime;
    } catch (error) {
        console.error('❌ Error getting shift start time:', error);
        const fallback = new Date().toISOString();
        console.log('🔄 Using fallback shift start time:', fallback);
        return fallback;
    }
}

// =============================================================================
// QR CODE FUNCTIONS
// =============================================================================

function generateQRCode(amount) {
    try {
        // Try to use the static QR image first
        const qrImage = document.getElementById('qr-image');
        const qrFallback = document.getElementById('qr-fallback');
        
        if (qrImage) {
            qrImage.onerror = function() {
                console.log('📱 Static QR image failed, using canvas fallback');
                if (qrFallback) {
                    qrFallback.style.display = 'block';
                }
                this.style.display = 'none';
                generateQRFallback(amount);
            };
            
            qrImage.src = 'qr_code.png?' + Date.now();
            qrImage.style.display = 'block';
            if (qrFallback) {
                qrFallback.style.display = 'none';
            }
        } else {
            generateQRFallback(amount);
        }
        
        console.log('✅ QR code setup completed for amount:', amount);
    } catch (error) {
        console.error('❌ Error setting up QR code:', error);
        generateQRFallback(amount);
    }
}

function generateQRFallback(amount) {
    try {
        const canvas = document.getElementById('qr-code');
        if (!canvas) {
            console.error('❌ QR canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        
        // Border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 200, 200);
        
        // Text
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BalanCoffee', 100, 40);
        
        ctx.font = '12px Arial';
        ctx.fillText('Mã QR thanh toán', 100, 65);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText(formatPrice(amount), 100, 100);
        
        ctx.font = '11px Arial';
        ctx.fillText('Ngân hàng: ' + qrPaymentInfo.bankName, 100, 130);
        ctx.fillText('STK: ' + qrPaymentInfo.accountNumber, 100, 150);
        ctx.fillText('Chủ TK: ' + qrPaymentInfo.accountHolder, 100, 170);
        
        ctx.font = '10px Arial';
        ctx.fillText('Sử dụng app ngân hàng để thanh toán', 100, 190);
        
        console.log('✅ QR canvas fallback generated successfully');
    } catch (error) {
        console.error('❌ Error generating QR canvas fallback:', error);
    }
}

// =============================================================================
// SHIFT MANAGEMENT FUNCTIONS
// =============================================================================

function startNewShift() {
    const confirmStart = confirm('Bạn có chắc chắn muốn bắt đầu ca mới? Dữ liệu ca hiện tại sẽ được lưu trữ.');
    
    if (confirmStart) {
        try {
            // Save current shift data before starting new one
            const currentShiftOrders = getCurrentShiftOrders();
            if (currentShiftOrders.length > 0) {
                // Archive current shift data
                const archiveData = {
                    shiftInfo: {
                        startTime: shiftStartTime,
                        endTime: new Date().toISOString(),
                        totalOrders: currentShiftOrders.length,
                        totalRevenue: currentShiftOrders.reduce((sum, order) => sum + (order.total || 0), 0)
                    },
                    orders: currentShiftOrders
                };
                
                // Save to archived shifts
                let archivedShifts = JSON.parse(localStorage.getItem('balancoffee_archived_shifts') || '[]');
                archivedShifts.push(archiveData);
                localStorage.setItem('balancoffee_archived_shifts', JSON.stringify(archivedShifts));
                
                showNotification('Đã lưu trữ dữ liệu ca cũ', 'success');
            }
            
            // Reset shift start time
            shiftStartTime = new Date().toISOString();
            localStorage.setItem('shiftStartTime', shiftStartTime);
            
            // Clear current shift data from order history
            const shiftStartDate = new Date(shiftStartTime);
            orderHistory = orderHistory.filter(order => {
                if (!order.timestamp) return true;
                const orderDate = new Date(order.timestamp);
                return orderDate < shiftStartDate;
            });
            
            saveOrderHistory();
            
            // Clear pending invoices if any
            const currentTime = new Date(shiftStartTime);
            invoices = invoices.filter(invoice => {
                if (!invoice.createdAt) return true;
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate < currentTime;
            });
            
            saveInvoices();
            
            // Refresh display
            if (isAdminMode) {
                displayCurrentShiftData();
            }
            updateInvoiceDisplay();
            updateInvoiceCount();
            
            showNotification('Đã bắt đầu ca mới thành công!', 'success');
            console.log('✅ New shift started at:', new Date(shiftStartTime).toLocaleString());
            
        } catch (error) {
            console.error('❌ Error starting new shift:', error);
            showNotification('Lỗi bắt đầu ca mới: ' + error.message, 'error');
        }
    }
}

function viewCurrentShift() {
    displayCurrentShiftData();
    showNotification('Đã cập nhật thông tin ca hiện tại');
}

function endShift() {
    const currentShiftOrders = getCurrentShiftOrders();
    
    if (currentShiftOrders.length === 0) {
        showNotification('Không có đơn hàng nào trong ca này để kết thúc', 'warning');
        return;
    }
    
    // Populate shift summary modal
    populateEndShiftModal(currentShiftOrders);
      // Show modal with proper timing
    const modal = document.getElementById('end-shift-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ End shift modal show class added');
        }, 50);
    }
}

function getCurrentShiftOrders() {
    if (!orderHistory || orderHistory.length === 0) {
        orderHistory = loadOrderHistory();
    }
    
    const currentShiftStart = new Date(shiftStartTime);
    
    return orderHistory.filter(order => {
        if (!order.timestamp) return false;
        const orderDate = new Date(order.timestamp);
        return orderDate >= currentShiftStart;
    });
}

function displayCurrentShiftData() {
    const currentShiftOrders = getCurrentShiftOrders();
    updateCurrentShiftSummary(currentShiftOrders);
    displayCurrentShiftOrders(currentShiftOrders);
}

function updateCurrentShiftSummary(orders) {
    if (!orders) orders = [];
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate best seller
    const itemCount = {};
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                if (item.name && item.quantity) {
                    itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity;
                }
            });
        }
    });
    
    let bestSeller = '-';
    let maxCount = 0;
    for (const [itemName, count] of Object.entries(itemCount)) {
        if (count > maxCount) {
            maxCount = count;
            bestSeller = `${itemName} (${count})`;
        }
    }
    
    // Update UI
    const totalOrdersEl = document.getElementById('current-shift-orders');
    const totalRevenueEl = document.getElementById('current-shift-revenue');
    const bestSellerEl = document.getElementById('current-shift-bestseller');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = formatPrice(totalRevenue);
    if (bestSellerEl) bestSellerEl.textContent = bestSeller;
}

function displayCurrentShiftOrders(orders) {
    const container = document.getElementById('current-shift-list');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="no-orders">Chưa có đơn hàng nào trong ca này.</p>';
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-time">${formatDateTime(order.timestamp)}</span>
                <span class="order-total">${formatPrice(order.total)}</span>
            </div>
            <div class="order-details">
                ${order.items ? order.items.map(item => 
                    `<span class="order-item-detail">${item.quantity}x ${item.name}</span>`
                ).join(', ') : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = ordersHTML;
}

// =============================================================================
// UI FUNCTIONS
// =============================================================================

function updateInvoiceDisplay() {
    try {
        const invoiceList = document.getElementById('invoice-list');
        
        if (!invoiceList) {
            console.error('❌ Invoice list element not found, retrying in 500ms...');
            // Retry after a short delay
            setTimeout(() => {
                updateInvoiceDisplay();
            }, 500);
            return;
        }
        
        if (invoices.length === 0) {
            invoiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Chưa có hóa đơn nào</p>
                </div>
            `;
            return;
        }
        
        // Filter only pending invoices
        const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
        
        if (pendingInvoices.length === 0) {
            invoiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    <p>Tất cả hóa đơn đã được thanh toán</p>
                </div>
            `;
            return;
        }
        
        // Sort pending invoices by creation date
        const sortedInvoices = [...pendingInvoices].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        invoiceList.innerHTML = sortedInvoices.map(invoice => `
            <div class="invoice-item ${currentInvoiceId === invoice.id ? 'active' : ''}" 
                 data-invoice-id="${invoice.id}">
                <div class="invoice-header" onclick="selectInvoice('${invoice.id}')">
                    <span class="invoice-id">Hóa đơn #${invoice.id}</span>
                    <span class="invoice-status ${invoice.status}">
                        ${invoice.status === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                    </span>
                </div>
                <div class="invoice-details">
                    <p>Số món: ${invoice.items ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0}</p>
                    <p>Thời gian: ${formatDateTime(invoice.createdAt)}</p>
                </div>
                <div class="invoice-total">
                    Tổng: ${formatPrice(invoice.total || 0)}
                </div>
                <div class="invoice-actions">
                    <button class="btn-pay" onclick="event.stopPropagation(); processPayment('${invoice.id}')" title="Thanh toán">
                        <i class="fas fa-credit-card"></i>
                    </button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Invoice display updated:', invoices.length, 'invoices');
        
    } catch (error) {
        console.error('❌ Error updating invoice display:', error);
        showNotification('Lỗi cập nhật danh sách hóa đơn: ' + error.message, 'error');
    }
}

function updateInvoiceCount() {
    try {
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
        const countElements = document.querySelectorAll('.invoice-count');
        
        countElements.forEach(el => {
            el.textContent = pendingInvoices.length;
        });
        
        console.log('✅ Invoice count updated:', pendingInvoices.length);
    } catch (error) {
        console.error('❌ Error updating invoice count:', error);
    }
}

function batchUpdate(updates = {}) {
    try {
        if (updates.invoiceDisplay) {
            updateInvoiceDisplay();
        }
        if (updates.menu) {
            renderMenu();
        }
        if (updates.invoiceCount) {
            updateInvoiceCount();
        }
        if (updates.adminData && isAdminMode) {
            displayCurrentShiftData();
        }
    } catch (error) {
        console.error('❌ Error in batch update:', error);
        showNotification('Lỗi cập nhật giao diện: ' + error.message, 'error');
    }
}

function toggleAdmin() {    try {
        isAdminMode = !isAdminMode;
        window.isAdminMode = isAdminMode; // Sync window variable
        const adminSection = document.getElementById('admin-section');
        const menuSection = document.querySelector('.menu-section');
        const adminBtn = document.querySelector('[onclick="toggleAdmin()"]');
        
        if (isAdminMode) {
            if (adminSection) adminSection.style.display = 'block';
            if (menuSection) menuSection.style.display = 'none';
            if (adminBtn) adminBtn.textContent = 'Quay lại Menu';
            displayCurrentShiftData();
        } else {
            if (adminSection) adminSection.style.display = 'none';
            if (menuSection) menuSection.style.display = 'block';
            if (adminBtn) adminBtn.textContent = 'Tổng kết';
        }
        
        console.log('✅ Admin mode toggled:', isAdminMode ? 'ON' : 'OFF');
    } catch (error) {
        console.error('❌ Error toggling admin mode:', error);
        showNotification('Lỗi chuyển đổi chế độ admin: ' + error.message, 'error');
    }
}

// =============================================================================
// PLACEHOLDER FUNCTIONS (BASIC IMPLEMENTATIONS)
// =============================================================================

function renderMenu() {
    try {
        console.log('🎨 Rendering menu...');
        
        const menuContainer = document.getElementById('menu-grid');
        if (!menuContainer) {
            console.error('❌ Menu container not found (menu-grid), retrying in 500ms...');
            // Retry after a short delay
            setTimeout(() => {
                renderMenu();
            }, 500);
            return;
        }
        
        // Use menuData from data.js or fallback
        const menuItems = window.menuData || fallbackMenuData;
        
        // Clear existing menu
        menuContainer.innerHTML = '';
        
        // Group items by category if needed
        const filteredItems = currentCategory === 'all' ? 
            menuItems : 
            menuItems.filter(item => item.category === currentCategory);
        
        if (filteredItems.length === 0) {
            menuContainer.innerHTML = '<p class="no-items">Không có món nào trong danh mục này.</p>';
            return;
        }
        
        // Render menu items
        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <i class="fas fa-coffee"></i>
                </div>
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description || 'Món ngon từ BalanCoffee'}</p>
                    <span class="price">${formatPrice(item.price)}</span>
                </div>
                <button class="btn-add" onclick="addToOrder(${item.id})" title="Thêm vào đơn hàng">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            menuContainer.appendChild(menuItem);
        });
        
        console.log('✅ Menu rendered:', filteredItems.length, 'items');
        
    } catch (error) {
        console.error('❌ Error rendering menu:', error);
        showNotification('Lỗi hiển thị menu: ' + error.message, 'error');
    }
}

function createNewInvoice() {
    try {
        console.log('📄 Creating new invoice...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, không thể tạo hóa đơn', 'warning');
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Generate invoice ID
        const invoiceId = 'HD' + Date.now().toString().slice(-6);
        
        // Create invoice object
        const newInvoice = {
            id: invoiceId,
            items: [...currentOrder],
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentMethod: null
        };
        
        // Add to invoices array
        invoices.push(newInvoice);
        saveInvoices();
        
        // Clear current order
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        // Update UI
        updateInvoiceDisplay();
        updateInvoiceCount();
        updateOrderDisplay();
        
        showNotification(`Đã tạo hóa đơn #${invoiceId}`, 'success');
        console.log('✅ Invoice created:', newInvoice);
        
        return newInvoice;
        
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        showNotification('Lỗi tạo hóa đơn: ' + error.message, 'error');
    }
}

// Add item to current order
function addToOrder(itemId) {
    try {
        console.log('🛒 Adding item to order:', itemId);
        
        const menuItems = window.menuData || fallbackMenuData;
        const item = menuItems.find(i => i.id === itemId);
        
        if (!item) {
            console.error('❌ Item not found:', itemId);
            showNotification('Không tìm thấy món này', 'error');
            return;
        }
        
        // Check if item already in order
        const existingItem = currentOrder.find(orderItem => orderItem.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentOrder.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
        
        // Sync window variable
        window.currentOrder = currentOrder;
        
        // Update order display
        updateOrderDisplay();
        
        showNotification(`Đã thêm ${item.name} vào đơn hàng`, 'success');
        console.log('✅ Item added to order:', item.name);
        
    } catch (error) {
        console.error('❌ Error adding item to order:', error);
        showNotification('Lỗi thêm món: ' + error.message, 'error');
    }
}

// Update order display in sidebar
function updateOrderDisplay() {
    try {
        const orderList = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        if (!orderList) {
            console.log('📝 Order list element not found (order-items), will retry when needed');
            return;
        }
        
        if (currentOrder.length === 0) {
            orderList.innerHTML = '<p class="empty-order">Chưa có món nào trong đơn hàng</p>';
            if (orderTotal) orderTotal.textContent = formatPrice(0);
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Render order items
        orderList.innerHTML = currentOrder.map(item => `
            <div class="order-item">
                <div class="order-item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${formatPrice(item.price)}</span>
                </div>
                <div class="order-item-controls">
                    <button onclick="decreaseQuantity(${item.id})" class="btn-qty">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})" class="btn-qty">+</button>
                    <button onclick="removeFromOrder(${item.id})" class="btn-remove" title="Xóa món">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update total
        if (orderTotal) {
            orderTotal.textContent = formatPrice(total);
        }
        
        console.log('✅ Order display updated:', currentOrder.length, 'items');
        
    } catch (error) {
        console.error('❌ Error updating order display:', error);
    }
}

// Quantity control functions
function increaseQuantity(itemId) {
    const item = currentOrder.find(i => i.id === itemId);
    if (item) {
        item.quantity += 1;
        window.currentOrder = currentOrder;
        updateOrderDisplay();
    }
}

function decreaseQuantity(itemId) {
    const item = currentOrder.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        window.currentOrder = currentOrder;
        updateOrderDisplay();
    }
}

function removeFromOrder(itemId) {
    currentOrder = currentOrder.filter(item => item.id !== itemId);
    window.currentOrder = currentOrder;
    updateOrderDisplay();
    
    const item = (window.menuData || fallbackMenuData).find(i => i.id === itemId);
    if (item) {
        showNotification(`Đã xóa ${item.name} khỏi đơn hàng`);
    }
}

function openOrderModal() {
    try {
        console.log('📝 Opening order modal...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, vui lòng chọn món trước', 'warning');
            return;
        }
        
        const modal = document.getElementById('order-modal');
        if (!modal) {
            console.error('❌ Order modal not found');
            return;
        }
          // Update modal content
        updateOrderModalContent();
          // Show modal with proper timing
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        // Add show class with slight delay for transition
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ Order modal show class added');
        }, 50);
        
        console.log('✅ Order modal opened');
        
    } catch (error) {
        console.error('❌ Error opening order modal:', error);
        showNotification('Lỗi mở modal đơn hàng: ' + error.message, 'error');
    }
}

function closeOrderModal() {
    try {
        console.log('❌ Closing order modal...');
        
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        console.log('✅ Order modal closed');
        
    } catch (error) {
        console.error('❌ Error closing order modal:', error);
    }
}

function updateOrderModalContent() {
    try {
        const modalItems = document.getElementById('order-items');
        const modalTotal = document.getElementById('order-total');
        
        if (!modalItems || !modalTotal) {
            console.log('📝 Modal elements not found (order-items, order-total)');
            return;
        }
        
        if (currentOrder.length === 0) {
            modalItems.innerHTML = '<p class="empty-order">Đơn hàng trống</p>';
            modalTotal.textContent = formatPrice(0);
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Render items
        modalItems.innerHTML = currentOrder.map(item => `
            <div class="modal-order-item">
                <span class="item-name">${item.name}</span>
                <span class="item-details">${item.quantity} x ${formatPrice(item.price)}</span>
                <span class="item-total">${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
        
        modalTotal.textContent = formatPrice(total);
        
        console.log('✅ Order modal content updated');
        
    } catch (error) {
        console.error('❌ Error updating order modal content:', error);
    }
}

function confirmOrder() {
    try {
        console.log('✅ Confirming order...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, không thể xác nhận', 'warning');
            return;
        }
        
        // Create invoice
        const invoice = createNewInvoice();
        
        if (invoice) {
            // Close order modal
            closeOrderModal();
            
            // Add to order history
            const orderRecord = {
                id: invoice.id,
                items: [...invoice.items],
                total: invoice.total,
                timestamp: invoice.createdAt,
                status: 'completed'
            };
            
            orderHistory.push(orderRecord);
            saveOrderHistory();
            window.orderHistory = orderHistory;
            
            showNotification(`Đã xác nhận đơn hàng #${invoice.id}`, 'success');
            console.log('✅ Order confirmed and added to history');
            
            // Select the new invoice for payment
            selectInvoice(invoice.id);
        }
        
    } catch (error) {
        console.error('❌ Error confirming order:', error);
        showNotification('Lỗi xác nhận đơn hàng: ' + error.message, 'error');
    }
}

function openPaymentModal(invoice) {
    try {
        console.log('💳 Opening payment modal for:', invoice?.id);
        
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        const modal = document.getElementById('payment-modal');
        if (!modal) {
            console.error('❌ Payment modal not found');
            return;
        }
          // Update modal content
        updatePaymentModalContent(invoice);
        
        // Add payment action buttons
        const paymentActions = document.getElementById('payment-actions');
        if (paymentActions) {
            paymentActions.innerHTML = `
                <button class="btn btn-secondary" onclick="closePaymentModal()">Hủy</button>
                <button class="btn btn-success" onclick="confirmPayment()">
                    <i class="fas fa-check"></i> Xác nhận đã thanh toán
                </button>
            `;
        }
          // Generate QR code for payment
        generateQRCode(invoice.total);        // Show modal with proper timing
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        // Add show class with slight delay for transition
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ Payment modal show class added');
        }, 50);
        
        console.log('✅ Payment modal opened for invoice:', invoice.id);
        
    } catch (error) {
        console.error('❌ Error opening payment modal:', error);
        showNotification('Lỗi mở modal thanh toán: ' + error.message, 'error');
    }
}

function updatePaymentModalContent(invoice) {
    try {
        const invoiceId = document.getElementById('payment-modal-title');
        const invoiceItems = document.getElementById('payment-order-summary');
        const invoiceTotal = document.getElementById('payment-total');
        
        if (invoiceId) invoiceId.textContent = `Thanh toán hóa đơn #${invoice.id}`;
        
        if (invoiceItems && invoice.items) {
            invoiceItems.innerHTML = invoice.items.map(item => `
                <div class="payment-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('');
        }
        
        if (invoiceTotal) {
            invoiceTotal.textContent = formatPrice(invoice.total);
        }
        
        console.log('✅ Payment modal content updated');
        
    } catch (error) {
        console.error('❌ Error updating payment modal content:', error);
    }
}

function confirmPayment() {
    try {
        console.log('💰 Confirming payment...');
        
        if (!currentInvoiceId) {
            showNotification('Không có hóa đơn được chọn', 'error');
            return;
        }
        
        const invoice = invoices.find(inv => inv.id === currentInvoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        // Mark invoice as paid
        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();
        invoice.paymentMethod = 'qr';
        
        // Save changes
        saveInvoices();
        window.invoices = invoices;
        
        // Update UI
        updateInvoiceDisplay();
        updateInvoiceCount();
          // Close payment modal
        closePaymentModal();
        
        // Show success modal
        showSuccessModal(invoice);
        
        console.log('✅ Payment confirmed for invoice:', invoice.id);
        
        // Clear current selection
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId;
        
    } catch (error) {
        console.error('❌ Error confirming payment:', error);
        showNotification('Lỗi xác nhận thanh toán: ' + error.message, 'error');
    }
}

function closePaymentModal() {
    try {
        console.log('❌ Closing payment modal...');
        
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        console.log('✅ Payment modal closed');
        
    } catch (error) {
        console.error('❌ Error closing payment modal:', error);
    }
}

function selectInvoice(invoiceId) {
    try {
        console.log('📋 Select invoice called:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            console.error('❌ Invoice not found:', invoiceId);
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        currentInvoiceId = invoiceId;
        window.currentInvoiceId = currentInvoiceId; // Sync window variable
        
        // Load invoice items into current order for editing
        currentOrder = [...(invoice.items || [])];
        window.currentOrder = currentOrder; // Sync window variable
        
        console.log('✅ Invoice loaded for editing:', invoice);
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        showSidebarControls();
        
        showNotification(`Đã chọn hóa đơn #${invoiceId} để chỉnh sửa`, 'success');
        
    } catch (error) {
        console.error('❌ Error selecting invoice:', error);
        showNotification('Lỗi chọn hóa đơn: ' + error.message, 'error');
    }
}

function deselectInvoice() {
    try {
        console.log('📋 Deselecting invoice...');
        
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId; // Sync window variable
        
        // Clear current order
        currentOrder = [];
        window.currentOrder = currentOrder; // Sync window variable
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        hideSidebarControls();
        
        showNotification('Đã bỏ chọn hóa đơn', 'info');
        
    } catch (error) {
        console.error('❌ Error deselecting invoice:', error);
        showNotification('Lỗi bỏ chọn hóa đơn: ' + error.message, 'error');
    }
}

function showSidebarControls() {
    try {
        const controls = document.getElementById('sidebar-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    } catch (error) {
        console.error('❌ Error showing sidebar controls:', error);
    }
}

function hideSidebarControls() {
    try {
        const controls = document.getElementById('sidebar-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Error hiding sidebar controls:', error);
    }
}

// =============================================================================
// SHIFT MANAGEMENT FUNCTIONS
// =============================================================================

function startNewShift() {
    const confirmStart = confirm('Bạn có chắc chắn muốn bắt đầu ca mới? Dữ liệu ca hiện tại sẽ được lưu trữ.');
    
    if (confirmStart) {
        try {
            // Save current shift data before starting new one
            const currentShiftOrders = getCurrentShiftOrders();
            if (currentShiftOrders.length > 0) {
                // Archive current shift data
                const archiveData = {
                    shiftInfo: {
                        startTime: shiftStartTime,
                        endTime: new Date().toISOString(),
                        totalOrders: currentShiftOrders.length,
                        totalRevenue: currentShiftOrders.reduce((sum, order) => sum + (order.total || 0), 0)
                    },
                    orders: currentShiftOrders
                };
                
                // Save to archived shifts
                let archivedShifts = JSON.parse(localStorage.getItem('balancoffee_archived_shifts') || '[]');
                archivedShifts.push(archiveData);
                localStorage.setItem('balancoffee_archived_shifts', JSON.stringify(archivedShifts));
                
                showNotification('Đã lưu trữ dữ liệu ca cũ', 'success');
            }
            
            // Reset shift start time
            shiftStartTime = new Date().toISOString();
            localStorage.setItem('shiftStartTime', shiftStartTime);
            
            // Clear current shift data from order history
            const shiftStartDate = new Date(shiftStartTime);
            orderHistory = orderHistory.filter(order => {
                if (!order.timestamp) return true;
                const orderDate = new Date(order.timestamp);
                return orderDate < shiftStartDate;
            });
            
            saveOrderHistory();
            
            // Clear pending invoices if any
            const currentTime = new Date(shiftStartTime);
            invoices = invoices.filter(invoice => {
                if (!invoice.createdAt) return true;
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate < currentTime;
            });
            
            saveInvoices();
            
            // Refresh display
            if (isAdminMode) {
                displayCurrentShiftData();
            }
            updateInvoiceDisplay();
            updateInvoiceCount();
            
            showNotification('Đã bắt đầu ca mới thành công!', 'success');
            console.log('✅ New shift started at:', new Date(shiftStartTime).toLocaleString());
            
        } catch (error) {
            console.error('❌ Error starting new shift:', error);
            showNotification('Lỗi bắt đầu ca mới: ' + error.message, 'error');
        }
    }
}

function viewCurrentShift() {
    displayCurrentShiftData();
    showNotification('Đã cập nhật thông tin ca hiện tại');
}

function endShift() {
    const currentShiftOrders = getCurrentShiftOrders();
    
    if (currentShiftOrders.length === 0) {
        showNotification('Không có đơn hàng nào trong ca này để kết thúc', 'warning');
        return;
    }
    
    // Populate shift summary modal
    populateEndShiftModal(currentShiftOrders);
      // Show modal with proper timing
    const modal = document.getElementById('end-shift-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ End shift modal show class added');
        }, 50);
    }
}

function getCurrentShiftOrders() {
    if (!orderHistory || orderHistory.length === 0) {
        orderHistory = loadOrderHistory();
    }
    
    const currentShiftStart = new Date(shiftStartTime);
    
    return orderHistory.filter(order => {
        if (!order.timestamp) return false;
        const orderDate = new Date(order.timestamp);
        return orderDate >= currentShiftStart;
    });
}

function displayCurrentShiftData() {
    const currentShiftOrders = getCurrentShiftOrders();
    updateCurrentShiftSummary(currentShiftOrders);
    displayCurrentShiftOrders(currentShiftOrders);
}

function updateCurrentShiftSummary(orders) {
    if (!orders) orders = [];
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate best seller
    const itemCount = {};
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                if (item.name && item.quantity) {
                    itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity;
                }
            });
        }
    });
    
    let bestSeller = '-';
    let maxCount = 0;
    for (const [itemName, count] of Object.entries(itemCount)) {
        if (count > maxCount) {
            maxCount = count;
            bestSeller = `${itemName} (${count})`;
        }
    }
    
    // Update UI
    const totalOrdersEl = document.getElementById('current-shift-orders');
    const totalRevenueEl = document.getElementById('current-shift-revenue');
    const bestSellerEl = document.getElementById('current-shift-bestseller');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = formatPrice(totalRevenue);
    if (bestSellerEl) bestSellerEl.textContent = bestSeller;
}

function displayCurrentShiftOrders(orders) {
    const container = document.getElementById('current-shift-list');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="no-orders">Chưa có đơn hàng nào trong ca này.</p>';
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-time">${formatDateTime(order.timestamp)}</span>
                <span class="order-total">${formatPrice(order.total)}</span>
            </div>
            <div class="order-details">
                ${order.items ? order.items.map(item => 
                    `<span class="order-item-detail">${item.quantity}x ${item.name}</span>`
                ).join(', ') : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = ordersHTML;
}

// =============================================================================
// UI FUNCTIONS
// =============================================================================

function updateInvoiceDisplay() {
    try {
        const invoiceList = document.getElementById('invoice-list');
        
        if (!invoiceList) {
            console.error('❌ Invoice list element not found, retrying in 500ms...');
            // Retry after a short delay
            setTimeout(() => {
                updateInvoiceDisplay();
            }, 500);
            return;
        }
        
        if (invoices.length === 0) {
            invoiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Chưa có hóa đơn nào</p>
                </div>
            `;
            return;
        }
        
        // Filter only pending invoices
        const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
        
        if (pendingInvoices.length === 0) {
            invoiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    <p>Tất cả hóa đơn đã được thanh toán</p>
                </div>
            `;
            return;
        }
        
        // Sort pending invoices by creation date
        const sortedInvoices = [...pendingInvoices].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        invoiceList.innerHTML = sortedInvoices.map(invoice => `
            <div class="invoice-item ${currentInvoiceId === invoice.id ? 'active' : ''}" 
                 data-invoice-id="${invoice.id}">
                <div class="invoice-header" onclick="selectInvoice('${invoice.id}')">
                    <span class="invoice-id">Hóa đơn #${invoice.id}</span>
                    <span class="invoice-status ${invoice.status}">
                        ${invoice.status === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                    </span>
                </div>
                <div class="invoice-details">
                    <p>Số món: ${invoice.items ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0}</p>
                    <p>Thời gian: ${formatDateTime(invoice.createdAt)}</p>
                </div>
                <div class="invoice-total">
                    Tổng: ${formatPrice(invoice.total || 0)}
                </div>
                <div class="invoice-actions">
                    <button class="btn-pay" onclick="event.stopPropagation(); processPayment('${invoice.id}')" title="Thanh toán">
                        <i class="fas fa-credit-card"></i>
                    </button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Invoice display updated:', invoices.length, 'invoices');
        
    } catch (error) {
        console.error('❌ Error updating invoice display:', error);
        showNotification('Lỗi cập nhật danh sách hóa đơn: ' + error.message, 'error');
    }
}

function updateInvoiceCount() {
    try {
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
        const countElements = document.querySelectorAll('.invoice-count');
        
        countElements.forEach(el => {
            el.textContent = pendingInvoices.length;
        });
        
        console.log('✅ Invoice count updated:', pendingInvoices.length);
    } catch (error) {
        console.error('❌ Error updating invoice count:', error);
    }
}

function batchUpdate(updates = {}) {
    try {
        if (updates.invoiceDisplay) {
            updateInvoiceDisplay();
        }
        if (updates.menu) {
            renderMenu();
        }
        if (updates.invoiceCount) {
            updateInvoiceCount();
        }
        if (updates.adminData && isAdminMode) {
            displayCurrentShiftData();
        }
    } catch (error) {
        console.error('❌ Error in batch update:', error);
        showNotification('Lỗi cập nhật giao diện: ' + error.message, 'error');
    }
}

function toggleAdmin() {    try {
        isAdminMode = !isAdminMode;
        window.isAdminMode = isAdminMode; // Sync window variable
        const adminSection = document.getElementById('admin-section');
        const menuSection = document.querySelector('.menu-section');
        const adminBtn = document.querySelector('[onclick="toggleAdmin()"]');
        
        if (isAdminMode) {
            if (adminSection) adminSection.style.display = 'block';
            if (menuSection) menuSection.style.display = 'none';
            if (adminBtn) adminBtn.textContent = 'Quay lại Menu';
            displayCurrentShiftData();
        } else {
            if (adminSection) adminSection.style.display = 'none';
            if (menuSection) menuSection.style.display = 'block';
            if (adminBtn) adminBtn.textContent = 'Tổng kết';
        }
        
        console.log('✅ Admin mode toggled:', isAdminMode ? 'ON' : 'OFF');
    } catch (error) {
        console.error('❌ Error toggling admin mode:', error);
        showNotification('Lỗi chuyển đổi chế độ admin: ' + error.message, 'error');
    }
}

// =============================================================================
// PLACEHOLDER FUNCTIONS (BASIC IMPLEMENTATIONS)
// =============================================================================

function renderMenu() {
    try {
        console.log('🎨 Rendering menu...');
        
        const menuContainer = document.getElementById('menu-grid');
        if (!menuContainer) {
            console.error('❌ Menu container not found (menu-grid), retrying in 500ms...');
            // Retry after a short delay
            setTimeout(() => {
                renderMenu();
            }, 500);
            return;
        }
        
        // Use menuData from data.js or fallback
        const menuItems = window.menuData || fallbackMenuData;
        
        // Clear existing menu
        menuContainer.innerHTML = '';
        
        // Group items by category if needed
        const filteredItems = currentCategory === 'all' ? 
            menuItems : 
            menuItems.filter(item => item.category === currentCategory);
        
        if (filteredItems.length === 0) {
            menuContainer.innerHTML = '<p class="no-items">Không có món nào trong danh mục này.</p>';
            return;
        }
        
        // Render menu items
        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <i class="fas fa-coffee"></i>
                </div>
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description || 'Món ngon từ BalanCoffee'}</p>
                    <span class="price">${formatPrice(item.price)}</span>
                </div>
                <button class="btn-add" onclick="addToOrder(${item.id})" title="Thêm vào đơn hàng">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            menuContainer.appendChild(menuItem);
        });
        
        console.log('✅ Menu rendered:', filteredItems.length, 'items');
        
    } catch (error) {
        console.error('❌ Error rendering menu:', error);
        showNotification('Lỗi hiển thị menu: ' + error.message, 'error');
    }
}

function createNewInvoice() {
    try {
        console.log('📄 Creating new invoice...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, không thể tạo hóa đơn', 'warning');
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Generate invoice ID
        const invoiceId = 'HD' + Date.now().toString().slice(-6);
        
        // Create invoice object
        const newInvoice = {
            id: invoiceId,
            items: [...currentOrder],
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentMethod: null
        };
        
        // Add to invoices array
        invoices.push(newInvoice);
        saveInvoices();
        
        // Clear current order
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        // Update UI
        updateInvoiceDisplay();
        updateInvoiceCount();
        updateOrderDisplay();
        
        showNotification(`Đã tạo hóa đơn #${invoiceId}`, 'success');
        console.log('✅ Invoice created:', newInvoice);
        
        return newInvoice;
        
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        showNotification('Lỗi tạo hóa đơn: ' + error.message, 'error');
    }
}

// Add item to current order
function addToOrder(itemId) {
    try {
        console.log('🛒 Adding item to order:', itemId);
        
        const menuItems = window.menuData || fallbackMenuData;
        const item = menuItems.find(i => i.id === itemId);
        
        if (!item) {
            console.error('❌ Item not found:', itemId);
            showNotification('Không tìm thấy món này', 'error');
            return;
        }
        
        // Check if item already in order
        const existingItem = currentOrder.find(orderItem => orderItem.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentOrder.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
        
        // Sync window variable
        window.currentOrder = currentOrder;
        
        // Update order display
        updateOrderDisplay();
        
        showNotification(`Đã thêm ${item.name} vào đơn hàng`, 'success');
        console.log('✅ Item added to order:', item.name);
        
    } catch (error) {
        console.error('❌ Error adding item to order:', error);
        showNotification('Lỗi thêm món: ' + error.message, 'error');
    }
}

// Update order display in sidebar
function updateOrderDisplay() {
    try {
        const orderList = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        if (!orderList) {
            console.log('📝 Order list element not found (order-items), will retry when needed');
            return;
        }
        
        if (currentOrder.length === 0) {
            orderList.innerHTML = '<p class="empty-order">Chưa có món nào trong đơn hàng</p>';
            if (orderTotal) orderTotal.textContent = formatPrice(0);
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Render order items
        orderList.innerHTML = currentOrder.map(item => `
            <div class="order-item">
                <div class="order-item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${formatPrice(item.price)}</span>
                </div>
                <div class="order-item-controls">
                    <button onclick="decreaseQuantity(${item.id})" class="btn-qty">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})" class="btn-qty">+</button>
                    <button onclick="removeFromOrder(${item.id})" class="btn-remove" title="Xóa món">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update total
        if (orderTotal) {
            orderTotal.textContent = formatPrice(total);
        }
        
        console.log('✅ Order display updated:', currentOrder.length, 'items');
        
    } catch (error) {
        console.error('❌ Error updating order display:', error);
    }
}

// Quantity control functions
function increaseQuantity(itemId) {
    const item = currentOrder.find(i => i.id === itemId);
    if (item) {
        item.quantity += 1;
        window.currentOrder = currentOrder;
        updateOrderDisplay();
    }
}

function decreaseQuantity(itemId) {
    const item = currentOrder.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        window.currentOrder = currentOrder;
        updateOrderDisplay();
    }
}

function removeFromOrder(itemId) {
    currentOrder = currentOrder.filter(item => item.id !== itemId);
    window.currentOrder = currentOrder;
    updateOrderDisplay();
    
    const item = (window.menuData || fallbackMenuData).find(i => i.id === itemId);
    if (item) {
        showNotification(`Đã xóa ${item.name} khỏi đơn hàng`);
    }
}

function openOrderModal() {
    try {
        console.log('📝 Opening order modal...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, vui lòng chọn món trước', 'warning');
            return;
        }
        
        const modal = document.getElementById('order-modal');
        if (!modal) {
            console.error('❌ Order modal not found');
            return;
        }
          // Update modal content
        updateOrderModalContent();
          // Show modal with proper timing
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        // Add show class with slight delay for transition
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ Order modal show class added');
        }, 50);
        
        console.log('✅ Order modal opened');
        
    } catch (error) {
        console.error('❌ Error opening order modal:', error);
        showNotification('Lỗi mở modal đơn hàng: ' + error.message, 'error');
    }
}

function closeOrderModal() {
    try {
        console.log('❌ Closing order modal...');
        
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        console.log('✅ Order modal closed');
        
    } catch (error) {
        console.error('❌ Error closing order modal:', error);
    }
}

function updateOrderModalContent() {
    try {
        const modalItems = document.getElementById('order-items');
        const modalTotal = document.getElementById('order-total');
        
        if (!modalItems || !modalTotal) {
            console.log('📝 Modal elements not found (order-items, order-total)');
            return;
        }
        
        if (currentOrder.length === 0) {
            modalItems.innerHTML = '<p class="empty-order">Đơn hàng trống</p>';
            modalTotal.textContent = formatPrice(0);
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Render items
        modalItems.innerHTML = currentOrder.map(item => `
            <div class="modal-order-item">
                <span class="item-name">${item.name}</span>
                <span class="item-details">${item.quantity} x ${formatPrice(item.price)}</span>
                <span class="item-total">${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
        
        modalTotal.textContent = formatPrice(total);
        
        console.log('✅ Order modal content updated');
        
    } catch (error) {
        console.error('❌ Error updating order modal content:', error);
    }
}

function confirmOrder() {
    try {
        console.log('✅ Confirming order...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, không thể xác nhận', 'warning');
            return;
        }
        
        // Create invoice
        const invoice = createNewInvoice();
        
        if (invoice) {
            // Close order modal
            closeOrderModal();
            
            // Add to order history
            const orderRecord = {
                id: invoice.id,
                items: [...invoice.items],
                total: invoice.total,
                timestamp: invoice.createdAt,
                status: 'completed'
            };
            
            orderHistory.push(orderRecord);
            saveOrderHistory();
            window.orderHistory = orderHistory;
            
            showNotification(`Đã xác nhận đơn hàng #${invoice.id}`, 'success');
            console.log('✅ Order confirmed and added to history');
            
            // Select the new invoice for payment
            selectInvoice(invoice.id);
        }
        
    } catch (error) {
        console.error('❌ Error confirming order:', error);
        showNotification('Lỗi xác nhận đơn hàng: ' + error.message, 'error');
    }
}

function openPaymentModal(invoice) {
    try {
        console.log('💳 Opening payment modal for:', invoice?.id);
        
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        const modal = document.getElementById('payment-modal');
        if (!modal) {
            console.error('❌ Payment modal not found');
            return;
        }
          // Update modal content
        updatePaymentModalContent(invoice);
        
        // Add payment action buttons
        const paymentActions = document.getElementById('payment-actions');
        if (paymentActions) {
            paymentActions.innerHTML = `
                <button class="btn btn-secondary" onclick="closePaymentModal()">Hủy</button>
                <button class="btn btn-success" onclick="confirmPayment()">
                    <i class="fas fa-check"></i> Xác nhận đã thanh toán
                </button>
            `;
        }
          // Generate QR code for payment
        generateQRCode(invoice.total);        // Show modal with proper timing
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        // Add show class with slight delay for transition
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ Payment modal show class added');
        }, 50);
        
        console.log('✅ Payment modal opened for invoice:', invoice.id);
        
    } catch (error) {
        console.error('❌ Error opening payment modal:', error);
        showNotification('Lỗi mở modal thanh toán: ' + error.message, 'error');
    }
}

function updatePaymentModalContent(invoice) {
    try {
        const invoiceId = document.getElementById('payment-modal-title');
        const invoiceItems = document.getElementById('payment-order-summary');
        const invoiceTotal = document.getElementById('payment-total');
        
        if (invoiceId) invoiceId.textContent = `Thanh toán hóa đơn #${invoice.id}`;
        
        if (invoiceItems && invoice.items) {
            invoiceItems.innerHTML = invoice.items.map(item => `
                <div class="payment-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('');
        }
        
        if (invoiceTotal) {
            invoiceTotal.textContent = formatPrice(invoice.total);
        }
        
        console.log('✅ Payment modal content updated');
        
    } catch (error) {
        console.error('❌ Error updating payment modal content:', error);
    }
}

function confirmPayment() {
    try {
        console.log('💰 Confirming payment...');
        
        if (!currentInvoiceId) {
            showNotification('Không có hóa đơn được chọn', 'error');
            return;
        }
        
        const invoice = invoices.find(inv => inv.id === currentInvoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        // Mark invoice as paid
        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();
        invoice.paymentMethod = 'qr';
        
        // Save changes
        saveInvoices();
        window.invoices = invoices;
        
        // Update UI
        updateInvoiceDisplay();
        updateInvoiceCount();
          // Close payment modal
        closePaymentModal();
        
        // Show success modal
        showSuccessModal(invoice);
        
        console.log('✅ Payment confirmed for invoice:', invoice.id);
        
        // Clear current selection
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId;
        
    } catch (error) {
        console.error('❌ Error confirming payment:', error);
        showNotification('Lỗi xác nhận thanh toán: ' + error.message, 'error');
    }
}

function closePaymentModal() {
    try {
        console.log('❌ Closing payment modal...');
        
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        console.log('✅ Payment modal closed');
        
    } catch (error) {
        console.error('❌ Error closing payment modal:', error);
    }
}

function selectInvoice(invoiceId) {
    try {
        console.log('📋 Select invoice called:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            console.error('❌ Invoice not found:', invoiceId);
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        currentInvoiceId = invoiceId;
        window.currentInvoiceId = currentInvoiceId; // Sync window variable
        
        // Load invoice items into current order for editing
        currentOrder = [...(invoice.items || [])];
        window.currentOrder = currentOrder; // Sync window variable
        
        console.log('✅ Invoice loaded for editing:', invoice);
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        showSidebarControls();
        
        showNotification(`Đã chọn hóa đơn #${invoiceId} để chỉnh sửa`, 'success');
        
    } catch (error) {
        console.error('❌ Error selecting invoice:', error);
        showNotification('Lỗi chọn hóa đơn: ' + error.message, 'error');
    }
}

function deselectInvoice() {
    try {
        console.log('📋 Deselecting invoice...');
        
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId; // Sync window variable
        
        // Clear current order
        currentOrder = [];
        window.currentOrder = currentOrder; // Sync window variable
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        hideSidebarControls();
        
        showNotification('Đã bỏ chọn hóa đơn', 'info');
        
    } catch (error) {
        console.error('❌ Error deselecting invoice:', error);
        showNotification('Lỗi bỏ chọn hóa đơn: ' + error.message, 'error');
    }
}

function showSidebarControls() {
    try {
        const controls = document.getElementById('sidebar-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    } catch (error) {
        console.error('❌ Error showing sidebar controls:', error);
    }
}

function hideSidebarControls() {
    try {
        const controls = document.getElementById('sidebar-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Error hiding sidebar controls:', error);
    }
}

// =============================================================================
// SHIFT MANAGEMENT FUNCTIONS
// =============================================================================

function startNewShift() {
    const confirmStart = confirm('Bạn có chắc chắn muốn bắt đầu ca mới? Dữ liệu ca hiện tại sẽ được lưu trữ.');
    
    if (confirmStart) {
        try {
            // Save current shift data before starting new one
            const currentShiftOrders = getCurrentShiftOrders();
            if (currentShiftOrders.length > 0) {
                // Archive current shift data
                const archiveData = {
                    shiftInfo: {
                        startTime: shiftStartTime,
                        endTime: new Date().toISOString(),
                        totalOrders: currentShiftOrders.length,
                        totalRevenue: currentShiftOrders.reduce((sum, order) => sum + (order.total || 0), 0)
                    },
                    orders: currentShiftOrders
                };
                
                // Save to archived shifts
                let archivedShifts = JSON.parse(localStorage.getItem('balancoffee_archived_shifts') || '[]');
                archivedShifts.push(archiveData);
                localStorage.setItem('balancoffee_archived_shifts', JSON.stringify(archivedShifts));
                
                showNotification('Đã lưu trữ dữ liệu ca cũ', 'success');
            }
            
            // Reset shift start time
            shiftStartTime = new Date().toISOString();
            localStorage.setItem('shiftStartTime', shiftStartTime);
            
            // Clear current shift data from order history
            const shiftStartDate = new Date(shiftStartTime);
            orderHistory = orderHistory.filter(order => {
                if (!order.timestamp) return true;
                const orderDate = new Date(order.timestamp);
                return orderDate < shiftStartDate;
            });
            
            saveOrderHistory();
            
            // Clear pending invoices if any
            const currentTime = new Date(shiftStartTime);
            invoices = invoices.filter(invoice => {
                if (!invoice.createdAt) return true;
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate < currentTime;
            });
            
            saveInvoices();
            
            // Refresh display
            if (isAdminMode) {
                displayCurrentShiftData();
            }
            updateInvoiceDisplay();
            updateInvoiceCount();
            
            showNotification('Đã bắt đầu ca mới thành công!', 'success');
            console.log('✅ New shift started at:', new Date(shiftStartTime).toLocaleString());
            
        } catch (error) {
            console.error('❌ Error starting new shift:', error);
            showNotification('Lỗi bắt đầu ca mới: ' + error.message, 'error');
        }
    }
}

function viewCurrentShift() {
    displayCurrentShiftData();
    showNotification('Đã cập nhật thông tin ca hiện tại');
}

function endShift() {
    const currentShiftOrders = getCurrentShiftOrders();
    
    if (currentShiftOrders.length === 0) {
        showNotification('Không có đơn hàng nào trong ca này để kết thúc', 'warning');
        return;
    }
    
    // Populate shift summary modal
    populateEndShiftModal(currentShiftOrders);
      // Show modal with proper timing
    const modal = document.getElementById('end-shift-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Force reflow to ensure display change is applied
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ End shift modal show class added');
        }, 50);
    }
}

function getCurrentShiftOrders() {
    if (!orderHistory || orderHistory.length === 0) {
        orderHistory = loadOrderHistory();
    }
    
    const currentShiftStart = new Date(shiftStartTime);
    
    return orderHistory.filter(order => {
        if (!order.timestamp) return false;
        const orderDate = new Date(order.timestamp);
        return orderDate >= currentShiftStart;
    });
}

function displayCurrentShiftData() {
    const currentShiftOrders = getCurrentShiftOrders();
    updateCurrentShiftSummary(currentShiftOrders);
    displayCurrentShiftOrders(currentShiftOrders);
}

function updateCurrentShiftSummary(orders) {
    if (!orders) orders = [];
    
    const totalOrders = orders