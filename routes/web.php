<?php


use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Middleware\VerifyCsrfToken;

// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\EmployeeApiController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderController as ApiOrderController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| 🌐 Public pages + Auth endpoints (web + CSRF)
|--------------------------------------------------------------------------
*/
Route::view('/', 'site.index')->name('site.index');

// 🔐 Auth routes
Route::post('/register', [AuthController::class, 'register'])->name('register.post');
Route::post('/login',    [AuthController::class, 'login'])->name('login.post');
Route::post('/logout',   [AuthController::class, 'logout'])->name('logout.post');

// 🧩 Lấy CSRF token (cho SPA)
Route::get('/csrf', fn () => ['token' => csrf_token()])->name('csrf.token');

// 👤 Kiểm tra đăng nhập hiện tại
Route::get('/whoami', function () {
    $user = Auth::user();

    // Nếu user không tồn tại -> trả về false
    if (!$user) {
        return ['auth' => false];
    }

    // Hỗ trợ cả cột role và quan hệ roles()
    $roles = collect();
    if (isset($user->role)) {
        $roles->push($user->role);
    }
    if (method_exists($user, 'roles')) {
        $roles = $roles->merge($user->roles->pluck('name'));
    }

    $permissions = collect();
    if (method_exists($user, 'roles')) {
        $permissions = $user->roles->flatMap->permissions->pluck('name')->unique();
    }

    return [
        'auth' => true,
        'id' => $user->id,
        'email' => $user->email,
        'roles' => $roles->unique()->values(),
        'permissions' => $permissions->values(),
    ];
});

/*
|--------------------------------------------------------------------------
| 🧭 Admin page (view)
|--------------------------------------------------------------------------
| Chỉ admin và manager được vào giao diện quản trị chính
*/
Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    Route::view('/admin', 'admin.index')->name('admin.index');
});

/*
|--------------------------------------------------------------------------
| 👷 Staff page (view)
|--------------------------------------------------------------------------
| Nhân viên (staff) có thể vào cùng giao diện admin, 
| nhưng có thể bị giới hạn menu hoặc quyền thao tác.
*/
Route::middleware(['auth', 'role:staff,admin,manager'])->group(function () {
    Route::view('/staff', 'admin.index')->name('staff.index');
});

/*
|--------------------------------------------------------------------------
| 🧠 API JSON (prefix /api)
|--------------------------------------------------------------------------
| Bỏ CSRF cho toàn bộ API.
| Auth + Role + Permission vẫn kiểm soát đầy đủ.
*/
Route::prefix('api')
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->group(function () {


        Route::middleware(['auth', 'role:manager'])->group(function () {
        Route::apiResource('users', \App\Http\Controllers\Api\UserApiController::class);
    });


        /*
        |--------------------------------------------------------------------------
        | READ (public)
        |--------------------------------------------------------------------------
        | Không cần đăng nhập — dùng cho giao diện chính.
        */
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('categories/{category}', [CategoryController::class, 'show']);
        Route::get('products', [ProductController::class, 'index']);
        Route::get('products/{product}', [ProductController::class, 'show']);
        Route::get('inventory', [InventoryController::class, 'index']);

        /*
        |--------------------------------------------------------------------------
        | WRITE (admin + manager + staff)
        |--------------------------------------------------------------------------
        | Các hành động thêm/sửa bị giới hạn theo quyền cụ thể.
        */
        Route::middleware(['auth', 'role:admin,manager,staff'])->group(function () {

            // ----- Categories -----
            Route::post('categories', [CategoryController::class, 'store'])
                ->middleware('permission:category.create');
            Route::put('categories/{category}', [CategoryController::class, 'update'])
                ->middleware('permission:category.update');
            Route::delete('categories/{category}', [CategoryController::class, 'destroy'])
                ->middleware(['role:admin,manager', 'permission:category.delete']);

            // ----- Products -----
            Route::post('products', [ProductController::class, 'store'])
                ->middleware('permission:product.create');
            Route::put('products/{product}', [ProductController::class, 'update'])
                ->middleware('permission:product.update');
            Route::delete('products/{product}', [ProductController::class, 'destroy'])
                ->middleware(['role:admin,manager', 'permission:product.delete']);

            // ----- Inventory -----
            Route::put('inventory/{product}', [InventoryController::class, 'updateStock'])
                ->middleware('permission:inventory.update');
        });

            // +++ Order +++
            Route::get('orders', [OrderController::class, 'index']);
            // Xem chi tiết 1 đơn (kèm items)
            Route::get('orders/{order}', [OrderController::class, 'show']);
            // Cập nhật trạng thái đơn (tuỳ chọn): cần quyền
            Route::put('orders/{order}/status', [OrderController::class, 'updateStatus'])
                ->middleware('permission:order.update');
            // Xoá đơn (tuỳ chọn): chỉ admin/manager + permission
            Route::delete('orders/{order}', [OrderController::class, 'destroy'])
                ->middleware(['role:admin,manager', 'permission:order.delete']);
            Route::middleware(['auth', 'role:admin,manager,staff'])->group(function () {
            Route::get   ('orders',          [ApiOrderController::class, 'index']);
            Route::get   ('orders/{order}',  [ApiOrderController::class, 'show']);
            Route::delete('orders/{order}',  [ApiOrderController::class, 'destroy']);
            });

            // Chỉ cho admin/manager/staff xem báo cáo (tuỳ bạn)
            Route::middleware(['auth', 'role:admin,manager,staff'])->group(function () {
                Route::get('reports/summary',        [ReportController::class, 'summary']);
                Route::get('reports/monthly',        [ReportController::class, 'monthly']);
                Route::get('reports/category-share', [ReportController::class, 'categoryShare']);
            });

        /*
        |--------------------------------------------------------------------------
        | Employees (admin + manager)
        |--------------------------------------------------------------------------
        | Nhân viên chỉ được quản lý bởi quản lý và admin.
        */
        Route::middleware(['auth', 'role:admin,manager'])->group(function () {
            Route::apiResource('employees', EmployeeApiController::class);
        });
    });

/*
|--------------------------------------------------------------------------
| 🧩 Debug route (kiểm tra quyền người dùng hiện tại)
|--------------------------------------------------------------------------
| Giúp test nhanh roles & permissions của user đăng nhập.
*/
Route::get('/debug/roles', function () {
    $user = Auth::user();

    if (!$user) {
        return ['auth' => false];
    }

    $roles = collect();
    if (isset($user->role)) {
        $roles->push($user->role);
    }
    if (method_exists($user, 'roles')) {
        $roles = $roles->merge($user->roles->pluck('name'));
    }

    $permissions = collect();
    if (method_exists($user, 'roles')) {
        $permissions = $user->roles->flatMap->permissions->pluck('name')->unique();
    }

    return [
        'user' => $user->email,
        'roles' => $roles->unique()->values(),
        'permissions' => $permissions->values(),
    ];
})->middleware('auth');


Route::get('/test-perm', function () {
    return response()->json(['message' => 'Middleware perm hoạt động!']);
})->middleware('permission:category.create');



// === Users (admin only) ===



//giỏ hàng và thanh toán
//giỏ hàng
Route::prefix('cart')->group(function () {
    Route::get ('/show',  [CartController::class, 'show'])->name('cart.show');
    Route::post('/add',   [CartController::class, 'add'])->name('cart.add');
    Route::post('/update',[CartController::class, 'update'])->name('cart.update');
    Route::post('/remove',[CartController::class, 'remove'])->name('cart.remove');
});
Route::post('/checkout', [CheckoutController::class, 'store'])
    ->middleware(['auth','role:customer']);

    // Lấy danh sách đơn hàng thật cho Admin/Staff
Route::get('orders', [OrderController::class, 'index']); 



Route::middleware(['auth', 'role:admin,manager,staff'])->group(function () {
    Route::get('reports/summary',       [ReportController::class, 'summary']);
    Route::get('reports/monthly',       [ReportController::class, 'monthly']);
    Route::get('reports/category-share',[ReportController::class, 'categoryShare']);
});
