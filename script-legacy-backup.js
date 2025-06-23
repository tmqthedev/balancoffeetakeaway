// BalanCoffee - Main Application Script
// Version: 8.4 - Fixed Initialization

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
        
        if (filteredData.length === 0) {            menuContainer.innerHTML = `
                <div class="no-items">
                    <div class="no-items-content">
                        <i class="fas fa-coffee"></i>
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
// INITIALIZATION STATE TRACKING
// =============================================================================

// Add initialization state tracking
let initializationState = {
    isInitializing: false,
    isInitialized: false,
    attempts: 0,
    maxAttempts: 3,
    lastError: null
};

// Expose initialization state for debugging
window.initializationState = initializationState;

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

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
                debugLog('🔍 Performing pre-initialization checks...');
                
                // Check if app container exists
                const appContainer = document.getElementById('app-container');
                if (!appContainer) {
                    throw new Error('App container not found in DOM');
                }
                
                // Check required DOM elements
                if (!checkRequiredElements()) {
                    debugLog('⚠️ Some required elements missing, but continuing...');
                }
                
                // Perform actual initialization
                performActualInitialization();
                
                // Mark as successfully initialized
                initializationState.isInitialized = true;
                initializationState.isInitializing = false;
                initializationState.lastError = null;
                
                debugLog('✅ App initialization completed successfully');
                
                // Verify initialization after a short delay
                setTimeout(verifyInitializationSuccess, 500);
                
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
// WINDOW EXPORTS - ALL FUNCTIONS
// =============================================================================

// Export critical functions to window for HTML usage
window.toggleSidebar = toggleSidebar;
window.toggleAdminDropdown = toggleAdminDropdown;
window.openAdminDropdown = openAdminDropdown;
window.closeAdminDropdown = closeAdminDropdown;
window.closeAllDropdowns = closeAllDropdowns;

// Export shift management functions
window.startNewShift = startNewShift;
window.viewCurrentShift = viewCurrentShift;
window.pauseShift = pauseShift;
window.endShift = endShift;
window.exportData = exportData;
window.clearAllInvoices = clearAllInvoices;

// Export invoice management functions
window.filterInvoices = filterInvoices;
window.createNewInvoice = createNewInvoice;
window.deselectInvoice = deselectInvoice;
window.deleteInvoiceById = deleteInvoiceById;
window.viewInvoice = viewInvoice;

// Export modal functions
window.closeOrderModal = closeOrderModal;
window.deleteInvoice = deleteInvoice;
window.confirmOrder = confirmOrder;
window.proceedToPayment = proceedToPayment;
window.closePaymentModal = closePaymentModal;
window.closeEmployeeModal = closeEmployeeModal;
window.closeSuccessModal = closeSuccessModal;
window.closeEndShiftModal = closeEndShiftModal;

// Export form functions
window.confirmEmployeeInfo = confirmEmployeeInfo;
window.confirmEndShift = confirmEndShift;
window.confirmPayment = confirmPayment;

// Export utility functions
window.handleBackdropKeydown = handleBackdropKeydown;
window.addToOrder = addToOrder;
window.updateQuantity = updateQuantity;

// Export initialization functions
window.initializeApp = initializeApp;
window.forceShowApp = forceShowApp;
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

debugLog('📋 BalanCoffee script fully loaded - Version 8.4 with Fixed Initialization');

function handleBackdropKeydown(event) {
    // Handle Enter and Space key presses on backdrop
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSidebar();
    }
    // Handle Escape key
    if (event.key === 'Escape') {
        event.preventDefault();
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            toggleSidebar();
        }
    }
}

// =============================================================================
// SIDEBAR AND UI FUNCTIONS
// =============================================================================

/**
 * Toggle sidebar visibility with mobile optimization
 */
function toggleSidebar() {
    try {
        debugLog('🔄 Toggling sidebar...');
        
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (!sidebar) {
            debugError('❌ Sidebar element not found');
            showNotification('Lỗi: Không tìm thấy sidebar', 'error');
            return;
        }
        
        // Force sidebar to be visible first (in case CSS is hiding it completely)
        if (window.getComputedStyle(sidebar).display === 'none') {
            sidebar.style.display = 'block';
        }
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Show sidebar
            sidebar.classList.remove('collapsed');
            sidebar.setAttribute('aria-hidden', 'false');
              // Show backdrop on mobile
            if (backdrop) {
                // Đảm bảo backdrop hiển thị trước khi thêm hiệu ứng
                backdrop.style.display = 'block';
                // Thêm một độ trễ nhỏ để đảm bảo transition hoạt động
                requestAnimationFrame(() => {
                    backdrop.classList.add('show');
                });
            }
            
            // Update toggle button
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'true');
                toggleBtn.setAttribute('aria-label', 'Đóng menu');
            }
            
            // Focus management for accessibility
            const firstFocusable = sidebar.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            debugLog('✅ Sidebar opened');
            
        } else {
            // Hide sidebar
            sidebar.classList.add('collapsed');
            sidebar.setAttribute('aria-hidden', 'true');
              // Hide backdrop
            if (backdrop) {
                backdrop.classList.remove('show');
                // Đợi hiệu ứng transition hoàn tất trước khi ẩn hoàn toàn
                const transitionDuration = 300; // ms, phù hợp với time của transition trong CSS
                setTimeout(() => {
                    backdrop.style.display = 'none';
                }, transitionDuration);
            }
            
            // Update toggle button
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.setAttribute('aria-label', 'Mở menu');
                toggleBtn.focus(); // Return focus to toggle button
            }
            
            debugLog('✅ Sidebar closed');
        }
        
        // Trigger haptic feedback on mobile
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
        
    } catch (error) {
        debugError('❌ Error toggling sidebar:', error);
        showNotification('Lỗi khi thao tác với menu', 'error');
    }
}

/**
 * Toggle admin dropdown with proper state management
 */
function toggleAdminDropdown() {
    try {
        debugLog('🔄 Toggling admin dropdown...');
        
        const dropdown = document.getElementById('admin-dropdown');
        const dropdownBtn = document.querySelector('.admin-dropdown-btn');
        
        if (!dropdown) {
            debugError('❌ Admin dropdown element not found');
            showNotification('Lỗi: Không tìm thấy menu quản lý', 'error');
            return;
        }
        
        // Fix: Log dropdown element found
        debugLog('✅ Admin dropdown found:', dropdown);
        
        const isOpen = dropdown.classList.contains('show');
        
        // Close all other dropdowns first
        closeAllDropdowns();
        
        if (!isOpen) {
            // Open dropdown
            dropdown.classList.add('show');
            dropdown.setAttribute('aria-hidden', 'false');
            
            // Update button state
            if (dropdownBtn) {
                dropdownBtn.setAttribute('aria-expanded', 'true');
                dropdownBtn.classList.add('active');
            }
            
            // Focus first item
            const firstItem = dropdown.querySelector('button, [href]');
            if (firstItem) {
                firstItem.focus();
            }
            
            // Add click outside listener
            setTimeout(() => {
                document.addEventListener('click', handleClickOutsideDropdown);
            }, 100);
            
            debugLog('✅ Admin dropdown opened');
            
        } else {
            // Close dropdown
            closeAdminDropdown();
        }
        
        // Trigger haptic feedback on mobile
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
        
    } catch (error) {
        debugError('❌ Error toggling admin dropdown:', error);
        showNotification('Lỗi khi thao tác với menu quản lý', 'error');
    }
}

/**
 * Open admin dropdown
 */
function openAdminDropdown() {
    try {
        const dropdown = document.getElementById('admin-dropdown');
        
        if (dropdown && !dropdown.classList.contains('show')) {
            toggleAdminDropdown();
        }
    } catch (error) {
        debugError('❌ Error opening admin dropdown:', error);
    }
}

/**
 * Close admin dropdown
 */
function closeAdminDropdown() {
    try {
        const dropdown = document.getElementById('admin-dropdown');
        const dropdownBtn = document.querySelector('.admin-dropdown-btn');
        
        if (!dropdown) return;
        
        dropdown.classList.remove('show');
        dropdown.setAttribute('aria-hidden', 'true');
        
        if (dropdownBtn) {
            dropdownBtn.setAttribute('aria-expanded', 'false');
            dropdownBtn.classList.remove('active');
        }
        
        // Remove click outside listener
        document.removeEventListener('click', handleClickOutsideDropdown);
        
        debugLog('✅ Admin dropdown closed');
        
    } catch (error) {
        debugError('❌ Error closing admin dropdown:', error);
    }
}

/**
 * Close all dropdowns
 */
function closeAllDropdowns() {
    try {
        const dropdowns = document.querySelectorAll('.dropdown.show');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
            dropdown.setAttribute('aria-hidden', 'true');
        });
        
        const dropdownBtns = document.querySelectorAll('.dropdown-btn.active, .admin-dropdown-btn.active');
        dropdownBtns.forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('active');
        });
        
        document.removeEventListener('click', handleClickOutsideDropdown);
        
    } catch (error) {
        debugError('❌ Error closing all dropdowns:', error);
    }
}

/**
 * Handle click outside dropdown
 */
function handleClickOutsideDropdown(event) {
    const dropdown = document.getElementById('admin-dropdown');
    const dropdownBtn = document.querySelector('.admin-dropdown-btn');
    
    if (dropdown && dropdownBtn) {
        if (!dropdown.contains(event.target) && !dropdownBtn.contains(event.target)) {
            closeAdminDropdown();
        }
    }
}

// =============================================================================
// INVOICE MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Create a new invoice from current order
 */
function createNewInvoice() {
    try {
        debugLog('📄 Creating new invoice...');
        
        // Validate current order
        if (!currentOrder || currentOrder.length === 0) {
            showNotification('Không có sản phẩm nào trong đơn hàng', 'warning');
            debugLog('⚠️ Cannot create invoice: empty order');
            return;
        }
        
        // Calculate total
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (total <= 0) {
            showNotification('Tổng tiền phải lớn hơn 0', 'error');
            debugLog('⚠️ Cannot create invoice: invalid total');
            return;
        }
        
        // Generate new invoice ID
        const invoiceId = `INV${Date.now()}`;
        const now = new Date().toISOString();
        
        // Create invoice object
        const newInvoice = {
            id: invoiceId,
            items: [...currentOrder], // Create a copy
            total: total,
            createdAt: now,
            status: 'pending',
            customerName: '',
            notes: '',
            paymentMethod: '',
            employeeName: currentShiftEmployee || '',
            shiftId: shiftStartTime ? `SHIFT_${shiftStartTime}` : ''
        };
        
        // Add to invoices array
        invoices.unshift(newInvoice); // Add to beginning for recent-first order
        window.invoices = invoices;
        
        // Save to localStorage
        saveInvoices();
        
        // Clear current order
        currentOrder = [];
        window.currentOrder = currentOrder;
        
        // Update UI
        updateOrderDisplay();
        updateAllUIStats();
        
        // Update invoice list if visible
        if (typeof updateInvoiceList === 'function') {
            updateInvoiceList();
        }
        
        // Set as current invoice for editing
        currentInvoiceId = invoiceId;
        window.currentInvoiceId = currentInvoiceId;
        
        debugLog(`✅ New invoice created: ${invoiceId}`);
        showNotification(`Đã tạo hóa đơn ${invoiceId}`, 'success');
        
        // Show payment modal or order confirmation modal
        setTimeout(() => {
            if (typeof showOrderModal === 'function') {
                showOrderModal(invoiceId);
            } else {
                showNotification('Hóa đơn đã được tạo và lưu', 'info');
            }
        }, 500);
        
        return invoiceId;
        
    } catch (error) {
        debugError('❌ Error creating new invoice:', error);
        showNotification('Lỗi tạo hóa đơn: ' + error.message, 'error');
        return null;
    }
}

/**
 * Filter invoices by status, date, or search term
 */
function filterInvoices(filterType, filterValue) {
    try {
        debugLog(`🔍 Filtering invoices by ${filterType}: ${filterValue}`);
        
        if (!Array.isArray(invoices)) {
            debugLog('⚠️ No invoices to filter');
            return [];
        }
        
        let filteredInvoices = [...invoices];
        
        switch (filterType) {
            case 'status':
                filteredInvoices = filterByStatus(filteredInvoices, filterValue);
                break;
                
            case 'date':
                filteredInvoices = filterByDate(filteredInvoices, filterValue);
                break;
                
            case 'search':
                filteredInvoices = filterBySearch(filteredInvoices, filterValue);
                break;
                
            case 'employee':
                filteredInvoices = filterByEmployee(filteredInvoices, filterValue);
                break;
                
            case 'shift':
                filteredInvoices = filterByShift(filteredInvoices, filterValue);
                break;
                
            default:
                debugLog(`⚠️ Unknown filter type: ${filterType}`);
                break;
        }
        
        // Update invoice list display
        if (typeof renderInvoiceList === 'function') {
            renderInvoiceList(filteredInvoices);
        }
        
        debugLog(`✅ Filtered ${filteredInvoices.length} invoices from ${invoices.length} total`);
        showNotification(`Tìm thấy ${filteredInvoices.length} hóa đơn`, 'info');
        
        return filteredInvoices;
        
    } catch (error) {
        debugError('❌ Error filtering invoices:', error);
        showNotification('Lỗi lọc hóa đơn: ' + error.message, 'error');
        return [];
    }
}

/**
 * Filter helper functions
 */
function filterByStatus(invoices, filterValue) {
    if (filterValue && filterValue !== 'all') {
        return invoices.filter(invoice => invoice.status === filterValue);
    }
    return invoices;
}

function filterByDate(invoices, filterValue) {
    if (filterValue) {
        const targetDate = new Date(filterValue).toISOString().slice(0, 10);
        return invoices.filter(invoice => 
            invoice.createdAt && invoice.createdAt.slice(0, 10) === targetDate
        );
    }
    return invoices;
}

function filterBySearch(invoices, filterValue) {
    if (filterValue?.trim()) {
        const searchTerm = filterValue.trim().toLowerCase();
        return invoices.filter(invoice => 
            invoice.id.toLowerCase().includes(searchTerm) ||
            invoice.customerName?.toLowerCase().includes(searchTerm) ||
            invoice.notes?.toLowerCase().includes(searchTerm) ||
            invoice.employeeName?.toLowerCase().includes(searchTerm)
        );
    }
    return invoices;
}

function filterByEmployee(invoices, filterValue) {
    if (filterValue && filterValue !== 'all') {
        return invoices.filter(invoice => invoice.employeeName === filterValue);
    }
    return invoices;
}

function filterByShift(invoices, filterValue) {
    if (filterValue && filterValue !== 'all') {
        return invoices.filter(invoice => invoice.shiftId === filterValue);
    }
    return invoices;
}

// =============================================================================
// SHIFT MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Start a new work shift
 */
function startNewShift() {
    try {
        debugLog('🚀 Starting new shift...');
        
        // Check if there's already an active shift
        if (shiftStartTime && currentShiftEmployee) {
            const confirmEnd = confirm('Có ca làm việc đang hoạt động. Bạn có muốn kết thúc ca hiện tại và bắt đầu ca mới không?');
            if (!confirmEnd) {
                debugLog('⚠️ User cancelled starting new shift');
                return;
            }
            
            // End current shift first
            if (typeof endShift === 'function') {
                endShift();
            }
        }
        
        // Show employee info modal or prompt
        if (typeof showEmployeeModal === 'function') {
            showEmployeeModal();
        } else {
            // Fallback: simple prompts
            const employeeName = prompt('Nhập tên nhân viên:');
            if (!employeeName || employeeName.trim() === '') {
                showNotification('Tên nhân viên không được để trống', 'error');
                return;
            }
            
            const shiftNote = prompt('Ghi chú ca làm việc (tùy chọn):') || '';
            
            // Start the shift
            const now = new Date();
            shiftStartTime = now.toISOString();
            currentShiftEmployee = employeeName.trim();
            currentShiftNote = shiftNote.trim();
            
            // Update global references
            window.shiftStartTime = shiftStartTime;
            window.currentShiftEmployee = currentShiftEmployee;
            window.currentShiftNote = currentShiftNote;
            
            // Save to localStorage
            localStorage.setItem('balancoffee_shift_start', shiftStartTime);
            localStorage.setItem('balancoffee_shift_employee', currentShiftEmployee);
            localStorage.setItem('balancoffee_shift_note', currentShiftNote);
            
            // Update UI
            updateShiftDisplay();
            updateAllUIStats();
            
            debugLog(`✅ New shift started by ${currentShiftEmployee} at ${formatDateTime(shiftStartTime)}`);
            showNotification(`Ca làm việc của ${currentShiftEmployee} đã bắt đầu`, 'success');
            
            // Trigger haptic feedback on mobile
            if (window.triggerHapticFeedback) {
                window.triggerHapticFeedback('medium');
            }
        }
        
    } catch (error) {
        debugError('❌ Error starting new shift:', error);
        showNotification('Lỗi bắt đầu ca làm việc: ' + error.message, 'error');
    }
}

/**
 * Update shift display in the UI
 */
function updateShiftDisplay() {
    try {
        const elements = getShiftDisplayElements();
        
        if (shiftStartTime && currentShiftEmployee) {
            updateActiveShiftDisplay(elements);
        } else {
            updateInactiveShiftDisplay(elements);
        }
        
        debugLog('✅ Shift display updated');
        
    } catch (error) {
        debugError('❌ Error updating shift display:', error);
    }
}

/**
 * Get shift display elements
 */
function getShiftDisplayElements() {
    return {
        shiftStatus: document.getElementById('shift-status'),
        shiftEmployee: document.getElementById('shift-employee'),
        shiftStartTime: document.getElementById('shift-start-time'),
        shiftDuration: document.getElementById('shift-duration'),
        shiftNote: document.getElementById('shift-note')
    };
}

/**
 */
function startNewShift() {
    try {
        debugLog('🚀 Starting new shift...');
        
        // Check if there's already an active shift
        if (shiftStartTime && currentShiftEmployee) {
            const confirmEnd = confirm('Có ca làm việc đang hoạt động. Bạn có muốn kết thúc ca hiện tại và bắt đầu ca mới không?');
            if (!confirmEnd) {
                debugLog('⚠️ User cancelled starting new shift');
                return;
            }
            
            // End current shift first
            if (typeof endShift === 'function') {
                endShift();
            }
        }
        
        // Show employee info modal or prompt
        if (typeof showEmployeeModal === 'function') {
            showEmployeeModal();
        } else {
            // Fallback: simple prompts
            const employeeName = prompt('Nhập tên nhân viên:');
            if (!employeeName || employeeName.trim() === '') {
                showNotification('Tên nhân viên không được để trống', 'error');
                return;
            }
            
            const shiftNote = prompt('Ghi chú ca làm việc (tùy chọn):') || '';
            
            // Start the shift
            const now = new Date();
            shiftStartTime = now.toISOString();
            currentShiftEmployee = employeeName.trim();
            currentShiftNote = shiftNote.trim();
            
            // Update global references
            window.shiftStartTime = shiftStartTime;
            window.currentShiftEmployee = currentShiftEmployee;
            window.currentShiftNote = currentShiftNote;
            
            // Save to localStorage
            localStorage.setItem('balancoffee_shift_start', shiftStartTime);
            localStorage.setItem('balancoffee_shift_employee', currentShiftEmployee);
            localStorage.setItem('balancoffee_shift_note', currentShiftNote);
            
            // Update UI
            updateShiftDisplay();
            updateAllUIStats();
            
            debugLog(`✅ New shift started by ${currentShiftEmployee} at ${formatDateTime(shiftStartTime)}`);
            showNotification(`Ca làm việc của ${currentShiftEmployee} đã bắt đầu`, 'success');
            
            // Trigger haptic feedback on mobile
            if (window.triggerHapticFeedback) {
                window.triggerHapticFeedback('medium');
            }
        }
        
    } catch (error) {
        debugError('❌ Error starting new shift:', error);
        showNotification('Lỗi bắt đầu ca làm việc: ' + error.message, 'error');
    }
}

/**
 * Update shift display in the UI
 */
function updateShiftDisplay() {
    try {
        const elements = getShiftDisplayElements();
        
        if (shiftStartTime && currentShiftEmployee) {
            updateActiveShiftDisplay(elements);
        } else {
            updateInactiveShiftDisplay(elements);
        }
        
        debugLog('✅ Shift display updated');
        
    } catch (error) {
        debugError('❌ Error updating shift display:', error);
    }
}

/**
 * Get shift display elements
 */
function getShiftDisplayElements() {
    return {
        shiftStatus: document.getElementById('shift-status'),
        shiftEmployee: document.getElementById('shift-employee'),
        shiftStartTime: document.getElementById('shift-start-time'),
        shiftDuration: document.getElementById('shift-duration'),
        shiftNote: document.getElementById('shift-note')
    };
}

/**
 * Update active shift display
 */
function updateActiveShiftDisplay(elements) {
    try {
        if (elements.shiftStatus) {
            elements.shiftStatus.textContent = 'Đang hoạt động';
            elements.shiftStatus.className = 'shift-status active';
        }
        
        if (elements.shiftEmployee) {
            elements.shiftEmployee.textContent = currentShiftEmployee;
        }
        
        if (elements.shiftStartTime) {
            elements.shiftStartTime.textContent = formatDateTime(shiftStartTime);
        }
        
        if (elements.shiftNote) {
            elements.shiftNote.textContent = currentShiftNote || 'Không có ghi chú';
        }
        
        // Update duration periodically
        if (elements.shiftDuration) {
            const updateDuration = () => {
                if (shiftStartTime) {
                    const now = new Date();
                    const start = new Date(shiftStartTime);
                    const duration = Math.floor((now - start) / 1000 / 60); // minutes
                    
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;
                    
                    elements.shiftDuration.textContent = `${hours}h ${minutes}m`;
                }
            };
            
            updateDuration();
            // Update every minute
            if (!window.shiftDurationInterval) {
                window.shiftDurationInterval = setInterval(updateDuration, 60000);
            }
        }
        
    } catch (error) {
        debugError('❌ Error updating active shift display:', error);
    }
}

/**
 * Update inactive shift display
 */
function updateInactiveShiftDisplay(elements) {
    try {
        if (elements.shiftStatus) {
            elements.shiftStatus.textContent = 'Chưa bắt đầu';
            elements.shiftStatus.className = 'shift-status inactive';
        }
        
        if (elements.shiftEmployee) {
            elements.shiftEmployee.textContent = 'Chưa có nhân viên';
        }
        
        if (elements.shiftStartTime) {
            elements.shiftStartTime.textContent = '-';
        }
        
        if (elements.shiftDuration) {
            elements.shiftDuration.textContent = '-';
        }
        
        if (elements.shiftNote) {
            elements.shiftNote.textContent = '-';
        }
        
        // Clear duration interval
        if (window.shiftDurationInterval) {
            clearInterval(window.shiftDurationInterval);
            window.shiftDurationInterval = null;
        }
        
    } catch (error) {
        debugError('❌ Error updating inactive shift display:', error);
    }
}

// =============================================================================
// MISSING HELPER FUNCTIONS
// =============================================================================

/**
 * Setup category filters
 */
function setupCategoryFilters() {
    try {
        debugLog('🏷️ Setting up category filters...');
        
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', handleCategoryClick);
            
            // Set initial active state
            const category = btn.getAttribute('data-category');
            if (category === currentCategory) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
        
        debugLog('✅ Category filters set up successfully');
        
    } catch (error) {
        debugError('❌ Error setting up category filters:', error);
    }
}

/**
 * Handle category click
 */
function handleCategoryClick(event) {
    try {
        const btn = event.currentTarget;
        const category = btn.getAttribute('data-category');
        
        if (!category) {
            debugError('❌ Category not found in button');
            return;
        }
        
        // Update current category
        currentCategory = category;
        window.currentCategory = currentCategory;
        
        // Update button states
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // Re-render menu with new filter
        renderMenu();
        
        debugLog(`✅ Category changed to: ${category}`);
        
    } catch (error) {
        debugError('❌ Error handling category click:', error);
    }
}

/**
 * Perform actual initialization
 */
function performActualInitialization() {
    try {
        debugLog('⚙️ Performing actual initialization...');
        
        // Initialize app data
        const dataInitialized = initializeAppData();
        if (!dataInitialized) {
            throw new Error('Failed to initialize app data');
        }
        
        // Complete initialization
        completeAppInitialization();
        
        debugLog('✅ Actual initialization completed');
        
    } catch (error) {
        debugError('❌ Error in actual initialization:', error);
        throw error;
    }
}

// =============================================================================
// ADDITIONAL MISSING FUNCTIONS
// =============================================================================

/**
 * View current shift details
 */
function viewCurrentShift() {
    try {
        if (!shiftStartTime || !currentShiftEmployee) {
            showNotification('Không có ca làm việc nào đang hoạt động', 'info');
            return;
        }
        
        const now = new Date();
        const start = new Date(shiftStartTime);
        const duration = Math.floor((now - start) / 1000 / 60);
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        
        const shiftInfo = `
Nhân viên: ${currentShiftEmployee}
Bắt đầu: ${formatDateTime(shiftStartTime)}
Thời gian: ${hours}h ${minutes}m
Ghi chú: ${currentShiftNote || 'Không có'}
        `;
        
        alert(shiftInfo);
        
    } catch (error) {
        debugError('❌ Error viewing current shift:', error);
        showNotification('Lỗi xem thông tin ca làm việc', 'error');
    }
}

/**
 * Pause current shift
 */
function pauseShift() {
    try {
        if (!shiftStartTime) {
            showNotification('Không có ca làm việc nào đang hoạt động', 'warning');
            return;
        }
        
        showNotification('Tính năng tạm dừng ca làm việc sẽ được phát triển', 'info');
        
    } catch (error) {
        debugError('❌ Error pausing shift:', error);
        showNotification('Lỗi tạm dừng ca làm việc', 'error');
    }
}

/**
 * End current shift
 */
function endShift() {
    try {
        if (!shiftStartTime || !currentShiftEmployee) {
            showNotification('Không có ca làm việc nào đang hoạt động', 'warning');
            return;
        }
        
        if (typeof showEndShiftModal === 'function') {
            showEndShiftModal();
        } else {
            const confirmEnd = confirm(`Bạn có chắc muốn kết thúc ca làm việc của ${currentShiftEmployee}?`);
            if (confirmEnd) {
                // Clear shift data
                shiftStartTime = null;
                currentShiftEmployee = null;
                currentShiftNote = null;
                
                // Update global references
                window.shiftStartTime = shiftStartTime;
                window.currentShiftEmployee = currentShiftEmployee;
                window.currentShiftNote = currentShiftNote;
                
                // Clear localStorage
                localStorage.removeItem('balancoffee_shift_start');
                localStorage.removeItem('balancoffee_shift_employee');
                localStorage.removeItem('balancoffee_shift_note');
                
                // Update UI
                updateShiftDisplay();
                updateAllUIStats();
                
                showNotification('Ca làm việc đã kết thúc', 'success');
            }
        }
        
    } catch (error) {
        debugError('❌ Error ending shift:', error);
    } catch (error) {
        debugError('❌ Error closing success modal:', error);
    }
}

/**
 * Additional placeholder functions for completeness
 */
function deselectInvoice() { debugLog('deselectInvoice called'); }
function deleteInvoiceById(id) { debugLog(`deleteInvoiceById called with ${id}`); }
function viewInvoice(id) { debugLog(`viewInvoice called with ${id}`); }
function deleteInvoice() { debugLog('deleteInvoice called'); }
function confirmOrder() { debugLog('confirmOrder called'); }
function proceedToPayment() { debugLog('proceedToPayment called'); }
function closePaymentModal() { debugLog('closePaymentModal called'); }
function closeEndShiftModal() { debugLog('closeEndShiftModal called'); }
function confirmEmployeeInfo() { debugLog('confirmEmployeeInfo called'); }
function confirmEndShift() { debugLog('confirmEndShift called'); }
function confirmPayment() { debugLog('confirmPayment called'); }

// =============================================================================
// SIDEBAR AND UI FUNCTIONS
// =============================================================================
