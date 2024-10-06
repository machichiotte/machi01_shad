<!-- src/components/forms/TradesForm.vue -->
<template>
    <Dialog modal header="Add trade" class="dialog-custom">
        <div class="flex">
            <Dropdown placeholder="Select a Platform" :options="platforms" id="platform" class="field-group"
                v-model="formData['platform']" @update:model-value="formData['platform'] = $event" />
        </div>

        <div class="flex">
            <div class="field-group w-1/2">
                <label for="base" class="font-semibold">base</label>
                <InputText id="base" autocomplete="off" v-model="formData['base']" :modelValue="formData['base']"
                    @input="formData['base'] = $event.target.value.toUpperCase()" />
            </div>

            <div class="field-group w-1/2">
                <label for="quote" class="font-semibold">quote</label>
                <InputText id="quote" autocomplete="off" v-model="formData['quote']" :modelValue="formData['quote']"
                    @input="formData['quote'] = $event.target.value.toUpperCase()" />
            </div>
        </div>

        <div class="field-group">
            <label for="date" class="font-semibold">Date</label>
            <Calendar id="date" class="flex-grow" showSeconds showTime hourFormat="24" autocomplete="off"
                v-model="formData['date']" :modelValue="formData['date']" />
        </div>

        <div class="field-group">
            <label for="type" class="font-semibold">Type</label>
            <SelectButton v-model="formData['type']" :modelValue="formData['type']" :options="types"
                aria-labelledby="basic" />
        </div>

        <div class="field-group">
            <label for="price" class="font-semibold">Price</label>
            <InputNumber id="price" class="flex-grow" :modelValue="formData['price']" autocomplete="off"
                v-model="formData['price']" :min="0" :minFractionDigits="0" :maxFractionDigits="8" />
        </div>

        <div class="field-group">
            <label for="amount" class="font-semibold">Amount</label>
            <InputNumber id="amount" class="flex-grow" :modelValue="formData['amount']" autocomplete="off"
                v-model="formData['amount']" :min="0" :minFractionDigits="0" :maxFractionDigits="8" />
        </div>

        <div class="flex">
            <div class="field-group w-1/2">
                <label for="total" class="font-semibold">Total</label>
                <InputNumber id="total" class="flex-grow" :modelValue="formData['total']" autocomplete="off"
                    v-model="formData['total']" :min="0" :minFractionDigits="0" :maxFractionDigits="8" />
            </div>
        </div>

        <div class="field-group">
            <label for="totalUSDT" class="font-semibold">Total (USDT)</label>
            <InputNumber id="totalUSDT" class="flex-grow" :modelValue="formData['totalUSDT']" autocomplete="off"
                v-model="formData['totalUSDT']" :min="0" :minFractionDigits="0" :maxFractionDigits="8" />
        </div>

        <div class="field-group">
            <label for="fee" class="font-semibold w-24">Fee</label>
            <InputNumber id="fee" class="flex-grow" :modelValue="formData['fee']" autocomplete="off"
                v-model="formData['fee']" :min="0" :minFractionDigits="0" :maxFractionDigits="8" />
        </div>

        <div class="field-group">
            <label for="feecoin" class="font-semibold w-24">Feecoin</label>
            <InputText id="feecoin" class="flex-grow" autocomplete="off" v-model="formData['feecoin']"
                :modelValue="formData['feecoin']" @input="formData['feecoin'] = $event.target.value.toUpperCase()" />
        </div>

        <!-- Buttons -->
        <Button type="button" label="Save" :disabled="isSaveDisabled" @click="saveTrade"></Button>

    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { successSpin, errorSpin } from "@js/spinner.js";

const serverHost: string = import.meta.env.VITE_SERVER_HOST;
const types = ref<string[]>(['buy', 'sell']);
const platforms = ref<string[]>(['binance', 'gateio', 'htx', 'kucoin', 'okx']);

interface FormData {
    platform: string;
    base: string;
    quote: string;
    date: string;
    pair: string;
    type: string;
    price: number;
    amount: number;
    total: number;
    totalUSDT: number;
    fee: number;
    feecoin: string;
}

const formDataInitial: FormData = {
    platform: '',
    base: '',
    quote: 'USDT',
    date: '2024-03-28 21:44:58',
    pair: '',
    type: '',
    price: 0,
    amount: 0,
    total: 0,
    totalUSDT: 0,
    fee: 0,
    feecoin: ''
};

const formData = ref<FormData>({ ...formDataInitial });
const isSaveDisabled = ref<boolean>(true);

/**
 * @returns {void}
 */
const checkFormValidity = (): void => {
    const formDataValue = formData.value;
    formDataValue.pair = formDataValue.base + '/' + formDataValue.quote;

    const allFieldsFilled = Object.keys(formDataValue).every(key => {
        if (typeof formDataValue[key] === 'string' && !formDataValue[key].trim()) {
            return false;
        } else if (typeof formDataValue[key] === 'number' && formDataValue[key] <= 0) {
            return false;
        }
        return true;
    });

    isSaveDisabled.value = !allFieldsFilled;
}

/**
 * @param {string} dateString
 * @returns {boolean}
 */
const isValidDateFormat = (dateString: string): boolean => {
    const combinedRegex = /^(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z|^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})$/;
    return combinedRegex.test(dateString);
};

/**
 * @returns {void}
 */
const saveTrade = (): void => {
    const formDataValue = formData.value;
    formDataValue.base = formDataValue.base.toUpperCase();
    formDataValue.quote = formDataValue.quote.toUpperCase();

    if (!isSaveDisabled.value) {
        addTradesToDatabase(formDataValue);

        Object.keys(formDataInitial).forEach((key) => {
            formDataValue[key] = formDataInitial[key];
        });
    } else {
        console.error("All fields must be filled before saving.");
    }
}

/**
 * @param {FormData} formDataValue
 * @returns {Promise<void>}
 */
async function addTradesToDatabase(formDataValue: FormData): Promise<void> {
    try {
        const response = await fetch(`${serverHost}/trades/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trades_data: formDataValue,
            }),
        });

        const responseData = await response.json();
        if (response.ok) {
            successSpin('Save completed', 'Trades added successfully.' + responseData, true, true);
        } else {
            errorSpin('Error', responseData.error, false, true);
        }
    } catch (error) {
        errorSpin(
            "Error",
            "An error occurred while adding the trades: " + error,
            false,
            true
        );
    }
}

watch(formData, () => {
    checkFormValidity();
}, { deep: true });
</script>

<style scoped>
.dialog-custom {
    width: 25rem;
}

.field-group {
    margin-bottom: 16px;
}
</style>