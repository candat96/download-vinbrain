const { Pool } = require('pg');

const pool = new Pool({
  user: 'vinbrain',
  host: 'localhost',
  database: 'vinbrain',
  password: 'vinbrain@2024',
  port: 5445,
});

// Hàm kiểm tra kết nối
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Kết nối thành công đến PostgreSQL:', res.rows[0]);
    return true;
  } catch (err) {
    console.error('Lỗi kết nối đến PostgreSQL:', err);
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection
}; 