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

// Critical system tests
function runCriticalTests() {
    debugLog('info', 'Running critical system tests...');
    
    const tests = [
        // Test required DOM elements
        () => testElement('sidebar', true),
        () => testElement('menu-grid', true),
        () => testElement('admin-dropdown', true),
        () => testElement('invoice-list', true),
        () => testElement('loading-screen', true),
        
        // Test required functions
        () => testFunction('toggleSidebar', () => typeof window.toggleSidebar === 'function'),
        () => testFunction('toggleAdminDropdown', () => typeof window.toggleAdminDropdown === 'function'),
        () => testFunction('createNewInvoice', () => typeof window.createNewInvoice === 'function'),
        () => testFunction('filterInvoices', () => typeof window.filterInvoices === 'function'),
        
        // Test data availability
        () => testFunction('menuData', () => {
            if (!window.menuData) return false;
            if (!Array.isArray(window.menuData)) return false;
            return window.menuData.length > 0;
        }),
        
        // Test mobile helpers
        () => testFunction('mobileHelpers', () => {
            if (!window.mobileHelpers) return false;
            return typeof window.mobileHelpers.isMobile === 'function';
        })
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach((test, index) => {
        try {
            if (test()) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            failed++;
            debugLog('error', `Test ${index + 1} crashed`, error);
        }
    });
    
    debugLog('info', `Critical tests completed: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        debugLog('error', 'System has critical issues that need to be addressed');
        return false;
    } else {
        debugLog('success', 'All critical tests passed');
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
    debugLog('info', 'BalanCoffee Diagnostics v1.0 initialized');
    markLoadTime('diagnostics');
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        const report = generateDiagnosticReport();
        
        if (!report.criticalTests) {
            debugLog('error', '🚨 CRITICAL SYSTEM FAILURE DETECTED 🚨');
            debugLog('error', 'Please check the following:');
            debugLog('error', '1. All script files are loading correctly');
            debugLog('error', '2. DOM elements have correct IDs');
            debugLog('error', '3. Functions are properly exported to window');
            debugLog('error', '4. No JavaScript syntax errors');
        }
        
        // Make report available globally
        window.balanCoffeeDiagnostics = report;
        
    }, 2000);
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
