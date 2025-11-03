const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const ReportModel = require("../models/ReportModel.js");

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function parseXlsx(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

function summarizeData(data) {
  if (!data || data.length === 0) return "No data";
  const columns = Object.keys(data[0]);
  const numRows = data.length;
  const sampleRows = data.slice(0, 5);
  return `Rows: ${numRows}, Columns: ${columns.join(", ")}, First 5 rows: ${JSON.stringify(sampleRows)}`;
}

function composePrompt(userPrompt, dataSummary) {
  return `
You are a professional data analyst.
Data summary: ${dataSummary}
User instructions: ${userPrompt}
Format: Title, Summary, Key Points, Recommendations, Statistics Table.
`;
}
async function sendToLocalModel(prompt) {
  try {
    
    const response = await axios({
      method: "POST",
      url: "http://127.0.0.1:11434/api/generate",
      data: {
        model: "tinyllama",
        prompt,
        stream: true
      },
      responseType: "stream",
      timeout: 0
    });

    let result = "";
    let hasData = false;


    for await (const chunk of response.data) {
      const text = chunk.toString();
      hasData = true;
      try {
        const parsed = JSON.parse(text);
        if (parsed.response) result += parsed.response;
      } catch {}
    }

    if (!hasData) throw new Error("Empty response received from AI model");

    return result.trim();

  } catch (error) {
    throw error;
  }
}



function createPDF(text) {
  return new Promise((resolve, reject) => {
    try {
      const pdfDir = path.join(process.cwd(), "reports");
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `${Date.now()}-report.pdf`);

      const doc = new PDFDocument({ autoFirstPage: true });
      const writeStream = fs.createWriteStream(pdfPath);

      writeStream.on("finish", () => resolve(pdfPath));
      writeStream.on("error", reject);

      doc.pipe(writeStream);
      doc.fontSize(18).text("Generated Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(text);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


const ReportController = {

  generateReport: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "File missing" });
      const userPrompt = req.body.prompt || "";

      let parsedData;
      const filePath = req.file.path;
      parsedData = filePath.endsWith(".csv") ? await parseCsv(filePath) : parseXlsx(filePath);

      const summary = summarizeData(parsedData);
      let finalPrompt;
      if (userPrompt.toLowerCase().includes("ترحيب") || userPrompt.toLowerCase().includes("welcome")) {
       finalPrompt = userPrompt; // استخدم النص مباشرة بدون تلخيص البيانات
      } else {
    finalPrompt = composePrompt(userPrompt, summary);
}
      const reportText = await sendToLocalModel(finalPrompt);
      const pdfPath = await createPDF(reportText);
      const id = await ReportModel.createReport({ prompt: userPrompt, reportText, filePath, pdfPath });

      res.json({ id, reportText, pdfUrl: `/downloads/${path.basename(pdfPath)}` });
    } catch (err) {
      console.error("❌ Error in generateReport:", err);
      res.status(500).json({ error: "Report generation failed", detail: err.stack || err.message });
    }
  },

  getReportHistory: async (req, res) => {
    try {
      const reports = await ReportModel.getAllReports();
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reports", detail: err.stack || err.message });
    }
  },

  getReportById: async (req, res) => {
    try {
      const { id } = req.params;
      const report = await ReportModel.getReportById(id);
      if (!report) return res.status(404).json({ error: "Report not found" });
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch report", detail: err.stack || err.message });
    }
  },

  deleteReport: async (req, res) => {
    try {
      const { id } = req.params;
      const pdfPath = await ReportModel.deleteReport(id);
      
      if (!pdfPath) return res.status(404).json({ error: "Report not found" });

      const absolutePath = path.join(process.cwd(), pdfPath);
      fs.unlink(absolutePath, (err) => {
        if (err) console.error("⚠️ Failed to delete PDF file:", err.message);
      });

      res.json({ message: "Report deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete report", detail: err.stack || err.message });
    }
  }
};

module.exports = ReportController;
