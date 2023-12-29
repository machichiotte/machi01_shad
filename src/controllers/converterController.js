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
    case 'model_kucoin':
      return convertModelKucoin(data);
    case 'model_okx':
      return convertModelOkx(data);
    case 'model_binance':
      return convertModelBinance(data);
    case 'model_htx':
      return convertModelHTX(data);
    default:
      console.error('Modèle de fichier CSV non pris en charge');
      return [];
  }
}

function detectModelType(data) {
  // Votre logique pour détecter le modèle de fichier CSV
  // Par exemple, vous pouvez vérifier la présence de certaines colonnes
  if (data[0] && data[0]['uid'] && data[0]['symbol'] && data[0]['deal_type'] && data[0]['deal_time']) {
    console.log('model_htx');
    return 'model_htx';
  } else if (data[0] && data[0]['Order ID'] && data[0]['Order Time(UTC-03:00)']) {
    console.log('model_kucoin');
    return 'model_kucoin';
  } else if (data[0] && data[0]['Order id'] && data[0]['Instrument'] && data[0]['Time']) {
    console.log('model_okx');
    return 'model_okx';
  } else if (data[0] && data[0]['Date(UTC)'] && data[0]['Pair'] && data[0]['Side'] && data[0]['Price'] && data[0]['Executed'] && data[0]['Amount'] && data[0]['Fee']) {
    console.log('model_binance');
    return 'model_binance';
  } else {
    console.log('unknown');
    return 'unknown';
  }
}

function convertModelHTX(data) {
  console.log('convertModelHTX');
  return data.map((item) => {
    if (item && item['uid'] && item['symbol'] && item['deal_type'] && item['deal_time']) {
      // Séparer la paire en alta et altb en utilisant les éléments de 'symbol'
      const [altA, altB] = item['symbol'].split('/');

      return {
        altA: altA,
        altB: altB,
        date: item['deal_time'],
        pair: item['symbol'],
        type: item['deal_type'].toLowerCase(),
        price: parseFloat(item['price']),
        amount: parseFloat(item['volume']),
        total: parseFloat(item['amount']),
        fee: parseFloat(item['fee_amount']),
        feecoin: item['fee_currency'].toUpperCase(),
        platform: 'htx',
      };
    }
    return null;
  }).filter(Boolean);
}

function convertModelBinance(data) {
  console.log('convertModelBinance');
  return data.map((item) => {
    if (item && item['Date(UTC)'] && item['Pair'] && item['Side'] && item['Price'] && item['Executed'] && item['Amount'] && item['Fee']) {
      // Séparer la paire en alta et altb en utilisant les éléments de 'Executed'
      const [executedAmount, executedAsset] = item['Executed'].match(/([0-9.]+)([A-Za-z]+)/).slice(1, 3);

      return {
        altA: executedAsset,
        altB: item['Pair'].replace(executedAsset, ''),
        date: item['Date(UTC)'],
        pair: item['Pair'],
        type: item['Side'].toLowerCase(),
        price: parseFloat(item['Price']),
        amount: parseFloat(executedAmount),
        total: parseFloat(item['Amount'].replace(item['Fee'], '')),  // Vous devrez ajuster en fonction de votre logique
        fee: parseFloat(item['Fee']),
        feecoin: item['Fee'].match(/[A-Za-z]+/)[0],  // Récupérer la devise de frais
        platform: 'binance',
      };
    }
    return null;
  }).filter(Boolean);
}

function convertModelKucoin(data) {
  console.log('convertModelKucoin');
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
        total: parseFloat(item['Filled Volume (USDT)']),
        fee: parseFloat(item.Fee),
        feecoin: item['Fee Currency'],
        platform: 'kucoin',
      };
    }
    return null;
  }).filter(Boolean);
}

function convertModelOkx(data) {
  console.log('convertModelOkx');
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
