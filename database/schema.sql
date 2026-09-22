-- =========================================
-- RESTAURANT QR ORDERING SYSTEM - DATABASE
-- =========================================

-- Create Database
CREATE DATABASE IF NOT EXISTS restaurant_qr_db;
USE restaurant_qr_db;

-- =========================================
-- 1. RESTAURANTS
-- =========================================
CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255) DEFAULT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 2. TABLES
-- =========================================
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    qr_code_url VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_table_per_restaurant (restaurant_id, table_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 3. CATEGORIES
-- =========================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 4. MENU ITEMS
-- =========================================
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    ingredients TEXT DEFAULT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    is_veg BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category_available (category_id, is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 5. STAFF USERS
-- =========================================
CREATE TABLE staff_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('WAITER', 'MANAGER', 'ADMIN') DEFAULT 'WAITER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 6. ORDERS
-- =========================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    status ENUM('NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'NEW',
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT,
    INDEX idx_status_created (status, created_at),
    INDEX idx_table_status (table_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 7. ORDER ITEMS
-- =========================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10, 2) NOT NULL, -- CRITICAL: Stores price at time of order
    subtotal DECIMAL(10, 2) NOT NULL,       -- quantity * price_at_order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- SEED DATA (For initial testing)
-- =========================================

-- Insert a default restaurant
INSERT INTO restaurants (name, currency) VALUES ('The Mobile Bistro', 'INR');

-- Insert tables
INSERT INTO tables (restaurant_id, table_number) VALUES 
(1, '1'), (1, '2'), (1, '3'), (1, '4'), (1, '5'), (1, '6'), (1, '7');

-- Insert categories
INSERT INTO categories (restaurant_id, name, display_order) VALUES 
(1, 'Starters', 1),
(1, 'Main Course', 2),
(1, 'Beverages', 3);

-- Insert menu items
INSERT INTO menu_items (category_id, name, description, price, is_veg, display_order) VALUES 
(1, 'Paneer Tikka', 'Marinated cottage cheese grilled in tandoor', 250.00, TRUE, 1),
(1, 'Chicken 65', 'Spicy deep-fried chicken dish', 280.00, FALSE, 2),
(2, 'Chicken Biryani', 'Aromatic basmati rice cooked with spiced chicken', 320.00, FALSE, 1),
(2, 'Veg Biryani', 'Aromatic basmati rice cooked with mixed vegetables', 260.00, TRUE, 2),
(3, 'Coke', 'Chilled Coca Cola (300ml)', 50.00, TRUE, 1),
(3, 'Fresh Lime Soda', 'Refreshing lime soda (sweet/salt)', 80.00, TRUE, 2);

-- Insert a default staff user (Password: password123 - MUST BE HASHED IN BACKEND)
-- For schema testing, we'll insert a dummy hash. The backend will handle real hashing.
INSERT INTO staff_users (restaurant_id, username, password_hash, role) VALUES 
(1, 'waiter1', '$2b$10$dummyHashForTestingPurposesOnlyReplaceInBackend', 'WAITER');
