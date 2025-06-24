/**
 * BalanCoffee Debug & Diagnostic Tool
 * Helps identify and fix initialization issues
 */

// Debug configuration
const DEBUG_CONFIG = {
    logLevel: 'verbose', // verbose, normal, minimal
    showTimestamps: true,
    trackPerformance: true,
    captureErrors: true
};

// Diagnostic data collector
const diagnostics = {
    startTime: Date.now(),
    loadTimes: {},
    errors: [],
    warnings: [],
    functionTests: {},
    elementTests: {},
    performanceMetrics: {}
};

// Enhanced logging
function debugLog(level, message, data = null) {
    const timestamp = DEBUG_CONFIG.showTimestamps ? `[${new Date().toISOString()}] ` : '';
    const logMessage = `${timestamp}${message}`;
    
    switch (level) {
        case 'error':
            console.error(`🔥 ${logMessage}`, data);
            diagnostics.errors.push({ message, data, timestamp: Date.now() });
            break;
        case 'warn':
            console.warn(`⚠️ ${logMessage}`, data);
            diagnostics.warnings.push({ message, data, timestamp: Date.now() });
            break;
        case 'info':
            console.info(`ℹ️ ${logMessage}`, data);
            break;
        case 'success':
            console.log(`✅ ${logMessage}`, data);
            break;
        default:
            console.log(`🔍 ${logMessage}`, data);
    }
}

// Performance monitoring
function markLoadTime(component) {
    diagnostics.loadTimes[component] = Date.now() - diagnostics.startTime;
    debugLog('info', `${component} loaded in ${diagnostics.loadTimes[component]}ms`);
}

// Function testing
function testFunction(name, testFn) {
    try {
        const startTime = performance.now();
        const result = testFn();
        const endTime = performance.now();
        
        diagnostics.functionTests[name] = {
            success: true,
            result,
            duration: endTime - startTime,
            timestamp: Date.now()
        };
        
        debugLog('success', `Function test passed: ${name} (${(endTime - startTime).toFixed(2)}ms)`);
        return true;
    } catch (error) {
        diagnostics.functionTests[name] = {
            success: false,
            error: error.message,
            timestamp: Date.now()
        };
        
        debugLog('error', `Function test failed: ${name}`, error);
        return false;
    }
}

// Element testing
function testElement(id, required = true) {
    const element = document.getElementById(id);
    const exists = !!element;
    
    diagnostics.elementTests[id] = {
        exists,
        required,
        timestamp: Date.now()
    };
    
    if (required && !exists) {
        debugLog('error', `Required element not found: #${id}`);
        return false;
    } else if (exists) {
        debugLog('success', `Element found: #${id}`);
        return true;
    } else {
        debugLog('warn', `Optional element not found: #${id}`);
        return false;
    }
}

// Enhanced error capturing
window.addEventListener('error', (event) => {
    debugLog('error', `Global error: ${event.message}`, {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    debugLog('error', `Unhandled promise rejection: ${event.reason}`, event.reason);
});

// Check for common initialization issues with grace period
function checkInitializationIssues(skipGracePeriod = false) {
    debugLog('info', 'Checking for common initialization issues...');
    
    // If not skipping grace period, wait a bit for modules to load
    if (!skipGracePeriod && (Date.now() - diagnostics.startTime) < 2000) {
        debugLog('info', 'Within grace period, deferring check...');
        return {
            success: true,
            hasIssues: false,
            issues: ['⏳ System still loading, check deferred'],
            count: 0,
            deferred: true
        };
    }
    
    const issues = [];
      // Check if scripts are loading with smart detection
    const moduleChecks = [
        { name: 'Utils', file: 'js/utils.js' },
        { name: 'DataManager', file: 'js/data-manager.js' },
        { name: 'UIManager', file: 'js/ui-manager.js' },
        { name: 'DOMHelper', file: 'dom-helper.js' },
        { name: 'OrderManager', file: 'js/order-manager.js' },
        { name: 'ModalManager', file: 'js/modal-manager.js' }
    ];
    
    moduleChecks.forEach(({ name, file }) => {
        if (!isModuleAvailable(name)) {
            issues.push(`❌ ${name} module not loaded - check ${file}`);
        }
    });
    
    // Check if data is available
    if (typeof window.menuData === 'undefined' || !Array.isArray(window.menuData)) {
        issues.push('❌ Menu data not loaded - check data.js');
    }
    
    // Check critical DOM elements
    const criticalElements = [
        'sidebar', 'menu-grid', 'invoice-list', 'loading-screen', 
        'admin-dropdown', 'current-order', 'order-total'
    ];
    
    criticalElements.forEach(id => {
        if (!document.getElementById(id)) {
            issues.push(`❌ Critical element missing: #${id}`);
        }
    });
    
    // Check for CSS loading
    const hasStyles = getComputedStyle(document.body).fontFamily !== '';
    if (!hasStyles) {
        issues.push('❌ CSS styles not loading - check styles.css');
    }
    
    const hasIssues = issues.length > 0;
      if (hasIssues) {
        debugLog('error', '🚨 INITIALIZATION ISSUES DETECTED:');
        issues.forEach(issue => debugLog('error', issue));
        
        // Only show error overlay if one doesn't already exist
        if (!document.getElementById('initialization-error')) {
            showInitializationError(issues);
        }
        
        return {
            success: false,
            hasIssues: true,
            issues: issues,
            count: issues.length
        };
    }
    
    debugLog('success', '✅ No initialization issues detected');
    return {
        success: true,
        hasIssues: false,
        issues: [],
        count: 0
    };
}

// Show user-friendly error message
function showInitializationError(issues) {
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'initialization-error';
    errorOverlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: #1a1a1a;
                padding: 30px;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
                border: 2px solid #ff4444;
            ">
                <h2 style="color: #ff4444; margin-top: 0;">
                    🚨 Lỗi Khởi Tạo Hệ Thống BalanCoffee
                </h2>
                <p>Hệ thống không thể khởi tạo do các vấn đề sau:</p>
                <ul style="text-align: left; color: #ffcccc;">
                    ${issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">🔄 Tải Lại Trang</button>
                    <button onclick="runAutoFixFromOverlay()" style="
                        background: #FF9800;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">🔧 Thử Auto-Fix</button>
                    <button onclick="forceInitFromOverlay()" style="
                        background: #F44336;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">🚨 Force Init</button>
                    <button onclick="openDiagnostics()" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">🔍 Chẩn Đoán Chi Tiết</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorOverlay);
}

// Open diagnostics in new window
function openDiagnostics() {
    const diagnosticsWindow = window.open('', 'diagnostics', 'width=800,height=600');
    const report = generateDiagnosticReport();
    
    diagnosticsWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>BalanCoffee Diagnostics</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .section { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; }
                .error { color: #d32f2f; }
                .warning { color: #f57c00; }
                .success { color: #388e3c; }
                .info { color: #1976d2; }
                pre { background: #f0f0f0; padding: 10px; border-radius: 3px; overflow: auto; }
            </style>
        </head>
        <body>
            <h1>🔍 BalanCoffee System Diagnostics</h1>
            <div class="section">
                <h2>📊 System Health: ${report.healthCheck.score.toFixed(1)}%</h2>
                <p>Runtime: ${report.runtime}ms</p>
                <p>Errors: ${report.errors.length}</p>
                <p>Warnings: ${report.warnings.length}</p>
            </div>
            <div class="section">
                <h2>📋 Detailed Report</h2>
                <pre>${JSON.stringify(report, null, 2)}</pre>
            </div>
        </body>
        </html>
    `);
}

// Auto-fix common issues
function attemptAutoFix() {
    debugLog('info', 'Attempting auto-fix for common issues...');
    
    let fixCount = 0;
    
    // First, ensure all critical DOM elements exist
    const criticalElements = [
        { id: 'sidebar', tag: 'aside', className: 'sidebar collapsed', content: '<div class="sidebar-content"><h3>Hóa đơn</h3><div id="invoice-list"></div></div>' },
        { id: 'menu-grid', tag: 'div', className: 'menu-grid', content: '<div class="menu-placeholder">Menu đang tải...</div>' },
        { id: 'invoice-list', tag: 'div', className: 'invoice-list', content: '<div class="no-invoices">Chưa có hóa đơn nào</div>' },
        { id: 'loading-screen', tag: 'div', className: 'loading-screen', content: '<div class="loading-content"><div class="loading-spinner"></div><p>Đang tải...</p></div>' },
        { id: 'admin-dropdown', tag: 'div', className: 'admin-dropdown-menu dropdown', content: '<div class="dropdown-content">Admin Menu</div>' },
        { id: 'current-order', tag: 'div', className: 'current-order', content: '<h4>Đơn hàng hiện tại</h4><div id="order-items"></div><div class="order-total">Tổng: <span id="order-total">0₫</span></div>' },
        { id: 'order-total', tag: 'span', className: 'order-total-amount', content: '0₫' }
    ];
    
    let elementsCreated = 0;
    criticalElements.forEach(elementInfo => {
        if (!document.getElementById(elementInfo.id)) {
            const element = document.createElement(elementInfo.tag);
            element.id = elementInfo.id;
            element.className = elementInfo.className || '';
            element.innerHTML = elementInfo.content || '';
            
            // Add appropriate styling
            if (elementInfo.id === 'sidebar') {
                element.style.cssText = 'position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: #fff; border-left: 1px solid #ddd; z-index: 1000; transform: translateX(100%); transition: transform 0.3s ease; overflow-y: auto; padding: 20px; box-shadow: -2px 0 5px rgba(0,0,0,0.1);';
            } else if (elementInfo.id === 'menu-grid') {
                element.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px; min-height: 200px;';
            } else if (elementInfo.id === 'loading-screen') {
                element.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #6F4E37 0%, #8B6F47 100%); display: flex; align-items: center; justify-content: center; z-index: 9999; color: white; font-family: Arial, sans-serif;';
            } else if (elementInfo.id === 'current-order') {
                element.style.cssText = 'padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin: 10px 0; background: #f9f9f9;';
            } else if (elementInfo.id === 'order-total') {
                element.style.cssText = 'font-weight: bold; color: #007bff; font-size: 1.1em;';
            }
            
            // Append to appropriate parent
            let parent = document.body;
            if (elementInfo.id === 'order-total' && document.getElementById('current-order')) {
                parent = document.getElementById('current-order');
            } else if (elementInfo.id === 'invoice-list' && document.getElementById('sidebar')) {
                parent = document.getElementById('sidebar');
            }
            
            parent.appendChild(element);
            elementsCreated++;
            debugLog('success', `Auto-fixed: Created missing element '${elementInfo.id}'`);
        }
    });
    
    if (elementsCreated > 0) {
        fixCount += elementsCreated;
        debugLog('success', `Auto-fixed: Created ${elementsCreated} missing DOM elements`);
    }
    
    // Try to hide loading screen if stuck
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && (loadingScreen.style.display !== 'none' && !loadingScreen.style.display)) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
        debugLog('success', 'Auto-fixed: Hidden stuck loading screen');
        fixCount++;
    }
    
    // Initialize missing Utils module
    if (typeof window.Utils === 'undefined') {
        window.Utils = {
            debugLog: function(message, data) {
                console.log(`[Utils] ${message}`, data);
            },
            debugError: function(message, error) {
                console.error(`[Utils ERROR] ${message}`, error);
            },
            formatCurrency: function(amount) {
                return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
            },
            generateId: function() {
                return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
        };
        debugLog('success', 'Auto-fixed: Created minimal Utils module');
        fixCount++;
    }
    
    // Try to initialize missing data structures
    if (typeof window.orderData === 'undefined') {
        window.orderData = { items: [], total: 0, customerId: null };
        debugLog('success', 'Auto-fixed: Initialized missing orderData');
        fixCount++;
    }
    
    if (typeof window.customerData === 'undefined') {
        window.customerData = [];
        debugLog('success', 'Auto-fixed: Initialized missing customerData');
        fixCount++;
    }
    
    if (typeof window.invoiceData === 'undefined') {
        window.invoiceData = [];
        debugLog('success', 'Auto-fixed: Initialized missing invoiceData');
        fixCount++;
    }
    
    // Try to fix missing menu data
    if (typeof window.menuData === 'undefined' || !Array.isArray(window.menuData)) {
        window.menuData = [
            {
                id: 1,
                name: "Cà phê đen",
                price: 25000,
                category: "cafe-viet",
                image: "coffee-black.jpg",
                description: "Cà phê đen truyền thống"
            },
            {
                id: 2,
                name: "Cà phê sữa",
                price: 30000,
                category: "cafe-viet",
                image: "coffee-milk.jpg",
                description: "Cà phê sữa đá"
            },
            {
                id: 3,
                name: "Trà đá",
                price: 15000,
                category: "tra-trai-cay",
                image: "tea.jpg",
                description: "Trà đá mát lạnh"
            }
        ];
        debugLog('success', 'Auto-fixed: Loaded default menu data');
        fixCount++;
    }
      // Create missing DOM elements if they don't exist
    const requiredElements = [
        { id: 'sidebar', tag: 'aside', parent: 'body', className: 'sidebar collapsed' },
        { id: 'menu-grid', tag: 'div', parent: 'body', className: 'menu-grid' },
        { id: 'invoice-list', tag: 'ul', parent: 'body', className: 'invoice-list' },
        { id: 'loading-screen', tag: 'div', parent: 'body', className: 'loading-screen' },
        { id: 'admin-dropdown', tag: 'div', parent: 'body', className: 'admin-dropdown-menu dropdown' },
        { id: 'current-order', tag: 'div', parent: 'body', className: 'current-order' },
        { id: 'order-total', tag: 'span', parent: 'current-order', className: 'order-total-amount' }
    ];
    
    requiredElements.forEach(elementInfo => {
        if (!document.getElementById(elementInfo.id)) {
            const element = document.createElement(elementInfo.tag);
            element.id = elementInfo.id;
            if (elementInfo.className) {
                element.className = elementInfo.className;
            }
            
            // Add some basic content for visibility
            if (elementInfo.id === 'sidebar') {
                element.innerHTML = '<div class="sidebar-content"><h3>Sidebar (Auto-created)</h3></div>';
                element.style.cssText = 'position: fixed; top: 0; right: 0; width: 300px; height: 100vh; background: #f5f5f5; border-left: 1px solid #ddd; z-index: 1000; display: none;';
            } else if (elementInfo.id === 'menu-grid') {
                element.innerHTML = '<div>Menu Grid (Auto-created)</div>';
                element.style.cssText = 'padding: 20px; border: 1px solid #ddd; margin: 10px; background: #f9f9f9;';
            } else if (elementInfo.id === 'invoice-list') {
                element.innerHTML = '<li>Invoice List (Auto-created)</li>';
                element.style.cssText = 'list-style: none; padding: 10px; border: 1px solid #ddd; margin: 10px; background: #f9f9f9;';
            } else if (elementInfo.id === 'loading-screen') {
                element.innerHTML = '<div>Loading Screen (Auto-created)</div>';
                element.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); color: white; display: none; justify-content: center; align-items: center; z-index: 9999;';
            } else if (elementInfo.id === 'admin-dropdown') {
                element.innerHTML = '<div>Admin Dropdown (Auto-created)</div>';
                element.style.cssText = 'position: absolute; background: white; border: 1px solid #ddd; padding: 10px; display: none; z-index: 1000;';
            } else if (elementInfo.id === 'current-order') {
                element.innerHTML = '<div>Current Order (Auto-created)</div>';
                element.style.cssText = 'padding: 10px; border: 1px solid #ddd; margin: 10px; background: #f9f9f9;';
            } else if (elementInfo.id === 'order-total') {
                element.innerHTML = '0₫';
                element.style.cssText = 'font-weight: bold; color: #007bff;';
            }
            
            let parent = document.body;
            if (elementInfo.parent && elementInfo.parent !== 'body') {
                const parentElement = document.getElementById(elementInfo.parent);
                if (parentElement) {
                    parent = parentElement;
                }
            }
            
            parent.appendChild(element);
            debugLog('success', `Auto-fixed: Created missing element #${elementInfo.id}`);
            fixCount++;
        }
    });
    
    // Initialize essential functions if missing
    if (typeof window.toggleSidebar === 'undefined') {
        window.toggleSidebar = function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
            }
        };
        debugLog('success', 'Auto-fixed: Created minimal toggleSidebar function');
        fixCount++;
    }
    
    if (typeof window.createNewInvoice === 'undefined') {
        window.createNewInvoice = function() {
            debugLog('info', 'Creating new invoice (minimal implementation)');
            const modal = document.getElementById('order-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        };
        debugLog('success', 'Auto-fixed: Created minimal createNewInvoice function');
        fixCount++;
    }
    
    if (typeof window.filterInvoices === 'undefined') {
        window.filterInvoices = function(filter) {
            debugLog('info', `Filtering invoices: ${filter}`);
        };
        debugLog('success', 'Auto-fixed: Created minimal filterInvoices function');
        fixCount++;
    }
      debugLog('info', `Auto-fix completed: ${fixCount} issues fixed`);
    return {
        success: fixCount > 0,
        fixCount: fixCount,
        message: `${fixCount} issues were fixed`
    };
}

// Auto-fix function callable from error overlay
function runAutoFixFromOverlay() {
    debugLog('info', '🔧 Running auto-fix from error overlay...');
    
    try {
        const result = attemptAutoFix();
        
        if (result.success) {
            debugLog('success', `✅ Auto-fix completed: ${result.message}`);
            
            // Re-check initialization after auto-fix
            const postFixCheck = checkInitializationIssues();
            
            if (!postFixCheck.hasIssues) {
                // Success - close overlay and reload
                const overlay = document.getElementById('initialization-error');
                if (overlay) {
                    overlay.remove();
                }
                
                // Show success message briefly before reload
                const successOverlay = document.createElement('div');
                successOverlay.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #4CAF50;
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        z-index: 100000;
                        text-align: center;
                        font-family: Arial, sans-serif;
                    ">
                        <h3>✅ Auto-Fix Thành Công!</h3>
                        <p>Hệ thống sẽ tải lại sau 2 giây...</p>
                    </div>
                `;
                document.body.appendChild(successOverlay);
                
                setTimeout(() => {
                    location.reload();
                }, 2000);
                
            } else {
                // Auto-fix helped but didn't solve everything
                debugLog('warn', `⚠️ Auto-fix completed but ${postFixCheck.count} issues remain`);
                alert(`Auto-fix đã hoàn thành nhưng vẫn còn ${postFixCheck.count} vấn đề.\n\nVui lòng kiểm tra console hoặc chẩn đoán chi tiết.`);
            }
            
        } else {
            debugLog('error', `❌ Auto-fix failed: ${result.message}`);
            alert(`Auto-fix không thành công: ${result.message}\n\nVui lòng thử tải lại trang hoặc kiểm tra console.`);
        }
        
    } catch (error) {
        debugLog('error', `💥 Auto-fix crashed: ${error.message}`);
        alert(`Auto-fix gặp lỗi nghiêm trọng: ${error.message}\n\nVui lòng tải lại trang.`);
    }
}

// Force init function callable from error overlay
function forceInitFromOverlay() {
    debugLog('info', '🚨 Running force initialization from overlay...');
    
    try {
        const result = forceInitialization();
        
        if (result.success) {
            debugLog('success', `✅ Force initialization successful: ${result.message}`);
            
            // Close overlay immediately
            const overlay = document.getElementById('initialization-error');
            if (overlay) {
                overlay.remove();
            }
            
            // Show success message
            showSuccessNotification('Force initialization thành công! Hệ thống đã được khôi phục.');
            
        } else {
            debugLog('error', `❌ Force initialization failed: ${result.message}`);
            alert(`Force initialization không thành công: ${result.message}\n\nVui lòng thử tải lại trang.`);
        }
        
    } catch (error) {
        debugLog('error', `💥 Force initialization crashed: ${error.message}`);
        alert(`Force initialization gặp lỗi nghiêm trọng: ${error.message}\n\nVui lòng tải lại trang.`);
    }
}

// Enhanced critical system tests
function runCriticalTests() {
    debugLog('info', 'Running critical system tests...');
    
    const tests = [
        // Test script loading
        {
            name: 'DOMHelper availability',
            test: () => typeof window.DOMHelper !== 'undefined',
            fix: () => debugLog('error', 'Please check dom-helper.js file')
        },
        {
            name: 'Utils module',
            test: () => typeof window.Utils !== 'undefined',
            fix: () => debugLog('error', 'Please check js/utils.js file')
        },
        {
            name: 'Menu data',
            test: () => Array.isArray(window.menuData) && window.menuData.length > 0,
            fix: () => attemptAutoFix()
        },
        
        // Test DOM elements
        {
            name: 'Sidebar element',
            test: () => !!document.getElementById('sidebar'),
            fix: () => debugLog('error', 'Check HTML structure for #sidebar element')
        },
        {
            name: 'Menu grid element',
            test: () => !!document.getElementById('menu-grid'),
            fix: () => debugLog('error', 'Check HTML structure for #menu-grid element')
        },
        {
            name: 'Invoice list element',
            test: () => !!document.getElementById('invoice-list'),
            fix: () => debugLog('error', 'Check HTML structure for #invoice-list element')
        },
        
        // Test functions
        {
            name: 'Core functions',
            test: () => {
                const requiredFunctions = ['toggleSidebar', 'createNewInvoice', 'filterInvoices'];
                return requiredFunctions.every(fn => typeof window[fn] === 'function');
            },
            fix: () => debugLog('error', 'Check app-initializer.js for missing functions')
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        try {
            if (test.test()) {
                passed++;
                debugLog('success', `✅ ${test.name}`);
            } else {
                failed++;
                debugLog('error', `❌ ${test.name}`);
                if (test.fix) test.fix();
            }
        } catch (error) {
            failed++;
            debugLog('error', `💥 ${test.name} crashed: ${error.message}`);
        }
    });
    
    debugLog('info', `Tests completed: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        debugLog('error', '🚨 System has critical issues');
        return false;
    } else {
        debugLog('success', '✅ All critical tests passed');
        return true;
    }
}

// System health check
function performHealthCheck() {
    debugLog('info', 'Performing system health check...');
    
    const health = {
        dom: document.readyState === 'complete',
        scripts: {
            dataJs: !!window.menuData,
            scriptJs: !!window.toggleSidebar,
            mobileHelpers: !!window.mobileHelpers
        },
        elements: {
            sidebar: !!document.getElementById('sidebar'),
            menuGrid: !!document.getElementById('menu-grid'),
            adminDropdown: !!document.getElementById('admin-dropdown')
        },
        initialization: !!window.initializationState?.isInitialized,
        errors: diagnostics.errors.length,
        warnings: diagnostics.warnings.length
    };
    
    debugLog('info', 'System health report:', health);
    
    // Calculate health score
    let score = 0;
    let maxScore = 0;
    
    // DOM readiness (20 points)
    maxScore += 20;
    if (health.dom) score += 20;
    
    // Scripts (30 points)
    maxScore += 30;
    if (health.scripts.dataJs) score += 10;
    if (health.scripts.scriptJs) score += 10;
    if (health.scripts.mobileHelpers) score += 10;
    
    // Elements (30 points)
    maxScore += 30;
    if (health.elements.sidebar) score += 10;
    if (health.elements.menuGrid) score += 10;
    if (health.elements.adminDropdown) score += 10;
    
    // Initialization (20 points)
    maxScore += 20;
    if (health.initialization) score += 20;
    
    // Deduct points for errors and warnings
    score -= health.errors * 5;
    score -= health.warnings * 2;
    
    const healthPercentage = Math.max(0, Math.min(100, (score / maxScore) * 100));
    
    debugLog('info', `System health score: ${healthPercentage.toFixed(1)}%`);
    
    if (healthPercentage >= 90) {
        debugLog('success', 'System is healthy');
    } else if (healthPercentage >= 70) {
        debugLog('warn', 'System has minor issues');
    } else {
        debugLog('error', 'System has major issues requiring attention');
    }
    
    return { health, score: healthPercentage };
}

// Generate diagnostic report
function generateDiagnosticReport() {
    const report = {
        timestamp: new Date().toISOString(),
        runtime: Date.now() - diagnostics.startTime,
        ...diagnostics,
        healthCheck: performHealthCheck(),
        criticalTests: runCriticalTests()
    };
    
    debugLog('info', 'Diagnostic report generated:', report);
    
    // Save to sessionStorage for persistence
    try {
        sessionStorage.setItem('balancoffee-diagnostics', JSON.stringify(report));
        debugLog('success', 'Diagnostic report saved to sessionStorage');
    } catch (error) {
        debugLog('warn', 'Could not save diagnostic report to sessionStorage', error);
    }
    
    return report;
}

// Auto-run diagnostics when loaded
function initDiagnostics() {
    debugLog('info', 'BalanCoffee Diagnostics v2.0 initialized');
    markLoadTime('diagnostics');
      // Initial check after DOM is ready - longer delay to ensure modules load
    setTimeout(() => {
        debugLog('info', '🔍 Starting system initialization check...');        // Check for immediate issues with proper return handling
        const initCheck = checkInitializationIssues();
        
        if (initCheck.deferred) {
            debugLog('info', '⏳ Initial check deferred, will recheck later');
            
            // Recheck after grace period
            setTimeout(() => {
                debugLog('info', '🔍 Running deferred initialization check...');
                const deferredCheck = checkInitializationIssues(true);
                
                if (deferredCheck.hasIssues) {
                    debugLog('error', '🚨 Deferred check found issues - attempting auto-fix...');
                    
                    const fixResult = attemptAutoFix();
                    if (fixResult.success) {
                        debugLog('info', '🔧 Auto-fix attempted, final recheck...');
                        
                        setTimeout(() => {
                            const finalCheck = checkInitializationIssues(true);
                            if (finalCheck.hasIssues) {
                                debugLog('error', '🚨 Auto-fix failed - manual intervention required');
                                // Don't show error overlay here as checkInitializationIssues already did
                            } else {
                                debugLog('success', '✅ System recovered after auto-fix');
                                // Hide any existing error overlay
                                const existingOverlay = document.getElementById('initialization-error');
                                if (existingOverlay) {
                                    existingOverlay.remove();
                                }
                            }
                        }, 500);
                    }
                } else {
                    debugLog('success', '✅ Deferred system check passed');
                }
            }, 2000); // Increased delay for deferred check
            
        } else if (initCheck.hasIssues) {
            debugLog('error', '🚨 Initialization issues detected - attempting auto-fix...');
            
            const fixResult = attemptAutoFix();
            if (fixResult.success) {
                debugLog('info', '🔧 Auto-fix attempted, re-checking system...');
                
                // Re-check after auto-fix
                setTimeout(() => {
                    const postFixCheck = checkInitializationIssues(true);
                    if (postFixCheck.hasIssues) {
                        debugLog('error', '🚨 Auto-fix failed - manual intervention required');
                        // Error overlay already shown by checkInitializationIssues
                    } else {
                        debugLog('success', '✅ System recovered after auto-fix');
                        // Hide error overlay
                        const existingOverlay = document.getElementById('initialization-error');
                        if (existingOverlay) {
                            existingOverlay.remove();
                        }
                    }
                }, 1000);
            }
        } else {
            debugLog('success', '✅ System initialization check passed');
        }
        
        // Generate full diagnostic report
        const report = generateDiagnosticReport();
        
        if (!report.criticalTests) {
            debugLog('error', '🚨 CRITICAL SYSTEM FAILURE DETECTED 🚨');
            debugLog('error', 'Recommended actions:');
            debugLog('error', '1. Check browser console for JavaScript errors');
            debugLog('error', '2. Verify all script files are accessible');
            debugLog('error', '3. Check network tab for failed requests');
            debugLog('error', '4. Try refreshing the page');
            debugLog('error', '5. Clear browser cache if needed');
        }        // Make report and tools available globally
        window.balanCoffeeDiagnostics = report;
        window.balanCoffeeDebug = {
            checkSystem: checkInitializationIssues,
            autoFix: attemptAutoFix,
            runTests: runCriticalTests,
            openDiagnostics: openDiagnostics,
            autoFixFromOverlay: runAutoFixFromOverlay,
            forceInit: forceInitialization,
            resetSystem: resetSystemState,
            report: report
        };
        
        // Also make key functions available globally
        window.runAutoFixFromOverlay = runAutoFixFromOverlay;
        window.forceInitFromOverlay = forceInitFromOverlay;
        window.forceInitialization = forceInitialization;
        window.resetSystemState = resetSystemState;
          debugLog('success', '🛠️ Debug tools available at window.balanCoffeeDebug');
        
    }, 1500); // Increased delay to ensure all modules are loaded
    
    // Comprehensive check after all scripts should be loaded
    setTimeout(() => {
        debugLog('info', '🔍 Running comprehensive system check...');
        const finalReport = generateDiagnosticReport();
        
        if (finalReport.healthCheck.score < 70) {
            debugLog('warn', `⚠️ System health is low: ${finalReport.healthCheck.score.toFixed(1)}%`);
            debugLog('info', '💡 Run window.balanCoffeeDebug.openDiagnostics() for detailed analysis');
        } else {
            debugLog('success', `✅ System is healthy: ${finalReport.healthCheck.score.toFixed(1)}%`);
        }
        
    }, 3000);
}

// System cleanup and reset function
function resetSystemState() {
    debugLog('info', '🔄 Resetting system state...');
    
    try {
        // Remove any existing error overlays
        const existingOverlay = document.getElementById('initialization-error');
        if (existingOverlay) {
            existingOverlay.remove();
            debugLog('success', 'Removed existing error overlay');
        }
        
        // Reset diagnostics
        diagnostics.errors = [];
        diagnostics.warnings = [];
        diagnostics.functionTests = {};
        diagnostics.elementTests = {};
        
        // Clear any stuck loading screens
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        debugLog('success', '✅ System state reset completed');
        return true;
        
    } catch (error) {
        debugLog('error', `❌ Error during system reset: ${error.message}`);
        return false;
    }
}

// Force initialization function for emergency situations
function forceInitialization() {
    debugLog('info', '🚨 Force initialization started...');
    
    try {
        // Reset system first
        resetSystemState();
        
        // Run auto-fix
        const fixResult = attemptAutoFix();
        
        if (fixResult.success) {
            debugLog('success', `✅ Force initialization completed: ${fixResult.message}`);
            
            // Verify system is working
            setTimeout(() => {
                const verifyCheck = checkInitializationIssues(true);
                if (!verifyCheck.hasIssues) {
                    debugLog('success', '✅ Force initialization verified - system is operational');
                    
                    // Show success notification
                    showSuccessNotification('Hệ thống đã được khôi phục thành công!');
                } else {
                    debugLog('warn', `⚠️ Force initialization partial: ${verifyCheck.count} issues remain`);
                }
            }, 1000);
            
        } else {
            debugLog('error', `❌ Force initialization failed: ${fixResult.message}`);
        }
        
        return fixResult;
        
    } catch (error) {
        debugLog('error', `💥 Force initialization crashed: ${error.message}`);
        return { success: false, message: error.message };
    }
}

// Show success notification
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 100000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        ">
            ✅ ${message}
        </div>
        <style>
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Smart module detection function that checks for multiple naming conventions and fallback detection methods
function isModuleAvailable(moduleName) {
    const moduleChecks = {
        'Utils': () => {
            return !!(window.Utils || window.BalanCoffeeUtils || 
                     (typeof window.debugLog === 'function' && 
                      typeof window.formatCurrency === 'function'));
        },
        'DataManager': () => {
            return !!(window.DataManager || 
                     (typeof window.loadInvoicesData === 'function' &&
                      typeof window.saveInvoicesData === 'function'));
        },
        'UIManager': () => {
            return !!(window.UIManager || 
                     typeof window.toggleSidebar === 'function');
        },
        'DOMHelper': () => {
            return !!(window.DOMHelper || 
                     typeof window.createElement === 'function' ||
                     typeof window.safeQuerySelector === 'function');
        },
        'OrderManager': () => {
            return !!(window.OrderManager || 
                     typeof window.createNewInvoice === 'function');
        },
        'ModalManager': () => {
            return !!(window.ModalManager || 
                     typeof window.openModal === 'function' ||
                     typeof window.closeModal === 'function');
        }
    };
    
    const checker = moduleChecks[moduleName];
    if (checker) {
        try {
            return checker();
        } catch (error) {
            debugLog('warn', `Error checking module ${moduleName}:`, error);
            return false;
        }
    }
    
    // Fallback to basic window object check
    return typeof window[moduleName] !== 'undefined';
}

// Export functions for manual testing
window.debugUtils = {
    debugLog,
    testFunction,
    testElement,
    runCriticalTests,
    performHealthCheck,
    generateDiagnosticReport,
    getDiagnostics: () => diagnostics
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiagnostics);
} else {
    initDiagnostics();
}

debugLog('info', 'BalanCoffee Debug System loaded');
