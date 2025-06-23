/**
 * BalanCoffee - Application Initializer Module
 * Xử lý khởi tạo ứng dụng và thiết lập ban đầu
 */

// =============================================================================
// SAFE WRAPPER FUNCTIONS
// =============================================================================

/**
 * Safe error handler wrapper
 */
function safeErrorHandler(message, error) {
    if (typeof window !== 'undefined' && window.debugError && typeof window.debugError === 'function') {
        window.debugError(message, error);
    } else {
        console.error(`[BalanCoffee ERROR] ${message}`, error);
    }
}

/**
 * Safe log wrapper
 */
function safeLog(message, ...args) {
    if (typeof window !== 'undefined' && window.debugLog && typeof window.debugLog === 'function') {
        window.debugLog(message, ...args);
    } else {
        console.log(`[BalanCoffee] ${message}`, ...args);
    }
}

/**
 * Fallback debug functions in case debug-helper.js is not loaded yet
 */
function ensureDebugFunctions() {
    // Ensure window object exists
    if (typeof window === 'undefined') {
        console.error('Window object not available');
        return;
    }
    
    if (!window.debugLog) {
        window.debugLog = function(message, ...args) {
            console.log(`[BalanCoffee] ${message}`, ...args);
        };
    }
    
    if (!window.debugError) {
        window.debugError = function(message, ...args) {
            console.error(`[BalanCoffee ERROR] ${message}`, ...args);
        };
    }
    
    if (!window.debugWarn) {
        window.debugWarn = function(message, ...args) {
            console.warn(`[BalanCoffee WARN] ${message}`, ...args);
        };
    }
    
    if (!window.withErrorHandling) {
        window.withErrorHandling = function(fn, context = 'unknown') {
            return function(...args) {
                try {
                    return fn.apply(this, args);
                } catch (error) {
                    console.error(`Error in ${context}:`, error);
                    return null;
                }
            };
        };
    }
}

// Ensure debug functions are available immediately
ensureDebugFunctions();

// =============================================================================
// INITIALIZATION FUNCTIONS
// =============================================================================

/**
 * Initialize the BalanCoffee application
 */
function initializeApp() {
    // Ensure debug functions are available first
    ensureDebugFunctions();
    
    try {
        safeLog('🚀 Initializing BalanCoffee application...');
        
        // Show loading screen
        if (window.showLoadingScreen) {
            window.showLoadingScreen('Đang khởi tạo ứng dụng...', true);
        }
        
        // Initialize modules in order
        initializeGlobalVariables();
        loadStoredData();
        initializeUI();
        setupEventListeners();
        setupErrorHandlers();
        
        // Final initialization steps
        finalizeInitialization();        
        safeLog('✅ BalanCoffee application initialized successfully');
        
    } catch (error) {
        safeErrorHandler('❌ Critical error during app initialization:', error);
        handleInitializationError(error);
    }
}

/**
 * Initialize global variables
 */
function initializeGlobalVariables() {
    try {
        safeLog('🔄 Initializing global variables...');
        
        // Initialize core variables if not already set
        if (!window.currentOrder) window.currentOrder = [];
        if (!window.invoices) window.invoices = [];
        if (!window.orderHistory) window.orderHistory = [];
        if (!window.currentInvoiceId) window.currentInvoiceId = null;
        if (!window.currentCategory) window.currentCategory = 'all';
        if (!window.isAdminMode) window.isAdminMode = false;
        if (!window.shiftStartTime) window.shiftStartTime = null;
        if (!window.currentShiftEmployee) window.currentShiftEmployee = null;
        if (!window.currentShiftNote) window.currentShiftNote = null;
        
        safeLog('✅ Global variables initialized');
        
    } catch (error) {
        safeErrorHandler('❌ Error initializing global variables:', error);
        throw error;
    }
}

/**
 * Load stored data from localStorage
 */
function loadStoredData() {
    try {
        safeLog('📖 Loading stored data...');
        
        // Load invoices
        if (window.loadInvoicesData) {
            window.loadInvoicesData();
        }
        
        // Load shift data
        if (window.loadShiftData) {
            window.loadShiftData();
        }
        
        // Load menu data
        if (window.loadMenuData) {
            window.loadMenuData();
        }
        
        safeLog('✅ Stored data loaded');
        
    } catch (error) {
        safeErrorHandler('❌ Error loading stored data:', error);
        // Continue with fallback data
        loadFallbackData();
    }
}

/**
 * Load fallback data if stored data fails
 */
function loadFallbackData() {
    try {
        safeLog('⚠️ Loading fallback data...');
          // Use fallback menu from config
        if (window.BalanCoffeeConfig?.FALLBACK_MENU) {
            window.menuData = window.BalanCoffeeConfig.FALLBACK_MENU;
        }
        
        safeLog('✅ Fallback data loaded');
        
    } catch (error) {
        safeErrorHandler('❌ Error loading fallback data:', error);
    }
}

/**
 * Initialize UI components
 */
function initializeUI() {
    try {
        safeLog('🎨 Initializing UI components...');
        
        // Check required DOM elements
        checkRequiredElements();
        
        // Initialize menu display
        if (window.renderMenu) {
            window.renderMenu();
        }
        
        // Update shift display
        if (window.updateShiftDisplay) {
            window.updateShiftDisplay();
        }
        
        // Update UI stats
        if (window.updateAllUIStats) {
            window.updateAllUIStats();
        }
        
        // Initialize category filters
        if (window.updateCategoryCounts) {
            window.updateCategoryCounts();
        }
        
        safeLog('✅ UI components initialized');
        
    } catch (error) {
        safeErrorHandler('❌ Error initializing UI:', error);
        throw error;
    }
}

/**
 * Check if required DOM elements exist
 */
function checkRequiredElements() {
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        safeLog('⏳ DOM still loading, waiting...');
        return false; // Skip check if DOM not ready
    }
    
    const requiredElements = window.BalanCoffeeConfig?.REQUIRED_ELEMENTS || [
        'app-container',
        'menu-grid', 
        'order-items',
        'order-total'
    ];
    
    const missingElements = [];
    const foundElements = [];
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            missingElements.push(elementId);
        } else {
            foundElements.push(elementId);
        }
    });
    
    safeLog(`🔍 DOM Elements Check: Found ${foundElements.length}/${requiredElements.length} elements`);
    
    if (missingElements.length > 0) {
        const error = new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
        safeErrorHandler('❌ Missing required elements:', error);
        safeLog('ℹ️ Found elements: ' + foundElements.join(', '));
        safeLog('ℹ️ Document ready state: ' + document.readyState);
        
        // Don't throw error in initialization, just warn
        safeLog('⚠️ Continuing initialization without all DOM elements');
        return false;
    }
    
    safeLog('✅ All required DOM elements found');
    return true;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    try {
        safeLog('👂 Setting up event listeners...');
        
        // Setup mobile helpers
        if (window.setupMobileHelpers) {
            window.setupMobileHelpers();
        }
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Setup resize handler
        window.addEventListener('resize', handleWindowResize);
        
        // Setup beforeunload handler
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Setup visibility change handler
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        safeLog('✅ Event listeners setup complete');
    } catch (error) {
        safeErrorHandler('❌ Error setting up event listeners:', error);
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        try {
            // Ctrl/Cmd + Enter: Quick order completion
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                if (window.currentOrder && window.currentOrder.length > 0 && window.createNewInvoice) {
                    window.createNewInvoice();
                }
            }
            
            // Escape: Close modals/sidebar
            if (event.key === 'Escape') {
                event.preventDefault();
                if (window.closeAllModals) {
                    window.closeAllModals();
                }
                if (window.toggleSidebar) {
                    window.toggleSidebar();
                }
            }
            
            // F1: Help/Debug info
            if (event.key === 'F1') {
                event.preventDefault();
                showDebugInfo();
            }
        } catch (error) {
            safeErrorHandler('❌ Error in keyboard shortcut handler:', error);
        }
    });
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    try {
        // Update mobile layout if needed
        if (window.updateMobileLayout) {
            window.updateMobileLayout();
        }
        
        // Recalculate UI dimensions
        if (window.recalculateLayout) {
            window.recalculateLayout();
        }
    } catch (error) {
        safeErrorHandler('❌ Error handling window resize:', error);
    }
}

/**
 * Handle before unload
 */
function handleBeforeUnload(event) {
    try {
        // Save current state
        if (window.saveAllData) {
            window.saveAllData();
        }
        
        // Warn if there's unsaved order data
        if (window.currentOrder && window.currentOrder.length > 0) {
            const message = 'Bạn có đơn hàng chưa hoàn thành. Bạn có chắc muốn thoát?';
            event.returnValue = message;
            return message;
        }
    } catch (error) {
        safeErrorHandler('❌ Error in before unload handler:', error);
    }
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
    try {
        if (document.hidden) {
            // Page hidden - save data
            if (window.saveAllData) {
                window.saveAllData();
            }
        } else {
            // Page visible - update UI
            if (window.updateAllUIStats) {
                window.updateAllUIStats();
            }
            if (window.updateShiftDisplay) {
                window.updateShiftDisplay();
            }
        }
    } catch (error) {
        safeErrorHandler('❌ Error in visibility change handler:', error);
    }
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
    try {
        safeLog('🛡️ Setting up error handlers...');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            safeErrorHandler('💥 Global error caught:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
            
            // Show user-friendly error message
            if (window.showNotification) {
                window.showNotification('Đã xảy ra lỗi không mong muốn', 'error');
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            safeErrorHandler('💥 Unhandled promise rejection:', event.reason);
            
            // Prevent default browser handling
            event.preventDefault();
            
            // Show user-friendly error message
            if (window.showNotification) {
                window.showNotification('Đã xảy ra lỗi xử lý', 'error');
            }
        });
        
        safeLog('✅ Error handlers setup complete');
    } catch (error) {
        safeErrorHandler('❌ Error setting up error handlers:', error);
    }
}

/**
 * Finalize initialization
 */
function finalizeInitialization() {
    try {
        safeLog('🏁 Finalizing initialization...');
        
        // Hide loading screen
        if (window.hideLoadingScreen) {
            window.hideLoadingScreen(500, () => {
                // Show welcome notification
                if (window.showNotification) {
                    window.showNotification('BalanCoffee đã sẵn sàng!', 'success');
                }
            });
        }
        
        // Trigger initial data sync
        if (window.syncData) {
            setTimeout(() => window.syncData(), 1000);
        }
        
        // Set app as initialized
        window.BalanCoffeeInitialized = true;
        
        safeLog('✅ Initialization finalized');
    } catch (error) {
        safeErrorHandler('❌ Error finalizing initialization:', error);
    }
}

/**
 * Handle initialization error
 */
function handleInitializationError(error) {
    try {
        console.error('💥 Critical initialization error:', error);
        
        // Hide loading screen
        if (window.hideLoadingScreen) {
            window.hideLoadingScreen(0);
        }
        
        // Show error message to user
        const errorMessage = `
            <div style="text-align: center; padding: 20px; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">
                <h3>⚠️ Lỗi khởi tạo ứng dụng</h3>
                <p>Không thể khởi tạo BalanCoffee. Vui lòng thử lại sau.</p>
                <p><small>Chi tiết: ${error.message}</small></p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Tải lại trang
                </button>
            </div>
        `;
        
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = errorMessage;
        } else {
            document.body.innerHTML = errorMessage;
        }
        
    } catch (fallbackError) {
        console.error('💥 Error in error handler:', fallbackError);
        alert('Lỗi nghiêm trọng khi khởi tạo ứng dụng. Vui lòng tải lại trang.');
    }
}

/**
 * Show debug information
 */
function showDebugInfo() {    const debugInfo = {
        appVersion: window.BalanCoffeeConfig?.APP_VERSION || 'Unknown',
        initialized: window.BalanCoffeeInitialized || false,
        currentOrder: window.currentOrder?.length || 0,
        invoicesCount: window.invoices?.length || 0,
        shiftActive: !!window.shiftStartTime,
        currentEmployee: window.currentShiftEmployee || 'None',
        timestamp: new Date().toISOString()
    };
    
    console.table(debugInfo);
    
    if (window.showNotification) {
        window.showNotification('Debug info logged to console (F12)', 'info');
    }
}

/**
 * Restart application
 */
function restartApp() {
    try {
        safeLog('🔄 Restarting application...');
        
        // Clear all data
        localStorage.clear();
        
        // Reset global variables
        window.currentOrder = [];
        window.invoices = [];
        window.orderHistory = [];
        window.currentInvoiceId = null;
        window.currentCategory = 'all';
        window.isAdminMode = false;
        window.shiftStartTime = null;
        window.currentShiftEmployee = null;
        window.currentShiftNote = null;
        
        // Reload page
        location.reload();
    } catch (error) {
        safeErrorHandler('❌ Error restarting app:', error);
        location.reload();
    }
}

// =============================================================================
// DOM READY HANDLER
// =============================================================================

/**
 * Ensure DOM is ready before initialization
 */
function ensureDOMReady(callback) {
    if (document.readyState === 'loading') {
        safeLog('⏳ Waiting for DOM to be ready...');
        document.addEventListener('DOMContentLoaded', callback);
    } else if (document.readyState === 'interactive') {
        safeLog('⏳ DOM interactive, waiting for complete...');
        window.addEventListener('load', callback);
    } else {
        safeLog('✅ DOM already ready');
        callback();
    }
}

// =============================================================================
// APP INITIALIZER EXPORTS
// =============================================================================

window.AppInitializer = {
    initializeApp,
    initializeGlobalVariables,
    loadStoredData,
    initializeUI,
    setupEventListeners,
    setupErrorHandlers,
    finalizeInitialization,
    handleInitializationError,
    showDebugInfo,
    restartApp,
    ensureDOMReady
};

// Export key functions to window for global access
window.initializeApp = initializeApp;
window.restartApp = restartApp;
window.showDebugInfo = showDebugInfo;
window.ensureDOMReady = ensureDOMReady;

console.log('✅ App Initializer module loaded successfully');

// Auto-initialize when DOM is ready
ensureDOMReady(() => {
    safeLog('📋 DOM ready, starting initialization...');
    // Longer delay to ensure all modules are loaded
    setTimeout(() => {
        safeLog('🚀 Starting delayed initialization...');
        initializeApp();
    }, 500);
});
