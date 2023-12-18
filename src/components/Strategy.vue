<template>
    <div>
        <div style="display:flex; justify-content:flex-end;">
            <button @click="updateStrat">Sauvegarder</button>
        </div>

        <div>
            <select v-model="selectedStrategy" @change="updateAllStrats">
                <option value="">Sélectionner une stratégie</option>
                <option value="strategy1">Shad</option>
                <option value="strategy2">Shad skip x2</option>
                <option value="strategy3">Strategy 3</option>
            </select>
        </div>

        <table ref="stratTable">
            <thead>
                <tr>
                    <th>Asset</th>
                    <th v-for="platform in platforms" :key="platform">{{ platform }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(asset, assetIndex) in assets" :key="assetIndex">
                    <td>{{ asset }}</td>

                    <td v-for="(platform, platformIndex) in platforms" :key="platformIndex">
                        <select :value="getStratValue(asset, platform)"
                            @input="setStratValue(asset, platform, $event.target.value)"
                            :disabled="isDisabled(asset, platform)">
                            <option value=""></option>
                            <option value="strategy1">Shad</option>
                            <option value="strategy2">Shad skip x2</option>
                            <option value="strategy3">Strategy 3</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
  
<script>
import { getBalances, getStrategy } from '../js/getter.js';
import { successSpin, errorSpin } from '../js/spinner.js';
import { saveStrategyToIndexedDB } from '../js/indexedDB';

const serverHost = process.env.VUE_APP_SERVER_HOST;

export default {
    name: "StrategyPage",
    data() {
        return {
            balance: [],
            platforms: [],
            assets: [],
            strat: [],
            stratMap: [],
            selectedStrategy: "",
        };
    },
    methods: {
        async getData() {
            try {
                this.balance = await getBalances();
                // console.log('ball', this.balance);
                this.platforms = [...new Set(this.balance.map(item => item.platform))].sort();
                // console.log('platforms', this.platforms);
                this.assets = [...new Set(this.balance.map(item => item.symbol))].sort();
                // console.log('assets', this.assets);

            } catch (err) {
                console.error(err);
            }
        },
        async getStrat() {
            try {
                const data = await getStrategy();

                if (data.length === 0) {
                    this.assets.forEach((asset) => {
                        let assetStrat = {
                            symbol: asset,
                            strategies: {},
                        };
                        this.platforms.forEach((platform) => {
                            assetStrat.strategies[platform] = "";
                        });
                        this.strat.push(assetStrat);
                    });
                } else {
                    this.strat = data;
                }
            } catch (err) {
                console.error(err);
            }
        },
        async updateStrat() {
            this.stratMap = [];
            try {
                const rows = this.$refs.stratTable.querySelectorAll('tbody tr');

                rows.forEach((row) => {
                    let asset = "";
                    let strategies = {};

                    const cells = row.querySelectorAll('td');

                    cells.forEach((cell, index) => {
                        if (index === 0) {
                            asset = cell.textContent;
                        } else {
                            const colName = this.platforms[index - 1];
                            const selectEl = cell.querySelector('select');
                            strategies[colName] = selectEl.value;
                        }
                    });
                    let rowData = {
                        asset: asset,
                        strategies: strategies,
                    };
                    //console.log('rowData', rowData)
                    this.stratMap.push(rowData);
                });

                // Make the API call
                const response = await fetch(`${serverHost}/update/strategy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.stratMap),
                });

                console.log('stringify',JSON.stringify(this.stratMap));
                // Get the API call result
                const data = await response.json();

                // Enregistrez les données dans IndexedDB
                await saveStrategyToIndexedDB(data);

                successSpin('Save completed', `Strat : ${this.stratMap.length}`, true, true);

            } catch (err) {
                console.error(err);
                // Show an error alert within the existing alert
                errorSpin('Error', `${err}`, false, true);
            }

        },
        async updateAllStrats() {
            const selectedStrategy = this.selectedStrategy;

            Object.keys(this.strat).forEach((asset) => {
                if (!this.strat[asset]) {
                    // Si la clé n'existe pas dans this.strat, créez une nouvelle entrée avec les plateformes vides
                    this.strat[asset] = {};
                    this.platforms.forEach((platform) => {
                        this.strat[asset][platform] = '';
                    });
                }

                Object.keys(this.strat[asset]).forEach((platform) => {
                    if (!this.isDisabled(asset, platform)) {
                        this.strat[asset][platform] = selectedStrategy;
                    }
                });
            });
        },

        getStratValue(asset, platform) {
            return this.strat[asset] ? this.strat[asset][platform] : '';
        },
        setStratValue(asset, platform, value) {
            if (this.strat[asset]) {
                this.strat[asset][platform] = value;
            }
        },
        isDisabled(asset, platform) {
            const assets = this.balance.filter(item => item.symbol === asset);
            const platforms = assets.map(item => item.platform);
            return !platforms.includes(platform);
        },
    },
    async mounted() {
        await this.getData();
        await this.getStrat();
    },
};
</script>
  