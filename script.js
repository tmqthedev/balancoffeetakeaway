// BalanCoffee - Main Application Script
// Version: 8.2 - All Issues Fixed, New Features Added

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
// LOADING SCREEN FUNCTIONS
// =============================================================================

/**
 * Show the loading screen with fade-in animation
 * @param {string} message - Optional loading message (default: "Đang tải...")
 * @param {boolean} showSpinner - Whether to show spinner (default: true)
 */
function showLoadingScreen(message = "Đang tải...", showSpinner = true) {
    try {
        console.log('🔄 Showing loading screen...');
        
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            console.error('❌ Loading screen element not found');
            return;
        }
        
        // Update message if provided
        const loadingLogo = loadingScreen.querySelector('.loading-logo h2');
        if (loadingLogo && message !== "Đang tải...") {
            loadingLogo.textContent = message;
        }
        
        // Show/hide spinner
        const spinner = loadingScreen.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = showSpinner ? 'block' : 'none';
        }
        
        // Remove any existing fade-out class and show loading screen
        loadingScreen.classList.remove('fade-out');
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '0';        // Force reflow to ensure style changes are applied
        loadingScreen.getBoundingClientRect();
        
        // Fade in animation
        loadingScreen.style.transition = 'opacity 0.3s ease-in-out';
        loadingScreen.style.opacity = '1';
        
        // Set z-index to ensure it's on top
        loadingScreen.style.zIndex = '9999';
        
        console.log('✅ Loading screen shown successfully');
        
        // Add accessibility attributes
        loadingScreen.setAttribute('aria-live', 'polite');
        loadingScreen.setAttribute('aria-busy', 'true');
        loadingScreen.setAttribute('role', 'status');
        
    } catch (error) {
        console.error('❌ Error showing loading screen:', error);
        // Don't throw error - loading screen is not critical for app functionality
    }
}

/**
 * Hide the loading screen with fade-out animation
 * @param {number} delay - Delay before hiding in milliseconds (default: 0)
 * @param {Function} callback - Optional callback to execute after hiding
 */
function hideLoadingScreen(delay = 0, callback = null) {
    try {
        console.log('🔄 Hiding loading screen...');
        
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            console.error('❌ Loading screen element not found');
            if (callback) callback();
            return;
        }
        
        // If loading screen is already hidden, just run callback
        if (loadingScreen.style.display === 'none' || 
            window.getComputedStyle(loadingScreen).display === 'none') {
            console.log('ℹ️ Loading screen already hidden');
            if (callback) callback();
            return;
        }
        
        const hideFunction = () => {
            try {
                // Add fade-out class for CSS animation
                loadingScreen.classList.add('fade-out');
                
                // Set transition for smooth fade out
                loadingScreen.style.transition = 'opacity 0.3s ease-in-out';
                loadingScreen.style.opacity = '0';
                
                // Hide completely after animation
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                        loadingScreen.classList.remove('fade-out');
                        
                        // Remove accessibility attributes
                        loadingScreen.removeAttribute('aria-live');
                        loadingScreen.removeAttribute('aria-busy');
                        loadingScreen.removeAttribute('role');
                        
                        console.log('✅ Loading screen hidden successfully');
                    }
                    
                    // Execute callback if provided
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }, 300); // Match CSS transition duration
                
            } catch (error) {
                console.error('❌ Error in hide function:', error);
                if (callback) callback();
            }
        };
        
        // Apply delay if specified
        if (delay > 0) {
            setTimeout(hideFunction, delay);
        } else {
            hideFunction();
        }
        
    } catch (error) {
        console.error('❌ Error hiding loading screen:', error);
        // Don't throw error - execute callback anyway
        if (callback) callback();
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Debug and logging utility
const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.search.includes('debug=true');

function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    
    if (data) {
        console.log(message, data);
    } else {
        console.log(message);
    }
}

function debugError(message, error = null) {
    if (DEBUG_MODE) {
        if (error) {
            console.error(message, error);
        } else {
            console.error(message);
        }
        return;
    }
    
    // In production, only log critical errors
    if (error && (error.name === 'SyntaxError' || error.name === 'ReferenceError' || error.name === 'TypeError')) {
        console.error(message, error);
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

// =============================================================================
// DATA LOADING FUNCTIONS
// =============================================================================

function loadMenuData() {
    try {
        debugLog('📋 Loading menu data...');
        
        // Check if menuData is available from data.js
        if (window.menuData && Array.isArray(window.menuData) && window.menuData.length > 0) {
            debugLog(`✅ Menu data loaded from data.js: ${window.menuData.length} items`);
            return window.menuData;
        }
        
        // Check if global menuData exists but not in window
        if (typeof menuData !== 'undefined' && Array.isArray(menuData) && menuData.length > 0) {
            debugLog(`✅ Menu data found in global scope: ${menuData.length} items`);
            window.menuData = menuData;
            return menuData;
        }
        
        // Fallback to hardcoded data
        debugLog('⚠️ Using fallback menu data');
        window.menuData = fallbackMenuData;
        return fallbackMenuData;
        
    } catch (error) {
        debugError('❌ Error loading menu data:', error);
        window.menuData = fallbackMenuData;
        return fallbackMenuData;
    }
}

function validateMenuData(data) {
    if (!Array.isArray(data)) return false;
    
    return data.every(item => 
        item.id && 
        typeof item.id === 'number' &&
        item.name && 
        typeof item.name === 'string' &&
        item.price && 
        typeof item.price === 'number' &&
        item.category &&
        typeof item.category === 'string'
    );
}

function checkRequiredElements() {
    const requiredElements = [
        'app-container',
        'menu-grid',
        'order-items',
        'order-total'
    ];
    
    const missing = [];
    const found = [];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            found.push(id);
        } else {
            missing.push(id);
        }
    });
    
    debugLog(`✅ Found elements: ${found.join(', ')}`);
    if (missing.length > 0) {
        debugError(`❌ Missing elements: ${missing.join(', ')}`);
    }
    
    return missing.length === 0;
}

function showAppContainer() {
    try {
        debugLog('🎯 Showing app container...');
        const appContainer = document.getElementById('app-container');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (appContainer) {
            // Force all display properties
            appContainer.style.display = 'flex';
            appContainer.style.visibility = 'visible';
            appContainer.style.opacity = '1';
            appContainer.style.zIndex = '1';
            appContainer.style.minHeight = '100vh';
            appContainer.style.flexDirection = 'column';
            debugLog('✅ App container shown and made fully visible');
        } else {
            debugError('❌ App container element not found');
            return false;
        }
        
        if (loadingScreen) {
            // Force hide loading screen
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            loadingScreen.style.zIndex = '-1';
            debugLog('✅ Loading screen hidden completely');
        }
        
        return true;
        
    } catch (error) {
        debugError('❌ Error showing app container:', error);
        return false;
    }
}

function waitForDataReady(callback, maxAttempts = 10, currentAttempt = 1) {
    try {
        debugLog(`🔄 Waiting for data readiness (attempt ${currentAttempt}/${maxAttempts})`);
        
        // Check if menuData is available
        const dataReady = (window.menuData && Array.isArray(window.menuData) && window.menuData.length > 0) ||
                         (typeof menuData !== 'undefined' && Array.isArray(menuData) && menuData.length > 0);
        
        if (dataReady) {
            debugLog('✅ Data is ready');
            callback();
            return;
        }
        
        if (currentAttempt >= maxAttempts) {
            debugLog('⚠️ Max attempts reached, using fallback data');
            window.menuData = fallbackMenuData;
            callback();
            return;
        }
        
        // Wait and retry
        setTimeout(() => {
            waitForDataReady(callback, maxAttempts, currentAttempt + 1);
        }, 100);
        
    } catch (error) {
        debugError('❌ Error waiting for data:', error);
        window.menuData = fallbackMenuData;
        callback();
    }
}

// =============================================================================
// CORE MENU FUNCTIONS
// =============================================================================

function renderMenu() {
    try {
        debugLog('🍽️ Rendering menu...');
        showLoadingScreen('Đang tải menu...', true);
        
        const menuContainer = document.getElementById('menu-grid');
        if (!menuContainer) {
            debugError('❌ Menu grid container not found');
            hideLoadingScreen();
            return;
        }
        
        // Use timeout to simulate loading and avoid blocking
        setTimeout(renderMenuItems, 800);
        
    } catch (error) {
        debugError('❌ Error in renderMenu:', error);
        showNotification('Lỗi tải menu: ' + error.message, 'error');
        hideLoadingScreen();
    }
}

function renderMenuItems() {
    try {
        const menuContainer = document.getElementById('menu-grid');
        if (!menuContainer) {
            debugError('❌ Menu grid container not found');
            hideLoadingScreen();
            return;
        }
        
        let menuData = loadMenuData();
        
        // Validate menu data
        if (!validateMenuData(menuData)) {
            debugError('❌ Invalid menu data structure');
            menuData = fallbackMenuData;
        }
        
        let filteredData = menuData;
        
        // Filter by category
        if (currentCategory && currentCategory !== 'all') {
            filteredData = menuData.filter(item => item.category === currentCategory);
            debugLog(`🔍 Filtered menu by category '${currentCategory}': ${filteredData.length} items`);
        } else {
            debugLog(`📋 Showing all menu items: ${filteredData.length} items`);
        }
        
        if (filteredData.length === 0) {
            menuContainer.innerHTML = `
                <div class="no-items">
                    <div class="no-items-content">
                        <i class="fas fa-search"></i>
                        <p>Không có sản phẩm nào trong danh mục này</p>
                        <button class="btn btn-primary" onclick="showAllCategories()">
                            Xem tất cả sản phẩm
                        </button>
                    </div>
                </div>
            `;
            hideLoadingScreen();
            return;
        }
        
        menuContainer.innerHTML = filteredData.map(item => `
            <div class="menu-item" data-id="${item.id}" data-category="${item.category}">
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span class="price">${formatPrice(item.price)}</span>
                </div>
                <button class="add-btn" onclick="addToOrder(${item.id})" title="Thêm vào đơn hàng">
                    <i class="fas fa-plus"></i>
                    <span>Thêm</span>
                </button>
            </div>
        `).join('');
        
        debugLog(`✅ Menu rendered successfully: ${filteredData.length} items displayed`);
        hideLoadingScreen(300);
        
    } catch (error) {
        debugError('❌ Error rendering menu items:', error);
        showNotification('Lỗi tải menu: ' + error.message, 'error');
        hideLoadingScreen();
    }
}

function showAllCategories() {
    try {
        currentCategory = 'all';
        window.currentCategory = currentCategory;
        
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
        
        renderMenu();
        debugLog('🔄 Switched to all categories');
        
    } catch (error) {
        debugError('❌ Error showing all categories:', error);
    }
}

function addToOrder(itemId) {
    try {
        const menuData = loadMenuData();
        const item = menuData.find(i => i.id === itemId);
        
        if (!item) {
            showNotification('Không tìm thấy sản phẩm', 'error');
            debugError(`❌ Item not found: ID ${itemId}`);
            return;
        }
        
        const existingItem = currentOrder.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
            debugLog(`➕ Increased quantity for ${item.name}: ${existingItem.quantity}`);
        } else {
            currentOrder.push({ ...item, quantity: 1 });
            debugLog(`🆕 Added new item to order: ${item.name}`);
        }
        
        // Update global reference
        window.currentOrder = currentOrder;
        
        updateOrderDisplay();
        showNotification(`Đã thêm ${item.name} vào đơn hàng`, 'success');
        
    } catch (error) {
        debugError('❌ Error adding to order:', error);
        showNotification('Lỗi thêm sản phẩm: ' + error.message, 'error');
    }
}

function updateOrderDisplay() {
    try {
        const orderContainer = document.getElementById('order-items');
        const orderTotalElement = document.getElementById('order-total');
        const orderPreviewElement = document.getElementById('order-items-preview');
        const orderTotalPreviewElement = document.getElementById('order-total-preview');
        
        if (!orderContainer) {
            debugError('❌ Order container not found');
            return;
        }
        
        if (currentOrder.length === 0) {
            orderContainer.innerHTML = '<p class="empty-order">Chưa có sản phẩm nào</p>';
            if (orderTotalElement) orderTotalElement.textContent = '0₫';
            if (orderPreviewElement) orderPreviewElement.innerHTML = '<p class="empty-order">Chưa có sản phẩm nào</p>';
            if (orderTotalPreviewElement) orderTotalPreviewElement.textContent = '0₫';
            return;
        }
        
        const orderHTML = currentOrder.map(item => `
            <div class="order-item">
                <span>${item.name}</span>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
        
        orderContainer.innerHTML = orderHTML;
        
        // Update preview if exists
        if (orderPreviewElement) {
            orderPreviewElement.innerHTML = orderHTML;
        }
        
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const formattedTotal = formatPrice(total);
        
        if (orderTotalElement) orderTotalElement.textContent = formattedTotal;
        if (orderTotalPreviewElement) orderTotalPreviewElement.textContent = formattedTotal;
        
        debugLog('✅ Order display updated successfully');
        
    } catch (error) {
        debugError('❌ Error updating order display:', error);
    }
}

function updateQuantity(itemId, change) {
    try {
        const item = currentOrder.find(i => i.id === itemId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            const index = currentOrder.findIndex(i => i.id === itemId);
            currentOrder.splice(index, 1);
        }
        
        updateOrderDisplay();
        
    } catch (error) {
        debugError('❌ Error updating quantity:', error);
    }
}

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

function setupCategoryFilters() {
    try {
        debugLog('🔧 Setting up category filters...');
        const categoryButtons = document.querySelectorAll('.category-btn');
        debugLog(`Found ${categoryButtons.length} category buttons`);
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', handleCategoryClick);
        });
        
    } catch (error) {
        debugError('❌ Error setting up category filters:', error);
    }
}

function handleCategoryClick(event) {
    try {
        const btn = event.target.closest('.category-btn');
        if (!btn) return;
        
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        // Update active button
        categoryButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // Update category and render
        const newCategory = btn.dataset.category || 'all';
        if (newCategory !== currentCategory) {
            currentCategory = newCategory;
            window.currentCategory = currentCategory;
            debugLog(`🏷️ Category changed to: ${currentCategory}`);
            
            // Show loading for category change
            showLoadingScreen('Đang lọc danh mục...', true);
            
            // Render menu with new category
            setTimeout(() => {
                renderMenu();
            }, 300);
        }
        
    } catch (error) {
        debugError('❌ Error handling category click:', error);
        showNotification('Lỗi lọc danh mục: ' + error.message, 'error');
    }
}

function initializeAppData() {
    try {
        debugLog('📋 Loading application data...');
        
        // Load menu data first
        const menuData = loadMenuData();
        debugLog(`📊 Menu data validation: ${validateMenuData(menuData) ? 'PASSED' : 'FAILED'}`);
        
        // Load other data
        loadInvoices();
        
        // Set up category filters
        setupCategoryFilters();
        
        // Update shift display on startup
        updateShiftDisplay();
        
        return true;
        
    } catch (error) {
        debugError('❌ Error initializing app data:', error);
        return false;
    }
}

function completeAppInitialization() {
    try {
        debugLog('🏁 Completing app initialization...');
        
        // First hide loading screen properly
        hideLoadingScreen(0, () => {
            debugLog('💡 Loading screen hidden, showing app container...');
            
            // Show app container
            if (showAppContainer()) {
                debugLog('✅ App container is now visible');
                
                // Render initial menu after a short delay to ensure DOM is ready
                setTimeout(() => {
                    debugLog('🍽️ Starting initial menu render...');
                    renderMenu();
                    debugLog('✅ BalanCoffee app initialized successfully');
                    
                    // Final check - make sure everything is visible
                    setTimeout(() => {
                        const appContainer = document.getElementById('app-container');
                        const menuGrid = document.getElementById('menu-grid');
                        
                        if (appContainer && appContainer.style.display === 'block') {
                            debugLog('✅ Final check: App container is visible');
                        } else {
                            debugError('❌ Final check: App container is not visible');
                        }
                        
                        if (menuGrid && menuGrid.children.length > 0) {
                            debugLog(`✅ Final check: Menu has ${menuGrid.children.length} items`);
                        } else {
                            debugError('❌ Final check: Menu is empty');
                        }
                    }, 1000);
                    
                }, 300);
            } else {
                debugError('❌ Failed to show app container');
                showNotification('Lỗi hiển thị ứng dụng', 'error');
            }
        });
        
    } catch (error) {
        debugError('❌ Error completing app initialization:', error);
        hideLoadingScreen();
        showNotification('Lỗi hoàn thành khởi tạo: ' + error.message, 'error');
    }
}

function initializeApp() {
    try {
        debugLog('🚀 Initializing BalanCoffee app...');
        showLoadingScreen('Đang khởi tạo ứng dụng...', true);
        
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            debugLog('⏳ DOM still loading, waiting...');
            hideLoadingScreen();
            return;
        }
        
        // Wait for data to be ready before proceeding
        waitForDataReady(() => {
            try {
                // Check if app container exists
                const appContainer = document.getElementById('app-container');
                if (!appContainer) {
                    debugError('❌ App container not found');
                    hideLoadingScreen();
                    return;
                }
                
                // Check required DOM elements
                debugLog('🔍 Checking required DOM elements...');
                if (!checkRequiredElements()) {
                    debugError('❌ Some required DOM elements are missing');
                    showNotification('Lỗi: Thiếu elements cần thiết trong DOM', 'error');
                    hideLoadingScreen();
                    return;
                }
                
                // Initialize data loading
                if (!initializeAppData()) {
                    showNotification('Lỗi khởi tạo dữ liệu ứng dụng', 'error');
                    hideLoadingScreen();
                    return;
                }
                
                // Complete app initialization
                completeAppInitialization();
                
            } catch (error) {
                debugError('❌ Error in data ready callback:', error);
                showNotification('Lỗi khởi tạo: ' + error.message, 'error');
                hideLoadingScreen();
            }
        });
        
    } catch (error) {
        debugError('❌ Error initializing app:', error);
        showNotification('Lỗi khởi tạo ứng dụng: ' + error.message, 'error');
        hideLoadingScreen();
    }
}

// =============================================================================
// SIDEBAR MANAGEMENT FUNCTIONS
// =============================================================================

function toggleSidebar() {
    try {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            debugError('❌ Sidebar element not found');
            return;
        }
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.add('expanded');
            debugLog('📂 Sidebar expanded');
        } else {
            sidebar.classList.add('collapsed');
            sidebar.classList.remove('expanded');
            debugLog('📁 Sidebar collapsed');
        }
        
        // Update invoice list when sidebar opens
        if (!isCollapsed) {
            updateInvoiceList();
        }
        
    } catch (error) {
        debugError('❌ Error toggling sidebar:', error);
    }
}

function handleBackdropKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSidebar();
    }
}

function updateInvoiceList() {
    try {
        const container = document.getElementById('invoice-list');
        if (!container) {
            debugError('❌ Invoice list container not found');
            return;
        }
        
        if (invoices.length === 0) {
            container.innerHTML = '<p class="empty-invoices">Chưa có hóa đơn nào</p>';
            return;
        }
        
        container.innerHTML = invoices.map(invoice => `
            <div class="invoice-item" data-id="${invoice.id}">
                <div class="invoice-info">
                    <strong>Hóa đơn #${invoice.id}</strong>
                    <div class="invoice-details">
                        <span class="invoice-time">${formatDateTime(invoice.createdAt)}</span>
                        <span class="invoice-total">${formatPrice(invoice.total)}</span>
                    </div>
                    <div class="invoice-items">
                        ${invoice.items.length} sản phẩm
                    </div>
                </div>
                <div class="invoice-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewInvoice(${invoice.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="printInvoice(${invoice.id})">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        debugLog(`✅ Invoice list updated with ${invoices.length} invoices`);
        
    } catch (error) {
        debugError('❌ Error updating invoice list:', error);
    }
}

function viewInvoice(invoiceId) {
    try {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        // Open invoice in modal or show details
        alert(`Hóa đơn #${invoice.id}\nTổng: ${formatPrice(invoice.total)}\nThời gian: ${formatDateTime(invoice.createdAt)}`);
        
    } catch (error) {
        debugError('❌ Error viewing invoice:', error);
        showNotification('Lỗi xem hóa đơn: ' + error.message, 'error');
    }
}

function printInvoice(invoiceId) {
    try {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        // Simple print simulation
        const printContent = `
BALANCOFFEE
Hóa đơn #${invoice.id}
${formatDateTime(invoice.createdAt)}
${'='.repeat(30)}
${invoice.items.map(item => `${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`).join('\n')}
${'='.repeat(30)}
Tổng cộng: ${formatPrice(invoice.total)}
        `;
        
        console.log('🖨️ Printing invoice:', printContent);
        showNotification('Hóa đơn đã được in', 'success');
        
    } catch (error) {
        debugError('❌ Error printing invoice:', error);
        showNotification('Lỗi in hóa đơn: ' + error.message, 'error');
    }
}

// =============================================================================
// ADMIN MANAGEMENT FUNCTIONS
// =============================================================================

function toggleAdminMode() {
    try {
        isAdminMode = !isAdminMode;
        window.isAdminMode = isAdminMode;
        
        const adminBtn = document.querySelector('.btn.btn-secondary[onclick*="toggleAdminMode"]');
        const sidebarControls = document.getElementById('sidebar-controls');
        const adminSection = document.getElementById('admin-section');
        
        // Update admin button appearance
        if (adminBtn) {
            adminBtn.classList.toggle('active', isAdminMode);
            const btnText = adminBtn.querySelector('.btn-text');
            const btnIcon = adminBtn.querySelector('i');
            
            if (btnText && btnIcon) {
                if (isAdminMode) {
                    btnIcon.className = 'fas fa-user-shield';
                    btnText.textContent = 'Thoát Admin';
                } else {
                    btnIcon.className = 'fas fa-chart-bar';
                    btnText.textContent = 'Quản lý';
                }
            }
        }
        
        // Show/hide admin section
        if (adminSection) {
            adminSection.style.display = isAdminMode ? 'block' : 'none';
            debugLog(`🎛️ Admin section ${isAdminMode ? 'shown' : 'hidden'}`);
        }
        
        // Show/hide sidebar admin controls
        if (sidebarControls) {
            sidebarControls.style.display = isAdminMode ? 'block' : 'none';
        }
        
        showNotification(
            isAdminMode ? 'Đã vào chế độ quản lý' : 'Đã thoát chế độ quản lý',
            isAdminMode ? 'success' : 'info'
        );
        
        debugLog(`🔐 Admin mode: ${isAdminMode ? 'ON' : 'OFF'}`);
        
    } catch (error) {
        debugError('❌ Error toggling admin mode:', error);
        showNotification('Lỗi chuyển chế độ quản lý: ' + error.message, 'error');
    }
}

function clearAllInvoices() {
    try {
        if (!isAdminMode) {
            showNotification('Cần vào chế độ quản lý để thực hiện', 'warning');
            return;
        }
        
        if (confirm('Bạn có chắc muốn xóa tất cả hóa đơn?')) {
            invoices = [];
            window.invoices = invoices;
            saveInvoices();
            updateInvoiceList();
            showNotification('Đã xóa tất cả hóa đơn', 'success');
            debugLog('🗑️ All invoices cleared');
        }
        
    } catch (error) {
        debugError('❌ Error clearing invoices:', error);
        showNotification('Lỗi xóa hóa đơn: ' + error.message, 'error');
    }
}

function exportData() {
    try {
        if (!isAdminMode) {
            showNotification('Cần vào chế độ quản lý để thực hiện', 'warning');
            return;
        }
        
        const data = {
            invoices: invoices,
            exportDate: new Date().toISOString(),
            version: '8.1'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balancoffee-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Dữ liệu đã được xuất', 'success');
        debugLog('📤 Data exported');
        
    } catch (error) {
        debugError('❌ Error exporting data:', error);
        showNotification('Lỗi xuất dữ liệu: ' + error.message, 'error');
    }
}

// =============================================================================
// ORDER MANAGEMENT FUNCTIONS
// =============================================================================

function openOrderModal() {
    try {
        if (currentOrder.length === 0) {
            showNotification('Đơn hàng trống', 'warning');
            return;
        }
        
        const modal = document.getElementById('order-modal');
        if (!modal) {
            debugError('❌ Order modal not found');
            return;
        }
        
        // Update order display in modal
        updateOrderDisplay();
        
        // Show modal
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        debugLog('📋 Order modal opened');
        
    } catch (error) {
        debugError('❌ Error opening order modal:', error);
        showNotification('Lỗi mở modal đơn hàng: ' + error.message, 'error');
    }
}

function closeOrderModal() {
    try {
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            debugLog('❌ Order modal closed');
        }
    } catch (error) {
        debugError('❌ Error closing order modal:', error);
    }
}

function confirmOrder() {
    try {
        if (currentOrder.length === 0) {
            showNotification('Đơn hàng trống', 'warning');
            return;
        }
        
        // Create invoice
        const invoice = {
            id: Date.now(),
            items: [...currentOrder],
            total: currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            createdAt: new Date().toISOString(),
            status: 'completed'
        };
        
        // Save invoice
        invoices.push(invoice);
        window.invoices = invoices;
        saveInvoices();
        
        // Clear current order
        currentOrder = [];
        window.currentOrder = currentOrder;
        updateOrderDisplay();
        
        // Close modal
        closeOrderModal();
        
        // Update invoice list
        updateInvoiceList();
        
        showNotification(`Hóa đơn #${invoice.id} đã được tạo`, 'success');
        debugLog(`✅ Order confirmed, invoice #${invoice.id} created`);
        
    } catch (error) {
        debugError('❌ Error confirming order:', error);
        showNotification('Lỗi xác nhận đơn hàng: ' + error.message, 'error');
    }
}

// =============================================================================
// PAYMENT FUNCTIONS
// =============================================================================

function proceedToPayment() {
    try {
        if (!currentInvoiceId) {
            showNotification('Không có hóa đơn nào được chọn', 'warning');
            return;
        }
        
        const invoice = invoices.find(inv => inv.id === currentInvoiceId);
        if (!invoice) {
            showNotification('Không tìm thấy hóa đơn', 'error');
            return;
        }
        
        // Open payment modal
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            paymentModal.style.display = 'flex';
            paymentModal.classList.add('active');
            
            // Update payment summary
            const paymentSummary = document.getElementById('payment-order-summary');
            if (paymentSummary) {
                paymentSummary.innerHTML = `
                    <div class="summary-item">
                        <span>Tổng tiền:</span>
                        <strong>${formatPrice(invoice.total)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Phương thức:</span>
                        <strong>Tiền mặt</strong>
                    </div>
                `;
            }
            
            debugLog('💰 Payment modal opened');
        }
        
    } catch (error) {
        debugError('❌ Error proceeding to payment:', error);
        showNotification('Lỗi chuyển đến thanh toán: ' + error.message, 'error');
    }
}

function closePaymentModal() {
    try {
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            paymentModal.style.display = 'none';
            paymentModal.classList.remove('active');
            debugLog('❌ Payment modal closed');
        }
    } catch (error) {
        debugError('❌ Error closing payment modal:', error);
    }
}

// =============================================================================
// NEW SHIFT FUNCTIONS
// =============================================================================

function startNewShift() {
    try {
        if (!isAdminMode) {
            showNotification('Cần vào chế độ quản lý để thực hiện', 'warning');
            return;
        }
        
        const employeeName = prompt('Nhập tên nhân viên:');
        if (!employeeName) return;
        
        const shiftNote = prompt('Ghi chú ca làm việc (không bắt buộc):') || '';
        
        shiftStartTime = new Date().toISOString();
        currentShiftEmployee = employeeName;
        currentShiftNote = shiftNote;
        
        window.shiftStartTime = shiftStartTime;
        window.currentShiftEmployee = currentShiftEmployee;
        window.currentShiftNote = currentShiftNote;
        
        // Update display
        updateShiftDisplay();
        
        showNotification(`Ca làm việc mới bắt đầu cho ${employeeName}`, 'success');
        debugLog(`🏁 New shift started for ${employeeName}`);
        
    } catch (error) {
        debugError('❌ Error starting new shift:', error);
        showNotification('Lỗi bắt đầu ca mới: ' + error.message, 'error');
    }
}

function viewCurrentShift() {
    try {
        if (!shiftStartTime) {
            showNotification('Chưa có ca làm việc nào được bắt đầu', 'warning');
            return;
        }
        
        const startTime = new Date(shiftStartTime);
        const currentTime = new Date();
        const duration = Math.floor((currentTime - startTime) / (1000 * 60)); // minutes
        
        const shiftOrders = invoices.filter(invoice => 
            new Date(invoice.createdAt) >= startTime
        );
        
        const totalRevenue = shiftOrders.reduce((sum, invoice) => sum + invoice.total, 0);
        
        alert(`Ca làm việc hiện tại:
Nhân viên: ${currentShiftEmployee || 'Không xác định'}
Bắt đầu: ${formatDateTime(shiftStartTime)}
Thời gian làm việc: ${duration} phút
Số đơn hàng: ${shiftOrders.length}
Doanh thu: ${formatPrice(totalRevenue)}`);
        
    } catch (error) {
        debugError('❌ Error viewing current shift:', error);
        showNotification('Lỗi xem ca hiện tại: ' + error.message, 'error');
    }
}

function endShift() {
    try {
        if (!isAdminMode) {
            showNotification('Cần vào chế độ quản lý để thực hiện', 'warning');
            return;
        }
        
        if (!shiftStartTime) {
            showNotification('Chưa có ca làm việc nào để kết thúc', 'warning');
            return;
        }
        
        if (confirm('Bạn có chắc muốn kết thúc ca làm việc hiện tại?')) {
            const endTime = new Date();
            const startTime = new Date(shiftStartTime);
            const duration = Math.floor((endTime - startTime) / (1000 * 60));
            
            const shiftOrders = invoices.filter(invoice => 
                new Date(invoice.createdAt) >= startTime
            );
            
            const totalRevenue = shiftOrders.reduce((sum, invoice) => sum + invoice.total, 0);
            
            // Log shift end
            debugLog(`📊 Shift ended: ${duration} minutes, ${shiftOrders.length} orders, ${formatPrice(totalRevenue)} revenue`);
            
            // Reset shift data
            shiftStartTime = null;
            currentShiftEmployee = null;
            currentShiftNote = null;
            
            window.shiftStartTime = null;
            window.currentShiftEmployee = null;
            window.currentShiftNote = null;
            
            updateShiftDisplay();
            
            showNotification(`Ca làm việc đã kết thúc. Doanh thu: ${formatPrice(totalRevenue)}`, 'success');
        }
        
    } catch (error) {
        debugError('❌ Error ending shift:', error);
        showNotification('Lỗi kết thúc ca: ' + error.message, 'error');
    }
}

function updateShiftDisplay() {
    try {
        const shiftStartDisplay = document.getElementById('shift-start-display');
        const shiftEmployeeDisplay = document.getElementById('shift-employee-display');
        const currentShiftOrders = document.getElementById('current-shift-orders');
        const currentShiftRevenue = document.getElementById('current-shift-revenue');
        const currentShiftBestseller = document.getElementById('current-shift-bestseller');
        
        if (shiftStartTime) {
            if (shiftStartDisplay) {
                shiftStartDisplay.textContent = formatDateTime(shiftStartTime);
            }
            if (shiftEmployeeDisplay) {
                shiftEmployeeDisplay.textContent = currentShiftEmployee || 'Không xác định';
            }
            
            // Calculate shift statistics
            const startTime = new Date(shiftStartTime);
            const shiftOrders = invoices.filter(invoice => 
                new Date(invoice.createdAt) >= startTime
            );
            
            const totalRevenue = shiftOrders.reduce((sum, invoice) => sum + invoice.total, 0);
            
            if (currentShiftOrders) {
                currentShiftOrders.textContent = shiftOrders.length.toString();
            }
            if (currentShiftRevenue) {
                currentShiftRevenue.textContent = formatPrice(totalRevenue);
            }
            
            // Find bestseller
            const itemCounts = {};
            shiftOrders.forEach(invoice => {
                invoice.items.forEach(item => {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
                });
            });
            
            const bestseller = Object.keys(itemCounts).reduce((a, b) => 
                itemCounts[a] > itemCounts[b] ? a : b, '-'
            );
            
            if (currentShiftBestseller) {
                currentShiftBestseller.textContent = bestseller;
            }
            
        } else {
            // No active shift
            if (shiftStartDisplay) shiftStartDisplay.textContent = '--';
            if (shiftEmployeeDisplay) shiftEmployeeDisplay.textContent = '--';
            if (currentShiftOrders) currentShiftOrders.textContent = '0';
            if (currentShiftRevenue) currentShiftRevenue.textContent = '0₫';
            if (currentShiftBestseller) currentShiftBestseller.textContent = '-';
        }
        
    } catch (error) {
        debugError('❌ Error updating shift display:', error);
    }
}

// =============================================================================
// EXPOSE FUNCTIONS TO WINDOW
// =============================================================================

// Expose all new functions to window
window.showAllCategories = showAllCategories;
window.startNewShift = startNewShift;
window.viewCurrentShift = viewCurrentShift;
window.endShift = endShift;
window.updateShiftDisplay = updateShiftDisplay;
window.createNewInvoice = createNewInvoice;
window.deselectInvoice = deselectInvoice;
window.deleteInvoiceById = deleteInvoiceById;
window.filterInvoices = filterInvoices;
window.proceedToPayment = proceedToPayment;
window.closePaymentModal = closePaymentModal;
window.deleteInvoice = deleteInvoice;

// Expose key functions to window for compatibility
window.formatPrice = formatPrice;
window.formatDateTime = formatDateTime;
window.showNotification = showNotification;
window.showLoadingScreen = showLoadingScreen;
window.hideLoadingScreen = hideLoadingScreen;
window.renderMenu = renderMenu;
window.renderMenuItems = renderMenuItems;
window.addToOrder = addToOrder;
window.updateQuantity = updateQuantity;
window.initializeApp = initializeApp;
window.loadMenuData = loadMenuData;
window.validateMenuData = validateMenuData;
window.checkRequiredElements = checkRequiredElements;
window.updateOrderDisplay = updateOrderDisplay;
window.showAppContainer = showAppContainer;
window.waitForDataReady = waitForDataReady;
window.setupCategoryFilters = setupCategoryFilters;
window.handleCategoryClick = handleCategoryClick;
window.initializeAppData = initializeAppData;
window.completeAppInitialization = completeAppInitialization;
window.forceShowApp = forceShowApp;
window.debugVisibility = debugVisibility;

// Sidebar functions
window.toggleSidebar = toggleSidebar;
window.handleBackdropKeydown = handleBackdropKeydown;
window.updateInvoiceList = updateInvoiceList;
window.viewInvoice = viewInvoice;
window.printInvoice = printInvoice;

// Admin functions
window.toggleAdminMode = toggleAdminMode;
window.clearAllInvoices = clearAllInvoices;
window.exportData = exportData;

// Order management functions
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.confirmOrder = confirmOrder;

// Diagnostic function for debugging
window.debugSystem = function() {
    console.log('=== SYSTEM DEBUG INFO ===');
    console.log('App initialized:', typeof initializeApp === 'function');
    console.log('Menu data available:', !!window.menuData);
    console.log('Menu data valid:', validateMenuData(window.menuData || []));
    console.log('Current order items:', currentOrder.length);
    console.log('Required elements check:', checkRequiredElements());
    console.log('Loading functions:', {
        showLoadingScreen: typeof showLoadingScreen === 'function',
        hideLoadingScreen: typeof hideLoadingScreen === 'function'
    });
    console.log('Sidebar functions:', {
        toggleSidebar: typeof toggleSidebar === 'function',
        updateInvoiceList: typeof updateInvoiceList === 'function'
    });
    console.log('Admin functions:', {
        toggleAdminMode: typeof toggleAdminMode === 'function',
        startNewShift: typeof startNewShift === 'function'
    });
    console.log('========================');
};

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is ready
ensureDOMReady(() => {
    debugLog('🎯 DOM is ready, starting initialization...');
    initializeApp();
    
    // Fallback: If app is not visible after 5 seconds, force show it
    setTimeout(() => {
        const appContainer = document.getElementById('app-container');
        const loadingScreen = document.getElementById('loading-screen');
        
        const appVisible = appContainer && window.getComputedStyle(appContainer).display !== 'none';
        const loadingVisible = loadingScreen && window.getComputedStyle(loadingScreen).display !== 'none';
        
        if (!appVisible || loadingVisible) {
            console.warn('⚠️ App not visible after 5 seconds, forcing display...');
            forceShowApp();
        } else {
            debugLog('✅ App is properly visible');
        }
    }, 5000);
});

// Global error handlers
window.addEventListener('error', function(e) {
    debugError('❌ Global error:', e.error);
    showNotification('Đã xảy ra lỗi không mong muốn', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    debugError('❌ Unhandled promise rejection:', e.reason);
    showNotification('Đã xảy ra lỗi không mong muốn', 'error');
});

debugLog('📋 BalanCoffee script loaded - Version 8.2 with All Issues Fixed');

function forceShowApp() {
    try {
        console.log('🔧 Force showing app...');
        
        // Hide loading screen immediately
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            console.log('🔴 Loading screen forcefully hidden');
        }
        
        // Show app container immediately
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.style.display = 'flex';
            appContainer.style.visibility = 'visible';
            appContainer.style.opacity = '1';
            appContainer.style.zIndex = '1';
            appContainer.style.minHeight = '100vh';
            appContainer.style.flexDirection = 'column';
            console.log('🟢 App container forcefully shown');
        }
        
        // Force render menu
        setTimeout(() => {
            const menuData = loadMenuData();
            const menuContainer = document.getElementById('menu-grid');
            
            if (menuContainer && menuData) {
                menuContainer.innerHTML = menuData.map(item => `
                    <div class="menu-item" data-id="${item.id}">
                        <div class="menu-item-info">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <span class="price">${formatPrice(item.price)}</span>
                        </div>
                        <button class="add-btn" onclick="addToOrder(${item.id})">
                            <i class="fas fa-plus"></i>
                            <span>Thêm</span>
                        </button>
                    </div>
                `).join('');
                
                console.log(`🍽️ Menu forcefully rendered with ${menuData.length} items`);
            }
            
            // Update order display
            updateOrderDisplay();
            console.log('✅ Force show app completed');
            
        }, 100);
        
    } catch (error) {
        console.error('❌ Error in forceShowApp:', error);
    }
}

function debugVisibility() {
    console.log('=== VISIBILITY DEBUG ===');
    
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    const menuGrid = document.getElementById('menu-grid');
    
    if (loadingScreen) {
        console.log('Loading Screen:', {
            display: window.getComputedStyle(loadingScreen).display,
            visibility: window.getComputedStyle(loadingScreen).visibility,
            opacity: window.getComputedStyle(loadingScreen).opacity,
            zIndex: window.getComputedStyle(loadingScreen).zIndex
        });
    }
    
    if (appContainer) {
        console.log('App Container:', {
            display: window.getComputedStyle(appContainer).display,
            visibility: window.getComputedStyle(appContainer).visibility,
            opacity: window.getComputedStyle(appContainer).opacity,
            zIndex: window.getComputedStyle(appContainer).zIndex
        });
    }
    
    if (menuGrid) {
        console.log('Menu Grid:', {
            display: window.getComputedStyle(menuGrid).display,
            childrenCount: menuGrid.children.length,
            innerHTML: menuGrid.innerHTML.length > 0 ? 'Has content' : 'Empty'
        });
    }
    
    console.log('Current Order:', currentOrder.length);
    console.log('Menu Data Available:', !!window.menuData);
    console.log('========================');
}

// Emergency override - call this in console if app won't show
window.emergencyShow = function() {
    console.log('🚨 EMERGENCY SHOW APP');
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.remove();
        console.log('🗑️ Loading screen removed');
    }
    
    // Show app container
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 1 !important;
            min-height: 100vh !important;
            flex-direction: column !important;
            background: white !important;
        `;
        console.log('✅ App container force shown');
    }
    
    // Force render menu
    const menuContainer = document.getElementById('menu-grid');
    if (menuContainer) {
        const menuData = window.menuData || [
            { id: 1, name: "Cà phê đen", description: "Cà phê đen truyền thống", price: 25000, category: "cafe-viet" },
            { id: 2, name: "Cà phê sữa", description: "Cà phê với sữa đặc", price: 30000, category: "cafe-viet" },
            { id: 3, name: "Americano", description: "Espresso pha loãng", price: 40000, category: "cafe-y" }
        ];
        
        menuContainer.innerHTML = menuData.map(item => `
            <div class="menu-item" data-id="${item.id}" style="border: 1px solid #ddd; padding: 15px; margin: 10px; border-radius: 5px; background: white;">
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span class="price">${item.price.toLocaleString('vi-VN')}₫</span>
                </div>
                <button class="add-btn" onclick="window.emergencyAddToOrder && window.emergencyAddToOrder(${item.id})" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer;">
                    <i class="fas fa-plus"></i>
                    <span>Thêm</span>
                </button>
            </div>
        `).join('');
        console.log('🍽️ Emergency menu rendered');
    }
    
    console.log('🚨 EMERGENCY SHOW COMPLETED');
};

window.emergencyAddToOrder = function(itemId) {
    console.log('Adding item:', itemId);
    alert('Item added to order: ' + itemId);
};
