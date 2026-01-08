// setup-database.js
const mysql = require('mysql2');
require('dotenv').config();

// Create connection without specifying database first
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306
});

console.log('🔧 Setting up EventFlow database...');

const queries = [
    // Create database
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    `USE ${process.env.DB_NAME}`,
    
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        phone VARCHAR(20),
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Events table
    `CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        category VARCHAR(50),
        venue VARCHAR(200) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        image_url VARCHAR(255),
        thumbnail_url VARCHAR(255),
        max_attendees INT DEFAULT 100,
        current_attendees INT DEFAULT 0,
        price DECIMAL(10, 2) DEFAULT 0.00,
        is_free BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        organizer_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    
    // Tickets table
    `CREATE TABLE IF NOT EXISTS tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        available_quantity INT NOT NULL,
        sale_start DATETIME,
        sale_end DATETIME,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )`,
    
    // Bookings table
    `CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        ticket_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_amount DECIMAL(10, 2) NOT NULL,
        booking_reference VARCHAR(50) UNIQUE NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'pending',
        notes TEXT,
        attended BOOLEAN DEFAULT FALSE,
        checkin_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    )`,
    
    // Payments table
    `CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        stripe_payment_id VARCHAR(100) UNIQUE,
        stripe_customer_id VARCHAR(100),
        payment_method VARCHAR(50),
        status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
        receipt_url VARCHAR(255),
        paid_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // Password resets table
    `CREATE TABLE IF NOT EXISTS password_resets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

// Run queries one by one
const setupDatabase = async () => {
    try {
        // Connect
        connection.connect((err) => {
            if (err) {
                console.error('❌ Error connecting to MySQL:', err.message);
                process.exit(1);
            }
            console.log('✅ Connected to MySQL server');
            
            // Execute each query
            queries.forEach((query, index) => {
                connection.query(query, (err, results) => {
                    if (err) {
                        console.error(`❌ Error executing query ${index + 1}:`, err.message);
                    } else {
                        console.log(`✅ Query ${index + 1} executed successfully`);
                    }
                    
                    // Last query
                    if (index === queries.length - 1) {
                        console.log('\n🎉 Database setup completed!');
                        
                        // Insert sample data
                        insertSampleData();
                    }
                });
            });
        });
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

// Insert sample data
const insertSampleData = () => {
    const sampleQueries = [
        // Insert admin user (password: admin123)
        `INSERT INTO users (name, email, password, role) 
         VALUES ('Admin User', 'admin@eventflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
         ON DUPLICATE KEY UPDATE role='admin'`,
        
        // Insert sample events
        `INSERT INTO events (title, description, short_description, category, venue, address, city, country, start_date, end_date, price, is_featured, organizer_id) VALUES
         ('Tech Conference 2024', 'Annual technology conference with industry leaders', 'Join the biggest tech conference of the year', 'Technology', 'Convention Center', '123 Tech Street', 'San Francisco', 'USA', '2024-06-15 09:00:00', '2024-06-17 18:00:00', 299.99, TRUE, 1),
         ('Music Festival', 'Weekend music festival with top artists', 'Experience amazing music and food', 'Music', 'Central Park', '456 Music Ave', 'New York', 'USA', '2024-07-20 14:00:00', '2024-07-21 23:00:00', 89.99, TRUE, 1),
         ('Business Workshop', 'Learn business strategies from experts', 'Intensive workshop for entrepreneurs', 'Business', 'Business Hub', '789 Business Rd', 'London', 'UK', '2024-05-10 10:00:00', '2024-05-10 17:00:00', 149.99, FALSE, 1)
         ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        
        // Insert sample tickets
        `INSERT INTO tickets (event_id, name, description, price, quantity, available_quantity) VALUES
         (1, 'Early Bird', 'Early bird special price', 199.99, 100, 100),
         (1, 'Regular', 'Regular admission', 299.99, 300, 300),
         (1, 'VIP', 'VIP access with perks', 499.99, 50, 50),
         (2, 'General Admission', 'General festival access', 89.99, 1000, 1000),
         (2, 'VIP Pass', 'VIP area and amenities', 199.99, 200, 200),
         (3, 'Workshop Ticket', 'Full day workshop access', 149.99, 50, 50)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`
    ];
    
    sampleQueries.forEach((query, index) => {
        connection.query(query, (err, results) => {
            if (err) {
                console.error(`❌ Error inserting sample data ${index + 1}:`, err.message);
            } else {
                console.log(`✅ Sample data ${index + 1} inserted successfully`);
            }
            
            if (index === sampleQueries.length - 1) {
                console.log('\n✨ Database setup COMPLETE!');
                console.log('📊 Admin credentials:');
                console.log('   Email: admin@eventflow.com');
                console.log('   Password: password'); // Default password
                connection.end();
            }
        });
    });
};

// Run setup
setupDatabase();