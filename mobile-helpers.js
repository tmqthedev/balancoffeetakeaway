/**
 * Mobile Helper Functions for BalanCoffee POS System
 * Tối ưu hóa trải nghiệm người dùng trên thiết bị di động
 */

// Kiểm tra thiết bị mobile
const isMobile = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Kiểm tra orientation
const isLandscape = () => {
    return window.innerWidth > window.innerHeight;
};

// Prevent zoom on input focus (iOS Safari)
const preventZoomOnFocus = () => {
    if (isMobile()) {
        const viewport = document.querySelector('meta[name="viewport"]');
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            });
            
            input.addEventListener('blur', () => {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
            });
        });
    }
};

// Touch gesture handling for sidebar
const handleSidebarSwipe = () => {
    if (!isMobile()) return;
    
    let startX, startY, currentX, currentY;
    const sidebar = document.getElementById('sidebar');
    const threshold = 50; // pixels
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;
        
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Determine if it's a horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Swipe left to open sidebar (từ phải sang trái)
            if (diffX < -threshold && startX > window.innerWidth - 50) {
                if (sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                }
            }
            
            // Swipe right to close sidebar (từ trái sang phải)
            if (diffX > threshold && !sidebar.classList.contains('collapsed')) {
                toggleSidebar();
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
        startX = null;
        startY = null;
        currentX = null;
        currentY = null;
    }, { passive: true });
};

// Haptic feedback for touch devices
const hapticFeedback = (type = 'light') => {
    if ('vibrate' in navigator) {
        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(50);
                break;
            default:
                navigator.vibrate(10);
        }
    }
};

// Show toast notification
const showToast = (message, type = 'info', duration = 3000) => {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="closeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, duration);
    
    // Haptic feedback
    hapticFeedback('light');
};

// Create toast container if not exists
const createToastContainer = () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
};

// Get toast icon based on type
const getToastIcon = (type) => {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle"></i>';
        case 'error':
            return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        default:
            return '<i class="fas fa-info-circle"></i>';
    }
};

// Close toast
const closeToast = (button) => {
    const toast = button.closest('.toast');
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
};

// Handle orientation change
const handleOrientationChange = () => {
    const body = document.body;
    
    if (isLandscape() && isMobile()) {
        body.classList.add('landscape-mode');
        body.classList.remove('portrait-mode');
    } else {
        body.classList.add('portrait-mode');
        body.classList.remove('landscape-mode');
    }
    
    // Adjust sidebar for landscape
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('collapsed')) {
        if (isLandscape() && isMobile()) {
            sidebar.style.width = '60vw';
        } else {
            sidebar.style.width = '';
        }
    }
};

// Network status monitoring
const monitorNetworkStatus = () => {
    const updateNetworkStatus = () => {
        const isOnline = navigator.onLine;
        const indicator = document.querySelector('.connection-status');
        const offlineIndicator = document.querySelector('.offline-indicator');
        
        if (indicator) {
            indicator.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
            indicator.innerHTML = `
                <span class="connection-indicator"></span>
                ${isOnline ? 'Đã kết nối' : 'Mất kết nối'}
            `;
        }
        
        if (offlineIndicator) {
            if (isOnline) {
                offlineIndicator.classList.remove('show');
            } else {
                offlineIndicator.classList.add('show');
                showToast('Mất kết nối internet. Một số tính năng có thể bị hạn chế.', 'warning', 5000);
            }
        }
    };
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus(); // Initial check
};

// Enhanced button click with loading state
const enhancedButtonClick = (button, asyncFunction) => {
    return async (...args) => {
        if (button.classList.contains('loading')) return;
        
        button.classList.add('loading');
        button.disabled = true;
        hapticFeedback('light');
        
        try {
            await asyncFunction(...args);
            hapticFeedback('medium');
        } catch (error) {
            hapticFeedback('heavy');
            showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
            console.error(error);
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    };
};

// Pull to refresh functionality
const initPullToRefresh = (container, refreshCallback) => {
    if (!isMobile()) return;
    
    let startY = 0;
    let pullDistance = 0;
    const threshold = 80;
    const maxPull = 120;
    
    let refreshIndicator = container.querySelector('.pull-refresh');
    if (!refreshIndicator) {
        refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-refresh';
        refreshIndicator.innerHTML = `
            <i class="fas fa-redo-alt"></i>
            <span>Kéo để làm mới</span>
        `;
        container.insertBefore(refreshIndicator, container.firstChild);
    }
    
    container.addEventListener('touchstart', (e) => {
        if (container.scrollTop === 0) {
            startY = e.touches[0].clientY;
        }
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        if (startY && container.scrollTop === 0) {
            pullDistance = e.touches[0].clientY - startY;
            
            if (pullDistance > 0) {
                const progress = Math.min(pullDistance / maxPull, 1);
                refreshIndicator.style.transform = `translateY(${Math.min(pullDistance * 0.5, 40)}px)`;
                refreshIndicator.style.opacity = progress;
                
                if (pullDistance > threshold) {
                    refreshIndicator.classList.add('active');
                    refreshIndicator.querySelector('span').textContent = 'Thả để làm mới';
                } else {
                    refreshIndicator.classList.remove('active');
                    refreshIndicator.querySelector('span').textContent = 'Kéo để làm mới';
                }
            }
        }
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
        if (pullDistance > threshold) {
            refreshIndicator.classList.add('active');
            refreshIndicator.querySelector('span').textContent = 'Đang làm mới...';
            hapticFeedback('medium');
            
            refreshCallback().finally(() => {
                refreshIndicator.classList.remove('active');
                refreshIndicator.style.transform = '';
                refreshIndicator.style.opacity = '';
                refreshIndicator.querySelector('span').textContent = 'Kéo để làm mới';
            });
        } else {
            refreshIndicator.style.transform = '';
            refreshIndicator.style.opacity = '';
            refreshIndicator.classList.remove('active');
        }
        
        startY = 0;
        pullDistance = 0;
    }, { passive: true });
};

// Initialize all mobile features
const initMobileHelpers = () => {
    // Don't initialize if already done or if main app is not ready
    if (window.mobileHelpersInitialized) return;
    
    console.log('🔧 Initializing mobile helpers...');
    
    try {
        preventZoomOnFocus();
        handleSidebarSwipe();
        handleOrientationChange();
        monitorNetworkStatus();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(handleOrientationChange, 100);
        });
        
        window.addEventListener('resize', handleOrientationChange);        // Initialize pull to refresh for invoice list when it's available
        const initInvoicePullRefresh = () => {
            const invoiceContainer = document.querySelector('.invoice-list-container');
            if (invoiceContainer) {
                initPullToRefresh(invoiceContainer, async () => {
                    // Refresh invoice list
                    if (window.loadInvoices && typeof window.loadInvoices === 'function') {                        try {
                            const result = window.loadInvoices();
                            if (result && typeof result.then === 'function') {
                                await Promise.resolve(result);
                            } else if (result) {
                                // If it's not a promise, just continue
                                console.log('Invoice refresh completed');
                            }
                        }catch (error) {
                            console.error('Error refreshing invoices:', error);
                        }
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        location.reload();
                    }
                });
            }
        };
        
        // Wait for main app to be ready before initializing pull refresh
        if (window.initializationState?.isInitialized) {
            initInvoicePullRefresh();
        } else {
            // Wait for app initialization
            const checkAppReady = setInterval(() => {
                if (window.initializationState?.isInitialized) {
                    clearInterval(checkAppReady);
                    initInvoicePullRefresh();
                }
            }, 500);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkAppReady);
                initInvoicePullRefresh();
            }, 10000);
        }
        
        window.mobileHelpersInitialized = true;
        console.log('✅ Mobile helpers initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing mobile helpers:', error);
    }
};

// Export functions for global use
window.mobileHelpers = {
    isMobile,
    isLandscape,
    hapticFeedback,
    showToast,
    closeToast,
    enhancedButtonClick,
    initPullToRefresh
};

// Initialize when ready - wait for main app
const startMobileHelpers = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initMobileHelpers, 200); // Delay to let main app initialize first
        });
    } else {
        setTimeout(initMobileHelpers, 200);
    }
};

// Only start if not already initialized
if (!window.mobileHelpersInitialized) {
    startMobileHelpers();
}
