// src/js/metrics/utils.js
function getCurrentPossession(currentPrice, balance) {
    return Math.round(currentPrice * balance, 2)
  }
  
  function getPercentageDifference(newValue, oldValue) {
    return ((newValue - oldValue) / oldValue)
  }
  
  function getStatus(
    openSellOrders,
    amountTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp1,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5
  ) {
    const amountArray = [amountTp1, amountTp2, amountTp3, amountTp4, amountTp5]
    const priceArray = [priceTp1, priceTp2, priceTp3, priceTp4, priceTp5]
    const status = [0, 0, 0, 0, 0]
    for (let i = 0; i < openSellOrders.length; i++) {
      for (let j = 0; j < 5; j++) {
        if (amountArray[j] === openSellOrders[i].amount && priceArray[j] === openSellOrders[i].price) {
          status[j] = 1
        }
      }
    }
    return status
  }
  
  export { getCurrentPossession, getPercentageDifference, getStatus }
  