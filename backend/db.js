const mysql = require('mysql');

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password', // Replace 'your_password' with the actual password you set
  database: 'RecipeVault'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the RecipeVault database');
});

module.exports = db;
