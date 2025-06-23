/**
 * BalanCoffee - Application Initializer Module
 * Xử lý khởi tạo ứng dụng và thiết lập ban đầu
 */

// =============================================================================
// INITIALIZATION FUNCTIONS
// =============================================================================

/**
 * Initialize the BalanCoffee application
 */
function initializeApp() {
    try {
        window.debugLog('🚀 Initializing BalanCoffee application...');
        
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
        window.debugLog('✅ BalanCoffee application initialized successfully');
        
    } catch (error) {
        window.debugError('❌ Critical error during app initialization:', error);
        handleInitializationError(error);
    }
}

/**
 * Initialize global variables
 */
function initializeGlobalVariables() {
    try {
        window.debugLog('🔄 Initializing global variables...');
        
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
        
        window.debugLog('✅ Global variables initialized');
        
    } catch (error) {
        window.debugError('❌ Error initializing global variables:', error);
        throw error;
    }
}

/**
 * Load stored data from localStorage
 */
function loadStoredData() {
    try {
        window.debugLog('📖 Loading stored data...');
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
        
        window.debugLog('✅ Stored data loaded');
        
    } catch (error) {
        window.debugError('❌ Error loading stored data:', error);
        // Continue with fallback data
        loadFallbackData();
    }
}

/**
 * Load fallback data if stored data fails
 */
function loadFallbackData() {
    try {
        window.debugLog('⚠️ Loading fallback data...');
        
        // Use fallback menu from config
        if (window.BalanCoffeeConfig?.FALLBACK_MENU) {
            window.menuData = window.BalanCoffeeConfig.FALLBACK_MENU;
        }
        
        window.debugLog('✅ Fallback data loaded');
        
    } catch (error) {
        window.debugError('❌ Error loading fallback data:', error);
    }
}

/**
 * Initialize UI components
 */
function initializeUI() {
    try {
        window.debugLog('🎨 Initializing UI components...');
        
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
        
        window.debugLog('✅ UI components initialized');
        
    } catch (error) {
        window.debugError('❌ Error initializing UI:', error);
        throw error;
    }
}

/**
 * Check if required DOM elements exist
 */
function checkRequiredElements() {
    const requiredElements = window.BalanCoffeeConfig?.REQUIRED_ELEMENTS || [
        'app-container',
        'menu-grid',
        'order-items',
        'order-total'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            missingElements.push(elementId);
        }
    });
    
    if (missingElements.length > 0) {
        const error = new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
        window.debugError('❌ Missing required elements:', error);
        throw error;
    }
    
    window.debugLog('✅ All required DOM elements found');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    try {
        window.debugLog('👂 Setting up event listeners...');
        
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
        
        window.debugLog('✅ Event listeners setup complete');
        
    } catch (error) {
        window.debugError('❌ Error setting up event listeners:', error);
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        try {            // Ctrl/Cmd + Enter: Quick order completion
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                if (window.currentOrder.length > 0 && window.createNewInvoice) {
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
            window.debugError('❌ Error in keyboard shortcut handler:', error);
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
        window.debugError('❌ Error handling window resize:', error);
    }
}

/**
 * Handle before unload
 */
function handleBeforeUnload(event) {
    try {        // Save current state
        if (window.saveAllData) {
            window.saveAllData();
        }
        
        // Warn if there's unsaved order data
        if (window.currentOrder.length > 0) {
            const message = 'Bạn có đơn hàng chưa hoàn thành. Bạn có chắc muốn thoát?';
            event.returnValue = message;
            return message;
        }
        
    } catch (error) {
        window.debugError('❌ Error in before unload handler:', error);
    }
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
    try {        if (document.hidden) {
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
        window.debugError('❌ Error in visibility change handler:', error);
    }
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
    try {
        window.debugLog('🛡️ Setting up error handlers...');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            window.debugError('💥 Global error caught:', {
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
            window.debugError('💥 Unhandled promise rejection:', event.reason);
            
            // Prevent default browser handling
            event.preventDefault();
              // Show user-friendly error message
            if (window.showNotification) {
                window.showNotification('Đã xảy ra lỗi xử lý', 'error');
            }
        });
        
        window.debugLog('✅ Error handlers setup complete');
        
    } catch (error) {
        window.debugError('❌ Error setting up error handlers:', error);
    }
}

/**
 * Finalize initialization
 */
function finalizeInitialization() {
    try {
        window.debugLog('🏁 Finalizing initialization...');
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
        
        window.debugLog('✅ Initialization finalized');
        
    } catch (error) {
        window.debugError('❌ Error finalizing initialization:', error);
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
function showDebugInfo() {
    const debugInfo = {
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
        window.debugLog('🔄 Restarting application...');
        
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
        window.debugError('❌ Error restarting app:', error);
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
        document.addEventListener('DOMContentLoaded', callback);
    } else {
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
    // Small delay to ensure all modules are loaded
    setTimeout(initializeApp, 100);
});
