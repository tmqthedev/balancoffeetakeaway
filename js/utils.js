/**
 * BalanCoffee - Utility Functions
 * Chứa các hàm tiện ích chung cho toàn ứng dụng
 */

// =============================================================================
// GLOBAL STATE
// =============================================================================

window.BalanCoffeeState = {
    currentOrder: [],
    invoices: [],
    currentInvoiceId: null,
    currentCategory: 'all',
    isAdminMode: false,
    orderHistory: [],
    shiftStartTime: null,
    currentShiftEmployee: null,
    currentShiftNote: null,
    
    // Initialization state
    initializationState: {
        isInitializing: false,
        isInitialized: false,
        attempts: 0,
        maxAttempts: 3,
        lastError: null
    }
};

// Make state globally accessible
window.STATE = window.BalanCoffeeState;

// =============================================================================
// DEBUG AND LOGGING UTILITIES
// =============================================================================

/**
 * Debug logging function
 */
window.debugLog = function(message, data = null) {
    if (!window.CONFIG?.DEBUG_MODE) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
};

/**
 * Error logging function
 */
window.debugError = function(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${message}`, error || '');
};

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format price in Vietnamese currency
 */
window.formatPrice = function(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0₫';
    }
    return price.toLocaleString('vi-VN') + '₫';
};

/**
 * Format date and time in Vietnamese format
 */
window.formatDateTime = function(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } catch (error) {
        window.debugError('Error formatting date:', error);
        return '-';
    }
};

/**
 * Format duration from start time to now
 */
window.formatDuration = function(startTime) {
    if (!startTime) return '-';
    
    try {
        const now = new Date();
        const start = new Date(startTime);
        const duration = Math.floor((now - start) / 1000 / 60); // minutes
        
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        
        return `${hours}h ${minutes}m`;
    } catch (error) {
        window.debugError('Error formatting duration:', error);
        return '-';
    }
};

// =============================================================================
// DOM UTILITIES
// =============================================================================

/**
 * Ensure DOM is ready before executing callback
 */
window.ensureDOMReady = function(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

/**
 * Check if required elements exist in DOM
 */
window.checkRequiredElements = function() {
    const requiredElements = window.CONFIG?.REQUIRED_ELEMENTS || [];
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
    
    window.debugLog(`✅ Found elements: ${found.join(', ')}`);
    if (missing.length > 0) {
        window.debugError(`❌ Missing elements: ${missing.join(', ')}`);
    }
    
    return missing.length === 0;
};

/**
 * Safe element selection with error handling
 */
window.safeGetElement = function(selector, required = false) {
    try {
        const element = typeof selector === 'string' 
            ? document.getElementById(selector) || document.querySelector(selector)
            : selector;
        
        if (!element && required) {
            window.debugError(`❌ Required element not found: ${selector}`);
        }
        
        return element;
    } catch (error) {
        window.debugError(`❌ Error selecting element: ${selector}`, error);
        return null;
    }
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate menu data structure
 */
window.validateMenuData = function(data) {
    if (!Array.isArray(data)) {
        window.debugError('Menu data is not an array');
        return false;
    }
    
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
};

/**
 * Validate invoice data structure
 */
window.validateInvoice = function(invoice) {
    return invoice &&
           typeof invoice.id === 'string' &&
           Array.isArray(invoice.items) &&
           typeof invoice.total === 'number' &&
           typeof invoice.status === 'string' &&
           typeof invoice.createdAt === 'string';
};

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

/**
 * Safe array operation with error handling
 */
window.safeArrayOperation = function(array, operation, defaultValue = []) {
    try {
        if (!Array.isArray(array)) {
            window.debugError('Expected array but received:', typeof array);
            return defaultValue;
        }
        
        return operation(array);
    } catch (error) {
        window.debugError('Error in array operation:', error);
        return defaultValue;
    }
};

/**
 * Generate unique ID
 */
window.generateId = function(prefix = 'ID') {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================================================
// LOCAL STORAGE UTILITIES
// =============================================================================

/**
 * Safe localStorage get with error handling
 */
window.safeLocalStorageGet = function(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        window.debugError(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
};

/**
 * Safe localStorage set with error handling
 */
window.safeLocalStorageSet = function(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        window.debugError(`Error writing to localStorage: ${key}`, error);
        return false;
    }
};

/**
 * Safe localStorage remove with error handling
 */
window.safeLocalStorageRemove = function(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        window.debugError(`Error removing from localStorage: ${key}`, error);
        return false;
    }
};

// =============================================================================
// ASYNC UTILITIES
// =============================================================================

/**
 * Create a promise that resolves after a delay
 */
window.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry operation with exponential backoff
 */
window.retryOperation = async function(operation, maxAttempts = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            window.debugError(`Attempt ${attempt} failed:`, error);
            
            if (attempt === maxAttempts) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await window.delay(delay);
        }
    }
};

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

/**
 * Wrap function with error handling
 */
window.withErrorHandling = function(fn, context = 'Unknown operation') {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            window.debugError(`Error in ${context}:`, error);
            if (window.showNotification) {
                window.showNotification(`Lỗi: ${context}`, 'error');
            }
            return null;
        }
    };
};

/**
 * Safe function execution
 */
window.safeExecute = function(fn, defaultValue = null, context = 'function') {
    try {
        if (typeof fn !== 'function') {
            window.debugError(`Expected function but received: ${typeof fn}`);
            return defaultValue;
        }
        
        return fn();
    } catch (error) {
        window.debugError(`Error executing ${context}:`, error);
        return defaultValue;
    }
};

console.log('✅ BalanCoffee Utils loaded');
