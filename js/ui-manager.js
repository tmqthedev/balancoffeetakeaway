/**
 * BalanCoffee - UI Manager
 * Quản lý giao diện người dùng và các tương tác
 */

// =============================================================================
// NOTIFICATION SYSTEM
// =============================================================================

/**
 * Show notification to user
 */
window.showNotification = function(message, type = 'info') {
    return window.withErrorHandling(() => {
        // Create or get notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Set content
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${message}</span>
                <button style="
                    background: none; 
                    border: none; 
                    color: white; 
                    cursor: pointer; 
                    font-size: 18px;
                    line-height: 1;
                    padding: 0;
                    opacity: 0.7;
                " onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Remove on click
        notification.addEventListener('click', () => {
            notification.remove();
        });
        
    }, 'showNotification');
};

// =============================================================================
// LOADING SCREEN MANAGEMENT
// =============================================================================

/**
 * Show loading screen
 */
window.showLoadingScreen = function(message = "Đang tải...", showSpinner = true) {
    return window.withErrorHandling(() => {
        const loadingScreen = window.safeGetElement('loading-screen');
        if (!loadingScreen) {
            window.debugError('Loading screen element not found');
            return;
        }
        
        // Update message
        const messageElement = loadingScreen.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Show/hide spinner
        const spinner = loadingScreen.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = showSpinner ? 'block' : 'none';
        }
        
        // Show loading screen
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        loadingScreen.style.visibility = 'visible';
        
        window.debugLog(`📱 Loading screen shown: ${message}`);
        
    }, 'showLoadingScreen');
};

/**
 * Hide loading screen
 */
window.hideLoadingScreen = function(delay = 0, callback = null) {
    return window.withErrorHandling(() => {
        const loadingScreen = window.safeGetElement('loading-screen');
        if (!loadingScreen) return;
        
        const hideScreen = () => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.style.visibility = 'hidden';
                
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, 300);
        };
        
        if (delay > 0) {
            setTimeout(hideScreen, delay);
        } else {
            hideScreen();
        }
        
        window.debugLog('📱 Loading screen hidden');
        
    }, 'hideLoadingScreen');
};

// =============================================================================
// SIDEBAR MANAGEMENT
// =============================================================================

/**
 * Toggle sidebar visibility
 */
window.toggleSidebar = function() {
    return window.withErrorHandling(() => {
        window.debugLog('🔄 Toggling sidebar...');
        
        const sidebar = window.safeGetElement('sidebar', true);
        const backdrop = window.safeGetElement('sidebar-backdrop');
        const toggleBtn = window.safeGetElement('.sidebar-toggle');
        
        if (!sidebar) {
            window.showNotification('Lỗi: Không tìm thấy sidebar', 'error');
            return;
        }
        
        // Force sidebar to be visible first
        if (window.getComputedStyle(sidebar).display === 'none') {
            sidebar.style.display = 'block';
        }
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            window.showSidebar(sidebar, backdrop, toggleBtn);
        } else {
            window.hideSidebar(sidebar, backdrop, toggleBtn);
        }
        
        // Trigger haptic feedback on mobile
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
        
    }, 'toggleSidebar');
};

/**
 * Show sidebar
 */
window.showSidebar = function(sidebar, backdrop, toggleBtn) {
    // Show sidebar
    sidebar.classList.remove('collapsed');
    sidebar.setAttribute('aria-hidden', 'false');
    
    // Show backdrop on mobile
    if (backdrop) {
        backdrop.style.display = 'block';
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
    
    window.debugLog('✅ Sidebar opened');
};

/**
 * Hide sidebar
 */
window.hideSidebar = function(sidebar, backdrop, toggleBtn) {
    // Hide sidebar
    sidebar.classList.add('collapsed');
    sidebar.setAttribute('aria-hidden', 'true');
    
    // Hide backdrop
    if (backdrop) {
        backdrop.classList.remove('show');
        const transitionDuration = window.CONFIG?.TRANSITIONS?.BASE || 300;
        setTimeout(() => {
            backdrop.style.display = 'none';
        }, transitionDuration);
    }
    
    // Update toggle button
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Mở menu');
        toggleBtn.focus();
    }
    
    window.debugLog('✅ Sidebar closed');
};

// =============================================================================
// DROPDOWN MANAGEMENT
// =============================================================================

/**
 * Toggle admin dropdown
 */
window.toggleAdminDropdown = function() {
    return window.withErrorHandling(() => {
        window.debugLog('🔄 Toggling admin dropdown...');
        
        const dropdown = window.safeGetElement('admin-dropdown', true);
        const dropdownBtn = window.safeGetElement('.admin-dropdown-btn');
        
        if (!dropdown) {
            window.showNotification('Lỗi: Không tìm thấy menu quản lý', 'error');
            return;
        }
        
        const isOpen = dropdown.classList.contains('show');
        
        // Close all other dropdowns first
        window.closeAllDropdowns();
        
        if (!isOpen) {
            window.openAdminDropdown(dropdown, dropdownBtn);
        } else {
            window.closeAdminDropdown();
        }
        
        // Trigger haptic feedback on mobile
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
        
    }, 'toggleAdminDropdown');
};

/**
 * Open admin dropdown
 */
window.openAdminDropdown = function(dropdown, dropdownBtn) {
    if (!dropdown) {
        dropdown = window.safeGetElement('admin-dropdown');
    }
    if (!dropdown) return;
    
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
        document.addEventListener('click', window.handleClickOutsideDropdown);
    }, 100);
    
    window.debugLog('✅ Admin dropdown opened');
};

/**
 * Close admin dropdown
 */
window.closeAdminDropdown = function() {
    return window.withErrorHandling(() => {
        const dropdown = window.safeGetElement('admin-dropdown');
        const dropdownBtn = window.safeGetElement('.admin-dropdown-btn');
        
        if (!dropdown) return;
        
        dropdown.classList.remove('show');
        dropdown.setAttribute('aria-hidden', 'true');
        
        if (dropdownBtn) {
            dropdownBtn.setAttribute('aria-expanded', 'false');
            dropdownBtn.classList.remove('active');
        }
        
        // Remove click outside listener
        document.removeEventListener('click', window.handleClickOutsideDropdown);
        
        window.debugLog('✅ Admin dropdown closed');
        
    }, 'closeAdminDropdown');
};

/**
 * Close all dropdowns
 */
window.closeAllDropdowns = function() {
    return window.withErrorHandling(() => {
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
        
        document.removeEventListener('click', window.handleClickOutsideDropdown);
        
    }, 'closeAllDropdowns');
};

/**
 * Handle click outside dropdown
 */
window.handleClickOutsideDropdown = function(event) {
    const dropdown = window.safeGetElement('admin-dropdown');
    const dropdownBtn = window.safeGetElement('.admin-dropdown-btn');
    
    if (dropdown && dropdownBtn) {
        if (!dropdown.contains(event.target) && !dropdownBtn.contains(event.target)) {
            window.closeAdminDropdown();
        }
    }
};

// =============================================================================
// KEYBOARD HANDLING
// =============================================================================

/**
 * Handle backdrop keydown events
 */
window.handleBackdropKeydown = function(event) {
    // Handle Enter and Space key presses on backdrop
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.toggleSidebar();
    }
    // Handle Escape key
    if (event.key === 'Escape') {
        event.preventDefault();
        const sidebar = window.safeGetElement('sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            window.toggleSidebar();
        }
    }
};

// =============================================================================
// CATEGORY MANAGEMENT
// =============================================================================

/**
 * Setup category filters
 */
window.setupCategoryFilters = function() {
    return window.withErrorHandling(() => {
        window.debugLog('🏷️ Setting up category filters...');
        
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', window.handleCategoryClick);
            
            // Set initial active state
            const category = btn.getAttribute('data-category');
            if (category === window.STATE.currentCategory) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
        
        window.debugLog('✅ Category filters set up successfully');
        
    }, 'setupCategoryFilters');
};

/**
 * Handle category click
 */
window.handleCategoryClick = function(event) {
    return window.withErrorHandling(() => {
        const btn = event.currentTarget;
        const category = btn.getAttribute('data-category');
        
        if (!category) {
            window.debugError('❌ Category not found in button');
            return;
        }
        
        // Update current category
        window.STATE.currentCategory = category;
        
        // Update button states
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // Re-render menu with new filter
        if (window.renderMenu) {
            window.renderMenu();
        }
        
        window.debugLog(`✅ Category changed to: ${category}`);
        
    }, 'handleCategoryClick');
};

// =============================================================================
// APP CONTAINER MANAGEMENT
// =============================================================================

/**
 * Show app container
 */
window.showAppContainer = function() {
    return window.withErrorHandling(() => {
        const appContainer = window.safeGetElement('app-container');
        const loadingScreen = window.safeGetElement('loading-screen');
        
        if (appContainer) {
            appContainer.style.display = 'flex';
            appContainer.style.visibility = 'visible';
            appContainer.style.opacity = '1';
            window.debugLog('✅ App container shown');
        } else {
            window.debugError('❌ App container not found');
            return false;
        }
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        return true;
        
    }, 'showAppContainer');
};

// =============================================================================
// QUICK STATS UPDATE
// =============================================================================

/**
 * Update quick stats display
 */
window.updateQuickStats = function() {
    return window.withErrorHandling(() => {
        // Update invoice count
        const invoiceCountElement = window.safeGetElement('invoice-count');
        if (invoiceCountElement) {
            const pendingInvoices = window.STATE.invoices.filter(inv => inv.status === 'pending');
            invoiceCountElement.textContent = pendingInvoices.length;
        }
        
        // Update order total
        const orderTotalElement = window.safeGetElement('order-total');
        if (orderTotalElement) {
            const total = window.STATE.currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            orderTotalElement.textContent = window.formatPrice(total);
        }
        
        window.debugLog('✅ Quick stats updated');
        
    }, 'updateQuickStats');
};

/**
 * Update category counts
 */
window.updateCategoryCounts = function() {
    return window.withErrorHandling(() => {
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            const badge = btn.querySelector('.badge');
            
            if (badge && window.menuData) {
                let count = 0;
                if (category === 'all') {
                    count = window.menuData.length;
                } else {
                    count = window.menuData.filter(item => item.category === category).length;
                }
                badge.textContent = count;
            }
        });
        
        window.debugLog('✅ Category counts updated');
        
    }, 'updateCategoryCounts');
};

/**
 * Update all UI stats
 */
window.updateAllUIStats = function() {
    window.updateQuickStats();
    window.updateCategoryCounts();
};

console.log('✅ BalanCoffee UI Manager loaded');
