<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="Add New Trade" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="showDialog = true" />
        </template>
      </Toolbar>

      <!-- DataTable avec les données des trades -->
      <DataTable :value="rows" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable
        :filters="filters">
        <!-- En-tête des colonnes -->
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Find Assets</h4>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <!-- Colonnes -->
        <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header" sortable></Column>
      </DataTable>

      <!-- Dialogue pour ajouter un nouveau trade -->
      <Dialog v-model:visible="showDialog" modal header="Add trade" :style="{ width: '25rem' }">

        <!-- Platform -->
        <div class="flex">
          <Dropdown placeholder="Select a Platform" :options="platforms" id="platform" class="field-group"
            v-model="formData['platform']" @update:model-value="formData['platform'] = $event" />
        </div>

        <div class="flex">
          <div class="field-group w-1/2">
            <label for="altA" class="font-semibold">altA</label>
            <InputText id="altA" autocomplete="off" v-model="formData['altA']" :modelValue="formData['altA']"
              @input="formData['altA'] = $event.target.value" />
          </div>

          <div class="field-group w-1/2">
            <label for="altB" class="font-semibold">altB</label>
            <InputText id="altB" autocomplete="off" v-model="formData['altB']" :modelValue="formData['altB']"
              @input="formData['altB'] = $event.target.value" />
          </div>
        </div>

        <div class="field-group">
          <label for="date" class="font-semibold">Date</label>
          <InputText id="date" class="flex-grow" autocomplete="off" v-model="formData['date']"
            :modelValue="formData['date']" />
        </div>

        <div class="field-group">
          <label for="type" class="font-semibold">Type</label>
          <SelectButton v-model="formData['type']" :modelValue="formData['type']" :options="types"
            aria-labelledby="basic" />
        </div>

        <div class="field-group">
          <label for="price" class="font-semibold">Price</label>
          <InputNumber id="price" class="flex-grow" :modelValue="formData['price']" autocomplete="off"
            v-model="formData['price']" :min="0" />
        </div>

        <div class="field-group">
          <label for="amount" class="font-semibold">Amount</label>
          <InputNumber id="amount" class="flex-grow" :modelValue="formData['amount']" autocomplete="off"
            v-model="formData['amount']" />
        </div>

        <div class="flex">
          <div class="field-group w-1/2">
            <label for="total" class="font-semibold">Total</label>
            <InputNumber id="total" class="flex-grow" :modelValue="formData['total']" autocomplete="off"
              v-model="formData['total']" />
          </div>
        </div>

        <div class="field-group">
          <label for="totalUSDT" class="font-semibold">Total (USDT)</label>
          <InputNumber id="totalUSDT" class="flex-grow" :modelValue="formData['totalUSDT']" autocomplete="off"
            v-model="formData['totalUSDT']" />
        </div>

        <div class="field-group">
          <label for="fee" class="font-semibold w-24">Fee</label>
          <InputNumber id="fee" class="flex-grow" :modelValue="formData['fee']" autocomplete="off"
            v-model="formData['fee']" />
        </div>

        <div class="field-group">
          <label for="feecoin" class="font-semibold w-24">Feecoin</label>
          <InputText id="feecoin" class="flex-grow" autocomplete="off" v-model="formData['feecoin']"
            :modelValue="formData['feecoin']" />
        </div>

        <!-- Boutons -->
        <div class="flex justify-end gap-2 mt-5">
          <Button type="button" label="Cancel" severity="secondary" @click="handleDialogClose"></Button>
          <Button type="button" label="Save" :disabled="isSaveDisabled" @click="saveTrade"></Button>
        </div>
      </Dialog>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { tradesColumns } from '../js/columns.js'
import { getTrades } from '../js/getter.js'
import { FilterMatchMode } from 'primevue/api'

const items = ref([])
const itemsPerPage = 13
const cols = tradesColumns
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const types = ref(['buy', 'sell'])
const platforms = ref(['binance', 'gateio', 'htx', 'kucoin', 'okx'])

const rows = computed(() => {
  return items.value.map((item) => {
    return {
      altA: item['altA'],
      altB: item['altB'],
      date: item['date'],
      pair: item['pair'],
      type: item['type'],
      price: item['price'],
      amount: item['amount'],
      total: item['total'],
      totalUSDT: item['totalUSDT'],
      fee: item['fee'],
      feecoin: item['feecoin'],
      platform: item['platform']
    }
  })
})

// Définir les valeurs initiales de altA et altB
const altA = ref('')
const altB = ref('')

// Propriété calculée pour formater la paire altA/altB
const formattedPair = computed(() => {
  return `${altA.value} / ${altB.value}`
})

const computedUpperCase = computed(() => {
  return (value) => value.toUpperCase()
})

const getData = async () => {
  items.value = await getTrades()
}

onMounted(async () => {
  try {
    await getData()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
})

// État pour gérer l'ouverture et la fermeture du dialogue
const showDialog = ref(false)

// Méthode pour gérer la fermeture du dialogue
const handleDialogClose = () => {
  console.log('handleDialogClose')
  showDialog.value = false
}

// Méthode pour vérifier l'état de remplissage des champs du formulaire
const checkFormValidity = () => {
  const formDataValue = formData.value;

  const allFieldsFilled = Object.keys(formDataValue).every(key => {
    if (typeof formDataValue[key] === 'string' && !formDataValue[key].trim()) {
      return false; // Stop iterating if an empty string is found
    } else if (typeof formDataValue[key] === 'number' && formDataValue[key] <= 0) {
      return false; // Stop iterating if a number is non-positive
    }
    return true; // Continue iterating if the field is valid
  });

  // Mettre à jour l'état du bouton "Save"
  isSaveDisabled.value = !allFieldsFilled;
}

// Méthode pour sauvegarder le trade
const saveTrade = () => {
  const formDataValue = formData.value;

  if (!isSaveDisabled.value) {
    // Tous les champs sont remplis, vous pouvez maintenant procéder à l'enregistrement
    console.log(formDataValue);
    // Réinitialiser les champs du formulaire
    Object.keys(formDataInitial).forEach((key) => {
      formDataValue[key] = formDataInitial[key];
    });
  } else {
    // Afficher un message à l'utilisateur indiquant que tous les champs doivent être remplis
    console.error("Tous les champs doivent être remplis avant de sauvegarder.");
  }
}

const formDataInitial = {
  platform: 'dda',
  altA: 'a',
  altB: 'USDT',
  date: 'vv',
  pair: 'jjj',
  type: 'nd',
  price: 0,
  amount: 0,
  total: 0,
  totalUSDT: 0,
  fee: 0,
  feecoin: 'asdaasd'
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
.page {
  overflow-x: auto;
}

.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.field-group {
  margin-bottom: 16px;
}
</style>