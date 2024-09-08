<!-- src/components/Converter.vue -->
<template>
    <div class="page">
        <h1>CONVERTER</h1>

        <form @submit.prevent="uploadCsv">
            <input type="file" ref="csvFileInput" accept=".csv" />
            <button type="submit">Upload CSV file</button>
        </form>

        <!-- Button to download JSON file -->
        <button v-if="downloadable" @click="downloadJson" :disabled="!jsonAvailable">
            Download JSON file
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
                    console.error("Error while sending CSV file", error);

                    this.uploadSuccess = false;
                    this.jsonAvailable = false; 
                    this.downloadable = false; 
                }
            } else {
                console.error("No file selected");

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