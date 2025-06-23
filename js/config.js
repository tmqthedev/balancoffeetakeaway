/**
 * BalanCoffee - Configuration File
 * Chứa các cấu hình chính của ứng dụng
 */

// =============================================================================
// GLOBAL CONFIGURATION
// =============================================================================

window.BalanCoffeeConfig = {
    // Debug configuration
    DEBUG_MODE: window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.search.includes('debug=true'),
    
    // Application settings
    APP_VERSION: '8.5',
    APP_NAME: 'BalanCoffee POS System',
    
    // LocalStorage keys
    STORAGE_KEYS: {
        INVOICES: 'balancoffee_invoices',
        SHIFT_START: 'balancoffee_shift_start',
        SHIFT_EMPLOYEE: 'balancoffee_shift_employee',
        SHIFT_NOTE: 'balancoffee_shift_note',
        SETTINGS: 'balancoffee_settings'
    },
    
    // Animation durations
    TRANSITIONS: {
        FAST: 150,
        BASE: 300,
        SLOW: 500
    },
    
    // Initialization settings
    INIT: {
        MAX_ATTEMPTS: 3,
        RETRY_DELAY: 2000,
        EMERGENCY_TIMEOUT: 10000
    },
    
    // Required DOM elements
    REQUIRED_ELEMENTS: [
        'app-container',
        'menu-grid',
        'order-items',
        'order-total'
    ],
    
    // Menu categories
    CATEGORIES: {
        ALL: 'all',
        CAFE_VIET: 'cafe-viet',
        CAFE_Y: 'cafe-y',
        ESPRESSO: 'espresso',
        TRA_NUOC_EP: 'tra-nuoc-ep',
        KHAC: 'khac'
    },
    
    // Invoice statuses
    INVOICE_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    // Notification types
    NOTIFICATION_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }
};

// =============================================================================
// FALLBACK DATA
// =============================================================================

window.BalanCoffeeConfig.FALLBACK_MENU = [
    { 
        id: 1, 
        name: "Cà phê đen", 
        description: "Cà phê đen truyền thống, đậm đà hương vị Việt Nam", 
        price: 25000, 
        category: "cafe-viet" 
    },
    { 
        id: 2, 
        name: "Cà phê sữa", 
        description: "Cà phê đen kết hợp với sữa đặc ngọt ngào", 
        price: 30000, 
        category: "cafe-viet" 
    },
    { 
        id: 3, 
        name: "Bạc xỉu", 
        description: "Cà phê sữa nhạt, thơm ngon dễ uống", 
        price: 35000, 
        category: "cafe-viet" 
    },
    { 
        id: 4, 
        name: "Espresso", 
        description: "Cà phê Ý nguyên chất, đậm đà", 
        price: 35000, 
        category: "espresso" 
    },
    { 
        id: 5, 
        name: "Americano", 
        description: "Espresso pha loãng với nước nóng", 
        price: 40000, 
        category: "espresso" 
    },
    { 
        id: 6, 
        name: "Cappuccino", 
        description: "Espresso với lớp foam sữa mịn màng", 
        price: 45000, 
        category: "espresso" 
    }
];

// Make config globally accessible
window.CONFIG = window.BalanCoffeeConfig;

console.log(`✅ BalanCoffee Config loaded - Version ${window.CONFIG.APP_VERSION}`);
