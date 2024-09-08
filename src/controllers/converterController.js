// src/controllers/converterController.js
const Papa = require("papaparse");
const converterService = require("../services/converterService");

/**
 * Converts a CSV file to JSON format.
 * @param {Object} req - The HTTP request object containing the CSV file.
 * @param {Object} res - The HTTP response object.
 */
async function getConvertedCsv(req, res) {
  try {
    const { file } = req;
    const { buffer } = file;

    // Use PapaParse to read CSV data from the buffer
    Papa.parse(buffer.toString(), {
      complete: async (result) => {
        console.log("🚀 ~ complete: ~ result:", result);
        const jsonData = result ? await converterService.convertToJSON(result.data) : [];
        console.log("🚀 ~ complete: ~ jsonData:", jsonData);

        res.json({ success: true, data: jsonData });
      },
      error: (error) => {
        console.log("🚀 ~ Papa.parse ~ error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
      },
      header: true,
    });
  } catch (error) {
    console.log("🚀 ~ getConvertedCsv ~ error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { getConvertedCsv };