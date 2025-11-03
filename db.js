// dp.js
const mysql = require('mysql2/promise');

// إنشاء تجمع اتصالات MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "amer",
  database: "generitor",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// دالة لاختبار الاتصال
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ success connection database");
    connection.release(); // إعادة الاتصال للمجمع
  } catch (error) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error.message);
  }
};

// التصدير
module.exports = { pool, testConnection };
