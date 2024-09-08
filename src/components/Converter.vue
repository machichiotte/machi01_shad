<!-- src/components/Converter.vue -->
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
import { getConvertedCsv } from "../js/fetchFromServer.js";

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
        /**
         * @async
         * @returns {Promise<void>}
         */
        async uploadCsv() {
            this.uploadSuccess = null;
            this.jsonAvailable = false;
            this.downloadable = false;

            const fileInput = this.$refs.csvFileInput;
            const file = fileInput.files[0];

            if (file) {
                const formData = new FormData();
                formData.append("csvFile", file);
                try {
                    const response = await getConvertedCsv(formData);

                    this.jsonAvailable = true;
                    this.downloadable = true;
                    this.jsonData = response.data;

                    this.uploadSuccess = response.success;
                } catch (error) {
                    console.error("Erreur lors de l'envoi du fichier CSV", error);

                    this.uploadSuccess = false;
                    this.jsonAvailable = false; 
                    this.downloadable = false; 
                }
            } else {
                console.error("Aucun fichier sélectionné");

                this.uploadSuccess = false;
            }
        },

        /**
         * @returns {void}
         */
        downloadJson() {
            if (this.jsonData) {
                const jsonData = JSON.stringify(this.jsonData);
                const blob = new Blob([jsonData], { type: "application/json" });

                const url = URL.createObjectURL(blob);

                const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = "data.json";

                document.body.appendChild(downloadLink);

                downloadLink.click();

                document.body.removeChild(downloadLink);

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