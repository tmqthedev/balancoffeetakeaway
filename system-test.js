// =============================================================================
// BALANCOFFEE SYSTEM TEST & VERIFICATION SCRIPT
// =============================================================================

console.log('🧪 Starting BalanCoffee System Test...');

// Test data
const testMenuItems = [
    { id: 1, name: 'Cà phê đen', price: 15000, category: 'coffee' },
    { id: 2, name: 'Cà phê sữa', price: 18000, category: 'coffee' },
    { id: 3, name: 'Trà đào cam sả', price: 25000, category: 'tea' }
];

// Mock DOM elements for testing
function createMockDOM() {
    console.log('🏗️ Creating mock DOM elements...');
    
    // Create basic container
    if (!document.body) {
        document.body = document.createElement('body');
    }
    
    // Create sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar collapsed';
    document.body.appendChild(sidebar);
    
    // Create invoice list
    const invoiceList = document.createElement('div');
    invoiceList.id = 'invoice-list';
    sidebar.appendChild(invoiceList);
    
    // Create sidebar controls
    const sidebarControls = document.createElement('div');
    sidebarControls.id = 'sidebar-controls';
    sidebarControls.style.display = 'none';
    sidebar.appendChild(sidebarControls);
    
    // Create current order display
    const currentOrderEl = document.createElement('div');
    currentOrderEl.id = 'current-order';
    document.body.appendChild(currentOrderEl);
    
    // Create order count
    const orderCount = document.createElement('span');
    orderCount.id = 'order-count';
    document.body.appendChild(orderCount);
    
    // Create invoice count
    const invoiceCountEl = document.createElement('span');
    invoiceCountEl.id = 'invoice-count';
    document.body.appendChild(invoiceCountEl);
    
    // Create shift displays
    const shiftStartDisplay = document.createElement('span');
    shiftStartDisplay.id = 'shift-start-display';
    document.body.appendChild(shiftStartDisplay);
    
    const shiftEmployeeDisplay = document.createElement('span');
    shiftEmployeeDisplay.id = 'shift-employee-display';
    document.body.appendChild(shiftEmployeeDisplay);
    
    console.log('✅ Mock DOM created');
}

// Test Functions
function testInvoiceOperations() {
    console.log('\n📋 Testing Invoice Operations...');
    
    try {
        // Clear existing data
        window.invoices = [];
        window.currentOrder = [];
        window.currentInvoiceId = null;
        
        // Test 1: Create new invoice
        console.log('1. Testing createNewInvoice()...');
        const newInvoice = createNewInvoice();
        
        if (newInvoice && newInvoice.id && window.invoices.length === 1) {
            console.log('✅ Create new invoice: PASSED');
        } else {
            console.log('❌ Create new invoice: FAILED');
            return false;
        }
        
        // Test 2: Add items to order
        console.log('2. Testing addToOrder()...');
        addToOrder(1); // Add coffee
        addToOrder(2); // Add milk coffee
        
        if (window.currentOrder.length === 2) {
            console.log('✅ Add to order: PASSED');
        } else {
            console.log('❌ Add to order: FAILED');
            return false;
        }
        
        // Test 3: Update quantities
        console.log('3. Testing quantity updates...');
        increaseQuantity(1);
        
        const coffeeItem = window.currentOrder.find(item => item.id === 1);
        if (coffeeItem && coffeeItem.quantity === 2) {
            console.log('✅ Increase quantity: PASSED');
        } else {
            console.log('❌ Increase quantity: FAILED');
            return false;
        }
        
        decreaseQuantity(1);
        if (coffeeItem.quantity === 1) {
            console.log('✅ Decrease quantity: PASSED');
        } else {
            console.log('❌ Decrease quantity: FAILED');
            return false;
        }
        
        // Test 4: Edit invoice
        console.log('4. Testing editInvoice()...');
        const invoiceId = window.invoices[0].id;
        editInvoice(invoiceId);
        
        if (window.currentInvoiceId === invoiceId && window.invoices[0].isEditing) {
            console.log('✅ Edit invoice: PASSED');
        } else {
            console.log('❌ Edit invoice: FAILED');
            return false;
        }
        
        // Test 5: Finish edit
        console.log('5. Testing finishEditInvoice()...');
        finishEditInvoice(invoiceId);
        
        if (!window.currentInvoiceId && !window.invoices[0].isEditing) {
            console.log('✅ Finish edit invoice: PASSED');
        } else {
            console.log('❌ Finish edit invoice: FAILED');
            return false;
        }
        
        // Test 6: Delete invoice
        console.log('6. Testing deleteInvoiceById()...');
        const initialCount = window.invoices.length;
        // Mock confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        
        deleteInvoiceById(invoiceId);
        window.confirm = originalConfirm;
        
        if (window.invoices.length === initialCount - 1) {
            console.log('✅ Delete invoice: PASSED');
        } else {
            console.log('❌ Delete invoice: FAILED');
            return false;
        }
        
        console.log('✅ All Invoice Operations: PASSED\n');
        return true;
        
    } catch (error) {
        console.log('❌ Invoice Operations Error:', error.message);
        return false;
    }
}

function testShiftOperations() {
    console.log('\n👤 Testing Shift Operations...');
    
    try {
        // Clear shift data
        window.shiftStartTime = null;
        window.currentShiftEmployee = null;
        window.currentShiftNote = null;
        
        // Test 1: Start new shift
        console.log('1. Testing proceedWithNewShift()...');
        // Mock confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        
        proceedWithNewShift('Nguyễn Văn A', 'Ca sáng');
        window.confirm = originalConfirm;
        
        if (window.shiftStartTime && window.currentShiftEmployee === 'Nguyễn Văn A') {
            console.log('✅ Start new shift: PASSED');
        } else {
            console.log('❌ Start new shift: FAILED');
            return false;
        }
        
        // Test 2: Update shift info display
        console.log('2. Testing updateShiftInfoDisplay()...');
        updateShiftInfoDisplay();
        
        console.log('✅ Update shift info: PASSED');
        
        // Test 3: Get current shift orders
        console.log('3. Testing getCurrentShiftOrders()...');
        const currentOrders = getCurrentShiftOrders();
        
        if (Array.isArray(currentOrders)) {
            console.log('✅ Get current shift orders: PASSED');
        } else {
            console.log('❌ Get current shift orders: FAILED');
            return false;
        }
        
        console.log('✅ All Shift Operations: PASSED\n');
        return true;
        
    } catch (error) {
        console.log('❌ Shift Operations Error:', error.message);
        return false;
    }
}

function testUIOperations() {
    console.log('\n🖥️ Testing UI Operations...');
    
    try {
        // Test 1: Toggle sidebar
        console.log('1. Testing toggleSidebar()...');
        const sidebar = document.getElementById('sidebar');
        const initialState = sidebar.classList.contains('collapsed');
        
        toggleSidebar();
        
        if (sidebar.classList.contains('collapsed') !== initialState) {
            console.log('✅ Toggle sidebar: PASSED');
        } else {
            console.log('❌ Toggle sidebar: FAILED');
            return false;
        }
        
        // Test 2: Show/hide sidebar controls
        console.log('2. Testing sidebar controls...');
        showSidebarControls();
        const controls = document.getElementById('sidebar-controls');
        
        if (controls.style.display === 'flex') {
            console.log('✅ Show sidebar controls: PASSED');
        } else {
            console.log('❌ Show sidebar controls: FAILED');
            return false;
        }
        
        hideSidebarControls();
        if (controls.style.display === 'none') {
            console.log('✅ Hide sidebar controls: PASSED');
        } else {
            console.log('❌ Hide sidebar controls: FAILED');
            return false;
        }
        
        // Test 3: Update displays
        console.log('3. Testing update displays...');
        updateInvoiceDisplay();
        updateOrderDisplay();
        updateInvoiceCount();
        
        console.log('✅ Update displays: PASSED');
        
        console.log('✅ All UI Operations: PASSED\n');
        return true;
        
    } catch (error) {
        console.log('❌ UI Operations Error:', error.message);
        return false;
    }
}

function testDataPersistence() {
    console.log('\n💾 Testing Data Persistence...');
    
    try {
        // Test 1: Save and load invoices
        console.log('1. Testing invoice persistence...');
        window.invoices = [
            {
                id: 'HD123456',
                items: [{ id: 1, name: 'Test Coffee', price: 15000, quantity: 2 }],
                total: 30000,
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
        
        saveInvoices();
        window.invoices = [];
        loadInvoices();
        
        if (window.invoices.length === 1 && window.invoices[0].id === 'HD123456') {
            console.log('✅ Invoice persistence: PASSED');
        } else {
            console.log('❌ Invoice persistence: FAILED');
            return false;
        }
        
        // Test 2: Save and load shift data
        console.log('2. Testing shift persistence...');
        saveShiftEmployee('Test Employee', 'Test Note');
        window.currentShiftEmployee = null;
        loadShiftEmployee();
        
        if (window.currentShiftEmployee === 'Test Employee') {
            console.log('✅ Shift persistence: PASSED');
        } else {
            console.log('❌ Shift persistence: FAILED');
            return false;
        }
        
        console.log('✅ All Data Persistence: PASSED\n');
        return true;
        
    } catch (error) {
        console.log('❌ Data Persistence Error:', error.message);
        return false;
    }
}

// Main test runner
function runAllTests() {
    console.log('🚀 BalanCoffee System Test Started\n');
    console.log('================================');
    
    createMockDOM();
    
    const results = {
        invoice: testInvoiceOperations(),
        shift: testShiftOperations(),
        ui: testUIOperations(),
        persistence: testDataPersistence()
    };
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('================================');
    console.log(`Invoice Operations: ${results.invoice ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Shift Operations: ${results.shift ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`UI Operations: ${results.ui ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Data Persistence: ${results.persistence ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    console.log('\n🎯 OVERALL RESULT');
    console.log('================================');
    if (allPassed) {
        console.log('✅ ALL TESTS PASSED - System Ready for Production!');
        console.log('🎉 BalanCoffee system is fully functional');
    } else {
        console.log('❌ SOME TESTS FAILED - Requires attention');
        console.log('⚠️ Check individual test results above');
    }
    
    return allPassed;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests };
} else if (typeof window !== 'undefined') {
    window.runBalanCoffeeTests = runAllTests;
}

console.log('📋 Test script loaded. Call runAllTests() to start testing.');
