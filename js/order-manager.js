/**
 * BalanCoffee - Order Manager
 * Quản lý đơn hàng và menu
 */

/**
 * BalanCoffee - Order Manager Module
 * Quản lý đơn hàng và giỏ hàng
 */

// =============================================================================
// SAFE WRAPPER FUNCTIONS
// =============================================================================

/**
 * Safe error handler wrapper for Order Manager
 */
function safeOrderError(message, error) {
    if (typeof window !== 'undefined' && window.debugError && typeof window.debugError === 'function') {
        try {
            window.debugError(message, error);
        } catch {
            console.error(`[Order Manager ERROR] ${message}`, error);
        }
    } else {
        console.error(`[Order Manager ERROR] ${message}`, error);
    }
}

/**
 * Safe log wrapper for Order Manager
 */
function safeOrderLog(message, ...args) {
    if (typeof window !== 'undefined' && window.debugLog && typeof window.debugLog === 'function') {
        try {
            window.debugLog(message, ...args);
        } catch {
            console.log(`[Order Manager] ${message}`, ...args);
        }
    } else {
        console.log(`[Order Manager] ${message}`, ...args);
    }
}

// =============================================================================
// ORDER MANAGEMENT
// =============================================================================

/**
 * Add item to current order
 */
window.addToOrder = function(itemId) {
    return window.withErrorHandling(() => {
        const menuData = window.loadMenuData();
        const item = menuData.find(i => i.id === itemId);
          if (!item) {
            safeOrderError(`❌ Item not found: ${itemId}`);
            window.showNotification('Sản phẩm không tồn tại', 'error');
            return false;
        }
        
        const existingItem = window.STATE.currentOrder.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.STATE.currentOrder.push({
                ...item,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        window.updateOrderDisplay();
        window.showNotification(`Đã thêm ${item.name} vào đơn hàng`, 'success');
        
        // Trigger haptic feedback on mobile
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
        
        window.debugLog(`✅ Added item to order: ${item.name}`);
        return true;
        
    }, 'addToOrder') || false;
};

/**
 * Update item quantity in order
 */
window.updateQuantity = function(itemId, change) {
    return window.withErrorHandling(() => {        const item = window.STATE.currentOrder.find(i => i.id === itemId);
        if (!item) {
            safeOrderError(`❌ Item not found in order: ${itemId}`);
            return false;
        }
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            const index = window.STATE.currentOrder.findIndex(i => i.id === itemId);
            window.STATE.currentOrder.splice(index, 1);
            window.showNotification(`Đã xóa ${item.name} khỏi đơn hàng`, 'info');
        }
        
        window.updateOrderDisplay();
        
        window.debugLog(`✅ Updated quantity for ${item.name}: ${item.quantity}`);
        return true;
        
    }, 'updateQuantity') || false;
};

/**
 * Remove item from order
 */
window.removeFromOrder = function(itemId) {
    return window.withErrorHandling(() => {
        const index = window.STATE.currentOrder.findIndex(i => i.id === itemId);        if (index === -1) {
            safeOrderError(`❌ Item not found in order: ${itemId}`);
            return false;
        }
        
        const item = window.STATE.currentOrder[index];
        window.STATE.currentOrder.splice(index, 1);
        
        window.updateOrderDisplay();
        window.showNotification(`Đã xóa ${item.name} khỏi đơn hàng`, 'info');
        
        window.debugLog(`✅ Removed item from order: ${item.name}`);
        return true;
        
    }, 'removeFromOrder') || false;
};

/**
 * Clear current order
 */
window.clearOrder = function() {
    return window.withErrorHandling(() => {
        if (window.STATE.currentOrder.length === 0) {
            window.showNotification('Đơn hàng đã trống', 'info');
            return true;
        }
        
        const confirmed = confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong đơn hàng?');
        if (!confirmed) {
            return false;
        }
        
        window.STATE.currentOrder = [];
        window.updateOrderDisplay();
        window.showNotification('Đã xóa tất cả sản phẩm khỏi đơn hàng', 'success');
        
        window.debugLog('✅ Order cleared');
        return true;
        
    }, 'clearOrder') || false;
};

/**
 * Calculate order total
 */
window.calculateOrderTotal = function() {
    return window.safeArrayOperation(
        window.STATE.currentOrder,
        (order) => order.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        0
    );
};

// =============================================================================
// ORDER DISPLAY
// =============================================================================

/**
 * Update order display in UI
 */
window.updateOrderDisplay = function() {
    return window.withErrorHandling(() => {
        const orderContainer = window.safeGetElement('order-items');
        const orderTotalElement = window.safeGetElement('order-total');
        const orderPreviewElement = window.safeGetElement('order-items-preview');
        const orderTotalPreviewElement = window.safeGetElement('order-total-preview');
          if (!orderContainer) {
            safeOrderError('❌ Order container not found');
            return false;
        }
        
        if (window.STATE.currentOrder.length === 0) {
            orderContainer.innerHTML = '<p class="empty-order">Chưa có sản phẩm nào</p>';
            
            if (orderTotalElement) orderTotalElement.textContent = window.formatPrice(0);
            if (orderPreviewElement) orderPreviewElement.innerHTML = '<p class="empty-order">Chưa có sản phẩm nào</p>';
            if (orderTotalPreviewElement) orderTotalPreviewElement.textContent = window.formatPrice(0);
            
            window.updateAllUIStats();
            return true;
        }
        
        const orderHTML = window.STATE.currentOrder.map(item => `
            <div class="order-item" data-id="${item.id}">
                <div class="order-item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${window.formatPrice(item.price)}</span>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" 
                            title="Giảm số lượng" aria-label="Giảm số lượng ${item.name}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" 
                            title="Tăng số lượng" aria-label="Tăng số lượng ${item.name}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-total">
                    <span>${window.formatPrice(item.price * item.quantity)}</span>
                    <button class="remove-btn" onclick="removeFromOrder(${item.id})" 
                            title="Xóa sản phẩm" aria-label="Xóa ${item.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        orderContainer.innerHTML = orderHTML;
        
        // Update preview if exists
        if (orderPreviewElement) {
            orderPreviewElement.innerHTML = orderHTML;
        }
        
        const total = window.calculateOrderTotal();
        const formattedTotal = window.formatPrice(total);
        
        if (orderTotalElement) orderTotalElement.textContent = formattedTotal;
        if (orderTotalPreviewElement) orderTotalPreviewElement.textContent = formattedTotal;
        
        window.updateAllUIStats();
        
        window.debugLog('✅ Order display updated successfully');
        return true;
        
    }, 'updateOrderDisplay') || false;
};

// =============================================================================
// INVOICE CREATION
// =============================================================================

/**
 * Create new invoice from current order
 */
window.createNewInvoice = function() {
    return window.withErrorHandling(() => {
        window.debugLog('📄 Creating new invoice...');
        
        // Validate current order
        if (!window.STATE.currentOrder || window.STATE.currentOrder.length === 0) {
            window.showNotification('Không có sản phẩm nào trong đơn hàng', 'warning');
            window.debugLog('⚠️ Cannot create invoice: empty order');
            return null;
        }
        
        // Calculate total
        const total = window.calculateOrderTotal();
        
        if (total <= 0) {
            window.showNotification('Tổng tiền phải lớn hơn 0', 'error');
            window.debugLog('⚠️ Cannot create invoice: invalid total');
            return null;
        }
        
        // Generate new invoice ID
        const invoiceId = window.generateId('INV');
        const now = new Date().toISOString();
        
        // Create invoice object
        const newInvoice = {
            id: invoiceId,
            items: [...window.STATE.currentOrder], // Create a copy
            total: total,
            createdAt: now,
            status: window.CONFIG?.INVOICE_STATUS?.PENDING || 'pending',
            customerName: '',
            notes: '',
            paymentMethod: '',
            employeeName: window.STATE.currentShiftEmployee || '',
            shiftId: window.STATE.shiftStartTime ? `SHIFT_${window.STATE.shiftStartTime}` : ''
        };
        
        // Add to invoices
        const added = window.addInvoice(newInvoice);
        
        if (!added) {
            window.showNotification('Lỗi tạo hóa đơn', 'error');
            return null;
        }
        
        // Clear current order
        window.STATE.currentOrder = [];
        window.updateOrderDisplay();
        
        // Set as current invoice for editing
        window.STATE.currentInvoiceId = invoiceId;
        
        window.debugLog(`✅ New invoice created: ${invoiceId}`);
        window.showNotification(`Đã tạo hóa đơn ${invoiceId}`, 'success');
        
        // Show payment modal or order confirmation if available
        setTimeout(() => {
            if (window.showOrderModal) {
                window.showOrderModal(invoiceId);
            } else if (window.showPaymentModal) {
                window.showPaymentModal(invoiceId);
            } else {
                window.showNotification('Hóa đơn đã được tạo và lưu', 'info');
            }
        }, 500);
        
        return invoiceId;
        
    }, 'createNewInvoice') || null;
};

// =============================================================================
// MENU RENDERING
// =============================================================================

/**
 * Render menu items
 */
window.renderMenu = function() {
    return window.withErrorHandling(() => {
        window.debugLog('🍽️ Rendering menu...');
        window.showLoadingScreen('Đang tải menu...', true);
        
        const menuContainer = window.safeGetElement('menu-grid', true);
        if (!menuContainer) {
            window.hideLoadingScreen();
            window.showNotification('Lỗi: Không tìm thấy container menu', 'error');
            return false;
        }
        
        // Use timeout to simulate loading and avoid blocking
        setTimeout(() => {
            window.renderMenuItems();
        }, 300);
        
        return true;
        
    }, 'renderMenu') || false;
};

/**
 * Render menu items with current category filter
 */
window.renderMenuItems = function() {
    return window.withErrorHandling(() => {
        const menuContainer = window.safeGetElement('menu-grid', true);
        if (!menuContainer) {
            window.hideLoadingScreen();
            return false;
        }
        
        let menuData = window.loadMenuData();
          // Validate menu data
        if (!window.validateMenuData(menuData)) {
            safeOrderError('❌ Invalid menu data loaded');
            menuData = window.CONFIG?.FALLBACK_MENU || [];
        }
        
        let filteredData = menuData;
        
        // Filter by category
        if (window.STATE.currentCategory && window.STATE.currentCategory !== 'all') {
            filteredData = menuData.filter(item => item.category === window.STATE.currentCategory);
            window.debugLog(`🏷️ Filtered by category "${window.STATE.currentCategory}": ${filteredData.length} items`);
        } else {
            window.debugLog(`🏷️ Showing all categories: ${filteredData.length} items`);
        }
        
        if (filteredData.length === 0) {
            menuContainer.innerHTML = `
                <div class="empty-menu">
                    <i class="fas fa-coffee"></i>
                    <p>Không có sản phẩm nào trong danh mục này</p>
                </div>
            `;
            window.hideLoadingScreen(300);
            return true;
        }
        
        menuContainer.innerHTML = filteredData.map(item => `
            <div class="menu-item" data-id="${item.id}" data-category="${item.category}">
                <div class="menu-item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    <span class="price">${window.formatPrice(item.price)}</span>
                </div>
                <button class="add-btn" onclick="addToOrder(${item.id})" 
                        title="Thêm ${item.name} vào đơn hàng"
                        aria-label="Thêm ${item.name} vào đơn hàng">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                    <span>Thêm</span>
                </button>
            </div>
        `).join('');
        
        window.debugLog(`✅ Menu rendered successfully: ${filteredData.length} items displayed`);
        window.hideLoadingScreen(300);
        
        window.updateCategoryCounts();
        
        return true;
        
    }, 'renderMenuItems') || false;
};

/**
 * Show all categories
 */
window.showAllCategories = function() {
    return window.withErrorHandling(() => {
        window.STATE.currentCategory = 'all';
        
        // Update active category button
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        const allCategoryBtn = document.querySelector('.category-btn[data-category="all"]');
        if (allCategoryBtn) {
            allCategoryBtn.classList.add('active');
            allCategoryBtn.setAttribute('aria-selected', 'true');
        }
        
        window.renderMenu();
        window.debugLog('🔄 Switched to all categories');
        
        return true;
        
    }, 'showAllCategories') || false;
};

// =============================================================================
// PLACEHOLDER FUNCTIONS FOR MODALS
// =============================================================================

/**
 * Placeholder functions that will be implemented in modal-manager.js
 */
window.showOrderModal = window.showOrderModal || function(invoiceId) {
    window.debugLog(`showOrderModal called with ${invoiceId}`);
    window.showNotification('Modal sẽ được triển khai trong modal-manager.js', 'info');
};

window.showPaymentModal = window.showPaymentModal || function(invoiceId) {
    window.debugLog(`showPaymentModal called with ${invoiceId}`);
    window.showNotification('Modal sẽ được triển khai trong modal-manager.js', 'info');
};

console.log('✅ BalanCoffee Order Manager loaded');

// Export Order Manager namespace
window.OrderManager = {
    // Order management
    addToOrder: window.addToOrder,
    updateOrderQuantity: window.updateOrderQuantity,
    removeFromOrder: window.removeFromOrder,
    clearOrder: window.clearOrder,
    
    // Order display
    updateOrderDisplay: window.updateOrderDisplay,
    calculateOrderTotal: window.calculateOrderTotal,
    
    // Menu display
    renderMenu: window.renderMenu,
    showAllCategories: window.showAllCategories,
    
    // Modal placeholders
    showOrderModal: window.showOrderModal,
    showPaymentModal: window.showPaymentModal
};
