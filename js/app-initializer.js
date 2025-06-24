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
    if (typeof window !== 'undefined') {
        if (window.debugUtils?.debugLog) {
            window.debugUtils.debugLog('error', message, error);
        } else if (window.debugError && typeof window.debugError === 'function') {
            window.debugError(message, error);
        } else {
            console.error(`[BalanCoffee ERROR] ${message}`, error);
        }
    } else {
        console.error(`[BalanCoffee ERROR] ${message}`, error);
    }
}

/**
 * Safe log wrapper
 */
function safeLog(message, ...args) {
    if (typeof window !== 'undefined') {
        if (window.debugUtils?.debugLog) {
            window.debugUtils.debugLog('info', message, ...args);
        } else if (window.debugLog && typeof window.debugLog === 'function') {
            window.debugLog(message, ...args);
        } else {
            console.log(`[BalanCoffee] ${message}`, ...args);
        }
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
        safeLog('🚀 Starting BalanCoffee initialization...');        // Step 1: Check and create missing DOM elements FIRST
        safeLog('🔍 Checking for missing critical DOM elements...');
        const initialDOMCheck = checkCriticalElements();
        
        if (initialDOMCheck.missing.length > 0) {
            safeLog(`❌ Found ${initialDOMCheck.missing.length} missing elements: ${initialDOMCheck.missing.join(', ')}`);
            safeLog('🔧 Creating missing DOM elements immediately...');
            
            const domCheckResult = createMissingDOMElements();
            if (domCheckResult) {
                // Wait for DOM to update
                setTimeout(() => {
                    // Verify creation was successful
                    const verificationCheck = checkCriticalElements();
                    if (verificationCheck.missing.length === 0) {
                        safeLog('✅ All critical DOM elements successfully created and verified');
                        
                        // Initialize the created elements
                        initializeCreatedElements();
                        
                        // Add mutation observer after successful creation
                        setupDOMMutationObserver();
                    } else {
                        safeLog(`⚠️ Still missing elements after creation: ${verificationCheck.missing.join(', ')}`);
                        // Try force creation for remaining elements
                        forceCreateMissingElements(verificationCheck.missing);
                        
                        // Add mutation observer even after force creation attempt
                        setupDOMMutationObserver();
                    }
                }, 300);
            } else {
                safeLog('❌ DOM elements creation failed, attempting force creation...');
                forceCreateMissingElements(initialDOMCheck.missing);
                
                // Add mutation observer even after force creation
                setupDOMMutationObserver();
            }
        } else {
            safeLog('✅ All critical DOM elements already exist');
            
            // Add mutation observer for existing elements
            setupDOMMutationObserver();
        }
        
        // Step 2: Run initialization diagnosis
        let diagnostics = null;
        if (window.checkInitializationIssues && typeof window.checkInitializationIssues === 'function') {
            diagnostics = window.checkInitializationIssues();
            
            if (diagnostics.hasIssues && !diagnostics.deferred) {
                safeLog('🔧 Issues detected, attempting auto-fix...');
                runAutoFixFlow(diagnostics);
            }
        } else {
            // Fallback manual check
            const manualCheck = manualDOMCheck();
            if (!manualCheck.success) {
                safeLog('❌ Manual DOM check failed, but continuing initialization...');
            }
        }
        
        // Step 3: Perform traditional system checks
        const systemCheck = performSystemChecks();
        if (!systemCheck.success) {
            throw new Error(`System check failed: ${systemCheck.error}`);
        }
        
        // Step 4: Show loading screen
        if (window.showLoadingScreen) {
            window.showLoadingScreen('Đang khởi tạo ứng dụng...', true);
        }
        
        // Step 5: Initialize core systems
        initializeGlobalVariables();
        
        // Step 6: Load stored data
        loadStoredData();
        
        // Step 7: Initialize UI
        initializeUI();
        
        // Step 8: Setup event listeners
        setupEventListeners();
        
        // Step 9: Setup error handlers
        setupErrorHandlers();
        
        // Step 10: Finalize initialization
        finalizeInitialization();
        
        safeLog('✅ BalanCoffee initialization completed successfully');
        
        // Final check and cleanup
        setTimeout(() => {
            const finalLoadingScreen = document.getElementById('loading-screen');
            if (finalLoadingScreen) {
                finalLoadingScreen.style.opacity = '0';
                setTimeout(() => {
                    finalLoadingScreen.style.display = 'none';
                }, 300);
            }
            safeLog('🎉 Application ready for use');
        }, 1000);
        
        return true;        
    } catch (error) {
        safeErrorHandler('❌ Critical error during app initialization:', error);
        return handleInitializationError(error);
    }
}

/**
 * Perform critical system checks before initialization
 */
function performSystemChecks() {
    try {
        const checks = {
            dom: typeof document !== 'undefined' && document.body,
            window: typeof window !== 'undefined',
            localStorage: typeof localStorage !== 'undefined',
            utils: typeof window.Utils !== 'undefined' || typeof Utils !== 'undefined',
            domHelper: typeof window.DOMHelper !== 'undefined' || typeof DOMHelper !== 'undefined',
            menuData: typeof window.menuData !== 'undefined' || typeof menuData !== 'undefined'
        };
        
        const failed = Object.entries(checks).filter(([key, value]) => !value);
        
        if (failed.length > 0) {
            const failedItems = failed.map(([key]) => key).join(', ');
            console.warn(`System checks failed for: ${failedItems}`);
              // Try auto-fix if available
            if (window.attemptAutoFix && typeof window.attemptAutoFix === 'function') {
                console.log('Attempting auto-fix...');
                const autoFixResult = window.attemptAutoFix();
                if (autoFixResult.success) {
                    console.log(`Auto-fix successful: ${autoFixResult.message}`);
                    return { success: true };
                } else {
                    return { 
                        success: false, 
                        error: `Auto-fix failed: ${autoFixResult.message || 'Unknown error'}. Missing: ${failedItems}` 
                    };
                }
            }
            
            return { 
                success: false, 
                error: `Missing critical components: ${failedItems}` 
            };
        }
        
        return { success: true };
        
    } catch (error) {
        return { 
            success: false, 
            error: `System check error: ${error.message}` 
        };
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
 * Check for critical DOM elements that are required for system operation
 */
/**
 * Check for critical DOM elements that are required for system operation
 * Returns detailed information about missing and found elements
 */
function checkCriticalElements() {
    const criticalElements = [
        {
            id: 'sidebar',
            priority: 'high', 
            description: 'Navigation sidebar',
            parent: '.sidebar-container, body'
        },
        {
            id: 'menu-grid',
            priority: 'high',
            description: 'Menu items container',
            parent: '.menu-section, .content-area, main, body'
        },
        {
            id: 'invoice-list',
            priority: 'high',
            description: 'Invoice management list',
            parent: '.invoice-list-container, #sidebar, body'
        },
        {
            id: 'loading-screen',
            priority: 'medium',
            description: 'Loading overlay',
            parent: 'body'
        },
        {
            id: 'admin-dropdown',
            priority: 'medium',
            description: 'Admin options menu',
            parent: '.admin-dropdown, .header-controls, header, body'
        },
        {
            id: 'current-order',
            priority: 'high',
            description: 'Current order panel',
            parent: '.modal-body, .order-container, body'
        },
        {
            id: 'order-total',
            priority: 'medium',
            description: 'Order total amount display',
            parent: '.order-total, #current-order, body'
        }
    ];
    
    const missing = [];
    const found = [];
    const details = {};
    
    criticalElements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            found.push(element.id);
            // Get additional information about found elements
            details[element.id] = {
                status: 'found',
                priority: element.priority,
                description: element.description,
                visible: el.offsetParent !== null,
                dimensions: {
                    width: el.offsetWidth,
                    height: el.offsetHeight
                },
                position: el.getBoundingClientRect(),
                children: el.children.length
            };
        } else {
            missing.push(element.id);
            // Get information about possible parent elements
            const possibleParents = element.parent.split(', ').map(selector => {
                try {
                    return document.querySelector(selector);
                } catch (e) {
                    return null;
                }
            }).filter(Boolean);
            
            details[element.id] = {
                status: 'missing',
                priority: element.priority,
                description: element.description,
                possibleParents: possibleParents.length,
                firstAvailableParent: possibleParents.length > 0 ? (possibleParents[0].id || possibleParents[0].tagName) : null
            };
        }
    });
    
    return { 
        missing, 
        found, 
        total: criticalElements.length,
        critical: missing.filter(id => criticalElements.find(el => el.id === id).priority === 'high').length,
        details
    };
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
          // Try to use the enhanced error display from debug-helper.js
        if (window.showInitializationError && typeof window.showInitializationError === 'function') {
            // Use the enhanced error overlay from debug-helper.js
            // Convert error to issues array format
            const errorIssues = [
                `❌ Initialization failed: ${error.message || error.toString()}`
            ];
            window.showInitializationError(errorIssues);
        } else {
            // Fallback to basic error display
            console.warn('Debug helper not available, using fallback error display');
            showFallbackErrorDisplay(error);
        }
        
    } catch (fallbackError) {
        console.error('💥 Error in error handler:', fallbackError);
        showBasicErrorAlert(error);
    }
}

/**
 * Show fallback error display when debug-helper is not available
 */
function showFallbackErrorDisplay(error) {
    const errorMessage = `
        <div id="initialization-error-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 500px;
                margin: 20px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            ">
                <div style="color: #dc3545; font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #721c24; margin-bottom: 15px;">Lỗi khởi tạo hệ thống</h2>
                <p style="color: #666; margin-bottom: 20px;">
                    Hệ thống BalanCoffee không thể khởi tạo được. Vui lòng thử các bước sau:
                </p>
                <div style="text-align: left; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Chi tiết lỗi:</strong><br>
                    <code style="color: #dc3545; word-break: break-word;">${error.message || error}</code>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" style="
                        padding: 10px 20px;
                        background: #28a745;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">🔄 Tải lại trang</button>
                    <button onclick="window.open('emergency-recovery.html', '_blank')" style="
                        padding: 10px 20px;
                        background: #dc3545;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">🔧 Chẩn đoán chi tiết</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing error overlay
    const existingOverlay = document.getElementById('initialization-error-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Add error overlay to body
    document.body.insertAdjacentHTML('beforeend', errorMessage);
}

/**
 * Show basic error alert as last resort
 */
function showBasicErrorAlert(error) {
    const message = `Lỗi nghiêm trọng khi khởi tạo ứng dụng BalanCoffee:\n\n${error.message || error}\n\nVui lòng tải lại trang hoặc liên hệ hỗ trợ.`;
    alert(message);
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

/**
 * Run auto-fix flow with proper error handling
 */
function runAutoFixFlow(diagnostics) {
    if (window.attemptAutoFix && typeof window.attemptAutoFix === 'function') {
        safeLog('🔧 Attempting auto-fix...');
        const autoFixResult = window.attemptAutoFix();
        
        if (autoFixResult.success) {
            safeLog('✅ Auto-fix completed successfully:', autoFixResult.message);
            // Re-run diagnostics to verify fix
            const postFixDiagnostics = window.checkInitializationIssues();
            if (postFixDiagnostics.hasIssues) {
                throw new Error(`Auto-fix incomplete. Remaining issues: ${JSON.stringify(postFixDiagnostics.issues)}`);
            }
        } else {
            throw new Error(`Auto-fix failed: ${autoFixResult.message || 'Unknown error'}`);
        }
    } else {
        throw new Error(`Initialization issues detected: ${JSON.stringify(diagnostics.issues)}`);
    }
}

/**
 * Manual DOM check when debug helper is not available
 */
function manualDOMCheck() {
    const criticalElements = [
        'sidebar', 'menu-grid', 'invoice-list', 'loading-screen', 
        'admin-dropdown', 'current-order', 'order-total'
    ];
    
    const missing = [];
    const found = [];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            found.push(id);
        } else {
            missing.push(id);
        }
    });
    
    safeLog(`🔍 Manual DOM Check: Found ${found.length}/${criticalElements.length} elements`);
    
    if (missing.length > 0) {
        safeLog(`❌ Missing critical elements: ${missing.join(', ')}`);
        
        // Try to create missing elements immediately
        safeLog('🔧 Attempting to create missing DOM elements...');
        const creationResult = createMissingDOMElements();
        
        if (creationResult) {
            // Re-check after creation
            const stillMissing = [];
            missing.forEach(id => {
                if (!document.getElementById(id)) {
                    stillMissing.push(id);
                }
            });
            
            if (stillMissing.length === 0) {
                safeLog('✅ All missing DOM elements have been created successfully');
                return { success: true, missing: [], found: criticalElements, created: missing.length };
            } else {
                safeLog(`⚠️ Still missing elements after creation: ${stillMissing.join(', ')}`);
                return { success: false, missing: stillMissing, found: found.concat(missing.filter(id => !stillMissing.includes(id))), created: missing.length - stillMissing.length };
            }
        } else {
            return { success: false, missing, found, created: 0 };
        }
    }
    
    safeLog('✅ All critical DOM elements found');
    return { success: true, missing: [], found, created: 0 };
}

/**
 * Create missing DOM elements with proper structure and styling
 */
function createMissingDOMElements() {
    try {
        safeLog('🔧 Creating missing DOM elements with enhanced structure...');
        
        let created = 0;
        const results = [];
        
        // Enhanced critical elements with better structure and functionality
        const criticalElements = {
            'loading-screen': {
                tag: 'div',
                className: 'loading-screen',
                parent: () => document.body,
                innerHTML: `
                    <div class="loading-content" style="text-align: center; color: white;">
                        <div style="font-size: 64px; margin-bottom: 20px;">☕</div>
                        <h2 style="margin: 0 0 30px 0; font-size: 32px;">BalanCoffee</h2>
                        <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                        <p style="margin: 0; font-size: 18px;">Đang khởi tạo hệ thống...</p>
                    </div>
                `,
                style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #6F4E37 0%, #8B6F47 100%); display: none; align-items: center; justify-content: center; z-index: 9999; font-family: Arial, sans-serif;',
                postCreate: (element) => {
                    // Add show/hide functions
                    window.showLoadingScreen = function(text = 'Đang khởi tạo hệ thống...') {
                        element.querySelector('p').textContent = text;
                        element.style.display = 'flex';
                    };
                    window.hideLoadingScreen = function(delay = 0, callback) {
                        setTimeout(() => {
                            element.style.opacity = '0';
                            setTimeout(() => {
                                element.style.display = 'none';
                                element.style.opacity = '1';
                                if (callback) callback();
                            }, 300);
                        }, delay);
                    };
                }
            },
            'sidebar': {
                tag: 'aside',
                className: 'sidebar collapsed',
                parent: () => document.body,
                innerHTML: `
                    <div class="sidebar-content" style="padding: 20px; height: 100%; display: flex; flex-direction: column;">
                        <div class="sidebar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #eee;">
                            <h3 style="margin: 0; color: #333; font-size: 20px;">
                                📋 Hóa Đơn Chờ
                            </h3>
                            <button class="sidebar-close" onclick="window.toggleSidebar && window.toggleSidebar()" 
                                    style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666; padding: 5px; border-radius: 4px;"
                                    onmouseover="this.style.background='#f0f0f0'" 
                                    onmouseout="this.style.background='none'">
                                ✖️
                            </button>
                        </div>
                        <div class="invoice-list-container" style="flex: 1; overflow-y: auto;">
                            <ul class="invoice-list" id="invoice-list" style="list-style: none; padding: 0; margin: 0;">
                                <li class="no-invoices" style="padding: 20px; text-align: center; color: #666; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">
                                    <div style="font-size: 24px; margin-bottom: 10px;">📄</div>
                                    <div>Chưa có hóa đơn nào</div>
                                </li>
                            </ul>
                        </div>
                        <div class="sidebar-actions" style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px;">
                            <button class="btn btn-success btn-full" onclick="window.createNewInvoice && window.createNewInvoice()"
                                    style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;"
                                    onmouseover="this.style.background='#218838'; this.style.transform='translateY(-2px)'"
                                    onmouseout="this.style.background='#28a745'; this.style.transform='translateY(0)'">
                                ➕ Tạo Hóa Đơn Mới
                            </button>
                        </div>
                    </div>
                `,
                style: 'position: fixed; top: 0; right: 0; width: 420px; height: 100vh; background: #fff; border-left: 3px solid #ddd; z-index: 1000; transform: translateX(100%); transition: transform 0.3s ease; box-shadow: -5px 0 20px rgba(0,0,0,0.1); overflow: hidden;',
                postCreate: (element) => {
                    // Enhanced toggle functionality
                    window.toggleSidebar = function() {
                        const isCollapsed = element.classList.contains('collapsed');
                        if (isCollapsed) {
                            element.classList.remove('collapsed');
                            element.style.transform = 'translateX(0)';
                            safeLog('📂 Sidebar opened');
                        } else {
                            element.classList.add('collapsed');
                            element.style.transform = 'translateX(100%)';
                            safeLog('📁 Sidebar closed');
                        }
                    };
                    
                    // Close on outside click
                    document.addEventListener('click', (event) => {
                        if (!element.contains(event.target) && !event.target.closest('.sidebar-toggle')) {
                            if (!element.classList.contains('collapsed')) {
                                window.toggleSidebar();
                            }
                        }
                    });
                }
            },
            'menu-grid': {
                tag: 'div',
                className: 'menu-grid',
                parent: () => {
                    // Try to find the best parent
                    return document.querySelector('.menu-section') || 
                           document.querySelector('.content-area') || 
                           document.querySelector('main') || 
                           document.body;
                },
                innerHTML: `
                    <div class="menu-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 16px; border: 3px dashed #2196f3; margin: 20px 0;">
                        <div style="font-size: 64px; margin-bottom: 20px;">☕</div>
                        <h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 24px;">Menu Hệ Thống Sẵn Sàng</h3>
                        <p style="margin: 0 0 25px 0; color: #424242; font-size: 16px;">Menu đã được khởi tạo thành công và sẵn sàng tải dữ liệu</p>
                        <button onclick="window.renderMenu && window.renderMenu()" 
                                style="padding: 15px 30px; background: #2196f3; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s;"
                                onmouseover="this.style.background='#1976d2'; this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.background='#2196f3'; this.style.transform='translateY(0)'">
                            🔄 Tải Menu Ngay
                        </button>
                        <div style="margin-top: 15px; font-size: 12px; color: #666;">
                            Hoặc menu sẽ tự động tải sau vài giây
                        </div>
                    </div>
                `,
                style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; padding: 25px; min-height: 300px; background: #fafafa; border-radius: 12px; margin: 20px;',
                postCreate: (element) => {
                    // Auto-load menu after creation
                    setTimeout(() => {
                        if (window.renderMenu && typeof window.renderMenu === 'function') {
                            safeLog('🔄 Auto-loading menu...');
                            window.renderMenu();
                        } else if (window.menuData && Array.isArray(window.menuData) && window.menuData.length > 0) {
                            // Create basic menu display if renderMenu not available
                            element.innerHTML = window.menuData.slice(0, 6).map(item => `
                                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                                    <h4 style="margin: 0 0 10px 0; color: #333;">${item.name || 'Menu Item'}</h4>
                                    <p style="margin: 0; color: #007bff; font-weight: bold;">${item.price || 0}₫</p>
                                </div>
                            `).join('');
                            safeLog('✅ Basic menu displayed');
                        }
                    }, 2000);
                    
                    // Responsive behavior
                    const updateLayout = () => {
                        if (window.innerWidth <= 768) {
                            element.style.gridTemplateColumns = '1fr';
                            element.style.padding = '15px';
                        } else {
                            element.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
                            element.style.padding = '25px';
                        }
                    };
                    
                    window.addEventListener('resize', updateLayout);
                    updateLayout();
                }
            },
            'admin-dropdown': {
                tag: 'div',
                className: 'admin-dropdown-menu dropdown',
                parent: () => {
                    // Find the best parent for admin dropdown
                    return document.querySelector('.admin-dropdown') || 
                           document.querySelector('.header-admin') || 
                           document.querySelector('.header-controls') || 
                           document.querySelector('header') || 
                           document.body;
                },
                innerHTML: `
                    <div style="padding: 20px; min-width: 250px;">
                        <h4 style="margin: 0 0 20px 0; color: #333; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                            ⚙️ Quản Lý Admin
                        </h4>
                        <button class="dropdown-item" onclick="window.startNewShift && window.startNewShift()" 
                                style="display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 6px; margin-bottom: 8px; transition: all 0.2s;"
                                onmouseover="this.style.background='#e8f5e8'; this.style.transform='translateX(5px)'" 
                                onmouseout="this.style.background='none'; this.style.transform='translateX(0)'">
                            <span style="font-size: 18px; color: #28a745;">▶️</span>
                            <div>
                                <div style="font-weight: 600; color: #333;">Bắt Đầu Ca Mới</div>
                                <div style="font-size: 12px; color: #666;">Khởi tạo ca làm việc mới</div>
                            </div>
                        </button>
                        <button class="dropdown-item" onclick="window.endCurrentShift && window.endCurrentShift()" 
                                style="display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 6px; margin-bottom: 8px; transition: all 0.2s;"
                                onmouseover="this.style.background='#ffeaea'; this.style.transform='translateX(5px)'" 
                                onmouseout="this.style.background='none'; this.style.transform='translateX(0)'">
                            <span style="font-size: 18px; color: #dc3545;">⏹️</span>
                            <div>
                                <div style="font-weight: 600; color: #333;">Kết Thúc Ca</div>
                                <div style="font-size: 12px; color: #666;">Hoàn thành ca hiện tại</div>
                            </div>
                        </button>
                        <button class="dropdown-item" onclick="window.showDebugInfo && window.showDebugInfo()" 
                                style="display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 6px; transition: all 0.2s;"
                                onmouseover="this.style.background='#e3f2fd'; this.style.transform='translateX(5px)'" 
                                onmouseout="this.style.background='none'; this.style.transform='translateX(0)'">
                            <span style="font-size: 18px; color: #17a2b8;">🔍</span>
                            <div>
                                <div style="font-weight: 600; color: #333;">Thông Tin Debug</div>
                                <div style="font-size: 12px; color: #666;">Xem thông tin hệ thống</div>
                            </div>
                        </button>
                    </div>
                `,
                style: 'position: absolute; background: white; border: 2px solid #ddd; border-radius: 12px; display: none; z-index: 1001; box-shadow: 0 8px 25px rgba(0,0,0,0.15); top: 100%; right: 0;',
                postCreate: (element) => {
                    // Enhanced toggle functionality
                    window.toggleAdminDropdown = function() {
                        const isVisible = element.style.display === 'block';
                        element.style.display = isVisible ? 'none' : 'block';
                        safeLog(`🔧 Admin dropdown ${isVisible ? 'hidden' : 'shown'}`);
                    };
                    
                    // Close on outside click
                    document.addEventListener('click', function(event) {
                        if (!element.contains(event.target) && !event.target.closest('.admin-toggle, .admin-btn')) {
                            element.style.display = 'none';
                        }
                    });
                    
                    // Auto-position based on screen edges
                    const autoPosition = () => {
                        const rect = element.getBoundingClientRect();
                        if (rect.right > window.innerWidth) {
                            element.style.right = '0';
                            element.style.left = 'auto';
                        }
                        if (rect.bottom > window.innerHeight) {
                            element.style.top = 'auto';
                            element.style.bottom = '100%';
                        }
                    };
                    
                    const originalToggle = window.toggleAdminDropdown;
                    window.toggleAdminDropdown = function() {
                        originalToggle();
                        if (element.style.display === 'block') {
                            setTimeout(autoPosition, 10);
                        }
                    };
                }
            },
            'current-order': {
                tag: 'div',
                className: 'current-order',
                parent: () => document.querySelector('.modal-body') || document.querySelector('#order-modal .modal-body') || document.querySelector('.order-container') || document.body,
                innerHTML: `
                    <div style="padding: 25px; background: #fff; border: 3px solid #ddd; border-radius: 12px; margin: 15px 0;">
                        <h4 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; gap: 10px; font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                            🛒 <span>Đơn Hàng Hiện Tại</span>
                        </h4>
                        <div id="order-items" style="min-height: 80px; border: 2px dashed #ddd; border-radius: 8px; padding: 20px; background: #f8f9fa; margin-bottom: 20px;">
                            <div class="empty-order" style="text-align: center; color: #666;">
                                <div style="font-size: 48px; margin-bottom: 15px;">☕</div>
                                <div style="font-size: 16px; font-weight: 500;">Chưa có món nào được chọn</div>
                                <div style="font-size: 14px; color: #888; margin-top: 5px;">Vui lòng chọn món từ menu</div>
                            </div>
                        </div>
                        <div class="order-total" style="margin-top: 20px; padding-top: 20px; border-top: 3px solid #ddd; text-align: right;">
                            <div style="font-size: 22px; font-weight: bold; color: #333;">
                                Tổng Cộng: <span id="order-total" style="color: #28a745; font-size: 24px;">0₫</span>
                            </div>
                        </div>
                    </div>
                `,
                postCreate: (element) => {
                    // Initialize order management
                    if (!window.currentOrder) window.currentOrder = [];
                    
                    window.updateOrderDisplay = function() {
                        const orderItems = element.querySelector('#order-items');
                        const orderTotal = element.querySelector('#order-total');
                        
                        if (orderItems) {
                            if (!window.currentOrder || window.currentOrder.length === 0) {
                                orderItems.innerHTML = `
                                    <div class="empty-order" style="text-align: center; color: #666;">
                                        <div style="font-size: 48px; margin-bottom: 15px;">☕</div>
                                        <div style="font-size: 16px; font-weight: 500;">Chưa có món nào được chọn</div>
                                        <div style="font-size: 14px; color: #888; margin-top: 5px;">Vui lòng chọn món từ menu</div>
                                    </div>
                                `;
                            } else {
                                const itemsHTML = window.currentOrder.map((item, index) => `
                                    <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #e3f2fd; border-radius: 6px; margin: 8px 0; border-left: 4px solid #2196f3;">
                                        <div>
                                            <div style="font-weight: 600; color: #333;">${item.name || `Món ${index + 1}`}</div>
                                            <div style="font-size: 12px; color: #666;">x${item.quantity || 1}</div>
                                        </div>
                                        <div style="font-weight: bold; color: #2196f3;">${(item.price || 0).toLocaleString()}₫</div>
                                    </div>
                                `).join('');
                                orderItems.innerHTML = itemsHTML;
                            }
                        }
                        
                        if (orderTotal) {
                            const total = (window.currentOrder || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                            orderTotal.textContent = total.toLocaleString() + '₫';
                            orderTotal.style.color = total > 0 ? '#28a745' : '#6c757d';
                        }
                        
                        safeLog('🔄 Order display updated');
                    };
                    
                    // Initial update
                    window.updateOrderDisplay();
                }
            },
            'invoice-list': {
                tag: 'ul',
                className: 'invoice-list',
                parent: () => document.querySelector('.invoice-list-container') || document.getElementById('sidebar') || document.body,
                innerHTML: `
                    <li class="no-invoices" style="padding: 20px; text-align: center; color: #666; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd; margin: 10px 0;">
                        <div style="font-size: 32px; margin-bottom: 10px;">📄</div>
                        <div style="font-weight: 500;">Chưa có hóa đơn nào</div>
                        <div style="font-size: 12px; color: #888; margin-top: 5px;">Hóa đơn sẽ xuất hiện ở đây</div>
                    </li>
                `,
                style: 'list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto;',
                postCreate: (element) => {
                    window.refreshInvoiceList = function() {
                        if (window.loadInvoicesData && typeof window.loadInvoicesData === 'function') {
                            window.loadInvoicesData();
                        } else if (window.invoices && Array.isArray(window.invoices) && window.invoices.length > 0) {
                            element.innerHTML = window.invoices.map(invoice => `
                                <li style="padding: 15px; background: white; border-radius: 6px; margin: 8px 0; border-left: 4px solid #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <div style="font-weight: 600;">Hóa đơn #${invoice.id}</div>
                                    <div style="font-size: 12px; color: #666;">${invoice.timestamp || 'Không rõ thời gian'}</div>
                                </li>
                            `).join('');
                        } else {
                            element.innerHTML = element.innerHTML; // Keep default content
                        }
                        safeLog('🔄 Invoice list refreshed');
                    };
                }
            },
            'order-total': {
                tag: 'span',
                className: 'order-total-amount',
                parent: () => document.querySelector('.order-total') || document.getElementById('current-order') || document.body,
                innerHTML: '0₫',
                style: 'font-weight: bold; color: #28a745; font-size: 1.2em;'
            }
        };
        
        // Create each element if it doesn't exist
        Object.keys(criticalElements).forEach(elementId => {
            if (!document.getElementById(elementId)) {
                try {
                    const config = criticalElements[elementId];
                    const element = document.createElement(config.tag);
                    
                    element.id = elementId;
                    element.className = config.className || '';
                    element.innerHTML = config.innerHTML || '';
                    
                    if (config.style) {
                        element.style.cssText = config.style;
                    }
                    
                    // Find parent and append
                    const parent = typeof config.parent === 'function' ? config.parent() : config.parent;
                    if (parent && parent !== element) {
                        parent.appendChild(element);
                        created++;
                        safeLog(`✅ Created element: #${elementId}`);
                        results.push(`✅ ${elementId}`);
                        
                        // Run post-creation setup
                        if (config.postCreate && typeof config.postCreate === 'function') {
                            setTimeout(() => config.postCreate(element), 50);
                        }
                    } else {
                        safeLog(`⚠️ Could not find valid parent for #${elementId}, appending to body`);
                        document.body.appendChild(element);
                        created++;
                        results.push(`⚠️ ${elementId} (fallback to body)`);
                        
                        if (config.postCreate && typeof config.postCreate === 'function') {
                            setTimeout(() => config.postCreate(element), 50);
                        }
                    }
                } catch (elementError) {
                    safeErrorHandler(`❌ Error creating element ${elementId}:`, elementError);
                    results.push(`❌ ${elementId} (failed)`);
                }
            }
        });
        
        if (created > 0) {
            safeLog(`🎉 Successfully created ${created} missing DOM elements`);
            safeLog(`📋 Creation results: ${results.join(', ')}`);
            
            // Add comprehensive CSS
            addBasicCSS();
            
            // Wait for DOM updates and run verification
            setTimeout(() => {
                const verification = checkCriticalElements();
                if (verification.missing.length === 0) {
                    safeLog('✅ All DOM elements verified successfully');
                    safeLog('🎊 System is now fully functional!');
                } else {
                    safeLog(`⚠️ Verification failed, still missing: ${verification.missing.join(', ')}`);
                }
            }, 200);
            
            return true;
        } else {
            safeLog('ℹ️ No DOM elements needed to be created (all exist)');
            return true;
        }
        
    } catch (error) {
        safeErrorHandler('❌ Error in createMissingDOMElements:', error);
        return false;
    }
}

/**
 * Add comprehensive CSS for created elements if stylesheet not loaded
 * This ensures all dynamically created elements have proper styling
 */
function addBasicCSS() {
    if (document.getElementById('emergency-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'emergency-styles';
    style.textContent = `
        /* Animations */
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        /* Loading Screen */
        .loading-screen {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(135deg, #6F4E37 0%, #8B6F47 100%) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            color: white !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
        }
        
        .loading-content {
            text-align: center;
            animation: fadeIn 0.5s ease;
        }
        
        .loading-spinner, .loading-spinner-small {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
        }
        
        .loading-spinner-small {
            width: 30px;
            height: 30px;
            border-width: 3px;
        }
        
        /* Enhanced Sidebar */
        .sidebar {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            width: 420px !important;
            max-width: 100vw !important;
            height: 100vh !important;
            background: #fff !important;
            border-left: 3px solid #ddd !important;
            z-index: 1000 !important;
            transform: translateX(100%) !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            overflow-y: auto !important;
            box-shadow: -5px 0 20px rgba(0,0,0,0) !important;
        }
        
        .sidebar.collapsed {
            transform: translateX(100%) !important;
        }
        
        .sidebar:not(.collapsed) {
            transform: translateX(0) !important;
            box-shadow: -5px 0 20px rgba(0,0,0,0.15) !important;
        }
        
        .sidebar-content {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #eee;
        }
        
        /* Invoice List */
        .invoice-list-container {
            flex: 1;
            overflow-y: auto;
        }
        
        #invoice-list {
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-height: 400px !important;
            overflow-y: auto !important;
        }
        
        #invoice-list li {
            padding: 15px !important;
            margin-bottom: 10px !important;
            background: #f8f9fa !important;
            border-radius: 8px !important;
            border-left: 4px solid #007bff !important;
            transition: all 0.2s ease !important;
        }
        
        #invoice-list li:hover {
            background: #e3f2fd !important;
            transform: translateX(5px) !important;
        }
        
        /* Menu Grid */
        .menu-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 25px !important;
            padding: 25px !important;
            min-height: 200px !important;
            animation: fadeIn 0.5s ease !important;
        }
        
        /* Menu Items */
        .menu-item {
            background: white !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 0 3px 15px rgba(0,0,0,0.1) !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            cursor: pointer !important;
            position: relative !important;
            padding: 20px !important;
        }
        
        .menu-item:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        /* Admin Dropdown */
        .admin-dropdown-menu {
            background: white !important;
            border: 2px solid #ddd !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
            animation: fadeIn 0.3s ease !important;
            position: absolute !important;
            z-index: 1001 !important;
            min-width: 250px !important;
        }
        
        .dropdown-item {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            width: 100% !important;
            padding: 12px !important;
            background: none !important;
            border: none !important;
            text-align: left !important;
            cursor: pointer !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
        }
        
        .dropdown-item:hover {
            background: #f0f0f0 !important;
            transform: translateX(5px) !important;
        }
        
        /* Current Order */
        .current-order {
            background: #fff !important;
            border-radius: 12px !important;
            padding: 20px !important;
            margin: 15px 0 !important;
            animation: fadeIn 0.3s ease !important;
            border: 2px solid #ddd !important;
        }
        
        /* Order Items */
        #order-items {
            min-height: 60px !important;
            border: 1px dashed #ddd !important;
            border-radius: 8px !important;
            padding: 15px !important;
            background: #f8f9fa !important;
            margin-bottom: 15px !important;
        }
        
        .order-item {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 12px !important;
            background: #e3f2fd !important;
            border-radius: 6px !important;
            margin: 8px 0 !important;
            border-left: 4px solid #2196f3 !important;
            animation: fadeIn 0.2s ease !important;
        }
        
        .empty-order {
            text-align: center !important;
            color: #666 !important;
            padding: 20px !important;
        }
        
        /* Order Total */
        .order-total {
            margin-top: 15px !important;
            padding-top: 15px !important;
            border-top: 2px solid #ddd !important;
            text-align: right !important;
            font-size: 18px !important;
        }
        
        #order-total {
            font-weight: bold !important;
            color: #28a745 !important;
            font-size: 1.2em !important;
        }
        
        /* Buttons */
        .btn {
            padding: 12px 20px !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-weight: 600 !important;
            text-decoration: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            transition: all 0.2s ease !important;
            font-size: 15px !important;
        }
        
        .btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
        
        .btn:active {
            transform: translateY(0) !important;
        }
        
        .btn-success {
            background: #28a745 !important;
            color: white !important;
        }
        
        .btn-success:hover {
            background: #218838 !important;
        }
        
        .btn-primary {
            background: #007bff !important;
            color: white !important;
        }
        
        .btn-primary:hover {
            background: #0069d9 !important;
        }
        
        .btn-warning {
            background: #ffc107 !important;
            color: #212529 !important;
        }
        
        .btn-warning:hover {
            background: #e0a800 !important;
        }
        
        .btn-danger {
            background: #dc3545 !important;
            color: white !important;
        }
        
        .btn-danger:hover {
            background: #c82333 !important;
        }
        
        .btn-full {
            width: 100% !important;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
            .sidebar {
                width: 100% !important;
            }
            
            .menu-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
                padding: 15px !important;
            }
            
            .admin-dropdown-menu {
                width: 280px !important;
                max-width: 90vw !important;
                right: 0 !important;
            }
            
            .btn {
                padding: 10px 15px !important;
                font-size: 14px !important;
            }
        }
        
        /* Special hover effects */
        .menu-item:active, .btn:active, .sidebar-close:active {
            transform: scale(0.98) !important;
        }
        
        /* Utility classes */
        .text-center { text-align: center !important; }
        .text-left { text-align: left !important; }
        .text-right { text-align: right !important; }
        .mt-20 { margin-top: 20px !important; }
        .mb-20 { margin-bottom: 20px !important; }
        .py-20 { padding-top: 20px !important; padding-bottom: 20px !important; }
        .px-20 { padding-left: 20px !important; padding-right: 20px !important; }
        
        /* Success and error states */
        .has-error {
            border-color: #dc3545 !important;
            background-color: #fff8f8 !important;
        }
        
        .has-success {
            border-color: #28a745 !important;
            background-color: #f8fff9 !important;
        }
    `;
    
    document.head.appendChild(style);
    safeLog('✅ Added comprehensive emergency CSS styles');
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

/**
 * Initialize created DOM elements with proper functionality
 */
function initializeCreatedElements() {
    try {
        safeLog('🔧 Initializing created DOM elements...');
        
        // Initialize sidebar functionality
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // Add toggle functionality
            window.toggleSidebar = function() {
                sidebar.classList.toggle('collapsed');
                safeLog('🔄 Sidebar toggled');
            };
            
            // Make sidebar functional
            sidebar.style.display = 'block';
            safeLog('✅ Sidebar initialized');
        }
        
        // Initialize menu grid
        const menuGrid = document.getElementById('menu-grid');
        if (menuGrid) {
            // Clear loading content and prepare for menu items
            menuGrid.innerHTML = '<div class="menu-placeholder">Menu sẵn sàng tải...</div>';
            
            // Add responsive behavior
            if (window.innerWidth <= 768) {
                menuGrid.style.gridTemplateColumns = '1fr';
            }
            
            safeLog('✅ Menu Grid initialized');
        }
        
        // Initialize admin dropdown
        const adminDropdown = document.getElementById('admin-dropdown');
        if (adminDropdown) {
            // Add toggle functionality
            window.toggleAdminDropdown = function() {
                const isVisible = adminDropdown.style.display === 'block';
                adminDropdown.style.display = isVisible ? 'none' : 'block';
                safeLog('🔄 Admin dropdown toggled');
            };
            
            // Close on outside click
            document.addEventListener('click', function(event) {
                if (!adminDropdown.contains(event.target) && !event.target.closest('.admin-toggle')) {
                    adminDropdown.style.display = 'none';
                }
            });
            
            safeLog('✅ Admin Dropdown initialized');
        }
        
        // Initialize invoice list
        const invoiceList = document.getElementById('invoice-list');
        if (invoiceList) {
            // Add refresh functionality
            window.refreshInvoiceList = function() {
                if (window.loadInvoicesData) {
                    window.loadInvoicesData();
                } else {
                    invoiceList.innerHTML = '<li class="no-invoices">Danh sách hóa đơn đã được làm mới</li>';
                }
                safeLog('🔄 Invoice list refreshed');
            };
            
            safeLog('✅ Invoice List initialized');
        }
        
        // Initialize current order
        const currentOrder = document.getElementById('current-order');
        if (currentOrder) {
            // Add order management functions
            window.updateOrderDisplay = function() {
                const orderItems = document.getElementById('order-items');
                const orderTotal = document.getElementById('order-total');
                
                if (orderItems && window.currentOrder) {
                    if (window.currentOrder.length === 0) {
                        orderItems.innerHTML = '<div class="empty-order">Chưa có món nào được chọn</div>';
                    } else {
                        // Display order items
                        const itemsHTML = window.currentOrder.map(item => 
                            `<div class="order-item">${item.name} - ${item.price}₫</div>`
                        ).join('');
                        orderItems.innerHTML = itemsHTML;
                    }
                }
                
                if (orderTotal && window.currentOrder) {
                    const total = window.currentOrder.reduce((sum, item) => sum + (item.price || 0), 0);
                    orderTotal.textContent = total.toLocaleString() + '₫';
                }
                
                safeLog('🔄 Order display updated');
            };
            
            // Initial update
            window.updateOrderDisplay();
            safeLog('✅ Current Order initialized');
        }
        
        safeLog('🎉 All created DOM elements initialized successfully');
        
    } catch (error) {
        safeErrorHandler('❌ Error initializing created elements:', error);
    }
}

/**
 * Force create missing elements when normal creation fails
 */
function forceCreateMissingElements(missingElements) {
    try {
        safeLog('🚨 Force creating missing elements:', missingElements.join(', '));
        
        let created = 0;
        
        missingElements.forEach(elementId => {
            if (!document.getElementById(elementId)) {
                let element, parent;
                
                switch (elementId) {
                    case 'sidebar':
                        element = document.createElement('aside');
                        element.id = 'sidebar';
                        element.className = 'sidebar collapsed';
                        element.innerHTML = `
                            <div style="padding: 20px; height: 100%; background: #fff;">
                                <h3 style="margin: 0 0 20px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                                    📋 Hóa Đơn Chờ
                                </h3>
                                <ul id="invoice-list" style="list-style: none; padding: 0; margin: 0;">
                                    <li style="padding: 15px; text-align: center; color: #666;">
                                        Chưa có hóa đơn nào
                                    </li>
                                </ul>
                                <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                                    <button onclick="window.createNewInvoice && window.createNewInvoice()" 
                                            style="width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                        ➕ Tạo Hóa Đơn Mới
                                    </button>
                                </div>
                            </div>
                        `;
                        element.style.cssText = `
                            position: fixed; top: 0; right: 0; width: 400px; height: 100vh; 
                            background: #fff; border-left: 2px solid #ddd; z-index: 1000; 
                            transform: translateX(100%); transition: transform 0.3s ease; 
                            box-shadow: -5px 0 15px rgba(0,0,0,0.1); overflow-y: auto;
                        `;
                        parent = document.body;
                        break;
                        
                    case 'menu-grid':
                        element = document.createElement('div');
                        element.id = 'menu-grid';
                        element.className = 'menu-grid';
                        element.innerHTML = `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border: 2px dashed #6c757d;">
                                <div style="font-size: 48px; margin-bottom: 20px;">☕</div>
                                <h3 style="margin: 0 0 10px 0; color: #495057;">Menu Đã Sẵn Sàng</h3>
                                <p style="margin: 0; color: #6c757d;">Hệ thống menu đã được khởi tạo thành công</p>
                                <button onclick="window.renderMenu && window.renderMenu()" 
                                        style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                    🔄 Tải Menu
                                </button>
                            </div>
                        `;
                        element.style.cssText = `
                            display: grid; 
                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
                            gap: 20px; 
                            padding: 20px; 
                            min-height: 300px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            margin: 20px 0;
                        `;
                        parent = document.querySelector('.menu-section') || document.querySelector('main') || document.body;
                        break;
                        
                    case 'admin-dropdown':
                        element = document.createElement('div');
                        element.id = 'admin-dropdown';
                        element.className = 'admin-dropdown-menu dropdown';
                        element.innerHTML = `
                            <div style="padding: 15px;">
                                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                                    ⚙️ Quản Lý Admin
                                </h4>
                                <button onclick="window.startNewShift && window.startNewShift()" 
                                        style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 4px; margin-bottom: 5px;"
                                        onmouseover="this.style.background='#f8f9fa'" 
                                        onmouseout="this.style.background='none'">
                                    <span style="color: #28a745;">▶️</span>
                                    <span>Bắt Đầu Ca Mới</span>
                                </button>
                                <button onclick="window.endCurrentShift && window.endCurrentShift()" 
                                        style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 4px; margin-bottom: 5px;"
                                        onmouseover="this.style.background='#ffeaea'; this.style.transform='translateX(5px)'" 
                                        onmouseout="this.style.background='none'; this.style.transform='translateX(0)'">
                                    <span style="color: #dc3545;">⏹️</span>
                                    <span>Kết Thúc Ca</span>
                                </button>
                                <button onclick="window.showDebugInfo && window.showDebugInfo()" 
                                        style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 4px;"
                                        onmouseover="this.style.background='#e3f2fd'" 
                                        onmouseout="this.style.background='none'">
                                    <span style="color: #17a2b8;">🔍</span>
                                    <span>Thông Tin Debug</span>
                                </button>
                            </div>
                        `;
                        element.style.cssText = `
                            position: absolute; 
                            background: white; 
                            border: 2px solid #ddd; 
                            border-radius: 8px; 
                            display: none; 
                            z-index: 1001; 
                            box-shadow: 0 6px 20px rgba(0,0,0,0.15); 
                            min-width: 220px;
                            top: 100%;
                            right: 0;
                        `;
                        parent = document.querySelector('.admin-dropdown') || document.querySelector('.header-controls') || document.body;
                        break;
                        
                    case 'invoice-list':
                        if (!document.getElementById('sidebar')) {
                            // Create sidebar first if it doesn't exist
                            forceCreateMissingElements(['sidebar']);
                        }
                        element = document.createElement('ul');
                        element.id = 'invoice-list';
                        element.className = 'invoice-list';
                        element.innerHTML = `
                            <li style="padding: 15px; text-align: center; color: #666; background: #f8f9fa; border-radius: 6px; margin: 10px 0;">
                                📋 Chưa có hóa đơn nào
                            </li>
                        `;
                        element.style.cssText = `
                            list-style: none; 
                            padding: 0; 
                            margin: 0; 
                            max-height: 400px; 
                            overflow-y: auto;
                        `;
                        parent = document.getElementById('sidebar') || document.body;
                        break;
                        
                    case 'current-order':
                        element = document.createElement('div');
                        element.id = 'current-order';
                        element.className = 'current-order';
                        element.innerHTML = `
                            <div style="padding: 20px; background: #fff; border: 2px solid #ddd; border-radius: 10px; margin: 15px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                                    🛒 <span>Đơn Hàng Hiện Tại</span>
                                </h4>
                                <div id="order-items" style="min-height: 60px; border: 1px dashed #ddd; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                                    <div style="text-align: center; color: #666;">
                                        <div style="font-size: 24px; margin-bottom: 10px;">☕</div>
                                        <div>Chưa có món nào được chọn</div>
                                    </div>
                                </div>
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; text-align: right;">
                                    <strong style="font-size: 18px; color: #007bff;">
                                        Tổng Cộng: <span id="order-total" style="color: #28a745;">0₫</span>
                                    </strong>
                                </div>
                            </div>
                        `;
                        parent = document.querySelector('.modal-body') || document.querySelector('#order-modal .modal-body') || document.body;
                        break;
                        
                    case 'order-total':
                        element = document.createElement('span');
                        element.id = 'order-total';
                        element.className = 'order-total-amount';
                        element.textContent = '0₫';
                        element.style.cssText = `
                            font-weight: bold; 
                            color: #28a745; 
                            font-size: 1.2em;
                        `;
                        parent = document.querySelector('.order-total') || document.getElementById('current-order') || document.body;
                        break;
                        
                    default:
                        safeLog(`⚠️ Unknown element type: ${elementId}`);
                        return;
                }
                
                if (element && parent) {
                    parent.appendChild(element);
                    created++;
                    safeLog(`✅ Force created: #${elementId}`);
                } else {
                    safeLog(`❌ Failed to force create: #${elementId}`);
                }
            }
        });
        
        if (created > 0) {
            safeLog(`🎉 Force created ${created} elements successfully`);
            
            // Add enhanced CSS for force-created elements
            addEnhancedCSS();
            
            // Initialize the force-created elements
            setTimeout(() => {
                initializeCreatedElements();
                
                // Final verification
                const finalCheck = checkCriticalElements();
                if (finalCheck.missing.length === 0) {
                    safeLog('🎊 All DOM elements are now available and functional!');
                } else {
                    safeLog(`⚠️ Still missing after force creation: ${finalCheck.missing.join(', ')}`);
                }
            }, 100);
        }
        
    } catch (error) {
        safeErrorHandler('❌ Error in force creation:', error);
    }
}

/**
 * Add enhanced CSS styles for force-created elements
 */
function addEnhancedCSS() {
    if (document.getElementById('enhanced-emergency-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'enhanced-emergency-styles';
    style.textContent = `
        /* Enhanced animations */
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        
        /* Enhanced sidebar */
        .sidebar:not(.collapsed) {
            animation: slideIn 0.3s ease;
        }
        
        /* Enhanced buttons */
        button {
            transition: all 0.2s ease;
        }
        
        button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        /* Enhanced menu grid */
        .menu-grid > div {
            animation: fadeIn 0.5s ease;
        }
        
        /* Mobile responsive enhancements */
        @media (max-width: 768px) {
            .sidebar {
                width: 100% !important;
            }
            
            .menu-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
                padding: 15px !important;
            }
            
            .admin-dropdown-menu {
                min-width: 200px !important;
                left: 0 !important;
                right: auto !important;
            }
        }
        
        /* Success and error states */
        .has-error {
            border-color: #dc3545 !important;
            background-color: #fff8f8 !important;
        }
        
        .has-success {
            border-color: #28a745 !important;
            background-color: #f8fff9 !important;
        }
    `;
    
    document.head.appendChild(style);
    safeLog('✅ Added enhanced CSS styles for force-created elements');
}

/**
 * Setup a DOM mutation observer to monitor critical elements
 */
function setupDOMMutationObserver() {
    try {
        // Don't setup observer if it already exists
        if (window._domMutationObserver) {
            safeLog('ℹ️ DOM Mutation Observer already exists');
            return;
        }

        safeLog('👁️ Setting up DOM Mutation Observer...');
        
        // Get critical element IDs
        const criticalElementIds = [
            'sidebar', 'menu-grid', 'invoice-list', 
            'loading-screen', 'admin-dropdown', 
            'current-order', 'order-total'
        ];
        
        // Track removed elements to avoid continuous restoration loops
        const removalTracker = {};
        criticalElementIds.forEach(id => { removalTracker[id] = 0; });
        
        // Set up maximum restoration attempts
        const MAX_RESTORATION_ATTEMPTS = 5;
        const RESET_INTERVAL_MS = 60000; // Reset attempt counter every minute
        
        // Reset attempt counters periodically
        setInterval(() => {
            criticalElementIds.forEach(id => { removalTracker[id] = 0; });
            safeLog('🔄 Reset DOM element restoration counters');
        }, RESET_INTERVAL_MS);
        
        // Function to handle element removal
        const handleElementRemoval = (id) => {
            if (removalTracker[id] >= MAX_RESTORATION_ATTEMPTS) {
                safeLog(`⚠️ Maximum restoration attempts (${MAX_RESTORATION_ATTEMPTS}) reached for #${id}, skipping auto-recovery`);
                
                // Show warning notification if available
                if (window.showNotification) {
                    window.showNotification(`DOM element #${id} keeps being removed. System may be unstable.`, 'warning');
                }
                return;
            }
            
            removalTracker[id]++;
            safeLog(`⚠️ Critical DOM element #${id} was removed, attempting restoration (${removalTracker[id]}/${MAX_RESTORATION_ATTEMPTS})...`);
            
            // Try to restore the specific element using forceCreateMissingElements
            forceCreateMissingElements([id]);
            
            // Log recovery attempt
            logRecoveryAttempt(id, 'mutation_observer');
            
            // Show brief notification if available
            if (window.showNotification) {
                window.showNotification(`Đã khôi phục phần tử #${id}`, 'info', 2000);
            }
        };
        
        // Create the mutation observer
        const observer = new MutationObserver((mutations) => {
            // Process in batches to avoid excessive checks
            let removedElements = new Set();
            
            mutations.forEach(mutation => {
                // Check for removed nodes
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(node => {
                        // Check if the removed node is a critical element
                        if (node.nodeType === Node.ELEMENT_NODE && node.id && criticalElementIds.includes(node.id)) {
                            removedElements.add(node.id);
                        }
                        
                        // Also check if any critical elements were children of the removed node
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            criticalElementIds.forEach(id => {
                                if (node.querySelector && node.querySelector(`#${id}`)) {
                                    removedElements.add(id);
                                }
                            });
                        }
                    });
                }
            });
            
            // Process each unique removed element
            removedElements.forEach(id => {
                // Verify the element is actually missing before attempting restoration
                if (!document.getElementById(id)) {
                    handleElementRemoval(id);
                }
            });
        });
        
        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Store observer reference for potential cleanup
        window._domMutationObserver = observer;
        
        // Schedule periodic checks to ensure critical elements exist
        setupPeriodicElementChecks();
        
        safeLog('✅ DOM Mutation Observer initialized');
    } catch (error) {
        safeErrorHandler('❌ Error setting up DOM Mutation Observer:', error);
    }
}

/**
 * Schedule periodic checks for critical DOM elements
 * This acts as a fallback mechanism if mutation observer misses anything
 */
function setupPeriodicElementChecks() {
    // Don't setup if it already exists
    if (window._periodicElementCheckInterval) {
        clearInterval(window._periodicElementCheckInterval);
    }
    
    // Check every 30 seconds
    const CHECK_INTERVAL_MS = 30000;
    
    window._periodicElementCheckInterval = setInterval(() => {
        const check = checkCriticalElements();
        if (check.missing.length > 0) {
            safeLog(`🔄 Periodic check found missing elements: ${check.missing.join(', ')}`);
            createMissingDOMElements();
            
            // Log recovery attempt
            check.missing.forEach(id => {
                logRecoveryAttempt(id, 'periodic_check');
            });
        }
    }, CHECK_INTERVAL_MS);
    
    safeLog(`🔄 Scheduled periodic element checks (every ${CHECK_INTERVAL_MS/1000}s)`);
}

/**
 * Log recovery attempts for analytics and debugging
 */
function logRecoveryAttempt(elementId, source) {
    try {
        // Initialize recovery log if it doesn't exist
        if (!window._recoveryLog) {
            window._recoveryLog = [];
        }
        
        // Add new recovery entry
        window._recoveryLog.push({
            elementId,
            timestamp: new Date().toISOString(),
            source,
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // Keep log size manageable (last 50 entries)
        if (window._recoveryLog.length > 50) {
            window._recoveryLog.shift();
        }
        
        // Store in localStorage for persistence
        try {
            localStorage.setItem('balancoffee_recovery_log', JSON.stringify(window._recoveryLog));
        } catch (storageError) {
            // Silent fail if localStorage is not available
        }
    } catch (error) {
        // Silent fail - don't let logging disrupt recovery
    }
}
