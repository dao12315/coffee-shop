<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>ChumTea - Thưởng thức hương vị tuyệt vời</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/css/site.css">
   

</head>
<body class="bg-gray-50">
    <!-- === NAVIGATION === -->
    <nav class="navbar fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <i class="fas fa-leaf text-white text-xl"></i>
                </div>
                <div>
                    <h1 class="text-2xl font-bold gradient-text">ChumTea</h1>
                    <p class="text-xs text-gray-500">Premium Coffee & Tea</p>
                </div>
            </div>
            
            <!-- Search Bar -->
            <div class="hidden md:block flex-1 max-w-md mx-8">
                <div class="search-container">
                    <input 
                        type="text" 
                        id="search-input"
                        class="search-input" 
                        placeholder="Tìm kiếm đồ uống..."
                        oninput="SearchController.handleSearch(this.value)"
                        onfocus="SearchController.showResults()"
                    >
                    <button class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                    <div id="search-results" class="search-results">
                        <!-- Search results will appear here -->
                    </div>
                </div>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden lg:flex items-center space-x-8">
                <a href="#home" class="text-gray-700 hover:text-primary font-medium transition-colors">Trang chủ</a>
                <a href="#menu" class="text-gray-700 hover:text-primary font-medium transition-colors">Thực đơn</a>
                <a href="#about" class="text-gray-700 hover:text-primary font-medium transition-colors">Về chúng tôi</a>
                <a href="#contact" class="text-gray-700 hover:text-primary font-medium transition-colors">Liên hệ</a>
            </div>
            
            <!-- User Actions -->
            <div class="flex items-center space-x-4">
                <!-- User Menu -->
                <div class="relative">
                    <button onclick="UserController.toggleUserMenu()" class="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors">
                        <i class="fas fa-user text-lg"></i>
                        <span class="hidden md:inline">Tài khoản</span>
                        <i class="fas fa-chevron-down text-sm"></i>
                    </button>
                    
                    <div id="user-menu" class="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible transition-all duration-300 transform scale-95">
                        <div class="py-2">
                            <button onclick="AuthController.showLogin()" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                                <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                            </button>
                            <button onclick="AuthController.showRegister()" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                                <i class="fas fa-user-plus mr-2"></i>Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
                <div id="admin-top-slot" class="hidden md:block">  
<div id="staff-top-slot" class="hidden md:block"></div>
{{-- Nút điều hướng dành cho nhân viên --}}



    </div>
                <!-- Cart -->
                <button onclick="CartController.toggleCart()" class="relative text-gray-700 hover:text-primary transition-colors">
                    <i class="fas fa-shopping-cart text-xl"></i>
                    <span id="cart-count" class="absolute -top-2 -right-2 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                </button>
                
                <!-- Mobile Menu -->
                <button onclick="AppController.toggleMobileMenu()" class="lg:hidden text-gray-700">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
    </nav>

    <!-- === HERO SECTION === -->
    <section id="home" class="hero-bg flex items-center justify-center text-white relative">
        <!-- Floating Elements -->
        <div class="floating-element floating-1 flex items-center justify-center">
            <i class="fas fa-coffee text-2xl text-white"></i>
        </div>
        <div class="floating-element floating-2 flex items-center justify-center">
            <i class="fas fa-leaf text-xl text-white"></i>
        </div>
        <div class="floating-element floating-3 flex items-center justify-center">
            <i class="fas fa-mug-hot text-3xl text-white"></i>
        </div>
        <div class="floating-element floating-4 flex items-center justify-center">
            <i class="fas fa-seedling text-xl text-white"></i>
        </div>
        
        <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div class="animate-fadeInUp">
                <h1 class="text-5xl md:text-7xl font-bold mb-6">
                    Chào mừng đến với
                    <span class="block text-white drop-shadow-lg">ChumTea</span>
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
                    Thưởng thức hương vị tuyệt vời của cà phê và trà cao cấp, 
                    được pha chế tỉ mỉ từ những nguyên liệu chọn lọc nhất
                </p>
                
                <!-- Mobile Search -->
                <div class="md:hidden mb-8">
                    <div class="search-container">
                        <input 
                            type="text" 
                            id="mobile-search-input"
                            class="search-input" 
                            placeholder="Tìm kiếm đồ uống..."
                            oninput="SearchController.handleSearch(this.value)"
                            onfocus="SearchController.showResults()"
                        >
                        <button class="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                        <div id="mobile-search-results" class="search-results">
                            <!-- Mobile search results will appear here -->
                        </div>
                    </div>
                </div>
                
             <!--   <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="AppController.scrollToMenu()" class="btn-primary text-lg px-8 py-4">
                        <i class="fas fa-coffee mr-2"></i>Khám phá thực đơn
                    </button>
                    <button onclick="AppController.scrollToContact()" class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-primary transition-all">
                        <i class="fas fa-phone mr-2"></i>Liên hệ ngay
                    </button>
                </div> -->
            
    <!-- Admin link sẽ được chèn ở đây khi đủ điều kiện -->
  </div>
            </div>
        </div>
    </section>

    <!-- === MENU SECTION === -->
    <section id="menu" class="section-padding bg-white">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16 animate-fadeInUp">
                <h2 class="text-4xl md:text-5xl font-bold gradient-text mb-4">Thực Đơn Đặc Biệt</h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Khám phá bộ sưu tập đồ uống phong phú với hương vị độc đáo và chất lượng cao cấp
                </p>
            </div>
            
            <!-- Category Filter -->
          
             <!-- Category Filter (dynamic) -->
<div id="category-filter" class="flex flex-wrap justify-center gap-4 mb-12 animate-fadeInUp">
  <!-- JS sẽ render nút danh mục thật ở đây, kèm nút Tất cả -->
</div>

            
            <!-- Products Grid -->
            <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <!-- Products will be loaded here -->
            </div>
        </div>
    </section>

    <!-- === ABOUT SECTION === -->
    <section id="about" class="section-padding bg-light">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div class="animate-fadeInLeft">
                    <h2 class="text-4xl md:text-5xl font-bold gradient-text mb-6">Về ChumTea</h2>
                    <p class="text-lg text-gray-700 mb-6 leading-relaxed">
                        Với hơn 10 năm kinh nghiệm trong ngành đồ uống, ChumTea tự hào mang đến cho khách hàng 
                        những sản phẩm chất lượng cao nhất. Chúng tôi cam kết sử dụng nguyên liệu tươi ngon, 
                        được chọn lọc kỹ càng từ những vùng trồng uy tín.
                    </p>
                    <div class="grid grid-cols-2 gap-6 mb-8">
                        <div class="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div class="stat-number mb-2">50+</div>
                            <div class="text-gray-600 font-medium">Loại đồ uống</div>
                        </div>
                        <div class="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div class="stat-number mb-2">10K+</div>
                            <div class="text-gray-600 font-medium">Khách hàng hài lòng</div>
                        </div>
                        <div class="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div class="stat-number mb-2">5</div>
                            <div class="text-gray-600 font-medium">Chi nhánh</div>
                        </div>
                        <div class="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div class="stat-number mb-2">24/7</div>
                            <div class="text-gray-600 font-medium">Phục vụ</div>
                        </div>
                    </div>
                    <button class="btn-primary">
                        <i class="fas fa-arrow-right mr-2"></i>Tìm hiểu thêm
                    </button>
                </div>
                
                <div class="animate-fadeInRight">
                    <div class="relative">
                        <div class="w-full h-96 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl">
                            <i class="fas fa-store text-8xl text-white opacity-80"></i>
                        </div>
                        <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-full flex items-center justify-center animate-pulse shadow-xl">
                            <i class="fas fa-award text-4xl text-primary"></i>
                        </div>
                        <div class="absolute -top-6 -left-6 w-24 h-24 bg-secondary rounded-full flex items-center justify-center animate-float shadow-lg">
                            <i class="fas fa-heart text-2xl text-white"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- === CONTACT SECTION === -->
    <section id="contact" class="section-padding bg-white">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16 animate-fadeInUp">
                <h2 class="text-4xl md:text-5xl font-bold gradient-text mb-4">Liên Hệ Với Chúng Tôi</h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe và giúp đỡ bạn
                </p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <!-- Contact Info -->
                <div class="animate-fadeInLeft">
                    <h3 class="text-2xl font-bold text-dark mb-8">Thông tin liên hệ</h3>
                    <div class="space-y-6">
                        <div class="flex items-center space-x-4 p-4 bg-light rounded-2xl">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                <i class="fas fa-map-marker-alt text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-dark">Địa chỉ</h4>
                                <p class="text-gray-600">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4 p-4 bg-light rounded-2xl">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                <i class="fas fa-phone text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-dark">Điện thoại</h4>
                                <p class="text-gray-600">1900 1234</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4 p-4 bg-light rounded-2xl">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                <i class="fas fa-envelope text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-dark">Email</h4>
                                <p class="text-gray-600">hello@chumtea.vn</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4 p-4 bg-light rounded-2xl">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                <i class="fas fa-clock text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-dark">Giờ mở cửa</h4>
                                <p class="text-gray-600">6:00 - 22:00 (Hàng ngày)</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Form -->
                <div class="animate-fadeInRight">
                    <div class="bg-light p-8 rounded-3xl shadow-lg">
                        <form onsubmit="ContactController.submitForm(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <input type="text" name="name" placeholder="Họ và tên *" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <input type="email" name="email" placeholder="Email *" class="form-input" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <input type="tel" name="phone" placeholder="Số điện thoại" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <input type="text" name="subject" placeholder="Tiêu đề *" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <textarea name="message" placeholder="Nội dung tin nhắn *" rows="5" class="form-input" required></textarea>
                            </div>
                            
                            <button type="submit" class="btn-primary w-full text-lg py-4">
                                <i class="fas fa-paper-plane mr-2"></i>Gửi tin nhắn
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- === FOOTER === -->
    <footer class="bg-dark text-white section-padding">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <!-- Company Info -->
                <div>
                    <div class="flex items-center space-x-3 mb-6">
                        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <i class="fas fa-leaf text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold">ChumTea</h3>
                            <p class="text-sm text-gray-400">Premium Coffee & Tea</p>
                        </div>
                    </div>
                    <p class="text-gray-400 mb-6 leading-relaxed">
                        Mang đến cho bạn những trải nghiệm tuyệt vời nhất với hương vị cà phê và trà cao cấp.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-light transition-colors shadow-lg">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-light transition-colors shadow-lg">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-light transition-colors shadow-lg">
                            <i class="fab fa-youtube"></i>
                        </a>
                        <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-light transition-colors shadow-lg">
                            <i class="fab fa-tiktok"></i>
                        </a>
                    </div>
                </div>
                
                <!-- Quick Links -->
                <div>
                    <h4 class="text-xl font-semibold mb-6">Liên kết nhanh</h4>
                    <ul class="space-y-3">
                        <li><a href="#home" class="text-gray-400 hover:text-primary transition-colors">Trang chủ</a></li>
                        <li><a href="#menu" class="text-gray-400 hover:text-primary transition-colors">Thực đơn</a></li>
                        <li><a href="#about" class="text-gray-400 hover:text-primary transition-colors">Về chúng tôi</a></li>
                        <li><a href="#contact" class="text-gray-400 hover:text-primary transition-colors">Liên hệ</a></li>
                    </ul>
                </div>
                
                <!-- Services -->
                <div>
                    <h4 class="text-xl font-semibold mb-6">Dịch vụ</h4>
                    <ul class="space-y-3">
                        <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">Giao hàng tận nơi</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">Đặt hàng online</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">Tư vấn thực đơn</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">Sự kiện đặc biệt</a></li>
                    </ul>
                </div>
                
                <!-- Contact -->
                <div>
                    <h4 class="text-xl font-semibold mb-6">Liên hệ</h4>
                    <div class="space-y-3">
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-map-marker-alt mr-3 text-primary"></i>
                            123 Nguyễn Huệ, Q1, HCM
                        </p>
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-phone mr-3 text-primary"></i>
                            1900 1234
                        </p>
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-envelope mr-3 text-primary"></i>
                            hello@chumtea.vn
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-700 pt-8 text-center">
                <p class="text-gray-400">
                    © 2024 ChumTea. Tất cả quyền được bảo lưu. 
                    <span class="text-primary">Made with 💚 in Vietnam</span>
                </p>
            </div>
        </div>
    </footer>

    <!-- === MODALS === -->
    
    <!-- Login Modal -->
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <div class="p-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold gradient-text">Đăng nhập</h3>
                    <button onclick="AuthController.closeModal('login-modal')" class="text-gray-500 hover:text-gray-700 transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form onsubmit="AuthController.login(event)" class="space-y-6">
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <input type="password" name="password" placeholder="Mật khẩu" class="form-input" required>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <label class="flex items-center">
  <input type="checkbox" name="remember" class="mr-2 accent-primary">
  <span class="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
</label>
                        <a href="#" class="text-sm text-primary hover:underline">Quên mật khẩu?</a>
                    </div>
                    
                    <button type="submit" class="btn-primary w-full text-lg py-4">
                        <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                    </button>
                    
                    <div class="text-center">
                        <p class="text-gray-600">
                            Chưa có tài khoản? 
                            <button type="button" onclick="AuthController.switchToRegister()" class="text-primary hover:underline font-semibold">
                                Đăng ký ngay
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Register Modal -->
    <div id="register-modal" class="modal">
        <div class="modal-content">
            <div class="p-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold gradient-text">Đăng ký</h3>
                    <button onclick="AuthController.closeModal('register-modal')" class="text-gray-500 hover:text-gray-700 transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form onsubmit="AuthController.register(event)" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <input type="text" name="firstName" placeholder="Họ" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <input type="text" name="lastName" placeholder="Tên" class="form-input" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <input type="tel" name="phone" placeholder="Số điện thoại" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <input type="password" name="password" placeholder="Mật khẩu" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" class="form-input" required>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="terms" required class="mr-2 accent-primary">
                        <label for="terms" class="text-sm text-gray-600">
                            Tôi đồng ý với <a href="#" class="text-primary hover:underline">Điều khoản sử dụng</a> 
                            và <a href="#" class="text-primary hover:underline">Chính sách bảo mật</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn-primary w-full text-lg py-4">
                        <i class="fas fa-user-plus mr-2"></i>Đăng ký
                    </button>
                    
                    <div class="text-center">
                        <p class="text-gray-600">
                            Đã có tài khoản? 
                            <button type="button" onclick="AuthController.switchToLogin()" class="text-primary hover:underline font-semibold">
                                Đăng nhập ngay
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- === CART SIDEBAR === -->
    <div id="cart-overlay" class="cart-overlay" onclick="CartController.closeCart()"></div>
    <div id="cart-sidebar" class="cart-sidebar">
        <div class="p-6 border-b bg-light">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold gradient-text">Giỏ hàng</h3>
                <button onclick="CartController.closeCart()" class="text-gray-500 hover:text-gray-700 transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        </div>
        
        <div id="cart-items" class="flex-1 p-6 overflow-y-auto">
            <!-- Cart items will be loaded here -->
        </div>
        
        <div class="p-6 border-t bg-light">
            <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-semibold">Tổng cộng:</span>
                <span id="cart-total" class="text-xl font-bold text-primary">0đ</span>
            </div>
            <button onclick="CartController.checkout()" class="btn-primary w-full text-lg py-4">
                <i class="fas fa-credit-card mr-2"></i>Thanh toán
            </button>
        </div>
    </div>
    <script src="{{ asset('js/site/app.js') }}" defer></script>
</body>
</html>
