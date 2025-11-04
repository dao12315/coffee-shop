/* =========================
 * Chumtea Admin – app.js (FULL)
 * ========================= */
function apiFetch(url, init = {}) {
  return fetch(url, {
    credentials: 'same-origin',                    // ⬅️ mang cookie phiên
    headers: { 'Accept': 'application/json', ...(init.headers || {}) },
    ...init
  });
}

/* ---- ChartStore (giữ tham chiếu Chart để destroy trước khi render lại) ---- */
window.ChartStore = window.ChartStore || {
  revenue: null,
  products: null,
  monthly: null,
  category: null
};
function productImageUrl(p) {
  if (p?.image_url) return p.image_url;
  if (p?.image)     return `/storage/${p.image}`;
  return '/images/placeholder.png';
}


/* ---- Helpers dùng chung ---- */
window.Helpers = {
  // Định dạng tiền VNĐ
  formatCurrency(n) {
    const num = typeof n === 'string' ? parseFloat(n) : (n ?? 0);
    return num.toLocaleString('vi-VN', { minimumFractionDigits: 0 }) + 'đ';
  },
  // Ngày & Giờ
  formatDate(d) {
    try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return '-'; }
  },
  formatDateTime(d) {
    try { return new Date(d).toLocaleString('vi-VN'); } catch { return '-'; }
  },
  // Badge trạng thái
  statusBadge(status) {
    const map = {
      pending:   { cls: 'status-badge status-pending',    text: 'Chờ xử lý' },
      processing:{ cls: 'status-badge status-processing', text: 'Đang xử lý' },
      completed: { cls: 'status-badge status-completed',  text: 'Hoàn thành' },
      cancelled: { cls: 'status-badge status-cancelled',  text: 'Đã hủy' },
      paid:      { cls: 'status-badge status-completed',  text: 'Đã thanh toán' },
      unpaid:    { cls: 'status-badge status-pending',    text: 'Chưa thanh toán' },
      active:    { cls: 'status-badge status-completed',  text: 'Đang bán' },
      inactive:  { cls: 'status-badge status-cancelled',  text: 'Ẩn' },
      true:      { cls: 'status-badge status-completed',  text: 'Đang bán' },
      false:     { cls: 'status-badge status-cancelled',  text: 'Ẩn' },
    };
    const m = map[String(status)] || { cls: 'status-badge', text: status ?? '-' };
    return `<span class="${m.cls}">${m.text}</span>`;
  },
  // Hàng trạng thái bảng
  spinnerRow(colspan = 6, msg = 'Đang tải...') {
    return `<tr><td colspan="${colspan}" class="py-8 text-center text-gray-500">${msg}</td></tr>`;
  },
  emptyRow(colspan = 6, msg = 'Không có dữ liệu') {
    return `<tr><td colspan="${colspan}" class="py-8 text-center text-gray-400">${msg}</td></tr>`;
  },
  errorRow(colspan = 6, msg = 'Lỗi tải dữ liệu') {
    return `<tr><td colspan="${colspan}" class="py-8 text-center text-red-600">${msg}</td></tr>`;
  },
  // Escape HTML
  escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;')
      .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  },
};

// (Chỉ cần nếu bạn post/put/delete lên route web.php – với api.php thường không cần)
function getCsrf() {
  const el = document.querySelector('meta[name="csrf-token"]');
  return el ? el.content : '';
}


function withCsrf(headers = {}) {
  const token = getCsrf();
  return {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
    ...headers
  };
}


/* ---- Mock Models (chỉ để Seed UI demo những phần chưa nối API) ---- */
class Product {
  constructor(id, name, price, category, description, stock = 100) {
    this.id = id; this.name = name; this.price = price;
    this.category = category; this.description = description;
    this.stock = stock; this.sold = Math.floor(Math.random() * 50);
  }
}
class Employee {
  constructor(id, name, email, phone, position, salary, status = 'active') {
    this.id = id; this.name = name; this.email = email; this.phone = phone;
    this.position = position; this.salary = salary; this.status = status;
    this.joinDate = new Date().toISOString().split('T')[0];
  }
}
class Order {
  constructor(id, customerName, items, total, status = 'pending') {
    this.id = id; this.customerName = customerName; this.items = items;
    this.total = total; this.status = status;
    this.createdAt = new Date(); this.updatedAt = new Date();
  }
}
class Invoice {
  constructor(id, orderId, customerName, total, status = 'unpaid') {
    this.id = id; this.orderId = orderId; this.customerName = customerName;
    this.total = total; this.status = status; this.createdAt = new Date();
    this.dueDate = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  }
}
class InventoryItem {
  constructor(productId, productName, currentStock, minStock, maxStock) {
    this.productId = productId; this.productName = productName;
    this.currentStock = currentStock; this.minStock = minStock; this.maxStock = maxStock;
    this.lastUpdated = new Date();
  }
  isLowStock() { return this.currentStock <= this.minStock; }
}

/* ---- DataSeeder demo (chưa nối API) ---- */
const DataSeeder = {
  products: [
 
  ],
  employees: [
    
  ],
  orders: [
    new Order(1, 'Nguyễn Văn A', [{name: 'Trà Ô Long', quantity: 2, price: 65000}], 130000, 'completed'),
    new Order(2, 'Trần Thị B', [{name: 'Cafe Espresso', quantity: 1, price: 50000}], 50000, 'processing'),
    new Order(3, 'Lê Văn C', [{name: 'Trà Sữa Matcha', quantity: 3, price: 70000}], 210000, 'pending'),
    new Order(4, 'Phạm Thị D', [{name: 'Cafe Sữa Đá', quantity: 2, price: 40000}], 80000, 'completed')
  ],
  invoices: [
    new Invoice(1, 1, 'Nguyễn Văn A', 130000, 'paid'),
    new Invoice(2, 2, 'Trần Thị B', 50000, 'unpaid'),
    new Invoice(3, 3, 'Lê Văn C', 210000, 'unpaid'),
    new Invoice(4, 4, 'Phạm Thị D', 80000, 'paid')
  ]
};

/* =========================
 * AdminController
 * ========================= */
class AdminController {
  static currentView = 'dashboard';
  static showDashboard(sourceEl) { /* ... */ }

  static async showProducts(sourceEl = null) {
    this.setActiveNav('products', sourceEl);
    document.getElementById('page-title').textContent = 'Quản lý Menu';
    await ProductController.renderProductsView();
  }

  static async loadReportData() {
    // Destroy chart cũ nếu có
    if (ChartStore.monthly)  { ChartStore.monthly.destroy();  ChartStore.monthly = null; }
    if (ChartStore.category) { ChartStore.category.destroy(); ChartStore.category = null; }

    try {
      // 1) Summary
      const s = await apiFetch('/api/reports/summary').then(r=>r.json());
      document.getElementById('stat-revenue').textContent   = Helpers.formatCurrency(s.revenue_this_month || 0);
      document.getElementById('stat-avg-order').textContent = Helpers.formatCurrency(s.avg_order_value || 0);
      // (Nếu chưa có công thức profit, có thể set = 0 hoặc ẩn phần tử #stat-profit)

      // 2) Monthly bar
      const m = await apiFetch('/api/reports/monthly').then(r=>r.json());
      const mctx = document.getElementById('monthly-revenue-chart')?.getContext('2d');
      if (mctx && window.Chart) {
        ChartStore.monthly = new Chart(mctx, {
          type: 'bar',
          data: { labels: m.labels || [], datasets: [{ label: 'Doanh thu (VNĐ)', data: m.data || [] }] },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // 3) Category pie
      const c = await apiFetch('/api/reports/category-share').then(r=>r.json());
      const cctx = document.getElementById('category-chart')?.getContext('2d');
      if (cctx && window.Chart) {
        ChartStore.category = new Chart(cctx, {
          type: 'pie',
          data: { labels: c.labels || [], datasets: [{ data: c.data || [] }] },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    } catch (e) {
      console.error(e);
      // tuỳ chọn: hiển thị thông báo lỗi
    }
  }

  static toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    sidebar?.classList.toggle('mobile-open');
  }

  static setActiveNav(view, sourceEl = null) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const el = sourceEl
      || document.querySelector(`.nav-item[data-nav="${view}"]`)
      || document.querySelector('.nav-item');
    if (el) el.classList.add('active');
    this.currentView = view;
  }

  static showDashboard(sourceEl) {
    this.setActiveNav('dashboard', sourceEl);
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Dashboard';

    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Doanh thu hôm nay</p>
                <p class="text-2xl font-bold text-green-600">2.450.000đ</p>
              </div>
              <div class="text-3xl">💰</div>
            </div>
            <div class="mt-2 text-sm text-green-600">↗ +12% so với hôm qua</div>
          </div>
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Đơn hàng hôm nay</p>
                <p class="text-2xl font-bold text-blue-600">47</p>
              </div>
              <div class="text-3xl">🛒</div>
            </div>
            <div class="mt-2 text-sm text-blue-600">↗ +8% so với hôm qua</div>
          </div>
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Sản phẩm bán chạy</p>
                <p class="text-2xl font-bold text-purple-600">Trà Sữa Matcha</p>
              </div>
              <div class="text-3xl">🍵</div>
            </div>
            <div class="mt-2 text-sm text-purple-600">25 ly đã bán</div>
          </div>
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Nhân viên online</p>
                <p class="text-2xl font-bold text-orange-600">8/12</p>
              </div>
              <div class="text-3xl">👥</div>
            </div>
            <div class="mt-2 text-sm text-orange-600">4 người đang nghỉ</div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="chart-container">
            <h3 class="text-lg font-semibold mb-4">Doanh thu 7 ngày qua</h3>
            <canvas id="revenue-chart" height="280" style="height:280px !important"></canvas>
          </div>
          <div class="chart-container">
            <h3 class="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
            <canvas id="products-chart" height="280" style="height:280px !important"></canvas>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="model-card">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold">Đơn hàng gần đây</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                ${DataSeeder.orders.slice(0, 5).map(order => `
                  <tr>
                    <td>#${order.id}</td>
                    <td>${Helpers.escapeHtml(order.customerName)}</td>
                    <td>${Helpers.formatCurrency(order.total)}</td>
                    <td>${Helpers.statusBadge(order.status)}</td>
                    <td>${Helpers.formatDateTime(order.createdAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    requestAnimationFrame(() => this.initCharts());
  }

  static showReports(sourceEl) {
  this.setActiveNav('reports', sourceEl);
  const title = document.getElementById('page-title');
  if (title) title.textContent = 'Phân tích & Báo cáo';

  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div class="slide-in">
      <div class="model-card mb-6">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Bộ lọc báo cáo</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm mb-2">Từ ngày</label>
              <input type="date" class="admin-input">
            </div>
            <div>
              <label class="block text-sm mb-2">Đến ngày</label>
              <input type="date" class="admin-input">
            </div>
            <div>
              <label class="block text-sm mb-2">Loại báo cáo</label>
              <select class="admin-select">
                <option>Doanh thu</option>
                <option>Sản phẩm</option>
                <option>Nhân viên</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="stat-card">
          <h4 class="font-semibold text-gray-800 mb-2">Doanh thu tháng này</h4>
          <p id="stat-revenue" class="text-3xl font-bold text-green-600">0đ</p>
          <p class="text-sm text-green-600 mt-1">↗ Dữ liệu thực từ DB</p>
        </div>
        <div class="stat-card">
          <h4 class="font-semibold text-gray-800 mb-2">Đơn hàng trung bình</h4>
          <p id="stat-avg-order" class="text-3xl font-bold text-purple-600">0đ</p>
          <p class="text-sm text-purple-600 mt-1">↗ Dữ liệu thực từ DB</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="chart-container">
          <h3 class="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
          <canvas id="monthly-revenue-chart" height="280" style="height:280px !important"></canvas>
        </div>
        <div class="chart-container">
          <h3 class="text-lg font-semibold mb-4">Phân tích danh mục</h3>
          <canvas id="category-chart" height="280" style="height:280px !important"></canvas>
        </div>
      </div>
    </div>
  `;

  // Vẽ từ API thật (không dùng mock cũ)
  setTimeout(() => this.loadReportData(), 50);
}


  static showInventory(sourceEl) {
    this.setActiveNav('inventory', sourceEl);
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Quản lý Kho';
    InventoryController.renderInventoryView();
  }

  static showEmployees(sourceEl) {
    this.setActiveNav('employees', sourceEl);
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Quản lý Nhân viên';
    EmployeeController.renderEmployeesView();
  }

  static showOrders(sourceEl) {
    this.setActiveNav('orders', sourceEl);
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Quản lý Đơn hàng';
    OrderController.renderOrdersView();
  }

  static showInvoices(sourceEl) {
    this.setActiveNav('invoices', sourceEl);
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Quản lý Hóa đơn';
    InvoiceController.renderInvoicesView();
  }

  static showInvoiceDetails(sourceEl) {
    this.setActiveNav('invoice-details', sourceEl);
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Chi tiết Hóa đơn';
    InvoiceController.renderInvoiceDetailsView();
  }

  static openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
  static closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

  static getStatusText(status) {
    const map = {
      pending: 'Chờ xử lý', processing: 'Đang xử lý',
      completed: 'Hoàn thành', cancelled: 'Đã hủy',
      paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán'
    };
    return map[status] || status;
  }

  /* ---- Chart.js ---- */
  static initCharts() {
    // Cleanup cũ
    if (ChartStore.revenue) { ChartStore.revenue.destroy(); ChartStore.revenue = null; }
    if (ChartStore.products) { ChartStore.products.destroy(); ChartStore.products = null; }

    // Revenue
    const revEl = document.getElementById('revenue-chart');
    if (revEl && window.Chart) {
      const ctx = revEl.getContext('2d');
      ChartStore.revenue = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['T2','T3','T4','T5','T6','T7','CN'],
          datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: [1200000,1900000,3000000,2500000,2200000,3200000,2800000],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16,185,129,0.1)',
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    // Products
    const prodEl = document.getElementById('products-chart');
    if (prodEl && window.Chart) {
      const ctx = prodEl.getContext('2d');
      ChartStore.products = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Trà Sữa Matcha','Cafe Espresso','Trà Ô Long','Cafe Sữa Đá'],
          datasets: [{ data: [25,20,18,15], backgroundColor: ['#10B981','#3B82F6','#8B5CF6','#F59E0B'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  static initReportCharts() {
    const monthlyCtx = document.getElementById('monthly-revenue-chart');
    if (monthlyCtx && window.Chart) {
      new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: ['T1','T2','T3','T4','T5','T6'],
          datasets: [{ label: 'Doanh thu (triệu VNĐ)', data: [35,42,38,45,41,45], backgroundColor: '#10B981' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    const categoryCtx = document.getElementById('category-chart');
    if (categoryCtx && window.Chart) {
      new Chart(categoryCtx, {
        type: 'pie',
        data: {
          labels: ['Trà','Cafe','Đặc biệt'],
          datasets: [{ data: [40,35,25], backgroundColor: ['#10B981','#3B82F6','#8B5CF6'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }



  static logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      alert('Đã đăng xuất thành công!');
    }
  }
}

/* =========================
 * ProductController (API thật)
 * ========================= */
 /* =========================
 * ProductController (API thật) – CLEAN
 * ========================= */
class ProductController {
  static products = [];
  static categories = [];

  // PUT tồn kho (JSON)
  static async apiUpdateStock(productId, payload) {
    const res = await apiFetch(`/api/inventory/${productId}`, {
      method: 'PUT',
      headers: withCsrf({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: 'Update stock failed' }));
    return res.json();
  }

  // Mở prompt cập nhật kho nhanh
  static async openUpdateStock(id) {
    const p = this.products.find(x => Number(x.id) === Number(id));
    if (!p) return;

    const cur = p.inventory_item?.current_stock ?? 0;
    const val = prompt(`Nhập tồn kho mới cho "${p.name}"`, cur);
    if (val === null) return;

    const newStock = parseInt(val, 10);
    if (Number.isNaN(newStock) || newStock < 0) {
      NotificationController.show('Giá trị tồn kho không hợp lệ', 'error');
      return;
    }

    try {
      const res = await apiFetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: withCsrf({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ current_stock: newStock }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.message || 'Cập nhật thất bại');
      }
      await this.renderProductsView();
      NotificationController.show('Cập nhật tồn kho thành công!');
    } catch (e) {
      console.error(e);
      NotificationController.show(e.message || 'Có lỗi khi cập nhật tồn kho', 'error');
    }
  }

  // Submit form kho → call API
  static async saveStock(e) {
    e.preventDefault();
    const pid = document.getElementById('stock-product-id').value;
    const payload = {
      current_stock: Number(document.getElementById('stock-current').value || 0),
      min_stock:     Number(document.getElementById('stock-min').value || 0),
      max_stock:     Number(document.getElementById('stock-max').value || 0),
    };

    try {
      await this.apiUpdateStock(pid, payload);
      AdminController.closeModal('stock-modal');
      NotificationController.show('Cập nhật tồn kho thành công!');
      await this.renderProductsView();
    } catch (err) {
      console.error(err);
      const msg = err?.message || Object.values(err?.errors || {})[0]?.[0] || 'Lỗi cập nhật kho';
      NotificationController.show(msg, 'error');
    }
  }

  // State form
  static formMode = 'create'; // create | edit
  static editingId = null;

  // Fetch list + categories
  static async fetchProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch(`/api/products${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('fetch products failed');
    const data = await res.json();
    this.products = Array.isArray(data) ? data : (data.data || []);
  }

  static async fetchCategories() {
    const res = await apiFetch('/api/categories');
    if (!res.ok) throw new Error('fetch categories failed');
    this.categories = await res.json();
  }

  // ==== ONLY FormData APIs (multipart) ====
  static async createProductFD(formData) {
    const res = await apiFetch('/api/products', {
      method: 'POST',
      headers: withCsrf(),  // KHÔNG đặt Content-Type
      body: formData
    });
    if (!res.ok) throw await res.json().catch(()=>({ message: 'Create failed' }));
    return res.json();
  }

  static async updateProductFD(id, formData) {
    formData.append('_method','PUT'); // spoof PUT
    const res = await apiFetch(`/api/products/${id}`, {
      method: 'POST',
      headers: withCsrf(),  // KHÔNG đặt Content-Type
      body: formData
    });
    if (!res.ok) throw await res.json().catch(()=>({ message: 'Update failed' }));
    return res.json();
  }

  // UI helpers
  static buildCategorySelectOptions(selectedId = null) {
    if (!Array.isArray(this.categories)) return '';
    return this.categories.map(c => {
      const sel = (selectedId && Number(selectedId) === Number(c.id)) ? 'selected' : '';
      return `<option value="${c.id}" ${sel}>${Helpers.escapeHtml(c.name)}</option>`;
    }).join('');
  }

  // View list
  static async renderProductsView() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-semibold">Danh sách sản phẩm</h3>
            <p class="text-gray-600">Quản lý thực đơn Chumtea</p>
          </div>
          <div class="flex gap-2">
            <input id="prod-search" class="admin-input w-60" placeholder="Tìm theo tên..."/>
            <button onclick="ProductController.openAddModal()" class="admin-btn">➕ Thêm sản phẩm</button>
          </div>
        </div>

        <div class="model-card">
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th class="w-16">ID</th>
                  <th class="min-w-64">Tên sản phẩm</th>
                  <th class="w-40">Giá</th>
                  <th class="w-48">Danh mục</th>
                  <th class="w-32">Tồn kho</th>
                  <th class="w-32">Trạng thái</th>
                  <th class="w-40">Thao tác</th>
                </tr>
              </thead>
              <tbody id="prod-tbody">
                ${Helpers.spinnerRow(7)}
              </tbody>
            </table>
          </div>
        </div>

        <div id="prod-paging" class="mt-4 flex items-center gap-2 justify-end"></div>
      </div>
    `;

    const tbody = document.getElementById('prod-tbody');
    try {
      await Promise.all([this.fetchProducts(), this.fetchCategories()]);
      if (!this.products.length) {
        tbody.innerHTML = Helpers.emptyRow(7);
      } else {
        tbody.innerHTML = this.products.map(p => {
          const price = Helpers.formatCurrency(p.price);
          const catName = p.category?.name ?? p.category_id ?? '-';
          const stock = p.inventory_item?.current_stock ?? 0;
          const statusHtml = Helpers.statusBadge(p.is_active ? 'active' : 'inactive');
          return `
            <tr>
              <td>#${p.id}</td>
              <td class="font-medium">${Helpers.escapeHtml(p.name)}</td>
              <td class="font-semibold text-green-600">${price}</td>
              <td>${Helpers.escapeHtml(catName)}</td>
              <td>${stock}</td>
              <td>${statusHtml}</td>
              <td>
                <div class="flex gap-2">
                  <button onclick="ProductController.editProduct(${p.id})" class="text-blue-600 hover:text-blue-800" title="Sửa">✏️</button>
                  <button onclick="ProductController.deleteProduct(${p.id})" class="text-red-600 hover:text-red-800" title="Xoá">🗑️</button>
                  <button onclick="ProductController.openUpdateStock(${p.id})" class="text-emerald-600 hover:text-emerald-800" title="Cập nhật kho">📦</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    } catch (e) {
      console.error(e);
      tbody.innerHTML = Helpers.errorRow(7, 'Không tải được danh sách sản phẩm');
    }

    const search = document.getElementById('prod-search');
    if (search) {
      search.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(r => {
          const nameCell = r.children[1]?.textContent?.toLowerCase() ?? '';
          r.style.display = nameCell.includes(q) ? '' : 'none';
        });
      });
    }
  }

  // Form modal
  static openAddModal() {
    this.formMode = 'create';
    this.editingId = null;

    document.getElementById('product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-description').value = '';

    const sel = document.getElementById('product-category');
    sel.innerHTML = this.buildCategorySelectOptions();

    const file = document.getElementById('product-image');
    const preview = document.getElementById('product-preview');
    if (file) file.value = '';
    if (preview) { preview.src = ''; preview.classList.add('hidden'); }

    AdminController.openModal('product-modal');
  }

  static editProduct(id) {
    const p = this.products.find(x => Number(x.id) === Number(id));
    if (!p) return;

    this.formMode = 'edit';
    this.editingId = p.id;

    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.name ?? '';
    document.getElementById('product-price').value = p.price ?? 0;
    document.getElementById('product-description').value = p.description ?? '';

    const sel = document.getElementById('product-category');
    sel.innerHTML = this.buildCategorySelectOptions(p.category?.id ?? p.category_id ?? '');

    const file = document.getElementById('product-image');
    const preview = document.getElementById('product-preview');
    if (file) file.value = '';
    if (preview) {
      if (p.image_url) { preview.src = p.image_url; preview.classList.remove('hidden'); }
      else { preview.src = ''; preview.classList.add('hidden'); }
    }

    AdminController.openModal('product-modal');
  }

  // Submit form → gọi API thật (FormData only)
  static async saveProduct(e) {
    e.preventDefault();
    const id   = document.getElementById('product-id').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const price = document.getElementById('product-price').value;
    const category_id = document.getElementById('product-category').value || null;
    const description = document.getElementById('product-description').value.trim();
    const imageFile = document.getElementById('product-image').files[0];

    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', price);
    if (category_id) fd.append('category_id', category_id);
    if (description) fd.append('description', description);
    fd.append('is_active','1');
    if (imageFile) fd.append('image', imageFile);

    try {
      if (this.formMode === 'edit' && id) {
        await this.updateProductFD(id, fd);
        NotificationController.show('Cập nhật sản phẩm thành công!');
      } else {
        await this.createProductFD(fd);
        NotificationController.show('Thêm sản phẩm thành công!');
      }
      AdminController.closeModal('product-modal');
      await this.renderProductsView();
    } catch (err) {
      console.error(err);
      const msg = err?.message || Object.values(err?.errors || {})[0]?.[0] || 'Có lỗi khi lưu sản phẩm';
      NotificationController.show(msg, 'error');
    }
  }

  static async deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    const res = await apiFetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: withCsrf()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      NotificationController.show(err?.message || 'Xoá thất bại', 'error');
      return;
    }
    await this.renderProductsView();
    NotificationController.show('Xoá sản phẩm thành công!');
  }
}

class CategoryAdminController {
  static rows = [];

  static async fetchAll(all = true) {
    const res = await apiFetch(`/api/categories${all ? '?all=1':''}`, { headers: {Accept:'application/json'}});
    if (!res.ok) throw new Error('fetch categories failed');
    this.rows = await res.json();
  }

  static async renderView() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold">Danh mục</h3>
          <button class="admin-btn" onclick="CategoryAdminController.openModal()">➕ Thêm danh mục</button>
        </div>
        <div class="model-card">
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead><tr><th>ID</th><th>Tên</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody id="cat-tbody">${Helpers.spinnerRow(4)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- modal đơn giản -->
      <div id="cat-modal" class="admin-modal hidden">
        <div class="admin-modal-box">
          <h3 class="text-lg font-semibold mb-4">Thêm/Sửa danh mục</h3>
          <form onsubmit="CategoryAdminController.save(event)">
            <input type="hidden" id="cat-id">
            <div class="mb-3">
              <label class="block text-sm mb-1">Tên danh mục</label>
              <input id="cat-name" class="admin-input" required />
            </div>
            <div class="mb-4">
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" id="cat-active" checked> <span>Kích hoạt</span>
              </label>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" class="admin-btn-outline" onclick="AdminController.closeModal('cat-modal')">Hủy</button>
              <button class="admin-btn">Lưu</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const tbody = document.getElementById('cat-tbody');
    try {
      await this.fetchAll(true);
      tbody.innerHTML = this.rows.map(c => `
        <tr>
          <td>#${c.id}</td>
          <td class="font-medium">${Helpers.escapeHtml(c.name)}</td>
          <td>${Helpers.statusBadge(c.is_active ? 'active' : 'inactive')}</td>
          <td class="flex gap-2">
            <button class="text-blue-600" onclick="CategoryAdminController.edit(${c.id})">✏️</button>
            <button class="text-red-600" onclick="CategoryAdminController.remove(${c.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch(e) {
      console.error(e);
      tbody.innerHTML = Helpers.errorRow(4,'Không tải được danh mục');
    }
  }

  static openModal() {
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-name').value = '';
    document.getElementById('cat-active').checked = true;
    AdminController.openModal('cat-modal');
  }
  static edit(id) {
    const c = this.rows.find(x => Number(x.id)===Number(id));
    if (!c) return;
    document.getElementById('cat-id').value = c.id;
    document.getElementById('cat-name').value = c.name;
    document.getElementById('cat-active').checked = !!c.is_active;
    AdminController.openModal('cat-modal');
  }
  static async save(ev) {
    ev.preventDefault();
    const id = document.getElementById('cat-id').value.trim();
    const payload = {
      name: document.getElementById('cat-name').value.trim(),
      is_active: document.getElementById('cat-active').checked ? 1 : 0
    };
    try {
      const res = await apiFetch(id ? `/api/categories/${id}` : '/api/categories', {
  method: id ? 'PUT' : 'POST',
  headers: withCsrf({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload)
});
      if (!res.ok) throw await res.json().catch(()=>({message:'Lưu thất bại'}));
      AdminController.closeModal('cat-modal');
      NotificationController.show(id?'Đã cập nhật danh mục':'Đã thêm danh mục');
      // cập nhật categories dùng cho Product modal
      await ProductController.fetchCategories(); 
      await this.renderView();
    } catch(err) {
      NotificationController.show(err?.message || 'Lỗi lưu', 'error');
    }
  }
  static async remove(id) {
    if (!confirm('Xoá danh mục này?')) return;
    const res = await apiFetch(`/api/categories/${id}`, {
  method: 'DELETE',
  headers: withCsrf()
});

    if (!res.ok) { NotificationController.show('Xoá thất bại','error'); return; }
    NotificationController.show('Đã xoá danh mục');
    await ProductController.fetchCategories();
    await this.renderView();
  }
}
window.CategoryAdminController = CategoryAdminController;

class EmployeeController {
  static employees = [];

  static async fetchAll() {
    const res = await apiFetch('/api/employees', { headers: { 'Accept':'application/json' }});
    if (!res.ok) throw new Error('fetch employees failed');
    this.employees = await res.json();
  }
static rowHtml(e) {
    return `
      <tr>
        <td>#${e.id}</td>
        <td class="font-medium">${Helpers.escapeHtml(e.name)}</td>
        <td>${Helpers.escapeHtml(e.email ?? '')}</td>
        <td>${Helpers.escapeHtml(e.phone ?? '')}</td>
        <td><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${e.position}</span></td>
        <td class="font-semibold">${Helpers.formatCurrency(e.salary)}</td>
        <td>${Helpers.statusBadge(e.status === 'active' ? 'active' : 'inactive')}</td>
        <td>
          <div class="flex space-x-2">
            <button class="text-blue-600 hover:text-blue-800" onclick="EmployeeController.openEditModal(${e.id})">✏️</button>
            <button class="text-red-600 hover:text-red-800" onclick="EmployeeController.remove(${e.id})">🗑️</button>
          </div>
        </td>
      </tr>`;
  }
static async renderEmployeesView() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <div class="flex justify-between items-center mb-6 gap-2">
          <div>
            <h3 class="text-xl font-semibold">Danh sách nhân viên</h3>
            <p class="text-gray-600">Quản lý đội ngũ Chumtea</p>
          </div>
          <div class="flex gap-2">
            <input id="employ-search" class="admin-input w-60" placeholder="Tìm theo tên/email/SĐT..."/>
            <button onclick="EmployeeController.openAddModal()" class="admin-btn">➕ Thêm nhân viên</button>
          </div>
        </div>
        <div class="model-card">
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Họ và tên</th><th>Email</th><th>SĐT</th>
                  <th>Chức vụ</th><th>Lương</th><th>Trạng thái</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="emp-tbody">${Helpers.spinnerRow(8)}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const tbody  = document.getElementById('emp-tbody');
    const search = document.getElementById('employ-search');

    // load dữ liệu trước khi gắn tìm kiếm
    try {
      await this.fetchAll();
      tbody.innerHTML = this.employees.length
        ? this.employees.map(this.rowHtml).join('')
        : Helpers.emptyRow(8, 'Chưa có nhân viên');
    } catch (e) {
      console.error(e);
      tbody.innerHTML = Helpers.errorRow(8, 'Không tải được danh sách nhân viên');
    }

    // lọc client-side
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        const data = this.employees.filter(e =>
          (e.name  ?? '').toLowerCase().includes(q) ||
          (e.email ?? '').toLowerCase().includes(q) ||
          (e.phone ?? '').toLowerCase().includes(q)
        );
        tbody.innerHTML = data.length
          ? data.map(this.rowHtml).join('')
          : Helpers.emptyRow(8, 'Không tìm thấy kết quả');
      });
    }
  }

  static async reloadTable() {
    const tbody = document.getElementById('emp-tbody');
    try {
      await this.fetchAll();
      if (!this.employees.length) {
        tbody.innerHTML = Helpers.emptyRow(8, 'Chưa có nhân viên');
        return;
      }
      tbody.innerHTML = this.employees.map(e => `
        <tr>
          <td>#${e.id}</td>
          <td class="font-medium">${Helpers.escapeHtml(e.name)}</td>
          <td>${Helpers.escapeHtml(e.email ?? '')}</td>
          <td>${Helpers.escapeHtml(e.phone ?? '')}</td>
          <td><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${e.position}</span></td>
          <td class="font-semibold">${Helpers.formatCurrency(e.salary)}</td>
          <td>${Helpers.statusBadge(e.status === 'active' ? 'active' : 'inactive')}</td>
          <td>
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:text-blue-800" onclick="EmployeeController.openEditModal(${e.id})">✏️</button>
              <button class="text-red-600 hover:text-red-800" onclick="EmployeeController.remove(${e.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
      tbody.innerHTML = Helpers.errorRow(8, 'Không tải được danh sách nhân viên');
    }
  }

  /* Modal helpers */
  static openAddModal() {
    document.getElementById('emp-id').value = '';
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-email').value = '';
    document.getElementById('emp-phone').value = '';
    document.getElementById('emp-position').value = 'staff';
    document.getElementById('emp-salary').value = 0;
    document.querySelector('input[name="emp-status"][value="active"]').checked = true;
    document.getElementById('emp-join-date').value = '';
    AdminController.openModal('employee-modal');
  }
  static openEditModal(id) {
    const e = this.employees.find(x => Number(x.id) === Number(id));
    if (!e) return;
    document.getElementById('emp-id').value = e.id;
    document.getElementById('emp-name').value = e.name ?? '';
    document.getElementById('emp-email').value = e.email ?? '';
    document.getElementById('emp-phone').value = e.phone ?? '';
    document.getElementById('emp-position').value = e.position ?? 'staff';
    document.getElementById('emp-salary').value = e.salary ?? 0;
    (document.querySelector(`input[name="emp-status"][value="${e.status==='inactive'?'inactive':'active'}"]`)||{}).checked = true;
    document.getElementById('emp-join-date').value = e.join_date ?? '';
    AdminController.openModal('employee-modal');
  }

  /* CRUD */
  static async saveFromModal(ev) {
    ev?.preventDefault?.();
    const id      = document.getElementById('emp-id').value.trim();
    const payload = {
      name:      document.getElementById('emp-name').value.trim(),
      email:     document.getElementById('emp-email').value.trim() || null,
      phone:     document.getElementById('emp-phone').value.trim() || null,
      position:  document.getElementById('emp-position').value,
      salary:    Number(document.getElementById('emp-salary').value || 0),
      status:    (document.querySelector('input[name="emp-status"]:checked')?.value) || 'active',
      join_date: document.getElementById('emp-join-date').value || null,
    };

    try {
      let res;
      if (id) {
       res = await apiFetch(`/api/employees/${id}`, {
  method: 'PUT',
  headers: withCsrf({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload),
});

      } else {
       res = await apiFetch('/api/employees', {
  method: 'POST',
  headers: withCsrf({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload),
});

      }
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(Object.values(err?.errors || {})[0]?.[0] || err?.message || 'Lưu thất bại');
      }
      AdminController.closeModal('employee-modal');
      NotificationController.show(id ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!');
      await this.reloadTable();
    } catch (e) {
      console.error(e);
      NotificationController.show(e.message || 'Có lỗi khi lưu', 'error');
    }
  }

  static async remove(id) {
    if (!confirm('Xoá nhân viên này?')) return;
    try {
     const res = await apiFetch(`/api/employees/${id}`, {
  method: 'DELETE',
  headers: withCsrf()
});

      if (!res.ok) throw new Error('Xoá thất bại');
      NotificationController.show('Đã xoá nhân viên!');
      await this.reloadTable();
    } catch (e) {
      console.error(e);
      NotificationController.show(e.message || 'Lỗi xoá', 'error');
    }
  }
}



// Quan trọng: export đúng 1 lần
window.EmployeeController = EmployeeController;


class OrderController {
  static orders   = [];  
  static filtered = [];

  // ===== helpers =====
  static toClientRow(row) {
    // Chuẩn hoá dữ liệu từ API → format mà view đang dùng
    return {
      id: row.id,
      customerName: row.customer_name || row.customer?.name || '—',
      total: Number(row.total || 0),
      status: row.status || 'pending',
      createdAt: row.created_at || row.createdAt,
      // server có thể trả về items_count hoặc items[]
      itemsCount: (typeof row.items_count !== 'undefined')
        ? row.items_count
        : ((row.items || []).length || 0),
      items: row.items || []
    };
  }

  static qs(obj = {}) {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') p.set(k, v);
    });
    return p.toString();
  }

  static rowHtml(o) {
    return `
      <tr>
        <td>#${o.id}</td>
        <td class="font-medium">${Helpers.escapeHtml(o.customerName)}</td>
        <td>${o.itemsCount} sản phẩm</td>
        <td class="font-semibold text-green-600">${Helpers.formatCurrency(o.total)}</td>
        <td>${Helpers.statusBadge(o.status)}</td>
        <td>${Helpers.formatDateTime(o.createdAt)}</td>
        <td>
          <div class="flex space-x-2">
            <button onclick="OrderController.viewDetails(${o.id})" class="text-blue-600 hover:text-blue-800">👁️</button>
            <button onclick="OrderController.deleteOrder(${o.id})" class="text-red-600 hover:text-red-800">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }

  // ===== view =====
  static renderOrdersView() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-semibold">Danh sách đơn hàng</h3>
            <p class="text-gray-600">Quản lý đơn hàng Chumtea</p>
          </div>
          <div class="flex items-center gap-2">
            <input id="order-search" class="admin-input w-60" placeholder="Tìm khách / sản phẩm..." />
            <select id="order-status" class="admin-select">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div class="model-card">
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="order-tbody">${Helpers.spinnerRow(7)}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // load lần đầu
    this.fetchAndRender();

    // filter → gọi lại API (lọc phía server)
    document.getElementById('order-search')?.addEventListener('input', Helpers.debounce(() => this.fetchAndRender(), 300));
    document.getElementById('order-status')?.addEventListener('change', () => this.fetchAndRender());
  }

  // ===== data =====
  static async fetchAndRender() {
    const q  = (document.getElementById('order-search')?.value || '').trim();
    const st = (document.getElementById('order-status')?.value || '').trim();
    const tbody = document.getElementById('order-tbody');
    if (!tbody) return;

    try {
      tbody.innerHTML = Helpers.spinnerRow(7);

      const res = await fetch(`/api/orders?${this.qs({ q, status: st })}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      if (!res.ok) throw new Error(await res.text());
      const payload = await res.json();

      // chấp nhận cả kiểu {data: [...] } hoặc {orders: [...]}
      const list = payload.data || payload.orders || [];
      this.orders = list.map(this.toClientRow);
      this.filtered = this.orders; // giữ tương thích

      tbody.innerHTML = this.orders.length
        ? this.orders.map(this.rowHtml).join('')
        : Helpers.emptyRow(7, 'Không có đơn hàng phù hợp');
    } catch (e) {
      console.error(e);
      tbody.innerHTML = Helpers.emptyRow(7, 'Tải danh sách thất bại');
    }
  }

  static async viewDetails(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const order = this.toClientRow(data.data || data.order || data);
      const content = document.getElementById('order-detail-content');
      content.innerHTML = `
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm">Mã đơn hàng</label><p class="text-lg font-semibold">#${order.id}</p></div>
            <div><label class="block text-sm">Khách hàng</label><p class="text-lg">${Helpers.escapeHtml(order.customerName)}</p></div>
            <div><label class="block text-sm">Trạng thái</label>${Helpers.statusBadge(order.status)}</div>
            <div><label class="block text-sm">Tổng tiền</label><p class="text-lg font-semibold text-green-600">${Helpers.formatCurrency(order.total)}</p></div>
          </div>
          <div>
            <label class="block text-sm mb-2">Chi tiết sản phẩm</label>
            <div class="bg-gray-50 rounded-lg p-4">
              ${(order.items || []).map(i => `
                <div class="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <p class="font-medium">${Helpers.escapeHtml(i.product_name || i.name || '')}</p>
                    <p class="text-sm text-gray-600">Số lượng: ${i.quantity}</p>
                  </div>
                  <p class="font-semibold">${Helpers.formatCurrency((i.price || 0) * (i.quantity || 0))}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="flex space-x-3 pt-4">
            <button onclick="AdminController.closeModal('order-detail-modal')" class="admin-btn flex-1">Đóng</button>
          </div>
        </div>
      `;
      AdminController.openModal('order-detail-modal');
    } catch (e) {
      console.error(e);
      NotificationController.show('Không tải được chi tiết đơn', 'error');
    }
  }

  static async deleteOrder(id) {
    if (!confirm('Xoá đơn hàng?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) throw new Error(await res.text());
      NotificationController.show('Xoá đơn hàng thành công!');
      // tải lại theo bộ lọc hiện có
      await this.fetchAndRender();
    } catch (e) {
      console.error(e);
      NotificationController.show('Xoá đơn hàng thất bại', 'error');
    }
  }
}


class InventoryController {
  // dữ liệu kho thật từ API
  static items = [];
  static filtered = [];
  static sortDir = 'asc'; // asc | desc

  // ---- API ----
  static async fetchInventory() {
    const res = await apiFetch('/api/inventory', { headers: { 'Accept': 'application/json' }});
    if (!res.ok) throw new Error('fetch inventory failed');
    this.items = await res.json();
  }

  // ---- helpers ----
  static isLowStock(item) {
    const cur = Number(item.current_stock || 0);
    const min = Number(item.min_stock || 0);
    return cur <= min;
  }
  static statusBadge(item) {
    return this.isLowStock(item)
      ? '<span class="status-badge status-cancelled">Sắp hết</span>'
      : '<span class="status-badge status-completed">Đủ hàng</span>';
  }
  static fmtDate(d) { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return '-'; } }

  static rowHtml(i) {
    return `
      <tr>
        <td class="font-medium">${Helpers.escapeHtml(i.product_name || `#${i.product_id}`)}</td>
        <td class="${this.isLowStock(i) ? 'text-red-600 font-semibold' : 'text-gray-800'}">${i.current_stock ?? 0}</td>
        <td>${i.min_stock ?? 0}</td>
        <td>${i.max_stock ?? 0}</td>
        <td>${this.statusBadge(i)}</td>
        <td>${this.fmtDate(i.last_updated)}</td>
        <td>
          <button onclick="InventoryController.promptUpdate(${i.product_id})"
                  class="text-blue-600 hover:text-blue-800" title="Cập nhật tồn kho">📝</button>
        </td>
      </tr>
    `;
  }

  // ---- view ----
  static async renderInventoryView() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-semibold">Quản lý kho hàng</h3>
            <p class="text-gray-600">Theo dõi tồn kho và cảnh báo hết hàng</p>
          </div>
          <div class="flex items-center gap-2">
            <input id="inv-search" class="admin-input w-60" placeholder="Tìm theo tên sản phẩm..." />
            <select id="inv-filter" class="admin-select">
              <option value="">Tất cả</option>
              <option value="low">Chỉ sắp hết</option>
            </select>
            <button id="inv-sort" class="admin-btn-secondary">Sắp xếp: <span data-role="dir">A→Z</span></button>
            <button id="inv-refresh" class="admin-btn">↻ Làm mới</button>
          </div>
        </div>

        <div class="model-card">
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Tồn kho hiện tại</th>
                  <th>Tồn kho tối thiểu</th>
                  <th>Tồn kho tối đa</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật lần cuối</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="inv-tbody">${Helpers.spinnerRow(7)}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    try {
      await this.fetchInventory();
      this.applyFilter(); // render lần đầu
    } catch (e) {
      console.error(e);
      document.getElementById('inv-tbody').innerHTML = Helpers.errorRow(7, 'Không tải được dữ liệu kho');
    }

    // gắn sự kiện filter / sort / refresh
    document.getElementById('inv-search')?.addEventListener('input', () => this.applyFilter());
    document.getElementById('inv-filter')?.addEventListener('change', () => this.applyFilter());
    document.getElementById('inv-sort')?.addEventListener('click', () => {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      document.querySelector('#inv-sort [data-role="dir"]').textContent =
        this.sortDir === 'asc' ? 'A→Z' : 'Z→A';
      this.applyFilter();
    });
    document.getElementById('inv-refresh')?.addEventListener('click', async () => {
      try {
        await this.fetchInventory();
        NotificationController.show('Đã làm mới dữ liệu kho');
        this.applyFilter();
      } catch {
        NotificationController.show('Làm mới thất bại', 'error');
      }
    });
  }

  static applyFilter() {
    const q  = (document.getElementById('inv-search')?.value || '').toLowerCase().trim();
    const f  = (document.getElementById('inv-filter')?.value || '').trim();
    const tb = document.getElementById('inv-tbody');
    if (!tb) return;

    // lọc
    let list = this.items.filter(i => {
      const name = (i.product_name || `#${i.product_id}`)?.toLowerCase() || '';
      const okText = !q || name.includes(q);
      const okLow  = f !== 'low' || this.isLowStock(i);
      return okText && okLow;
    });

    // sắp xếp
    list.sort((a,b)=>{
      const A = (a.product_name || `#${a.product_id}` || '').toLowerCase();
      const B = (b.product_name || `#${b.product_id}` || '').toLowerCase();
      return this.sortDir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
    });

    this.filtered = list;
    tb.innerHTML = list.length ? list.map(i => this.rowHtml(i)).join('') : Helpers.emptyRow(7,'Không có mặt hàng phù hợp');
  }

  // ---- cập nhật nhanh tồn kho (PUT API) ----
  static async promptUpdate(productId) {
    const item = this.items.find(x => Number(x.product_id) === Number(productId));
    const name = item?.product?.name || item?.product_name || `#${productId}`;
    const cur  = item?.current_stock ?? 0;

    const val = prompt(`Nhập tồn kho mới cho "${name}"`, cur);
    if (val === null) return;

    const newStock = parseInt(val, 10);
    if (Number.isNaN(newStock) || newStock < 0) {
      NotificationController.show('Giá trị tồn kho không hợp lệ', 'error');
      return;
    }

    try {
     const res = await apiFetch(`/api/inventory/${productId}`, {
  method: 'PUT',
  headers: withCsrf({ 'Content-Type': 'application/json' }),
  body: JSON.stringify({ current_stock: newStock })
});

      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.message || 'Cập nhật thất bại');
      }
      NotificationController.show('Cập nhật tồn kho thành công!');
      await this.fetchInventory();
      this.applyFilter(); // cập nhật bảng theo filter hiện tại
    } catch (e) {
      console.error(e);
      NotificationController.show(e.message || 'Có lỗi khi cập nhật tồn kho', 'error');
    }
  }
}



/* ---- Notification ---- */
class NotificationController {
  static show(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
    } text-white`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

/* =========================
 * Bootstrap data loader (Cách B: script JSON ẩn)
 *  - Trong Blade: 
 *    <script id="bootstrap-categories" type="application/json">{!! $categories->toJson() !!}</script>
 * ========================= */
(() => {
  const elCat = document.getElementById('bootstrap-categories');
  if (elCat && elCat.textContent) {
    try {
      const parsed = JSON.parse(elCat.textContent);
      window.__BOOTSTRAP__ = window.__BOOTSTRAP__ || {};
      window.__BOOTSTRAP__.categories = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Parse categories bootstrap JSON failed:', e);
      window.__BOOTSTRAP__ = window.__BOOTSTRAP__ || {};
      window.__BOOTSTRAP__.categories = [];
    }
  }
  // copy vào ProductController sau khi class tồn tại
  document.addEventListener('DOMContentLoaded', () => {
    if (window.ProductController) {
      ProductController.categories = window.__BOOTSTRAP__?.categories || [];
    }
  });
})();

/* =========================
 * Sidebar toggle (Cách A): 
 *  - Thêm data-toggle="sidebar" vào nút trong Blade
 * ========================= */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toggle="sidebar"]');
  if (btn) {
    document.querySelector('.admin-sidebar')?.classList.toggle('mobile-open');
  }
});

/* ---- Đóng modal khi click nền ---- */
document.addEventListener('click', (e) => {
  const modal = e.target.closest('.admin-modal');
  if (modal && e.target === modal) {
    modal.classList.add('hidden');
  }
});



class InvoiceController {
  static renderInvoicesView() {
    const content = document.getElementById('admin-content');
    if (!content) return;
    content.innerHTML = `
      <div class="slide-in">
        <div class="model-card">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold">Quản lý Hóa đơn</h3>
          </div>
          <div class="p-6 text-gray-500">Tính năng đang phát triển.</div>
        </div>
      </div>`;
  }
  static renderInvoiceDetailsView() {
    const content = document.getElementById('admin-content');
    if (!content) return;
    content.innerHTML = `
      <div class="slide-in">
        <div class="model-card">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold">Chi tiết Hóa đơn</h3>
          </div>
          <div class="p-6 text-gray-500">Tính năng đang phát triển.</div>
        </div>
      </div>`;
  }
}


/* ---- Khởi động ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Mặc định vào Dashboard
  const first = document.querySelector('.nav-item[data-nav="reports"]');
  AdminController.showReports(first);
  console.log('🍃 Chumtea Admin System Started');
});

/* =========================
 * Phân quyền hiển thị menu theo vai trò
 * ========================= */
async function applySidebarPermissions() {
  try {
    const res = await apiFetch('/whoami');
    if (!res.ok) return;
    const data = await res.json();
    const roles = data.roles || [];

    // Ẩn hiện menu dựa theo role
    const hideForStaff = [
      '[data-nav="dashboard"]',
      '[data-nav="reports"]',
      '[data-nav="products"]',
      '[data-nav="categories"]',
      '[data-nav="employees"]'
    ];

    // Nếu là nhân viên
    if (roles.includes('staff')) {
      hideForStaff.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = 'none';
      });
    }

    // Hiển thị tên người dùng + vai trò ở footer sidebar
    const footer = document.querySelector('#admin-sidebar .bg-green-600 .text-white');
    if (footer) footer.textContent = (data?.user?.name || 'Người dùng') + ` (${roles.join(', ')})`;

  } catch (e) {
    console.error('Không thể áp dụng phân quyền sidebar:', e);
  }
}

// Gọi sau khi DOM load
document.addEventListener('DOMContentLoaded', () => {
  applySidebarPermissions();
});

// ==== Image preview handler for product modal ====
(() => {
  let _previewUrl = null; // object URL hiện tại để revoke khi cần

  function setPreview(src) {
    const img = document.getElementById('product-preview');
    if (!img) return;
    if (src) {
      img.src = src;
      img.classList.remove('hidden');
    } else {
      img.src = '';
      img.classList.add('hidden');
    }
  }

  // Lắng nghe khi chọn file ảnh
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'product-image') {
      const file = e.target.files && e.target.files[0];
      // Clear preview cũ
      if (_previewUrl) {
        URL.revokeObjectURL(_previewUrl);
        _previewUrl = null;
      }
      if (file) {
        // Giới hạn nhẹ: chỉ nhận ảnh <= 2MB (khớp validation backend)
        if (!file.type.startsWith('image/')) {
          NotificationController?.show?.('File không phải ảnh', 'error');
          e.target.value = '';
          setPreview(null);
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          NotificationController?.show?.('Ảnh vượt quá 2MB', 'error');
          e.target.value = '';
          setPreview(null);
          return;
        }
        _previewUrl = URL.createObjectURL(file);
        setPreview(_previewUrl);
      } else {
        setPreview(null);
      }
    }
  });

  // Hook vào đóng modal: khi đóng thì reset preview + thu hồi URL
  const _oldClose = AdminController.closeModal?.bind(AdminController);
  AdminController.closeModal = function (modalId) {
    if (modalId === 'product-modal') {
      if (_previewUrl) {
        URL.revokeObjectURL(_previewUrl);
        _previewUrl = null;
      }
      const input = document.getElementById('product-image');
      if (input) input.value = '';
      setPreview(null);
    }
    return _oldClose ? _oldClose(modalId) : undefined;
  };

  // Khi mở modal ở chế độ edit, nếu sản phẩm có sẵn image_url thì hiện luôn (đoạn này bạn đã set trong editProduct):
  // - ProductController.editProduct(...) đã set sẵn product-preview.src = p.image_url
  // - Ở trường hợp đó, _previewUrl = null (vì ảnh từ server), không cần revoke
})();

// đóng khi bấm nút có data-close hoặc bấm vào nền tối
document.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('[data-close]');
  if (closeBtn) {
    AdminController.closeModal(closeBtn.getAttribute('data-close'));
  }
  const modal = e.target.closest('.admin-modal');
  if (modal && e.target === modal) {
    modal.classList.add('hidden');
  }
});





class UserAdminController {
  static rows = [];

  static rowHtml(u) {
    return `
      <tr>
        <td>#${u.id}</td>
        <td class="font-medium">${Helpers.escapeHtml(u.name || '')}</td>
        <td>${Helpers.escapeHtml(u.email || '')}</td>
        <td>${Helpers.escapeHtml(u.phone || '')}</td>
        <td><span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">${u.role}</span></td>
        <td>${Helpers.formatDate(u.created_at)}</td>
        <td>
          <div class="flex gap-2">
            <button class="text-blue-600 hover:text-blue-800" onclick="UserAdminController.openEdit(${u.id})">✏️</button>
            <button class="text-red-600 hover:text-red-800" onclick="UserAdminController.remove(${u.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }

  static async fetchAll() {
    const res = await apiFetch('/api/users', { headers: { 'Accept':'application/json' }});
    if (!res.ok) throw new Error('fetch users failed');
    this.rows = await res.json();
  }

  static async renderView() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="slide-in">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-semibold">Quản lý tài khoản</h3>
            <p class="text-gray-600">Chỉ admin mới truy cập</p>
          </div>
          <button class="admin-btn" onclick="UserAdminController.openAdd()">➕ Thêm tài khoản</button>
        </div>

        <div class="model-card">
          <div class="overflow-x-auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Họ tên</th><th>Email</th><th>Điện thoại</th><th>Vai trò</th><th>Ngày tạo</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="user-tbody">${Helpers.spinnerRow(7)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div id="user-modal" class="admin-modal hidden">
        <div class="admin-modal-box max-w-xl">
          <h3 class="text-lg font-semibold mb-4">Thêm/Sửa tài khoản</h3>
          <form onsubmit="UserAdminController.save(event)">
            <input type="hidden" id="user-id">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm mb-1">Họ tên</label>
                <input id="user-name" class="admin-input" required>
              </div>
              <div>
                <label class="block text-sm mb-1">Email</label>
                <input id="user-email" type="email" class="admin-input" required>
              </div>
              <div>
                <label class="block text-sm mb-1">SĐT</label>
                <input id="user-phone" class="admin-input">
              </div>
              <div>
                <label class="block text-sm mb-1">Vai trò</label>
                <select id="user-role" class="admin-select">
                  <option value="staff">staff</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm mb-1">Mật khẩu <span class="text-gray-400 text-xs">(để trống nếu không đổi)</span></label>
                <input id="user-password" type="password" class="admin-input" placeholder="••••••">
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-5">
              <button type="button" class="admin-btn-secondary" onclick="AdminController.closeModal('user-modal')">Hủy</button>
              <button class="admin-btn">Lưu</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const tbody = document.getElementById('user-tbody');
    try {
      await this.fetchAll();
      tbody.innerHTML = this.rows.length ? this.rows.map(this.rowHtml).join('') : Helpers.emptyRow(7, 'Chưa có tài khoản');
    } catch (e) {
      console.error(e);
      tbody.innerHTML = Helpers.errorRow(7, 'Không tải được danh sách tài khoản');
    }
  }

  static openAdd() {
    document.getElementById('user-id').value = '';
    document.getElementById('user-name').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-phone').value = '';
    document.getElementById('user-role').value = 'staff';
    document.getElementById('user-password').value = '';
    AdminController.openModal('user-modal');
  }

  static openEdit(id) {
    const u = this.rows.find(x => Number(x.id) === Number(id));
    if (!u) return;
    document.getElementById('user-id').value = u.id;
    document.getElementById('user-name').value = u.name || '';
    document.getElementById('user-email').value = u.email || '';
    document.getElementById('user-phone').value = u.phone || '';
    document.getElementById('user-role').value = u.role || 'staff';
    document.getElementById('user-password').value = '';
    AdminController.openModal('user-modal');
  }

  static async save(ev) {
    ev.preventDefault();
    const id   = document.getElementById('user-id').value.trim();
    const body = {
      name:  document.getElementById('user-name').value.trim(),
      email: document.getElementById('user-email').value.trim(),
      phone: document.getElementById('user-phone').value.trim() || null,
      role:  document.getElementById('user-role').value,
    };
    const pwd = document.getElementById('user-password').value;
    if (pwd) body.password = pwd;

    try {
      const res = await apiFetch(id ? `/api/users/${id}` : '/api/users', {
        method: id ? 'PUT' : 'POST',
        headers: withCsrf({ 'Content-Type':'application/json' }),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.message || 'Lưu thất bại');
      }
      NotificationController.show(id ? 'Đã cập nhật tài khoản' : 'Đã tạo tài khoản');
      AdminController.closeModal('user-modal');
      await this.renderView();
    } catch (e) {
      console.error(e);
      NotificationController.show(e.message || 'Có lỗi khi lưu', 'error');
    }
  }

  static async remove(id) {
    if (!confirm('Xoá tài khoản này?')) return;
    try {
      const res = await apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: withCsrf()
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.message || 'Xoá thất bại');
      }
      NotificationController.show('Đã xoá tài khoản');
      await this.renderView();
    } catch (e) {
      console.error(e);
      NotificationController.show(e.message || 'Lỗi xoá', 'error');
    }
  }
}

// Xuất ra window cho onclick
window.UserAdminController = UserAdminController;



/* ---- Xuất controller ra window (để HTML onclick gọi được) ---- */
window.AdminController = AdminController;
window.ProductController = ProductController;
window.EmployeeController = EmployeeController;
window.OrderController = OrderController;
window.InvoiceController = InvoiceController;
 window.InventoryController = InventoryController;
window.NotificationController = NotificationController;
window.DataSeeder = DataSeeder;
