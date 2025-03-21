<!-- src/components/Stuff.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { fetchTradeBySymbol, fetchBalanceByPlatform, fetchCmcApi, fetchOpenOrdersByPlatform, fetchMarketsByPlatform } from '../js/server/fetchFromServer';
import { STABLECOINS } from '../js/constants';

const responseJson = ref<object | null>(null); // Stocke la réponse du serveur
const isLoading = ref<boolean>(false); // Indique si une requête est en cours

const trade_base = ref<string>('');
const trade_platform = ref<string>('');

const balance_platform = ref<string>('');

const openorders_platform = ref<string>('');

const markets_platform = ref<string>('');

const tickers_platform = ref<string>('');

const fetchCmc = async () => {
    isLoading.value = true; // Affiche le loader
    try {
        const fetchValue = await fetchCmcApi();
        responseJson.value = fetchValue;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        responseJson.value = { error: 'Une erreur s\'est produite lors de la requête.' };
    } finally {
        isLoading.value = false; // Cache le loader une fois la requête terminée
    }
};

const fetchTradeBySymbolAndPlatform = async () => {
    isLoading.value = true; // Affiche le loader
    try {
        const fetchValue = await fetchTradeBySymbol({
            base: trade_base.value,
            platform: trade_platform.value
        });
        const transformedResponse = transformTrades(fetchValue as StuffTrade[], trade_platform.value);
        responseJson.value = transformedResponse;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        responseJson.value = { error: 'Une erreur s\'est produite lors de la requête.' };
    } finally {
        isLoading.value = false; // Cache le loader une fois la requête terminée
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
    fee: {
        cost: number;
        currency: string;
    };
}

const transformTrades = (trades: StuffTrade[], platform: string) => {
    return trades.map((trade: StuffTrade) => {
        const [base, quote] = trade.symbol.split('/');
        const eqUSD = STABLECOINS.includes(quote) ? parseFloat(trade.cost.toFixed(2)) : -1;
        return {
            timestamp: trade.timestamp,
            pair: trade.symbol,
            dateUTC: trade.dateUTC,
            order: trade.order,
            side: trade.side,
            price: trade.price,
            amount: trade.amount,
            total: trade.cost,
            eqUSD: eqUSD, // Arrondi à 2 décimales
            fee: trade.fee.cost,
            feecoin: trade.fee.currency,
            base: base,
            quote: quote,
            platform: platform // Ajout de la plateforme en dur
        };
    });
};

const fetchBalance = async () => {
    isLoading.value = true; // Affiche le loader
    try {
        const fetchValue = await fetchBalanceByPlatform({
            platform: balance_platform.value
        });
        const sortedBalances = fetchValue.sort((a, b) => a.base.localeCompare(b.base));
        responseJson.value = sortedBalances;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        responseJson.value = { error: 'Une erreur s\'est produite lors de la requête.' };
    } finally {
        isLoading.value = false; // Cache le loader une fois la requête terminée
    }
};

const fetchOpenOrders = async () => {
    isLoading.value = true; // Affiche le loader
    try {
        const fetchValue = await fetchOpenOrdersByPlatform({
            platform: openorders_platform.value
        });
        responseJson.value = fetchValue;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        responseJson.value = { error: 'Une erreur s\'est produite lors de la requête.' };
    } finally {
        isLoading.value = false; // Cache le loader une fois la requête terminée
    }
};

const fetchMarkets = async () => {
    isLoading.value = true; // Affiche le loader
    try {
        const fetchValue = await fetchMarketsByPlatform({
            platform: markets_platform.value
        });
        responseJson.value = fetchValue;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        responseJson.value = { error: 'Une erreur s\'est produite lors de la requête.' };
    } finally {
        isLoading.value = false; // Cache le loader une fois la requête terminée
    }
};

const fetchTickers = async () => {
    isLoading.value = true; // Affiche le loader
    try {
        const fetchValue = await fetchMarketsByPlatform({
            platform: tickers_platform.value
        });
        responseJson.value = fetchValue;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        responseJson.value = { error: 'Une erreur s\'est produite lors de la requête.' };
    } finally {
        isLoading.value = false; // Cache le loader une fois la requête terminée
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
    <div class="stuff-container">
        <div class="left-panel">
            <h3>Requêtes au serveur</h3>
            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir données CMC</h4>
                    <button @click="fetchCmc" :disabled="isLoading">
                        {{ isLoading ? 'Chargement...' : 'Envoyer la requête' }}
                    </button>
                </div>
            </div>

            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir les trades</h4>
                    <button @click="fetchTradeBySymbolAndPlatform" :disabled="isLoading">
                        {{ isLoading ? 'Chargement...' : 'Envoyer la requête' }}
                    </button>
                </div>
                <div class="input-row">
                    <!-- Champs en ligne pour gagner de la place -->
                    <div class="inline-field">
                        <label for="base_trade">Base:</label>
                        <input id="base_trade" v-model="trade_base" type="text" placeholder="Ex: BTC"
                            :disabled="isLoading" />
                    </div>
                    <div class="inline-field">
                        <label for="platform_trade">Platform:</label>
                        <input id="platform_trade" v-model="trade_platform" type="text" placeholder="Ex: binance"
                            :disabled="isLoading" />
                    </div>
                </div>
            </div>

            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir la balance</h4>
                    <button @click="fetchBalance" :disabled="isLoading">
                        {{ isLoading ? 'Chargement...' : 'Envoyer la requête' }}
                    </button>
                </div>
                <div class="input-row">
                    <div class="inline-field">
                        <label for="balance_platform">Platform:</label>
                        <input id="balance_platform" v-model="balance_platform" type="text" placeholder="Ex: binance"
                            :disabled="isLoading" />
                    </div>
                </div>
            </div>

            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir les ordres ouverts</h4>
                    <button @click="fetchOpenOrders" :disabled="isLoading">
                        {{ isLoading ? 'Chargement...' : 'Envoyer la requête' }}
                    </button>
                </div>
                <div class="input-row">
                    <div class="inline-field">
                        <label for="openorders_platform">Platform:</label>
                        <input id="openorders_platform" v-model="openorders_platform" type="text"
                            placeholder="Ex: binance" :disabled="isLoading" />
                    </div>
                </div>
            </div>

            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir les markets</h4>
                    <button @click="fetchMarkets" :disabled="isLoading">
                        {{ isLoading ? 'Chargement...' : 'Envoyer la requête' }}
                    </button>
                </div>
                <div class="input-row">
                    <div class="inline-field">
                        <label for="markets_platform">Platform:</label>
                        <input id="markets_platform" v-model="markets_platform" type="text" placeholder="Ex: binance"
                            :disabled="isLoading" />
                    </div>
                </div>
            </div>

            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir les tickers</h4>
                    <button @click="fetchTickers" :disabled="isLoading">
                        {{ isLoading ? 'Chargement...' : 'Envoyer la requête' }}
                    </button>
                </div>
                <div class="input-row">
                    <div class="inline-field">
                        <label for="tickers_platform">Platform:</label>
                        <input id="tickers_platform" v-model="tickers_platform" type="text" placeholder="Ex: binance"
                            :disabled="isLoading" />
                    </div>
                </div>
            </div>
        </div>

        <div class="right-panel">
            <div class="header-row">
                <h4>Réponse du serveur</h4>
                <button v-if="responseJson" @click="copyToClipboard">Copier</button>
            </div>
            <div v-if="isLoading" class="response-placeholder">
                Chargement en cours...
            </div>
            <div v-else-if="responseJson" class="response-block" contenteditable="true">
                <pre>{{ JSON.stringify(responseJson, null, 2) }}</pre>
            </div>
            <div v-else class="response-placeholder">
                Aucune réponse reçue pour l'instant.
            </div>
        </div>
    </div>
</template>

<style scoped>
.stuff-container {
    display: flex;
    gap: 2rem;
    padding: 1rem;
}

/* Left Panel */
.left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.request-block {
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    background-color: #333;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.input-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

/* Nouveau style pour les champs en ligne */
.inline-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.inline-field label {
    width: 70px;
    margin: 0;
    font-size: 0.9rem;
    text-align: right;
}

.inline-field input {
    width: 120px;
    padding: 0.3rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
}

/* Boutons */
button {
    background: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

button:hover:enabled {
    background: #0056b3;
}

/* Right Panel */
.right-panel {
    flex: 2;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    background-color: #333;
}

.response-block {
    white-space: pre-wrap;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
    user-select: text;
}

.response-placeholder {
    color: #999;
    font-style: italic;
}
</style>
