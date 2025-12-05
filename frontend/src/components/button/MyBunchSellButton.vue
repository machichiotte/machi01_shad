<!-- src/components/MyBunchSellButton.vue -->
<script setup lang="ts">
import { addLimitSellOrder, cancelAllSellOrders } from '../../server/order'
import { loadingSpin, successSpinHtml } from '../../utils/spinner'

// Définir les types pour les props
interface SelectedBase {
  base: string;
  platform: string;
  nbOpenSellOrders: number;
  amountTp1: number;
  amountTp2: number;
  amountTp3: number;
  amountTp4: number;
  amountTp5: number;
  priceTp1: number;
  priceTp2: number;
  priceTp3: number;
  priceTp4: number;
  priceTp5: number;
}

const props = defineProps<{
  selectedBases: SelectedBase[]; // Changement du type de prop pour un tableau d'objets SelectedBases
}>();

const cancelExistingSellOrders = async (selectedRows: SelectedBase[]): Promise<string[]> => {
  const cancellationResults = await Promise.all(selectedRows.map(async (row) => {

    if (row.nbOpenSellOrders > 0) {
      try {
        await cancelAllSellOrders(row.platform, row.base);
        return row.base;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  }));

  return cancellationResults.filter(Boolean) as string[];
}

const placeSellOrders = async (bases: string[], selectedRows: SelectedBase[]): Promise<string[]> => {
  return await Promise.all(bases.map(async (base) => {
    const selectedRow = selectedRows.find(row => row.base === base);
    if (!selectedRow) {
      console.error(`No selected row found for base: ${base}`);
      return `Error: No selected row found for ${base}`;
    }
    const amounts = [selectedRow.amountTp1, selectedRow.amountTp2, selectedRow.amountTp3, selectedRow.amountTp4, selectedRow.amountTp5];
    const prices = [selectedRow.priceTp1, selectedRow.priceTp2, selectedRow.priceTp3, selectedRow.priceTp4, selectedRow.priceTp5];

    try {
      const orderResults = await Promise.all(
        amounts.map(async (amount, index) => {
          try {
            await addLimitSellOrder(selectedRow.platform, base, amount, prices[index]);
            return 200;
          } catch (error) {
            return (error as Error).message;
          }
        })
      );
      return `${base}: ${orderResults.join(', ')}`;
    } catch (error) {
      console.error(`Failed to place orders for ${base}: ${error}`);
      return `Error placing orders for ${base}`;
    }
  }));
}

const iAmClicked = async (): Promise<void> => {
  const selectedRows = props.selectedBases;
  loadingSpin();

  const assetsToPlaceOrders = await cancelExistingSellOrders(selectedRows);
  const orderPlacementResults = await placeSellOrders(assetsToPlaceOrders, selectedRows);

  successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
}
</script>

<template>
  <Button label="Add Sell Orders" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="iAmClicked"></Button>
</template>