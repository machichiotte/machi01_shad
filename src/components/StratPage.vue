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
const serverHost = process.env.VUE_APP_SERVER_HOST;

export default {
    data() {
        return {
            balance: [],
            platforms: [],
            assets: [],
            strat: {},
            stratMap: {},
            selectedStrategy: "",
        };
    },
    methods: {
        async getBalance() {
            try {
                const response = await fetch(`${serverHost}/get/balance`);
                const data = await response.json();
                this.balance = data;
                this.platforms = [...new Set(data.map(item => item.platform))].sort();
                this.assets = [...new Set(data.map(item => item.symbol))].sort();
            } catch (err) {
                console.error(err);
            }
        },
        async getStrat() {
            try {
                const response = await fetch(`${serverHost}/get/strat`);
                const data = await response.json();

                if (data.length === 0) {
                    this.assets.forEach(asset => {
                        const assetStrat = {};
                        this.platforms.forEach(platform => {
                            assetStrat[platform] = "";
                        });
                        this.strat[asset] = assetStrat;
                    });
                } else {
                    this.strat = data[0];
                }
            } catch (err) {
                console.error(err);
            }
        },
        async updateStrat() {
            const stratMap = {};
            try {
                const rows = this.$refs.stratTable.querySelectorAll('tbody tr');

                rows.forEach((row) => {
                    const rowData = {};
                    const cells = row.querySelectorAll('td');
                    let asset = "";
                    cells.forEach((cell, index) => {
                        if (index === 0) {
                            asset = cell.textContent;
                        } else {
                            const colName = this.platforms[index - 1];
                            const selectEl = cell.querySelector('select');
                            rowData[colName] = selectEl.value;
                        }
                    });
                    stratMap[asset] = rowData;
                });

                // Make the API call
                const response = await fetch(`${serverHost}/update/strat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ strat: stratMap }),
                });

                // Get the API call result
                await response.json();

                // Update the content of the alert with the result
                this.$swal({
                    title: 'Save completed',
                    icon: 'success',
                    allowOutsideClick: true,
                    showConfirmButton: true
                });
            } catch (err) {
                console.error(err);
                // Show an error alert within the existing alert
                this.$swal({
                    title: 'Error',
                    text: 'An error occurred during processing.',
                    icon: 'error',
                    allowOutsideClick: false,
                    showConfirmButton: true
                });
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
    mounted() {
        this.getBalance();
        this.getStrat();
    },
};
</script>
  