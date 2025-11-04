
 function setAdminLink(visible) {
  const slot = document.getElementById('admin-top-slot');
  if (!slot) return;

  const existing = slot.querySelector('[data-admin-link]');
  if (visible) {
    if (!existing) {
      const a = document.createElement('a');
      a.href = '/admin';
      a.dataset.adminLink = '1';
      a.className = 'text-gray-700 hover:text-primary font-medium transition-colors';
      a.textContent = 'Trang quản trị';
      slot.appendChild(a);
    }
  } else if (existing) {
    existing.remove();
  }
}
function setStaffLink(visible) {
  const slot = document.getElementById('staff-top-slot');
  if (!slot) return;

  const existing = slot.querySelector('[data-staff-link]');
  if (visible) {
    if (!existing) {
      const a = document.createElement('a');
      a.href = '/staff';
      a.dataset.staffLink = '1';
      a.className = 'text-gray-700 hover:text-primary font-medium transition-colors';
      a.textContent = 'Trang nhân viên';
      slot.appendChild(a);
    }
  } else if (existing) {
    existing.remove();
  }
}
 class Product {
            constructor(id, name, price, category, description, image, rating = 5, keywords = []) {
                this.id = id;
                this.name = name;
                this.price = price;
                this.category = category;
                this.description = description;
                this.image = image;
                this.rating = rating;
                this.keywords = keywords;
            }
            
            getFormattedPrice() {
                return this.price.toLocaleString('vi-VN') + 'đ';
            }
            
            getCategoryName() {
                const categories = {
                    'coffee': 'Cà phê',
                    'tea': 'Trà',
                    'milk-tea': 'Trà sữa',
                    'smoothie': 'Sinh tố'
                };
                return categories[this.category] || this.category;
            }
            
            matchesSearch(query) {
                const searchTerms = query.toLowerCase().split(' ');
                const searchableText = [
                    this.name.toLowerCase(),
                    this.description.toLowerCase(),
                    this.getCategoryName().toLowerCase(),
                    ...this.keywords.map(k => k.toLowerCase())
                ].join(' ');
                
                return searchTerms.every(term => searchableText.includes(term));
            }
        }

 class CartItem {
            constructor(product, quantity = 1) {
                this.product = product;
                this.quantity = quantity;
            }
            
            getTotalPrice() {
                return this.product.price * this.quantity;
            }
            
            getFormattedTotal() {
                return this.getTotalPrice().toLocaleString('vi-VN') + 'đ';
            }
        }

  class User {
            constructor(id, firstName, lastName, email, phone) {
                this.id = id;
                this.firstName = firstName;
                this.lastName = lastName;
                this.email = email;
                this.phone = phone;
                this.createdAt = new Date();
            }
            
            getFullName() {
                return `${this.firstName} ${this.lastName}`;
            }
        }


function apiFetch(url, init = {}) {
  return fetch(url, {
    credentials: 'same-origin',                    // ⬅️ mang cookie phiên
    headers: { 'Accept': 'application/json', ...(init.headers || {}) },
    ...init
  });
}

     const API = {
  async getProducts(params = {}) {
    const qs = new URLSearchParams({ per_page: 100, ...params }).toString();
    const res = await apiFetch(`/api/products?${qs}`);
    if (!res.ok) throw new Error('fetch products failed');

    const json = await res.json();

    // Ăn nhiều shape khác nhau: [], {data:[]}, {data:{data:[]}}, {products:[]}, {items:[]}
    const list =
      Array.isArray(json)                ? json :
      Array.isArray(json.data)           ? json.data :
      Array.isArray(json?.data?.data)    ? json.data.data :
      Array.isArray(json.products)       ? json.products :
      Array.isArray(json.items)          ? json.items :
      [];

    return list;
  },

  async getCategories() {
    const res = await apiFetch('/api/categories');
    if (!res.ok) throw new Error('fetch categories failed');
    return await res.json();
  }
};


     /* 
const API = {
  async getProducts(params = {}) {
    // BỎ active:1 — nếu backend không hỗ trợ thì nó làm rỗng dữ liệu
    const qs = new URLSearchParams({ per_page: 100, ...params }).toString();
    const res = await apiFetch(`/api/products?${qs}`);
    if (!res.ok) throw new Error('fetch products failed');
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data || []);
  },
    async getCategories() {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('fetch categories failed');
    return await res.json();
  }
  }; */

  // Tạo URL ảnh từ record product
  function productImageUrl(rec) {
  if (rec?.image_url) return rec.image_url;
  if (rec?.image)     return `/storage/${rec.image}`;
  return '/images/placeholder.png';
}
        // === DATA STORE ===
      // === DATA STORE ===

      /*
const AppDataStore = {
  products: [],      // <-- để rỗng, sẽ nạp từ API
  cart: [],
  currentUser: null,
  currentCategory: 'all',
  searchResults: [],
  isSearching: false
};
*/

   const AppDataStore = {

             categories: [], 
            products: [ ],
            cart: [],
            currentUser: null,
            currentCategory: 'all',
              currentCategoryId: 'all', 
            searchResults: [],
            isSearching: false
        };



/*
// Map record từ backend -> instance Product
function mapBackendProduct(rec) {
  // xác định slug category để khớp filter ở UI
  const raw = (rec.category?.slug || rec.category?.name || '').toLowerCase();
  let slug = 'other';
  if (raw.includes('coffee') || raw.includes('cà phê') || raw.includes('caphe')) slug = 'coffee';
  else if (raw.includes('tea') || raw.includes('trà')) slug = 'tea';
  else if (raw.includes('milk') || raw.includes('sữa')) slug = 'milk-tea';
  else if (raw.includes('smoothie') || raw.includes('sinh tố')) slug = 'smoothie';

  const p = new Product(
    rec.id,
    rec.name || '',
    Number(rec.price || 0),
    slug,
    rec.description || '',
    null,               // tạm không dùng emoji
    Number(rec.rating || 5),
    []
  );
  // thêm url ảnh thật để render
  p.imageUrl = productImageUrl(rec); // /storage/... hoặc placeholder
  // nếu cần hiển thị nhãn category từ server:
  p.categoryLabel = rec.category?.name || p.getCategoryName();
  return p;
} */

function mapBackendProduct(rec) {
  // Lấy id & name danh mục từ nhiều trường có thể có
  const categoryId   = rec.category_id ?? rec.categoryId ?? rec.category?.id ?? rec?.category?.data?.id ?? null;
  const categoryName = rec.category?.name ?? rec.category_name ?? rec.categoryName ?? 'Danh mục';

  // Suy ra slug nội bộ (không ảnh hưởng lọc theo ID)
  const raw = (rec.category?.slug || rec.category?.name || '').toLowerCase();
  let slug = 'other';
  if (raw.includes('coffee') || raw.includes('cà phê') || raw.includes('caphe')) slug = 'coffee';
  else if (raw.includes('tea') || raw.includes('trà')) slug = 'tea';
  else if (raw.includes('milk') || raw.includes('sữa')) slug = 'milk-tea';
  else if (raw.includes('smoothie') || raw.includes('sinh tố')) slug = 'smoothie';

  // ⚠️ ĐÚNG THỨ TỰ constructor: (id, name, price, category, description, image, rating, keywords)
  const p = new Product(
    rec.id,
    rec.name || '',
    Number(rec.price || 0),
    slug,
    rec.description || '',
    null,
    5,
    []
  );
  // THÊM ĐOẠN NÀY: cố gắng đọc tồn kho từ nhiều tên field khác nhau
  p.stock = Number(
    rec.stock
    ?? rec.current_stock
    ?? rec.quantity
    ?? rec.inventory?.current_stock
    ?? rec.inventory_item?.current_stock
    ?? rec.inventoryItem?.current_stock
    ?? 0
  );

  p.imageUrl      = productImageUrl(rec);
  p.categoryId    = categoryId;
  p.categoryLabel = categoryName;
  return p;
}


        class AppController {
          static async init() {
            this.setupEventListeners();
            this.setupScrollEffects();
            await AuthController.bootstrapSession();

            await CategoryController.loadAndRender();  // <--- thêm: load danh mục thật
            await MenuController.loadProducts();       // <--- sau khi có category
            CartController.updateCartDisplay();
            SearchController.init();
        }

                
                static setupEventListeners() {
                    // Close dropdowns when clicking outside
                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('#user-menu') && !e.target.closest('button[onclick*="toggleUserMenu"]')) {
                            UserController.closeUserMenu();
                        }
                        
                        // Close search results when clicking outside
                        if (!e.target.closest('.search-container')) {
                            SearchController.hideResults();
                        }
                    });
                    
                    // Close modals when clicking outside
                    document.addEventListener('click', (e) => {
                        if (e.target.classList.contains('modal')) {
                            AuthController.closeModal(e.target.id);
                        }
                    });
                    
                    // Smooth scrolling for anchor links
                    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                        anchor.addEventListener('click', function (e) {
                            e.preventDefault();
                            const target = document.querySelector(this.getAttribute('href'));
                            if (target) {
                                target.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }
                        });
                    });
                    
                    // Keyboard navigation for search
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            SearchController.hideResults();
                        }
                    });
                }
                
                static setupScrollEffects() {
                    const navbar = document.querySelector('.navbar');
                    
                    window.addEventListener('scroll', () => {
                        if (window.scrollY > 100) {
                            navbar.classList.add('scrolled');
                        } else {
                            navbar.classList.remove('scrolled');
                        }
                    });
                    
                    // Intersection Observer for animations
                    const observerOptions = {
                        threshold: 0.1,
                        rootMargin: '0px 0px -50px 0px'
                    };
                    
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            }
                        });
                    }, observerOptions);
                    
                    document.querySelectorAll('.animate-fadeInUp, .animate-fadeInLeft, .animate-fadeInRight').forEach(el => {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(30px)';
                        el.style.transition = 'all 0.8s ease-out';
                        observer.observe(el);
                    });
                }
                
                static scrollToMenu() {
                    document.getElementById('menu').scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                
                static scrollToContact() {
                    document.getElementById('contact').scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                
                static toggleMobileMenu() {
                    // Mobile menu implementation
                    console.log('Toggle mobile menu');
                }
                
                static showNotification(message, type = 'success') {
                    const notification = document.createElement('div');
                    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
                    notification.innerHTML = `
                        <div class="flex items-center">
                            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-3"></i>
                            <span>${message}</span>
                        </div>
                    `;
                    
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.classList.add('show');
                    }, 100);
                    
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => notification.remove(), 300);
                    }, 3000);
                }
        } 




        class SearchController {
            static init() {
                // Initialize search functionality
                this.searchTimeout = null;
                this.currentResults = [];
            }
            
            static handleSearch(query) {
                // Clear previous timeout
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                
                // Debounce search
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            }
            
            static performSearch(query) {
                if (!query || query.trim().length < 2) {
                    this.hideResults();
                    return;
                }
                
                AppDataStore.isSearching = true;
                const searchQuery = query.trim();
                
                // Filter products based on search query
                const results = AppDataStore.products.filter(product => 
                    product.matchesSearch(searchQuery)
                );
                
                this.currentResults = results;
                this.displayResults(results, searchQuery);
                
                // Also filter the main product grid
                MenuController.renderProducts(results);
            }
            
            static displayResults(results, query) {
                const resultsContainer = document.getElementById('search-results');
                const mobileResultsContainer = document.getElementById('mobile-search-results');
                
                if (results.length === 0) {
                    const noResultsHTML = `
                        <div class="p-6 text-center">
                            <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
                            <p class="text-gray-500">Không tìm thấy sản phẩm nào</p>
                            <p class="text-gray-400 text-sm">Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    `;
                    if (resultsContainer) resultsContainer.innerHTML = noResultsHTML;
                    if (mobileResultsContainer) mobileResultsContainer.innerHTML = noResultsHTML;
                } else {
                    const resultsHTML = results.slice(0, 8).map(product => `
                        <div class="search-result-item" onclick="SearchController.selectProduct(${product.id})">
                            <div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                <span class="text-xl">${product.image}</span>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold text-dark">${this.highlightText(product.name, query)}</h4>
                                <p class="text-sm text-gray-500">${product.getCategoryName()}</p>
                                <p class="text-primary font-bold">${product.getFormattedPrice()}</p>
                            </div>
                            <button onclick="event.stopPropagation(); CartController.addToCart(${product.id})" class="btn-primary px-3 py-1 text-sm">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    `).join('');
                    
                    if (resultsContainer) resultsContainer.innerHTML = resultsHTML;
                    if (mobileResultsContainer) mobileResultsContainer.innerHTML = resultsHTML;
                }
                
                this.showResults();
            }
            
            static highlightText(text, query) {
                if (!query) return text;
                
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                return text.replace(regex, '<span class="highlight">$1</span>');
            }
            
            static selectProduct(productId) {
                const product = AppDataStore.products.find(p => p.id === productId);
                if (product) {
                    // Scroll to product in menu
                    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
                    
                    // Highlight the product card briefly
                    setTimeout(() => {
                        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                        if (productCard) {
                            productCard.style.transform = 'scale(1.05)';
                            productCard.style.boxShadow = '0 25px 50px rgba(5, 159, 62, 0.3)';
                            
                            setTimeout(() => {
                                productCard.style.transform = '';
                                productCard.style.boxShadow = '';
                            }, 2000);
                        }
                    }, 500);
                }
                
                this.hideResults();
                this.clearSearch();
            }
            
            static showResults() {
                const resultsContainer = document.getElementById('search-results');
                const mobileResultsContainer = document.getElementById('mobile-search-results');
                
                if (resultsContainer) {
                    resultsContainer.classList.add('active');
                }
                if (mobileResultsContainer) {
                    mobileResultsContainer.classList.add('active');
                }
            }
            
            static hideResults() {
                const resultsContainer = document.getElementById('search-results');
                const mobileResultsContainer = document.getElementById('mobile-search-results');
                
                if (resultsContainer) {
                    resultsContainer.classList.remove('active');
                }
                if (mobileResultsContainer) {
                    mobileResultsContainer.classList.remove('active');
                }
                
                // Reset product grid if not actively searching
                if (AppDataStore.isSearching) {
                    AppDataStore.isSearching = false;
                    MenuController.filterByCategory(AppDataStore.currentCategory);
                }
            }
            
            static clearSearch() {
                const searchInput = document.getElementById('search-input');
                const mobileSearchInput = document.getElementById('mobile-search-input');
                
                if (searchInput) searchInput.value = '';
                if (mobileSearchInput) mobileSearchInput.value = '';
            }
        }

        class CategoryController {
          static async loadAndRender() {
            try {
              const rows = await API.getCategories();       // GET /api/categories
              // chuẩn hoá: mỗi item cần có id + name
              AppDataStore.categories = (rows || []).map(c => ({
                id:   c.id,
                name: c.name ?? c.title ?? 'Danh mục'
              }));
              this.renderFilter();
            } catch (e) {
              console.error('Load categories failed:', e);
              // vẫn render nút "Tất cả" để UI không trống
              this.renderFilter();
            }
          }

          static renderFilter() {
            const host = document.getElementById('category-filter');
            if (!host) return;

            const makeBtn = (id, label, active=false) => `
              <button
                class="category-btn ${active ? 'active' : ''}"
                data-category-id="${id}"
                onclick="MenuController.filterByCategoryId('${id}')">
                <i class="fas ${id==='all' ? 'fa-th-large' : 'fa-tags'} mr-2"></i>${label}
              </button>`;

            const allBtn = makeBtn('all', 'Tất cả', AppDataStore.currentCategoryId==='all');
            const catBtns = (AppDataStore.categories || [])
              .map(c => makeBtn(String(c.id), c.name, String(AppDataStore.currentCategoryId)===String(c.id)))
              .join('');

            host.innerHTML = allBtn + catBtns;
          }
        }


        class MenuController {
          static async loadProducts() {
          try {
            const rows = await API.getProducts({ /* tạm thời không truyền active */ });
            console.log('API /api/products ->', rows);  // <--- thêm dòng này
            AppDataStore.products = rows.map(mapBackendProduct);
            this.filterByCategoryId(AppDataStore.currentCategoryId);
          } catch (err) {
            console.error('Load products failed:', err);
              const grid = document.getElementById('products-grid');
              if (grid) {
                grid.innerHTML = `
                  <div class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-red-600">
                    Không tải được thực đơn. Vui lòng F5 hoặc thử lại sau.
                  </div>`;
              }
            }
          }

          static renderProducts(products) {
            const grid = document.getElementById('products-grid');
            if (!grid) return;

            if (!products.length) {
              grid.innerHTML = `
                <div class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-gray-500">
                  Chưa có sản phẩm nào.
                </div>`;
              return;
            }

            grid.innerHTML = products.map(product => {
              const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : null;
              const out   = (stock !== null && stock <= 0);

              return `
                <div class="product-card animate-fadeInUp ${out ? 'sold-out' : ''}"
                    data-category="${product.category}"
                    data-product-id="${product.id}">
                  <div class="product-image relative">
                    ${out ? `
                      <span class="sold-badge">Hết hàng</span>
                    ` : ''}
                    <img src="${product.imageUrl}"
                        alt="${product.name}"
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='/images/placeholder.png'">
                  </div>
                  <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-primary font-semibold">${product.categoryLabel || product.getCategoryName()}</span>
                      <div class="flex items-center">
                        <i class="fas fa-star text-yellow-400 text-sm"></i>
                        <span class="text-sm text-gray-600 ml-1">${product.rating ?? 5}</span>
                      </div>
                    </div>
                    <h3 class="text-xl font-bold text-dark mb-2">${product.name}</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">${product.description || ''}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-2xl font-bold text-primary">${product.getFormattedPrice()}</span>
                      <button
                        class="btn-primary px-6 py-2 ${out ? 'opacity-60 cursor-not-allowed' : ''}"
                        data-product-id="${product.id}"
                        ${stock !== null ? `data-stock="${stock}"` : ''}
                        ${out ? 'disabled' : ''}
                        onclick="${out ? 'void(0)' : `CartController.addToCart(${product.id})`}">
                        <i class="fas fa-plus mr-2"></i>${out ? 'Hết hàng' : 'Thêm'}
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('');

            // Gọi guard để khóa lại các nút (phòng trường hợp DOM vừa cập nhật)
            StockGuard.refreshButtons?.();

          }

          static filterByCategoryId(categoryId) {
            AppDataStore.currentCategoryId = categoryId;
            AppDataStore.isSearching = false;

            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            const safe = (window.CSS && CSS.escape) ? CSS.escape(String(categoryId)) : String(categoryId).replace(/"/g, '\\"');
            const activeBtn = document.querySelector(`[data-category-id="${safe}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            const filtered = (categoryId === 'all')
              ? AppDataStore.products
              : AppDataStore.products.filter(p => String(p.categoryId) === String(categoryId));

            this.renderProducts(filtered);
            SearchController.clearSearch?.();
            SearchController.hideResults?.();
          }

        };
        
        const AuthUI = {
          state: { auth: false, email: null, roles: [] },

        async refresh() {
          try {
            const res = await fetch('/whoami', { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' });
            const data = await res.json();
            this.state = data;
            this.render();
          } catch (e) { console.error('whoami failed', e); }
        },

        render() {
          const menu = document.getElementById('account-menu'); // div chứa dropdown “Tài khoản”
          if (!menu) return;

          if (this.state.auth) {
            menu.innerHTML = `
              <div class="px-4 py-2 font-semibold">Tài khoản</div>
              <a class="menu-item">Thông tin cá nhân</a>
              <a class="menu-item">Đơn hàng của tôi</a>
              <button id="btn-logout" class="menu-item text-red-500">Đăng xuất</button>
            `;
            document.getElementById('btn-logout')?.addEventListener('click', AuthUI.logout);
          } else {
            menu.innerHTML = `
              <div class="px-4 py-2 font-semibold">Tài khoản</div>
              <button id="btn-login-open"  class="menu-item">Đăng nhập</button>
              <button id="btn-register-open" class="menu-item">Đăng ký</button>
            `;
            // mở modal đăng nhập/đăng ký của bạn nếu có
            document.getElementById('btn-login-open')?.addEventListener('click', () => AppController?.openLoginModal?.());
            document.getElementById('btn-register-open')?.addEventListener('click', () => AppController?.openRegisterModal?.());
          }
        },

        getCsrf() {
          return document.querySelector('meta[name="csrf-token"]')?.content || '';
        },

        async logout() {
          try {
            await fetch('/logout', {
              method: 'POST',
              headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': AuthUI.getCsrf() },
              credentials: 'same-origin'
            });
            AuthUI.state = { auth: false };
            AuthUI.render();
            // dọn giỏ client nếu cần
            if (window.AppDataStore) AppDataStore.cart = [];
            CartController?.updateCartDisplay?.();
          } catch (e) { console.error('logout failed', e); }
        }
        };

        async function ensureLoggedIn() {
          // Nếu đã biết trạng thái rồi thì dùng ngay
          if (AuthUI?.state?.auth) return true;

          // Làm mới trạng thái từ /whoami
          await AuthUI?.refresh?.();
          if (AuthUI?.state?.auth) return true;

          // Mời đăng nhập (tuỳ project bạn có modal hay section gì thì gọi đúng hàm)
          if (window.AppController?.openLoginModal) {
            AppController.openLoginModal();
          } else {
            AppController?.showNotification?.('Bạn cần đăng nhập để thanh toán.', 'error');
            // Hoặc scroll đến vùng đăng nhập nếu có:
            document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return false;
        }


        // chạy khi trang load
        document.addEventListener('DOMContentLoaded', () => {
          AuthUI.refresh();
        });


        window.StockGuard = {
          refreshButtons() {
            document.querySelectorAll('button[data-stock]').forEach(btn => {
              const stock = Number(btn.getAttribute('data-stock'));
              if (Number.isFinite(stock) && stock <= 0) {
                btn.setAttribute('disabled', 'disabled');
                btn.classList.add('opacity-60','cursor-not-allowed');
                if (!btn.dataset.boundSoldout) {
                  btn.dataset.boundSoldout = '1';
                  btn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    AppController?.showNotification?.('Sản phẩm đã hết hàng!', 'error');
                  }, { capture: true });
                }
              }
            });
          }
        };

        class CartController {
            // static addToCart(productId) {
            //     const product = AppDataStore.products.find(p => p.id === productId);
            //     if (!product) return;
                
            //     const existingItem = AppDataStore.cart.find(item => item.product.id === productId);
                
            //     if (existingItem) {
            //         existingItem.quantity += 1;
            //     } else {
            //         AppDataStore.cart.push(new CartItem(product));
            //     }
                
            //     this.updateCartDisplay();
            //     AppController.showNotification(`${product.name} đã được thêm vào giỏ hàng!`);
                
            //     // Add visual feedback
            //     const button = event.target.closest('button');
            //     if (button) {
            //         button.style.transform = 'scale(0.95)';
            //         setTimeout(() => {
            //             button.style.transform = '';
            //         }, 150);
            //     }
            // }
            // static removeFromCart(productId) {
            //     const item = AppDataStore.cart.find(item => item.product.id === productId);
            //     AppDataStore.cart = AppDataStore.cart.filter(item => item.product.id !== productId);
            //     this.updateCartDisplay();
            //     this.renderCartItems();
                
            //     if (item) {
            //         AppController.showNotification(`${item.product.name} đã được xóa khỏi giỏ hàng!`);
            //     }
            // }
            // static updateQuantity(productId, quantity) {
            //     const item = AppDataStore.cart.find(item => item.product.id === productId);
            //     if (item) {
            //         if (quantity <= 0) {
            //             this.removeFromCart(productId);
            //         } else {
            //             item.quantity = quantity;
            //             this.updateCartDisplay();
            //             this.renderCartItems();
            //         }
            //     }
            // }
            
            static getCsrf() {
              return document.querySelector('meta[name="csrf-token"]')?.content || '';
            }

            static async loadCartFromServer() {
              try {
                const res = await fetch('/cart/show', { headers: { 'X-Requested-With': 'XMLHttpRequest' },credentials: 'same-origin'});
                const data = await res.json();
                

                // Map về AppDataStore.cart theo cấu trúc hiện tại của bạn:
                // server items: [{product_id, name, price, qty, image}]
                // client items: new CartItem(product) { quantity }
                const productsMap = new Map((AppDataStore.products || []).map(p => [p.id, p]));
                AppDataStore.cart = (data.items || []).map(row => {
                  const p = productsMap.get(row.product_id) || {
                    id: row.product_id,
                    name: row.name,
                    price: row.price,
                    image: row.image,
                    // thêm các method giả để tránh lỗi hiển thị
                    getCategoryName(){ return ''; },
                    getFormattedPrice(){ return (row.price || 0).toLocaleString('vi-VN') + 'đ'; }
                  };
                  const item = new CartItem(p);
                  item.quantity = row.qty || 1;
                  return item;
                });

                CartController.updateCartDisplay();
                CartController.renderCartItems();
                return data;
              } catch (e) {
                console.error('loadCartFromServer failed', e);
              }
            }

            static notify(msg, type='success'){
              if (window.AppController?.showNotification) AppController.showNotification(msg, type);
              else alert(msg);
            }
            
            
            static async addToCart(productId) {
              const product = AppDataStore.products.find(p => p.id === productId);
              if (!product) return;

              try {
                const res = await fetch('/cart/add', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': CartController.getCsrf()
                  },
                  body: JSON.stringify({ product_id: productId, qty: 1 }),
                  credentials: 'same-origin'
                });
                const data = await res.json();

                // Đồng bộ lại giỏ
                await CartController.loadCartFromServer();
                CartController.notify(`${product.name} đã được thêm vào giỏ hàng!`);

                // feedback nút
                const button = event?.target?.closest('button');
                if (button) {
                  button.style.transform = 'scale(0.95)';
                  setTimeout(() => { button.style.transform = ''; }, 150);
                }
              } catch (e) {
                console.error(e);
                CartController.notify('Không thể thêm vào giỏ', 'error');
              }
            }

            static async removeFromCart(productId) {
              const item = AppDataStore.cart.find(item => item.product.id === productId);
              try {
                const res = await fetch('/cart/remove', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': CartController.getCsrf()
                  },
                  body: JSON.stringify({ product_id: productId }),
                  credentials: 'same-origin'
                });
                await res.json();

                await CartController.loadCartFromServer();
                if (item) CartController.notify(`${item.product.name} đã được xóa khỏi giỏ hàng!`);
              } catch (e) {
                console.error(e);
                CartController.notify('Không thể xóa khỏi giỏ', 'error');
              }
            }

            static async updateQuantity(productId, quantity) {
              if (quantity < 0) return;
              try {
                const res = await fetch('/cart/update', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': CartController.getCsrf()
                  },
                  body: JSON.stringify({ product_id: productId, qty: quantity }),
                  credentials: 'same-origin'
                });
                await res.json();

                await CartController.loadCartFromServer();
              } catch (e) {
                console.error(e);
                CartController.notify('Không thể cập nhật số lượng', 'error');
              }
            }

            static updateCartDisplay() {
              const cartCount = document.getElementById('cart-count');
              const totalItems = AppDataStore.cart.reduce((sum, item) => sum + item.quantity, 0);
              if (cartCount) {
                cartCount.textContent = totalItems;
                if (totalItems > 0) {
                  cartCount.style.transform = 'scale(1.2)';
                  setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 200);
                }
              }

              const cartTotal = document.getElementById('cart-total');
              const total = AppDataStore.cart.reduce((sum, item) => sum + item.getTotalPrice(), 0);
              if (cartTotal) cartTotal.textContent = total.toLocaleString('vi-VN') + 'đ';
            }
            
            static toggleCart() {
              const sidebar = document.getElementById('cart-sidebar');
              const overlay = document.getElementById('cart-overlay');

              sidebar.classList.toggle('active');
              overlay.classList.toggle('active');

              if (sidebar.classList.contains('active')) {
                // khi mở panel: tải giỏ từ server để luôn đúng
                CartController.loadCartFromServer();
                document.body.style.overflow = 'hidden';
              } else {
                document.body.style.overflow = 'auto';
              }
            }
            
            static closeCart() {
              const sidebar = document.getElementById('cart-sidebar');
              const overlay = document.getElementById('cart-overlay');

              sidebar.classList.remove('active');
              overlay.classList.remove('active');
              document.body.style.overflow = 'auto';
            }
            
            static renderCartItems() {
              const container = document.getElementById('cart-items');

              if (AppDataStore.cart.length === 0) {
                container.innerHTML = `
                  <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">Giỏ hàng trống</p>
                    <p class="text-gray-400">Hãy thêm sản phẩm vào giỏ hàng</p>
                    <button onclick="CartController.closeCart(); AppController.scrollToMenu()" class="btn-primary mt-4">
                      <i class="fas fa-coffee mr-2"></i>Khám phá thực đơn
                    </button>
                  </div>
                `;
                return;
              }

              container.innerHTML = AppDataStore.cart.map(item => `
                <div class="flex items-center space-x-4 p-4 border-b border-gray-100 hover:bg-light transition-colors rounded-lg">
                  <div class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                    <span class="text-2xl">${item.product.image || ''}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-dark">${item.product.name}</h4>
                    <p class="text-sm text-gray-500">${item.product.getCategoryName ? item.product.getCategoryName() : ''}</p>
                    <p class="text-primary font-bold">${item.product.getFormattedPrice ? item.product.getFormattedPrice() : (item.product.price||0).toLocaleString('vi-VN')+'đ'}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button onclick="CartController.updateQuantity(${item.product.id}, ${item.quantity - 1})" class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                      <i class="fas fa-minus text-sm"></i>
                    </button>
                    <span class="w-8 text-center font-semibold">${item.quantity}</span>
                    <button onclick="CartController.updateQuantity(${item.product.id}, ${item.quantity + 1})" class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                      <i class="fas fa-plus text-sm"></i>
                    </button>
                  </div>
                  <button onclick="CartController.removeFromCart(${item.product.id})" class="text-red-500 hover:text-red-700 transition-colors p-2">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('');
            }
            

            static async checkout(event) {
              const btn = event?.target;
              const old = btn?.innerHTML;
              
              // ✅ BẮT BUỘC đăng nhập trước khi thanh toán
              const ok = await ensureLoggedIn();
              if (!ok) return;

              if (!AppDataStore?.cart?.length) {
                AppController?.showNotification?.('Giỏ hàng trống!', 'error');
                return;
              }



              if (btn) { btn.disabled = true; btn.innerHTML = '<div class="loading"></div> Đang xử lý...'; }
              try {
                // KHÔNG gửi body items. Server sẽ đọc giỏ từ session.
                const res = await fetch('/checkout', {
                  method: 'POST',
                  headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': CartController.getCsrf()
                  }
                });

                const text = await res.text();
                if (!res.ok) throw new Error(text || `Lỗi ${res.status}`);
                const data = JSON.parse(text);

                // Làm sạch client & đồng bộ lại từ server để chắc chắn
                window.AppDataStore && (AppDataStore.cart = []);
                await CartController.loadCartFromServer();
                CartController.closeCart?.();
                AppController?.showNotification?.('Đặt hàng thành công!', 'success');
                console.log('order:', data.order);
              } catch (e) {
                AppController?.showNotification?.(e.message || 'Thanh toán thất bại', 'error');
                console.error(e);
              } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = old; }
              }
            }

            
        }
        window.CartController = CartController;

class AuthController {
  static showLogin() { this.closeModal('register-modal'); this.openModal('login-modal'); }
  static showRegister() { this.closeModal('login-modal'); this.openModal('register-modal'); }
  static switchToLogin() { this.closeModal('register-modal'); this.openModal('login-modal'); }
  static switchToRegister() { this.closeModal('login-modal'); this.openModal('register-modal'); }

  static openModal(id){ const m=document.getElementById(id); m?.classList.add('active'); document.body.style.overflow='hidden'; }
  static closeModal(id){ const m=document.getElementById(id); m?.classList.remove('active'); document.body.style.overflow='auto'; }

  static async login(event){
    event.preventDefault();
    const form = event.target;
    const btn  = form.querySelector('button[type="submit"]'); const original = btn.innerHTML;

    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      identifier: (data.identifier || data.email || data.phone || '').trim(),
      password: data.password || '',
      remember: !!data.remember
    };
    if (!payload.identifier || !payload.password) {
      AppController.showNotification('Vui lòng nhập đầy đủ thông tin.', 'error'); return;
    }

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || null;
    btn.innerHTML = '<div class="loading"></div> Đang đăng nhập...'; btn.disabled = true;

    try {
      const res = await apiFetch('/login', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(csrf?{'X-CSRF-TOKEN':csrf}:{}) },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        let msg='Đăng nhập thất bại.';
        if(res.status===401) msg='Email/SĐT hoặc mật khẩu không đúng.';
        if(res.status===419) msg='Phiên hết hạn (CSRF). Tải lại trang rồi thử lại.';
        if(res.status===422){ const err=await res.json().catch(()=>({})); msg=err?.message||msg; }
        throw new Error(msg);
      }
      const json = await res.json();
      const u = json.user || {};
      AppDataStore.currentUser = new User(
        u.id,
        (u.name||'').split(' ').slice(0,-1).join(' ') || 'User',
        (u.name||'').split(' ').slice(-1).join(' ') || '',
        u.email || null,
        u.phone || null
      );

      setAdminLink(u.role === 'manager' || u.role === 'admin');
setStaffLink(u.role === 'staff');


      this.closeModal('login-modal');
      this.updateUserInterface();
      AppController.showNotification(json.message || 'Đăng nhập thành công!');
      form.reset();
      await this.refreshCsrf();                 // cập nhật token cho lần sau
    } catch(e){
      AppController.showNotification(e.message || 'Có lỗi khi đăng nhập.', 'error');
    } finally {
      btn.innerHTML = original; btn.disabled = false;
    }
  }

  static async register(event){
    event.preventDefault();
    const form = event.target;
    const btn  = form.querySelector('button[type="submit"]'); const original = btn.innerHTML;

    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.password || data.password !== data.confirmPassword) {
      AppController.showNotification('Mật khẩu xác nhận không khớp!', 'error'); return;
    }
    const payload = {
      firstName: data.firstName?.trim() || '',
      lastName:  data.lastName?.trim()  || '',
      email:     data.email?.trim()     || null,
      phone:     data.phone?.trim()     || null,
      password:  data.password,
      password_confirmation: data.confirmPassword
    };
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || null;

    btn.innerHTML = '<div class="loading"></div> Đang tạo tài khoản...'; btn.disabled = true;

    try {
      const res = await apiFetch('/register', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(csrf?{'X-CSRF-TOKEN':csrf}:{}) },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        let msg='Đăng ký thất bại. Vui lòng thử lại.';
        if(res.status===422){ const err=await res.json().catch(()=>({})); 
          if(err?.errors){ const k=Object.keys(err.errors)[0]; if(k && Array.isArray(err.errors[k])) msg=err.errors[k][0]; }
          else if(err?.message) msg=err.message;
        }
        throw new Error(msg);
      }

      const json = await res.json();
      const u = json.user || {};
      AppDataStore.currentUser = new User(
        u.id ?? Date.now(),
        (u.name||'').split(' ').slice(0,-1).join(' ') || payload.firstName,
        (u.name||'').split(' ').slice(-1).join(' ')  || payload.lastName,
        u.email ?? payload.email,
        u.phone ?? payload.phone
      );

      this.closeModal('register-modal');
      this.updateUserInterface();
      AppController.showNotification(json.message || 'Đăng ký thành công!');
      form.reset();
      await this.refreshCsrf();
    } catch(e){
      AppController.showNotification(e.message || 'Có lỗi xảy ra khi đăng ký.', 'error');
    } finally { btn.innerHTML = original; btn.disabled = false; }
  }

  static async logout(){
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || null;
    try{
      await apiFetch('/logout', { method:'POST', headers:{ ...(csrf?{'X-CSRF-TOKEN':csrf}:{}) } });
    }catch(_){}
    AppDataStore.currentUser=null;
    setAdminLink(false);
setStaffLink(false);
    this.updateUserInterface?.();
    AppController?.showNotification?.('Đã đăng xuất');
    await this.refreshCsrf();
  }

  static async refreshCsrf(){
    try{
      const res = await apiFetch('/csrf');
      const data = await res.json();
      const el = document.querySelector('meta[name="csrf-token"]');
      if (el && data?.token) el.setAttribute('content', data.token);
    }catch(_){}
  }

 static async bootstrapSession() {
  try {
    const res = await apiFetch('/whoami');
    if (!res.ok) throw new Error('whoami failed');
    const info = await res.json();
    AppDataStore.currentUser = info?.auth ? { id: info.id, role: info.role } : null;

    // Reset links trước
    setAdminLink(false);
    setStaffLink(false);

    if (info?.auth) {
      if (info.role === 'admin' || info.role === 'manager') {
        setAdminLink(true);
      } else if (info.role === 'staff') {
        setStaffLink(true);
      }
    }
  } catch (_) {
    AppDataStore.currentUser = null;
  }

  this.updateUserInterface?.();
  await this.refreshCsrf();
}


  static updateUserInterface(){
    const userBtn = document.querySelector('button[onclick*="toggleUserMenu"] span');
    const dropdown = document.getElementById('user-menu')?.querySelector('.py-2');
    if(!userBtn || !dropdown) return;

    if (AppDataStore.currentUser) {
      const full = (AppDataStore.currentUser.getFullName?.()) || 'Tài khoản';
      userBtn.textContent = full;
      dropdown.innerHTML = `
        <div class="px-4 py-3 border-b bg-light">
          <p class="font-semibold text-primary">${full}</p>
          <p class="text-sm text-gray-500">${AppDataStore.currentUser.email || ''}</p>
        </div>
        <button onclick="AuthController.showProfile()" class="w-full text-left px-4 py-2 hover:bg-gray-100">
          <i class="fas fa-user mr-2"></i>Thông tin cá nhân
        </button>
        <button onclick="AuthController.showOrders()" class="w-full text-left px-4 py-2 hover:bg-gray-100">
          <i class="fas fa-shopping-bag mr-2"></i>Đơn hàng của tôi
        </button>
        <button onclick="AuthController.logout()" class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
          <i class="fas fa-sign-out-alt mr-2"></i>Đăng xuất
        </button>`;
    } else {
      userBtn.textContent = 'Tài khoản';
      dropdown.innerHTML = `
        <button onclick="AuthController.showLogin()" class="w-full text-left px-4 py-2 hover:bg-gray-100">
          <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
        </button>
        <button onclick="AuthController.showRegister()" class="w-full text-left px-4 py-2 hover:bg-gray-100">
          <i class="fas fa-user-plus mr-2"></i>Đăng ký
        </button>`;
    }
  }

  static showProfile(){ AppController.showNotification('Tính năng đang phát triển!'); UserController.closeUserMenu(); }
  static showOrders(){ AppController.showNotification('Tính năng đang phát triển!'); UserController.closeUserMenu(); }
}

class UserController {
  static toggleUserMenu() {
      const menu = document.getElementById('user-menu');
      const isVisible = menu.style.opacity === '1';
      
      if (isVisible) {
          this.closeUserMenu();
      } else {
          this.openUserMenu();
      }
  }
  
  static openUserMenu() {
      const menu = document.getElementById('user-menu');
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
      menu.style.transform = 'scale(1)';
  }
  
  static closeUserMenu() {
      const menu = document.getElementById('user-menu');
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
      menu.style.transform = 'scale(0.95)';
  }
}





        class ContactController {
            static submitForm(event) {
                event.preventDefault();
                const formData = new FormData(event.target);
                const button = event.target.querySelector('button[type="submit"]');
                const originalText = button.innerHTML;
                
                button.innerHTML = '<div class="loading"></div> Đang gửi...';
                button.disabled = true;
                
                setTimeout(() => {
                    event.target.reset();
                    AppController.showNotification('Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
                    
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
        }

        // === APPLICATION BOOTSTRAP ===
        document.addEventListener('DOMContentLoaded', function() {
            AppController.init();
            console.log('🚀 ChumTea Website Started');
            console.log('🏗️ MVC Architecture: Models → Views → Controllers');
            console.log('✨ Features: Menu, Cart, Auth, Contact, Search, Responsive Design');
            console.log('🎨 Brand Color: #059F3E (Green Theme)');
        });
    

