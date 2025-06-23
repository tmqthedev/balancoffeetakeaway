// BalanCoffee - Main Application Script
// Version: 8.3 - Improved Initialization System

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

function updateQuickStats() {
    try {
        // Cập nhật thời gian hiện tại
        const now = new Date();
        const timeElem = document.getElementById('current-time');
        if (timeElem) {
            timeElem.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Đếm số đơn hôm nay
        const today = now.toISOString().slice(0, 10);
        const todayOrders = invoices.filter(inv => inv.createdAt && inv.createdAt.slice(0, 10) === today);
        const todayOrdersElem = document.getElementById('today-orders');
        if (todayOrdersElem) {
            todayOrdersElem.textContent = todayOrders.length;
        }
        
        // Tổng doanh thu hôm nay
        const todayRevenue = todayOrders.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const todayRevenueElem = document.getElementById('today-revenue');
        if (todayRevenueElem) {
            todayRevenueElem.textContent = formatPrice(todayRevenue);
        }
        
        // Số lượng hóa đơn chờ
        const invoiceCountElem = document.getElementById('invoice-count');
        if (invoiceCountElem) {
            invoiceCountElem.textContent = invoices.length;
        }
        
        debugLog('✅ Quick stats updated');
        
    } catch (error) {
        debugError('❌ Error updating quick stats:', error);
    }
}

function updateCategoryCounts() {
    try {
        const menuData = loadMenuData();
        const allCount = menuData.length;
        const cafeViet = menuData.filter(i => i.category === 'cafe-viet').length;
        const cafeY = menuData.filter(i => i.category === 'cafe-y').length;
        const traTraiCay = menuData.filter(i => i.category === 'tra-trai-cay').length;
        const khac = menuData.filter(i => i.category === 'khac').length;
        
        const setCount = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        
        setCount('count-all', allCount);
        setCount('count-cafe-viet', cafeViet);
        setCount('count-cafe-y', cafeY);
        setCount('count-tra-trai-cay', traTraiCay);
        setCount('count-khac', khac);
        
    } catch (error) {
        debugError('❌ Error updating category counts:', error);
    }
}

function updateAllUIStats() {
    updateQuickStats();
    updateCategoryCounts();
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
        
        updateCategoryCounts();
        
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
        
        // Cập nhật quick stats và category counts sau khi cập nhật đơn hàng
        updateAllUIStats();
        
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

/**
 * Improved initialization function with better error handling and retry logic
 */
function initializeApp() {
    try {
        // Prevent multiple simultaneous initializations
        if (initializationState.isInitializing) {
            debugLog('⚠️ App is already initializing, skipping...');
            return;
        }
        
        if (initializationState.isInitialized) {
            debugLog('✅ App is already initialized, skipping...');
            return;
        }
        
        initializationState.isInitializing = true;
        initializationState.attempts++;
        
        debugLog(`🚀 Initializing BalanCoffee app (attempt ${initializationState.attempts}/${initializationState.maxAttempts})...`);
        
        // Check if we've exceeded max attempts
        if (initializationState.attempts > initializationState.maxAttempts) {
            debugError('❌ Max initialization attempts exceeded');
            showNotification('Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.', 'error');
            initializationState.isInitializing = false;
            return;
        }
        
        showLoadingScreen('Đang khởi tạo ứng dụng...', true);
        
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            debugLog('⏳ DOM still loading, waiting...');
            initializationState.isInitializing = false;
            hideLoadingScreen();
            document.addEventListener('DOMContentLoaded', initializeApp);
            return;
        }
        
        // Use timeout to ensure all scripts are loaded
        setTimeout(() => {
            try {
                performInitialization();
            } catch (error) {
                handleInitializationError(error);
            }
        }, 100);
        
    } catch (error) {
        handleInitializationError(error);
    }
}

/**
 * Perform the actual initialization steps
 */
function performInitialization() {
    try {
        debugLog('🔍 Starting initialization steps...');
        
        // Step 1: Check if app container exists
        const appContainer = document.getElementById('app-container');
        if (!appContainer) {
            throw new Error('App container not found in DOM');
        }
        
        // Step 2: Check required DOM elements
        debugLog('🔍 Checking required DOM elements...');
        if (!checkRequiredElements()) {
            throw new Error('Required DOM elements are missing');
        }
        
        // Step 3: Wait for data to be ready
        waitForDataReady(() => {
            try {
                // Step 4: Initialize data loading
                if (!initializeAppData()) {
                    throw new Error('Failed to initialize app data');
                }
                  // Step 5: Complete initialization
                completeAppInitialization();
                
                // Mark as successfully initialized
                initializationState.isInitialized = true;
                initializationState.isInitializing = false;
                initializationState.lastError = null;
                
                debugLog('✅ App initialization completed successfully');
                
            } catch (error) {
                handleInitializationError(error);
            }        });
        
    } catch (error) {
        handleInitializationError(error);
    }
}

/**
 * Handle initialization errors with retry logic
 */
function handleInitializationError(error) {
    debugError('❌ Error during initialization:', error);
    initializationState.lastError = error;
    initializationState.isInitializing = false;
    
    hideLoadingScreen();
    
    if (initializationState.attempts < initializationState.maxAttempts) {
        debugLog(`🔄 Retrying initialization in 2 seconds... (attempt ${initializationState.attempts + 1}/${initializationState.maxAttempts})`);
        showNotification('Đang thử khởi tạo lại...', 'warning');
        
        setTimeout(() => {
            initializeApp();
        }, 2000);
    } else {
        debugError('❌ All initialization attempts failed');
        showNotification('Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.', 'error');
        
        // Show emergency fallback
        setTimeout(() => {
            if (window.emergencyShow) {
                window.emergencyShow();
            }
        }, 3000);
    }
}

/**
 * Improved data initialization with better error handling
 */
function initializeAppData() {
    try {
        debugLog('📋 Loading application data...');
        
        // Load menu data first with validation
        const menuData = loadMenuData();
        if (!menuData || !Array.isArray(menuData) || menuData.length === 0) {
            debugError('❌ Invalid menu data loaded');
            throw new Error('Menu data is invalid or empty');
        }
        
        const isValidMenuData = validateMenuData(menuData);
        debugLog(`📊 Menu data validation: ${isValidMenuData ? 'PASSED' : 'FAILED'}`);
        
        if (!isValidMenuData) {
            debugError('❌ Menu data validation failed');
            throw new Error('Menu data structure is invalid');
        }
        
        // Load invoices with error handling
        try {
            loadInvoices();
            debugLog('✅ Invoices loaded successfully');
        } catch (invoiceError) {
            debugError('⚠️ Error loading invoices, using empty array:', invoiceError);
            invoices = [];
            window.invoices = invoices;
        }
        
        // Set up category filters with error handling
        try {
            setupCategoryFilters();
            debugLog('✅ Category filters set up successfully');
        } catch (filterError) {
            debugError('⚠️ Error setting up category filters:', filterError);
            // Non-critical error, continue initialization
        }
        
        // Update shift display with error handling
        try {
            updateShiftDisplay();
            debugLog('✅ Shift display updated successfully');
        } catch (shiftError) {
            debugError('⚠️ Error updating shift display:', shiftError);
            // Non-critical error, continue initialization
        }
        
        // Update initial UI stats
        try {
            updateAllUIStats();
            debugLog('✅ UI stats updated successfully');
        } catch (statsError) {
            debugError('⚠️ Error updating UI stats:', statsError);
            // Non-critical error, continue initialization
        }
        
        return true;
        
    } catch (error) {
        debugError('❌ Critical error initializing app data:', error);
        return false;
    }
}

/**
 * Improved completion function with better timing and error handling
 */
function completeAppInitialization() {
    try {
        debugLog('🏁 Completing app initialization...');
        
        // Hide loading screen with proper timing
        hideLoadingScreen(0, () => {
            debugLog('💡 Loading screen hidden, showing app container...');
            
            try {
                // Show app container
                if (!showAppContainer()) {
                    throw new Error('Failed to show app container');
                }
                
                debugLog('✅ App container is now visible');
                
                // Render initial menu with proper delay
                setTimeout(() => {
                    try {
                        debugLog('🍽️ Starting initial menu render...');
                        renderMenu();
                        
                        // Final verification after a longer delay
                        setTimeout(() => {
                            verifyInitializationSuccess();
                        }, 1500);
                        
                    } catch (menuError) {
                        debugError('❌ Error rendering initial menu:', menuError);
                        throw menuError;
                    }
                }, 500); // Increased delay for better stability
                
            } catch (containerError) {
                debugError('❌ Error showing app container:', containerError);
                showNotification('Lỗi hiển thị ứng dụng', 'error');
                throw containerError;
            }
        });
        
    } catch (error) {
        debugError('❌ Error completing app initialization:', error);
        handleInitializationError(error);
    }
}

/**
 * Verify that initialization was successful
 */
function verifyInitializationSuccess() {
    try {
        const appContainer = document.getElementById('app-container');
        const menuGrid = document.getElementById('menu-grid');
        
        let issues = [];
        
        // Check app container visibility
        if (!appContainer || window.getComputedStyle(appContainer).display === 'none') {
            issues.push('App container is not visible');
        }
        
        // Check menu content
        if (!menuGrid || menuGrid.children.length === 0) {
            issues.push('Menu is empty');
        }
        
        // Check loading screen is hidden
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && window.getComputedStyle(loadingScreen).display !== 'none') {
            issues.push('Loading screen is still visible');
        }
        
        if (issues.length > 0) {
            debugError('❌ Initialization verification failed:', issues);
            
            // Try emergency fix
            if (window.emergencyShow) {
                debugLog('🚨 Running emergency show...');
                window.emergencyShow();
            }
        } else {
            debugLog('✅ Initialization verification passed - App is ready!');
            showNotification('BalanCoffee sẵn sàng!', 'success');
        }
        
    } catch (error) {
        debugError('❌ Error verifying initialization:', error);
    }
}

/**
 * Reset initialization state (for debugging)
 */
function resetInitialization() {
    const newState = {
        isInitializing: false,
        isInitialized: false,
        attempts: 0,
        maxAttempts: 3,
        lastError: null
    };
    
    Object.assign(initializationState, newState);
    window.initializationState = initializationState;
    debugLog('🔄 Initialization state reset');
}

// Expose reset function for debugging
window.resetInitialization = resetInitialization;
window.verifyInitializationSuccess = verifyInitializationSuccess;

// =============================================================================
// EMERGENCY FUNCTIONS (RESTORED)
// =============================================================================

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
    console.log('Initialization State:', initializationState);
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
                <button class="add-btn" onclick="addToOrder(${item.id})" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer;">
                    <i class="fas fa-plus"></i>
                    <span>Thêm</span>
                </button>
            </div>
        `).join('');
        console.log('🍽️ Emergency menu rendered');
    }
    
    console.log('🚨 EMERGENCY SHOW COMPLETED');
};

// =============================================================================
// DIAGNOSTIC FUNCTION
// =============================================================================

// Diagnostic function for debugging
window.debugSystem = function() {
    console.log('=== SYSTEM DEBUG INFO ===');
    console.log('App initialized:', initializationState.isInitialized);
    console.log('Is initializing:', initializationState.isInitializing);
    console.log('Initialization attempts:', initializationState.attempts);
    console.log('Last error:', initializationState.lastError);
    console.log('Menu data available:', !!window.menuData);
    console.log('Menu data valid:', validateMenuData(window.menuData || []));
    console.log('Current order items:', currentOrder.length);
    console.log('Current invoices:', invoices.length);
    console.log('Current shift employee:', currentShiftEmployee);
    console.log('Required elements check:', checkRequiredElements());
    console.log('Loading functions:', {
        showLoadingScreen: typeof showLoadingScreen === 'function',
        hideLoadingScreen: typeof hideLoadingScreen === 'function'
    });
    console.log('Core functions:', {
        initializeApp: typeof initializeApp === 'function',
        forceShowApp: typeof forceShowApp === 'function',
        emergencyShow: typeof window.emergencyShow === 'function'
    });
    console.log('========================');
};

// =============================================================================
// FINAL WINDOW EXPORTS
// =============================================================================

// Expose all critical functions to window
window.forceShowApp = forceShowApp;
window.debugVisibility = debugVisibility;
window.initializeApp = initializeApp;
window.resetInitialization = resetInitialization;
window.verifyInitializationSuccess = verifyInitializationSuccess;

// =============================================================================
// FINAL INITIALIZATION CALL
// =============================================================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    debugLog('🎯 DOM ContentLoaded event fired, starting initialization...');
    initializeApp();
});

// Fallback: If DOMContentLoaded already fired
if (document.readyState !== 'loading') {
    debugLog('🎯 DOM already ready, starting initialization immediately...');
    setTimeout(initializeApp, 100);
}

// Emergency fallback: If app is not visible after 10 seconds, force show it
setTimeout(() => {
    if (!initializationState.isInitialized) {
        console.warn('⚠️ App not initialized after 10 seconds, running emergency procedures...');
        
        if (window.emergencyShow) {
            window.emergencyShow();
        }
        
        if (window.forceShowApp) {
            window.forceShowApp();
        }
    }
}, 10000);

// Global error handlers for unhandled errors
window.addEventListener('error', function(e) {
    debugError('❌ Global error:', e.error);
    
    // If error occurs during initialization, handle it
    if (initializationState.isInitializing) {
        handleInitializationError(e.error);
    } else {
        showNotification('Đã xảy ra lỗi không mong muốn', 'error');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    debugError('❌ Unhandled promise rejection:', e.reason);
    
    // If error occurs during initialization, handle it
    if (initializationState.isInitializing) {
        handleInitializationError(e.reason);
    } else {
        showNotification('Đã xảy ra lỗi không mong muốn', 'error');
    }
});

// Update quick stats every minute
setInterval(() => {
    try {
        updateQuickStats();
    } catch (error) {
        debugError('❌ Error updating quick stats:', error);
    }
}, 60000);

debugLog('📋 BalanCoffee script loaded - Version 8.3 with Improved Initialization System');
