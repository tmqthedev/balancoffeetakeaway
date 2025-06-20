// Global variables
let currentOrder = []; // Order hiện tại đang tạo
let invoices = []; // Danh sách tất cả hóa đơn
let currentInvoiceId = null; // ID hóa đơn đang được xem/chỉnh sửa
let currentCategory = 'all';
let isAdminMode = false;
let orderHistory = loadOrderHistory();


// Fallback menu data nếu data.js không load được
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

// Ensure menuData is available
function ensureMenuData() {
    if (!window.menuData || !Array.isArray(menuData) || menuData.length === 0) {
        console.warn('Using fallback menu data');
        window.menuData = fallbackMenuData;
        showNotification('Đang sử dụng menu mặc định. Một số món có thể không hiển thị.');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Initializing BalanCoffee app...');
        
        // Ensure menuData is available
        ensureMenuData();
        
        console.log('✅ menuData loaded successfully:', menuData.length, 'items');
        
        // Load data first
        invoices = loadInvoices();
        orderHistory = loadOrderHistory();
        
        console.log('✅ Data loaded - Invoices:', invoices.length, 'Orders:', orderHistory.length);
        
        // Migrate old invoices to include discount fields
        migrateInvoices();
        
        // Initialize sidebar as open by default
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (!sidebar) {
            console.error('❌ Sidebar element not found');
            showNotification('Lỗi: Không tìm thấy sidebar', 'error');
            return;
        }
        
        if (!mainContent) {
            console.error('❌ Main content element not found');
            showNotification('Lỗi: Không tìm thấy main content', 'error');
            return;
        }
        
        // Sidebar is open by default, main content has margin
        if (!sidebar.classList.contains('collapsed')) {
            // Sidebar is open, ensure main content has proper margin
            if (!mainContent.classList.contains('full-width')) {
                // Main content should have sidebar margin
            }
        }
        
        console.log('🎨 Rendering UI components...');
        renderMenu();
        updateInvoiceDisplay();
        updateInvoiceCount();
        loadTodaysSummary();
        
        // Add category filter event listeners
        const categoryButtons = document.querySelectorAll('.category-btn');
        if (categoryButtons.length === 0) {
            console.warn('⚠️ No category buttons found');
        } else {
            console.log('✅ Found', categoryButtons.length, 'category buttons');
        }
          categoryButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Set current category and render menu
                currentCategory = this.dataset.category;
                renderMenu();
            });
        });
        
        // Set today's date as default in date filter
        const today = new Date().toISOString().split('T')[0];
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.value = today;
            console.log('✅ Date filter set to:', today);
        } else {
            console.warn('⚠️ Date filter element not found');
        }
        
        // Add sample data if needed
        addSampleData();
        
        console.log('🎉 BalanCoffee app initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showNotification('Lỗi khởi tạo ứng dụng: ' + error.message, 'error');
    }
});

// Render menu items - Có thể chọn từ menu để thêm vào hóa đơn
// Cache for menu rendering optimization
let lastMenuState = null;

function renderMenu() {
    try {
        const menuGrid = document.getElementById('menu-grid');
        if (!menuGrid) {
            console.error('❌ Menu grid element not found');
            showNotification('Lỗi: Không tìm thấy menu grid', 'error');
            return;
        }
        
        const filteredMenu = getFilteredMenu();
        if (!filteredMenu || filteredMenu.length === 0) {
            console.warn('⚠️ No menu items found for current category:', currentCategory);
        }
    
    // Determine button text and state
    let buttonText, buttonClass, buttonDisabled;
    
    if (currentInvoiceId) {
        // Có hóa đơn đang được chọn/edit
        buttonText = 'Thêm';
        buttonClass = 'add-to-cart';
        buttonDisabled = '';
    } else {
        // Không có hóa đơn nào đang được chọn - cho phép tạo hóa đơn mới
        buttonText = 'Chọn món';
        buttonClass = 'add-to-cart';
        buttonDisabled = '';
    }
    
    // Create current state for comparison
    const currentState = {
        category: currentCategory,
        invoiceId: currentInvoiceId,
        menuLength: filteredMenu.length
    };
    
    // Check if re-render is needed
    if (lastMenuState && 
        lastMenuState.category === currentState.category &&
        lastMenuState.invoiceId === currentState.invoiceId &&
        lastMenuState.menuLength === currentState.menuLength) {
        return; // No change needed
    }
    
    lastMenuState = currentState;
    
    // Check if no results
    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-coffee"></i>
                <h3>Không tìm thấy kết quả</h3>
                <p>Không có món nào trong danh mục này</p>
            </div>
        `;
        return;
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    filteredMenu.forEach(item => {
        const menuCard = document.createElement('div');
        menuCard.className = 'menu-item-card';
        menuCard.dataset.category = item.category;
        
        menuCard.innerHTML = `
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">${formatPrice(item.price)}</span>
                    <button class="${buttonClass}" onclick="addToCurrentOrder(${item.id})" ${buttonDisabled}>
                        <i class="fas fa-plus"></i> ${buttonText}
                    </button>
                </div>
            </div>
        `;
        
        fragment.appendChild(menuCard);
    });
      // Clear and append new content
    menuGrid.innerHTML = '';
    menuGrid.appendChild(fragment);
    
    console.log('✅ Menu rendered successfully:', filteredMenu.length, 'items');
    
    } catch (error) {
        console.error('❌ Error rendering menu:', error);
        showNotification('Lỗi hiển thị menu: ' + error.message, 'error');
    }
}

// Get filtered menu items based on current category only
function getFilteredMenu() {
    // Đảm bảo menuData có sẵn
    ensureMenuData();
    
    let filteredMenu = currentCategory === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === currentCategory);
    
    return filteredMenu;
}

// Add item to current order - Tự động tạo hóa đơn mới nếu cần
function addToCurrentOrder(itemId) {
    try {
        // Đảm bảo menuData có sẵn
        ensureMenuData();
        
        const item = menuData.find(item => item.id === itemId);
        
        if (!item) {
            showNotification('Không tìm thấy món trong menu', 'error');
            return;
        }
        
        // Nếu không có hóa đơn nào đang được chọn/edit, tạo hóa đơn mới
        if (!currentInvoiceId) {
            createNewInvoiceWithItem(item);
            return;
        }
        
        // Nếu có hóa đơn đang chọn, thêm vào hóa đơn đó
        const invoiceIndex = invoices.findIndex(inv => inv.id === currentInvoiceId);
        if (invoiceIndex === -1) {
            // Hóa đơn không tồn tại, tạo mới
            createNewInvoiceWithItem(item);
            return;
        }
        
        const invoice = invoices[invoiceIndex];
        
        // Kiểm tra nếu hóa đơn đã được thanh toán
        if (invoice.status === 'paid') {
            showNotification('Không thể thêm món vào hóa đơn đã thanh toán', 'warning');
            return;
        }
        
        // Kiểm tra xem món đã có trong hóa đơn chưa
        const existingItemIndex = invoice.items.findIndex(invItem => invItem.id === item.id);
        
        if (existingItemIndex !== -1) {
            // Món đã có, tăng số lượng
            invoice.items[existingItemIndex].quantity += 1;
            showNotification(`Đã tăng số lượng ${item.name}`);
        } else {
            // Món chưa có, thêm mới
            invoice.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
            showNotification(`Đã thêm ${item.name} vào hóa đơn`);
        }
        
        // Cập nhật tổng tiền
        updateInvoiceTotals(invoice);
          // Lưu và cập nhật hiển thị
        saveInvoices();
        batchUpdate({ invoiceDisplay: true, menu: true, invoiceCount: true });
    } catch (error) {
        console.error('Error adding item to order:', error);
        showNotification('Lỗi khi thêm món vào hóa đơn', 'error');
    }
}

// Create new invoice with first item
function createNewInvoiceWithItem(item) {
    const newInvoiceId = generateInvoiceId();
    const newInvoice = {
        id: newInvoiceId,
        items: [{
            ...item,
            quantity: 1
        }],
        subtotal: item.price,
        discount: 0,
        discountType: 'percent', // 'percent' or 'fixed'
        total: item.price,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to invoices array
    invoices.push(newInvoice);
    
    // Set as current
    currentInvoiceId = newInvoiceId;
    
    // Save and refresh    // Lưu và cập nhật hiển thị
    saveInvoices();
    batchUpdate({ invoiceDisplay: true, menu: true, invoiceCount: true });
    
    showNotification(`Đã tạo hóa đơn mới #${newInvoiceId} với ${item.name}`);
}

// Create new invoice
function createNewInvoice() {
    // Tạo hóa đơn trống mới
    const newInvoiceId = generateInvoiceId();
    const newInvoice = {
        id: newInvoiceId,
        items: [],
        subtotal: 0,
        discount: 0,
        discountType: 'percent', // 'percent' or 'fixed'
        total: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Thêm vào danh sách hóa đơn
    invoices.push(newInvoice);
    
    // Set làm hóa đơn hiện tại để có thể thêm món
    currentInvoiceId = newInvoiceId;
    currentOrder = [];
    
    // Lưu và cập nhật hiển thị    // Cập nhật và lưu
    saveInvoices();
    batchUpdate({ invoiceDisplay: true, menu: true, invoiceCount: true });
    
    showNotification(`Đã tạo hóa đơn mới #${newInvoiceId}. Hãy chọn món từ menu.`);
}

// Open order modal
function openOrderModal() {
    try {
        const modal = document.getElementById('order-modal');
        const title = document.getElementById('order-modal-title');
        const deleteBtn = document.getElementById('delete-invoice-btn');
        
        if (!modal) {
            console.error('❌ Order modal element not found');
            showNotification('Lỗi: Không tìm thấy modal order', 'error');
            return;
        }
        
        if (!title) {
            console.error('❌ Order modal title element not found');
            showNotification('Lỗi: Không tìm thấy title modal', 'error');
            return;
        }
        
        if (currentInvoiceId) {
            // Editing existing invoice
            title.textContent = `Chỉnh sửa hóa đơn #${currentInvoiceId}`;
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice) {
                currentOrder = [...invoice.items];
            }
            if (deleteBtn) deleteBtn.style.display = 'inline-block';
        } else {
            // Creating new invoice
            title.textContent = 'Tạo hóa đơn mới';
            if (deleteBtn) deleteBtn.style.display = 'none';
        }
        
        updateOrderModal();
        modal.classList.add('show');
        
        // Cập nhật text nút trong menu
        renderMenu();
        
        console.log('✅ Order modal opened successfully');
    } catch (error) {
        console.error('❌ Error opening order modal:', error);
        showNotification('Lỗi mở modal đặt hàng: ' + error.message, 'error');
    }
}

// Close order modal
function closeOrderModal() {
    try {
        const modal = document.getElementById('order-modal');
        if (!modal) {
            console.error('❌ Order modal element not found');
            return;
        }
        
        modal.classList.remove('show');
        currentOrder = [];
        currentInvoiceId = null;
        
        // Cập nhật lại text nút trong menu
        renderMenu();
        
        console.log('✅ Order modal closed successfully');
    } catch (error) {
        console.error('❌ Error closing order modal:', error);
        showNotification('Lỗi đóng modal đặt hàng: ' + error.message, 'error');
    }
}

// Update order modal display
function updateOrderModal() {
    try {
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        const confirmBtn = document.getElementById('confirm-order-btn');
        const paymentBtn = document.getElementById('payment-btn');
        const actionText = document.getElementById('order-action-text');
        
        if (!orderItems || !orderTotal || !confirmBtn) {
            console.error('❌ Order modal elements not found');
            showNotification('Lỗi: Không tìm thấy elements của modal order', 'error');
            return;
        }
        
        if (currentOrder.length === 0) {
            orderItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coffee"></i>
                    <p>Chưa có thức uống nào được chọn</p>
                </div>
            `;
            confirmBtn.disabled = true;
            orderTotal.textContent = '0₫';
            return;
        }
        
        orderItems.innerHTML = currentOrder.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <h5>${item.name} ${item.isManual ? '(Thủ công)' : ''}</h5>
                <p>${formatPrice(item.price)}</p>
            </div>
            <div class="order-item-controls">
                <button class="quantity-btn" onclick="updateOrderQuantity('${item.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateOrderQuantity('${item.id}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-item-btn" onclick="removeFromOrder('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
        
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);        orderTotal.textContent = formatPrice(total);
        confirmBtn.disabled = false;
    
        // Cập nhật nút action dựa trên trạng thái
        if (currentInvoiceId) {
            const invoice = invoices.find(inv => inv.id === currentInvoiceId);
            if (invoice && invoice.status === 'pending') {
                if (actionText) actionText.textContent = 'Cập nhật hóa đơn';
                if (paymentBtn) paymentBtn.style.display = 'inline-block';
            } else {
                if (actionText) actionText.textContent = 'Cập nhật hóa đơn';
                if (paymentBtn) paymentBtn.style.display = 'none';
            }
        } else {
            if (actionText) actionText.textContent = 'Tạo hóa đơn';
            if (paymentBtn) paymentBtn.style.display = 'none';
        }
        
        console.log('✅ Order modal updated successfully');
    } catch (error) {
        console.error('❌ Error updating order modal:', error);
        showNotification('Lỗi cập nhật modal đặt hàng: ' + error.message, 'error');
    }
}

// Update quantity in current order
function updateOrderQuantity(itemId, change) {
    try {
        const item = currentOrder.find(orderItem => orderItem.id == itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromOrder(itemId);
            } else {
                updateOrderModal();
            }
        } else {
            console.warn('⚠️ Item not found in current order:', itemId);
            showNotification('Không tìm thấy món trong đơn hàng', 'warning');
        }
    } catch (error) {
        console.error('❌ Error updating order quantity:', error);
        showNotification('Lỗi cập nhật số lượng: ' + error.message, 'error');
    }
}

// Remove item from current order
function removeFromOrder(itemId) {
    try {
        const initialLength = currentOrder.length;
        currentOrder = currentOrder.filter(item => item.id != itemId);
        
        if (currentOrder.length === initialLength) {
            console.warn('⚠️ Item not found for removal:', itemId);
            showNotification('Không tìm thấy món để xóa', 'warning');
            return;
        }
        
        updateOrderModal();
        console.log('✅ Item removed from order:', itemId);
    } catch (error) {
        console.error('❌ Error removing item from order:', error);
        showNotification('Lỗi xóa món khỏi đơn hàng: ' + error.message, 'error');
    }
}

// Confirm order (create or update invoice)
function confirmOrder() {
    if (currentOrder.length === 0) return;
    
    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (currentInvoiceId) {
        // Update existing invoice
        const invoiceIndex = invoices.findIndex(inv => inv.id === currentInvoiceId);
        if (invoiceIndex !== -1) {
            invoices[invoiceIndex] = {
                ...invoices[invoiceIndex],
                items: [...currentOrder],
                total: total,
                updatedAt: new Date().toISOString()
            };
        }
        showNotification('Đã cập nhật hóa đơn');
    } else {
        // Create new invoice
        const newInvoice = {
            id: generateInvoiceId(),
            items: [...currentOrder],
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        invoices.push(newInvoice);
        showNotification('Đã tạo hóa đơn mới');
    }
    
    saveInvoices();
    updateInvoiceDisplay();
    updateInvoiceCount();
    closeOrderModal();
}

// Proceed to payment
function proceedToPayment() {
    if (currentInvoiceId) {
        const invoice = invoices.find(inv => inv.id === currentInvoiceId);
        if (invoice) {
            closeOrderModal();
            openPaymentModal(invoice);
        }
    }
}

// Open payment modal
function openPaymentModal(invoice, isViewOnly = false) {
    try {
        const modal = document.getElementById('payment-modal');
        const modalTitle = document.getElementById('payment-modal-title');
        const orderSummary = document.getElementById('payment-order-summary');
        const paymentTotal = document.getElementById('payment-total');
        
        if (!modal) {
            console.error('❌ Payment modal element not found');
            showNotification('Lỗi: Không tìm thấy modal thanh toán', 'error');
            return;
        }
        
        if (!invoice) {
            console.error('❌ Invoice data not provided');
            showNotification('Lỗi: Không có dữ liệu hóa đơn', 'error');
            return;
        }
        
        if (!modalTitle || !orderSummary || !paymentTotal) {
            console.error('❌ Payment modal elements not found');
            showNotification('Lỗi: Không tìm thấy elements của modal thanh toán', 'error');
            return;
        }
        
        // Set modal title with invoice ID
        modalTitle.textContent = isViewOnly ? 
            `Chi tiết hóa đơn #${invoice.id}` : 
            `Thanh toán hóa đơn #${invoice.id}`;
          // Generate detailed invoice display
        const invoiceDate = new Date(invoice.createdAt);
        const formattedDate = invoiceDate.toLocaleDateString('vi-VN');
        const formattedTime = invoiceDate.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        orderSummary.innerHTML = `
        <div class="invoice-info">
            <div class="invoice-meta">
                <p><strong>Hóa đơn #${invoice.id}</strong></p>
                <p>Ngày: ${formattedDate} - ${formattedTime}</p>
                <p>Trạng thái: <span class="status ${invoice.status}">${invoice.status === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}</span></p>
                ${invoice.status === 'paid' && invoice.paidAt ? 
                    `<p>Thanh toán lúc: ${formatDateTime(invoice.paidAt)}</p>` : ''
                }
            </div>            <div class="invoice-items">
                <h5>Chi tiết món:</h5>
                ${invoice.items.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-detail">${formatPrice(item.price)} x ${item.quantity}</span>
                        </div>
                        <span class="item-total">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                  ${invoice.discount > 0 ? (() => {
                    const calculation = calculateInvoiceTotal(invoice);
                    const discountLabel = invoice.discountType === 'percent' ? ` (${invoice.discount}%)` : '';
                    return `
                    <div class="payment-discount-info">
                        <div class="payment-subtotal">
                            <span>Tạm tính:</span>
                            <span>${formatPrice(calculation.subtotal)}</span>
                        </div>
                        <div class="payment-discount">
                            <span>Chiết khấu${discountLabel}:</span>
                            <span>-${formatPrice(calculation.discountAmount)}</span>
                        </div>
                    </div>
                    `;
                })() : ''}
            </div>
        </div>
    `;
    
    paymentTotal.textContent = formatPrice(invoice.total);
    
    // Set payment actions based on view mode
    const paymentActions = document.querySelector('.payment-actions');
    if (paymentActions) {
        if (isViewOnly || invoice.status === 'paid') {
            paymentActions.innerHTML = `
                <div class="paid-invoice-info">
                    <i class="fas fa-check-circle" style="color: #28a745; margin-right: 0.5rem;"></i>
                    <span style="color: #28a745; font-weight: 500;">Hóa đơn này đã được thanh toán</span>
                </div>
            `;
        } else {
            paymentActions.innerHTML = `
                <button class="btn btn-success btn-full" onclick="confirmPayment()">
                    Xác nhận đã thanh toán
                </button>
            `;
        }
    }
    
    // Generate QR code if image fails to load (only for payment)    if (!isViewOnly && invoice.status === 'pending') {
        const qrImage = document.getElementById('qr-image');
        if (qrImage) {
            qrImage.onerror = function() {
                this.style.display = 'none';
                const qrFallback = document.getElementById('qr-fallback');
                if (qrFallback) {
                    qrFallback.style.display = 'block';
                    generateQRCode(invoice.total);
                }
            };
        }
    }
      // Store current invoice for payment confirmation
    window.currentPaymentInvoice = invoice;
    
    modal.classList.add('show');
    
    console.log('✅ Payment modal opened successfully:', isViewOnly ? 'view-only' : 'payment');
    } catch (error) {
        console.error('❌ Error opening payment modal:', error);
        showNotification('Lỗi mở modal thanh toán: ' + error.message, 'error');
    }
}

// Generate QR code for payment
function generateQRCode(amount) {
    const canvas = document.getElementById('qr-code');
    const qrContent = `${qrPaymentInfo.bankName}|${qrPaymentInfo.accountNumber}|${qrPaymentInfo.accountHolder}|${amount}|${qrPaymentInfo.content}`;
    
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(canvas, qrContent, {
            width: 200,
            height: 200,
            colorDark: '#8B4513',
            colorLight: '#ffffff'
        }, function (error) {
            if (error) console.error(error);
        });
    }
}

// Confirm payment
function confirmPayment() {
    if (window.currentPaymentInvoice) {
        const invoiceIndex = invoices.findIndex(inv => inv.id === window.currentPaymentInvoice.id);
        if (invoiceIndex !== -1) {
            invoices[invoiceIndex].status = 'paid';
            invoices[invoiceIndex].paidAt = new Date().toISOString();
            
            // Add to order history for reporting
            orderHistory.push({
                id: invoices[invoiceIndex].id,
                items: invoices[invoiceIndex].items,
                total: invoices[invoiceIndex].total,
                timestamp: invoices[invoiceIndex].paidAt,
                status: 'paid'
            });
            
            saveInvoices();
            saveOrderHistory();
            updateInvoiceDisplay();
            
            // Update admin summary if in admin mode
            if (isAdminMode) {
                loadTodaysSummary();
            }
            
            showNotification('Thanh toán thành công!');
        }
    }
    
    closePaymentModal();
    showSuccessModal();
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('show');
    window.currentPaymentInvoice = null;
}

// Show success modal
function showSuccessModal() {
    document.getElementById('success-modal').classList.add('show');
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('show');
}

// Update invoice display in sidebar
function updateInvoiceDisplay() {
    try {
        const invoiceList = document.getElementById('invoice-list');
        
        if (!invoiceList) {
            console.error('❌ Invoice list element not found');
            showNotification('Lỗi: Không tìm thấy danh sách hóa đơn', 'error');
            return;
        }
        
        if (invoices.length === 0) {
            invoiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Chưa có hóa đơn nào</p>
                </div>
            `;
            console.log('✅ Displayed empty invoice state');
            return;
        }
        
        // Sort invoices by creation date (newest first)
        const sortedInvoices = [...invoices].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );    invoiceList.innerHTML = sortedInvoices.map(invoice => `
        <div class="invoice-item ${currentInvoiceId === invoice.id ? 'active' : ''}" 
             data-invoice-id="${invoice.id}">
            <div class="invoice-header" onclick="selectInvoice('${invoice.id}')">
                <span class="invoice-id">Hóa đơn #${invoice.id}</span>
                <span class="invoice-status ${invoice.status}">
                    ${invoice.status === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                </span>
                <button class="invoice-expand-toggle" onclick="event.stopPropagation(); toggleInvoiceExpand('${invoice.id}')" title="Xem chi tiết">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>            <div class="invoice-details">
                <p>Số món: ${invoice.items.length > 0 ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0}</p>
                <p>Thời gian: ${formatDateTime(invoice.createdAt)}</p>
                ${invoice.items.length === 0 ? 
                    `<p style="color: #f39c12; font-style: italic;">Hóa đơn trống - chọn món từ menu</p>` : ''
                }
                ${invoice.status === 'paid' && invoice.paidAt ? 
                    `<p>Thanh toán: ${formatDateTime(invoice.paidAt)}</p>` : ''
                }
            </div>            <div class="invoice-total">
                ${(() => {
                    if (invoice.discount > 0) {
                        const calculation = calculateInvoiceTotal(invoice);
                        const discountLabel = invoice.discountType === 'percent' ? ` (${invoice.discount}%)` : '';
                        return `
                            <div class="invoice-pricing-breakdown">
                                <div class="subtotal">Tạm tính: ${formatPrice(invoice.subtotal || invoice.total)}</div>
                                <div class="discount">
                                    Chiết khấu: -${formatPrice(calculation.discountAmount)}${discountLabel}
                                </div>
                                <div class="final-total">Thành tiền: ${formatPrice(invoice.total)}</div>
                            </div>
                        `;
                    } else {
                        return `Tổng: ${formatPrice(invoice.total)}`;
                    }
                })()}
            </div><div class="invoice-actions">
                ${generateInvoiceActions(invoice)}
            </div>
            
            <!-- Expandable Content -->
            <div class="invoice-expandable">
                <div class="invoice-content">
                    <h4>Chi tiết đơn hàng</h4>                    <div class="invoice-items-list">                        ${invoice.items.length > 0 ? 
                            invoice.items.map(item => {
                                // Cho phép giảm xuống 0 để xóa món
                                return `
                                <div class="invoice-item-row">
                                    <div class="invoice-item-info">
                                        <div class="invoice-item-name">${item.name}</div>
                                        <div class="invoice-item-price">${formatPrice(item.price)}</div>
                                    </div>                                    <div class="invoice-item-quantity">
                                        ${invoice.status === 'pending' ? 
                                            `<button class="quantity-btn" onclick="event.stopPropagation(); updateItemQuantity('${invoice.id}', ${item.id}, -1)" title="Giảm số lượng (giảm về 0 sẽ xóa món)">
                                                <i class="fas fa-minus"></i>
                                            </button>
                                            <span>${item.quantity}</span>
                                            <button class="quantity-btn" onclick="event.stopPropagation(); updateItemQuantity('${invoice.id}', ${item.id}, 1)">
                                                <i class="fas fa-plus"></i>
                                            </button>` :
                                            `<span class="quantity-display">x${item.quantity}</span>`
                                        }
                                    </div>
                                </div>
                                `;
                            }).join('') :
                            `<div class="empty-invoice-items">
                                <i class="fas fa-coffee" style="font-size: 2rem; color: #ccc; margin-bottom: 0.5rem;"></i>
                                <p style="color: #666; text-align: center;">Chưa có món nào. Hãy chọn từ menu.</p>
                            </div>`                        }                    </div>
                      ${invoice.status === 'pending' ? (() => {
                        const percentSelected = invoice.discountType === 'percent' ? 'selected' : '';
                        const fixedSelected = invoice.discountType === 'fixed' ? 'selected' : '';
                        const hasDiscount = invoice.discount > 0;
                          return `
                        <div class="discount-section">
                            <h5>Chiết khấu</h5>
                            <div class="discount-controls">
                                <div class="discount-presets">
                                    <button class="btn-preset" onclick="event.stopPropagation(); applyDiscount('${invoice.id}', 5, 'percent')">5%</button>
                                    <button class="btn-preset" onclick="event.stopPropagation(); applyDiscount('${invoice.id}', 10, 'percent')">10%</button>
                                    <button class="btn-preset" onclick="event.stopPropagation(); applyDiscount('${invoice.id}', 15, 'percent')">15%</button>
                                    <button class="btn-preset" onclick="event.stopPropagation(); applyDiscount('${invoice.id}', 20, 'percent')">20%</button>
                                </div>
                                <div class="discount-input-group">
                                    <input type="number" 
                                           id="discount-${invoice.id}" 
                                           placeholder="Nhập chiết khấu"
                                           value="${invoice.discount || ''}"
                                           min="0"
                                           step="0.01"
                                           onclick="event.stopPropagation()">
                                    <select id="discount-type-${invoice.id}" onclick="event.stopPropagation()">
                                        <option value="percent" ${percentSelected}>%</option>
                                        <option value="fixed" ${fixedSelected}>VNĐ</option>
                                    </select>
                                </div>
                                <div class="discount-buttons">
                                    <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); applyDiscountFromUI('${invoice.id}')">
                                        <i class="fas fa-percent"></i> Áp dụng
                                    </button>
                                    ${hasDiscount ? `
                                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); removeDiscount('${invoice.id}')">
                                            <i class="fas fa-times"></i> Xóa
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        `;
                    })() : ''}
                    
                    <div class="invoice-content-actions">
                        ${generateInvoiceContentActions(invoice)}
                    </div>
                </div>
            </div>
        </div>    `).join('');
    
    // Show/hide sidebar controls based on selection
    const sidebarControls = document.getElementById('sidebar-controls');
    if (sidebarControls) {
        if (currentInvoiceId) {
            sidebarControls.style.display = 'block';
        } else {
            sidebarControls.style.display = 'none';
        }
    } else {
        console.warn('⚠️ Sidebar controls element not found');
    }
    
    console.log('✅ Invoice display updated:', invoices.length, 'invoices');
    
    } catch (error) {
        console.error('❌ Error updating invoice display:', error);
        showNotification('Lỗi cập nhật danh sách hóa đơn: ' + error.message, 'error');
    }
}

// Generate invoice action buttons based on status and edit state
function generateInvoiceActions(invoice) {
    if (invoice.status === 'paid') {
        return `
            <button class="btn-view" onclick="event.stopPropagation(); viewInvoice('${invoice.id}')" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                <i class="fas fa-trash"></i>
            </button>
            <span class="paid-badge">
                <i class="fas fa-check-circle"></i> Đã thanh toán
            </span>
        `;
    }
      // Pending invoice
    if (currentInvoiceId === invoice.id) {
        // Đang chỉnh sửa hóa đơn này
        return `
            <button class="btn-cancel" onclick="event.stopPropagation(); cancelEdit()" title="Hủy chỉnh sửa">
                <i class="fas fa-times"></i> Hủy
            </button>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn-pay" onclick="event.stopPropagation(); processPayment('${invoice.id}')" title="Thanh toán">
                <i class="fas fa-credit-card"></i>
            </button>
        `;
    } else {
        // Chưa chỉnh sửa
        return `
            <button class="btn-edit" onclick="event.stopPropagation(); editInvoice('${invoice.id}')" title="Chỉnh sửa hóa đơn">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn-pay" onclick="event.stopPropagation(); processPayment('${invoice.id}')" title="Thanh toán">
                <i class="fas fa-credit-card"></i>
            </button>
        `;
    }
}

// Generate invoice content actions based on status and items
function generateInvoiceContentActions(invoice) {
    if (invoice.status === 'paid') {
        return `
            <div class="paid-status-info">
                <i class="fas fa-check-circle" style="color: #28a745; margin-right: 0.5rem;"></i>
                <span style="color: #28a745; font-weight: 500;">Hóa đơn đã thanh toán</span>
            </div>
        `;
    }
      // Pending invoice
    if (invoice.items.length > 0) {
        // Có món, cho phép thanh toán
        return `
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="addMoreItems('${invoice.id}')">
                    <i class="fas fa-plus"></i> Thêm món
                </button>
                <button class="btn btn-success btn-sm" onclick="processPayment('${invoice.id}')">
                    <i class="fas fa-credit-card"></i> Thanh toán
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        `;
    } else {
        // Chưa có món, chỉ cho thêm món
        return `
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="addMoreItems('${invoice.id}')">
                    <i class="fas fa-plus"></i> Thêm món
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteInvoiceById('${invoice.id}')" title="Xóa hóa đơn">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
            <p style="color: #666; font-size: 0.85rem; margin: 0.5rem 0; text-align: center;">
                Cần có ít nhất 1 món để thanh toán
            </p>
        `;
    }
}

// Edit specific invoice
function editInvoice(invoiceId) {
    console.log('Editing invoice:', invoiceId);
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    if (invoice.status === 'paid') {
        showNotification('Không thể chỉnh sửa hóa đơn đã thanh toán');
        return;
    }
    
    // Toggle edit mode
    if (currentInvoiceId === invoiceId) {
        // Đang edit hóa đơn này, hủy edit
        cancelEdit();
        return;
    }
    
    // Chọn hóa đơn để chỉnh sửa (không mở modal)
    currentInvoiceId = invoiceId;
    currentOrder = [...invoice.items];
    
    // Cập nhật hiển thị sidebar và menu    // Cập nhật hiển thị
    batchUpdate({ invoiceDisplay: true, menu: true });
    
    showNotification(`Đang chỉnh sửa hóa đơn #${invoiceId}. Có thể thêm món từ menu.`);
}

// Process payment for specific invoice
function processPayment(invoiceId) {
    console.log('Processing payment for invoice:', invoiceId);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    if (invoice.status === 'paid') {
        showNotification('Hóa đơn này đã được thanh toán');
        return;
    }
    
    // Mở modal thanh toán với hóa đơn cụ thể
    openPaymentModal(invoice);
}

// Select invoice from sidebar
function selectInvoice(invoiceId) {
    console.log('Selecting invoice:', invoiceId);
    
    // Toggle selection
    if (currentInvoiceId === invoiceId) {
        // Deselect if clicking the same invoice
        currentInvoiceId = null;
        showNotification('Đã hủy chọn hóa đơn');
    } else {
        // Select new invoice
        currentInvoiceId = invoiceId;
        showNotification(`Đã chọn hóa đơn #${invoiceId}. Có thể thêm món từ menu.`);
    }    
    batchUpdate({ invoiceDisplay: true, menu: true });
}

// Deselect current invoice
function deselectInvoice() {    currentInvoiceId = null;
    currentOrder = [];
    batchUpdate({ invoiceDisplay: true, menu: true });
    showNotification('Đã hủy chọn hóa đơn');
}

// Delete invoice by ID
function deleteInvoiceById(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hóa đơn #${invoiceId}?`);
    
    if (confirmDelete) {
        // Remove from invoices array
        invoices = invoices.filter(inv => inv.id !== invoiceId);
        
        // If was paid, also remove from order history
        if (invoice.status === 'paid') {
            orderHistory = orderHistory.filter(order => order.id !== invoiceId);
            saveOrderHistory();
        }
          // If this was the selected invoice, deselect
        if (currentInvoiceId === invoiceId) {
            currentInvoiceId = null;
            currentOrder = [];
        }
        
        // Save and refresh
        saveInvoices();        batchUpdate({ invoiceDisplay: true, menu: true, invoiceCount: true });
        loadTodaysSummary();
        
        showNotification(`Đã xóa hóa đơn #${invoiceId}`);
    }
}

// Toggle sidebar
function toggleSidebar() {
    try {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (!sidebar) {
            console.error('❌ Sidebar element not found');
            showNotification('Lỗi: Không tìm thấy sidebar', 'error');
            return;
        }
        
        if (!mainContent) {
            console.error('❌ Main content element not found');
            showNotification('Lỗi: Không tìm thấy main content', 'error');
            return;
        }
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('full-width');
        
        console.log('✅ Sidebar toggled successfully');
    } catch (error) {
        console.error('❌ Error toggling sidebar:', error);
        showNotification('Lỗi toggle sidebar: ' + error.message, 'error');
    }
}

// Toggle admin mode
function toggleAdmin() {
    try {
        isAdminMode = !isAdminMode;
        const adminSection = document.getElementById('admin-section');
        const menuSection = document.querySelector('.menu-section');
        const adminBtn = document.querySelector('[onclick="toggleAdmin()"]');
        
        if (isAdminMode) {
            if (adminSection) {
                adminSection.style.display = 'block';
            } else {
                console.warn('⚠️ Admin section element not found');
            }
            if (menuSection) {
                menuSection.style.display = 'none';
            } else {
                console.warn('⚠️ Menu section element not found');
            }
            if (adminBtn) adminBtn.textContent = 'Quay lại Menu';
            loadAdminData();
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

// Load admin data
function loadAdminData() {
    // Reload dữ liệu từ localStorage
    orderHistory = loadOrderHistory();
    
    // Set ngày hiện tại làm mặc định
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter && !dateFilter.value) {
        const today = new Date().toISOString().split('T')[0];
        dateFilter.value = today;
    }
    
    // Filter và hiển thị dữ liệu
    filterByDate();
}

// Filter orders by date
function filterByDate() {
    const dateFilter = document.getElementById('date-filter');
    if (!dateFilter) return;
    
    const selectedDate = dateFilter.value;
    if (!selectedDate) return;
    
    // Đảm bảo orderHistory đã được load
    if (!orderHistory || orderHistory.length === 0) {
        orderHistory = loadOrderHistory();
    }
    
    const filteredOrders = orderHistory.filter(order => {
        if (!order.timestamp) return false;
        const orderDate = order.timestamp.split('T')[0];
        return orderDate === selectedDate;
    });
    
    updateSummaryCards(filteredOrders);
    displayOrderHistory(filteredOrders);
}

// Update summary cards
function updateSummaryCards(orders) {
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
      const bestSeller = Object.keys(itemCount).length > 0 
        ? Object.keys(itemCount).reduce((a, b) => itemCount[a] > itemCount[b] ? a : b, Object.keys(itemCount)[0])
        : '-';
    
    // Cập nhật DOM elements một cách an toàn
    const totalOrdersEl = document.getElementById('total-orders');
    const totalRevenueEl = document.getElementById('total-revenue');
    const bestSellerEl = document.getElementById('best-seller');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = formatPrice(totalRevenue);
    if (bestSellerEl) bestSellerEl.textContent = bestSeller;
}

// Display order history
function displayOrderHistory(orders) {
    const historyList = document.getElementById('order-history-list');
    
    if (!historyList) {
        console.log('Element order-history-list not found');
        return;
    }
    
    if (!orders || orders.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Không có đơn hàng nào trong ngày này</p>';
        return;
    }
    
    historyList.innerHTML = orders.map(order => {
        const orderDate = order.timestamp ? formatDateTime(order.timestamp) : 'Không rõ';
        const orderItems = order.items && Array.isArray(order.items) 
            ? order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')
            : 'Không có món nào';
        
        return `
            <div class="order-history-item">
                <h4>Đơn hàng #${order.id}</h4>
                <p><strong>Thời gian:</strong> ${orderDate}</p>
                <p><strong>Tổng tiền:</strong> ${formatPrice(order.total || 0)}</p>
                <p><strong>Món:</strong> ${orderItems}</p>
                <p><strong>Trạng thái:</strong> <span class="status ${order.status}">${order.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>
            </div>
        `;
    }).join('');
}

// Load today's summary
function loadTodaysSummary() {
    // Đảm bảo orderHistory đã được load
    if (!orderHistory || orderHistory.length === 0) {
        orderHistory = loadOrderHistory();
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orderHistory.filter(order => {
        if (!order.timestamp) return false;
        const orderDate = order.timestamp.split('T')[0];
        return orderDate === today;
    });
    
    updateSummaryCards(todayOrders);
}

// Export data
function exportData() {
    const dateFilter = document.getElementById('date-filter');
    if (!dateFilter) {
        showNotification('Không tìm thấy bộ lọc ngày');
        return;
    }
    
    const selectedDate = dateFilter.value;
    if (!selectedDate) {
        showNotification('Vui lòng chọn ngày để xuất báo cáo');
        return;
    }
    
    // Đảm bảo orderHistory đã được load
    if (!orderHistory || orderHistory.length === 0) {
        orderHistory = loadOrderHistory();
    }
    
    const filteredOrders = orderHistory.filter(order => {
        if (!order.timestamp) return false;
        const orderDate = order.timestamp.split('T')[0];
        return orderDate === selectedDate;
    });
    
    const exportData = {
        date: selectedDate,
        summary: {
            totalOrders: filteredOrders.length,
            totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
        },
        orders: filteredOrders
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `balancoffee-report-${selectedDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Đã xuất báo cáo thành công');
}

// Delete invoice
function deleteInvoice() {
    if (!currentInvoiceId) return;
    
    const invoice = invoices.find(inv => inv.id === currentInvoiceId);
    if (!invoice) return;
    
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa hóa đơn #${currentInvoiceId}?`);
    
    if (confirmDelete) {
        // Xóa khỏi danh sách hóa đơn
        invoices = invoices.filter(inv => inv.id !== currentInvoiceId);
        
        // Nếu đã thanh toán, cũng xóa khỏi lịch sử
        if (invoice.status === 'paid') {
            orderHistory = orderHistory.filter(order => order.id !== currentInvoiceId);
            saveOrderHistory();
        }
        
        saveInvoices();
        updateInvoiceDisplay();
        updateInvoiceCount();
        closeOrderModal();
        
        showNotification('Đã xóa hóa đơn thành công');
    }
}

// Toggle invoice expand/collapse
function toggleInvoiceExpand(invoiceId) {
    console.log('Toggling expand for invoice:', invoiceId);
    const invoiceElement = document.querySelector(`[data-invoice-id="${invoiceId}"]`);
    
    if (invoiceElement) {
        invoiceElement.classList.toggle('expanded');
    }
}

// Update item quantity in invoice
function updateItemQuantity(invoiceId, itemId, change) {
    console.log('Updating item quantity:', invoiceId, itemId, change);
    
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex === -1) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    const invoice = invoices[invoiceIndex];
    const itemIndex = invoice.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
        showNotification('Không tìm thấy món trong hóa đơn');
        return;
    }
    
    const newQuantity = invoice.items[itemIndex].quantity + change;
    
    if (newQuantity <= 0) {
        // Remove item if quantity becomes 0
        invoice.items.splice(itemIndex, 1);
        showNotification('Đã xóa món khỏi hóa đơn');
    } else {
        // Update quantity
        invoice.items[itemIndex].quantity = newQuantity;
    }
      // Recalculate total
    updateInvoiceTotals(invoice);
    
    // Save to localStorage and refresh display
    saveInvoices();
    updateInvoiceDisplay();
    updateInvoiceCount();
    
    showNotification('Đã cập nhật số lượng');
}

// Add more items to existing invoice
function addMoreItems(invoiceId) {
    console.log('Adding more items to invoice:', invoiceId);
    currentInvoiceId = invoiceId;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    // Set current invoice as selected and update display
    updateInvoiceDisplay();
    
    showNotification(`Hóa đơn #${invoiceId} đã được chọn. Hãy chọn món từ menu để thêm.`);
}

// View invoice details (for paid invoices)
function viewInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    // Open payment modal in view-only mode
    openPaymentModal(invoice, true);
}

// Cancel editing current invoice
function cancelEdit() {
    if (currentInvoiceId) {
        currentInvoiceId = null;
        currentOrder = [];
          batchUpdate({ invoiceDisplay: true, menu: true });
        
        showNotification('Đã hủy chỉnh sửa hóa đơn');
    }
}

// Apply discount to invoice
function applyDiscount(invoiceId, discountValue, discountType = 'percent') {
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex === -1) {
        showNotification('Không tìm thấy hóa đơn');
        return;
    }
    
    const invoice = invoices[invoiceIndex];
    
    // Kiểm tra nếu hóa đơn đã được thanh toán
    if (invoice.status === 'paid') {
        showNotification('Không thể áp dụng chiết khấu cho hóa đơn đã thanh toán');
        return;
    }
    
    // Validate discount value
    const discount = parseFloat(discountValue) || 0;
    if (discount < 0) {
        showNotification('Chiết khấu không thể âm');
        return;
    }
    
    if (discountType === 'percent' && discount > 100) {
        showNotification('Chiết khấu phần trăm không thể vượt quá 100%');
        return;
    }
    
    // Apply discount
    invoice.discount = discount;
    invoice.discountType = discountType;
    
    // Recalculate totals
    const calculation = updateInvoiceTotals(invoice);
    
    // Save and refresh
    saveInvoices();
    updateInvoiceDisplay();
    
    if (discount > 0) {
        const discountText = discountType === 'percent' 
            ? `${discount}%` 
            : formatPrice(discount);
        showNotification(`Đã áp dụng chiết khấu ${discountText}. Tiết kiệm: ${formatPrice(calculation.discountAmount)}`);
    } else {
        showNotification('Đã xóa chiết khấu');
    }
}

// Remove discount from invoice
function removeDiscount(invoiceId) {
    applyDiscount(invoiceId, 0, 'percent');
}

// Apply discount from UI input
function applyDiscountFromUI(invoiceId) {
    const discountInput = document.getElementById(`discount-${invoiceId}`);
    const discountTypeSelect = document.getElementById(`discount-type-${invoiceId}`);
    
    if (!discountInput || !discountTypeSelect) {
        showNotification('Không tìm thấy input chiết khấu');
        return;
    }
    
    const discountValue = discountInput.value;
    const discountType = discountTypeSelect.value;
    
    applyDiscount(invoiceId, discountValue, discountType);
}

// Migrate old invoices to include discount fields
function migrateInvoices() {
    let needsSave = false;
    
    invoices.forEach(invoice => {
        // Add discount fields if missing
        if (typeof invoice.subtotal === 'undefined') {
            invoice.subtotal = invoice.total || 0;
            needsSave = true;
        }
        
        if (typeof invoice.discount === 'undefined') {
            invoice.discount = 0;
            needsSave = true;
        }
        
        if (typeof invoice.discountType === 'undefined') {
            invoice.discountType = 'percent';
            needsSave = true;
        }
        
        // Recalculate totals to ensure consistency
        if (invoice.items && invoice.items.length > 0) {
            const calculation = calculateInvoiceTotal(invoice);
            if (invoice.subtotal !== calculation.subtotal) {
                invoice.subtotal = calculation.subtotal;
                invoice.total = calculation.total;
                needsSave = true;
            }
        }
    });
    
    // Save if any changes were made
    if (needsSave) {
        saveInvoices();
        console.log('Invoices migrated to include discount fields');
    }
}



// Debounced save operations for better performance
let saveTimeout = null;

// Local storage functions with error handling
function saveInvoices() {
    // Clear existing timeout
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    // Debounce saves to avoid excessive localStorage writes
    saveTimeout = setTimeout(() => {
        try {
            localStorage.setItem('balancoffee_invoices', JSON.stringify(invoices));
        } catch (error) {
            console.error('Failed to save invoices:', error);
            showNotification('Lỗi khi lưu dữ liệu hóa đơn', 'error');
        }
    }, 100);
}

function loadInvoices() {
    try {
        const saved = localStorage.getItem('balancoffee_invoices');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Failed to load invoices:', error);
        showNotification('Lỗi khi tải dữ liệu hóa đơn', 'error');
        return [];
    }
}

function saveOrderHistory() {
    try {
        localStorage.setItem('balancoffee_orders', JSON.stringify(orderHistory));
    } catch (error) {
        console.error('Failed to save order history:', error);
        showNotification('Lỗi khi lưu lịch sử đơn hàng', 'error');
    }
}

function loadOrderHistory() {
    try {
        const saved = localStorage.getItem('balancoffee_orders');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Failed to load order history:', error);
        showNotification('Lỗi khi tải lịch sử đơn hàng', 'error');
        return [];
    }
}

// Calculate invoice total with discount
function calculateInvoiceTotal(invoice) {
    // Tính subtotal từ items
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Đảm bảo có giá trị discount mặc định
    const discount = invoice.discount || 0;
    const discountType = invoice.discountType || 'percent';
    
    let discountAmount = 0;
    if (discount > 0) {
        if (discountType === 'percent') {
            // Discount theo phần trăm (0-100)
            discountAmount = (subtotal * discount) / 100;
        } else {
            // Discount cố định (số tiền)
            discountAmount = discount;
        }
    }
    
    // Đảm bảo discount không vượt quá subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    
    const total = subtotal - discountAmount;
    
    return {
        subtotal: subtotal,
        discountAmount: discountAmount,
        total: Math.max(0, total) // Đảm bảo total không âm
    };
}

// Update invoice totals
function updateInvoiceTotals(invoice) {
    const calculation = calculateInvoiceTotal(invoice);
    invoice.subtotal = calculation.subtotal;
    invoice.total = calculation.total;
    invoice.updatedAt = new Date().toISOString();
    return calculation;
}

// Load invoices on startup
invoices = loadInvoices();
ensureMenuData();

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const orderModal = document.getElementById('order-modal');
    const paymentModal = document.getElementById('payment-modal');
    const successModal = document.getElementById('success-modal');
    
    if (e.target === orderModal) {
        closeOrderModal();
    }
    
    if (e.target === paymentModal) {
        closePaymentModal();
    }
    
    if (e.target === successModal) {
        closeSuccessModal();
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const cartToggle = document.querySelector('.cart-toggle');
    
    if (!sidebar.contains(e.target) && !cartToggle.contains(e.target) && sidebar.classList.contains('open')) {
        toggleSidebar();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    handleKeyboardShortcuts(e);
});

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + F để focus vào search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        focusSearchInput();
        return;
    }    
    // ESC để close modal
    if (e.key === 'Escape') {
        handleEscapeKey();
    }
}



// Handle escape key
function handleEscapeKey() {
    const paymentModal = document.getElementById('payment-modal');
    const orderModal = document.getElementById('order-modal');
    
    // Close modals
    if (paymentModal?.classList.contains('show')) {
        closePaymentModal();
    } else if (orderModal?.classList.contains('show')) {
        closeOrderModal();
    }
}

// Select first menu item
function selectFirstMenuItem() {
    const firstMenuButton = document.querySelector('.menu-item-card .add-to-cart:not([disabled])');
    if (firstMenuButton) {
        firstMenuButton.click();
    }
}



// Add some sample data for demonstration
function addSampleData() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const sampleInvoices = [
        {
            id: '123456',
            items: [
                { id: 1, name: 'Cà phê đen', price: 25000, quantity: 2 },
                { id: 8, name: 'Trà sữa trân châu', price: 40000, quantity: 1 }
            ],
            subtotal: 90000,
            discount: 0,
            discountType: 'percent',
            total: 90000,
            status: 'pending',
            createdAt: today.toISOString(),
            updatedAt: today.toISOString()
        }
    ];
    
    const sampleOrders = [
        {
            id: '123457',
            items: [
                { id: 5, name: 'Latte', price: 50000, quantity: 1 },
                { id: 12, name: 'Sinh tố bơ', price: 45000, quantity: 1 }
            ],
            total: 95000,
            timestamp: new Date(today.getTime() - 3600000).toISOString(), // 1 hour ago today
            status: 'paid'
        },
        {
            id: '123458',
            items: [
                { id: 2, name: 'Cà phê sữa', price: 30000, quantity: 2 },
                { id: 6, name: 'Cappuccino', price: 55000, quantity: 1 }
            ],
            total: 115000,
            timestamp: new Date(today.getTime() - 7200000).toISOString(), // 2 hours ago today
            status: 'paid'
        },
        {
            id: '123459',
            items: [
                { id: 3, name: 'Bạc xỉu', price: 35000, quantity: 1 }
            ],
            total: 35000,
            timestamp: yesterday.toISOString(), // Yesterday
            status: 'paid'
        }
    ];
    
    if (invoices.length === 0) {
        invoices.push(...sampleInvoices);
        saveInvoices();
    }
    
    if (orderHistory.length === 0) {        orderHistory.push(...sampleOrders);
        saveOrderHistory();
    }
}

// Enhanced notification system with different types
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
      // Set icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        default:
            icon = 'fas fa-info-circle';
    }
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 4 seconds (except for errors)
    if (type !== 'error') {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Batch update system to reduce re-renders
let pendingUpdates = {
    invoiceDisplay: false,
    menu: false,
    invoiceCount: false
};

let updateTimeout = null;

function scheduleUpdate(type) {
    pendingUpdates[type] = true;
    
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
    
    updateTimeout = setTimeout(() => {
        if (pendingUpdates.invoiceDisplay) {
            updateInvoiceDisplay();
        }
        if (pendingUpdates.menu) {
            renderMenu();
        }
        if (pendingUpdates.invoiceCount) {
            updateInvoiceCount();
        }
        
        // Reset flags
        pendingUpdates = {
            invoiceDisplay: false,
            menu: false,
            invoiceCount: false
        };
    }, 50); // 50ms debounce
}

// Batch update function
function batchUpdate(updates = {}) {
    Object.assign(pendingUpdates, updates);
    scheduleUpdate();
}

// Update invoice count display
function updateInvoiceCount() {
    try {
        const invoiceCountElement = document.querySelector('.invoice-count');
        if (invoiceCountElement) {
            const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
            const totalCount = invoices.length;
            invoiceCountElement.textContent = `${pendingCount}/${totalCount}`;
        }
        
        // Update sidebar header if exists
        const sidebarTitle = document.querySelector('#sidebar h2');
        if (sidebarTitle) {
            const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
            sidebarTitle.textContent = `Hóa đơn (${pendingCount})`;
        }
        
        console.log('✅ Invoice count updated');
    } catch (error) {
        console.error('❌ Error updating invoice count:', error);
    }
}
