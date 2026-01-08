// check-database.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check XAMPP/WAMP is running');
        console.log('2. Check MySQL is started');
        console.log('3. Check .env file has correct credentials');
        console.log('4. Default MySQL credentials:');
        console.log('   - Host: localhost');
        console.log('   - User: root');
        console.log('   - Password: (usually empty)');
        process.exit(1);
    }
    
    console.log('✅ Connected to database!');
    
    // Show all tables
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('❌ Error checking tables:', err.message);
        } else if (results.length === 0) {
            console.log('📭 No tables found in database');
        } else {
            console.log('\n📊 Tables in database:');
            results.forEach(row => {
                console.log(`   - ${row[`Tables_in_${process.env.DB_NAME}`]}`);
            });
            
            // Count records in each table
            const tables = ['users', 'events', 'tickets', 'bookings', 'payments', 'password_resets'];
            tables.forEach(table => {
                connection.query(`SELECT COUNT(*) as count FROM ${table}`, (err, countResult) => {
                    if (!err) {
                        console.log(`   ${table}: ${countResult[0].count} records`);
                    }
                });
            });
        }
        
        console.log('\n✨ Database check complete!');
        connection.end();
    });
});