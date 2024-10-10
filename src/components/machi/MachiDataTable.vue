<!-- src/components/machi/MachiDataTable.vue -->
<template>
    <DataTable class="mt-4 custom-data-table" :value="items" :rows="10" paginator stripedRows scrollable
        scroll-height="530px" v-model:selection="localSelectedAssets" @update:selection="emitSelection"
        selectionMode="multiple"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25, 100, 500]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
        <ColumnGroup type="header">
            <Row>
                <Column header="Icon" field="iconUrl" :rowspan="2" frozen alignFrozen="left" />
                <Column header="Asset" field="asset" :rowspan="2" sortable frozen alignFrozen="left" />
                <Column header="Platform" field="platform" :rowspan="2" sortable frozen alignFrozen="left" />
                <Column header="Current Price" field="currentPrice" :rowspan="2" sortable frozen alignFrozen="left" />
                <Column header="Strat" :rowspan="2" frozen alignFrozen="left" />
                <Column header="Status" field="status" :rowspan="2" sortable frozen alignFrozen="left" />
                <Column header="Total Shad" field="totalShad" :rowspan="2" sortable />
                <Column header="Rank" field="rank" :rowspan="2" sortable />
                <Column header="Average Entry Price" field="averageEntryPrice" :rowspan="2" sortable />
                <Column header="Total Buy" field="totalBuy" :rowspan="2" sortable />
                <Column header="Total Sell" field="totalSell" :rowspan="2" sortable />
                <Column header="Total Amount Bought" field="totalAmount" :rowspan="2" sortable />
                <Column header="Balance" field="balance" :rowspan="2" sortable />
                <Column header="Wallet" field="currentPossession" :rowspan="2" sortable />
                <Column header="Profit" field="profit" :rowspan="2" sortable />
                <Column header="Open Orders" :colspan="2" />
                <Column header="Ratio" field="ratioShad" :rowspan="2" sortable />
                <Column header="Shad Recovery" field="recupShad" :rowspan="2" sortable />
                <Column header="% to next TP" field="percentToNextTp" sortable :rowspan="2" />
                <Column header="Take Profit" :colspan="2" />
                <Column header="TP1" :colspan="2" />
                <Column header="TP2" :colspan="2" />
                <Column header="TP3" :colspan="2" />
                <Column header="TP4" :colspan="2" />
                <Column header="TP5" :colspan="2" />
                <Column header="Performance" :colspan="5" />
            </Row>
            <Row>
                <Column header="Buy" field="nbOpenBuyOrders" sortable />
                <Column header="Sell" field="nbOpenSellOrders" sortable />
                <Column header="tp1" field="recupTp1" sortable />
                <Column header="tpX" field="recupTpX" sortable />
                <Column header="amount" field="amountTp1" sortable />
                <Column header="price" field="priceTp1" sortable />
                <Column header="amount" field="amountTp2" sortable />
                <Column header="price" field="priceTp2" sortable />
                <Column header="amount" field="amountTp3" sortable />
                <Column header="price" field="priceTp3" sortable />
                <Column header="amount" field="amountTp4" sortable />
                <Column header="price" field="priceTp4" sortable />
                <Column header="amount" field="amountTp5" sortable />
                <Column header="price" field="priceTp5" sortable />
                <Column header="24h" field="cryptoPercentChange24h" sortable />
                <Column header="7d" field="cryptoPercentChange7d" sortable />
                <Column header="30d" field="cryptoPercentChange30d" sortable />
                <Column header="60d" field="cryptoPercentChange60d" sortable />
                <Column header="90d" field="cryptoPercentChange90d" sortable />
            </Row>
        </ColumnGroup>

        <Column field="iconUrl" frozen alignFrozen="left">
            <template #body="slotProps">
                <img :src="slotProps.data.iconUrl" :alt="slotProps.data.asset" class="border-round icon-32" />
            </template>
        </Column>

        <Column field="asset" frozen alignFrozen="left" />

        <Column field="platform" class="platform-column" frozen alignFrozen="left" />

        <Column field="currentPrice" frozen alignFrozen="left">
            <template #body="slotProps">
                <PriceWithChange :price="slotProps.data.currentPrice" :change="slotProps.data.cryptoPercentChange24h" />
            </template>
        </Column>

        <Column field="stratColumn" sortable frozen alignFrozen="left">
            <template #body="slotProps">
                <StrategyDropdown :data="slotProps.data" @apply-strategy="applyStrategyToRow" />
            </template>
        </Column>

        <Column field="status" class="status-column" frozen alignFrozen="left">
            <template #body="slotProps">
                <Tag :value="evaluateAssetStatus(slotProps.data).label"
                    :severity="evaluateAssetStatus(slotProps.data).severity" />
            </template>
        </Column>

        <Column field="totalShad" />
        <Column field="rank" />
        <Column field="averageEntryPrice">
            <template #body="slotProps">
                <PriceWithChange :price="slotProps.data.averageEntryPrice"
                    :change="slotProps.data.percentageDifference" />
            </template>
        </Column>
        <Column field="totalBuy" />
        <Column field="totalSell" />
        <Column field="totalAmount" />
        <Column field="balance" />
        <Column field="currentPossession" sortable>
            <template #body="slotProps">
                <ValueDisplay :value="slotProps.data.currentPossession" />
            </template>
        </Column>
        <Column field="profit" sortable>
            <template #body="slotProps">
                <ValueDisplay :value="slotProps.data.profit" />
            </template>
        </Column>
        <Column field="nbOpenBuyOrders" />
        <Column field="nbOpenSellOrders" />
        <Column field="ratioShad" />
        <Column field="recupShad" />
        <Column field="percentToNextTp">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.percentToNextTp" />
            </template>
        </Column>
        <Column field="recupTp1" />
        <Column field="recupTpX" />
        <Column field="amountTp1" />
        <Column field="priceTp1" />
        <Column field="amountTp2" />
        <Column field="priceTp2" />
        <Column field="amountTp3" />
        <Column field="priceTp3" />
        <Column field="amountTp4" />
        <Column field="priceTp4" />
        <Column field="amountTp5" />
        <Column field="priceTp5" />
        <Column field="cryptoPercentChange24h">
            <template #body="slotProps">
                <ChangePercentage :percentage="slotProps.data.cryptoPercentChange24h" />
            </template>
        </Column>
        <Column field="cryptoPercentChange7d">
            <template #body="slotProps">
                <ChangePercentage :percentage="slotProps.data.cryptoPercentChange7d" />
            </template>
        </Column>
        <Column field="cryptoPercentChange30d">
            <template #body="slotProps">
                <ChangePercentage :percentage="slotProps.data.cryptoPercentChange30d" />
            </template>
        </Column>
        <Column field="cryptoPercentChange60d">
            <template #body="slotProps">
                <ChangePercentage :percentage="slotProps.data.cryptoPercentChange60d" />
            </template>
        </Column>
        <Column field="cryptoPercentChange90d">
            <template #body="slotProps">
                <ChangePercentage :percentage="slotProps.data.cryptoPercentChange90d" />
            </template>
        </Column>

    </DataTable>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';


import { Machi } from '../../types/responseData';
import { getPriceThreshold } from '../../js/strat/common';
import {
    BINANCE_PLATFORM_ID,
    BINANCE_THRESHOLD,
    HTX_THRESHOLD
} from '../../js/constants'

import { updateAssetField } from '../../js/strat/common';

export default defineComponent({
    props: {
        items: {
            type: Array as PropType<Machi[]>,
            required: true
        },
        localSelectedAssets: {
            type: Array as PropType<Machi[]>,
            default: () => []
        }
    },
    methods: {
        emitSelection() {
            this.$emit('update:selection', this.localSelectedAssets);
        },
        applyStrategyToRow(items: Machi[], data: any, newStrat: string | Object) {
            // Logique pour appliquer la stratégie
            updateAssetField(items, data, 'strat', newStrat)
        },
        evaluateAssetStatus(data: Machi) {
            // Logique pour évaluer le statut de l'actif
            const { currentPrice, platform, status, nbOpenSellOrders, priceTp1, priceTp2 } = data

            if (status === 'stable coin') {
                return { severity: 'secondary', label: 'stable coin' }
            }

            if (!Array.isArray(status)) {
                console.warn('data.status is not an array:', status)
                return { severity: 'warning', label: `STATUS ERROR` }
            }

            const totalOrders = status.reduce((acc: number, val: number) => acc + val, 0)

            if (nbOpenSellOrders === 0) {
                return { severity: 'danger', label: "No open orders" }
            } else if (currentPrice > priceTp1) {
                return priceTp1 < priceTp2
                    ? { severity: 'info', label: 'You can sell for a while' }
                    : { severity: 'danger', label: 'tp2 < tp1' }
            }

            if (totalOrders === 5) {
                return { severity: 'success', label: '5 orders placed' }
            }

            const platformThreshold = platform === BINANCE_PLATFORM_ID ? BINANCE_THRESHOLD : HTX_THRESHOLD
            const priceThreshold = getPriceThreshold(currentPrice, platformThreshold)

            const nextOrder = status.findIndex((value: number) => value === 0)
            if (nextOrder !== -1) {
                const priceKey = `priceTp${nextOrder + 1}` as keyof Machi;
                const priceValue = data[priceKey];
                return priceThreshold < (priceValue as number)
                    ? { severity: 'success', label: 'Max orders placed' }
                    : { severity: 'warning', label: `Order ${nextOrder + 1} can be placed` }
            }

            return { severity: 'warning', label: `STATUS ERROR` }
        }
    }
});
</script>

<style scoped>
.bold-row {
    font-weight: bold;
}

.icon-32 {
    width: 32px;
    height: 32px;
}

/*
.custom-data-table {
    /* Vos styles personnalisés 
}

.platform-column {
    /* Styles spécifiques pour la colonne plateforme 
}

.status-column {
    /* Styles spécifiques pour la colonne statut 
}
*/
</style>
