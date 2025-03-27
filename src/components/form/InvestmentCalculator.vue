<!-- src/components/forms/InvestmentCalculator.vue -->
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
            maxWanted: null,
            prevBuyTotal: null,
            prevSellTotal: null,
            balance: null,
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

            if (this.platformOption === "binance" && this.totalAmount / this.orderCount < 5) {
                alert("For Binance, each investment must be at least $5.");
                return;
            }

            let adjustedPercentages = [];
            if (this.percentageOption === "average") {
                const averagePercentage = 100 / this.orderCount;
                adjustedPercentages = Array(this.orderCount).fill(averagePercentage);
            } else if (this.percentageOption === "weighted") {
                adjustedPercentages = this.percentages[this.orderCount];
            }

            const priceRange = this.priceUpper - this.priceLower;
            let currentPrice = this.priceLower;

            let cumulativeAmount = 0; // Cumulative invested amount
            let cumulativeQuantity = 0; // Cumulative invested quantity

            this.investmentTable = [];

            for (let i = 0; i < this.orderCount; i++) {
                const percentage = adjustedPercentages[i];
                const amountInvested = (this.totalAmount * percentage) / 100;
                const quantity = amountInvested / currentPrice;

                cumulativeAmount += amountInvested;
                cumulativeQuantity += quantity;

                const cumulatedInvestQuantity = cumulativeQuantity.toFixed(8);
                const cumulatedInvestAmount = cumulativeAmount.toFixed(2);

                const totalInvestQuantity = (
                    cumulativeQuantity + this.balance
                ).toFixed(8);

                const totalInvestAmount = (
                    cumulativeAmount +
                    (this.prevBuyTotal || 0) -
                    (this.prevSellTotal || 0)
                ).toFixed(2);

                const totalAverageEntryPrice = (
                    totalInvestAmount / totalInvestQuantity
                ).toFixed(4);

                this.investmentTable.push({
                    tradeNumber: i + 1,
                    price: currentPrice.toFixed(4),
                    quantity: quantity.toFixed(8),
                    amountInvested: amountInvested.toFixed(2),
                    percentage: percentage.toFixed(1),
                    averagePurchase: (cumulativeAmount / cumulativeQuantity).toFixed(4),
                    cumulatedInvestQuantity,
                    cumulatedInvestAmount,
                    totalInvestQuantity,
                    totalInvestAmount,
                    totalAverageEntryPrice,
                });

                currentPrice += priceRange / (this.orderCount - 1);
            }
        },
    },

};
</script>

<template>
    <div>
        <!-- Formulaire principal avec les anciens champs -->
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

        <!-- Nouvelle section pour les champs supplémentaires -->
        <div class="form-container">
            <h3>Additional Fields</h3>
            <div class="form-group">
                <label for="prevBuyTotal">Previous Total Purchase ($):</label>
                <input v-model.number="prevBuyTotal" type="number" id="prevBuyTotal"
                    placeholder="Previous total buy amount" />
            </div>
            <div class="form-group">
                <label for="prevSellTotal">Previous Total Sale ($):</label>
                <input v-model.number="prevSellTotal" type="number" id="prevSellTotal"
                    placeholder="Previous total sell amount" />
            </div>
            <div class="form-group">
                <label for="balance">Current Balance ($):</label>
                <input v-model.number="balance" type="number" id="balance" placeholder="Current balance" />
            </div>
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
                        <th>Purchase Average Price</th>

                        <!-- Je veux rajouter ceci, qui affichera la somme des amount invested precedents, jai aussi besoin de modifier le script-->
                        <th>Cumulated Invest Quantity</th>
                        <th>Cumulated Invest Amount</th>

                        <!-- Ici on fait somme de la valeur cummulated + valeur input Current Balance-->
                        <th>Total Invest Quantity</th>
                        <!-- Ici on fait somme de la valeur cummulated + valeur input totalbuy - valeur input totalsell -->
                        <th>Total Invest Amount</th>

                        <!-- Ici on fait somme de la valeur Total invest amount / total invest quantity -->
                        <th>Total Average Entry Price</th>
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
                        <td>{{ row.cumulatedInvestQuantity }}</td>
                        <td>{{ row.cumulatedInvestAmount }}</td>
                        <td>{{ row.totalInvestQuantity }}</td>
                        <td>{{ row.totalInvestAmount }}</td>
                        <td>{{ row.totalAverageEntryPrice }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

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