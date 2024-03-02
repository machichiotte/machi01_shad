// src/components/TradeForm.vue

<template>
    <Dialog modal header="Add trade" :style="{ width: '25rem' }">
        <div class="flex">
            <Dropdown placeholder="Select a Platform" :options="platforms" id="platform" class="field-group"
                v-model="formData['platform']" @update:model-value="formData['platform'] = $event" />
        </div>

        <div class="flex">
            <div class="field-group w-1/2">
                <label for="altA" class="font-semibold">altA</label>
                <InputText id="altA" autocomplete="off" v-model="formData['altA']" :modelValue="formData['altA']"
                    @input="formData['altA'] = $event.target.value.toUpperCase()" />
            </div>

            <div class="field-group w-1/2">
                <label for="altB" class="font-semibold">altB</label>
                <InputText id="altB" autocomplete="off" v-model="formData['altB']" :modelValue="formData['altB']"
                    @input="formData['altB'] = $event.target.value.toUpperCase()" />
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
                v-model="formData['price']" :min="0"  :minFractionDigits="0" :maxFractionDigits="8" />
        </div>

        <div class="field-group">
            <label for="amount" class="font-semibold">Amount</label>
            <InputNumber id="amount" class="flex-grow" :modelValue="formData['amount']" autocomplete="off"
                v-model="formData['amount']"  :min="0" :minFractionDigits="0" :maxFractionDigits="8" />
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

        <!-- Boutons -->
        <Button type="button" label="Save" :disabled="isSaveDisabled" @click="saveTrade"></Button>

    </Dialog>
</template>
  
<script setup>
import { ref, watch } from 'vue';
import { successSpin, errorSpin } from "../js/spinner.js";

const serverHost = import.meta.env.VITE_SERVER_HOST;
const types = ref(['buy', 'sell'])
const platforms = ref(['binance', 'gateio', 'htx', 'kucoin', 'okx'])

// Méthode pour vérifier l'état de remplissage des champs du formulaire
const checkFormValidity = () => {
    const formDataValue = formData.value;
    formDataValue.pair = formDataValue.altA + '/' + formDataValue.altB;

    const allFieldsFilled = Object.keys(formDataValue).every(key => {
        if (typeof formDataValue[key] === 'string' && !formDataValue[key].trim()) {
            return false; // Stop iterating if an empty string is found
        } else if (typeof formDataValue[key] === 'number' && formDataValue[key] <= 0) {
            return false; // Stop iterating if a number is non-positive
        } /*else if (key === 'date') {
            // Vérifier le format de la date
            const date = formDataValue[key];
            if (!isValidDateFormat(date)) {
                return false; // Stop iterating if the date format is invalid
            }
        }*/
        return true; // Continue iterating if the field is valid
    });

    // Mettre à jour l'état du bouton "Save"
    isSaveDisabled.value = !allFieldsFilled;
}

// Méthode pour vérifier si le format de la date est valide
const isValidDateFormat = (dateString) => {
    // Combine patterns for both ISO 8601 and custom format:
    const combinedRegex = /^(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z|^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})$/;

    return combinedRegex.test(dateString);
};

// Méthode pour sauvegarder le trade
const saveTrade = () => {
    const formDataValue = formData.value;
    formDataValue.altA = formDataValue.altA.toUpperCase()
    formDataValue.altB = formDataValue.altB.toUpperCase()


    if (!isSaveDisabled.value) {
        addTradesToDatabase(formDataValue);

        // Réinitialiser les champs du formulaire
        Object.keys(formDataInitial).forEach((key) => {
            formDataValue[key] = formDataInitial[key];
        });
    } else {
        // Afficher un message à l'utilisateur indiquant que tous les champs doivent être remplis
        console.error("Tous les champs doivent être remplis avant de sauvegarder.");
    }
}

// Define methods
async function addTradesToDatabase(formDataValue) {
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

const formDataInitial = {
    platform: '',
    altA: '',
    altB: 'USDT',
    date: '2024-01-01 14:05:16',
    pair: '',
    type: '',
    price: 0,
    amount: 0,
    total: 0,
    totalUSDT: 0,
    fee: 0,
    feecoin: ''
}

// Copier les valeurs initiales de formDataInitial pour initialiser formData
const formData = ref({ ...formDataInitial })

// État pour gérer la disponibilité du bouton "Save"
const isSaveDisabled = ref(true);

// Appeler la méthode pour vérifier l'état de remplissage des champs chaque fois que les données du formulaire sont modifiées
watch(formData, () => {
    checkFormValidity();
}, { deep: true });
</script>

<style scoped>
.field-group {
    margin-bottom: 16px;
}
</style>