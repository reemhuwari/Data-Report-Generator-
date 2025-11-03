const express = require("express");
const multer = require("multer");
const path = require("path");
const ReportController = require("../controller/report");

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, "../uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/generate", upload.single("file"), ReportController.generateReport);
router.get("/history", ReportController.getReportHistory);
router.get("/:id", ReportController.getReportById);
router.delete("/:id", ReportController.deleteReport);

module.exports = router;
