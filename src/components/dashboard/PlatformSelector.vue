<!-- src/components/dashboard/PlatformSelector.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SelectButton from 'primevue/selectbutton'; // Importez SelectButton

// Définition des types pour les options de plateforme (inchangé)
interface PlatformOption {
  id: string;
  name: string;
}

// Définition des props avec types (inchangé)
const props = defineProps<{
  initialSelectedPlatforms: string[];
}>();

// Emit pour la mise à jour (inchangé, v-model sur SelectButton s'en chargera)
const emit = defineEmits<{
  (e: 'update:selectedPlatforms', selectedPlatforms: string[]): void;
}>();

// Options de plateforme (inchangé)
const platformOptions = computed<PlatformOption[]>(() => [
  { id: 'binance', name: 'Binance' },
  { id: 'kucoin', name: 'KuCoin' },
  { id: 'htx', name: 'HTX' },
  { id: 'okx', name: 'OKX' },
  { id: 'gateio', name: 'Gate.io' }
]);

const selectedPlatforms = ref<string[]>([...props.initialSelectedPlatforms]);

watch(
  () => props.initialSelectedPlatforms,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(selectedPlatforms.value)) {
      selectedPlatforms.value = [...newVal];
    }
  },
  { deep: true } 
);
watch(selectedPlatforms, (newSelection) => {
    emit('update:selectedPlatforms', newSelection);
});

</script>

<template>
  <div class="platform-selector">
    <SelectButton
      v-model="selectedPlatforms"
      :options="platformOptions"
      optionLabel="name"  
      optionValue="id"    
      multiple            
      aria-labelledby="multiple-platforms" 
    />
    </div>
</template>

<style scoped>
.platform-selector {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>