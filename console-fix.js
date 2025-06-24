// BalanCoffee DOM Elements Quick Fix Console Script
// Paste this into browser console to immediately fix missing DOM elements

console.log('🚀 BalanCoffee DOM Elements Quick Fix v2.0');

(function() {
    const criticalElements = [
        'sidebar', 'menu-grid', 'invoice-list', 'loading-screen', 
        'admin-dropdown', 'current-order', 'order-total'
    ];

    function checkElements() {
        const missing = [];
        const found = [];
        
        criticalElements.forEach(id => {
            if (document.getElementById(id)) {
                found.push(id);
            } else {
                missing.push(id);
            }
        });

        console.log(`✅ Found: ${found.length}/${criticalElements.length} elements`);
        if (missing.length > 0) {
            console.log(`❌ Missing: ${missing.join(', ')}`);
        }
        
        return { missing, found };
    }

    function createMissingElements() {
        console.log('🔧 Creating missing DOM elements...');
        let created = 0;

        // Sidebar
        if (!document.getElementById('sidebar')) {
            const sidebar = document.createElement('aside');
            sidebar.id = 'sidebar';
            sidebar.className = 'sidebar collapsed';
            sidebar.innerHTML = `
                <div style="padding: 20px; background: #fff; height: 100%;">
                    <h3 style="margin: 0 0 20px 0; color: #333;">
                        <i class="fas fa-receipt"></i> Hóa đơn chờ
                    </h3>
                    <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px;">
                        <ul id="invoice-list" style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 10px; text-align: center; color: #666;">Chưa có hóa đơn nào</li>
                        </ul>
                    </div>
                    <button onclick="alert('Create New Invoice')" style="
                        width: 100%; margin-top: 20px; padding: 12px; 
                        background: #28a745; color: white; border: none; 
                        border-radius: 6px; cursor: pointer; font-weight: 500;
                    ">
                        <i class="fas fa-plus"></i> Tạo hóa đơn mới
                    </button>
                </div>
            `;
            sidebar.style.cssText = `
                position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
                background: #fff; border-left: 1px solid #ddd; z-index: 1000;
                transform: translateX(100%); transition: transform 0.3s ease;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1); overflow-y: auto;
            `;
            document.body.appendChild(sidebar);
            created++;
            console.log('✅ Created sidebar');
        }

        // Menu Grid
        if (!document.getElementById('menu-grid')) {
            const menuGrid = document.createElement('div');
            menuGrid.id = 'menu-grid';
            menuGrid.className = 'menu-grid';
            menuGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                    <div style="width: 40px; height: 40px; border: 3px solid #ddd; border-top-color: #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="margin: 0; font-size: 16px;">Đang tải menu...</p>
                </div>
            `;
            menuGrid.style.cssText = `
                display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px; padding: 20px; min-height: 200px; border: 1px solid #eee;
                border-radius: 8px; margin: 20px; background: #f9f9f9;
            `;
            
            // Try to find a good parent
            const parent = document.querySelector('.menu-section') || 
                          document.querySelector('main') || 
                          document.querySelector('.main-content') || 
                          document.body;
            parent.appendChild(menuGrid);
            created++;
            console.log('✅ Created menu-grid');
        }

        // Loading Screen
        if (!document.getElementById('loading-screen')) {
            const loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.className = 'loading-screen';
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: white;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 30px;">
                        <i class="fas fa-coffee" style="font-size: 48px;"></i>
                        <h2 style="margin: 0; font-size: 32px; font-weight: 600;">BalanCoffee</h2>
                    </div>
                    <div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="margin: 0; font-size: 18px; opacity: 0.9;">Đang khởi tạo hệ thống...</p>
                </div>
            `;
            loadingScreen.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(135deg, #6F4E37 0%, #8B6F47 100%);
                display: none; align-items: center; justify-content: center;
                z-index: 9999; font-family: Arial, sans-serif;
            `;
            document.body.appendChild(loadingScreen);
            created++;
            console.log('✅ Created loading-screen');
        }

        // Current Order
        if (!document.getElementById('current-order')) {
            const currentOrder = document.createElement('div');
            currentOrder.id = 'current-order';
            currentOrder.className = 'current-order';
            currentOrder.innerHTML = `
                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Thức uống đã chọn</h4>
                <div id="order-items" style="min-height: 60px; margin-bottom: 15px; border: 1px dashed #ddd; border-radius: 4px; padding: 15px;">
                    <div style="text-align: center; color: #666; font-style: italic;">
                        <i class="fas fa-coffee" style="font-size: 24px; display: block; margin-bottom: 10px; opacity: 0.5;"></i>
                        Chưa có món nào được chọn
                    </div>
                </div>
                <div style="border-top: 1px solid #ddd; padding-top: 15px; text-align: right;">
                    <strong style="font-size: 18px;">Tổng cộng: <span id="order-total" style="color: #007bff; font-weight: bold;">0₫</span></strong>
                </div>
            `;
            currentOrder.style.cssText = `
                padding: 20px; border: 1px solid #ddd; border-radius: 8px;
                background: #f9f9f9; margin: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            // Try to find modal-body or append to body
            const parent = document.querySelector('.modal-body') || 
                          document.querySelector('#order-modal .modal-body') || 
                          document.body;
            parent.appendChild(currentOrder);
            created++;
            console.log('✅ Created current-order with order-total');
        }

        // Order Total (if not created with current-order)
        if (!document.getElementById('order-total')) {
            const orderTotal = document.createElement('span');
            orderTotal.id = 'order-total';
            orderTotal.className = 'order-total-amount';
            orderTotal.textContent = '0₫';
            orderTotal.style.cssText = 'font-weight: bold; color: #007bff; font-size: 1.1em;';
            
            const parent = document.querySelector('.order-total') || 
                          document.getElementById('current-order') || 
                          document.body;
            parent.appendChild(orderTotal);
            created++;
            console.log('✅ Created order-total');
        }

        // Invoice List (if not created with sidebar)
        if (!document.getElementById('invoice-list')) {
            const invoiceList = document.createElement('ul');
            invoiceList.id = 'invoice-list';
            invoiceList.className = 'invoice-list';
            invoiceList.innerHTML = `
                <li style="padding: 15px; text-align: center; color: #666; font-style: italic;">
                    Chưa có hóa đơn nào
                </li>
            `;
            invoiceList.style.cssText = 'list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto;';
            
            const parent = document.querySelector('.invoice-list-container') || 
                          document.getElementById('sidebar') || 
                          document.body;
            parent.appendChild(invoiceList);
            created++;
            console.log('✅ Created invoice-list');
        }

        // Admin Dropdown
        if (!document.getElementById('admin-dropdown')) {
            const adminDropdown = document.createElement('div');
            adminDropdown.id = 'admin-dropdown';
            adminDropdown.className = 'admin-dropdown-menu dropdown';
            adminDropdown.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px; font-weight: 600;">Quản lý ca làm việc</h4>
                    <button onclick="alert('Start New Shift')" style="
                        display: flex; align-items: center; gap: 8px; width: 100%;
                        padding: 8px 12px; background: none; border: none; text-align: left;
                        cursor: pointer; border-radius: 4px; transition: background-color 0.2s;
                    " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                        <i class="fas fa-play" style="color: #28a745;"></i>
                        <span>Bắt đầu ca mới</span>
                    </button>
                    <button onclick="alert('End Shift')" style="
                        display: flex; align-items: center; gap: 8px; width: 100%;
                        padding: 8px 12px; background: none; border: none; text-align: left;
                        cursor: pointer; border-radius: 4px; transition: background-color 0.2s;
                    " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                        <i class="fas fa-stop" style="color: #dc3545;"></i>
                        <span>Kết thúc ca</span>
                    </button>
                </div>
            `;
            adminDropdown.style.cssText = `
                position: absolute; background: white; border: 1px solid #ddd;
                border-radius: 8px; padding: 15px; display: none; z-index: 1001;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px;
            `;
            
            const parent = document.querySelector('.admin-dropdown') || 
                          document.querySelector('.header-controls') || 
                          document.body;
            parent.appendChild(adminDropdown);
            created++;
            console.log('✅ Created admin-dropdown');
        }

        // Add CSS animations
        if (!document.getElementById('console-fix-styles')) {
            const style = document.createElement('style');
            style.id = 'console-fix-styles';
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        console.log(`🎉 Created ${created} missing DOM elements`);
        return created;
    }

    // Main execution
    console.log('🔍 Checking current state...');
    const initialCheck = checkElements();
    
    if (initialCheck.missing.length > 0) {
        console.log(`❌ Found ${initialCheck.missing.length} missing elements`);
        const created = createMissingElements();
        
        // Verify after creation
        setTimeout(() => {
            const finalCheck = checkElements();
            if (finalCheck.missing.length === 0) {
                console.log('🎉 SUCCESS: All elements created and verified!');
                console.log('✅ You can now reload the page or continue using the app');
            } else {
                console.log(`⚠️ Still missing: ${finalCheck.missing.join(', ')}`);
            }
        }, 100);
    } else {
        console.log('✅ All elements already exist!');
    }

    // Expose functions for manual use
    window.BalanCoffeeConsoleTools = {
        checkElements,
        createMissingElements,
        toggleSidebar: () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
                sidebar.style.transform = sidebar.classList.contains('collapsed') ? 
                    'translateX(100%)' : 'translateX(0)';
                console.log('Sidebar toggled');
            }
        },
        showLoadingScreen: () => {
            const loading = document.getElementById('loading-screen');
            if (loading) {
                loading.style.display = 'flex';
                console.log('Loading screen shown');
            }
        },
        hideLoadingScreen: () => {
            const loading = document.getElementById('loading-screen');
            if (loading) {
                loading.style.display = 'none';
                console.log('Loading screen hidden');
            }
        }
    };

    console.log('🛠️ Console tools available: window.BalanCoffeeConsoleTools');
})();
