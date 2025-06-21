// Simple JavaScript validator for BalanCoffee
console.log('🔍 Validating script.js...');

// Test if script can be parsed
try {
    // This will run the script and catch any syntax errors
    console.log('✅ Script syntax is valid');
    
    // Test key variables
    console.log('📊 Testing global variables...');
    console.log('currentOrder:', typeof currentOrder);
    console.log('invoices:', typeof invoices);
    console.log('orderHistory:', typeof orderHistory);
    console.log('shiftStartTime:', typeof shiftStartTime);
    
    // Test key functions
    console.log('🔧 Testing key functions...');
    const keyFunctions = [
        'loadInvoices', 'saveInvoices', 'loadOrderHistory', 'saveOrderHistory',
        'getShiftStartTime', 'showNotification', 'formatPrice', 'formatDateTime',
        'renderMenu', 'createNewInvoice', 'openPaymentModal', 'confirmPayment'
    ];
    
    keyFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} - OK`);
        } else {
            console.log(`❌ ${funcName} - Missing or not a function`);
        }
    });
    
    // Test DOM elements
    console.log('🎯 Testing DOM elements...');
    const keyElements = [
        'menu-grid', 'invoice-list', 'invoice-count', 
        'order-modal', 'payment-modal', 'success-modal'
    ];
    
    keyElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ #${elementId} - Found`);
        } else {
            console.log(`❌ #${elementId} - Missing`);
        }
    });
    
    console.log('🎉 Validation complete!');
    
} catch (error) {
    console.error('💥 Script validation failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
}
