<!-- src/components/forms/InvestmentCalculator.vue -->
<template>
    <div>
        <!-- Formulaire -->
        <div class="form-container">
            <h2>Investment Calculator</h2>
            <div class="form-group">
                <label for="totalAmount">Total Investment Amount ($):</label>
                <input v-model.number="totalAmount" type="number" id="totalAmount" placeholder="Enter total amount" />
            </div>
            <div class="form-group">
                <label for="priceLower">Lower Price:</label>
                <input v-model.number="priceLower" type="number" id="priceLower" placeholder="Enter lower price" />
            </div>
            <div class="form-group">
                <label for="priceUpper">Upper Price:</label>
                <input v-model.number="priceUpper" type="number" id="priceUpper" placeholder="Enter upper price" />
            </div>
            <div class="form-group">
                <label for="orderCount">Number of Orders:</label>
                <select v-model="orderCount">
                    <option v-for="count in [5, 10, 15, 20, 25, 50]" :key="count" :value="count">
                        {{ count }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="platformOption">Platform Option:</label>
                <select v-model="platformOption">
                    <option value="default">Default</option>
                    <option value="binance">Binance</option>
                </select>
            </div>
            <div class="form-group">
                <label for="percentageOption">Percentage Type:</label>
                <select v-model="percentageOption">
                    <option value="average">Average Percentage</option>
                    <option value="weighted">Weighted Percentage</option>
                </select>
            </div>
            <button @click="calculateInvestment">Validate</button>
        </div>

        <!-- Tableau des résultats -->
        <div v-if="investmentTable.length > 0" class="table-container">
            <h3>Investment Table</h3>
            <table>
                <thead>
                    <tr>
                        <th>Trade #</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Amount Invested</th>
                        <th>Percentage</th>
                        <th>Average Purchase</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in investmentTable" :key="index">
                        <td>{{ row.tradeNumber }}</td>
                        <td>{{ row.price }}</td>
                        <td>{{ row.quantity }}</td>
                        <td>{{ row.amountInvested }}</td>
                        <td>{{ row.percentage }}</td>
                        <td>{{ row.averagePurchase }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // Pourcentages pondérés pour chaque configuration de nombre d'ordres
            percentages: {
                5: [10.3, 14.8, 19.3, 23.9, 31.7],
                10: [4.6, 5.7, 6.8, 8.0, 9.1, 10.2, 11.4, 12.5, 13.6, 18.1],
                15: [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 15.0],
                20: [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.0, 10.0],
                25: [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.0],
                50: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4],
            },
            totalAmount: null,
            priceLower: null,
            priceUpper: null,
            orderCount: 10, // Nombre d'ordres par défaut
            platformOption: "default",
            percentageOption: "average", // "average" or "weighted"
            investmentTable: [],
        };
    },
    methods: {
        calculateInvestment() {
            if (
                this.totalAmount === null ||
                this.priceLower === null ||
                this.priceUpper === null
            ) {
                alert("Please fill in all fields.");
                return;
            }

            // Si l'option Binance est sélectionnée, vérifier le montant minimum par ordre
            if (this.platformOption === "binance" && this.totalAmount / this.orderCount < 5) {
                alert("For Binance, each investment must be at least $5.");
                return;
            }

            // Adapter les pourcentages en fonction du nombre d'ordres
            let adjustedPercentages = [];
            if (this.percentageOption === "average") {
                // Pourcentage moyen : repartir uniformément
                const averagePercentage = 100 / this.orderCount;
                adjustedPercentages = Array(this.orderCount).fill(averagePercentage);
            } else if (this.percentageOption === "weighted") {
                // Pourcentage pondéré : utiliser les pourcentages spécifiques en fonction du nombre d'ordres
                adjustedPercentages = this.percentages[this.orderCount];
            }

            const priceRange = this.priceUpper - this.priceLower;
            let cumulativeAmount = 0;
            let cumulativeQuantity = 0;

            const tableData = adjustedPercentages.map((percent, index) => {
                const price = this.priceUpper - (index / (adjustedPercentages.length - 1)) * priceRange;
                let amountInvested = (this.totalAmount * percent) / 100;

                // Si l'option Binance est activée, s'assurer que chaque montant investi est >= 5$
                if (this.platformOption === "binance" && amountInvested < 5) {
                    amountInvested = 5;
                }

                const quantity = amountInvested / price;

                cumulativeAmount += amountInvested;
                cumulativeQuantity += quantity;

                const averagePurchase = cumulativeAmount / cumulativeQuantity;

                return {
                    tradeNumber: index + 1,
                    price: price.toFixed(2),
                    quantity: quantity.toFixed(6),
                    amountInvested: amountInvested.toFixed(2),
                    percentage: `${percent.toFixed(1)}%`,
                    averagePurchase: averagePurchase.toFixed(2),
                };
            });

            this.investmentTable = tableData;
        },
    },
};
</script>

<style>
.form-container {
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 10px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

table th,
table td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
}

.table-container {
    margin-top: 20px;
}
</style>