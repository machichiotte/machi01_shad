const serverHost = process.env.VUE_APP_SERVER_HOST;

const cancelAllOrders = async (exchangeId, asset) => {
    const requestBody = {
        exchangeId: exchangeId,
        asset: asset
    };

    const response = await fetch(`${serverHost}/cancel/all-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('cancel :: ' + JSON.stringify(data));

    return data;
}

const bunchOrders = async (exchangeId, asset, amount, price) => {
    const requestBody = {
        exchangeId: exchangeId,
        asset: asset,
        amount: amount,
        price: price
    };

    const response = await fetch(`${serverHost}/bunch-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    console.log('bunchOrders :: ' + JSON.stringify(data));

    return data;
}

export { cancelAllOrders, bunchOrders };