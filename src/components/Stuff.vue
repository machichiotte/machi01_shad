<!-- src/components/Stuff.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { fetchTradeBySymbol } from '../js/server/fetchFromServer'
const base = ref<string>(''); // Champ d'entrée pour `symbol`
const platform = ref<string>(''); // Champ d'entrée pour `platform`
const responseJson = ref<object | null>(null); // Stocke la réponse du serveur

const handleClick = async () => {
    responseJson.value = await fetchTradeBySymbol({
        base: base.value,
        platform: platform.value
    });

    console.log('responseJson', responseJson)
};

const copyToClipboard = () => {
    const jsonContent = JSON.stringify(responseJson.value, null, 2);
    navigator.clipboard.writeText(jsonContent).then(
        () => alert('Contenu copié dans le presse-papiers !'),
        (err) => console.error('Erreur lors de la copie :', err)
    );
};
</script>

<template>
    <div class="stuff-container">
        <div class="left-panel">
            <h3>Requêtes au serveur</h3>
            <!-- Exemple de première requête -->
            <div class="request-block">
                <div class="header-row">
                    <h4>Obtenir les trades</h4>
                    <button @click="handleClick">Envoyer la requête</button>
                </div>
                <div class="input-row">
                    <div class="field">
                        <label for="base">Base:</label>
                        <input id="base" v-model="base" type="text" placeholder="Entrez la base" />
                    </div>
                    <div class="field">
                        <label for="platform">Platform:</label>
                        <input id="platform" v-model="platform" type="text" placeholder="Entrez la plateforme" />
                    </div>
                </div>
            </div>

            <!-- Placeholders pour ajouter d'autres requêtes -->
            <!-- Ajoutez d'autres blocks de requête ici dans le futur -->
        </div>

        <div class="right-panel">
            <div class="header-row">
                <h4>Réponse du serveur</h4>
                <button v-if="responseJson" @click="copyToClipboard">Copier</button>
            </div>
            <div v-if="responseJson" class="response-block" contenteditable="true">
                <pre>{{ JSON.stringify(responseJson, null, 2) }}</pre>
            </div>
            <div v-else class="response-placeholder">
                Aucune réponse reçue pour l'instant.
            </div>
        </div>
    </div>
</template>

<style scoped>
.stuff-container {
    display: flex;
    gap: 2rem;
    padding: 1rem;
}

.left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.request-block {
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

/* Ligne pour le titre et le bouton */
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    margin-left: 3rem;
}

/* Disposition des inputs */
.input-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

/* Champ label + input */
.field {
    display: flex;
    flex-direction: column;
    flex: 1;
    /* Rend les champs flexibles pour partager l'espace */
    min-width: 150px;
    /* Largeur minimale pour les petits écrans */
}

.field label {
    margin-bottom: 0.5rem;
}

.field input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
}

/* Bouton */
button {
    background: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #0056b3;
}

/* Responsive Design */
@media (max-width: 600px) {
    .header-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-row button {
        margin-top: 1rem;
    }

    .input-row {
        flex-direction: column;
    }
}

/* Panneau droit */
.right-panel {
    flex: 2;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
}

/* Zone de réponse JSON */
.response-block {
    white-space: pre-wrap;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
    user-select: text;
    /* Facilite la sélection avec Ctrl+A */
}

/* Placeholder si pas de réponse */
.response-placeholder {
    color: #999;
    font-style: italic;
}
</style>
