// Test script để kiểm tra chức năng thanh toán
console.log('🔍 Testing payment functionality...');

// Test function để kiểm tra modal
function testPaymentModal() {
    console.log('📋 Testing payment modal...');
    
    // Tạo một invoice test
    const testInvoice = {
        id: 'TEST001',
        items: [
            { name: 'Cà phê đen', price: 25000, quantity: 2 },
            { name: 'Cà phê sữa', price: 30000, quantity: 1 }
        ],
        total: 80000,
        status: 'pending',
        createdAt: new Date().toISOString(),
        discount: 0,
        discountType: 'amount'
    };
    
    // Test mở modal
    try {
        openPaymentModal(testInvoice);
        console.log('✅ Payment modal opened successfully');
    } catch (error) {
        console.error('❌ Error opening payment modal:', error);
    }
}

// Test function để kiểm tra QR code
function testQRCode() {
    console.log('📱 Testing QR code generation...');
    
    try {
        generateQRCode(80000);
        console.log('✅ QR code generation attempted');
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
    }
}

// Test function để kiểm tra thanh toán
function testPaymentConfirmation() {
    console.log('💳 Testing payment confirmation...');
    
    // Tạo invoice test và thêm vào global array
    const testInvoice = {
        id: 'TEST002',
        items: [
            { name: 'Americano', price: 40000, quantity: 1 }
        ],
        total: 40000,
        status: 'pending',
        createdAt: new Date().toISOString(),
        discount: 0,
        discountType: 'amount'
    };
    
    // Add to invoices array
    invoices.push(testInvoice);
    window.currentPaymentInvoice = testInvoice;
    
    try {
        confirmPayment();
        console.log('✅ Payment confirmation attempted');
    } catch (error) {
        console.error('❌ Error confirming payment:', error);
    }
}

// Auto test khi page load
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🚀 Starting payment tests in 3 seconds...');
        
        setTimeout(() => {
            testQRCode();
        }, 1000);
        
        setTimeout(() => {
            testPaymentModal();
        }, 2000);
        
    }, 3000);
});

// Export test functions to global scope
window.testPaymentModal = testPaymentModal;
window.testQRCode = testQRCode;
window.testPaymentConfirmation = testPaymentConfirmation;

console.log('📝 Payment test functions loaded. Use:');
console.log('   testPaymentModal() - Test opening payment modal');
console.log('   testQRCode() - Test QR code generation');
console.log('   testPaymentConfirmation() - Test payment confirmation');
