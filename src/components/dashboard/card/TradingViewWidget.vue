// File: src/components/dashboard/card/TradingViewWidget.vue
<template>
  <div :id="containerId" class="tradingview-widget-container" style="height: 100%; width: 100%;">
    <p v-if="!market">Please select a market to view the chart.</p>
    <p v-else>Loading TradingView Chart for {{ market }}...</p>
  </div>
</template>

<script setup lang="ts">
// Props: asset platform and chosen market
import { computed, onMounted, watch, nextTick } from 'vue';

interface Props {
  platform: string;
  market: string | null;
}

const props = defineProps<Props>();

// Computed container ID ensures unique element
const containerId = computed(() => `tradingview-widget-${props.platform}-${props.market || 'none'}`);

let widgetInstance: any = null;

// Function to instantiate the TradingView widget
function loadWidget() {
  const market = props.market;
  if (!market) {
    clearContainer();
    return;
  }
  const prefix = props.platform.toUpperCase();
  const symbol = `${prefix}:${market}`;
  const container = document.getElementById(containerId.value);
  if (!container) return;

  clearContainer();
  if (typeof (window as any).TradingView === 'undefined') {
    container.innerHTML = '<p>Error: TradingView library not loaded.</p>';
    return;
  }

  try {
    widgetInstance = new (window as any).TradingView.widget({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Europe/Paris",
      theme: "dark",
      style: 1,  // candles
      locale: "fr",
      toolbar_bg: "#1f1f1f",
      allow_symbol_change: false,
      enable_publishing: false,
      container_id: containerId.value,
      withdateranges: true,
      hide_side_toolbar: false,
      details: false,
      disabled_features: ["symbol_search_hot_key", "header_screenshot"],
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "paneProperties.background": "#121212",
        "paneProperties.vertGridProperties.color": "#333",
        "paneProperties.horzGridProperties.color": "#333"
      },
      studies: ["MACD@tv-basicstudies", "RSI@tv-basicstudies"]
    });
  } catch {
    container.innerHTML = '<p>Error creating TradingView chart.</p>';
  }
}

// Utility to clear previous content
function clearContainer() {
  const container = document.getElementById(containerId.value);
  if (container) container.innerHTML = '';
}

// Reload when market prop changes
watch(() => props.market, async (newMarket, oldMarket) => {
  await nextTick();
  loadWidget();
});

// Initial load if mounted
onMounted(() => {
  if (props.market) {
    loadWidget();
  }
});
</script>

<style scoped>
.tradingview-widget-container {
  position: relative;
}
</style>
