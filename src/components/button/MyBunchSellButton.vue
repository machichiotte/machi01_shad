<!-- src/components/MyBunchSellButton.vue -->
<script setup lang="ts">
import { bunchLimitSellOrders, cancelAllSellOrders } from '../../js/server/orders'
import { loadingSpin, successSpinHtml } from '../../js/utils/spinner'

// Définir les types pour les props
interface SelectedAsset {
  asset: string;
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
  selectedAssets: SelectedAsset[]; // Changement du type de prop pour un tableau d'objets SelectedAsset
}>();

const cancelExistingSellOrders = async (selectedRows: SelectedAsset[]): Promise<string[]> => {
  const cancellationResults = await Promise.all(selectedRows.map(async (row) => {

    if (row.nbOpenSellOrders > 0) {
      try {
        await cancelAllSellOrders(row.platform, row.asset);
        return row.asset;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  }));

  return cancellationResults.filter(Boolean) as string[];
}

const placeSellOrders = async (assetsToPlaceOrders: string[], selectedRows: SelectedAsset[]): Promise<string[]> => {
  return await Promise.all(assetsToPlaceOrders.map(async (asset) => {
    const selectedRow = selectedRows.find(row => row.asset === asset);
    if (!selectedRow) {
      console.error(`No selected row found for asset: ${asset}`);
      return `Error: No selected row found for ${asset}`;
    }
    const amounts = [selectedRow.amountTp1, selectedRow.amountTp2, selectedRow.amountTp3, selectedRow.amountTp4, selectedRow.amountTp5];
    const prices = [selectedRow.priceTp1, selectedRow.priceTp2, selectedRow.priceTp3, selectedRow.priceTp4, selectedRow.priceTp5];

    try {
      const orderResults = await Promise.all(
        amounts.map(async (amount, index) => {
          try {
            await bunchLimitSellOrders(selectedRow.platform, asset, amount, prices[index]);
            return 200;
          } catch (error) {
            return (error as Error).message;
          }
        })
      );
      return `${asset}: ${orderResults.join(', ')}`;
    } catch (error) {
      console.error(`Failed to place orders for ${asset}: ${error}`);
      return `Error placing orders for ${asset}`;
    }
  }));
}

const iAmClicked = async (): Promise<void> => {
  const selectedRows = props.selectedAssets;
  loadingSpin();

  const assetsToPlaceOrders = await cancelExistingSellOrders(selectedRows);
  const orderPlacementResults = await placeSellOrders(assetsToPlaceOrders, selectedRows);

  successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
}
</script>

<template>
  <Button label="Add Sell Orders" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="iAmClicked"></Button>
</template>