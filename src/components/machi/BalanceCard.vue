<!-- src/components/machi/BalanceCard.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Asset } from '../../types/responseData';

// Props pour récupérer les informations d'actifs
const props = defineProps<{
    assets: Asset[];
}>();

// State pour gérer l'expansion des détails
const expandedPlatforms = ref<string[]>([]);

// Fonction pour basculer l'expansion des détails d'une plateforme
const toggleDetails = (platform: string) => {
    if (expandedPlatforms.value.includes(platform)) {
        expandedPlatforms.value = expandedPlatforms.value.filter(p => p !== platform);
    } else {
        expandedPlatforms.value.push(platform);
    }
};

// Calcul du solde total
const totalBalance = computed(() => {
    return props.assets
        .filter(asset => !asset.tags.includes("stablecoin"))
        .reduce((total, asset) => total + asset.liveData.currentPossession, 0);
});

// Organisation des possessions par plateforme 
const possessionDetailsByPlatform = computed(() => {
    const platformDetails = props.assets.reduce((acc, asset) => {
        if (!acc[asset.platform]) {
            acc[asset.platform] = { totalPossession: 0, assets: [] };
        }
        acc[asset.platform].totalPossession += asset.liveData.currentPossession;
        acc[asset.platform].assets.push({
            name: asset.name,
            base: asset.base,
            currentPossession: asset.liveData.currentPossession,
        });
        return acc;
    }, {} as Record<string, { totalPossession: number; assets: { name: string; base: string; currentPossession: number }[] }>);

    return Object.entries(platformDetails)
        .sort((a, b) => b[1].totalPossession - a[1].totalPossession)
        .map(([platform, details]) => {
            details.assets.sort((a, b) => b.currentPossession - a.currentPossession);
            return { platform, ...details };
        });
});

</script>

<template>
    <div class="balance-card">
        <h3>Solde Total : {{ totalBalance }}</h3>

        <!-- Liste des plateformes avec détails des actifs -->
        <div v-for="details in possessionDetailsByPlatform" :key="details.platform" class="platform-section">
            <div class="platform-header" @click="toggleDetails(details.platform)">
                <strong>{{ details.platform }} : {{ details.totalPossession }}</strong>
            </div>
            <ul v-if="expandedPlatforms.includes(details.platform)">
                <li v-for="asset in details.assets" :key="asset.name">
                    {{ asset.name }} - {{ asset.base }} : {{ asset.currentPossession }}$
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.balance-card {
    border: 1px solid white;
    border-radius: 15px;
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    background-color: blue;
}

.platform-header {
    cursor: pointer;
    /* Pointeur sur le texte cliquable */
    background-color: yellowgreen;

    /* Couleur du texte pour l'en-tête de la plateforme */
}

.platform-header:hover {
    text-decoration: underline;
    /* Soulignement au survol */
}
</style>
