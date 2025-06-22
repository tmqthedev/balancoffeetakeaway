// BalanCoffee - Main Application Script
// Version: 8.0 - Optimized & Enhanced

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================
let currentOrder = [];
let invoices = [];
let currentInvoiceId = null;
let currentCategory = 'all';
let isAdminMode = false;
let orderHistory = [];
let shiftStartTime = null;
let currentShiftEmployee = null;
let currentShiftNote = null;

// Expose globals to window for diagnostic detection
window.currentOrder = currentOrder;
window.invoices = invoices;
window.orderHistory = orderHistory;
window.shiftStartTime = shiftStartTime;
window.currentInvoiceId = currentInvoiceId;
window.isAdminMode = isAdminMode;
window.currentCategory = currentCategory;
window.currentShiftEmployee = currentShiftEmployee;
window.currentShiftNote = currentShiftNote;

// Fallback menu data
const fallbackMenuData = [
    { id: 1, name: "Cà phê đen", description: "Cà phê đen truyền thống", price: 25000, category: "cafe-viet" },
    { id: 2, name: "Cà phê sữa", description: "Cà phê với sữa đặc", price: 30000, category: "cafe-viet" },
    { id: 3, name: "Americano", description: "Espresso pha loãng", price: 40000, category: "cafe-y" }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Debug and logging utility
const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.search.includes('debug=true');

function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    
    if (data) {
        debugLog(message, data);
    } else {
        debugLog(message);
    }
}

function debugError(message, error = null) {
    if (DEBUG_MODE) {
        if (error) {
            debugError(message, error);
        } else {
            debugError(message);
        }
        return;
    }
    
    // In production, only log critical errors
    if (error && (error.name === 'SyntaxError' || error.name === 'ReferenceError' || error.name === 'TypeError')) {
        debugError(message, error);
    }
}

function formatPrice(price) {
    if (typeof price !== 'number') {
        price = Number(price) || 0;
    }
    return price.toLocaleString('vi-VN') + '₫';
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function showNotification(message, type = 'info') {
    try {
        debugLog(`[${type.toUpperCase()}] ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Get appropriate icon based on notification type
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        else if (type === 'error') iconClass = 'fa-exclamation-circle';
        else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${iconClass}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
    } catch (error) {
        debugError('❌ Error showing notification:', error);
    }
}

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
            invoices = JSON.parse(saved);
            window.invoices = invoices;
            debugLog('✅ Loaded invoices:', invoices.length);
        }
    } catch (error) {
        debugError('❌ Error loading invoices:', error);
        invoices = [];
        window.invoices = invoices;
    }
}

function saveInvoices() {
    try {
        localStorage.setItem('balancoffee_invoices', JSON.stringify(invoices));
        debugLog('✅ Invoices saved');
    } catch (error) {
        debugError('❌ Error saving invoices:', error);
    }
}

function loadOrderHistory() {
    try {
        const saved = localStorage.getItem('balancoffee_order_history');
        if (saved) {
            orderHistory = JSON.parse(saved);
            window.orderHistory = orderHistory;
            debugLog('✅ Loaded order history:', orderHistory.length);
        }
        return orderHistory;
    } catch (error) {
        debugError('❌ Error loading order history:', error);
        orderHistory = [];
        window.orderHistory = orderHistory;
        return orderHistory;
    }
}

function saveOrderHistory() {
    try {
        localStorage.setItem('balancoffee_order_history', JSON.stringify(orderHistory));
        debugLog('✅ Order history saved');
    } catch (error) {
        debugError('❌ Error saving order history:', error);
    }
}

function getShiftStartTime() {
    try {
        debugLog('🔄 Getting shift start time...');
        const saved = localStorage.getItem('shiftStartTime');
        
        if (saved) {
            shiftStartTime = saved;
            debugLog('✅ Loaded existing shift start time:', formatDateTime(saved));
        } else {
            // Only auto-create if explicitly requested
            debugLog('⚠️ No existing shift found in localStorage');
            shiftStartTime = null;
        }
        
        window.shiftStartTime = shiftStartTime;
        debugLog('📊 Final shift start time:', shiftStartTime);
        return shiftStartTime;
    } catch (error) {
        debugError('❌ Error getting shift start time:', error);
        shiftStartTime = null;
        window.shiftStartTime = shiftStartTime;
        return shiftStartTime;
    }
}

function loadShiftEmployee() {
    try {
        debugLog('🔄 Loading shift employee data...');
        const saved = localStorage.getItem('currentShiftEmployee');
        
        if (saved) {
            try {
                const employeeData = JSON.parse(saved);
                currentShiftEmployee = employeeData.name || null;
                currentShiftNote = employeeData.note || null;
                debugLog('✅ Loaded shift employee:', currentShiftEmployee);
                debugLog('📝 Shift note:', currentShiftNote);
            } catch (parseError) {
                debugError('❌ Error parsing employee data:', parseError);
                // Try loading as simple string (backward compatibility)
                currentShiftEmployee = saved;
                currentShiftNote = null;
                debugLog('🔄 Loaded as simple string:', currentShiftEmployee);
            }
        } else {
            currentShiftEmployee = null;
            currentShiftNote = null;
            debugLog('⚠️ No shift employee data found');
        }
        
        window.currentShiftEmployee = currentShiftEmployee;
        window.currentShiftNote = currentShiftNote;
        
        debugLog('📊 Final employee data:', { 
            employee: currentShiftEmployee, 
            note: currentShiftNote 
        });
        
        return { employee: currentShiftEmployee, note: currentShiftNote };
    } catch (error) {
        debugError('❌ Error loading shift employee:', error);
        currentShiftEmployee = null;
        currentShiftNote = null;
        window.currentShiftEmployee = currentShiftEmployee;
        window.currentShiftNote = currentShiftNote;
        return { employee: null, note: null };
    }
}

function saveShiftEmployee(employee, note) {
    try {
        const employeeData = { name: employee, note: note };
        localStorage.setItem('currentShiftEmployee', JSON.stringify(employeeData));
        currentShiftEmployee = employee;
        currentShiftNote = note;
        window.currentShiftEmployee = currentShiftEmployee;
        window.currentShiftNote = currentShiftNote;
        debugLog('✅ Shift employee saved:', employee);
    } catch (error) {
        debugError('❌ Error saving shift employee:', error);
    }
}

// =============================================================================
// QR CODE FUNCTIONS
// =============================================================================

function generateQRCode(amount) {
    try {
        const qrImage = document.getElementById('qr-image');
        const qrFallback = document.getElementById('qr-fallback');
        
        if (qrImage) {
            qrImage.style.display = 'block';
            qrFallback?.style && (qrFallback.style.display = 'none');
        } else {
            generateQRFallback(amount);
        }
        
        debugLog('✅ QR code setup completed for amount:', amount);
    } catch (error) {
        debugError('❌ Error setting up QR code:', error);
        generateQRFallback(amount);
    }
}

function generateQRFallback(amount) {
    try {
        const canvas = document.getElementById('qr-code');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 200, 200);
        
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BalanCoffee', 100, 40);
        
        ctx.font = '12px Arial';
        ctx.fillText('Mã QR thanh toán', 100, 65);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText(formatPrice(amount), 100, 100);
        
        ctx.font = '11px Arial';
        ctx.fillText('Ngân hàng: ' + (window.qrPaymentInfo?.bankName || 'VCB'), 100, 130);
        ctx.fillText('STK: ' + (window.qrPaymentInfo?.accountNumber || '1234567890'), 100, 150);
        ctx.fillText('Chủ TK: ' + (window.qrPaymentInfo?.accountHolder || 'BalanCoffee'), 100, 170);
        
        ctx.font = '10px Arial';
        ctx.fillText('Sử dụng app ngân hàng để thanh toán', 100, 190);
          debugLog('✅ QR canvas fallback generated successfully');
    } catch (error) {
        debugError('❌ Error generating QR canvas fallback:', error);
    }
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================

function updateInvoiceDisplay() {
    try {
        const invoiceList = document.getElementById('invoice-list');
        
        if (!invoiceList) {
            debugError('❌ Invoice list element not found');
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
        
        const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
        
        if (pendingInvoices.length === 0) {
            invoiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    <p>Tất cả hóa đơn đã được thanh toán</p>
                </div>
            `;            return;
        }
        
        const sortedInvoices = [...pendingInvoices].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
          invoiceList.innerHTML = sortedInvoices.map(invoice => {
            const isActive = currentInvoiceId === invoice.id;
            const activeClass = isActive ? 'active' : '';
            const editingClass = isActive ? 'editing' : '';
            
            let statusText;
            if (isActive) {
                statusText = '⚠ Đang chỉnh sửa';
            } else if (invoice.status === 'pending') {
                statusText = 'Chờ thanh toán';
            } else {
                statusText = 'Đã thanh toán';
            }
            
            return `
            <div class="invoice-item ${activeClass} ${editingClass}" 
                 data-invoice-id="${invoice.id}">
                <div class="invoice-header" onclick="selectInvoice('${invoice.id}')">
                    <span class="invoice-id">Hóa đơn #${invoice.id}</span>
                    <span class="invoice-status ${invoice.status}">
                        ${statusText}
                    </span></div>
                <div class="invoice-details">
                    <p>Số món: ${invoice.items ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0}</p>
                    <p>Thời gian: ${formatDateTime(invoice.createdAt)}</p>
                </div>
                <div class="invoice-total">
                    Tổng: ${formatPrice(invoice.total || 0)}
                </div>
                <div class="invoice-actions">
                    ${currentInvoiceId === invoice.id ? `
                        <button class="btn btn-secondary btn-invoice-action" onclick="event.stopPropagation(); deselectInvoice()" title="Hủy chỉnh sửa">
                            <i class="fas fa-times"></i>
                            <span>Hủy</span>
                        </button>
                        <button class="btn btn-success btn-invoice-action" onclick="event.stopPropagation(); finishEditInvoice('${invoice.id}')" title="Hoàn tất chỉnh sửa">
                            <i class="fas fa-check"></i>
                            <span>Xong</span>
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-invoice-action" onclick="event.stopPropagation(); editInvoice('${invoice.id}')" title="Chỉnh sửa hóa đơn">
                            <i class="fas fa-edit"></i>
                            <span>Sửa</span>
                        </button>
                    `}
                    ${currentInvoiceId !== invoice.id ? `
                        <button class="btn btn-success btn-invoice-action" onclick="event.stopPropagation(); processPayment('${invoice.id}')" title="Thanh toán">
                            <i class="fas fa-credit-card"></i>
                            <span>Thanh toán</span>
                        </button>
                        <button class="btn btn-danger btn-invoice-action" onclick="event.stopPropagation(); deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                            <i class="fas fa-trash"></i>
                            <span>Xóa</span>
                        </button>                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
        
        debugLog(`✅ Invoice display updated: ${invoices.length} invoices`);
        
    } catch (error) {
        debugError('❌ Error updating invoice display:', error);
        showNotification('Lỗi cập nhật danh sách hóa đơn: ' + error.message, 'error');
    }
}

function updateOrderDisplay() {
    try {
        const orderList = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        if (!orderList) {
            debugLog('📝 Order list element not found (order-items)');
            return;
        }
        
        if (currentOrder.length === 0) {
            orderList.innerHTML = '<p class="empty-order">Chưa có món nào trong đơn hàng</p>';
            orderTotal?.textContent && (orderTotal.textContent = formatPrice(0));
            return;
        }
        
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
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
        
        if (orderTotal) {
            orderTotal.textContent = formatPrice(total);
        }
        
        debugLog(`✅ Order display updated: ${currentOrder.length} items`);
        
    } catch (error) {
        debugError('❌ Error updating order display:', error);
    }
}

function updateInvoiceCount() {
    try {
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
        const countElements = document.querySelectorAll('#invoice-count, .invoice-count');
        
        countElements.forEach(el => {
            el.textContent = pendingInvoices.length;
        });
          debugLog('✅ Invoice count updated:', pendingInvoices.length);
    } catch (error) {
        debugError('❌ Error updating invoice count:', error);
    }
}

function renderMenu() {
    try {
        debugLog('🎨 Rendering menu...');
        
        const menuContainer = document.getElementById('menu-grid');
        if (!menuContainer) {
            debugError('❌ Menu container not found (menu-grid)');
            return;
        }
        
        const menuItems = window.menuData || fallbackMenuData;
        menuContainer.innerHTML = '';
          const filteredItems = currentCategory === 'all' ? 
            menuItems : 
            menuItems.filter(item => item.category === currentCategory);
        
        if (filteredItems.length === 0) {
            menuContainer.innerHTML = '<p class="no-items">Không có món nào trong danh mục này.</p>';
            return;
        }
        
        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item-card';
            menuItem.setAttribute('data-category', item.category);
            menuItem.innerHTML = `
                <div class="menu-item-content">
                    <div class="menu-item-info">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="item-description">${item.description || 'Món ngon từ BalanCoffee'}</p>
                    </div>
                    <div class="menu-item-actions">
                        <span class="item-price">${formatPrice(item.price)}</span>
                        <button class="btn-add-item" onclick="addToOrder(${item.id})" title="Thêm ${item.name} vào đơn hàng" aria-label="Thêm ${item.name} vào đơn hàng">
                            <i class="fas fa-plus"></i>
                            <span>Thêm</span>
                        </button>
                    </div>
                </div>
            `;
            menuContainer.appendChild(menuItem);
        });
        
        debugLog(`✅ Menu rendered: ${filteredItems.length} items`);
        
    } catch (error) {
        debugError('❌ Error rendering menu:', error);
        showNotification('Lỗi hiển thị menu: ' + error.message, 'error');
    }
}

// =============================================================================
// ORDER MANAGEMENT FUNCTIONS
// =============================================================================

function addToOrder(itemId) {
    try {
        debugLog('🛒 Adding item to order:', itemId);
        
        const menuItems = window.menuData || fallbackMenuData;
        const item = menuItems.find(i => i.id === itemId);
        
        if (!item) {
            debugError('❌ Item not found:', itemId);
            showNotification('Không tìm thấy món này', 'error');
            return;
        }
        
        const existingItem = currentOrder.find(orderItem => orderItem.id === itemId);
        let actionMessage = '';
        
        if (existingItem) {
            existingItem.quantity += 1;
            actionMessage = `Đã tăng ${item.name} thành ${existingItem.quantity} ly`;
        } else {
            currentOrder.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
            actionMessage = `Đã thêm ${item.name} vào đơn hàng`;
        }
        
        window.currentOrder = currentOrder;
        
        // If there's a current invoice being edited, update it
        if (currentInvoiceId) {
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [...currentOrder];
                invoice.total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                saveInvoices();
                updateInvoiceDisplay();
                actionMessage += ` (Hóa đơn #${currentInvoiceId})`;
            }
        }
        
        updateOrderDisplay();
        
        // Show detailed notification
        showNotification(actionMessage, 'success');
        debugLog(`✅ Item added to order: ${item.name}, Current order size: ${currentOrder.length}`);
        
        // Add visual feedback to the button
        const button = document.querySelector(`[onclick="addToOrder(${itemId})"]`);
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
        
    } catch (error) {
        debugError('❌ Error adding item to order:', error);
        showNotification('Lỗi thêm món: ' + error.message, 'error');
    }
}

function increaseQuantity(itemId) {
    try {
        const item = currentOrder.find(i => i.id === itemId);
        if (!item) {
            debugError('⚠️ Item not found in order:', itemId);
            showNotification('Không tìm thấy món trong đơn hàng', 'warning');
            return;
        }
        
        item.quantity += 1;
        window.currentOrder = currentOrder;
        
        // Update current invoice if editing
        if (currentInvoiceId) {
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [...currentOrder];
                invoice.total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                saveInvoices();
                updateInvoiceDisplay();
            }
        }
        
        updateOrderDisplay();
        debugLog(`✅ Quantity increased for item: ${itemId}, New quantity: ${item.quantity}`);
        
    } catch (error) {
        debugError('❌ Error increasing quantity:', error);
        showNotification('Lỗi tăng số lượng: ' + error.message, 'error');
    }
}

function decreaseQuantity(itemId) {
    try {
        const item = currentOrder.find(i => i.id === itemId);
        if (!item) {
            debugError('⚠️ Item not found in order:', itemId);
            showNotification('Không tìm thấy món trong đơn hàng', 'warning');
            return;
        }
        
        if (item.quantity <= 1) {
            debugError('⚠️ Cannot decrease quantity below 1 for item:', itemId);
            showNotification('Số lượng tối thiểu là 1. Sử dụng nút xóa để loại bỏ món.', 'warning');
            return;
        }
        
        item.quantity -= 1;
        window.currentOrder = currentOrder;
        
        // Update current invoice if editing
        if (currentInvoiceId) {
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [...currentOrder];
                invoice.total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                saveInvoices();
                updateInvoiceDisplay();
            }
        }
        
        updateOrderDisplay();
        debugLog(`✅ Quantity decreased for item: ${itemId}, New quantity: ${item.quantity}`);
        
    } catch (error) {
        debugError('❌ Error decreasing quantity:', error);
        showNotification('Lỗi giảm số lượng: ' + error.message, 'error');
    }
}

function removeFromOrder(itemId) {
    try {
        const itemToRemove = currentOrder.find(i => i.id === itemId);
        if (!itemToRemove) {
            debugError('⚠️ Item not found in order:', itemId);
            showNotification('Không tìm thấy món trong đơn hàng', 'warning');
            return;
        }
        
        currentOrder = currentOrder.filter(item => item.id !== itemId);
        window.currentOrder = currentOrder;
        
        // Update current invoice if editing
        if (currentInvoiceId) {
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [...currentOrder];
                invoice.total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                saveInvoices();
                updateInvoiceDisplay();
            }
        }
        
        updateOrderDisplay();
        
        // Get item info for notification
        const menuData = window.menuData || fallbackMenuData;
        const item = menuData.find(i => i.id === itemId);
        const itemName = item ? item.name : `ID: ${itemId}`;
        
        showNotification(`Đã xóa ${itemName} khỏi đơn hàng`, 'success');
        debugLog('✅ Item removed from order:', itemName);
        
    } catch (error) {
        debugError('❌ Error removing item from order:', error);
        showNotification('Lỗi xóa món: ' + error.message, 'error');
    }
}

function clearCurrentOrder() {
    try {
        if (currentOrder.length === 0) {
            showNotification('Đơn hàng đã trống', 'info');
            return;
        }
        
        const itemCount = currentOrder.length;
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        // Update current invoice if editing
        if (currentInvoiceId) {
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [];
                invoice.total = 0;
                saveInvoices();
                updateInvoiceDisplay();
            }
        }
        
        updateOrderDisplay();
        showNotification(`Đã xóa tất cả ${itemCount} món khỏi đơn hàng`, 'success');
        debugLog(`✅ Order cleared, removed items: ${itemCount}`);
        
    } catch (error) {
        debugError('❌ Error clearing order:', error);
        showNotification('Lỗi xóa đơn hàng: ' + error.message, 'error');
    }
}

// =============================================================================
// INVOICE MANAGEMENT FUNCTIONS
// =============================================================================

function createNewInvoice() {
    try {
        debugLog('📄 Creating new empty invoice...');
        
        // Create empty invoice
        const invoiceId = 'HD' + Date.now().toString().slice(-6);
        
        const newInvoice = {
            id: invoiceId,
            items: [],
            total: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentMethod: null,
            isEditing: true
        };
        
        invoices.push(newInvoice);
        saveInvoices();
        
        // Automatically select the new invoice for editing
        currentInvoiceId = invoiceId;
        window.currentInvoiceId = currentInvoiceId;
        
        // Clear current order to start fresh
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        updateInvoiceDisplay();
        updateInvoiceCount();
        updateOrderDisplay();
        showSidebarControls();
        
        showNotification(`Đã tạo hóa đơn rỗng #${invoiceId} - Bắt đầu thêm món`, 'success');
        debugLog('✅ Empty invoice created and selected for editing:', newInvoice);
        
        return newInvoice;
        
    } catch (error) {
        debugError('❌ Error creating invoice:', error);
        showNotification('Lỗi tạo hóa đơn: ' + error.message, 'error');
    }
}

function selectInvoice(invoiceId) {
    try {
        debugLog('📋 Select invoice called:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            debugError('❌ Invoice not found:', invoiceId);
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        currentInvoiceId = invoiceId;
        window.currentInvoiceId = currentInvoiceId;
        
        currentOrder = [...(invoice.items || [])];
        window.currentOrder = currentOrder;
        
        debugLog('✅ Invoice loaded for editing:', invoice);
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        showSidebarControls();
        
        showNotification(`Đã chọn hóa đơn #${invoiceId} để chỉnh sửa`, 'success');
        
    } catch (error) {
        debugError('❌ Error selecting invoice:', error);
        showNotification('Lỗi chọn hóa đơn: ' + error.message, 'error');
    }
}

function editInvoice(invoiceId) {
    try {
        debugLog('✏️ Edit invoice called:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            debugError('❌ Invoice not found:', invoiceId);
            showNotification('Không tìm thấy hóa đơn để chỉnh sửa', 'error');
            return;
        }
        
        // Mark invoice as being edited
        invoice.isEditing = true;
        
        // Set current invoice and load items to order
        currentInvoiceId = invoiceId;
        window.currentInvoiceId = currentInvoiceId;
        
        // Copy invoice items to current order for editing
        currentOrder = invoice.items ? invoice.items.map(item => ({...item})) : [];
        window.currentOrder = currentOrder;
        
        debugLog('✅ Invoice loaded for editing:', {
            invoiceId,
            itemCount: currentOrder.length,
            items: currentOrder
        });
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        showSidebarControls();
        
        showNotification(`Đang chỉnh sửa hóa đơn #${invoiceId}`, 'info');
        
    } catch (error) {
        debugError('❌ Error editing invoice:', error);
        showNotification('Lỗi chỉnh sửa hóa đơn: ' + error.message, 'error');
    }
}

function deselectInvoice() {
    try {
        debugLog('📋 Deselecting invoice...');
        
        // Clear editing state from all invoices
        invoices.forEach(invoice => {
            if (invoice.isEditing) {
                delete invoice.isEditing;
            }
        });
        
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId;
        
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        saveInvoices();
        updateInvoiceDisplay();
        updateOrderDisplay();
        updateInvoiceCount();
        hideSidebarControls();
        
        showNotification('Đã hủy chỉnh sửa hóa đơn', 'info');
        
    } catch (error) {
        debugError('❌ Error deselecting invoice:', error);
        showNotification('Lỗi bỏ chọn hóa đơn: ' + error.message, 'error');
    }
}

function deleteInvoiceById(invoiceId) {
    try {
        debugLog('🗑️ Delete invoice called:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn để xóa', 'error');
            return;
        }
        
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hóa đơn #${invoiceId}?\nHành động này không thể hoàn tác.`);
        
        if (confirmDelete) {
            // Remove from invoices array
            invoices = invoices.filter(inv => inv.id !== invoiceId);
            
            // Clear current editing state if this invoice was being edited
            if (currentInvoiceId === invoiceId) {
                currentInvoiceId = null;
                window.currentInvoiceId = currentInvoiceId;
                currentOrder = [];
                window.currentOrder = currentOrder;
                updateOrderDisplay();
                hideSidebarControls();
            }
            
            // Save and update UI
            saveInvoices();
            updateInvoiceDisplay();
            updateInvoiceCount();
            
            showNotification(`Đã xóa hóa đơn #${invoiceId}`, 'success');            debugLog('✅ Invoice deleted successfully:', invoiceId);
        } else {
            debugLog('❌ Invoice deletion cancelled by user');
        }
        
    } catch (error) {
        debugError('❌ Error deleting invoice:', error);
        showNotification('Lỗi xóa hóa đơn: ' + error.message, 'error');
    }
}

function processPayment(invoiceId) {
    try {
        debugLog('💳 Process payment called for:', invoiceId);
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn để thanh toán', 'error');
            return;
        }
        
        if (!invoice.items || invoice.items.length === 0) {
            showNotification('Hóa đơn trống không thể thanh toán', 'error');
            return;
        }
        
        if (invoice.status === 'paid') {
            showNotification('Hóa đơn này đã được thanh toán', 'warning');
            return;
        }
        
        openPaymentModal(invoice);
        
    } catch (error) {
        debugError('❌ Error processing payment:', error);
        showNotification('Lỗi xử lý thanh toán: ' + error.message, 'error');
    }
}

function showSidebarControls() {
    try {
        const controls = document.getElementById('sidebar-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    } catch (error) {
        debugError('❌ Error showing sidebar controls:', error);
    }
}

function hideSidebarControls() {
    try {
        const controls = document.getElementById('sidebar-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    } catch (error) {
        debugError('❌ Error hiding sidebar controls:', error);
    }
}

// =============================================================================
// MODAL FUNCTIONS
// =============================================================================

function openOrderModal() {
    try {
        debugLog('📝 Opening order modal...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, vui lòng chọn món trước', 'warning');
            return;
        }
        
        const modal = document.getElementById('order-modal');
        if (!modal) {
            debugError('❌ Order modal not found');
            return;
        }
        
        updateOrderModalContent();
        modal.style.display = 'flex';
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            debugLog('✅ Order modal show class added');
        }, 50);
        
        debugLog('✅ Order modal opened');
        
    } catch (error) {
        debugError('❌ Error opening order modal:', error);
        showNotification('Lỗi mở modal đơn hàng: ' + error.message, 'error');
    }
}

function closeOrderModal() {
    try {
        debugLog('❌ Closing order modal...');
        
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        debugLog('✅ Order modal closed');
        
    } catch (error) {
        debugError('❌ Error closing order modal:', error);
    }
}

function updateOrderModalContent() {
    try {
        const modalItems = document.getElementById('order-items');
        const modalTotal = document.getElementById('order-total');
        
        if (!modalItems || !modalTotal) {
            debugLog('📝 Modal elements not found (order-items, order-total)');
            return;
        }
        
        if (currentOrder.length === 0) {
            modalItems.innerHTML = '<p class="empty-order">Đơn hàng trống</p>';
            modalTotal.textContent = formatPrice(0);
            return;
        }
        
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        modalItems.innerHTML = currentOrder.map(item => `
            <div class="modal-order-item">
                <span class="item-name">${item.name}</span>
                <span class="item-details">${item.quantity} x ${formatPrice(item.price)}</span>
                <span class="item-total">${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
        
        modalTotal.textContent = formatPrice(total);
          debugLog('✅ Order modal content updated');
        
    } catch (error) {
        debugError('❌ Error updating order modal content:', error);
    }
}

function confirmOrder() {
    try {
        debugLog('✅ Confirming order...');
        
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Đơn hàng trống, không thể xác nhận', 'warning');
            return;
        }
        
        let invoice;
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // If editing an existing invoice, update it
        if (currentInvoiceId) {
            invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [...currentOrder];
                invoice.total = total;
                invoice.updatedAt = new Date().toISOString();
                delete invoice.isEditing;
                
                debugLog('📝 Updated existing invoice:', invoice.id);
            }
        } else {
            // Create new invoice with current order
            const invoiceId = 'HD' + Date.now().toString().slice(-6);
            
            invoice = {
                id: invoiceId,
                items: [...currentOrder],
                total: total,
                status: 'pending',
                createdAt: new Date().toISOString(),
                paymentMethod: null
            };
              invoices.push(invoice);
            debugLog('🆕 Created new invoice:', invoice.id);
        }
        
        saveInvoices();
        
        if (invoice) {
            closeOrderModal();
            
            // Only add to order history for new invoices, not updates
            const wasEditing = currentInvoiceId !== null;
            if (!wasEditing) {
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
            }
            
            // Clear editing state
            currentInvoiceId = null;
            window.currentInvoiceId = currentInvoiceId;
            currentOrder = [];
            window.currentOrder = currentOrder;
            
            updateInvoiceDisplay();
            updateInvoiceCount();
            updateOrderDisplay();
            hideSidebarControls();
            
            showNotification(`Đã xác nhận đơn hàng #${invoice.id}`, 'success');
            debugLog('✅ Order confirmed and processed');
        }
        
    } catch (error) {
        debugError('❌ Error confirming order:', error);
        showNotification('Lỗi xác nhận đơn hàng: ' + error.message, 'error');
    }
}

function openPaymentModal(invoice) {
    try {
        debugLog('💳 Opening payment modal for:', invoice?.id);
        
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        const modal = document.getElementById('payment-modal');
        if (!modal) {
            debugError('❌ Payment modal not found');
            return;
        }
        
        updatePaymentModalContent(invoice);
        
        const paymentActions = document.getElementById('payment-actions');
        if (paymentActions) {
            paymentActions.innerHTML = `
                <button class="btn btn-secondary" onclick="closePaymentModal()">Hủy</button>
                <button class="btn btn-success" onclick="confirmPayment()">
                    <i class="fas fa-check"></i> Xác nhận đã thanh toán
                </button>
            `;
        }
        
        generateQRCode(invoice.total);
        
        modal.style.display = 'flex';
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            debugLog('✅ Payment modal show class added');
        }, 50);
        
        debugLog('✅ Payment modal opened for invoice:', invoice.id);
        
    } catch (error) {
        debugError('❌ Error opening payment modal:', error);
        showNotification('Lỗi mở modal thanh toán: ' + error.message, 'error');
    }
}

function updatePaymentModalContent(invoice) {
    try {
        const invoiceId = document.getElementById('payment-modal-title');
        const invoiceItems = document.getElementById('payment-order-summary');
        const invoiceTotal = document.getElementById('payment-total');
        
        invoiceId?.textContent && (invoiceId.textContent = `Thanh toán hóa đơn #${invoice.id}`);
        
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
        
        debugLog('✅ Payment modal content updated');
        
    } catch (error) {
        debugError('❌ Error updating payment modal content:', error);
    }
}

function confirmPayment() {
    try {        debugLog('💰 Confirming payment...');
        
        // Get current invoice being viewed in payment modal
        const paymentTitle = document.getElementById('payment-modal-title');
        
        if (!paymentTitle) {
            showNotification('Không thể xác định hóa đơn thanh toán', 'error');
            return;
        }
          // Extract invoice ID from modal title 
        const titleText = paymentTitle.textContent;
        const invoiceIdRegex = /#(HD\d+)/;
        const invoiceIdMatch = invoiceIdRegex.exec(titleText);
        
        if (!invoiceIdMatch) {
            showNotification('Không thể xác định ID hóa đơn', 'error');
            return;
        }
        
        const invoiceId = invoiceIdMatch[1];
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn để thanh toán', 'error');
            return;
        }
        
        if (!invoice.items || invoice.items.length === 0) {
            showNotification('Hóa đơn trống không thể thanh toán', 'error');
            return;
        }
        
        // Update invoice status
        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();
        invoice.paymentMethod = 'qr';
        
        // Clear editing state if this was being edited
        delete invoice.isEditing;
        
        // Save and update UI
        saveInvoices();
        window.invoices = invoices;
        
        updateInvoiceDisplay();
        updateInvoiceCount();
        
        // Show success before clearing current invoice
        showSuccessModal(invoice);
        
        // Close payment modal
        closePaymentModal();
        
        debugLog('✅ Payment confirmed for invoice:', invoice.id);
        
        // Clear current editing state if this invoice was being edited
        if (currentInvoiceId === invoiceId) {
            currentInvoiceId = null;
            window.currentInvoiceId = currentInvoiceId;
            currentOrder = [];
            window.currentOrder = currentOrder;
            updateOrderDisplay();
            hideSidebarControls();
        }
        
    } catch (error) {
        debugError('❌ Error confirming payment:', error);
        showNotification('Lỗi xác nhận thanh toán: ' + error.message, 'error');
    }
}

function closePaymentModal() {
    try {
        debugLog('❌ Closing payment modal...');
        
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        debugLog('✅ Payment modal closed');
        
    } catch (error) {
        debugError('❌ Error closing payment modal:', error);
    }
}

function showSuccessModal(invoice) {
    try {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.getBoundingClientRect();
            
            setTimeout(() => {
                modal.classList.add('show');
            }, 50);
            
            setTimeout(() => {
                closeSuccessModal();
            }, 3000);
        }
    } catch (error) {
        debugError('❌ Error showing success modal:', error);
    }
}

function closeSuccessModal() {
    try {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    } catch (error) {
        debugError('❌ Error closing success modal:', error);
    }
}

// =============================================================================
// CATEGORY & FILTER FUNCTIONS
// =============================================================================

function filterMenu(category) {
    try {
        if (!category) {
            debugError('⚠️ No category provided to filterMenu');
            category = 'all';
        }
        
        currentCategory = category;
        window.currentCategory = currentCategory;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        renderMenu();
        
        // Announce to screen reader
        const categoryName = category === 'all' ? 'tất cả' : category;
        announceToScreenReader(`Đã chọn danh mục ${categoryName}`);
        
        debugLog('✅ Menu filtered by category:', category);
        
    } catch (error) {
        debugError('❌ Error filtering menu:', error);
        showNotification('Lỗi lọc menu: ' + error.message, 'error');
    }
}

// =============================================================================
// ADMIN & SHIFT FUNCTIONS
// =============================================================================

function updateAdminUI(isAdmin) {
    const adminSection = document.getElementById('admin-section');
    const menuSection = document.querySelector('.menu-section');
    const adminBtn = document.querySelector('[onclick="toggleAdmin()"]');
    
    if (isAdmin) {        adminSection?.style && (adminSection.style.display = 'block');
        menuSection?.style && (menuSection.style.display = 'none');
        adminBtn && (adminBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Quay lại Menu');
        displayCurrentShiftData();
        updateShiftInfoDisplay();
    } else {        adminSection?.style && (adminSection.style.display = 'none');
        menuSection?.style && (menuSection.style.display = 'block');
        adminBtn && (adminBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Quản lý');
    }
}

function updateShiftInfoDisplay() {
    try {
        debugLog('🔄 Updating shift info display...');
        debugLog('📊 Current shift data:', {
            shiftStartTime,
            currentShiftEmployee,
            currentShiftNote
        });
        
        const shiftStartDisplay = document.getElementById('shift-start-display');
        const shiftEmployeeDisplay = document.getElementById('shift-employee-display');
        
        if (shiftStartDisplay) {
            if (shiftStartTime) {
                const formattedTime = formatDateTime(shiftStartTime);
                shiftStartDisplay.textContent = formattedTime;
                debugLog('✅ Shift start time updated:', formattedTime);
            } else {
                shiftStartDisplay.textContent = 'Chưa bắt đầu ca';
                debugLog('⚠️ No shift start time found');
            }
        } else {
            debugError('❌ shift-start-display element not found');
        }
        
        if (shiftEmployeeDisplay) {
            if (currentShiftEmployee) {
                shiftEmployeeDisplay.textContent = currentShiftEmployee;
                debugLog('✅ Shift employee updated:', currentShiftEmployee);
            } else {
                shiftEmployeeDisplay.textContent = 'Chưa chọn nhân viên';
                debugLog('⚠️ No shift employee found');
            }
        } else {
            debugError('❌ shift-employee-display element not found');
        }
        
        // Update shift status indicator
        updateShiftStatusIndicator();
        
        debugLog('✅ Shift info display updated successfully');
    } catch (error) {
        debugError('❌ Error updating shift info display:', error);
        showNotification('Lỗi cập nhật thông tin ca làm việc: ' + error.message, 'error');
    }
}

function updateShiftStatusIndicator() {
    try {
        const statusElements = document.querySelectorAll('.shift-status');
        const hasShift = shiftStartTime && currentShiftEmployee;
        
        statusElements.forEach(element => {
            if (hasShift) {
                element.classList.add('active');
                element.classList.remove('inactive');
                element.textContent = 'Đang trong ca';
            } else {
                element.classList.add('inactive');
                element.classList.remove('active');
                element.textContent = 'Chưa bắt đầu ca';
            }
        });
        
    } catch (error) {
        debugError('❌ Error updating shift status indicator:', error);
    }
}

function openEmployeeModal() {
    try {
        const modal = document.getElementById('employee-modal');
        const modalShiftTime = document.getElementById('modal-shift-time');
        const employeeNameInput = document.getElementById('employee-name');
        const shiftNoteInput = document.getElementById('shift-note');
        
        if (!modal) {
            debugError('❌ Employee modal not found');
            return;
        }
        
        // Set current time
        const currentTime = new Date();
        if (modalShiftTime) {
            modalShiftTime.textContent = formatDateTime(currentTime.toISOString());
        }
        
        // Clear inputs        employeeNameInput?.value && (employeeNameInput.value = '');
        shiftNoteInput?.value && (shiftNoteInput.value = '');
        
        // Show modal
        modal.style.display = 'flex';
        modal.getBoundingClientRect();
          setTimeout(() => {
            modal.classList.add('show');
            employeeNameInput?.focus();
        }, 50);
        
        debugLog('✅ Employee modal opened');
        
    } catch (error) {
        debugError('❌ Error opening employee modal:', error);
        showNotification('Lỗi mở modal nhân viên: ' + error.message, 'error');
    }
}

function closeEmployeeModal() {
    try {
        const modal = document.getElementById('employee-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        debugLog('✅ Employee modal closed');
    } catch (error) {
        debugError('❌ Error closing employee modal:', error);
    }
}

function confirmEmployeeInfo() {
    try {
        const employeeNameInput = document.getElementById('employee-name');
        const shiftNoteInput = document.getElementById('shift-note');
        
        const employeeName = employeeNameInput ? employeeNameInput.value.trim() : '';
        const shiftNote = shiftNoteInput ? shiftNoteInput.value.trim() : '';
          if (!employeeName) {
            showNotification('Vui lòng nhập tên nhân viên', 'warning');
            employeeNameInput?.focus();
            return;
        }
        
        debugLog('👤 Employee info confirmed:', { employeeName, shiftNote });
        
        // Close modal first
        closeEmployeeModal();
        
        // Start new shift with employee info
        setTimeout(() => {
            proceedWithNewShift(employeeName, shiftNote);
        }, 100);
        
    } catch (error) {
        debugError('❌ Error confirming employee info:', error);
        showNotification('Lỗi xác nhận thông tin nhân viên: ' + error.message, 'error');
    }
}

function toggleAdmin() {
    try {
        isAdminMode = !isAdminMode;
        window.isAdminMode = isAdminMode;
        updateAdminUI(isAdminMode);
        debugLog('✅ Admin mode toggled:', isAdminMode ? 'ON' : 'OFF');
    } catch (error) {
        debugError('❌ Error toggling admin mode:', error);
        showNotification('Lỗi chuyển đổi chế độ admin: ' + error.message, 'error');
    }
}

function startNewShift() {
    // Open employee modal instead of direct confirmation
    openEmployeeModal();
}

function proceedWithNewShift(employeeName, shiftNote) {
    const confirmStart = confirm(`Bạn có chắc chắn muốn bắt đầu ca mới với nhân viên "${employeeName}"?\nDữ liệu ca hiện tại sẽ được lưu trữ.`);
    
    if (confirmStart) {
        try {
            const currentShiftOrders = getCurrentShiftOrders();
            if (currentShiftOrders.length > 0) {
                const archiveData = {
                    shiftInfo: {
                        startTime: shiftStartTime,
                        endTime: new Date().toISOString(),
                        totalOrders: currentShiftOrders.length,
                        totalRevenue: currentShiftOrders.reduce((sum, order) => sum + (order.total || 0), 0),
                        employee: currentShiftEmployee,
                        note: currentShiftNote
                    },
                    orders: currentShiftOrders
                };
                
                let archivedShifts = JSON.parse(localStorage.getItem('balancoffee_archived_shifts') || '[]');
                archivedShifts.push(archiveData);
                localStorage.setItem('balancoffee_archived_shifts', JSON.stringify(archivedShifts));
                
                showNotification('Đã lưu trữ dữ liệu ca cũ', 'success');
            }
            
            // Set new shift info
            shiftStartTime = new Date().toISOString();
            localStorage.setItem('shiftStartTime', shiftStartTime);
            saveShiftEmployee(employeeName, shiftNote);
            
            const shiftStartDate = new Date(shiftStartTime);
            orderHistory = orderHistory.filter(order => {
                if (!order.timestamp) return true;
                const orderDate = new Date(order.timestamp);
                return orderDate < shiftStartDate;
            });
            
            saveOrderHistory();
            
            const currentTime = new Date(shiftStartTime);
            invoices = invoices.filter(invoice => {
                if (!invoice.createdAt) return true;
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate < currentTime;
            });
            
            saveInvoices();
            
            // Update UI
            if (isAdminMode) {
                displayCurrentShiftData();
            }
            updateInvoiceDisplay();
            updateInvoiceCount();
            updateShiftInfoDisplay();
            
            // Add animation effect
            const shiftInfo = document.querySelector('.current-shift-info');
            if (shiftInfo) {
                shiftInfo.classList.add('new-shift');
                setTimeout(() => {
                    shiftInfo.classList.remove('new-shift');
                }, 3000);
            }
            
            showNotification(`Đã bắt đầu ca mới với nhân viên ${employeeName}!`, 'success');
            debugLog(`✅ New shift started at: ${new Date(shiftStartTime).toLocaleString()}, Employee: ${employeeName}`);
            
        } catch (error) {
            debugError('❌ Error starting new shift:', error);
            showNotification('Lỗi bắt đầu ca mới: ' + error.message, 'error');
        }
    }
}

function viewCurrentShift() {
    displayCurrentShiftData();
    updateShiftInfoDisplay();
    showNotification('Đã cập nhật thông tin ca hiện tại');
}

function endShift() {
    const currentShiftOrders = getCurrentShiftOrders();
    
    if (currentShiftOrders.length === 0) {
        showNotification('Không có đơn hàng nào trong ca này để kết thúc', 'warning');
        return;
    }
    
    populateEndShiftModal(currentShiftOrders);
    
    const modal = document.getElementById('end-shift-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            debugLog('✅ End shift modal show class added');
        }, 50);
    }
}

function getCurrentShiftOrders() {
    try {
        // Ensure order history is loaded
        if (!orderHistory || orderHistory.length === 0) {
            orderHistory = loadOrderHistory();
        }
        
        // Validate shift start time
        if (!shiftStartTime) {
            debugError('⚠️ No shift start time found');
            return [];
        }
        
        let currentShiftStart;
        try {
            currentShiftStart = new Date(shiftStartTime);
            if (isNaN(currentShiftStart.getTime())) {
                debugError('❌ Invalid shift start time:', shiftStartTime);
                return [];
            }
        } catch (dateError) {
            debugError('❌ Error parsing shift start time:', dateError);
            return [];
        }
        
        // Filter orders for current shift
        const shiftOrders = orderHistory.filter(order => {
            if (!order || !order.timestamp) {
                return false;
            }
            
            try {
                const orderDate = new Date(order.timestamp);
                if (isNaN(orderDate.getTime())) {
                    debugError('⚠️ Invalid order timestamp:', order.timestamp);
                    return false;
                }
                return orderDate >= currentShiftStart;
            } catch (error) {
                debugError(`⚠️ Error processing order timestamp: ${order.timestamp}`, error);
                return false;
            }
        });
        
        debugLog(`📊 Found ${shiftOrders.length} orders in current shift`);
        return shiftOrders;
        
    } catch (error) {
        debugError('❌ Error getting current shift orders:', error);
        return [];
    }
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
        }    }
    
    const totalOrdersEl = document.getElementById('current-shift-orders');
    const totalRevenueEl = document.getElementById('current-shift-revenue');
    const bestSellerEl = document.getElementById('current-shift-bestseller');
      totalOrdersEl && (totalOrdersEl.textContent = totalOrders);
    totalRevenueEl && (totalRevenueEl.textContent = formatPrice(totalRevenue));
    bestSellerEl && (bestSellerEl.textContent = bestSeller);
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

function populateEndShiftModal(orders) {
    try {
        const startTimeEl = document.getElementById('shift-start-time');
        const endTimeEl = document.getElementById('shift-end-time');
        const totalOrdersEl = document.getElementById('shift-total-orders');
        const totalRevenueEl = document.getElementById('shift-total-revenue');
        const bestSellerEl = document.getElementById('shift-bestseller-item');
        const ordersDetailsEl = document.getElementById('shift-orders-details');
        
        const endTime = new Date().toISOString();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
          startTimeEl && (startTimeEl.textContent = formatDateTime(shiftStartTime));
        endTimeEl && (endTimeEl.textContent = formatDateTime(endTime));
        totalOrdersEl && (totalOrdersEl.textContent = orders.length);
        totalRevenueEl && (totalRevenueEl.textContent = formatPrice(totalRevenue));
        
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
                bestSeller = `${itemName} (${count} ly)`;
            }
        }
        
        bestSellerEl && (bestSellerEl.textContent = bestSeller);
        
        // Populate orders details
        if (ordersDetailsEl) {
            ordersDetailsEl.innerHTML = orders.map(order => `
                <div class="shift-order-detail">
                    <span>#${order.id}</span>
                    <span>${formatDateTime(order.timestamp)}</span>
                    <span>${formatPrice(order.total)}</span>
                </div>
            `).join('');
        }
        
    } catch (error) {
        debugError('❌ Error populating end shift modal:', error);
    }
}

function confirmEndShift() {
    try {
        // Archive current shift
        const currentShiftOrders = getCurrentShiftOrders();
        const archiveData = {
            shiftInfo: {
                startTime: shiftStartTime,
                endTime: new Date().toISOString(),
                totalOrders: currentShiftOrders.length,
                totalRevenue: currentShiftOrders.reduce((sum, order) => sum + (order.total || 0), 0)
            },
            orders: currentShiftOrders
        };
        
        let archivedShifts = JSON.parse(localStorage.getItem('balancoffee_archived_shifts') || '[]');
        archivedShifts.push(archiveData);
        localStorage.setItem('balancoffee_archived_shifts', JSON.stringify(archivedShifts));
        
        // Start new shift
        shiftStartTime = new Date().toISOString();
        localStorage.setItem('shiftStartTime', shiftStartTime);
        
        closeEndShiftModal();
        showNotification('Đã kết thúc ca và bắt đầu ca mới!', 'success');
        
        if (isAdminMode) {
            displayCurrentShiftData();
        }
        
    } catch (error) {
        debugError('❌ Error confirming end shift:', error);
        showNotification('Lỗi kết thúc ca: ' + error.message, 'error');
    }
}

function closeEndShiftModal() {
    try {
        const modal = document.getElementById('end-shift-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    } catch (error) {
        debugError('❌ Error closing end shift modal:', error);
    }
}

// =============================================================================
// SIDEBAR FUNCTIONS
// =============================================================================

function toggleSidebar() {
    try {
        debugLog('🔄 Toggle sidebar called');
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            debugError('❌ Sidebar element not found');
            showNotification('Lỗi: Không tìm thấy sidebar', 'error');
            return;
        }
        
        const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
        debugLog('📱 Sidebar current state:', isCurrentlyCollapsed ? 'collapsed' : 'expanded');
        
        // Force toggle state
        if (isCurrentlyCollapsed) {
            sidebar.classList.remove('collapsed');
            sidebar.style.transform = 'translateX(0)';
            debugLog('✅ Sidebar expanding...');
        } else {
            sidebar.classList.add('collapsed');
            sidebar.style.transform = 'translateX(100%)';
            debugLog('✅ Sidebar collapsing...');
        }
        
        // Update close button icon
        const closeBtn = sidebar.querySelector('.close-sidebar i');
        if (closeBtn) {
            if (sidebar.classList.contains('collapsed')) {
                closeBtn.className = 'fas fa-chevron-left';
                debugLog('✅ Icon set to chevron-left (collapsed)');
            } else {
                closeBtn.className = 'fas fa-chevron-right';
                debugLog('✅ Icon set to chevron-right (expanded)');
            }
        } else {
            debugError('⚠️ Close button not found');
        }
        
        // Force update invoice display when sidebar opens
        if (!sidebar.classList.contains('collapsed')) {
            debugLog('🔄 Sidebar opened - updating invoice display');
            setTimeout(() => {
                updateInvoiceDisplay();
                updateInvoiceCount();
            }, 100);
        }
        
        // Handle mobile overlay
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !sidebar.classList.contains('collapsed')) {
            debugLog('📱 Mobile mode - setting up overlay click');
            
            // Add backdrop click handler
            const handleBackdropClick = (e) => {
                if (!sidebar.contains(e.target) && 
                    !e.target.closest('.cart-toggle') &&
                    !sidebar.classList.contains('collapsed')) {
                    
                    sidebar.classList.add('collapsed');
                    sidebar.style.transform = 'translateX(100%)';
                    if (closeBtn) closeBtn.className = 'fas fa-chevron-left';
                    document.removeEventListener('click', handleBackdropClick);
                    debugLog('✅ Sidebar closed by backdrop click');
                }
            };
            
            // Add handler after a short delay
            setTimeout(() => {
                document.addEventListener('click', handleBackdropClick);
            }, 200);
        }
        
        // Announce to screen reader
        const status = sidebar.classList.contains('collapsed') ? 'đã đóng' : 'đã mở';
        debugLog(`📢 Sidebar ${status}`);
        
        // Visual feedback notification
        showNotification(`Sidebar ${status}`, 'info');
        
    } catch (error) {
        debugError('❌ Error toggling sidebar:', error);
        showNotification('Lỗi thao tác sidebar: ' + error.message, 'error');
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initializeApp() {
    try {
        debugLog('🚀 Initializing BalanCoffee app...');
        
        // Load data
        loadInvoices();
        loadOrderHistory();
        getShiftStartTime();
        loadShiftEmployee();
        
        // Ensure sidebar starts collapsed and fix any issues
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            debugLog('🔧 Setting up sidebar initial state...');
            sidebar.classList.add('collapsed');
            sidebar.style.transform = 'translateX(100%)';
            
            const closeBtn = sidebar.querySelector('.close-sidebar i');
            if (closeBtn) {
                closeBtn.className = 'fas fa-chevron-left';
                debugLog('✅ Sidebar close button icon set');
            }
            
            // Test sidebar functionality
            debugLog('🧪 Testing sidebar...');
            debugLog('Sidebar element found:', !!sidebar);
            debugLog('Sidebar classes:', sidebar.className);
            debugLog('Sidebar transform:', sidebar.style.transform);
        } else {
            debugError('❌ Sidebar element not found during initialization');
        }
        
        // Update UI
        updateInvoiceDisplay();
        updateInvoiceCount();
        renderMenu();
        updateShiftInfoDisplay();
        
        // Set up category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterMenu(btn.dataset.category);
            });
        });
        
        // Add debug sidebar test button (for development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            debugLog('🔧 Development mode - adding debug controls');
            window.debugSidebar = function() {
                const sidebar = document.getElementById('sidebar');
                debugLog('=== SIDEBAR DEBUG ===');
                debugLog('Element exists:', !!sidebar);
                if (sidebar) {
                    debugLog('Classes:', sidebar.className);
                    debugLog('Style transform:', sidebar.style.transform);
                    debugLog('Computed transform:', window.getComputedStyle(sidebar).transform);
                    debugLog('Width:', window.getComputedStyle(sidebar).width);
                    debugLog('Z-index:', window.getComputedStyle(sidebar).zIndex);
                }
                debugLog('==================');
            };
        }
        
        debugLog('✅ BalanCoffee app initialized successfully');
        
    } catch (error) {
        debugError('❌ Error initializing app:', error);
        showNotification('Lỗi khởi tạo ứng dụng: ' + error.message, 'error');
    }
}

// Initialize when DOM is ready
ensureDOMReady(() => {
    initializeApp();
    initializeAdvancedFeatures();
});

// Expose key functions to window for compatibility
window.formatPrice = formatPrice;
window.formatDateTime = formatDateTime;
window.showNotification = showNotification;
window.renderMenu = renderMenu;
window.addToOrder = addToOrder;
window.createNewInvoice = createNewInvoice;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.confirmOrder = confirmOrder;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.confirmPayment = confirmPayment;
window.updateOrderDisplay = updateOrderDisplay;
window.updateInvoiceDisplay = updateInvoiceDisplay;
window.filterMenu = filterMenu;
window.clearCurrentOrder = clearCurrentOrder;
window.toggleAdmin = toggleAdmin;
window.startNewShift = startNewShift;
window.viewCurrentShift = viewCurrentShift;
window.endShift = endShift;
window.confirmEndShift = confirmEndShift;
window.closeEndShiftModal = closeEndShiftModal;
window.selectInvoice = selectInvoice;
window.editInvoice = editInvoice;
window.finishEditInvoice = finishEditInvoice;
window.deselectInvoice = deselectInvoice;
window.deleteInvoiceById = deleteInvoiceById;
window.processPayment = processPayment;
window.toggleSidebar = toggleSidebar;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromOrder = removeFromOrder;
window.closeSuccessModal = closeSuccessModal;
window.openEmployeeModal = openEmployeeModal;
window.closeEmployeeModal = closeEmployeeModal;
window.confirmEmployeeInfo = confirmEmployeeInfo;
window.updateShiftInfoDisplay = updateShiftInfoDisplay;

// =============================================================================
// ORDER EDITING FUNCTIONS
// =============================================================================

function finishEditInvoice(invoiceId) {
    try {
        debugLog('✅ Finishing edit for invoice:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        // Update invoice with current order if there are items
        if (currentOrder && currentOrder.length > 0) {
            invoice.items = [...currentOrder];
            invoice.total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            invoice.updatedAt = new Date().toISOString();
            
            debugLog('📝 Updated invoice items:', invoice.items);
            debugLog('💰 Updated invoice total:', invoice.total);
        }
        
        // Remove editing state
        delete invoice.isEditing;
        
        // Clear current editing state
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId;
        
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        saveInvoices();
        updateInvoiceDisplay();
        updateOrderDisplay();
        updateInvoiceCount();
        hideSidebarControls();
        
        showNotification(`Đã hoàn tất chỉnh sửa hóa đơn #${invoiceId}`, 'success');
        
    } catch (error) {
        debugError('❌ Error finishing edit invoice:', error);
        showNotification('Lỗi hoàn tất chỉnh sửa: ' + error.message, 'error');
    }
}

// =============================================================================
// ADVANCED UI/UX ENHANCEMENT FUNCTIONS
// =============================================================================

// Online-only system - Network monitoring removed
// System requires internet connection to function properly

function initializeNetworkMonitoring() {
    try {
        // Always assume online - no offline fallback
        debugLog('✅ Online-only system initialized - requires internet connection');
        
        // Optional: Check if user is online and show warning if not
        if (!navigator.onLine) {
            showNotification('Cần kết nối internet để sử dụng hệ thống', 'warning');
        }
        
    } catch (error) {
        debugError('❌ Error initializing network monitoring:', error);
    }
}

// Touch gesture enhancements
function initializeTouchGestures() {
    try {
        // Swipe to close modal on mobile
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('touchend', handleTouchEnd, false);
        
        debugLog('✅ Touch gestures initialized');
    } catch (error) {
        debugError('❌ Error initializing touch gestures:', error);
    }
}

let touchStartY = null;
let touchStartX = null;

function handleTouchStart(event) {
    const firstTouch = event.touches[0];
    touchStartY = firstTouch.clientY;
    touchStartX = firstTouch.clientX;
}

function handleTouchMove(event) {
    if (!touchStartY || !touchStartX) return;
    
    const touchY = event.touches[0].clientY;
    const touchX = event.touches[0].clientX;
    
    const diffY = touchStartY - touchY;
    const diffX = touchStartX - touchX;
    
    // Prevent scroll when modal is open
    const modal = document.querySelector('.modal.show');
    if (modal && Math.abs(diffY) > Math.abs(diffX)) {
        const modalContent = modal.querySelector('.modal-content');
        const rect = modalContent.getBoundingClientRect();
        
        if (touchStartY < rect.top) {
            event.preventDefault();
        }
    }
}

function handleTouchEnd(event) {
    if (!touchStartY || !touchStartX) return;
    
    const touchY = event.changedTouches[0].clientY;
    const diffY = touchStartY - touchY;
    
    // Swipe down to close modal
    if (diffY < -100) {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                const rect = modalContent.getBoundingClientRect();
                if (touchStartY < rect.top + 50) {
                    if (modal.id === 'payment-modal') closePaymentModal();
                    else if (modal.id === 'order-modal') closeOrderModal();
                    else if (modal.id === 'employee-modal') closeEmployeeModal();
                    else if (modal.id === 'end-shift-modal') closeEndShiftModal();
                    else if (modal.id === 'success-modal') closeSuccessModal();
                }
            }
        }
    }
    
    touchStartY = null;
    touchStartX = null;
}

// Performance monitoring
function initializePerformanceMonitoring() {
    try {
        // Monitor app performance
        let performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            interactionCount: 0
        };
        
        // Measure initial load time
        window.addEventListener('load', () => {
            performanceMetrics.loadTime = performance.now();
            debugLog(`📊 App load time: ${performanceMetrics.loadTime.toFixed(2)}ms`);
        });
        
        // Monitor large operations
        const originalRenderMenu = renderMenu;
        renderMenu = function() {
            const startTime = performance.now();
            originalRenderMenu.apply(this, arguments);
            const endTime = performance.now();
            performanceMetrics.renderTime = endTime - startTime;
            debugLog(`📊 Menu render time: ${performanceMetrics.renderTime.toFixed(2)}ms`);
        };
        
        // Store metrics globally for debugging
        window.performanceMetrics = performanceMetrics;
        
        debugLog('✅ Performance monitoring initialized');
    } catch (error) {
        debugError('❌ Error initializing performance monitoring:', error);
    }
}

// Data validation and sanitization
function validateOrderData(order) {
    if (!Array.isArray(order)) return false;
    
    return order.every(item => {
        return item.id && 
               typeof item.id === 'number' &&
               item.name && 
               typeof item.name === 'string' &&
               item.price && 
               typeof item.price === 'number' &&
               item.quantity && 
               typeof item.quantity === 'number' &&
               item.quantity > 0;
    });
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .substring(0, 255); // Limit length
}

// Auto-save functionality
let autoSaveInterval = null;

function initializeAutoSave() {
    try {
        // Auto-save every 30 seconds
        autoSaveInterval = setInterval(() => {
            if (currentOrder.length > 0) {
                localStorage.setItem('balancoffee_temp_order', JSON.stringify(currentOrder));
                debugLog('💾 Auto-saved current order');
            }
        }, 30000);
        
        // Load temp order on startup
        const tempOrder = localStorage.getItem('balancoffee_temp_order');
        if (tempOrder) {
            try {
                const parsedOrder = JSON.parse(tempOrder);
                if (validateOrderData(parsedOrder) && parsedOrder.length > 0) {
                    const restore = confirm('Phát hiện đơn hàng chưa hoàn thành. Bạn có muốn khôi phục không?');
                    if (restore) {
                        currentOrder = parsedOrder;
                        window.currentOrder = currentOrder;
                        updateOrderDisplay();
                        showNotification('Đã khôi phục đơn hàng chưa hoàn thành', 'success');
                    }
                    localStorage.removeItem('balancoffee_temp_order');
                }
            } catch (e) {
                localStorage.removeItem('balancoffee_temp_order');
            }
        }
        
        debugLog('✅ Auto-save initialized');
    } catch (error) {
        debugError('❌ Error initializing auto-save:', error);
    }
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', (event) => {
            // Only handle shortcuts when not in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd + N: New order
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                if (currentOrder.length > 0) {
                    openOrderModal();
                } else {
                    showNotification('Đơn hàng trống', 'warning');
                }
            }
              // Ctrl/Cmd + S: Toggle sidebar
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                toggleSidebar();
            }
            
            // Escape: Close modals
            if (event.key === 'Escape') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    if (modal.id === 'payment-modal') closePaymentModal();
                    else if (modal.id === 'order-modal') closeOrderModal();
                    else if (modal.id === 'employee-modal') closeEmployeeModal();
                    else if (modal.id === 'end-shift-modal') closeEndShiftModal();
                    else if (modal.id === 'success-modal') closeSuccessModal();
                }
            }
            
            // F1: Help (toggle admin mode)
            if (event.key === 'F1') {
                event.preventDefault();
                toggleAdmin();
            }
        });
        
        debugLog('✅ Keyboard shortcuts initialized');
    } catch (error) {
        debugError('❌ Error initializing keyboard shortcuts:', error);
    }
}

// Accessibility improvements
function initializeAccessibility() {
    try {
        // Announce dynamic content changes to screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'accessibility-announcer';
        document.body.appendChild(announcer);
        
        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Reduced motion detection
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        debugLog('✅ Accessibility features initialized');
    } catch (error) {
        debugError('❌ Error initializing accessibility:', error);
    }
}

function announceToScreenReader(message) {
    try {
        const announcer = document.getElementById('accessibility-announcer');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    } catch (error) {
        debugError('❌ Error announcing to screen reader:', error);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error boundary for unhandled errors
function initializeErrorHandling() {
    try {
        window.addEventListener('error', (event) => {
            debugError('🚨 Unhandled error:', event.error);
            showNotification('Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.', 'error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            debugError('🚨 Unhandled promise rejection:', event.reason);
            showNotification('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.', 'error');
        });
        
        debugLog('✅ Error handling initialized');
    } catch (error) {
        debugError('❌ Error initializing error handling:', error);
    }
}

// =============================================================================
// ENHANCED INITIALIZATION
// =============================================================================

function initializeAdvancedFeatures() {
    try {
        debugLog('🚀 Initializing advanced features...');        // Initialize all advanced features
        initializeNetworkMonitoring();
        initializeTouchGestures();
        initializePerformanceMonitoring();
        initializeAutoSave();
        initializeKeyboardShortcuts();
        initializeAccessibility();
        initializeErrorHandling();
        
        // Setup loading screen removal
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const appContainer = document.getElementById('app-container');
            
            if (loadingScreen && appContainer) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    appContainer.style.display = 'block';
                    appContainer.style.opacity = '1';
                }, 500);
            }
        }, 2000);
        
        debugLog('✅ Advanced features initialized successfully');
        
    } catch (error) {
        debugError('❌ Error initializing advanced features:', error);
        showNotification('Một số tính năng nâng cao không thể khởi tạo', 'warning');
    }
}

// Expose new functions to window
window.validateOrderData = validateOrderData;
window.sanitizeInput = sanitizeInput;
window.announceToScreenReader = announceToScreenReader;
window.initializeAdvancedFeatures = initializeAdvancedFeatures;
window.debugLog = debugLog;
window.debugError = debugError;
window.DEBUG_MODE = DEBUG_MODE;

// Debug helper for development
if (DEBUG_MODE) {
    window.debugApp = function() {
        debugLog('=== BALANCOFFEE DEBUG INFO ===');
        debugLog('Current Order:', currentOrder);
        debugLog('Invoices:', invoices.length);
        debugLog('Order History:', orderHistory.length);
        debugLog('Shift Start Time:', shiftStartTime);
        debugLog('Current Invoice ID:', currentInvoiceId);
        debugLog('Admin Mode:', isAdminMode);
        debugLog('Current Category:', currentCategory);
        debugLog('Current Shift Employee:', currentShiftEmployee);
        debugLog('==============================');
    };
}

debugLog('📋 BalanCoffee script loaded - Version 8.6 Production Optimized');
