<template>
    <div class="page">
        <h1>CONVERTER</h1>

        <form @submit.prevent="uploadCsv">
            <input type="file" ref="csvFileInput" accept=".csv" />
            <button type="submit">Envoyer le fichier CSV</button>
        </form>

        <!-- Bouton pour télécharger le fichier JSON -->
        <button v-if="downloadable" @click="downloadJson" :disabled="!jsonAvailable">
            Télécharger le fichier JSON
        </button>
    </div>
</template>
  
<script>
import { getConvertedCsv } from "../js/getter.js";

export default {
    name: "ConverterPage",
    data() {
        return {
            jsonAvailable: false,
            downloadable: false,
            jsonData: null,
            uploadSuccess: null,
        };
    },
    methods: {
        async uploadCsv() {
            // Réinitialiser le statut de l'upload et les indicateurs de téléchargement
            this.uploadSuccess = null;
            this.jsonAvailable = false;
            this.downloadable = false;

            const fileInput = this.$refs.csvFileInput;
            const file = fileInput.files[0];

            console.log('fileee', file);
            if (file) {
                const formData = new FormData();
                formData.append("csvFile", file);
                try {
                    const response = await getConvertedCsv(formData);

                    // Mettre à jour les données pour activer le bouton de téléchargement
                    this.jsonAvailable = true;
                    this.downloadable = true;
                    this.jsonData = response.data;

                    // Mettre à jour le statut de l'upload
                    this.uploadSuccess = response.success;
                } catch (error) {
                    console.error("Erreur lors de l'envoi du fichier CSV", error);

                    // Mettre à jour le statut de l'upload en cas d'échec
                    this.uploadSuccess = false;
                    this.jsonAvailable = false; 
                    this.downloadable = false; 
                }
            } else {
                console.error("Aucun fichier sélectionné");

                // Mettre à jour le statut de l'upload en cas d'échec
                this.uploadSuccess = false;
            }
        },

        downloadJson() {
            // Vérifier que les données JSON sont disponibles
            if (this.jsonData) {
                // Créer un fichier JSON
                const jsonData = JSON.stringify(this.jsonData);
                const blob = new Blob([jsonData], { type: "application/json" });

                // Créer une URL objet pour le blob
                const url = URL.createObjectURL(blob);

                // Créer un lien <a> pour déclencher le téléchargement
                const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = "data.json";

                // Ajouter le lien au document
                document.body.appendChild(downloadLink);

                // Cliquer sur le lien pour déclencher le téléchargement
                downloadLink.click();

                // Retirer le lien du document
                document.body.removeChild(downloadLink);

                // Révoquer l'URL objet pour libérer les ressources
                URL.revokeObjectURL(url);
            }
        },
    },
};
</script>
  
<style scoped>
.page {
    overflow-x: auto;
}
</style>
  