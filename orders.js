const serverHost = "http://localhost:3000";

async function cancelAllOrders(exchangeId, asset) {
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

async function bunchOrders(exchangeId, asset, amount, price) {
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
    console.log('bunch :: ' + JSON.stringify(data));
    return data;
}

module.exports = { cancelAllOrders, bunchOrders };