/**
 * BalanCoffee Emergency Recovery Script
 * Paste this into browser console to force system recovery
 */

console.log('🚨 BalanCoffee Emergency Recovery Script v2.0');
console.log('Attempting to recover system...');

// Emergency recovery function
(function emergencyRecovery() {
    try {
        // Check if debug system is available
        if (window.forceInitialization && typeof window.forceInitialization === 'function') {
            console.log('✅ Debug system available, running force initialization...');
            const result = window.forceInitialization();
            console.log('Force init result:', result);
            return result;
        }
        
        // Manual recovery if debug system not available
        console.log('⚠️ Debug system not available, running manual recovery...');
        
        // Remove error overlays
        const errorOverlay = document.getElementById('initialization-error');
        if (errorOverlay) {
            errorOverlay.remove();
            console.log('✅ Removed error overlay');
        }
        
        // Create missing DOM elements
        const criticalElements = [
            { 
                id: 'sidebar', 
                tag: 'aside', 
                className: 'sidebar collapsed',
                style: 'position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: #fff; border-left: 1px solid #ddd; z-index: 1000; transform: translateX(100%); transition: transform 0.3s ease;',
                content: '<div style="padding:20px;"><h3>Sidebar (Emergency)</h3><ul id="invoice-list"></ul></div>'
            },
            { 
                id: 'menu-grid', 
                tag: 'div', 
                className: 'menu-grid',
                style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px;',
                content: '<div style="padding:20px; text-align:center; border:1px solid #ddd;">Menu Grid (Emergency)</div>'
            },
            { 
                id: 'invoice-list', 
                tag: 'ul', 
                className: 'invoice-list',
                style: 'list-style: none; padding: 0; margin: 0;',
                content: '<li style="padding:10px;">Invoice List (Emergency)</li>'
            },
            { 
                id: 'loading-screen', 
                tag: 'div', 
                className: 'loading-screen',
                style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #6F4E37 0%, #8B6F47 100%); display: none; align-items: center; justify-content: center; z-index: 9999; color: white;',
                content: '<div style="text-align:center;"><div>Loading...</div></div>'
            },
            { 
                id: 'admin-dropdown', 
                tag: 'div', 
                className: 'admin-dropdown-menu dropdown',
                style: 'position: absolute; background: white; border: 1px solid #ddd; padding: 10px; display: none; z-index: 1000;',
                content: '<div>Admin Dropdown (Emergency)</div>'
            },
            { 
                id: 'current-order', 
                tag: 'div', 
                className: 'current-order',
                style: 'padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; margin: 10px 0;',
                content: '<h4>Current Order (Emergency)</h4><div id="order-items"></div><div>Total: <span id="order-total">0₫</span></div>'
            },
            { 
                id: 'order-total', 
                tag: 'span', 
                className: 'order-total-amount',
                style: 'font-weight: bold; color: #007bff;',
                content: '0₫'
            }        ];
        
        let createdCount = 0;
        criticalElements.forEach(elementInfo => {
            if (!document.getElementById(elementInfo.id)) {
                const element = document.createElement(elementInfo.tag);
                element.id = elementInfo.id;
                element.className = elementInfo.className || '';
                
                if (elementInfo.style) {
                    element.style.cssText = elementInfo.style;
                }
                
                if (elementInfo.content) {
                    element.innerHTML = elementInfo.content;
                }
                
                // Special handling for nested elements
                if (elementInfo.id === 'order-total' && document.getElementById('current-order')) {
                    document.getElementById('current-order').appendChild(element);
                } else if (elementInfo.id === 'invoice-list' && document.getElementById('sidebar')) {
                    document.getElementById('sidebar').appendChild(element);
                } else {
                    document.body.appendChild(element);
                }
                
                createdCount++;
                console.log(`✅ Created ${elementInfo.id}`);
            }
        });
        
        if (createdCount > 0) {
            console.log(`✅ Created ${createdCount} missing DOM elements`);
        }
        
        // Create basic Utils if missing
        if (!window.Utils) {
            window.Utils = {
                debugLog: (msg, data) => console.log(`[Utils] ${msg}`, data),
                debugError: (msg, err) => console.error(`[Utils ERROR] ${msg}`, err),
                formatCurrency: (amount) => new Intl.NumberFormat('vi-VN').format(amount) + '₫',
                generateId: () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };
            console.log('✅ Created basic Utils');
        }
        
        // Create basic data structures
        if (!window.menuData) {
            window.menuData = [
                { id: 1, name: "Cà phê đen", price: 25000, category: "cafe-viet" },
                { id: 2, name: "Cà phê sữa", price: 30000, category: "cafe-viet" },
                { id: 3, name: "Trà đá", price: 15000, category: "tra-trai-cay" }
            ];
            console.log('✅ Created menu data');
        }
        
        if (!window.orderData) window.orderData = { items: [], total: 0 };
        if (!window.customerData) window.customerData = [];
        if (!window.invoiceData) window.invoiceData = [];
        
        // Create basic DOM elements if missing
        const requiredElements = [
            'sidebar', 'menu-grid', 'invoice-list', 'loading-screen', 
            'admin-dropdown', 'current-order', 'order-total'
        ];
        
        let created = 0;
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                const element = document.createElement('div');
                element.id = id;
                element.innerHTML = `${id} (Emergency Recovery)`;
                element.style.cssText = 'padding: 10px; margin: 5px; border: 1px solid #ccc; background: #f9f9f9;';
                document.body.appendChild(element);
                created++;
            }
        });
        
        if (created > 0) {
            console.log(`✅ Created ${created} missing DOM elements`);
        }
        
        // Create basic functions
        if (!window.toggleSidebar) {
            window.toggleSidebar = () => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
            };
            console.log('✅ Created toggleSidebar function');
        }
        
        if (!window.createNewInvoice) {
            window.createNewInvoice = () => {
                console.log('Creating new invoice (emergency mode)');
            };
            console.log('✅ Created createNewInvoice function');
        }
        
        if (!window.filterInvoices) {
            window.filterInvoices = (filter) => {
                console.log(`Filtering invoices: ${filter}`);
            };
            console.log('✅ Created filterInvoices function');
        }
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('✅ Hidden loading screen');
        }
        
        console.log('🎉 Emergency recovery completed!');
        console.log('📋 System should now be functional');
        console.log('💡 Try refreshing the page or running: window.balanCoffeeDebug.checkSystem()');
        
        return { success: true, message: 'Emergency recovery completed' };
        
    } catch (error) {
        console.error('💥 Emergency recovery failed:', error);
        return { success: false, error: error.message };
    }
})();
