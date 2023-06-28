// Generic function for creating cells with color based on content
function createOnClickCell(createElement, props) {
  const cellContent = props.model[props.prop];
  const textColor = cellContent.includes('-') ? 'red' : 'green';

  return createElement('a', {
    style: {
      color: textColor,
      cursor: 'pointer'
    },
    domProps: {
      href: '#'
    },
    on: {
      click: () => console.log( 'baalablsbdald')
      //handleCellClick(props.column, props.model)
    }
  }, cellContent);
}

// Generic function for creating cells with color based on content
function createColoredCell(createElement, props) {
  const cellContent = props.model[props.prop];
  const textColor = cellContent.includes('-') ? 'red' : 'green';

  return createElement('span', {
    style: {
      color: textColor
    }
  }, cellContent);
}

// Generic function for creating cells with custom background color and text
function createPlatformColoredCell(createElement, props) {
  const cellContent = props.model[props.prop];
  const { backgroundColor, textColor } = getPlatformColors(cellContent);

  return createElement('div', {
    style: {
      backgroundColor,
      color: textColor,
      textAlign: 'center'
    }
  }, cellContent);
}

// Function to define colors based on the exchangeId
function getPlatformColors(exchangeId) {
  switch (exchangeId) {
    case 'binance':
      return {
        backgroundColor: '#F3BA2F',
        textColor: 'black'
      };
    case 'kucoin':
      return {
        backgroundColor: '#23AF91',
        textColor: 'white'
      };
    case 'huobi':
      return {
        backgroundColor: '#2D8CF0',
        textColor: 'white'
      };
    case 'okex':
      return {
        backgroundColor: '#1A9924',
        textColor: 'black'
      };
    case 'gateio':
      return {
        backgroundColor: '#00A86B',
        textColor: 'white'
      };
    default:
      return {
        backgroundColor: '',
        textColor: 'black'
      };
  }
}

module.exports = { createOnClickCell, createColoredCell, createPlatformColoredCell, getPlatformColors };