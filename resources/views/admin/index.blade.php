<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Chumtea Admin - Quản lý hệ thống</title>
<meta name="csrf-token" content="{{ csrf_token() }}">

  <!-- CSS & libs -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
</head>
<body class="bg-gray-100">
  <!-- Sidebar -->
  <div id="admin-sidebar" class="admin-sidebar fixed left-0 top-0 h-full w-64 z-40 hidden md:block">
    <div class="p-6 border-b border-green-600">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span class="text-2xl">🍃</span>
        </div>
        <div>
          <h1 class="text-xl font-bold text-white">Chumtea Admin</h1>
          <p class="text-xs text-green-200">Quản lý hệ thống</p>
        </div>
      </div>
    </div>

  <nav id="admin-nav" class="py-6">
    @php
        $user = Auth::user();
        $role = $user->role ?? $user->roles()->pluck('name')->first(); // hỗ trợ cả 2 kiểu
    @endphp

    {{-- === ADMIN & MANAGER === --}}
    @if(in_array($role, ['admin', 'manager']))
        <!-- <a href="#" class="nav-item" data-nav="dashboard"
           onclick="AdminController.showDashboard(this); return false;">📊 Dashboard</a> -->

        <a href="#" class="nav-item" data-nav="reports"
           onclick="AdminController.showReports(this); return false;">📈 Báo cáo</a>

        <a href="#" class="nav-item" data-nav="products"
           onclick="AdminController.showProducts(this); return false;">🍵 Quản lý Menu</a>

        <a href="#" class="nav-item" data-nav="categories"
           onclick="CategoryAdminController.renderView(); return false;">🏪 Quản lý danh mục</a>

        <a href="#" class="nav-item" data-nav="employees"
           onclick="EmployeeController.renderEmployeesView(); AdminController.setActiveNav('employees', this); return false;">👥 Nhân viên</a>

           <a href="#" class="nav-item" data-nav="users"
       onclick="UserAdminController.renderView(); AdminController.setActiveNav('users', this); return false;">👑 Quản lý tài khoản</a>
    @endif




    {{-- === STAFF + ADMIN + MANAGER === --}}
    @if(in_array($role, ['staff', 'admin', 'manager']))
        <a href="#" class="nav-item" data-nav="inventory"
           onclick="InventoryController.renderInventoryView(); AdminController.setActiveNav('inventory', this); return false;">📦 Quản lý Kho</a>

        <a href="#" class="nav-item" data-nav="orders"
           onclick="OrderController.renderOrdersView(); AdminController.setActiveNav('orders', this); return false;">🛒 Quản lý Đơn hàng</a>

        <!-- <a href="#" class="nav-item" data-nav="invoices"
           onclick="InvoiceController.renderInvoicesView(); AdminController.setActiveNav('invoices', this); return false;">🧾 Quản lý Hóa đơn</a>

        <a href="#" class="nav-item" data-nav="invoice-details"
           onclick="InvoiceController.renderInvoiceDetailsView(); AdminController.setActiveNav('invoice-details', this); return false;">📋 Chi tiết Hóa đơn</a> -->
    @endif
</nav>



   <div class="bg-green-600 rounded-lg p-4 text-center">
    <div id="sidebar-username" class="text-white text-sm mb-2">👤 Người dùng</div>

        👤 {{ Auth::user()->name ?? 'Người dùng' }}
        <div class="text-xs text-green-200 mt-1">
            ({{ Auth::user()->roles()->pluck('name')->implode(', ') }})
        </div>
    </div>
    <button onclick="AdminController.logout()" class="text-green-200 text-sm hover:text-white">Đăng xuất</button>
</div>

  </div>

  <!-- Main Content -->
  <div class="md:ml-64">
    <!-- Header -->
    <header class="admin-header h-20 flex items-center justify-between px-6">
      <div class="flex items-center space-x-4">
      <button
  class="md:hidden text-gray-600 hover:text-gray-800"
  data-toggle="sidebar"
  aria-controls="admin-sidebar"
  aria-expanded="false"
>
  <span class="text-2xl">☰</span>
</button>
        <h2 id="page-title" class="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>

      <div class="flex items-center space-x-4">
      
        <button class="relative p-2 text-gray-600 hover:text-gray-800">
          <span class="text-2xl">🔔</span>
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
<!-- Header: nút mở/đóng sidebar trên mobile -->


    <!-- Content Area -->
    <main id="admin-content" class="admin-content p-6">
      <!-- nội dung sẽ render bằng JS -->
    </main>
  </div>

  <!-- === MODALS === -->

 <!-- Product Modal (REPLACE TOÀN BỘ KHỐI NÀY) -->
<div id="product-modal" class="admin-modal fixed inset-0 z-50 hidden" aria-modal="true" role="dialog">
  <!-- nền mờ -->
  <div class="absolute inset-0 bg-black/50"></div>

  <!-- panel -->
  <div class="relative mx-auto my-6 w-[92vw] max-w-2xl">
    <div class="bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">

      <!-- Header: sticky -->
      <div class="sticky top-0 z-10 bg-white border-b px-6 py-4">
        <h3 class="text-xl font-bold text-gray-800">Thêm/Sửa Sản phẩm</h3>
      </div>

      <!-- Body: PHẦN NÀY CUỘN -->
      <div class="px-6 py-4 overflow-y-auto max-h-[calc(85vh-56px-64px)] space-y-4">
        <form id="product-form" onsubmit="ProductController.saveProduct(event)">
          <input type="hidden" id="product-id">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
            <input type="text" id="product-name" class="admin-input w-full" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Giá</label>
            <input type="number" id="product-price" min="0" class="admin-input w-full" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select id="product-category" class="admin-select w-full"></select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
            <input type="file" id="product-image" accept="image/*" class="admin-input w-full">
            <p class="text-xs text-gray-500 mt-1">jpg, png, webp, tối đa 2MB</p>

            <!-- Xem trước, giới hạn chiều cao để không đội form -->
            <img id="product-preview"
                 class="mt-3 rounded border hidden max-h-40 w-auto object-cover"
                 alt="preview">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea id="product-description" rows="4" class="admin-input w-full"></textarea>
          </div>
        </form>
      </div>

      <!-- Footer: sticky -->
      <div class="sticky bottom-0 z-10 bg-white border-t px-6 py-4 flex items-center justify-end gap-3">
        <button type="button" class="admin-btn-secondary" onclick="AdminController.closeModal('product-modal')">Hủy</button>
        <button type="submit" form="product-form" class="admin-btn">Lưu</button>
      </div>
    </div>
  </div>
</div>


  <!-- Employee Modal -->
<!-- Employee Modal -->
<div id="employee-modal"
     class="admin-modal fixed inset-0 z-[60] hidden">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"></div>

  <!-- Panel -->
  <div class="relative mx-auto my-10 w-[95%] max-w-3xl">
    <div class="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-[fadeIn_.15s_ease-out]">
      <!-- Header -->
      <div class="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-emerald-50 to-transparent">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Thêm/Sửa Nhân viên</h3>
          <p class="text-sm text-gray-500">Quản lý đội ngũ Chumtea</p>
        </div>
        <button type="button" data-close="employee-modal"
                class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <!-- Body -->
      <form onsubmit="EmployeeController.saveFromModal(event)">
        <input type="hidden" id="emp-id"/>

        <div class="px-6 py-5 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input id="emp-name" type="text" required
                     class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="emp-email" type="email" placeholder="tên@domain.com"
                     class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input id="emp-phone" type="text" placeholder="09xxxxxxxx"
                     class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
              <select id="emp-position" class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="staff">Nhân viên</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lương (VND)</label>
              <input id="emp-salary" type="number" min="0" value="0"
                     class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày vào</label>
              <input id="emp-join-date" type="date"
                     class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
          </div>

          <div class="pt-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <div class="flex items-center gap-6">
              <label class="inline-flex items-center gap-2">
                <input type="radio" name="emp-status" value="active" class="text-emerald-600" checked>
                <span class="text-sm text-gray-700">Đang làm</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="radio" name="emp-status" value="inactive" class="text-emerald-600">
                <span class="text-sm text-gray-700">Tạm ẩn</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button type="button" data-close="employee-modal"
                  class="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700">Hủy</button>
          <button type="submit"
                  class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
            Lưu
          </button>
        </div>
      </form>
    </div>
  </div>
</div>


  <!-- Order Detail Modal -->
  <div id="order-detail-modal" class="admin-modal hidden">
    <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div class="p-6 border-b">
        <h3 class="text-xl font-bold text-gray-800">Chi tiết Đơn hàng</h3>
      </div>
      <div id="order-detail-content" class="p-6">
        <!-- Order details will be loaded here -->
      </div>
    </div>
  </div>
<!-- Stock Modal -->
<div id="stock-modal" class="admin-modal fixed inset-0 z-50 hidden" aria-modal="true" role="dialog">
  <div class="absolute inset-0 bg-black/50"></div>

  <div class="relative mx-auto my-6 w-[92vw] max-w-md">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="px-6 py-4 border-b sticky top-0 bg-white">
        <h3 class="text-lg font-semibold">Cập nhật tồn kho</h3>
        <p id="stock-product-name" class="text-sm text-gray-500 mt-1"></p>
      </div>

      <form id="stock-form" class="px-6 py-4 space-y-4" onsubmit="ProductController.saveStock(event)">
        <input type="hidden" id="stock-product-id">

        <div>
          <label class="block text-sm mb-1">Tồn kho hiện tại</label>
          <input type="number" id="stock-current" class="admin-input w-full" min="0" required>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Tồn kho tối thiểu</label>
            <input type="number" id="stock-min" class="admin-input w-full" min="0">
          </div>
          <div>
            <label class="block text-sm mb-1">Tồn kho tối đa</label>
            <input type="number" id="stock-max" class="admin-input w-full" min="0">
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="admin-btn-secondary" onclick="AdminController.closeModal('stock-modal')">Hủy</button>
          <button type="submit" class="admin-btn">Lưu</button>
        </div>
      </form>
    </div>
  </div>
</div>

  <!-- Bootstrap data từ server (nếu controller đã truyền $categories) -->
{{-- Bootstrap JSON (KHÔNG phải script chạy JS) --}}
<script type="application/json" id="bootstrap-categories">
  @json($categories ?? [])
</script>

  <!-- Nhúng app.js MỘT LẦN, sau khi đã có __BOOTSTRAP__ -->
  <script src="{{ asset('js/admin/app.js') }}" defer></script>
</body>
</html>
