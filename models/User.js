const { pool } = require("../db");
const bcrypt = require("bcryptjs");
const UserModel = {
  createUser: async ({ username, email, password, role }) => {
     const hashPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
      [username, email,hashPassword, role]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0];
  },

  getAllUsers: async () => {
    const [rows] = await pool.query(`SELECT id, username, email, role, isApproved FROM users`);
    return rows;
  },

  approveUser: async (id, status) => {
    const [result] = await pool.query(
      `UPDATE users SET isApproved = ? WHERE id = ?`,
      [status, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;
