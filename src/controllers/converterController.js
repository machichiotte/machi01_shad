// src/controllers/converterController.js
const Papa = require('papaparse');

async function getConvertedCsv(req, res) {
  try {
    const { file } = req;
    const { buffer } = file;

    // Utilisation de PapaParse pour lire les données CSV depuis le buffer
    Papa.parse(buffer.toString(), {
      complete: async (result) => {
        //console.log('getConvertedCsv result', result);
        const jsonData = result ? await convertToJSON(result.data) : [];
        //console.log('getConvertedCsv jsonData', jsonData);

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

async function convertToJSON(data) {
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
      console.log('convertToJSON model_htx')
      return await convertModelHTX(data);
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

async function getTotalUSDTFromAPI(dealTime, altB, total) {
  console.log('getTotalUSDTFromAPI');

  if (altB && !["USDT", "BUSD", "USDC"].includes(altB.toUpperCase())) {
    /*try {
      const response = await axios.get('URL_DE_L_API', {
        params: { date: dealTime, altB },
      });

      return response.data.rate * total);
    } catch (error) {
      console.error("Erreur lors de l'appel API pour obtenir le taux de conversion :", error);
      return null;
    }*/
    return 0;
  }
  return total;
}

async function convertModelHTX(data) {
  console.log('convertModelHTX');
  const convertedData = await Promise.all(data.map(async (item) => {
    if (item && item['uid'] && item['symbol'] && item['deal_type'] && item['deal_time']) {
      // Séparer la paire en alta et altb en utilisant les éléments de 'symbol'
      const [altA, altB] = item['symbol'].split('/');
      const date = item['deal_time'];
      const total = parseFloat(item['amount']);
      const totalUSDT = await getTotalUSDTFromAPI(date, altB, total);

      return {
        altA: altA,
        altB: altB,
        date: date,
        pair: item['symbol'],
        type: item['deal_type'].toLowerCase(),
        price: parseFloat(item['price']),
        amount: parseFloat(item['volume']),
        total: total,
        totalUSDT: totalUSDT,
        fee: parseFloat(item['fee_amount']),
        feecoin: item['fee_currency'].toUpperCase(),
        platform: 'htx',
      };
    }
    return null;
  }));
  return convertedData.filter(Boolean);
}

async function convertModelBinance(data) {
  console.log('convertModelBinance');
  const convertedData = await Promise.all(data.map(async (item) => {
    if (item && item['Date(UTC)'] && item['Pair'] && item['Side'] && item['Price'] && item['Executed'] && item['Amount'] && item['Fee']) {
      // Récupérer les éléments de 'Executed'
      const [total, altB] = item['Amount'].match(/([0-9.]+)?([A-Za-z]+)([A-Za-z0-9]+)?/).slice(1, 3).filter(Boolean);

      // Récupérer altA à partir de la paire et altB
      const altA = (() => {
        const altAStartIndex = item['Pair'].indexOf(altB);
        return item['Pair'].substring(0, altAStartIndex).toUpperCase();
      })();

      const date = item['Date(UTC)'];
      const amount = parseFloat(item['Executed'].replace(altA, ''));
      const totalUSDT = await getTotalUSDTFromAPI(date, altB, total);
      const feecoin = item['Fee'].includes(altA) ? altA : (item['Fee'].includes(altB) ? altB : '/');

      return {
        altA: altA,
        altB: altB,
        date: date,
        pair: item['Pair'],
        type: item['Side'].toLowerCase(),
        price: parseFloat(item['Price']),
        amount: amount,
        total: total,
        totalUSDT: totalUSDT,
        fee: parseFloat(item['Fee']),
        feecoin: feecoin,
        platform: 'binance',
      };
    }
    return null;
  }));
  return convertedData.filter(Boolean);
}


async function convertModelKucoin(data) {
  console.log('convertModelKucoin');
  const convertedData = await Promise.all(data.map(async (item) => {
    if (item && item.Symbol && item.Symbol.includes('-')) {
      return {
        altA: item.Symbol.split('-')[0],
        altB: item.Symbol.split('-')[1],
        date: item['Order Time(UTC-03:00)'],
        pair: item.Symbol,
        type: item.Side.toLowerCase(),
        price: parseFloat(item['Avg. Filled Price']),
        amount: parseFloat(item['Filled Amount']),
        total: parseFloat(item['Filled Volume']),
        totalUSDT: parseFloat(item['Filled Volume (USDT)']),
        fee: parseFloat(item.Fee),
        feecoin: item['Fee Currency'],
        platform: 'kucoin',
      };
    }
    return null;
  }));
  return convertedData.filter(Boolean);
}

async function convertModelOkx(data) {
  console.log('convertModelOkx');
  const convertedData = await Promise.all(data.map(async (item) => {
    if (item['Order id'] && item['Instrument'] && item['Time'] && item.Instrument && item.Instrument.includes('-')) {
      const date = item['Time'];
      const total = parseFloat(item['Amount']);
      const altB = item['Balance Unit'];
      const totalUSDT = parseFloat(await getTotalUSDTFromAPI(date, altB, total));

      return {
        altA: item['Trading Unit'],
        altB: altB,
        date: date,
        pair: item['Instrument'],
        type: item['Action'].toLowerCase(),
        price: parseFloat(item['Fill Price']),
        amount: parseFloat(item['Balance']),
        total: parseFloat(item['Amount']),
        totalUSDT: totalUSDT,
        fee: parseFloat(item['Fee']),
        feecoin: item['Balance Unit'],
        platform: 'okx',
      };
    }
    return null;
  }));
  return convertedData.filter(Boolean);
}

module.exports = { getConvertedCsv };