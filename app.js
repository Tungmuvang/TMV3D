/* ==========================================================================
   TMV IN3D - STORE LOGIC (MULTIPLE GALLERY IMAGES & BACKUP JSON EXPORT/IMPORT)
   ========================================================================== */

const DEFAULT_CATEGORIES = [
  { id: "Articulated", name: "Mô Hình Linh Hoạt (Articulated)" },
  { id: "Miniatures", name: "Mech & Miniatures" },
  { id: "Decor", name: "Trang Trí Voronoi" },
  { id: "Cosplay", name: "Cosplay & Prop" }
];

const DEFAULT_PRODUCTS = [
  {
    id: "p5",
    title: "Mô Hình Sonic 3D Articulated (Linh Hoạt)",
    category: "Articulated",
    price: 550000,
    deposit: 200000,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjem5q7x4CcXGrq565HKUc_YPtzrsi3KhpUwUAnk1b23h1Zmt7XUYFgT_VtjRlndcIBHEhyphenhyphen1nrZBdQOOKHsyEQAXvZINt7ZW-LJohP7fcy0eK1wKWS4OwOFbOA3RN2c1bg5MXghuCxsXWSLt-1iDwzSVjROqTzb7j2IX_o9TtlpXlO7a9SenBoN2iCD34tc/s1600/TMV01520.jpg",
    images: [
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjem5q7x4CcXGrq565HKUc_YPtzrsi3KhpUwUAnk1b23h1Zmt7XUYFgT_VtjRlndcIBHEhyphenhyphen1nrZBdQOOKHsyEQAXvZINt7ZW-LJohP7fcy0eK1wKWS4OwOFbOA3RN2c1bg5MXghuCxsXWSLt-1iDwzSVjROqTzb7j2IX_o9TtlpXlO7a9SenBoN2iCD34tc/s1600/TMV01520.jpg",
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjsj7vktaG7aCblrH1o6f22-ZBr8z5ayXN4x0PhYfYQvwBYJ8aZrW8g41UCZCqtY9fxHyKuocoKJpr6nJOuklbape8oGncqlUhsHb7ueUSjdttTvLFBmsJrQ68ko6MaITFdp_yW_dDBu_1sP7Am_H1rsONUYzegi4khJXxP5k8iGAO_JFUaQkbSLluf_2EL/s1600/TMV01526.jpg",
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFVRe45nloN6-cDN0UhFyRkmugANQFfmoGnFj9ZCakH2nyc5eyIC5IV5ZefeGLCbs_Dh3qRW6BSpeVFbZPzBSflLc_6j3pj9Z84Awj08yaFXsE934bBO6pLlPdnTuZ1k7t-g234j07jPf0THvTjM291j9jjECuYr9SXCvq2iMFRpCu4y4wt1n377djKrPz/s1600/TMV01527.jpg"
    ],
    description: "Mô hình Sonic The Hedgehog 3D uốn lượn linh hoạt được chế tác tỉ mỉ từ nhựa PLA nguyên sinh cao cấp. Màu sắc sắc nét, khớp di chuyển siêu bền, thích hợp trang trí và sưu tầm.",
    colors: [
      { 
        name: "Xanh Dương (Sonic Blue)", 
        extra: 0, 
        hex: "#0052ff", 
        image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjem5q7x4CcXGrq565HKUc_YPtzrsi3KhpUwUAnk1b23h1Zmt7XUYFgT_VtjRlndcIBHEhyphenhyphen1nrZBdQOOKHsyEQAXvZINt7ZW-LJohP7fcy0eK1wKWS4OwOFbOA3RN2c1bg5MXghuCxsXWSLt-1iDwzSVjROqTzb7j2IX_o9TtlpXlO7a9SenBoN2iCD34tc/s1600/TMV01520.jpg" 
      },
      { 
        name: "Vàng (Super Sonic Gold)", 
        extra: 0, 
        hex: "#f59e0b", 
        image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjsj7vktaG7aCblrH1o6f22-ZBr8z5ayXN4x0PhYfYQvwBYJ8aZrW8g41UCZCqtY9fxHyKuocoKJpr6nJOuklbape8oGncqlUhsHb7ueUSjdttTvLFBmsJrQ68ko6MaITFdp_yW_dDBu_1sP7Am_H1rsONUYzegi4khJXxP5k8iGAO_JFUaQkbSLluf_2EL/s1600/TMV01526.jpg" 
      },
      { 
        name: "Trắng Đen (Monochrome)", 
        extra: 0, 
        hex: "#1e293b", 
        image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFVRe45nloN6-cDN0UhFyRkmugANQFfmoGnFj9ZCakH2nyc5eyIC5IV5ZefeGLCbs_Dh3qRW6BSpeVFbZPzBSflLc_6j3pj9Z84Awj08yaFXsE934bBO6pLlPdnTuZ1k7t-g234j07jPf0THvTjM291j9jjECuYr9SXCvq2iMFRpCu4y4wt1n377djKrPz/s1600/TMV01527.jpg" 
      }
    ],
    sizes: [
      { name: "Cao 22.5cm", scale: "Cao 22.5cm", mult: 1.0, priceOverride: 550000 },
      { name: "Cao 30cm", scale: "Cao 30cm", mult: 1.27, priceOverride: 700000 },
      { name: "Cao 45cm", scale: "Cao 45cm", mult: 1.54, priceOverride: 850000 }
    ]
  },
  {
    id: "p1",
    title: "Rồng Thần Articulated Silk Rainbow",
    category: "Articulated",
    price: 320000,
    deposit: 200000,
    image: "assets/images/dragon.png",
    images: ["assets/images/dragon.png"],
    description: "Mô hình rồng thần linh hoạt uốn lượn được in từ chất liệu PLA Silk Cầu Cồng 3D cao cấp. Từng đốt khớp uốn lượn linh hoạt không gãy, thích hợp làm đồ chơi giải tỏa stress hoặc trang trí bàn làm việc.",
    colors: [
      { name: "Silk Rainbow (Cầu Cồng)", extra: 30000, hex: "linear-gradient(135deg, #ef4444, #eab308, #06b6d4, #ec4899)", image: "assets/images/dragon.png" },
      { name: "Silk Gold Copper", extra: 20000, hex: "#f59e0b", image: "assets/images/dragon.png" },
      { name: "Matte Black (Đen Nhám)", extra: 0, hex: "#1e293b", image: "assets/images/dragon.png" }
    ],
    sizes: [
      { name: "Cao 45cm", scale: "Cao 45cm", mult: 1.0, priceOverride: 320000 },
      { name: "Cao 65cm", scale: "Cao 65cm", mult: 1.4, priceOverride: 450000 },
      { name: "Cao 90cm", scale: "Cao 90cm", mult: 1.8, priceOverride: 580000 }
    ]
  },
  {
    id: "p2",
    title: "Robot Mech Warrior Futuristic Miniature",
    category: "Miniatures",
    price: 450000,
    deposit: 250000,
    image: "assets/images/mech.png",
    images: ["assets/images/mech.png"],
    description: "Mô hình Robot chiến binh Mech in bằng công nghệ Resin độ nét cực cao (Layer height 0.05mm). Bề mặt cực mịn, lên chi tiết từng đường giáp và vũ khí nhỏ nhất.",
    colors: [
      { name: "Dark Grey Resin", extra: 0, hex: "#334155", image: "assets/images/mech.png" },
      { name: "Translucent Red Accent", extra: 40000, hex: "#ef4444", image: "assets/images/mech.png" }
    ],
    sizes: [
      { name: "Cao 15cm", scale: "Cao 15cm", mult: 1.0, priceOverride: 450000 },
      { name: "Cao 20cm", scale: "Cao 20cm", mult: 1.35, priceOverride: 600000 }
    ]
  },
  {
    id: "p3",
    title: "Chậu Cây Voronoi Parametric Modern",
    category: "Decor",
    price: 180000,
    deposit: 100000,
    image: "assets/images/planter.png",
    images: ["assets/images/planter.png"],
    description: "Chậu trồng cây cảnh phong cách kiến trúc hình học Voronoi. Thiết kế thoáng khí hỗ trợ rễ rồng phát triển khỏe mạnh. Chất liệu chống nước bền bỉ.",
    colors: [
      { name: "Metallic Copper (Đồng)", extra: 20000, hex: "#b45309", image: "assets/images/planter.png" },
      { name: "Marble White (Vân Đá)", extra: 10000, hex: "#f8fafc", image: "assets/images/planter.png" }
    ],
    sizes: [
      { name: "Cao 8cm", scale: "Cao 8cm", mult: 0.85, priceOverride: 150000 },
      { name: "Cao 12cm", scale: "Cao 12cm", mult: 1.0, priceOverride: 180000 },
      { name: "Cao 18cm", scale: "Cao 18cm", mult: 1.5, priceOverride: 270000 }
    ]
  },
  {
    id: "p4",
    title: "Mặt Nạ Helmet Cyberpunk Cosplay Prop",
    category: "Cosplay",
    price: 850000,
    deposit: 300000,
    image: "assets/images/helmet.png",
    images: ["assets/images/helmet.png"],
    description: "Prop nón đội Cyberpunk tỉ lệ 1:1 có thể đeo được. In từ PETG siêu bền chịu va đập tốt. Tích hợp các rãnh đi dây LED trang trí sinh động.",
    colors: [
      { name: "Neon Cyber Black", extra: 0, hex: "#0f172a", image: "assets/images/helmet.png" },
      { name: "Chrome Silver", extra: 80000, hex: "#94a3b8", image: "assets/images/helmet.png" }
    ],
    sizes: [
      { name: "Size M (56-58cm)", scale: "Size M (56-58cm)", mult: 1.0, priceOverride: 850000 },
      { name: "Size L (59-62cm)", scale: "Size L (59-62cm)", mult: 1.2, priceOverride: 1020000 }
    ]
  }
];

// COOKIE HELPERS
function setCookie(cname, cvalue, exdays = 60) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + encodeURIComponent(JSON.stringify(cvalue)) + ";" + expires + ";path=/";
  } catch(e) {}
}

function getCookie(cname) {
  try {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) return JSON.parse(c.substring(name.length, c.length));
    }
  } catch(e) {}
  return null;
}

class App {
  constructor() {
    this.categories = this.loadStorage('3d_store_categories', DEFAULT_CATEGORIES);
    
    // Đọc danh sách sản phẩm từ localStorage, CHỈ lấy default khi storage hoàn toàn trống
    const savedProds = localStorage.getItem('3d_store_products');
    if (savedProds) {
      try {
        this.products = JSON.parse(savedProds);
      } catch (e) {
        this.products = DEFAULT_PRODUCTS;
        this.saveStorage('3d_store_products', this.products);
      }
    } else {
      this.products = DEFAULT_PRODUCTS;
      this.saveStorage('3d_store_products', this.products);
    }

    this.cart = this.loadStorage('3d_store_cart', []);
    this.orders = this.loadStorage('3d_store_orders', []);
    
    this.settings = this.loadStorage('3d_store_settings', {
      tgToken: '8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY',
      tgChatId: '7744946591, 7607846055',
      sheetUrl: 'https://script.google.com/macros/s/AKfycbxZg6wWKe_yuV9UgZv2dBquCLNPYPyTqxi0urqcquf9lYdUTNqE0DAN9N8y9g3fXJEj/exec',
      adminAccount: 'admin',
      adminPassword: '123456'
    });

    this.currentCategory = 'all';
    this.searchQuery = '';
    
    this.activeProduct = null;
    this.selectedColor = null;
    this.selectedSize = null;
    this.selectedQty = 1;

    this.lightboxImages = [];
    this.lightboxIndex = 0;

    this.pollingInterval = null;
    this.currentTransferCode = '';

    this.init();
  }

  init() {
    this.updateCartBadge();
    this.renderCategoryChips();
    this.renderCategoryAdminList();
    this.renderCategorySelectOptions();
    this.bindCommonEvents();
    this.loadAdminSettings();

    // KIỂM TRA NẾU ĐANG Ở TRANG DÀNH RIÊNG ADMINTMV.HTML
    if (document.getElementById('admin-login-wrapper')) {
      this.initAdminPageLogic();
    }

    if (document.getElementById('products-grid')) {
      this.initCatalogPage();
    } else if (document.getElementById('detail-title')) {
      this.initProductDetailPage();
    }
  }

  loadStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  saveStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  formatMoney(num) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + 'đ';
  }

  formatPriceInput(valStr) {
    const cleanNum = (valStr || '').toString().replace(/\D/g, '');
    if (!cleanNum) return '';
    return new Intl.NumberFormat('de-DE').format(parseInt(cleanNum, 10));
  }

  parsePriceInput(valStr) {
    const cleanNum = (valStr || '').toString().replace(/\D/g, '');
    return parseInt(cleanNum, 10) || 0;
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--accent-gold-dark);"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // --- EXPORT & IMPORT BACKUP JSON DATA LOGIC ---
  exportDataBackup() {
    const backupData = {
      timestamp: new Date().toISOString(),
      storeName: "TMV IN3D Store Backup",
      categories: this.categories,
      products: this.products,
      settings: this.settings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tmv_3d_store_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.showToast('📥 Đã xuất file Backup JSON chứa tất cả sản phẩm thành công!', 'success');
  }

  importDataBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported.products && Array.isArray(imported.products)) {
          this.products = imported.products;
          this.saveStorage('3d_store_products', this.products);
          
          if (imported.categories && Array.isArray(imported.categories)) {
            this.categories = imported.categories;
            this.saveStorage('3d_store_categories', this.categories);
          }

          if (imported.settings) {
            this.settings = imported.settings;
            this.saveStorage('3d_store_settings', this.settings);
          }

          this.renderCategoryChips();
          this.renderCategorySelectOptions();
          this.renderCategoryAdminList();
          this.renderAdminProductTable();
          if (document.getElementById('products-grid')) this.renderCatalog();

          this.showToast(`📤 Khôi phục thành công ${this.products.length} sản phẩm từ file backup!`, 'success');
        } else {
          this.showToast('File JSON không hợp lệ!', 'error');
        }
      } catch (err) {
        this.showToast('Lỗi khi đọc file Backup JSON!', 'error');
      }
    };
    reader.readAsText(file);
  }

  // --- TRANG DÀNH RIÊNG ADMINTMV.HTML LOGIC ---
  initAdminPageLogic() {
    const isAuthed = sessionStorage.getItem('tmv_admin_logged_in') === 'true';
    const loginWrapper = document.getElementById('admin-login-wrapper');
    const mainDashboard = document.getElementById('admin-main-dashboard');
    const logoutBtn = document.getElementById('admin-page-logout-btn');

    if (isAuthed) {
      if (loginWrapper) loginWrapper.style.display = 'none';
      if (mainDashboard) mainDashboard.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';

      const accountDisplay = document.getElementById('admin-account-display');
      if (accountDisplay) accountDisplay.innerText = sessionStorage.getItem('tmv_admin_account') || this.settings.adminAccount || 'admin';

      this.renderAdminProductTable();
      this.renderCategorySelectOptions();
      this.renderCategoryAdminList();

      if (!document.getElementById('edit-product-id').value) {
        this.renderAdminGalleryImages([]);
        this.renderAdminColorRows([]);
        this.renderAdminSizeRows([]);
      }
    } else {
      if (loginWrapper) loginWrapper.style.display = 'flex';
      if (mainDashboard) mainDashboard.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }

    const loginForm = document.getElementById('admin-page-login-form');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const userInput = document.getElementById('admin-user-input').value.trim();
        const passInput = document.getElementById('admin-pass-input').value.trim();

        const correctUser = (this.settings.adminAccount || 'admin').trim();
        const correctPass = (this.settings.adminPassword || '123456').trim();

        if (userInput === correctUser && passInput === correctPass) {
          sessionStorage.setItem('tmv_admin_logged_in', 'true');
          sessionStorage.setItem('tmv_admin_account', userInput);
          this.showToast('Đăng nhập Admin thành công!', 'success');
          this.initAdminPageLogic();
        } else {
          this.showToast('Sai tài khoản hoặc mật khẩu Admin!', 'error');
        }
      };
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        sessionStorage.removeItem('tmv_admin_logged_in');
        sessionStorage.removeItem('tmv_admin_account');
        this.showToast('Đã đăng xuất tài khoản Admin.', 'info');
        this.initAdminPageLogic();
      };
    }

    const exportBtn = document.getElementById('export-backup-btn');
    if (exportBtn) exportBtn.onclick = () => this.exportDataBackup();

    const importBtn = document.getElementById('import-backup-btn');
    const importInput = document.getElementById('import-file-input');
    if (importBtn && importInput) {
      importBtn.onclick = () => importInput.click();
      importInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.importDataBackup(e.target.files[0]);
          e.target.value = '';
        }
      };
    }
  }

  // --- DYNAMIC CATEGORY CMS LOGIC ---
  renderCategoryChips() {
    const chipsContainer = document.getElementById('category-chips');
    if (!chipsContainer) return;
    chipsContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = `chip ${this.currentCategory === 'all' ? 'active' : ''}`;
    allBtn.dataset.cat = 'all';
    allBtn.innerText = 'Tất Cả';
    chipsContainer.appendChild(allBtn);

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `chip ${this.currentCategory === cat.id ? 'active' : ''}`;
      btn.dataset.cat = cat.id;
      btn.innerText = cat.name;
      chipsContainer.appendChild(btn);
    });
  }

  renderCategorySelectOptions() {
    const select = document.getElementById('p-category');
    if (!select) return;
    select.innerHTML = '';
    this.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.innerText = cat.name;
      select.appendChild(opt);
    });
  }

  renderCategoryAdminList() {
    const container = document.getElementById('category-admin-list');
    if (!container) return;
    container.innerHTML = '';

    this.categories.forEach((cat, index) => {
      const item = document.createElement('div');
      item.className = 'category-manage-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-tag" style="color: var(--accent-gold-dark);"></i>
          <strong>${cat.name}</strong> <small style="color: var(--text-muted);">(${cat.id})</small>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="app.editCategory(${index})">
            <i class="fa-solid fa-pen"></i> Sửa
          </button>
          <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; color: #ef4444; border-color: #fca5a5;" onclick="app.deleteCategory(${index})">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </div>
      `;
      container.appendChild(item);
    });
  }

  addCategory(name) {
    const id = 'Cat_' + Date.now();
    this.categories.push({ id, name });
    this.saveStorage('3d_store_categories', this.categories);
    this.renderCategoryChips();
    this.renderCategorySelectOptions();
    this.renderCategoryAdminList();
    this.showToast(`Đã thêm danh mục mới: ${name}`, 'success');
  }

  editCategory(index) {
    const cat = this.categories[index];
    const newName = prompt('Sửa tên danh mục:', cat.name);
    if (newName && newName.trim()) {
      this.categories[index].name = newName.trim();
      this.saveStorage('3d_store_categories', this.categories);
      this.renderCategoryChips();
      this.renderCategorySelectOptions();
      this.renderCategoryAdminList();
      this.showToast('Đã cập nhật tên danh mục!', 'success');
    }
  }

  deleteCategory(index) {
    if (this.categories.length <= 1) {
      this.showToast('Phải giữ lại ít nhất 1 danh mục!', 'error');
      return;
    }
    if (!confirm(`Xóa danh mục "${this.categories[index].name}"?`)) return;
    this.categories.splice(index, 1);
    this.saveStorage('3d_store_categories', this.categories);
    this.renderCategoryChips();
    this.renderCategorySelectOptions();
    this.renderCategoryAdminList();
    this.showToast('Đã xóa danh mục thành công!', 'success');
  }

  // --- CATALOG PAGE ---
  initCatalogPage() {
    this.renderCatalog();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderCatalog();
      });
    }

    const chipsContainer = document.getElementById('category-chips');
    if (chipsContainer) {
      chipsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip')) {
          document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          e.target.classList.add('active');
          this.currentCategory = e.target.dataset.cat;
          this.renderCatalog();
        }
      });
    }
  }

  renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = this.products.filter(p => {
      const matchCat = this.currentCategory === 'all' || p.category === this.currentCategory;
      const matchQuery = p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-dim);"></i>
          <h3>Không tìm thấy mô hình phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc chọn lại danh mục.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(p => {
      const catObj = this.categories.find(c => c.id === p.category);
      const catName = catObj ? catObj.name : p.category;

      let minP = p.price;
      let maxP = p.price;

      if (p.sizes && p.sizes.length > 0) {
        const sizePrices = p.sizes.map(s => s.priceOverride ? s.priceOverride : (p.price * (s.mult || 1.0)));
        minP = Math.min(...sizePrices);
        maxP = Math.max(...sizePrices);
      }

      const displayPriceText = (minP === maxP) 
        ? this.formatMoney(minP) 
        : `${this.formatMoney(minP)} - ${this.formatMoney(maxP)}`;

      const mainImgSrc = (p.images && p.images.length > 0) ? p.images[0] : p.image;

      const card = document.createElement('a');
      card.href = `product.html?id=${p.id}`;
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img-wrapper">
          <img src="${mainImgSrc}" alt="${p.title}" class="product-img" loading="lazy" onerror="this.src='assets/images/dragon.png'">
          <span class="category-tag">${catName}</span>
        </div>
        <div class="product-body">
          <h3 class="product-title">${p.title}</h3>
          <div class="product-specs-mini">
            <span class="spec-badge"><i class="fa-solid fa-palette"></i> ${p.colors ? p.colors.length : 1} Màu</span>
            <span class="spec-badge"><i class="fa-solid fa-coins"></i> Cọc: ${this.formatMoney(p.deposit || 200000)}</span>
          </div>
          <div class="product-footer">
            <div class="price-box">
              <span class="price-label">Giá mô hình</span>
              <span class="price-value" style="font-size: 0.95rem;">${displayPriceText}</span>
            </div>
            <span class="btn-primary">
              Xem Chi Tiết <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // --- PRODUCT DETAIL PAGE LOGIC (HIỂN THỊ TOÀN BỘ BỘ ẢNH) ---
  initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'p5';
    const p = this.products.find(item => item.id === productId) || this.products[0];

    this.activeProduct = p;
    this.selectedColor = (p.colors && p.colors.length > 0) ? p.colors[0] : { name: "Mặc định", hex: "#0052ff", extra: 0, image: p.image };
    this.selectedSize = (p.sizes && p.sizes.length > 0) ? p.sizes[0] : { name: "Tiêu chuẩn", scale: "Tiêu chuẩn", mult: 1.0, priceOverride: p.price };
    this.selectedQty = 1;

    document.title = `${p.title} | TMV IN3D`;
    document.getElementById('detail-title').innerText = p.title;
    
    const catObj = this.categories.find(c => c.id === p.category);
    document.getElementById('detail-category').innerText = catObj ? catObj.name : p.category;
    document.getElementById('detail-desc').innerText = p.description;
    
    const initialImg = (this.selectedColor && this.selectedColor.image) ? this.selectedColor.image : (p.images && p.images.length > 0 ? p.images[0] : p.image);
    document.getElementById('detail-main-img').src = initialImg;
    document.getElementById('detail-qty').innerText = '1';

    // RENDER DANH SÁCH THUMBNAILS TOÀN BỘ BỘ ẢNH (GALLERY IMAGES + COLORS)
    const thumbsList = document.getElementById('detail-thumbs-list');
    thumbsList.innerHTML = '';

    const allProductGalleryImages = [];
    if (p.images && p.images.length > 0) {
      p.images.forEach(img => {
        if (img && !allProductGalleryImages.includes(img)) allProductGalleryImages.push(img);
      });
    }
    if (p.image && !allProductGalleryImages.includes(p.image)) {
      allProductGalleryImages.push(p.image);
    }
    if (p.colors) {
      p.colors.forEach(c => {
        if (c.image && !allProductGalleryImages.includes(c.image)) allProductGalleryImages.push(c.image);
      });
    }

    allProductGalleryImages.forEach((imgSrc, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `thumb-item ${initialImg === imgSrc ? 'active' : ''}`;
      thumb.dataset.imgsrc = imgSrc;
      thumb.innerHTML = `<img src="${imgSrc}" alt="Thumb ${idx + 1}" onerror="this.src='assets/images/dragon.png'">`;
      thumb.onclick = () => this.switchMainImg(imgSrc, thumb);
      thumbsList.appendChild(thumb);
    });

    // RENDER NÚT CHỌN MÀU
    const colorContainer = document.getElementById('detail-color-container');
    colorContainer.innerHTML = '';
    if (p.colors && p.colors.length > 0) {
      p.colors.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = `color-option-btn ${idx === 0 ? 'active' : ''}`;
        btn.innerHTML = `
          <span class="color-swatch-circle" style="background: ${c.hex};"></span>
          <span>${c.name}</span>
        `;
        btn.onclick = () => {
          document.querySelectorAll('#detail-color-container .color-option-btn').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          this.selectedColor = c;
          document.getElementById('detail-selected-color-name').innerText = c.name;

          if (c.image) {
            const matchingThumb = document.querySelector(`.thumb-item[data-imgsrc="${CSS.escape(c.image)}"]`) || null;
            this.switchMainImg(c.image, matchingThumb);
          }

          this.updateDetailCalculatedPrice();
        };
        colorContainer.appendChild(btn);
      });
    }

    // RENDER NÚT CHỌN KÍCH THƯỚC IN
    const sizeContainer = document.getElementById('detail-size-container');
    sizeContainer.innerHTML = '';
    
    const cleanSizeTitle = this.selectedSize.name || this.selectedSize.scale || 'Tiêu chuẩn';
    document.getElementById('detail-selected-size-name').innerText = cleanSizeTitle;

    if (p.sizes && p.sizes.length > 0) {
      p.sizes.forEach((s, idx) => {
        const sizeDisplayName = s.name || s.scale || 'Tiêu chuẩn';

        const btn = document.createElement('button');
        btn.className = `size-option-btn ${idx === 0 ? 'active' : ''}`;
        btn.innerHTML = `
          <span class="size-name" style="font-size: 0.95rem; font-weight: 700;">${sizeDisplayName}</span>
        `;
        btn.onclick = () => {
          document.querySelectorAll('#detail-size-container .size-option-btn').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          this.selectedSize = s;
          document.getElementById('detail-selected-size-name').innerText = sizeDisplayName;
          
          if (s.image) {
            this.switchMainImg(s.image);
          }

          this.updateDetailCalculatedPrice();
        };
        sizeContainer.appendChild(btn);
      });
    }

    document.getElementById('detail-qty-minus').onclick = () => {
      if (this.selectedQty > 1) {
        this.selectedQty--;
        document.getElementById('detail-qty').innerText = this.selectedQty;
        this.updateDetailCalculatedPrice();
      }
    };
    document.getElementById('detail-qty-plus').onclick = () => {
      this.selectedQty++;
      document.getElementById('detail-qty').innerText = this.selectedQty;
      this.updateDetailCalculatedPrice();
    };

    document.getElementById('detail-add-cart-btn').onclick = () => this.addToCartFromDetailPage();

    this.updateDetailCalculatedPrice();
  }

  switchMainImg(src, thumbEl) {
    const mainImg = document.getElementById('detail-main-img');
    if (!mainImg || !src) return;

    mainImg.style.opacity = '0.3';
    setTimeout(() => {
      mainImg.src = src;
      mainImg.style.opacity = '1';
    }, 150);

    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
    if (thumbEl) {
      thumbEl.classList.add('active');
    } else {
      const match = document.querySelector(`.thumb-item[data-imgsrc="${CSS.escape(src)}"]`);
      if (match) match.classList.add('active');
    }
  }

  updateDetailCalculatedPrice() {
    if (!this.activeProduct || !this.selectedColor || !this.selectedSize) return;

    const base = this.activeProduct.price;
    const colorExtra = this.selectedColor.extra || 0;
    
    const singleUnitPrice = (this.selectedSize.priceOverride ? this.selectedSize.priceOverride : (base * (this.selectedSize.mult || 1.0))) + colorExtra;
    const totalPrice = singleUnitPrice * this.selectedQty;

    const calcEl = document.getElementById('detail-calculated-price');
    if (calcEl) calcEl.innerText = this.formatMoney(totalPrice);
  }

  // --- FULLSCREEN IMAGE LIGHTBOX MODAL (CHẠY QUA TOÀN BỘ BỘ ẢNH) ---
  openLightbox(initialSrc) {
    if (!this.activeProduct) return;

    const images = [];
    if (this.activeProduct.images && this.activeProduct.images.length > 0) {
      this.activeProduct.images.forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    if (this.activeProduct.image && !images.includes(this.activeProduct.image)) {
      images.push(this.activeProduct.image);
    }
    if (this.activeProduct.colors) {
      this.activeProduct.colors.forEach(c => {
        if (c.image && !images.includes(c.image)) {
          images.push(c.image);
        }
      });
    }

    this.lightboxImages = images.length > 0 ? images : [initialSrc];
    const idx = this.lightboxImages.indexOf(initialSrc);
    this.lightboxIndex = idx > -1 ? idx : 0;

    this.updateLightboxView();
    document.getElementById('image-lightbox-modal').classList.add('active');
  }

  updateLightboxView() {
    if (!this.lightboxImages || this.lightboxImages.length === 0) return;
    const currentSrc = this.lightboxImages[this.lightboxIndex];

    const imgEl = document.getElementById('lightbox-img');
    if (imgEl) {
      imgEl.style.opacity = '0.3';
      setTimeout(() => {
        imgEl.src = currentSrc;
        imgEl.style.opacity = '1';
      }, 100);
    }

    const counterEl = document.getElementById('lightbox-counter');
    if (counterEl) {
      counterEl.innerText = `Ảnh ${this.lightboxIndex + 1} / ${this.lightboxImages.length}`;
    }
  }

  navigateLightbox(delta) {
    if (!this.lightboxImages || this.lightboxImages.length === 0) return;
    this.lightboxIndex = (this.lightboxIndex + delta + this.lightboxImages.length) % this.lightboxImages.length;
    this.updateLightboxView();
  }

  closeLightbox() {
    const modal = document.getElementById('image-lightbox-modal');
    if (modal) modal.classList.remove('active');
  }

  // --- ADD TO CART CHOICE MODAL FLOW ---
  addToCartFromDetailPage() {
    if (!this.activeProduct || !this.selectedColor || !this.selectedSize) return;

    const base = this.activeProduct.price;
    const colorExtra = this.selectedColor.extra || 0;
    const unitPrice = (this.selectedSize.priceOverride ? this.selectedSize.priceOverride : (base * (this.selectedSize.mult || 1.0))) + colorExtra;
    const sizeTitle = this.selectedSize.name || this.selectedSize.scale || 'Tiêu chuẩn';

    const cartItem = {
      productId: this.activeProduct.id,
      title: this.activeProduct.title,
      image: this.selectedColor.image || this.activeProduct.image,
      color: this.selectedColor.name,
      size: sizeTitle,
      unitPrice: unitPrice,
      deposit: this.activeProduct.deposit || 200000,
      qty: this.selectedQty
    };

    const existingIndex = this.cart.findIndex(
      item => item.productId === cartItem.productId && item.color === cartItem.color && item.size === cartItem.size
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += cartItem.qty;
    } else {
      this.cart.push(cartItem);
    }

    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();

    const choiceModal = document.getElementById('cart-choice-modal');
    if (choiceModal) {
      document.getElementById('choice-modal-msg').innerText = `Đã thêm ${cartItem.title} (${cartItem.color}, ${cartItem.size}) vào giỏ hàng!`;
      choiceModal.classList.add('active');
    } else {
      this.openCartDrawer();
    }
  }

  proceedToCheckoutDirectly() {
    this.closeModal('cart-choice-modal');
    this.openCartDrawer();
  }

  // --- CENTERED CHECKOUT MODAL & DEPOSIT MODAL ---
  updateCartBadge() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = totalCount;
  }

  openCartDrawer() {
    this.renderCartItems();

    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');

    const guestCookie = getCookie('tmv_guest_info') || this.loadStorage('tmv_guest_info', null);
    if (guestCookie) {
      if (nameInput && !nameInput.value && guestCookie.name) nameInput.value = guestCookie.name;
      if (phoneInput && !phoneInput.value && guestCookie.phone) phoneInput.value = guestCookie.phone;
      if (addressInput && !addressInput.value && guestCookie.address) addressInput.value = guestCookie.address;
    }

    document.getElementById('cart-drawer').classList.add('active');
  }

  renderCartItems() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;
    list.innerHTML = '';

    if (this.cart.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-dim);"></i>
          <p>Giỏ hàng của bạn đang trống.</p>
        </div>
      `;
      document.getElementById('cart-total-price').innerText = '0đ';
      return;
    }

    let grandTotal = 0;

    this.cart.forEach((item, index) => {
      const itemTotal = item.unitPrice * item.qty;
      grandTotal += itemTotal;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" class="cart-item-img" alt="${item.title}" onerror="this.src='assets/images/dragon.png'">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-meta">Màu: <strong>${item.color}</strong> | Kích thước: <strong>${item.size}</strong></div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.4rem;">
            <span class="cart-item-price">${this.formatMoney(itemTotal)} <small style="font-weight:normal; color:var(--text-muted); font-size:0.75rem;">(Cọc: ${this.formatMoney((item.deposit || 200000) * item.qty)})</small></span>
            <div class="qty-stepper" style="transform: scale(0.85); transform-origin: right;">
              <button class="qty-btn" onclick="app.changeCartQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-number">${item.qty}</span>
              <button class="qty-btn" onclick="app.changeCartQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        </div>
        <button class="cart-item-remove" onclick="app.removeCartItem(${index})"><i class="fa-solid fa-trash-can"></i></button>
      `;
      list.appendChild(div);
    });

    document.getElementById('cart-total-price').innerText = this.formatMoney(grandTotal);
  }

  changeCartQty(index, delta) {
    this.cart[index].qty += delta;
    if (this.cart[index].qty <= 0) {
      this.cart.splice(index, 1);
    }
    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();
    this.renderCartItems();
  }

  removeCartItem(index) {
    this.cart.splice(index, 1);
    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();
    this.renderCartItems();
  }

  async handleCheckout(e) {
    e.preventDefault();

    if (this.cart.length === 0) {
      this.showToast('Giỏ hàng trống! Hãy chọn sản phẩm trước.', 'error');
      return;
    }

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const note = document.getElementById('cust-note').value.trim();

    if (!name || !phone || !address) {
      this.showToast('Vui lòng điền đầy đủ Tên, SĐT và Địa chỉ.', 'error');
      return;
    }

    const guestData = { name, phone, address };
    setCookie('tmv_guest_info', guestData, 60);
    this.saveStorage('tmv_guest_info', guestData);

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const transferCode = `TMV3D ${orderNum}`;
    this.currentTransferCode = transferCode;

    const grandTotal = this.cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);

    let totalDeposit = 0;
    this.cart.forEach(item => {
      const itemDep = item.deposit || 200000;
      totalDeposit += itemDep * item.qty;
    });

    totalDeposit = Math.min(totalDeposit, grandTotal);
    const depositText = this.formatMoney(totalDeposit);
    const remainingCod = Math.max(0, grandTotal - totalDeposit);

    const itemsSummaryText = this.cart.map(
      item => `• ${item.title} (${item.color}, ${item.size}) x${item.qty} = ${this.formatMoney(item.unitPrice * item.qty)}`
    ).join('\n');

    const orderData = {
      orderId: `TMV-${orderNum}`,
      name: name,
      customerName: name,
      customerEmail: name + '@khach.tmvin3d.com',
      phone: phone,
      address: address,
      note: note,
      product: itemsSummaryText,
      itemsSummary: itemsSummaryText,
      price: this.formatMoney(grandTotal),
      totalPrice: this.formatMoney(grandTotal),
      deposit: depositText,
      remainingCod: this.formatMoney(remainingCod),
      transferCode: transferCode,
      timestamp: new Date().toLocaleString('vi-VN')
    };

    const submitBtn = document.getElementById('submit-order-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang Đặt Hàng...`;

    this.orders.unshift(orderData);
    this.saveStorage('3d_store_orders', this.orders);

    if (this.settings.sheetUrl) {
      try {
        await fetch(this.settings.sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      } catch (err) {}
    } else if (this.settings.tgToken && this.settings.tgChatId) {
      const chatIds = this.settings.tgChatId.split(',').map(id => id.trim());
      const tgMsg = 
`📩 <b>CÓ ĐƠN HÀNG TMV IN3D MỚI (CHỜ CỌC ${depositText})</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${name}
📞 <b>SĐT:</b> <code>${phone}</code>
🏠 <b>Địa chỉ:</b> ${address}
📦 <b>Sản phẩm đã chọn:</b>
${itemsSummaryText}

💰 <b>Tổng đơn:</b> ${this.formatMoney(grandTotal)}
💵 <b>Cần cọc:</b> <b>${depositText}</b>
💳 <b>Còn lại thu COD:</b> <b>${this.formatMoney(remainingCod)}</b>
🏷️ <b>Mã CK:</b> <code>${transferCode}</code>
📝 <b>Ghi chú:</b> ${note || 'Không có'}
⏳ <b>Trạng thái:</b> Chờ tiền cọc về Gmail ⏳`;

      for (let cid of chatIds) {
        try {
          await fetch(`https://api.telegram.org/bot${this.settings.tgToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: cid,
              text: tgMsg,
              parse_mode: 'HTML'
            })
          });
        } catch (err) {}
      }
    }

    this.cart = [];
    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();
    document.getElementById('checkout-form').reset();
    this.closeModal('cart-drawer');

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> XÁC NHẬN ĐẶT HÀNG & THANH TOÁN`;

    document.getElementById('dep-order-id').innerText = `#TMV-${orderNum}`;
    document.getElementById('dep-total-price').innerText = this.formatMoney(grandTotal);
    document.getElementById('dep-amount-display').innerText = depositText;
    document.getElementById('dep-transfer-code').innerText = transferCode;

    const qrUrl = `https://img.vietqr.io/image/TIMO-9021186623244-qr_only.jpg?amount=${totalDeposit}&addInfo=${encodeURIComponent(transferCode)}&accountName=NGUYEN%20THI%20NHUNG`;
    document.getElementById('dep-qr-img').src = qrUrl;

    const depositModal = document.getElementById('deposit-payment-modal');
    if (depositModal) depositModal.classList.add('active');

    this.startPaymentStatusPolling(transferCode);
    this.showToast(`Đơn hàng #${orderNum} đã khởi tạo! Vui lòng chuyển cọc ${depositText}.`, 'success');
  }

  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Đã sao chép: ${text}`, 'success');
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.showToast(`Đã sao chép: ${text}`, 'success');
    });
  }

  copyTransferCode() {
    this.copyText(this.currentTransferCode);
  }

  startPaymentStatusPolling(code) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    const cleanCode = code.toUpperCase().replace(/\s+/g, '');
    const webAppUrl = this.settings.sheetUrl;

    window.onPaymentStatusCheck = (data) => {
      if (data && (data.status === "paid" || data.status === "PAID")) {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        this.showToast('🎉 ĐÃ NHẬN TIỀN CỌC THÀNH CÔNG! Shop sẽ chuẩn bị đơn ngay.', 'success');
      }
    };

    if (!webAppUrl || !webAppUrl.includes('script.google.com')) return;

    this.pollingInterval = setInterval(() => {
      const oldScript = document.getElementById('jsonp-check-script');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.id = 'jsonp-check-script';
      script.src = `${webAppUrl}?action=check_payment_status&code=${encodeURIComponent(cleanCode)}&callback=onPaymentStatusCheck&t=${Date.now()}`;
      document.body.appendChild(script);
    }, 4000);
  }

  // --- ADMIN CMS: MULTIPLE GALLERY IMAGES MANAGER ---
  renderAdminGalleryImages(images = []) {
    const container = document.getElementById('admin-gallery-images-container');
    if (!container) return;
    container.innerHTML = '';

    if (!images || images.length === 0) {
      container.innerHTML = `
        <div id="gallery-empty-placeholder" style="width: 100%; text-align: center; padding: 1.5rem; color: var(--text-dim);">
          <i class="fa-solid fa-images" style="font-size: 2rem; margin-bottom: 0.4rem; display: block;"></i>
          <span>Chưa có ảnh nào. Bấm nút <strong>"Tải Nhiều Ảnh Máy Tính"</strong> hoặc <strong>"Thêm Link Ảnh URL"</strong> ở trên để tải ảnh sản phẩm.</span>
        </div>
      `;
      return;
    }

    images.forEach((imgSrc, idx) => {
      this.addGalleryCardUI(imgSrc, idx === 0);
    });
  }

  addGalleryCardUI(imgSrc = "", isCover = false) {
    const container = document.getElementById('admin-gallery-images-container');
    if (!container) return;

    const placeholder = document.getElementById('gallery-empty-placeholder');
    if (placeholder) placeholder.remove();

    const card = document.createElement('div');
    card.className = 'admin-gallery-card-item';
    card.style.cssText = 'width: 130px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); padding: 0.5rem; background: #f8fafc; display: flex; flex-direction: column; gap: 0.4rem; position: relative;';

    card.innerHTML = `
      <div style="width: 100%; height: 110px; border-radius: 4px; overflow: hidden; background: #0f172a; position: relative; display: flex; align-items: center; justify-content: center;">
        <img src="${imgSrc}" class="gallery-card-preview-img" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" onerror="this.src='assets/images/dragon.png'">
        <button type="button" style="position: absolute; top: 4px; right: 4px; background: rgba(239,68,68,0.9); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;" onclick="this.closest('.admin-gallery-card-item').remove(); app.checkGalleryEmpty();" title="Xóa ảnh này">
          <i class="fa-solid fa-xmark"></i>
        </button>
        ${isCover ? '<span style="position: absolute; bottom: 4px; left: 4px; background: var(--accent-gold-dark); color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 3px; font-weight: 700;">Ảnh chính</span>' : ''}
      </div>
      <input type="text" class="form-control gallery-img-url-input" value="${imgSrc}" placeholder="Link ảnh URL..." style="font-size: 0.75rem; padding: 0.3rem;" required>
    `;

    const urlInput = card.querySelector('.gallery-img-url-input');
    const previewImg = card.querySelector('.gallery-card-preview-img');

    urlInput.addEventListener('input', (e) => {
      previewImg.src = e.target.value.trim();
    });

    container.appendChild(card);
  }

  addGalleryUrlRow() {
    this.addGalleryCardUI("", false);
  }

  checkGalleryEmpty() {
    const container = document.getElementById('admin-gallery-images-container');
    if (container && container.children.length === 0) {
      this.renderAdminGalleryImages([]);
    }
  }

  // --- ADMIN CMS: COLOR OPTIONS EDITOR ---
  renderAdminColorRows(colors = []) {
    const container = document.getElementById('admin-color-rows-container');
    if (!container) return;
    container.innerHTML = '';

    if (!colors || colors.length === 0) {
      colors = [
        { name: "Xanh Dương", hex: "#0052ff", extra: 0, image: "" },
        { name: "Vàng", hex: "#f59e0b", extra: 0, image: "" }
      ];
    }

    colors.forEach((c) => {
      this.addAdminColorRowUI(c.name, c.hex || "#0052ff", c.extra || 0, c.image || "");
    });
  }

  addAdminColorRowUI(name = "", hex = "#0052ff", extra = 0, image = "") {
    const container = document.getElementById('admin-color-rows-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'admin-color-row-item';
    div.innerHTML = `
      <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
        <input type="color" value="${hex.startsWith('#') ? hex : '#0052ff'}" class="color-picker-input" style="width: 38px; height: 38px; border: none; border-radius: var(--radius-sm); cursor: pointer;" title="Chọn màu sắc Hex">
        
        <input type="text" class="form-control color-name-input" placeholder="Tên màu sắc (Ví dụ: Xanh Dương)" value="${name}" style="flex: 1; min-width: 160px;" required>
        
        <input type="number" class="form-control color-extra-input" placeholder="Cộng thêm tiền (+VNĐ)" value="${extra}" style="width: 140px;">
        
        <button type="button" class="btn-secondary" style="color: #ef4444; border-color: #fca5a5; padding: 0.5rem 0.7rem; background: #ffffff;" onclick="this.closest('.admin-color-row-item').remove()">
          <i class="fa-solid fa-trash"></i> Xóa
        </button>
      </div>

      <div style="display: flex; gap: 0.8rem; align-items: center; background: #ffffff; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px dashed var(--border-color); margin-top: 0.2rem;">
        <div style="flex: 1; display: flex; gap: 0.5rem; flex-direction: column;">
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--accent-gold-dark);">
            🖼️ Ảnh tương ứng khi Khách chọn màu này:
          </label>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input type="file" class="form-control color-file-input" accept="image/*" style="padding: 0.35rem; font-size: 0.8rem; flex: 1;">
            <input type="text" class="form-control color-imgurl-input" placeholder="Dán link ảnh hoặc để trống..." value="${image}" style="flex: 1.5; font-size: 0.85rem;">
          </div>
        </div>

        <div style="width: 50px; height: 65px; border-radius: var(--radius-sm); overflow: hidden; background: #0f172a; border: 1px solid var(--border-color); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${image}" class="color-row-preview-img" style="width: 100%; height: 100%; object-fit: cover; object-position: bottom center; display: ${image ? 'block' : 'none'};" onerror="this.style.display='none'">
          <i class="fa-solid fa-image color-row-placeholder-icon" style="color: var(--text-dim); display: ${image ? 'none' : 'block'}; font-size: 0.9rem;"></i>
        </div>
      </div>
    `;

    const fileInput = div.querySelector('.color-file-input');
    const urlInput = div.querySelector('.color-imgurl-input');
    const previewImg = div.querySelector('.color-row-preview-img');
    const placeholderIcon = div.querySelector('.color-row-placeholder-icon');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64Data = evt.target.result;
          urlInput.value = base64Data;
          previewImg.src = base64Data;
          previewImg.style.display = 'block';
          if (placeholderIcon) placeholderIcon.style.display = 'none';
          this.showToast('Đã tải ảnh màu từ máy tính thành công!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    urlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        previewImg.src = val;
        previewImg.style.display = 'block';
        if (placeholderIcon) placeholderIcon.style.display = 'none';
      } else {
        previewImg.style.display = 'none';
        if (placeholderIcon) placeholderIcon.style.display = 'block';
      }
    });

    container.appendChild(div);
  }

  addAdminColorRow() {
    this.addAdminColorRowUI("", "#0052ff", 0, "");
  }

  // --- ADMIN CMS: SINGLE SIZE & HEIGHT CUSTOM MANAGER ---
  renderAdminSizeRows(sizes = []) {
    const container = document.getElementById('admin-size-rows-container');
    if (!container) return;
    container.innerHTML = '';

    if (!sizes || sizes.length === 0) {
      sizes = [
        { name: "Cao 22.5cm", priceOverride: 550000 },
        { name: "Cao 30cm", priceOverride: 700000 },
        { name: "Cao 45cm", priceOverride: 850000 }
      ];
    }

    sizes.forEach((s) => {
      const sizeVal = s.name || s.scale || "Cao 22.5cm";
      const p = s.priceOverride || 550000;
      this.addAdminSizeRowUI(sizeVal, p);
    });
  }

  addAdminSizeRowUI(name = "", price = 550000) {
    const container = document.getElementById('admin-size-rows-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'admin-size-row-item';
    div.innerHTML = `
      <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
        <input type="text" class="form-control size-name-input" placeholder="Kích thước / Chiều cao (Ví dụ: Cao 22.5cm)" value="${name}" style="flex: 1; min-width: 200px;" required>
        
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-gold-dark);">Giá tiền (VNĐ):</span>
          <input type="text" class="form-control size-price-input" placeholder="550.000" value="${this.formatPriceInput(price)}" style="width: 140px;" required>
        </div>
        
        <button type="button" class="btn-secondary" style="color: #ef4444; border-color: #fca5a5; padding: 0.5rem 0.7rem; background: #ffffff;" onclick="this.closest('.admin-size-row-item').remove()">
          <i class="fa-solid fa-trash"></i> Xóa
        </button>
      </div>
    `;

    const priceInput = div.querySelector('.size-price-input');
    priceInput.addEventListener('input', (e) => {
      e.target.value = this.formatPriceInput(e.target.value);
    });

    container.appendChild(div);
  }

  addAdminSizeRow() {
    this.addAdminSizeRowUI("", 550000);
  }

  renderAdminProductTable() {
    const tbody = document.getElementById('admin-product-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const countEl = document.getElementById('admin-product-count');
    if (countEl) countEl.innerText = this.products.length;

    this.products.forEach(p => {
      const catObj = this.categories.find(c => c.id === p.category);
      const catName = catObj ? catObj.name : p.category;

      let minP = p.price;
      let maxP = p.price;

      if (p.sizes && p.sizes.length > 0) {
        const sizePrices = p.sizes.map(s => s.priceOverride ? s.priceOverride : (p.price * (s.mult || 1.0)));
        minP = Math.min(...sizePrices);
        maxP = Math.max(...sizePrices);
      }

      const displayPriceText = (minP === maxP) 
        ? this.formatMoney(minP) 
        : `${this.formatMoney(minP)} - ${this.formatMoney(maxP)}`;

      const mainImgSrc = (p.images && p.images.length > 0) ? p.images[0] : p.image;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${mainImgSrc}" class="admin-img-thumb" alt="${p.title}" onerror="this.src='assets/images/dragon.png'"></td>
        <td><strong>${p.title}</strong></td>
        <td><span class="category-tag" style="position: static;">${catName}</span></td>
        <td style="color: var(--accent-gold-dark); font-weight: 700;">${displayPriceText}</td>
        <td style="color: #0284c7; font-weight: 700;">${this.formatMoney(p.deposit || 200000)}</td>
        <td>
          <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="app.editProduct('${p.id}')">
            <i class="fa-solid fa-pen"></i> Sửa
          </button>
          <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; color: #ef4444; border-color: #fca5a5;" onclick="app.deleteProduct('${p.id}')">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  editProduct(id) {
    const p = this.products.find(item => item.id === id);
    if (!p) return;

    document.getElementById('edit-product-id').value = p.id;
    document.getElementById('p-title').value = p.title;
    
    this.renderCategorySelectOptions();
    document.getElementById('p-category').value = p.category;
    
    const depositInput = document.getElementById('p-deposit');
    if (depositInput) depositInput.value = this.formatPriceInput(p.deposit || 200000);

    document.getElementById('p-desc').value = p.description;

    // HIỂN THỊ CÁC ẢNH MÔ HÌNH TRONG BỘ GALLERY
    const existingImages = p.images && p.images.length > 0 ? p.images : [p.image];
    this.renderAdminGalleryImages(existingImages);

    this.renderAdminColorRows(p.colors || []);
    this.renderAdminSizeRows(p.sizes || []);

    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    const addTabBtn = document.querySelector('[data-tab="tab-add-product"]');
    if (addTabBtn) addTabBtn.classList.add('active');

    if (document.getElementById('tab-products')) document.getElementById('tab-products').style.display = 'none';
    if (document.getElementById('tab-categories')) document.getElementById('tab-categories').style.display = 'none';
    if (document.getElementById('tab-webhooks')) document.getElementById('tab-webhooks').style.display = 'none';
    if (document.getElementById('tab-add-product')) document.getElementById('tab-add-product').style.display = 'block';
  }

  deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    this.products = this.products.filter(item => item.id !== id);
    this.saveStorage('3d_store_products', this.products);
    this.renderAdminProductTable();
    if (document.getElementById('products-grid')) this.renderCatalog();
    this.showToast('Đã xóa sản phẩm thành công!', 'success');
  }

  saveProductFromForm(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-product-id').value;
    const title = document.getElementById('p-title').value.trim();
    const category = document.getElementById('p-category').value;

    const rawDepositStr = document.getElementById('p-deposit') ? document.getElementById('p-deposit').value : '200000';
    const deposit = this.parsePriceInput(rawDepositStr) || 200000;
    const desc = document.getElementById('p-desc').value.trim();

    // BỘ NHIỀU ẢNH HÌNH MÔ HÌNH (MULTIPLE GALLERY IMAGES)
    const galleryInputs = document.querySelectorAll('#admin-gallery-images-container .gallery-img-url-input');
    const imagesArray = [];

    galleryInputs.forEach(inp => {
      const val = inp.value.trim();
      if (val) imagesArray.push(val);
    });

    if (imagesArray.length === 0) {
      imagesArray.push("assets/images/dragon.png");
    }

    const mainImage = imagesArray[0];

    // MÀU SẮC
    const colorItems = document.querySelectorAll('#admin-color-rows-container .admin-color-row-item');
    const colorsArray = [];

    colorItems.forEach(row => {
      const name = row.querySelector('.color-name-input').value.trim();
      const hex = row.querySelector('.color-picker-input').value;
      const extra = parseInt(row.querySelector('.color-extra-input').value, 10) || 0;
      const imgVal = row.querySelector('.color-imgurl-input').value.trim();

      if (name) {
        colorsArray.push({
          name: name,
          hex: hex,
          extra: extra,
          image: imgVal || mainImage
        });
      }
    });

    if (colorsArray.length === 0) {
      colorsArray.push({ name: "Mặc định", hex: "#0052ff", extra: 0, image: mainImage });
    }

    // KÍCH THƯỚC / CHIỀU CAO (ĐƠN - BAO GỒM GIÁ TIỀN CHO TỪNG SIZE)
    const sizeItems = document.querySelectorAll('#admin-size-rows-container .admin-size-row-item');
    const sizesArray = [];

    sizeItems.forEach(row => {
      const sName = row.querySelector('.size-name-input').value.trim();
      const sPrice = this.parsePriceInput(row.querySelector('.size-price-input').value) || 550000;

      if (sName) {
        sizesArray.push({
          name: sName,
          scale: sName,
          mult: 1.0,
          priceOverride: sPrice
        });
      }
    });

    if (sizesArray.length === 0) {
      sizesArray.push({ name: "Tiêu chuẩn", scale: "Tiêu chuẩn", mult: 1.0, priceOverride: 550000 });
    }

    const price = sizesArray[0].priceOverride || 550000;

    if (!title || price <= 0 || !mainImage) {
      this.showToast('Vui lòng thêm ít nhất 1 Ảnh cho sản phẩm!', 'error');
      return;
    }

    if (editId) {
      const index = this.products.findIndex(p => p.id === editId);
      if (index > -1) {
        this.products[index].title = title;
        this.products[index].category = category;
        this.products[index].price = price;
        this.products[index].deposit = deposit;
        this.products[index].image = mainImage;
        this.products[index].images = imagesArray;
        this.products[index].description = desc;
        this.products[index].colors = colorsArray;
        this.products[index].sizes = sizesArray;
      }
    } else {
      const newProduct = {
        id: 'p_' + Date.now(),
        title,
        category,
        price,
        deposit,
        image: mainImage,
        images: imagesArray,
        description: desc,
        colors: colorsArray,
        sizes: sizesArray
      };
      this.products.unshift(newProduct);
    }

    // LƯU DANH SÁCH SẢN PHẨM SỬA VÀO LOCAL STORAGE
    this.saveStorage('3d_store_products', this.products);

    document.getElementById('product-crud-form').reset();
    document.getElementById('edit-product-id').value = '';
    this.renderAdminGalleryImages([]);
    this.renderAdminColorRows([]);
    this.renderAdminSizeRows([]);

    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    const prodTabBtn = document.querySelector('[data-tab="tab-products"]');
    if (prodTabBtn) prodTabBtn.classList.add('active');

    if (document.getElementById('tab-add-product')) document.getElementById('tab-add-product').style.display = 'none';
    if (document.getElementById('tab-products')) document.getElementById('tab-products').style.display = 'block';

    this.renderAdminProductTable();
    if (document.getElementById('products-grid')) this.renderCatalog();
    this.showToast('Lưu chỉnh sửa sản phẩm thành công!', 'success');
  }

  loadAdminSettings() {
    const tEl = document.getElementById('setting-tg-token');
    const cEl = document.getElementById('setting-tg-chatid');
    const sEl = document.getElementById('setting-sheet-url');
    const accEl = document.getElementById('setting-admin-account');
    const passEl = document.getElementById('setting-admin-password');

    if (tEl) tEl.value = this.settings.tgToken || '8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY';
    if (cEl) cEl.value = this.settings.tgChatId || '7744946591, 7607846055';
    if (sEl) sEl.value = this.settings.sheetUrl || 'https://script.google.com/macros/s/AKfycbxZg6wWKe_yuV9UgZv2dBquCLNPYPyTqxi0urqcquf9lYdUTNqE0DAN9N8y9g3fXJEj/exec';
    if (accEl) accEl.value = this.settings.adminAccount || 'admin';
    if (passEl) passEl.value = this.settings.adminPassword || '123456';
  }

  saveAdminSettings() {
    const tEl = document.getElementById('setting-tg-token');
    const cEl = document.getElementById('setting-tg-chatid');
    const sEl = document.getElementById('setting-sheet-url');
    const accEl = document.getElementById('setting-admin-account');
    const passEl = document.getElementById('setting-admin-password');

    if (tEl) this.settings.tgToken = tEl.value.trim();
    if (cEl) this.settings.tgChatId = cEl.value.trim();
    if (sEl) this.settings.sheetUrl = sEl.value.trim();
    if (accEl && accEl.value.trim()) this.settings.adminAccount = accEl.value.trim();
    if (passEl && passEl.value.trim()) this.settings.adminPassword = passEl.value.trim();

    this.saveStorage('3d_store_settings', this.settings);
    this.showToast('Đã lưu cài đặt Tài Khoản Admin & Webhooks!', 'success');
  }

  async testWebhookNotification() {
    const token = (document.getElementById('setting-tg-token') ? document.getElementById('setting-tg-token').value : this.settings.tgToken).trim();
    const chatIdStr = (document.getElementById('setting-tg-chatid') ? document.getElementById('setting-tg-chatid').value : this.settings.tgChatId).trim();

    if (!token || !chatIdStr) {
      this.showToast('Vui lòng nhập Telegram Token và Chat ID!', 'error');
      return;
    }

    const chatIds = chatIdStr.split(',').map(id => id.trim());

    for (let chatId of chatIds) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '👑 <b>[TEST TMV IN3D]</b> Kết nối Telegram Bot thông báo đơn hàng thành công!',
            parse_mode: 'HTML'
          })
        });
        const data = await res.json();
        if (data.ok) {
          this.showToast(`Gửi tin nhắn thử nghiệm tới ChatID ${chatId} thành công!`, 'success');
        } else {
          this.showToast(`Lỗi Telegram (${chatId}): ${data.description}`, 'error');
        }
      } catch (e) {
        this.showToast(`Không thể gửi tới Telegram ChatID ${chatId}`, 'error');
      }
    }
  }

  resetDemoData() {
    if (!confirm('Khôi phục danh sách sản phẩm & danh mục về mẫu ban đầu?')) return;
    this.products = [...DEFAULT_PRODUCTS];
    this.categories = [...DEFAULT_CATEGORIES];
    this.saveStorage('3d_store_products', this.products);
    this.saveStorage('3d_store_categories', this.categories);
    this.renderCategoryChips();
    this.renderCategorySelectOptions();
    this.renderCategoryAdminList();
    this.renderAdminProductTable();
    if (document.getElementById('products-grid')) this.renderCatalog();
    this.showToast('Đã khôi phục dữ liệu mẫu!', 'success');
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
    if (modalId === 'deposit-payment-modal' && this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  bindCommonEvents() {
    document.addEventListener('keydown', (e) => {
      const lb = document.getElementById('image-lightbox-modal');
      if (lb && lb.classList.contains('active')) {
        if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
        if (e.key === 'ArrowRight') this.navigateLightbox(1);
        if (e.key === 'Escape') this.closeLightbox();
      }
    });

    const cartBtn = document.getElementById('cart-toggle-btn');
    if (cartBtn) cartBtn.onclick = () => this.openCartDrawer();

    const cartClose = document.getElementById('cart-drawer-close');
    if (cartClose) cartClose.onclick = () => this.closeModal('cart-drawer');

    const depositInput = document.getElementById('p-deposit');
    if (depositInput) {
      depositInput.addEventListener('input', (e) => {
        const formatted = this.formatPriceInput(e.target.value);
        e.target.value = formatted;
      });
    }

    // EVENT LISTENER TẢI NHIỀU ẢNH SẢN PHẨM TỪ MÁY TÍNH
    const galleryFileInput = document.getElementById('p-gallery-file-input');
    if (galleryFileInput) {
      galleryFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files && files.length > 0) {
          let loadedCount = 0;
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const base64Data = evt.target.result;
              this.addGalleryCardUI(base64Data, false);
              loadedCount++;
              if (loadedCount === files.length) {
                this.showToast(`Đã tải lên ${loadedCount} ảnh từ máy tính!`, 'success');
              }
            };
            reader.readAsDataURL(file);
          });
          e.target.value = '';
        }
      });
    }

    const addCatForm = document.getElementById('add-category-form');
    if (addCatForm) {
      addCatForm.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('new-cat-name');
        if (input && input.value.trim()) {
          this.addCategory(input.value.trim());
          input.value = '';
        }
      };
    }

    document.querySelectorAll('.modal-overlay, .cart-drawer').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal(overlay.id);
      });
    });

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.onsubmit = (e) => this.handleCheckout(e);

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tabId = btn.dataset.tab;
        if (document.getElementById('tab-products')) document.getElementById('tab-products').style.display = tabId === 'tab-products' ? 'block' : 'none';
        if (document.getElementById('tab-add-product')) document.getElementById('tab-add-product').style.display = tabId === 'tab-add-product' ? 'block' : 'none';
        if (document.getElementById('tab-categories')) document.getElementById('tab-categories').style.display = tabId === 'tab-categories' ? 'block' : 'none';
        if (document.getElementById('tab-webhooks')) document.getElementById('tab-webhooks').style.display = tabId === 'tab-webhooks' ? 'block' : 'none';
      };
    });

    const crudForm = document.getElementById('product-crud-form');
    if (crudForm) crudForm.onsubmit = (e) => this.saveProductFromForm(e);

    const cancelEdit = document.getElementById('cancel-edit-btn');
    if (cancelEdit) {
      cancelEdit.onclick = () => {
        crudForm.reset();
        document.getElementById('edit-product-id').value = '';
        this.renderAdminGalleryImages([]);
        this.renderAdminColorRows([]);
        this.renderAdminSizeRows([]);
        const prodTab = document.querySelector('[data-tab="tab-products"]');
        if (prodTab) prodTab.click();
      };
    }

    const resetBtn = document.getElementById('reset-demo-btn');
    if (resetBtn) resetBtn.onclick = () => this.resetDemoData();

    const saveSet = document.getElementById('save-settings-btn');
    if (saveSet) saveSet.onclick = () => this.saveAdminSettings();

    const testWeb = document.getElementById('test-webhook-btn');
    if (testWeb) testWeb.onclick = () => this.testWebhookNotification();
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
