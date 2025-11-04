-- =============================================
--  ChumTea - Full MySQL Schema (no seeders)
--  Charset/Collation: utf8mb4 / utf8mb4_unicode_ci
--  Storage Engine: InnoDB
-- =============================================

CREATE DATABASE IF NOT EXISTS chumtea
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chumtea;

-- =================== USERS ====================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(191) NOT NULL,
  email       VARCHAR(191) UNIQUE,
  password    VARCHAR(255),
  phone       VARCHAR(30),
  role        ENUM('admin','manager','staff','customer') DEFAULT 'customer',
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);

-- =================== ROLES ====================
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,   -- admin, manager, staff, customer
  label       VARCHAR(191) NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================ PERMISSIONS =================
CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(150) NOT NULL UNIQUE,   -- e.g. product.create
  label       VARCHAR(191) NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================ USER_ROLES ==================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_roles_role  FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============= ROLE_PERMISSIONS ==============
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role       FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (Optional) Direct user permissions mapping
-- CREATE TABLE IF NOT EXISTS user_permissions (
--   user_id BIGINT UNSIGNED NOT NULL,
--   permission_id BIGINT UNSIGNED NOT NULL,
--   PRIMARY KEY (user_id, permission_id),
--   CONSTRAINT fk_up_user       FOREIGN KEY (user_id) REFERENCES users(id)
--     ON DELETE CASCADE ON UPDATE CASCADE,
--   CONSTRAINT fk_up_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
--     ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================ CATEGORIES ==================
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(191) NOT NULL,
  slug        VARCHAR(191) UNIQUE,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ================== PRODUCTS ==================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT UNSIGNED,
  name        VARCHAR(191) NOT NULL,
  description TEXT NULL,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  image       VARCHAR(255) NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

-- ================= INVENTORY ==================
CREATE TABLE IF NOT EXISTS inventory_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id    BIGINT UNSIGNED NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock     INT NOT NULL DEFAULT 0,
  max_stock     INT NOT NULL DEFAULT 0,
  last_updated  TIMESTAMP NULL,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inventory_product ON inventory_items(product_id);
CREATE INDEX idx_inventory_current ON inventory_items(current_stock);

-- ================= EMPLOYEES ==================
CREATE TABLE IF NOT EXISTS employees (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name      VARCHAR(191) NOT NULL,
  email     VARCHAR(191) UNIQUE,
  phone     VARCHAR(30),
  position  ENUM('staff','manager','admin') DEFAULT 'staff',
  salary    DECIMAL(12,2) DEFAULT 0,
  status    ENUM('active','inactive') DEFAULT 'active',
  join_date DATE NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_employees_position ON employees(position);
CREATE INDEX idx_employees_status   ON employees(status);

-- ================= CUSTOMERS ==================
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(191) NOT NULL,
  email      VARCHAR(191) UNIQUE NULL,
  phone      VARCHAR(30) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================== ORDERS ===================
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_id   BIGINT UNSIGNED NULL,
  customer_name VARCHAR(191) NULL,
  status ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
  total  DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_orders_status  ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ================ ORDER_ITEMS =================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id     BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NULL,
  product_name VARCHAR(191) NULL,
  quantity     INT NOT NULL DEFAULT 1,
  price        DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL,
  updated_at   TIMESTAMP NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ================== INVOICES ==================
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  customer_name VARCHAR(191) NULL,
  total         DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('unpaid','paid','void') DEFAULT 'unpaid',
  due_date      DATE NULL,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  CONSTRAINT fk_invoices_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_invoices_status ON invoices(status);

-- ================== CONTACTS ==================
CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name     VARCHAR(191) NOT NULL,
  email    VARCHAR(191) NOT NULL,
  phone    VARCHAR(30) NULL,
  subject  VARCHAR(255) NOT NULL,
  message  TEXT NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
