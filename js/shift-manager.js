/**
 * BalanCoffee - Shift Management Module
 * Quản lý ca làm việc và nhân viên
 */

// =============================================================================
// SHIFT MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Start a new work shift
 */
function startNewShift() {
    try {
        window.Utils.debugLog('🚀 Starting new shift...');
        
        if (!handleExistingShift()) {
            return;
        }
        
        startShiftProcess();
        
    } catch (error) {
        window.Utils.debugError('❌ Error starting new shift:', error);
        window.UIManager.showNotification('Lỗi bắt đầu ca làm việc: ' + error.message, 'error');
    }
}

/**
 * Handle existing shift if any
 * @returns {boolean} - True to continue, false to abort
 */
function handleExistingShift() {
    if (window.shiftStartTime && window.currentShiftEmployee) {
        const confirmEnd = confirm('Có ca làm việc đang hoạt động. Bạn có muốn kết thúc ca hiện tại và bắt đầu ca mới không?');
        if (!confirmEnd) {
            window.Utils.debugLog('⚠️ User cancelled starting new shift');
            return false;
        }
        
        // End current shift first
        if (typeof endShift === 'function') {
            endShift();
        }
    }
    return true;
}

/**
 * Start the shift process
 */
function startShiftProcess() {
    // Show employee info modal or prompt
    if (typeof window.ModalManager?.showEmployeeModal === 'function') {
        window.ModalManager.showEmployeeModal();
    } else {
        startShiftWithPrompts();
    }
}

/**
 * Start shift using simple prompts as fallback
 */
function startShiftWithPrompts() {
    const employeeName = prompt('Nhập tên nhân viên:');
    if (!employeeName || employeeName.trim() === '') {
        window.UIManager.showNotification('Tên nhân viên không được để trống', 'error');
        return;
    }
    
    const shiftNote = prompt('Ghi chú ca làm việc (tùy chọn):') || '';
    
    createNewShift(employeeName.trim(), shiftNote.trim());
}

/**
 * Create and save new shift
 */
function createNewShift(employeeName, shiftNote) {
    // Start the shift
    const now = new Date();
    window.shiftStartTime = now.toISOString();
    window.currentShiftEmployee = employeeName;
    window.currentShiftNote = shiftNote;
    
    // Save to localStorage
    localStorage.setItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_START, window.shiftStartTime);
    localStorage.setItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_EMPLOYEE, window.currentShiftEmployee);
    localStorage.setItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_NOTE, window.currentShiftNote);
    
    updateUIAfterShiftStart();
}

/**
 * Update UI after shift start
 */
function updateUIAfterShiftStart() {
    // Update UI
    if (window.updateShiftDisplay) {
        window.updateShiftDisplay();
    }
    if (window.UIManager?.updateAllUIStats) {
        window.UIManager.updateAllUIStats();
    }
    
    window.Utils.debugLog(`✅ New shift started by ${window.currentShiftEmployee} at ${window.Utils.formatDateTime(window.shiftStartTime)}`);
    window.UIManager.showNotification(`Ca làm việc của ${window.currentShiftEmployee} đã bắt đầu`, 'success');
    
    // Trigger haptic feedback on mobile
    if (window.triggerHapticFeedback) {
        window.triggerHapticFeedback('medium');
    }
}

/**
 * View current shift information
 */
function viewCurrentShift() {
    try {
        window.Utils.debugLog('👁️ Viewing current shift information...');
        
        if (!window.shiftStartTime || !window.currentShiftEmployee) {
            window.UIManager.showNotification('Không có ca làm việc nào đang hoạt động', 'warning');
            return;
        }
        
        // Calculate shift duration
        const startTime = new Date(window.shiftStartTime);
        const currentTime = new Date();
        const durationMs = currentTime - startTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        // Show shift information
        const shiftInfo = `
Thông tin ca làm việc hiện tại:
- Nhân viên: ${window.currentShiftEmployee}
- Bắt đầu: ${window.Utils.formatDateTime(window.shiftStartTime)}
- Thời gian làm việc: ${hours}h ${minutes}m
- Ghi chú: ${window.currentShiftNote || 'Không có'}
        `.trim();
        
        alert(shiftInfo);
        
    } catch (error) {
        window.Utils.debugError('❌ Error viewing current shift:', error);
        window.UIManager.showNotification('Lỗi xem thông tin ca làm việc', 'error');
    }
}

/**
 * Pause current shift
 */
function pauseShift() {
    try {
        if (!window.shiftStartTime) {
            window.UIManager.showNotification('Không có ca làm việc nào đang hoạt động', 'warning');
            return;
        }
        
        window.UIManager.showNotification('Tính năng tạm dừng ca làm việc sẽ được phát triển', 'info');
        
    } catch (error) {
        window.Utils.debugError('❌ Error pausing shift:', error);
        window.UIManager.showNotification('Lỗi tạm dừng ca làm việc', 'error');
    }
}

/**
 * End current shift
 */
function endShift() {
    try {
        if (!window.shiftStartTime || !window.currentShiftEmployee) {
            window.UIManager.showNotification('Không có ca làm việc nào đang hoạt động', 'warning');
            return;
        }
        
        if (typeof window.ModalManager?.showEndShiftModal === 'function') {
            window.ModalManager.showEndShiftModal();
        } else {
            const confirmEnd = confirm(`Bạn có chắc muốn kết thúc ca làm việc của ${window.currentShiftEmployee}?`);
            if (confirmEnd) {
                // Clear shift data
                window.shiftStartTime = null;
                window.currentShiftEmployee = null;
                window.currentShiftNote = null;
                
                // Clear localStorage
                localStorage.removeItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_START);
                localStorage.removeItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_EMPLOYEE);
                localStorage.removeItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_NOTE);
                
                // Update UI
                if (window.updateShiftDisplay) {
                    window.updateShiftDisplay();
                }
                if (window.UIManager?.updateAllUIStats) {
                    window.UIManager.updateAllUIStats();
                }
                
                window.UIManager.showNotification('Ca làm việc đã kết thúc', 'success');
            }
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error ending shift:', error);
        window.UIManager.showNotification('Lỗi kết thúc ca làm việc', 'error');
    }
}

/**
 * Update shift display in UI
 */
function updateShiftDisplay() {
    try {
        window.Utils.debugLog('🔄 Updating shift display...');
        
        const shiftDisplayElement = document.getElementById('shift-display');
        const currentTimeElement = document.getElementById('current-time');
        
        // Update current time
        if (currentTimeElement) {
            const now = new Date();
            currentTimeElement.textContent = window.Utils.formatDateTime(now.toISOString());
        }
        
        // Update shift info
        if (shiftDisplayElement) {
            if (window.shiftStartTime && window.currentShiftEmployee) {
                // Calculate duration
                const startTime = new Date(window.shiftStartTime);
                const currentTime = new Date();
                const durationMs = currentTime - startTime;
                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                
                shiftDisplayElement.innerHTML = `
                    <div class="shift-active">
                        <span class="shift-indicator active"></span>
                        <div class="shift-info">
                            <div class="shift-employee">${window.currentShiftEmployee}</div>
                            <div class="shift-duration">${hours}h ${minutes}m</div>
                        </div>
                    </div>
                `;
            } else {
                shiftDisplayElement.innerHTML = `
                    <div class="shift-inactive">
                        <span class="shift-indicator inactive"></span>
                        <div class="shift-info">
                            <div class="shift-employee">Chưa bắt đầu ca</div>
                        </div>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error updating shift display:', error);
    }
}

/**
 * Load shift data from localStorage
 */
function loadShiftData() {
    try {
        window.Utils.debugLog('📖 Loading shift data from localStorage...');
        
        const savedShiftStart = localStorage.getItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_START);
        const savedShiftEmployee = localStorage.getItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_EMPLOYEE);
        const savedShiftNote = localStorage.getItem(window.BalanCoffeeConfig.STORAGE_KEYS.SHIFT_NOTE);
        
        if (savedShiftStart && savedShiftEmployee) {
            window.shiftStartTime = savedShiftStart;
            window.currentShiftEmployee = savedShiftEmployee;
            window.currentShiftNote = savedShiftNote || null;
            
            window.Utils.debugLog(`✅ Shift data loaded: ${window.currentShiftEmployee} since ${window.Utils.formatDateTime(window.shiftStartTime)}`);
        } else {
            window.Utils.debugLog('ℹ️ No saved shift data found');
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error loading shift data:', error);
    }
}

/**
 * Filter invoices by shift
 */
function filterByShift(invoices, filterValue) {
    return invoices.filter(invoice => invoice.shiftId === filterValue);
}

// =============================================================================
// SHIFT MANAGER EXPORTS
// =============================================================================

window.ShiftManager = {
    startNewShift,
    viewCurrentShift,
    pauseShift,
    endShift,
    updateShiftDisplay,
    loadShiftData,
    filterByShift
};

// Export individual functions to window for HTML compatibility
window.startNewShift = startNewShift;
window.viewCurrentShift = viewCurrentShift;
window.pauseShift = pauseShift;
window.endShift = endShift;
window.updateShiftDisplay = updateShiftDisplay;
window.loadShiftData = loadShiftData;

console.log('✅ Shift Manager module loaded successfully');

// Export Shift Manager namespace
window.ShiftManager = {
    // Shift management
    startShift: window.startShift,
    endShift: window.endShift,
    updateShiftDisplay: window.updateShiftDisplay,
    
    // Shift data
    getShiftData: window.getShiftData,
    loadShiftData: window.loadShiftData,
    saveShiftData: window.saveShiftData,
    calculateShiftTotal: window.calculateShiftTotal,
    
    // Export and clearing
    exportShiftData: window.exportShiftData,
    clearShiftData: window.clearShiftData
};
