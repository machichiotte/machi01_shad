<!-- src/components/forms/AddBuyOrdersForm.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { successSpinHtml } from '../../utils/spinner'
import { addLimitBuyOrder } from '../../server/order'
import type { ApiResponse } from '../../types/response';

interface BaseOption {
    base: string;
    platform: string;
}

interface BuyOrder {
    price: number | null;
    quantity: number | null;
    total: number | null;
}

const props = defineProps<{
    selectedBases: BaseOption[];
    onClose: () => void;
}>();

const selectedBase = ref<BaseOption | null>(null);
const buyOrders = ref<BuyOrder[]>([{ price: null, quantity: null, total: null }]);

/**
 * Vérifie si une ligne d'achat est valide.
 */
const isValidOrder = (order: BuyOrder): boolean => {
    return (order.price ?? 0) > 0 && (order.quantity ?? 0) > 0;
};

/**
 * Ajoute une ligne d'achat si le maximum de 10 n'est pas atteint.
 */
const addOrder = (): void => {
    if (buyOrders.value.length < 10) {
        buyOrders.value.push({ price: null, quantity: null, total: null });
    }
};

/**
 * Supprime une ligne d'achat.
 */
const removeOrder = (index: number): void => {
    buyOrders.value.splice(index, 1);
};

/**
 * Met à jour les valeurs calculées.
 */
const updateCalculatedValues = (index: number): void => {
    buyOrders.value[index].total = calculateTotal(index);
    buyOrders.value[index].quantity = calculateQuantity(index);
};

/**
 * Calcule le total d'une ligne d'achat.
 */
const calculateTotal = (index: number): number | null => {
    const order = buyOrders.value[index];
    return order.price !== null && order.quantity !== null
        ? parseFloat((order.price * order.quantity).toFixed(8))
        : null;
};

/**
 * Calcule la quantité basée sur le total et le prix.
 */
const calculateQuantity = (index: number): number | null => {
    const order = buyOrders.value[index];
    return order.total !== null && order.price !== null
        ? parseFloat((order.total / order.price).toFixed(8))
        : null;
};

/**
 * Envoie les ordres d'achat.
 */
const submitBuyOrders = async (): Promise<void> => {
    if (!selectedBase.value) {
        alert('Please select a base before submitting orders.');
        return;
    }

    if (buyOrders.value.some(order => !isValidOrder(order))) {
        alert('Please ensure all orders have valid price and quantity.');
        return;
    }

    const { platform, base } = selectedBase.value; // ✅ On extrait ici pour éviter le problème

    const orderPlacementResults = await Promise.all(buyOrders.value.map(async (order) => {
        try {
            if (order.quantity === null || order.price === null) {
                throw new Error("Order values cannot be null.");
            }

            const result: ApiResponse<unknown> = await addLimitBuyOrder(
                platform, // ✅ `selectedBase.value` est forcément défini ici
                base,
                order.quantity,
                order.price
            );
            return result;
        } catch (error) {
            console.error('Error placing order:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
                status: 'error',
                message: `Error placing order: ${errorMessage}`,
                timestamp: Date.now()
            } as ApiResponse<null>;
        }
    }));

    if (orderPlacementResults.length > 0) {
        const formattedResults = orderPlacementResults.map(result => {
            return `Status: ${result.status} - ${JSON.stringify(result.message)}`;
        });

        successSpinHtml('Save completed', formattedResults.join('<br>'), true, true);
    } else {
        successSpinHtml('NOTHING', 'No buy order', true, true);
    }

    props.onClose();
};

/**
 * Génère les options de sélection des bases.
 */
const baseOptions = computed<BaseOption[]>(() => {
    const bases = props.selectedBases.map(row => ({
        base: row.base,
        platform: row.platform
    }));

    return Array.from(new Set(bases.map(a => a.base))).map(base => bases.find(a => a.base === base)!);
});

// Réinitialiser selectedBase si elle ne fait plus partie des options disponibles
watch(baseOptions, (newOptions) => {
    if (!newOptions.some(option => option.base === selectedBase.value?.base)) {
        selectedBase.value = null;
    }
});

</script>

<template>
    <div>
        <!-- Sélection d'une base -->
        <Dropdown v-model="selectedBase" :options="baseOptions" optionLabel="base" placeholder="Select Base"
            class="mb-3" />

        <!-- Lignes d'ordre d'achat -->
        <div v-for="(order, index) in buyOrders" :key="index" class="order-row">
            <InputNumber v-model="order.price" :minFractionDigits="2" :maxFractionDigits="8" placeholder="Price"
                @input="updateCalculatedValues(index)" />
            <InputNumber v-model="order.quantity" :minFractionDigits="2" :maxFractionDigits="8" placeholder="Quantity"
                @input="updateCalculatedValues(index)" />
            <span class="calculated-value">Calculated Total: {{ calculateTotal(index) }}</span>
            <InputNumber v-model="order.total" :minFractionDigits="2" :maxFractionDigits="8" placeholder="Total"
                @input="updateCalculatedValues(index)" />
            <span class="calculated-value">Calculated Quantity: {{ calculateQuantity(index) }}</span>
            <Button icon="pi pi-times" class="p-button-danger" @click="removeOrder(index)" />
            <span v-if="!isValidOrder(order)" class="error-message">Invalid order: Price and Quantity must be positive
                numbers.</span>
        </div>

        <!-- Bouton pour ajouter une ligne -->
        <Button label="Add Line" @click="addOrder" :disabled="buyOrders.length >= 10" />

        <!-- Bouton pour soumettre les ordres -->
        <Button label="Submit" class="p-button-success" @click="submitBuyOrders" />
    </div>
</template>

<style scoped>
.order-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-direction: column;
}

.calculated-value {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
}

.error-message {
    color: var(--error-text);
    font-size: 0.8rem;
}
</style>
