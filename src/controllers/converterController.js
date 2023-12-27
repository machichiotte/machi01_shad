// src/controllers/converterController.js
const Papa = require('papaparse');

async function getConvertedCsv(req, res) {
  try {
    const { file } = req;
    const { buffer } = file;

    // Utilisation de PapaParse pour lire les données CSV depuis le buffer
    Papa.parse(buffer.toString(), {
      complete: (result) => {
        const jsonData = result ? convertToJSON(result.data) : [];
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

function convertToJSON(data) {
  // Votre logique de conversion en JSON ici en fonction du modèle détecté
  const modelType = detectModelType(data);

  switch (modelType) {
    case 'model1':
      return convertModel1(data);
    case 'model2':
      return convertModel2(data);
    default:
      console.error('Modèle de fichier CSV non pris en charge');
      return [];
  }
}

function detectModelType(data) {
  console.log('data[0]', data[0]);
  console.log('id',  data[0]['Order id']);
  console.log('Instrument',  data[0]['Instrument']);
  console.log('Time',  data[0]['Time']);
  // Votre logique pour détecter le modèle de fichier CSV
  // Par exemple, vous pouvez vérifier la présence de certaines colonnes
  if (data[0] && data[0]['Order ID'] && data[0]['Order Time(UTC-03:00)']) {
  console.log('model1');

    return 'model1';
  } else if (data[0] && data[0]['Order id'] && data[0]['Instrument'] && data[0]['Time']) {
  console.log('model2');

    return 'model2';
  } else {
  console.log('unknown');

    return 'unknown';
  }
}

function convertModel1(data) {
  console.log('convertModel1');
  return data.map((item) => {
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
  }).filter(Boolean);
}

function convertModel2(data) {
  console.log('convertModel2');
  return data.map((item) => {
    if (item['Order id'] && item['Instrument'] && item['Time'] && item.Instrument && item.Instrument.includes('-')) {
      return {
        altA: item['Trading Unit'],
        altA: item['Balance Unit'],
        date: item['Time'],
        pair: item['Instrument'],
        type: item['Action'].toLowerCase(),
        price: parseFloat(item['Fill Price']),
        amount: parseFloat(item['Balance']),
        total: parseFloat(item['Amount']),  // Vous devrez ajuster en fonction de votre logique
        fee: parseFloat(item['Fee']),
        feecoin: item['Balance Unit'],  // Vous devrez spécifier la valeur appropriée pour feecoin
        platform: 'okx',  // Vous devrez spécifier la valeur appropriée pour platform
      };
    }
    return null;
  }).filter(Boolean);
}

module.exports = { getConvertedCsv };
