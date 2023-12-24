// src/controllers/converterController.js
const Papa = require('papaparse');

async function getConvertedCsv(req, res) {
  try {
    const { file } = req;
    const { buffer} = file;

    // Utilisation de PapaParse pour lire les données CSV depuis le buffer
    Papa.parse(buffer.toString(), {
      complete: (result) => {
        const jsonData = result ? result.data.map((item) => {
          if (item && item.Symbol && item.Symbol.includes('-')) {
            return {
              altA: item.Symbol.split('-')[0],
              altB: item.Symbol.split('-')[1],
              date: item['Order Time(UTC-03:00)'],
              pair: item.Symbol,
              type: item.Side.toLowerCase(),
              price: parseFloat(item['Avg. Filled Price']),
              amount: parseFloat(item['Filled Amount']),
              total: parseFloat(item['Filled Volume(USDT)']),
              fee: parseFloat(item.Fee),
              feecoin: item['Fee Currency'],
              platform: 'kucoin',
            };
          }
          return null;
        }).filter(Boolean) : [];
        res.json({ success: true, data: jsonData });
      },
      error: (error) => {
        console.error("Erreur lors de l'analyse du fichier CSV :", error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
      },
      header: true,
    });
  } catch (error) {
    console.error("Erreur lors du traitement du formulaire :", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { getConvertedCsv };