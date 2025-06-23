/**
 * BalanCoffee - Data Manager
 * Quản lý dữ liệu menu, hóa đơn và localStorage
 */

// =============================================================================
// MENU DATA MANAGEMENT
// =============================================================================

/**
 * Load menu data from data.js or fallback
 */
window.loadMenuData = function() {
    return window.withErrorHandling(() => {
        // Try to get data from global menuData variable (from data.js)
        if (window.menuData && window.validateMenuData(window.menuData)) {
            window.debugLog(`✅ Menu data loaded from data.js: ${window.menuData.length} items`);
            return window.menuData;
        }
        
        // Try to load from localStorage
        const savedData = window.safeLocalStorageGet('balancoffee_menu');
        if (savedData && window.validateMenuData(savedData)) {
            window.debugLog(`✅ Menu data loaded from localStorage: ${savedData.length} items`);
            window.menuData = savedData;
            return savedData;
        }
        
        // Use fallback data
        window.debugLog('⚠️ Using fallback menu data');
        const fallbackData = window.CONFIG?.FALLBACK_MENU || [];
        window.menuData = fallbackData;
        
        // Save fallback data to localStorage for future use
        window.safeLocalStorageSet('balancoffee_menu', fallbackData);
        
        return fallbackData;
        
    }, 'loadMenuData') || [];
};

/**
 * Save menu data to localStorage
 */
window.saveMenuData = function(data) {
    return window.withErrorHandling(() => {
        if (!window.validateMenuData(data)) {
            window.debugError('Invalid menu data provided for saving');
            return false;
        }
        
        const success = window.safeLocalStorageSet('balancoffee_menu', data);
        if (success) {
            window.menuData = data;
            window.debugLog(`✅ Menu data saved: ${data.length} items`);
        }
        return success;
        
    }, 'saveMenuData') || false;
};

// =============================================================================
// INVOICE DATA MANAGEMENT
// =============================================================================

/**
 * Load invoices from localStorage
 */
window.loadInvoices = function() {
    return window.withErrorHandling(() => {
        const storageKey = window.CONFIG?.STORAGE_KEYS?.INVOICES || 'balancoffee_invoices';
        const savedInvoices = window.safeLocalStorageGet(storageKey, []);
        
        // Validate each invoice
        const validInvoices = savedInvoices.filter(invoice => window.validateInvoice(invoice));
        
        if (validInvoices.length !== savedInvoices.length) {
            window.debugError(`Found ${savedInvoices.length - validInvoices.length} invalid invoices`);
        }
        
        window.STATE.invoices = validInvoices;
        window.debugLog(`✅ Loaded ${validInvoices.length} invoices from localStorage`);
        
        return validInvoices;
        
    }, 'loadInvoices') || [];
};

/**
 * Save invoices to localStorage
 */
window.saveInvoices = function() {
    return window.withErrorHandling(() => {
        const storageKey = window.CONFIG?.STORAGE_KEYS?.INVOICES || 'balancoffee_invoices';
        const success = window.safeLocalStorageSet(storageKey, window.STATE.invoices);
        
        if (success) {
            window.debugLog(`✅ Saved ${window.STATE.invoices.length} invoices to localStorage`);
        }
        
        return success;
        
    }, 'saveInvoices') || false;
};

/**
 * Add new invoice
 */
window.addInvoice = function(invoice) {
    return window.withErrorHandling(() => {
        if (!window.validateInvoice(invoice)) {
            window.debugError('Invalid invoice data provided');
            return false;
        }
        
        // Add to beginning of array for recent-first order
        window.STATE.invoices.unshift(invoice);
        
        // Save to localStorage
        const saved = window.saveInvoices();
        
        if (saved) {
            window.debugLog(`✅ Invoice added: ${invoice.id}`);
            window.updateAllUIStats();
        }
        
        return saved;
        
    }, 'addInvoice') || false;
};

/**
 * Update existing invoice
 */
window.updateInvoice = function(invoiceId, updates) {
    return window.withErrorHandling(() => {
        const index = window.STATE.invoices.findIndex(inv => inv.id === invoiceId);
        if (index === -1) {
            window.debugError(`Invoice not found: ${invoiceId}`);
            return false;
        }
        
        // Apply updates
        const updatedInvoice = { ...window.STATE.invoices[index], ...updates };
        
        // Validate updated invoice
        if (!window.validateInvoice(updatedInvoice)) {
            window.debugError('Updated invoice data is invalid');
            return false;
        }
        
        window.STATE.invoices[index] = updatedInvoice;
        
        // Save to localStorage
        const saved = window.saveInvoices();
        
        if (saved) {
            window.debugLog(`✅ Invoice updated: ${invoiceId}`);
            window.updateAllUIStats();
        }
        
        return saved;
        
    }, 'updateInvoice') || false;
};

/**
 * Delete invoice
 */
window.deleteInvoice = function(invoiceId) {
    return window.withErrorHandling(() => {
        const index = window.STATE.invoices.findIndex(inv => inv.id === invoiceId);
        if (index === -1) {
            window.debugError(`Invoice not found: ${invoiceId}`);
            return false;
        }
        
        window.STATE.invoices.splice(index, 1);
        
        // Save to localStorage
        const saved = window.saveInvoices();
        
        if (saved) {
            window.debugLog(`✅ Invoice deleted: ${invoiceId}`);
            window.updateAllUIStats();
        }
        
        return saved;
        
    }, 'deleteInvoice') || false;
};

// =============================================================================
// INVOICE FILTERING
// =============================================================================

/**
 * Filter invoices by various criteria
 */
window.filterInvoices = function(filterType, filterValue) {
    return window.withErrorHandling(() => {
        window.debugLog(`🔍 Filtering invoices by ${filterType}: ${filterValue}`);
        
        if (!Array.isArray(window.STATE.invoices)) {
            window.debugLog('⚠️ No invoices to filter');
            return [];
        }
        
        let filteredInvoices = [...window.STATE.invoices];
        
        switch (filterType) {
            case 'status':
                filteredInvoices = window.filterByStatus(filteredInvoices, filterValue);
                break;
                
            case 'date':
                filteredInvoices = window.filterByDate(filteredInvoices, filterValue);
                break;
                
            case 'search':
                filteredInvoices = window.filterBySearch(filteredInvoices, filterValue);
                break;
                
            case 'employee':
                filteredInvoices = window.filterByEmployee(filteredInvoices, filterValue);
                break;
                
            case 'shift':
                filteredInvoices = window.filterByShift(filteredInvoices, filterValue);
                break;
                
            default:
                window.debugLog(`⚠️ Unknown filter type: ${filterType}`);
                break;
        }
        
        window.debugLog(`✅ Filtered ${filteredInvoices.length} invoices from ${window.STATE.invoices.length} total`);
        
        if (window.showNotification) {
            window.showNotification(`Tìm thấy ${filteredInvoices.length} hóa đơn`, 'info');
        }
        
        return filteredInvoices;
        
    }, 'filterInvoices') || [];
};

/**
 * Filter helper functions
 */
window.filterByStatus = function(invoices, filterValue) {
    if (filterValue && filterValue !== 'all') {
        return invoices.filter(invoice => invoice.status === filterValue);
    }
    return invoices;
};

window.filterByDate = function(invoices, filterValue) {
    if (filterValue) {
        const targetDate = new Date(filterValue).toISOString().slice(0, 10);
        return invoices.filter(invoice => 
            invoice.createdAt && invoice.createdAt.slice(0, 10) === targetDate
        );
    }
    return invoices;
};

window.filterBySearch = function(invoices, filterValue) {
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
};

window.filterByEmployee = function(invoices, filterValue) {
    if (filterValue && filterValue !== 'all') {
        return invoices.filter(invoice => invoice.employeeName === filterValue);
    }
    return invoices;
};

window.filterByShift = function(invoices, filterValue) {
    if (filterValue && filterValue !== 'all') {
        return invoices.filter(invoice => invoice.shiftId === filterValue);
    }
    return invoices;
};

// =============================================================================
// SHIFT DATA MANAGEMENT
// =============================================================================

/**
 * Load shift data from localStorage
 */
window.loadShiftData = function() {
    return window.withErrorHandling(() => {
        const keys = window.CONFIG?.STORAGE_KEYS || {};
        
        window.STATE.shiftStartTime = window.safeLocalStorageGet(keys.SHIFT_START);
        window.STATE.currentShiftEmployee = window.safeLocalStorageGet(keys.SHIFT_EMPLOYEE);
        window.STATE.currentShiftNote = window.safeLocalStorageGet(keys.SHIFT_NOTE);
        
        window.debugLog('✅ Shift data loaded from localStorage');
        
        return {
            shiftStartTime: window.STATE.shiftStartTime,
            currentShiftEmployee: window.STATE.currentShiftEmployee,
            currentShiftNote: window.STATE.currentShiftNote
        };
        
    }, 'loadShiftData') || {};
};

/**
 * Save shift data to localStorage
 */
window.saveShiftData = function() {
    return window.withErrorHandling(() => {
        const keys = window.CONFIG?.STORAGE_KEYS || {};
        
        let success = true;
        success &= window.safeLocalStorageSet(keys.SHIFT_START, window.STATE.shiftStartTime);
        success &= window.safeLocalStorageSet(keys.SHIFT_EMPLOYEE, window.STATE.currentShiftEmployee);
        success &= window.safeLocalStorageSet(keys.SHIFT_NOTE, window.STATE.currentShiftNote);
        
        if (success) {
            window.debugLog('✅ Shift data saved to localStorage');
        }
        
        return success;
        
    }, 'saveShiftData') || false;
};

/**
 * Clear shift data
 */
window.clearShiftData = function() {
    return window.withErrorHandling(() => {
        const keys = window.CONFIG?.STORAGE_KEYS || {};
        
        window.STATE.shiftStartTime = null;
        window.STATE.currentShiftEmployee = null;
        window.STATE.currentShiftNote = null;
        
        window.safeLocalStorageRemove(keys.SHIFT_START);
        window.safeLocalStorageRemove(keys.SHIFT_EMPLOYEE);
        window.safeLocalStorageRemove(keys.SHIFT_NOTE);
        
        window.debugLog('✅ Shift data cleared');
        
        return true;
        
    }, 'clearShiftData') || false;
};

// =============================================================================
// DATA EXPORT/IMPORT
// =============================================================================

/**
 * Export all data
 */
window.exportAllData = function() {
    return window.withErrorHandling(() => {
        const data = {
            invoices: window.STATE.invoices,
            menuData: window.menuData,
            shiftData: {
                shiftStartTime: window.STATE.shiftStartTime,
                currentShiftEmployee: window.STATE.currentShiftEmployee,
                currentShiftNote: window.STATE.currentShiftNote
            },
            exportedAt: new Date().toISOString(),
            version: window.CONFIG?.APP_VERSION || '8.5'
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `balancoffee-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.debugLog('✅ Data exported successfully');
        window.showNotification('Dữ liệu đã được xuất thành công', 'success');
        
        return true;
        
    }, 'exportAllData') || false;
};

/**
 * Clear all data
 */
window.clearAllData = function() {
    return window.withErrorHandling(() => {
        const confirmed = confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.');
        if (!confirmed) {
            return false;
        }
        
        // Clear state
        window.STATE.invoices = [];
        window.STATE.currentOrder = [];
        window.STATE.orderHistory = [];
        window.clearShiftData();
        
        // Clear localStorage
        const keys = window.CONFIG?.STORAGE_KEYS || {};
        Object.values(keys).forEach(key => {
            window.safeLocalStorageRemove(key);
        });
        
        // Update UI
        window.updateAllUIStats();
        
        window.debugLog('✅ All data cleared');
        window.showNotification('Tất cả dữ liệu đã được xóa', 'success');
        
        return true;
        
    }, 'clearAllData') || false;
};

/**
 * Export data (alias for exportAllData - for HTML compatibility)
 */
window.exportData = function() {
    return window.exportAllData();
};

/**
 * Clear all invoices only
 */
window.clearAllInvoices = function() {
    return window.withErrorHandling(() => {
        const confirmed = confirm('Bạn có chắc chắn muốn xóa tất cả hóa đơn? Hành động này không thể hoàn tác.');
        if (!confirmed) {
            return false;
        }
        
        // Clear invoices
        window.STATE.invoices = [];
        
        // Save to localStorage
        window.saveInvoicesToStorage();
        
        // Update UI
        window.updateAllUIStats();
        
        window.debugLog('✅ All invoices cleared');
        window.showNotification('Tất cả hóa đơn đã được xóa', 'success');
        
        return true;
        
    }, 'clearAllInvoices') || false;
};

/**
 * Save invoices to storage (alias for compatibility)
 */
window.saveInvoicesToStorage = function() {
    return window.saveInvoicesData(window.STATE.invoices);
};

console.log('✅ BalanCoffee Data Manager loaded');
