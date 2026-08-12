/**
 * TMV IN3D Store - Blogspot Core Engine
 * Powered by Google Blogger JSON Feed & Google Apps Script
 * Spreadsheet ID: 1NmZ3Ui1LIuPTQbiPRsqBVpsDgKJCMWncSivCtkVKaD4
 */

class TMV3DBlogspotStore {
  constructor() {
    this.scriptUrl = "https://script.google.com/macros/s/AKfycbziyxNEuLR_ncZKC1ACW3QZBLr4wyTQMaTnQhvaWdJonQPLb78jkk8itPCri2wXk13k/exec";
    this.tgToken = "8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY";
    this.tgChatIds = ["7744946591", "7607846055"];
    
    this.products = [];
    this.cart = this.loadStorage('3d_store_cart') || [];
    this.orders = this.loadStorage('3d_store_orders') || [];
    this.activeCategory = 'ALL';
    this.currentTransferCode = null;
    this.pollingTimer = null;

    this.init();
  }

  init() {
    this.loadGuestInfo();
    this.updateCartBadge();
    this.bindEvents();

    // Kiểm tra nếu đang xem bài viết chi tiết riêng lẻ trên Blogspot
    const isSinglePost = document.body.classList.contains('item-view') || window.location.pathname.includes('/20') || window.location.pathname.includes('/p/');
    
    // Tải bài viết từ Blogger JSON Feed
    this.fetchBloggerPosts(isSinglePost);
  }

  // 1. TẢI DỮ LIỆU SẢN PHẨM TỪ BLOGGER JSON FEED API
  async fetchBloggerPosts(isSinglePost = false) {
    try {
      const feedUrl = `/feeds/posts/default?alt=json&max-results=500&${Date.now()}`;
      const response = await fetch(feedUrl);
      if (!response.ok) throw new Error('Không thể tải feed bài viết');
      const data = await response.json();

      const entries = data.feed?.entry || [];
      this.products = entries.map((entry, index) => this.parsePostToProduct(entry, index));

      // Dựng danh mục từ các Nhãn (Labels) của Blogspot
      this.renderCategories();

      // Render danh sách sản phẩm ngoài trang chủ
      const catalogContainer = document.getElementById('products-grid');
      if (catalogContainer) {
        this.renderProducts();
      }

      // Render bài viết nổi bật (Hero)
      const heroContainer = document.getElementById('hero-featured');
      if (heroContainer && this.products.length > 0) {
        this.renderHeroProduct(this.products[0]);
      }

      // Nếu đang mở trang bài viết đơn lẻ
      if (isSinglePost) {
        this.setupSinglePostView();
      }

    } catch (error) {
      console.warn('Fallback: Lấy dữ liệu sản phẩm từ Apps Script', error);
      this.fetchProductsFromAppsScript();
    }
  }

  // 2. PHÂN TÍCH BÀI VIẾT BLOGSPOT THÀNH DỮ LIỆU SẢN PHẨM
  parsePostToProduct(entry, index) {
    const title = entry.title?.$t || 'Sản phẩm 3D';
    const postUrl = entry.link?.find(l => l.rel === 'alternate')?.href || '#';
    const content = entry.content?.$t || entry.summary?.$t || '';
    
    // Lấy nhãn (Categories)
    const labels = (entry.category || []).map(c => c.term);
    const category = labels[0] || 'Mô Hình 3D';

    // Rút trích ảnh đại diện
    let image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    if (entry.media$thumbnail) {
      image = entry.media$thumbnail.url.replace('/s72-c/', '/s800/');
    } else {
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }

    // Rút trích Giá bán & Tiền cọc từ thuộc tính data-* hoặc cú pháp văn bản
    let price = 350000;
    let deposit = 100000;

    const priceAttrMatch = content.match(/data-price=["'](\d+)["']/i);
    const depositAttrMatch = content.match(/data-deposit=["'](\d+)["']/i);

    if (priceAttrMatch) {
      price = parseInt(priceAttrMatch[1], 10);
    } else {
      const priceTextMatch = content.match(/(?:Giá|GIA|Price):\s*([\d\.,]+)\s*(?:đ|VND|k)?/i);
      if (priceTextMatch) {
        let rawPrice = priceTextMatch[1].replace(/[\.,]/g, '');
        if (parseInt(rawPrice, 10) < 1000) rawPrice = parseInt(rawPrice, 10) * 1000;
        price = parseInt(rawPrice, 10) || 350000;
      }
    }

    if (depositAttrMatch) {
      deposit = parseInt(depositAttrMatch[1], 10);
    } else {
      const depositTextMatch = content.match(/(?:Cọc|COC|Deposit):\s*([\d\.,]+)\s*(?:đ|VND|k)?/i);
      if (depositTextMatch) {
        let rawDep = depositTextMatch[1].replace(/[\.,]/g, '');
        if (parseInt(rawDep, 10) < 1000) rawDep = parseInt(rawDep, 10) * 1000;
        deposit = parseInt(rawDep, 10) || 100000;
      } else {
        deposit = Math.min(200000, Math.round(price * 0.3));
      }
    }

    return {
      id: `BP-${index + 1}`,
      title: title,
      category: category,
      price: price,
      deposit: deposit,
      image: image,
      url: postUrl,
      description: content,
      labels: labels
    };
  }

  // 3. TẢI DỰ PHÒNG TỪ GOOGLE APPS SCRIPT
  async fetchProductsFromAppsScript() {
    try {
      const res = await fetch(`${this.scriptUrl}?action=get_online_products`);
      const data = await res.json();
      if (data.status === 'success' && data.products?.length > 0) {
        this.products = data.products;
        this.renderCategories();
        this.renderProducts();
      }
    } catch (e) {
      console.error('Lỗi tải sản phẩm dự phòng:', e);
    }
  }

  // 4. HIỂN THỊ DANH MỤC LỌC SẢN PHẨM
  renderCategories() {
    const container = document.getElementById('category-chips');
    if (!container) return;

    const categories = ['ALL', ...new Set(this.products.map(p => p.category))];
    container.innerHTML = categories.map(cat => `
      <button class="chip-btn ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat === 'ALL' ? '🌟 Tất Cả Sản Phẩm' : `📦 ${cat}`}
      </button>
    `).join('');

    container.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeCategory = btn.dataset.cat;
        this.renderCategories();
        this.renderProducts();
      };
    });
  }

  // 5. HIỂN THỊ LƯỚI SẢN PHẨM KHỎI TRANG CHỦ
  renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = this.activeCategory === 'ALL' 
      ? this.products 
      : this.products.filter(p => p.category === this.activeCategory);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8;">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <p>Chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="product-card blogspot-anti-break">
        <div class="card-img-wrap">
          <img src="${p.image}" alt="${p.title}" loading="lazy" onclick="window.location.href='${p.url}'">
          <span class="badge-cat">${p.category}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title" onclick="window.location.href='${p.url}'">${p.title}</h3>
          <div class="price-row">
            <span class="price-val">${this.formatMoney(p.price)}</span>
            <span class="deposit-tag">Cọc: ${this.formatMoney(p.deposit)}</span>
          </div>
          <div class="card-actions">
            <a href="${p.url}" class="btn-secondary" style="flex: 1; text-align: center; text-decoration: none;">
              <i class="fa-solid fa-eye"></i> Xem Chi Tiết
            </a>
            <button class="btn-primary" onclick="tmvStore.addToCart('${p.id}')">
              <i class="fa-solid fa-cart-plus"></i> Đặt Hàng
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 6. HIỂN THỊ NỔI BẬT HERO PRODUCT
  renderHeroProduct(p) {
    const container = document.getElementById('hero-featured');
    if (!container || !p) return;

    container.innerHTML = `
      <div class="hero-card blogspot-anti-break">
        <div class="hero-img">
          <img src="${p.image}" alt="${p.title}">
        </div>
        <div class="hero-info">
          <span class="badge-hot">🔥 SẢN PHẨM NỔI BẬT</span>
          <h2>${p.title}</h2>
          <p class="hero-price">Giá: <strong>${this.formatMoney(p.price)}</strong> (Cọc trước: ${this.formatMoney(p.deposit)})</p>
          <div style="display: flex; gap: 0.8rem; margin-top: 1rem;">
            <button class="btn-primary" onclick="tmvStore.addToCart('${p.id}')">
              <i class="fa-solid fa-bolt"></i> MUA NGAY BÂY GIỜ
            </button>
            <a href="${p.url}" class="btn-secondary" style="text-decoration: none;">Xem Chi Tiết</a>
          </div>
        </div>
      </div>
    `;
  }

  // 7. XỬ LÝ KHI KHÁCH XEM CHI TIẾT 1 BÀI VIẾT BLOGSPOT
  setupSinglePostView() {
    const postBody = document.querySelector('.post-body, .entry-content, #post-body');
    if (!postBody) return;

    // Tìm thông tin sản phẩm tương ứng với bài hiện tại
    const currentUrl = window.location.href.split('?')[0];
    let product = this.products.find(p => p.url.split('?')[0] === currentUrl);

    if (!product) {
      const pageTitle = document.title.replace(/ - TMV IN3D.*$/, '').trim();
      product = {
        id: 'BP-SINGLE',
        title: pageTitle,
        price: 350000,
        deposit: 100000,
        image: document.querySelector('.post-body img')?.src || ''
      };
    }

    // Chèn Thanh Đặt Hàng Nhanh vào cuối bài viết
    const buyBar = document.createElement('div');
    buyBar.className = 'blogspot-anti-break buy-bar-widget';
    buyBar.style.cssText = `
      background: linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95));
      border: 2px solid #eab308;
      border-radius: 1rem;
      padding: 1.2rem;
      margin: 2rem 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    `;

    buyBar.innerHTML = `
      <div>
        <h3 style="color: #f8fafc; margin: 0 0 0.4rem 0; font-size: 1.2rem;">🛒 ĐẶT HÀNG IN 3D SẢN PHẨM NÀY</h3>
        <p style="color: #94a3b8; margin: 0; font-size: 0.95rem;">
          Giá niêm yết: <strong style="color: #fbbf24; font-size: 1.1rem;">${this.formatMoney(product.price)}</strong> | 
          Cọc trước: <strong style="color: #38bdf8;">${this.formatMoney(product.deposit)}</strong>
        </p>
      </div>
      <div style="display: flex; gap: 0.8rem;">
        <button class="btn-primary" onclick="tmvStore.buyDirect('${product.id}')" style="padding: 0.8rem 1.5rem; font-size: 1rem;">
          <i class="fa-solid fa-paper-plane"></i> ĐẶT HÀNG & THANH TOÁN
        </button>
      </div>
    `;

    postBody.appendChild(buyBar);
  }

  // 8. QUẢN LÝ GIỎ HÀNG (ADD, REMOVE, BUY DIRECT)
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.cart[existingIndex].qty += 1;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        unitPrice: product.price,
        deposit: product.deposit,
        qty: 1,
        color: 'Tiêu chuẩn',
        size: 'Mặc định'
      });
    }

    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();
    this.showToast(`Đã thêm "${product.title}" vào giỏ hàng!`, 'success');
    this.openModal('cart-drawer');
    this.renderCartItems();
  }

  buyDirect(productId) {
    this.addToCart(productId);
  }

  updateCartBadge() {
    const totalQty = this.cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cart-count-badge, .cart-badge').forEach(badge => {
      badge.innerText = totalQty;
      badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
    });
  }

  renderCartItems() {
    const container = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('cart-total-price');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #94a3b8;">
          <i class="fa-solid fa-cart-shopping" style="font-size: 2.5rem; margin-bottom: 0.8rem;"></i>
          <p>Giỏ hàng của bạn đang trống.</p>
        </div>
      `;
      if (totalDisplay) totalDisplay.innerText = '0đ';
      return;
    }

    let grandTotal = 0;
    container.innerHTML = this.cart.map((item, index) => {
      const lineTotal = item.unitPrice * item.qty;
      grandTotal += lineTotal;
      return `
        <div class="cart-item blogspot-anti-break" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div>
            <h4 style="margin: 0; color: #f8fafc; font-size: 0.95rem;">${item.title}</h4>
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.2rem;">
              ${this.formatMoney(item.unitPrice)} x ${item.qty} = <strong style="color: #fbbf24;">${this.formatMoney(lineTotal)}</strong>
            </div>
          </div>
          <button onclick="tmvStore.removeCartItem(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.4rem;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');

    if (totalDisplay) totalDisplay.innerText = this.formatMoney(grandTotal);
  }

  removeCartItem(index) {
    this.cart.splice(index, 1);
    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();
    this.renderCartItems();
  }

  // 9. THỰC THI ĐẶT HÀNG TỨC THÌ (INSTANT CHECKOUT 0MS)
  async handleCheckout(e) {
    if (e) e.preventDefault();

    if (this.cart.length === 0) {
      this.showToast('Giỏ hàng trống! Hãy chọn sản phẩm trước.', 'error');
      return;
    }

    const nameEl = document.getElementById('cust-name');
    const phoneEl = document.getElementById('cust-phone');
    const addressEl = document.getElementById('cust-address');
    const noteEl = document.getElementById('cust-note');

    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';
    const note = noteEl ? noteEl.value.trim() : '';

    if (!name || !phone || !address) {
      this.showToast('⚠️ Vui lòng điền đầy đủ Tên, SĐT và Địa chỉ giao hàng.', 'error');
      if (!name && nameEl) nameEl.focus();
      else if (!phone && phoneEl) phoneEl.focus();
      else if (addressEl) addressEl.focus();
      return;
    }

    // Lưu Cookie & LocalStorage
    const guestData = { name, phone, address };
    this.setCookie('tmv_guest_info', guestData, 60);
    this.saveStorage('tmv_guest_info', guestData);

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const transferCode = `TMV3D ${orderNum}`;
    this.currentTransferCode = transferCode;

    const grandTotal = this.cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
    let totalDeposit = 0;
    this.cart.forEach(item => {
      totalDeposit += (item.deposit || 100000) * item.qty;
    });
    totalDeposit = Math.min(totalDeposit, grandTotal);

    const depositText = this.formatMoney(totalDeposit);
    const remainingCod = Math.max(0, grandTotal - totalDeposit);

    const itemsSummaryText = this.cart.map(
      item => `• ${item.title} x${item.qty} = ${this.formatMoney(item.unitPrice * item.qty)}`
    ).join('\n');

    const orderData = {
      orderId: `TMV-${orderNum}`,
      name: name,
      customerName: name,
      customerEmail: `${phone}@khach.tmvin3d.com`,
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

    // 1. MỞ MODAL THANH TOÁN VIETQR NGAY LẬP TỨC (0ms)
    const depOrderId = document.getElementById('dep-order-id');
    const depTotalPrice = document.getElementById('dep-total-price');
    const depAmountDisplay = document.getElementById('dep-amount-display');
    const depTransferCode = document.getElementById('dep-transfer-code');
    const depQrImg = document.getElementById('dep-qr-img');

    if (depOrderId) depOrderId.innerText = `#TMV-${orderNum}`;
    if (depTotalPrice) depTotalPrice.innerText = this.formatMoney(grandTotal);
    if (depAmountDisplay) depAmountDisplay.innerText = depositText;
    if (depTransferCode) depTransferCode.innerText = transferCode;

    if (depQrImg) {
      const qrUrl = `https://img.vietqr.io/image/TIMO-9021186623244-qr_only.jpg?amount=${totalDeposit}&addInfo=${encodeURIComponent(transferCode)}&accountName=NGUYEN%20THI%20NHUNG`;
      depQrImg.src = qrUrl;
    }

    // Dọn giỏ hàng & đóng drawer
    this.cart = [];
    this.saveStorage('3d_store_cart', this.cart);
    this.updateCartBadge();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.reset();
    this.closeModal('cart-drawer');

    const depositModal = document.getElementById('deposit-payment-modal');
    if (depositModal) depositModal.classList.add('active');

    this.startPaymentStatusPolling(transferCode);
    this.showToast(`🎉 Đơn hàng #${orderNum} đã tạo! Vui lòng cọc ${depositText}.`, 'success');

    // 2. GỬI VỀ GOOGLE SHEETS & TELEGRAM TRONG BACKGROUND
    (async () => {
      try {
        await fetch(this.scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      } catch (err) {}

      // Gửi Telegram Bot
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

      for (let cid of this.tgChatIds) {
        try {
          fetch(`https://api.telegram.org/bot${this.tgToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: cid, text: tgMsg, parse_mode: 'HTML' })
          }).catch(() => {});
        } catch (e) {}
      }
    })();
  }

  // 10. POLLING THỜI GIAN THỰC KIỂM TRA TIỀN CỌC GMAIL TỪ GOOGLE APPS SCRIPT
  startPaymentStatusPolling(code) {
    if (this.pollingTimer) clearInterval(this.pollingTimer);

    const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    this.pollingTimer = setInterval(async () => {
      try {
        const res = await fetch(`${this.scriptUrl}?action=check_payment_status&code=${cleanCode}`);
        const data = await res.json();

        if (data.status === 'paid') {
          clearInterval(this.pollingTimer);
          
          const statusTextEl = document.getElementById('payment-status-text');
          if (statusTextEl) {
            statusTextEl.innerHTML = `<span style="color: #22c55e;"><i class="fa-solid fa-circle-check"></i> ĐÃ NHẬN CỌC THÀNH CÔNG!</span>`;
          }

          this.showToast('🎉 Ngân hàng Timo đã nhận tiền cọc! Đơn hàng đang được xử lý.', 'success');
        }
      } catch (e) {}
    }, 4000);
  }

  // UTILITIES & EVENTS
  bindEvents() {
    document.addEventListener('click', (e) => {
      const modalOpenBtn = e.target.closest('[data-open-modal]');
      if (modalOpenBtn) {
        this.openModal(modalOpenBtn.dataset.openModal);
        if (modalOpenBtn.dataset.openModal === 'cart-drawer') this.renderCartItems();
      }

      const modalCloseBtn = e.target.closest('[data-close-modal]');
      if (modalCloseBtn) {
        this.closeModal(modalCloseBtn.dataset.closeModal);
      }
    });

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.onsubmit = (e) => this.handleCheckout(e);
    }
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
      submitBtn.onclick = (e) => {
        e.preventDefault();
        this.handleCheckout(e);
      };
    }
  }

  loadGuestInfo() {
    const saved = this.loadStorage('tmv_guest_info') || this.getCookie('tmv_guest_info');
    if (saved) {
      const nameEl = document.getElementById('cust-name');
      const phoneEl = document.getElementById('cust-phone');
      const addressEl = document.getElementById('cust-address');

      if (nameEl && saved.name) nameEl.value = saved.name;
      if (phoneEl && saved.phone) phoneEl.value = saved.phone;
      if (addressEl && saved.address) addressEl.value = saved.address;
    }
  }

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  formatMoney(num) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  }

  saveStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  loadStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }

  setCookie(cname, cvalue, exdays) {
    try {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      const val = typeof cvalue === 'object' ? JSON.stringify(cvalue) : cvalue;
      document.cookie = cname + "=" + encodeURIComponent(val) + ";" + expires + ";path=/";
    } catch (e) {}
  }

  getCookie(cname) {
    try {
      const name = cname + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
          const val = c.substring(name.length, c.length);
          try { return JSON.parse(val); } catch (err) { return val; }
        }
      }
    } catch (e) {}
    return "";
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `blogspot-anti-break toast-item ${type}`;
    toast.style.cssText = `
      background: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#1e293b'};
      color: #fff;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 0.9rem;
      border-left: 4px solid ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
  }
}

// Khởi tạo cửa hàng Blogspot Store
window.addEventListener('DOMContentLoaded', () => {
  window.tmvStore = new TMV3DBlogspotStore();
});
