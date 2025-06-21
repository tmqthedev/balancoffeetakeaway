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
        console.log(`[${type.toUpperCase()}] ${message}`);
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
        console.error('❌ Error showing notification:', error);
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
            console.log('✅ Loaded invoices:', invoices.length);
        }
    } catch (error) {
        console.error('❌ Error loading invoices:', error);
        invoices = [];
        window.invoices = invoices;
    }
}

function saveInvoices() {
    try {
        localStorage.setItem('balancoffee_invoices', JSON.stringify(invoices));
        console.log('✅ Invoices saved');
    } catch (error) {
        console.error('❌ Error saving invoices:', error);
    }
}

function loadOrderHistory() {
    try {
        const saved = localStorage.getItem('balancoffee_order_history');
        if (saved) {
            orderHistory = JSON.parse(saved);
            window.orderHistory = orderHistory;
            console.log('✅ Loaded order history:', orderHistory.length);
        }
        return orderHistory;
    } catch (error) {
        console.error('❌ Error loading order history:', error);
        orderHistory = [];
        window.orderHistory = orderHistory;
        return orderHistory;
    }
}

function saveOrderHistory() {
    try {
        localStorage.setItem('balancoffee_order_history', JSON.stringify(orderHistory));
        console.log('✅ Order history saved');
    } catch (error) {
        console.error('❌ Error saving order history:', error);
    }
}

function getShiftStartTime() {
    try {
        console.log('🔄 Getting shift start time...');
        const saved = localStorage.getItem('shiftStartTime');
        
        if (saved) {
            shiftStartTime = saved;
            console.log('✅ Loaded existing shift start time:', formatDateTime(saved));
        } else {
            // Only auto-create if explicitly requested
            console.log('⚠️ No existing shift found in localStorage');
            shiftStartTime = null;
        }
        
        window.shiftStartTime = shiftStartTime;
        console.log('📊 Final shift start time:', shiftStartTime);
        return shiftStartTime;
    } catch (error) {
        console.error('❌ Error getting shift start time:', error);
        shiftStartTime = null;
        window.shiftStartTime = shiftStartTime;
        return shiftStartTime;
    }
}

function loadShiftEmployee() {
    try {
        console.log('🔄 Loading shift employee data...');
        const saved = localStorage.getItem('currentShiftEmployee');
        
        if (saved) {
            try {
                const employeeData = JSON.parse(saved);
                currentShiftEmployee = employeeData.name || null;
                currentShiftNote = employeeData.note || null;
                console.log('✅ Loaded shift employee:', currentShiftEmployee);
                console.log('📝 Shift note:', currentShiftNote);
            } catch (parseError) {
                console.error('❌ Error parsing employee data:', parseError);
                // Try loading as simple string (backward compatibility)
                currentShiftEmployee = saved;
                currentShiftNote = null;
                console.log('🔄 Loaded as simple string:', currentShiftEmployee);
            }
        } else {
            currentShiftEmployee = null;
            currentShiftNote = null;
            console.log('⚠️ No shift employee data found');
        }
        
        window.currentShiftEmployee = currentShiftEmployee;
        window.currentShiftNote = currentShiftNote;
        
        console.log('📊 Final employee data:', { 
            employee: currentShiftEmployee, 
            note: currentShiftNote 
        });
        
        return { employee: currentShiftEmployee, note: currentShiftNote };
    } catch (error) {
        console.error('❌ Error loading shift employee:', error);
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
        console.log('✅ Shift employee saved:', employee);
    } catch (error) {
        console.error('❌ Error saving shift employee:', error);
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
            if (qrFallback) qrFallback.style.display = 'none';
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
        
        console.log('✅ QR canvas fallback generated successfully');
    } catch (error) {
        console.error('❌ Error generating QR canvas fallback:', error);
    }
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================

function updateInvoiceDisplay() {
    try {
        const invoiceList = document.getElementById('invoice-list');
        
        if (!invoiceList) {
            console.error('❌ Invoice list element not found');
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
            `;
            return;
        }
        
        const sortedInvoices = [...pendingInvoices].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
          invoiceList.innerHTML = sortedInvoices.map(invoice => `
            <div class="invoice-item ${currentInvoiceId === invoice.id ? 'active' : ''} ${currentInvoiceId === invoice.id ? 'editing' : ''}" 
                 data-invoice-id="${invoice.id}">
                <div class="invoice-header" onclick="selectInvoice('${invoice.id}')">
                    <span class="invoice-id">Hóa đơn #${invoice.id}</span>
                    <span class="invoice-status ${invoice.status}">
                        ${currentInvoiceId === invoice.id ? '⚠ Đang chỉnh sửa' : 
                          (invoice.status === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán')}
                    </span>
                </div>
                <div class="invoice-details">
                    <p>Số món: ${invoice.items ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0}</p>
                    <p>Thời gian: ${formatDateTime(invoice.createdAt)}</p>
                </div>
                <div class="invoice-total">
                    Tổng: ${formatPrice(invoice.total || 0)}
                </div>                <div class="invoice-actions">
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
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        console.log('✅ Invoice display updated:', invoices.length, 'invoices');
        
    } catch (error) {
        console.error('❌ Error updating invoice display:', error);
        showNotification('Lỗi cập nhật danh sách hóa đơn: ' + error.message, 'error');
    }
}

function updateOrderDisplay() {
    try {
        const orderList = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        if (!orderList) {
            console.log('📝 Order list element not found (order-items)');
            return;
        }
        
        if (currentOrder.length === 0) {
            orderList.innerHTML = '<p class="empty-order">Chưa có món nào trong đơn hàng</p>';
            if (orderTotal) orderTotal.textContent = formatPrice(0);
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
        
        console.log('✅ Order display updated:', currentOrder.length, 'items');
        
    } catch (error) {
        console.error('❌ Error updating order display:', error);
    }
}

function updateInvoiceCount() {
    try {
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
        const countElements = document.querySelectorAll('#invoice-count, .invoice-count');
        
        countElements.forEach(el => {
            el.textContent = pendingInvoices.length;
        });
        
        console.log('✅ Invoice count updated:', pendingInvoices.length);
    } catch (error) {
        console.error('❌ Error updating invoice count:', error);
    }
}

function renderMenu() {
    try {
        console.log('🎨 Rendering menu...');
        
        const menuContainer = document.getElementById('menu-grid');
        if (!menuContainer) {
            console.error('❌ Menu container not found (menu-grid)');
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
                <div class="menu-item-image">
                    <i class="fas fa-coffee"></i>
                </div>
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
        
        console.log('✅ Menu rendered:', filteredItems.length, 'items');
        
    } catch (error) {
        console.error('❌ Error rendering menu:', error);
        showNotification('Lỗi hiển thị menu: ' + error.message, 'error');
    }
}

// =============================================================================
// ORDER MANAGEMENT FUNCTIONS
// =============================================================================

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
        
        window.currentOrder = currentOrder;
        
        // If there's a current invoice being edited, update it
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
        
        showNotification(`Đã thêm ${item.name} vào đơn hàng`, 'success');
        console.log('✅ Item added to order:', item.name);
        
    } catch (error) {
        console.error('❌ Error adding item to order:', error);
        showNotification('Lỗi thêm món: ' + error.message, 'error');
    }
}

function increaseQuantity(itemId) {
    const item = currentOrder.find(i => i.id === itemId);
    if (item) {
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
    }
}

function decreaseQuantity(itemId) {
    const item = currentOrder.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
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
    }
}

function removeFromOrder(itemId) {
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
    
    const item = (window.menuData || fallbackMenuData).find(i => i.id === itemId);
    if (item) {
        showNotification(`Đã xóa ${item.name} khỏi đơn hàng`);
    }
}

function clearCurrentOrder() {
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
    showNotification('Đã xóa tất cả món khỏi đơn hàng');
}

// =============================================================================
// INVOICE MANAGEMENT FUNCTIONS
// =============================================================================

function createNewInvoice() {
    try {
        console.log('📄 Creating new empty invoice...');
        
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
        console.log('✅ Empty invoice created and selected for editing:', newInvoice);
        
        return newInvoice;
        
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        showNotification('Lỗi tạo hóa đơn: ' + error.message, 'error');
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
        window.currentInvoiceId = currentInvoiceId;
        
        currentOrder = [...(invoice.items || [])];
        window.currentOrder = currentOrder;
        
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

function editInvoice(invoiceId) {
    selectInvoice(invoiceId);
    showNotification(`Đang chỉnh sửa hóa đơn #${invoiceId}`, 'info');
}

function deselectInvoice() {
    try {
        console.log('📋 Deselecting invoice...');
        
        currentInvoiceId = null;
        window.currentInvoiceId = currentInvoiceId;
        
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        updateInvoiceDisplay();
        updateOrderDisplay();
        hideSidebarControls();
        
        showNotification('Đã bỏ chọn hóa đơn', 'info');
        
    } catch (error) {
        console.error('❌ Error deselecting invoice:', error);
        showNotification('Lỗi bỏ chọn hóa đơn: ' + error.message, 'error');
    }
}

function deleteInvoiceById(invoiceId) {
    console.log('🗑️ Delete invoice called:', invoiceId);
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hóa đơn #${invoiceId}?`);
    
    if (confirmDelete) {
        invoices = invoices.filter(inv => inv.id !== invoiceId);
        if (currentInvoiceId === invoiceId) {
            currentInvoiceId = null;
            window.currentInvoiceId = currentInvoiceId;
        }
        saveInvoices();
        updateInvoiceDisplay();
        updateInvoiceCount();
        showNotification(`Đã xóa hóa đơn #${invoiceId}`);
    }
}

function processPayment(invoiceId) {
    console.log('💳 Process payment called for:', invoiceId);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        openPaymentModal(invoice);
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
// MODAL FUNCTIONS
// =============================================================================

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
        
        updateOrderModalContent();
        modal.style.display = 'flex';
        modal.getBoundingClientRect();
        
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
        
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
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
        
        let invoice;
        
        // If editing an existing invoice, update it
        if (currentInvoiceId) {
            invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                invoice.items = [...currentOrder];
                invoice.total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                delete invoice.isEditing;
                saveInvoices();
            }
        } else {
            // Create new invoice with current order
            const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
            saveInvoices();
        }
        
        if (invoice) {
            closeOrderModal();
            
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
            console.log('✅ Order confirmed and added to history');
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
        
        if (invoice.items.length === 0) {
            showNotification('Hóa đơn trống không thể thanh toán', 'error');
            return;
        }
        
        // Update invoice status
        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();
        invoice.paymentMethod = 'qr';
        
        // Save and update UI
        saveInvoices();
        window.invoices = invoices;
        
        updateInvoiceDisplay();
        updateInvoiceCount();
        
        // Show success before clearing current invoice
        showSuccessModal(invoice);
        
        // Close payment modal
        closePaymentModal();
        
        console.log('✅ Payment confirmed for invoice:', invoice.id);
        
        // Clear current invoice after showing success
        setTimeout(() => {
            currentInvoiceId = null;
            window.currentInvoiceId = currentInvoiceId;
        }, 100);
        
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
        console.error('❌ Error showing success modal:', error);
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
        console.error('❌ Error closing success modal:', error);
    }
}

// =============================================================================
// CATEGORY & FILTER FUNCTIONS
// =============================================================================

function filterMenu(category) {
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
    console.log('✅ Menu filtered by category:', category);
}

// =============================================================================
// ADMIN & SHIFT FUNCTIONS
// =============================================================================

function updateAdminUI(isAdmin) {
    const adminSection = document.getElementById('admin-section');
    const menuSection = document.querySelector('.menu-section');
    const adminBtn = document.querySelector('[onclick="toggleAdmin()"]');
    
    if (isAdmin) {
        if (adminSection) adminSection.style.display = 'block';
        if (menuSection) menuSection.style.display = 'none';
        if (adminBtn) adminBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Quay lại Menu';
        displayCurrentShiftData();
        updateShiftInfoDisplay();
    } else {
        if (adminSection) adminSection.style.display = 'none';
        if (menuSection) menuSection.style.display = 'block';
        if (adminBtn) adminBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Quản lý';
    }
}

function updateShiftInfoDisplay() {
    try {
        console.log('🔄 Updating shift info display...');
        console.log('📊 Current shift data:', {
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
                console.log('✅ Shift start time updated:', formattedTime);
            } else {
                shiftStartDisplay.textContent = 'Chưa bắt đầu ca';
                console.log('⚠️ No shift start time found');
            }
        } else {
            console.error('❌ shift-start-display element not found');
        }
        
        if (shiftEmployeeDisplay) {
            if (currentShiftEmployee) {
                shiftEmployeeDisplay.textContent = currentShiftEmployee;
                console.log('✅ Shift employee updated:', currentShiftEmployee);
            } else {
                shiftEmployeeDisplay.textContent = 'Chưa chọn nhân viên';
                console.log('⚠️ No shift employee found');
            }
        } else {
            console.error('❌ shift-employee-display element not found');
        }
        
        // Update shift status indicator
        updateShiftStatusIndicator();
        
        console.log('✅ Shift info display updated successfully');
    } catch (error) {
        console.error('❌ Error updating shift info display:', error);
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
        console.error('❌ Error updating shift status indicator:', error);
    }
}

function openEmployeeModal() {
    try {
        const modal = document.getElementById('employee-modal');
        const modalShiftTime = document.getElementById('modal-shift-time');
        const employeeNameInput = document.getElementById('employee-name');
        const shiftNoteInput = document.getElementById('shift-note');
        
        if (!modal) {
            console.error('❌ Employee modal not found');
            return;
        }
        
        // Set current time
        const currentTime = new Date();
        if (modalShiftTime) {
            modalShiftTime.textContent = formatDateTime(currentTime.toISOString());
        }
        
        // Clear inputs
        if (employeeNameInput) employeeNameInput.value = '';
        if (shiftNoteInput) shiftNoteInput.value = '';
        
        // Show modal
        modal.style.display = 'flex';
        modal.getBoundingClientRect();
        
        setTimeout(() => {
            modal.classList.add('show');
            if (employeeNameInput) employeeNameInput.focus();
        }, 50);
        
        console.log('✅ Employee modal opened');
        
    } catch (error) {
        console.error('❌ Error opening employee modal:', error);
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
        console.log('✅ Employee modal closed');
    } catch (error) {
        console.error('❌ Error closing employee modal:', error);
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
            if (employeeNameInput) employeeNameInput.focus();
            return;
        }
        
        // Start new shift with employee info
        proceedWithNewShift(employeeName, shiftNote);
        closeEmployeeModal();
        
    } catch (error) {
        console.error('❌ Error confirming employee info:', error);
        showNotification('Lỗi xác nhận thông tin nhân viên: ' + error.message, 'error');
    }
}

function toggleAdmin() {
    try {
        isAdminMode = !isAdminMode;
        window.isAdminMode = isAdminMode;
        updateAdminUI(isAdminMode);
        console.log('✅ Admin mode toggled:', isAdminMode ? 'ON' : 'OFF');
    } catch (error) {
        console.error('❌ Error toggling admin mode:', error);
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
            console.log('✅ New shift started at:', new Date(shiftStartTime).toLocaleString(), 'Employee:', employeeName);
            
        } catch (error) {
            console.error('❌ Error starting new shift:', error);
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
        
        if (startTimeEl) startTimeEl.textContent = formatDateTime(shiftStartTime);
        if (endTimeEl) endTimeEl.textContent = formatDateTime(endTime);
        if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
        if (totalRevenueEl) totalRevenueEl.textContent = formatPrice(totalRevenue);
        
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
        
        if (bestSellerEl) bestSellerEl.textContent = bestSeller;
        
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
        console.error('❌ Error populating end shift modal:', error);
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
        console.error('❌ Error confirming end shift:', error);
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
        console.error('❌ Error closing end shift modal:', error);
    }
}

// =============================================================================
// SIDEBAR FUNCTIONS
// =============================================================================

function toggleSidebar() {
    try {
        console.log('🔄 Toggle sidebar called');
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error('❌ Sidebar element not found');
            return;
        }
        
        const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
        console.log('📱 Sidebar current state:', isCurrentlyCollapsed ? 'collapsed' : 'expanded');
        
        // Toggle the collapsed class
        sidebar.classList.toggle('collapsed');
        
        // Update close button icon
        const closeBtn = sidebar.querySelector('.close-sidebar i');
        if (closeBtn) {
            if (sidebar.classList.contains('collapsed')) {
                closeBtn.className = 'fas fa-chevron-left';
                console.log('✅ Sidebar collapsed, icon updated');
            } else {
                closeBtn.className = 'fas fa-chevron-right';
                console.log('✅ Sidebar expanded, icon updated');
            }
        }
        
        // Handle overlay click for mobile
        if (!sidebar.classList.contains('collapsed')) {
            // Add overlay click handler after a delay to prevent immediate close
            setTimeout(() => {
                const handleOverlayClick = (e) => {
                    // Check if click is outside sidebar and on mobile
                    if (window.innerWidth <= 768 && 
                        !sidebar.contains(e.target) && 
                        !sidebar.classList.contains('collapsed') &&
                        !e.target.closest('.cart-toggle')) { // Don't close if clicking cart toggle
                        
                        sidebar.classList.add('collapsed');
                        if (closeBtn) closeBtn.className = 'fas fa-chevron-left';
                        document.removeEventListener('click', handleOverlayClick);
                        console.log('✅ Sidebar closed by overlay click');
                    }
                };
                document.addEventListener('click', handleOverlayClick);
            }, 100);
        }
        
        // Announce to screen reader
        const status = sidebar.classList.contains('collapsed') ? 'đã đóng' : 'đã mở';
        if (window.announceToScreenReader) {
            window.announceToScreenReader(`Danh sách hóa đơn ${status}`);
        }
        
    } catch (error) {
        console.error('❌ Error toggling sidebar:', error);
        showNotification('Lỗi thao tác sidebar: ' + error.message, 'error');
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initializeApp() {
    try {
        console.log('🚀 Initializing BalanCoffee app...');
        
        // Load data
        loadInvoices();
        loadOrderHistory();
        getShiftStartTime();
        loadShiftEmployee();
        
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
        
        console.log('✅ BalanCoffee app initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
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
        console.log('✅ Finishing edit for invoice:', invoiceId);
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
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
        hideSidebarControls();
        
        showNotification(`Đã hoàn tất chỉnh sửa hóa đơn #${invoiceId}`, 'success');
        
    } catch (error) {
        console.error('❌ Error finishing edit invoice:', error);
        showNotification('Lỗi hoàn tất chỉnh sửa: ' + error.message, 'error');
    }
}

// =============================================================================
// ADVANCED UI/UX ENHANCEMENT FUNCTIONS
// =============================================================================

// Network status monitoring
let networkStatus = navigator.onLine;
let networkStatusIndicator = null;

function initializeNetworkMonitoring() {
    try {
        window.addEventListener('online', handleNetworkOnline);
        window.addEventListener('offline', handleNetworkOffline);
        
        // Create network status indicator (initially hidden)
        networkStatusIndicator = document.createElement('div');
        networkStatusIndicator.className = 'network-status';
        networkStatusIndicator.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>Mất kết nối mạng - Đang hoạt động offline</span>
        `;
        document.body.appendChild(networkStatusIndicator);
        
        // Show status only if currently offline
        if (!navigator.onLine) {
            networkStatusIndicator.classList.add('show');
        }
        
        console.log('✅ Network monitoring initialized, status:', navigator.onLine ? 'online' : 'offline');
    } catch (error) {
        console.error('❌ Error initializing network monitoring:', error);
    }
}

function handleNetworkOnline() {
    networkStatus = true;
    if (networkStatusIndicator) {
        networkStatusIndicator.classList.remove('show');
        networkStatusIndicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>Đã kết nối lại</span>
        `;
        networkStatusIndicator.classList.add('online');
        networkStatusIndicator.classList.add('show');
        
        setTimeout(() => {
            networkStatusIndicator.classList.remove('show');
        }, 3000);
    }
    console.log('✅ Network back online');
}

function handleNetworkOffline() {
    networkStatus = false;
    if (networkStatusIndicator) {
        networkStatusIndicator.classList.remove('online');
        networkStatusIndicator.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>Mất kết nối mạng - Đang hoạt động offline</span>
        `;
        networkStatusIndicator.classList.add('show');
    }
    console.log('⚠️ Network offline');
}

// Touch gesture enhancements
function initializeTouchGestures() {
    try {
        // Swipe to close modal on mobile
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('touchend', handleTouchEnd, false);
        
        console.log('✅ Touch gestures initialized');
    } catch (error) {
        console.error('❌ Error initializing touch gestures:', error);
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
            const rect = modalContent.getBoundingClientRect();
            
            if (touchStartY < rect.top + 50) {
                if (modal.id === 'payment-modal') closePaymentModal();
                else if (modal.id === 'order-modal') closeOrderModal();
                else if (modal.id === 'employee-modal') closeEmployeeModal();
                else if (modal.id === 'end-shift-modal') closeEndShiftModal();
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
            console.log(`📊 App load time: ${performanceMetrics.loadTime.toFixed(2)}ms`);
        });
        
        // Monitor large operations
        const originalRenderMenu = renderMenu;
        renderMenu = function() {
            const startTime = performance.now();
            originalRenderMenu.apply(this, arguments);
            const endTime = performance.now();
            performanceMetrics.renderTime = endTime - startTime;
            console.log(`📊 Menu render time: ${performanceMetrics.renderTime.toFixed(2)}ms`);
        };
        
        // Store metrics globally for debugging
        window.performanceMetrics = performanceMetrics;
        
        console.log('✅ Performance monitoring initialized');
    } catch (error) {
        console.error('❌ Error initializing performance monitoring:', error);
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
                console.log('💾 Auto-saved current order');
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
        
        console.log('✅ Auto-save initialized');
    } catch (error) {
        console.error('❌ Error initializing auto-save:', error);
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
                }
            }
            
            // F1: Help (toggle admin mode)
            if (event.key === 'F1') {
                event.preventDefault();
                toggleAdmin();
            }
        });
        
        console.log('✅ Keyboard shortcuts initialized');
    } catch (error) {
        console.error('❌ Error initializing keyboard shortcuts:', error);
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
        
        console.log('✅ Accessibility features initialized');
    } catch (error) {
        console.error('❌ Error initializing accessibility:', error);
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
        console.error('❌ Error announcing to screen reader:', error);
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
            console.error('🚨 Unhandled error:', event.error);
            showNotification('Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.', 'error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);
            showNotification('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.', 'error');
        });
        
        console.log('✅ Error handling initialized');
    } catch (error) {
        console.error('❌ Error initializing error handling:', error);
    }
}

// =============================================================================
// ENHANCED INITIALIZATION
// =============================================================================

function initializeAdvancedFeatures() {
    try {
        console.log('🚀 Initializing advanced features...');
          // Initialize all advanced features
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
        
        console.log('✅ Advanced features initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing advanced features:', error);
        showNotification('Một số tính năng nâng cao không thể khởi tạo', 'warning');
    }
}

// Expose new functions to window
window.validateOrderData = validateOrderData;
window.sanitizeInput = sanitizeInput;
window.announceToScreenReader = announceToScreenReader;
window.initializeAdvancedFeatures = initializeAdvancedFeatures;

console.log('📋 BalanCoffee script loaded - Version 8.5 Advanced Features Complete');
