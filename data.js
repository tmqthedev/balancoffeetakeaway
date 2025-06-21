// Menu data
const menuData = [
    // Cà phê Việt
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
        name: "Cà phê dừa",
        description: "Cà phê đen với nước cốt dừa thơm béo",
        price: 38000,
        category: "cafe-viet"
    },

    // Cà phê Ý
    {
        id: 5,
        name: "Espresso",
        description: "Cà phê Ý nguyên chất, đậm đà",
        price: 35000,
        category: "cafe-y"
    },
    {
        id: 6,
        name: "Americano",
        description: "Espresso pha loãng với nước nóng",
        price: 40000,
        category: "cafe-y"
    },
    {
        id: 7,
        name: "Cappuccino",
        description: "Espresso với lớp foam sữa mịn màng",
        price: 45000,
        category: "cafe-y"
    },
    {
        id: 8,
        name: "Latte",
        description: "Espresso với sữa nóng và một chút foam",
        price: 50000,
        category: "cafe-y"
    },
    {
        id: 9,
        name: "Macchiato",
        description: "Espresso với một chút sữa foam",
        price: 48000,
        category: "cafe-y"
    },

    // Trà trái cây
    {
        id: 10,
        name: "Trà đào",
        description: "Trà xanh tươi mát với hương vị đào tự nhiên",
        price: 35000,
        category: "tra-trai-cay"
    },
    {
        id: 11,
        name: "Trà chanh",
        description: "Trà đen kết hợp chanh tươi chua ngọt",
        price: 30000,
        category: "tra-trai-cay"
    },
    {
        id: 12,
        name: "Trà vải",
        description: "Trà xanh với vải tươi ngọt mát",
        price: 38000,
        category: "tra-trai-cay"
    },
    {
        id: 13,
        name: "Trà dâu",
        description: "Trà xanh với dâu tây tươi",
        price: 40000,
        category: "tra-trai-cay"
    },
    {
        id: 14,
        name: "Trà xoài",
        description: "Trà xanh với xoài tươi ngọt",
        price: 42000,
        category: "tra-trai-cay"
    },    // Đồ uống khác
    {
        id: 15,
        name: "Matcha latte",
        description: "Matcha nguyên chất với sữa tươi",
        price: 55000,
        category: "khac"
    },
    {
        id: 16,
        name: "Matcha đá xay",
        description: "Matcha đá xay mát lạnh",
        price: 50000,
        category: "khac"
    },
    {
        id: 17,
        name: "Matcha trân châu",
        description: "Matcha latte với trân châu đen",
        price: 58000,
        category: "khac"
    },
    {
        id: 18,
        name: "Matcha đậu đỏ",
        description: "Matcha với đậu đỏ ngọt ngào",
        price: 60000,
        category: "khac"
    },
    {
        id: 19,
        name: "Soda chanh",
        description: "Soda chanh sảng khoái, giải khát",
        price: 25000,
        category: "khac"
    },
    {
        id: 20,
        name: "Soda blue hawaii",
        description: "Soda xanh với syrup blue curacao",
        price: 35000,
        category: "khac"
    },
    {
        id: 21,
        name: "Soda dâu",
        description: "Soda với syrup dâu tươi",
        price: 32000,
        category: "khac"
    },
    {
        id: 22,
        name: "Soda cam",
        description: "Soda với cam tươi ngọt mát",
        price: 30000,
        category: "khac"
    },
    {
        id: 23,
        name: "Chocolate nóng",
        description: "Chocolate đậm đà, ngọt ngào",
        price: 40000,
        category: "khac"
    },
    {
        id: 24,
        name: "Chocolate đá",
        description: "Chocolate lạnh với đá viên",
        price: 38000,
        category: "khac"
    },
    {
        id: 25,
        name: "Mocha",
        description: "Cà phê kết hợp chocolate",
        price: 48000,
        category: "khac"
    },
    {
        id: 26,
        name: "Hot chocolate trân châu",
        description: "Chocolate nóng với trân châu đen",
        price: 45000,
        category: "khac"
    }
];

// Sample orders data for demonstration
let ordersData = [];

// QR payment information
const qrPaymentInfo = {
    bankName: "VIETCOMBANK",
    accountNumber: "1234567890",
    accountHolder: "BALANCOFFEE",
    content: "Thanh toan don hang"
};

// Expose globals to window for diagnostic detection
window.menuData = menuData;
window.qrPaymentInfo = qrPaymentInfo;
