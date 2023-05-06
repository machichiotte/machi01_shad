<template>
    <div>
        <div style="display:flex; justify-content:flex-end;">
            <button @click="updateStrat">Sauvegarder</button>
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
                        <select v-model="strat[asset][platform]" :disabled="isDisabled(asset, platform)">
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
const serverHost = "http://localhost:3000";

export default {
    data() {
        return {
            balance: [],
            platforms: [],
            assets: [],
            strat: [],
            stratMap: {}
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
                this.strat = data[0];
                console.log("strat:: " + this.strat)

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

                await fetch(`${serverHost}/update/strat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ strat: stratMap }),
                });
            } catch (err) {
                console.error(err);
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
  