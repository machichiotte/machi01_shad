<!-- src/components/Stuff.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { fetchTradeBySymbol, fetchTickersByPlatform, fetchBalanceByPlatform, fetchCmcApi, fetchOpenOrdersByPlatform, fetchMarketsByPlatform } from '../server/fetchFromServer';
import { STABLECOINS } from '../constants/assets';

const responseJson = ref<object | null>(null);
const isLoading = ref<boolean>(false);

// Champs de saisie
const trade_base = ref<string>('');
const trade_platform = ref<string>('');
const simple_platform = ref<string>(''); // pour les actions ne nécessitant que la plateforme

// Requête CMC 
const fetchCmc = async () => {
    isLoading.value = true;
    try {
        responseJson.value = await fetchCmcApi();
    } catch (error) {
        console.error(error);
        responseJson.value = { error: 'Erreur lors de la requête CMC.' };
    } finally {
        isLoading.value = false;
    }
};

// Requête Trades (base + platform)
const fetchTrades = async () => {
    isLoading.value = true;
    try {
        const fetchValue = await fetchTradeBySymbol({
            base: trade_base.value,
            platform: trade_platform.value
        });
        responseJson.value = transformTrades(fetchValue as StuffTrade[], trade_platform.value);
    } catch (error) {
        console.error(error);
        responseJson.value = { error: 'Erreur lors de la requête Trades.' };
    } finally {
        isLoading.value = false;
    }
};

interface StuffTrade {
    symbol: string;
    timestamp: number;
    dateUTC: string;
    order: string;
    side: string;
    price: number;
    amount: number;
    cost: number;
    fee: { cost: number; currency: string; };
}
const transformTrades = (trades: StuffTrade[], platform: string) => {
    return trades.map(trade => {
        const [base, quote] = trade.symbol.split('/');
        const eqUSD = STABLECOINS.includes(quote) ? parseFloat(trade.cost.toFixed(2)) : -1;
        return { timestamp: trade.timestamp, pair: trade.symbol, dateUTC: trade.dateUTC, order: trade.order, side: trade.side, price: trade.price, amount: trade.amount, total: trade.cost, eqUSD, fee: trade.fee.cost, feecoin: trade.fee.currency, base, quote, platform };
    });
};

// Requêtes nécessitant uniquement la plateforme
const fetchBalance = async () => {
    isLoading.value = true;
    try {
        const fetchValue = await fetchBalanceByPlatform({ platform: simple_platform.value });
        responseJson.value = fetchValue.sort((a, b) => a.base.localeCompare(b.base));
    } catch (error) {
        console.error(error);
        responseJson.value = { error: 'Erreur lors de la requête Balance.' };
    } finally {
        isLoading.value = false;
    }
};

const fetchOpenOrders = async () => {
    isLoading.value = true;
    try {
        responseJson.value = await fetchOpenOrdersByPlatform({ platform: simple_platform.value });
    } catch (error) {
        console.error(error);
        responseJson.value = { error: 'Erreur lors de la requête Open Orders.' };
    } finally {
        isLoading.value = false;
    }
};

const fetchMarkets = async () => {
    isLoading.value = true;
    try {
        responseJson.value = await fetchMarketsByPlatform({ platform: simple_platform.value });
    } catch (error) {
        console.error(error);
        responseJson.value = { error: 'Erreur lors de la requête Markets.' };
    } finally {
        isLoading.value = false;
    }
};

const fetchTickers = async () => {
    isLoading.value = true;
    try {
        responseJson.value = await fetchTickersByPlatform({ platform: simple_platform.value });
    } catch (error) {
        console.error(error);
        responseJson.value = { error: 'Erreur lors de la requête Tickers.' };
    } finally {
        isLoading.value = false;
    }
};

const copyToClipboard = () => {
    const jsonContent = JSON.stringify(responseJson.value, null, 2);
    navigator.clipboard.writeText(jsonContent).then(
        () => alert('Contenu copié dans le presse-papiers !'),
        (err) => console.error('Erreur lors de la copie :', err)
    );
};
</script>

<template>
    <div class="container">
        <!-- Actions de requêtes -->
        <section class="actions">
            <div class="card">
                <h4>CMC</h4>
                <button @click="fetchCmc" :disabled="isLoading">
                    {{ isLoading ? 'Chargement...' : 'Envoyer' }}
                </button>
            </div>
            <div class="card">
                <h4>Trades</h4>
                <div class="field">
                    <label for="trade_base">Base:</label>
                    <input id="trade_base" v-model="trade_base" type="text" placeholder="BTC" :disabled="isLoading" />
                </div>
                <div class="field">
                    <label for="trade_platform">Platform:</label>
                    <input id="trade_platform" v-model="trade_platform" type="text" placeholder="binance"
                        :disabled="isLoading" />
                </div>
                <button @click="fetchTrades" :disabled="isLoading">
                    {{ isLoading ? 'Chargement...' : 'Envoyer' }}
                </button>
            </div>
            <div class="card">
                <h4>Autres (Balance, Open Orders, Markets, Tickers)</h4>
                <div class="field">
                    <label for="simple_platform">Platform:</label>
                    <input id="simple_platform" v-model="simple_platform" type="text" placeholder="binance"
                        :disabled="isLoading" />
                </div>
                <div class="btn-group">
                    <button @click="fetchBalance" :disabled="isLoading">
                        Balance
                    </button>
                    <button @click="fetchOpenOrders" :disabled="isLoading">
                        Open Orders
                    </button>
                    <button @click="fetchMarkets" :disabled="isLoading">
                        Markets
                    </button>
                    <button @click="fetchTickers" :disabled="isLoading">
                        Tickers
                    </button>
                </div>
            </div>
        </section>

        <!-- Zone de réponse -->
        <section class="response">
            <div class="header">
                <h4>Réponse du serveur</h4>
                <button v-if="responseJson" @click="copyToClipboard">Copier</button>
            </div>
            <div v-if="isLoading" class="placeholder">Chargement en cours...</div>
            <div v-else-if="responseJson" class="content" contenteditable="true">
                <pre>{{ JSON.stringify(responseJson, null, 2) }}</pre>
            </div>
            <div v-else class="placeholder">Aucune réponse reçue.</div>
        </section>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    gap: 1rem;
    padding: 1rem;
}

.actions {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card {
    background: var(--card-secondary-bg);
    padding: 1rem;
    border-radius: 4px;
}

.card h4 {
    margin-bottom: 0.5rem;
}

.field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.field label {
    width: 70px;
    text-align: right;
}

.field input {
    flex: 1;
    padding: 0.3rem;
    border-radius: 4px;
    border: 1px solid var(--searchbar-border);
    background-color: var(--searchbar-bg);
    color: var(--searchbar-text);
}

.btn-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

button {
    padding: 0.5rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    cursor: not-allowed;
}

.response {
    flex: 2;
    background: var(--card-secondary-bg);
    padding: 1rem;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.response .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.response .content {
    background: #222;
    padding: 1rem;
    border-radius: 4px;
    overflow-y: auto;
    max-height: 400px;
}

.placeholder {
    font-style: italic;
    color: #aaa;
}
</style>
