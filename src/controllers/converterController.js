// src/controllers/converterController.js
const Papa = require("papaparse");
const converterService = require("../services/converterService");

async function getConvertedCsv(req, res) {
  try {
    const { file } = req;
    const { buffer } = file;

    // Utilisation de PapaParse pour lire les données CSV depuis le buffer
    Papa.parse(buffer.toString(), {
      complete: async (result) => {
        console.log("🚀 ~ complete: ~ result:", result);
        const jsonData = result ? await converterService.convertToJSON(result.data) : [];
        console.log("🚀 ~ complete: ~ jsonData:", jsonData);

        res.json({ success: true, data: jsonData });
      },
      error: (error) => {
        console.log("🚀 ~ Papa.parse ~ error:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
      },
      header: true,
    });
  } catch (error) {
    console.log("🚀 ~ getConvertedCsv ~ error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { getConvertedCsv };