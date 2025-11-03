const { pool } = require("../db");

const ReportModel = {
  async createReport({ prompt, reportText, filePath, pdfPath }) {
    const query = `
      INSERT INTO reports (prompt, report, file_path, pdf_path)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [prompt, reportText, filePath, pdfPath]);
    return result.insertId;
  },

  async getAllReports() {
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    return rows;
  },

  async getReportById(id) {
    const [rows] = await pool.query("SELECT * FROM reports WHERE id = ?", [id]);
    return rows[0];
  },

  async deleteReport(id) {
    const [rows] = await pool.query("SELECT pdf_path FROM reports WHERE id = ?", [id]);
    if (!rows[0]) return null;

    const pdfPath = rows[0].pdf_path;

    await pool.query("DELETE FROM reports WHERE id = ?", [id]);
    return pdfPath; // نرجع مسار PDF لحذفه من القرص لو بدك
  }
};

module.exports = ReportModel;
