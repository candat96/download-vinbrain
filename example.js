const db = require('./db');

async function main() {
  // Kiểm tra kết nối
  const connected = await db.testConnection();
  
  if (connected) {
    try {
      // Ví dụ truy vấn dữ liệu
      const result = await db.query('SELECT * FROM users LIMIT 10');
      console.log('Kết quả truy vấn:', result.rows);
      
      // Ví dụ chèn dữ liệu
      const insertResult = await db.query(
        'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *',
        ['Người dùng mới', 'email@example.com']
      );
      console.log('Đã chèn dữ liệu:', insertResult.rows[0]);
      
    } catch (err) {
      console.error('Lỗi khi thực hiện truy vấn:', err);
    } finally {
      // Đóng kết nối
      db.pool.end();
    }
  }
}

main(); 