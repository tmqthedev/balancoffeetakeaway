/**
 * BalanCoffee - Modal Management Module
 * Quản lý các modal dialog và popup
 */

// =============================================================================
// SAFE WRAPPER FUNCTIONS
// =============================================================================

/**
 * Safe error handler wrapper for Modal Manager
 */
function safeModalError(message, error) {
    if (typeof window !== 'undefined' && window.debugError && typeof window.debugError === 'function') {
        try {
            window.debugError(message, error);
        } catch {
            console.error(`[Modal Manager ERROR] ${message}`, error);
        }
    } else {
        console.error(`[Modal Manager ERROR] ${message}`, error);
    }
}

/**
 * Safe log wrapper for Modal Manager
 */
function safeModalLog(message, ...args) {
    if (typeof window !== 'undefined' && window.debugLog && typeof window.debugLog === 'function') {
        try {
            window.debugLog(message, ...args);
        } catch {
            console.log(`[Modal Manager] ${message}`, ...args);
        }
    } else {
        console.log(`[Modal Manager] ${message}`, ...args);
    }
}

// =============================================================================
// MODAL MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Close order confirmation modal
 */
function closeOrderModal() {
    try {
        window.Utils.debugLog('🔄 Closing order modal...');
        
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.style.display = 'none';
            orderModal.classList.remove('show');
        }
        
        // Clear modal backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.Utils.debugLog('✅ Order modal closed successfully');
        
    } catch (error) {
        window.Utils.debugError('❌ Error closing order modal:', error);
    }
}

/**
 * Close payment modal
 */
function closePaymentModal() {
    try {
        window.Utils.debugLog('🔄 Closing payment modal...');
        
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            paymentModal.style.display = 'none';
            paymentModal.classList.remove('show');
        }
        
        // Clear modal backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.Utils.debugLog('✅ Payment modal closed successfully');
        
    } catch (error) {
        window.Utils.debugError('❌ Error closing payment modal:', error);
    }
}

/**
 * Close employee info modal
 */
function closeEmployeeModal() {
    try {
        window.Utils.debugLog('🔄 Closing employee modal...');
        
        const employeeModal = document.getElementById('employee-modal');
        if (employeeModal) {
            employeeModal.style.display = 'none';
            employeeModal.classList.remove('show');
        }
        
        // Clear modal backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.Utils.debugLog('✅ Employee modal closed successfully');
        
    } catch (error) {
        window.Utils.debugError('❌ Error closing employee modal:', error);
    }
}

/**
 * Close success notification modal
 */
function closeSuccessModal() {
    try {
        window.Utils.debugLog('🔄 Closing success modal...');
        
        const successModal = document.getElementById('success-modal');
        if (successModal) {
            successModal.style.display = 'none';
            successModal.classList.remove('show');
        }
        
        // Clear modal backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.Utils.debugLog('✅ Success modal closed successfully');
        
    } catch (error) {
        window.Utils.debugError('❌ Error closing success modal:', error);
    }
}

/**
 * Close end shift modal
 */
function closeEndShiftModal() {
    try {
        window.Utils.debugLog('🔄 Closing end shift modal...');
        
        const endShiftModal = document.getElementById('end-shift-modal');
        if (endShiftModal) {
            endShiftModal.style.display = 'none';
            endShiftModal.classList.remove('show');
        }
        
        // Clear modal backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.Utils.debugLog('✅ End shift modal closed successfully');
        
    } catch (error) {
        window.Utils.debugError('❌ Error closing end shift modal:', error);
    }
}

/**
 * Show order confirmation modal
 */
function showOrderModal(invoiceId) {
    try {
        window.Utils.debugLog(`🔄 Showing order modal for invoice ${invoiceId}...`);
        
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            // Update modal content with invoice details
            const invoice = window.invoices.find(inv => inv.id === invoiceId);
            if (invoice) {
                updateOrderModalContent(orderModal, invoice);
            }
            
            // Show modal
            orderModal.style.display = 'flex';
            orderModal.classList.add('show');
            
            // Add backdrop
            addModalBackdrop();
            
            window.Utils.debugLog('✅ Order modal shown successfully');
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error showing order modal:', error);
    }
}

/**
 * Show payment modal
 */
function showPaymentModal() {
    try {
        window.Utils.debugLog('🔄 Showing payment modal...');
        
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            // Update payment modal with current order
            updatePaymentModalContent(paymentModal);
            
            // Show modal
            paymentModal.style.display = 'flex';
            paymentModal.classList.add('show');
            
            // Add backdrop
            addModalBackdrop();
            
            window.Utils.debugLog('✅ Payment modal shown successfully');
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error showing payment modal:', error);
    }
}

/**
 * Show employee info modal
 */
function showEmployeeModal() {
    try {
        window.Utils.debugLog('🔄 Showing employee modal...');
        
        const employeeModal = document.getElementById('employee-modal');
        if (employeeModal) {
            // Show modal
            employeeModal.style.display = 'flex';
            employeeModal.classList.add('show');
            
            // Add backdrop
            addModalBackdrop();
            
            // Focus on employee name input
            const employeeInput = employeeModal.querySelector('#employee-name');
            if (employeeInput) {
                setTimeout(() => employeeInput.focus(), 100);
            }
            
            window.Utils.debugLog('✅ Employee modal shown successfully');
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error showing employee modal:', error);
    }
}

/**
 * Show end shift modal
 */
function showEndShiftModal() {
    try {
        window.Utils.debugLog('🔄 Showing end shift modal...');
        
        const endShiftModal = document.getElementById('end-shift-modal');
        if (endShiftModal) {
            // Update modal content with current shift info
            updateEndShiftModalContent(endShiftModal);
            
            // Show modal
            endShiftModal.style.display = 'flex';
            endShiftModal.classList.add('show');
            
            // Add backdrop
            addModalBackdrop();
            
            window.Utils.debugLog('✅ End shift modal shown successfully');
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error showing end shift modal:', error);
    }
}

/**
 * Add modal backdrop
 */
function addModalBackdrop() {
    // Remove existing backdrop first
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }
    
    // Create new backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '1040';
    document.body.appendChild(backdrop);
    
    // Close modal when clicking backdrop
    backdrop.addEventListener('click', () => {
        closeAllModals();
    });
}

/**
 * Close all modals
 */
function closeAllModals() {
    try {
        window.Utils.debugLog('🔄 Closing all modals...');
        
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show');
        });
        
        // Remove backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.Utils.debugLog('✅ All modals closed successfully');
        
    } catch (error) {
        window.Utils.debugError('❌ Error closing all modals:', error);
    }
}

/**
 * Update order modal content
 */
function updateOrderModalContent(modal, invoice) {
    try {
        const contentContainer = modal.querySelector('.modal-body');
        if (contentContainer && invoice) {
            contentContainer.innerHTML = `
                <div class="order-summary">
                    <h5>Hóa đơn #${invoice.id}</h5>
                    <p><strong>Thời gian:</strong> ${window.Utils.formatDateTime(invoice.timestamp)}</p>
                    <p><strong>Nhân viên:</strong> ${invoice.employeeName || 'N/A'}</p>
                    <p><strong>Tổng tiền:</strong> ${window.Utils.formatPrice(invoice.total)}</p>
                    
                    <div class="order-items">
                        <h6>Chi tiết đơn hàng:</h6>
                        ${invoice.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} x${item.quantity}</span>
                                <span>${window.Utils.formatPrice(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        window.Utils.debugError('❌ Error updating order modal content:', error);
    }
}

/**
 * Update payment modal content
 */
function updatePaymentModalContent(modal) {
    try {
        const contentContainer = modal.querySelector('.modal-body');
        if (contentContainer && window.currentOrder.length > 0) {
            const total = window.currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            contentContainer.innerHTML = `
                <div class="payment-summary">
                    <h5>Thanh toán đơn hàng</h5>
                    <div class="payment-total">
                        <strong>Tổng tiền: ${window.Utils.formatPrice(total)}</strong>
                    </div>
                    
                    <div class="payment-methods">
                        <h6>Phương thức thanh toán:</h6>
                        <div class="payment-options">
                            <button class="payment-method-btn" data-method="cash">Tiền mặt</button>
                            <button class="payment-method-btn" data-method="card">Thẻ</button>
                            <button class="payment-method-btn" data-method="transfer">Chuyển khoản</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners for payment methods
            const paymentBtns = contentContainer.querySelectorAll('.payment-method-btn');
            paymentBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const method = btn.dataset.method;
                    processPayment(method);
                });
            });
        }
    } catch (error) {
        window.Utils.debugError('❌ Error updating payment modal content:', error);
    }
}

/**
 * Update end shift modal content
 */
function updateEndShiftModalContent(modal) {
    try {
        const contentContainer = modal.querySelector('.modal-body');
        if (contentContainer && window.currentShiftEmployee) {
            // Calculate shift duration
            const startTime = new Date(window.shiftStartTime);
            const currentTime = new Date();
            const durationMs = currentTime - startTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            
            contentContainer.innerHTML = `
                <div class="end-shift-summary">
                    <h5>Kết thúc ca làm việc</h5>
                    <div class="shift-details">
                        <p><strong>Nhân viên:</strong> ${window.currentShiftEmployee}</p>
                        <p><strong>Bắt đầu:</strong> ${window.Utils.formatDateTime(window.shiftStartTime)}</p>
                        <p><strong>Thời gian làm việc:</strong> ${hours}h ${minutes}m</p>
                        <p><strong>Ghi chú:</strong> ${window.currentShiftNote || 'Không có'}</p>
                    </div>
                    
                    <div class="shift-stats">
                        <h6>Thống kê ca làm việc:</h6>
                        <p>Số hóa đơn: ${window.invoices.length}</p>
                        <p>Tổng doanh thu: ${window.Utils.formatPrice(window.invoices.reduce((sum, inv) => sum + inv.total, 0))}</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        window.Utils.debugError('❌ Error updating end shift modal content:', error);
    }
}

/**
 * Process payment
 */
function processPayment(method) {
    try {
        window.Utils.debugLog(`💳 Processing payment with method: ${method}`);
        
        // Create invoice first
        if (window.OrderManager?.createInvoice) {
            const invoiceId = window.OrderManager.createInvoice();
            
            // Update payment method in invoice
            const invoice = window.invoices.find(inv => inv.id === invoiceId);
            if (invoice) {
                invoice.paymentMethod = method;
                invoice.status = 'paid';
            }
            
            // Close payment modal
            closePaymentModal();
            
            // Show success notification
            window.UIManager.showNotification(`Thanh toán thành công bằng ${getPaymentMethodName(method)}`, 'success');
            
            // Clear current order
            window.OrderManager.clearOrder();
            
        } else {
            window.Utils.debugError('❌ OrderManager.createInvoice not available');
            window.UIManager.showNotification('Lỗi xử lý thanh toán', 'error');
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error processing payment:', error);
        window.UIManager.showNotification('Lỗi xử lý thanh toán', 'error');
    }
}

/**
 * Get payment method display name
 */
function getPaymentMethodName(method) {
    const methodNames = {
        cash: 'tiền mặt',
        card: 'thẻ',
        transfer: 'chuyển khoản'
    };
    return methodNames[method] || method;
}

/**
 * Confirm employee info and start shift
 */
function confirmEmployeeInfo() {
    try {
        const employeeModal = document.getElementById('employee-modal');
        if (!employeeModal) return;
        
        const employeeNameInput = employeeModal.querySelector('#employee-name');
        const shiftNoteInput = employeeModal.querySelector('#shift-note');
        
        if (!employeeNameInput) return;
        
        const employeeName = employeeNameInput.value.trim();
        const shiftNote = shiftNoteInput ? shiftNoteInput.value.trim() : '';
        
        if (!employeeName) {
            window.UIManager.showNotification('Tên nhân viên không được để trống', 'error');
            employeeNameInput.focus();
            return;
        }
        
        // Close modal first
        closeEmployeeModal();
        
        // Start shift with provided info
        if (window.ShiftManager?.createNewShift) {
            window.ShiftManager.createNewShift(employeeName, shiftNote);
        }
        
    } catch (error) {
        window.Utils.debugError('❌ Error confirming employee info:', error);
        window.UIManager.showNotification('Lỗi xác nhận thông tin nhân viên', 'error');
    }
}

/**
 * Confirm end shift
 */
function confirmEndShift() {
    try {
        // Close modal first
        closeEndShiftModal();
        
        // End the shift
        if (window.ShiftManager?.endShift) {
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
        
    } catch (error) {
        window.Utils.debugError('❌ Error confirming end shift:', error);
        window.UIManager.showNotification('Lỗi kết thúc ca làm việc', 'error');
    }
}

// =============================================================================
// MODAL MANAGER EXPORTS
// =============================================================================

window.ModalManager = {
    closeOrderModal,
    closePaymentModal,
    closeEmployeeModal,
    closeSuccessModal,
    closeEndShiftModal,
    showOrderModal,
    showPaymentModal,
    showEmployeeModal,
    showEndShiftModal,
    closeAllModals,
    processPayment,
    confirmEmployeeInfo,
    confirmEndShift
};

// Export individual functions to window for HTML compatibility
window.closeOrderModal = closeOrderModal;
window.closePaymentModal = closePaymentModal;
window.closeEmployeeModal = closeEmployeeModal;
window.closeSuccessModal = closeSuccessModal;
window.closeEndShiftModal = closeEndShiftModal;
window.showOrderModal = showOrderModal;
window.showPaymentModal = showPaymentModal;
window.showEmployeeModal = showEmployeeModal;
window.showEndShiftModal = showEndShiftModal;
window.confirmEmployeeInfo = confirmEmployeeInfo;
window.confirmEndShift = confirmEndShift;
window.confirmPayment = processPayment;

// Generic modal functions
window.showModal = function(modalId, options = {}) {
    return window.withErrorHandling(() => {
        const modal = document.getElementById(modalId);        if (!modal) {
            safeModalError(`Modal not found: ${modalId}`);
            return false;
        }
        
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Add backdrop if not exists
        if (!document.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.onclick = () => window.closeModal(modalId);
            document.body.appendChild(backdrop);
        }
        
        window.debugLog(`✅ Modal shown: ${modalId}`);
        return true;
        
    }, 'showModal') || false;
};

window.closeModal = function(modalId) {
    return window.withErrorHandling(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
        
        // Remove backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        window.debugLog(`✅ Modal closed: ${modalId}`);
        return true;
        
    }, 'closeModal') || false;
};

window.processPayment = function(paymentData) {
    return window.withErrorHandling(() => {
        window.debugLog('💳 Processing payment...', paymentData);
        
        // Process payment logic here
        const success = true; // Simulated success
        
        if (success) {
            window.showNotification('Thanh toán thành công', 'success');
            window.closePaymentModal();
            return true;
        } else {
            window.showNotification('Thanh toán thất bại', 'error');
            return false;
        }
        
    }, 'processPayment') || false;
};

console.log('✅ Modal Manager module loaded successfully');

// Export Modal Manager namespace
window.ModalManager = {
    // Modal management
    showModal: window.showModal,
    closeModal: window.closeModal,
    closeAllModals: window.closeAllModals,
    
    // Specific modals
    showOrderModal: window.showOrderModal,
    showPaymentModal: window.showPaymentModal,
    showPaymentMethodModal: window.showPaymentMethodModal,
    
    // Invoice management
    createNewInvoice: window.createNewInvoice,
    deleteInvoice: window.deleteInvoice,
    processPayment: window.processPayment,
    
    // Export functionality
    exportData: window.exportData
};
