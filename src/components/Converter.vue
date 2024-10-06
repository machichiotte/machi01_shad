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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getConvertedCsv } from "../js/fetchFromServer.ts";

const csvFileInput = ref(null);
const jsonAvailable = ref(false);
const downloadable = ref(false);
const jsonData = ref(null);
const uploadSuccess = ref(null);

onMounted(() => {
    csvFileInput.value = ref(null);
    jsonAvailable.value = false;
    downloadable.value = false;
    jsonData.value = null;
    uploadSuccess.value = null;
});

const uploadCsv = async () => {
    uploadSuccess.value = null;
    jsonAvailable.value = false;
    downloadable.value = false;

    const file = csvFileInput.value.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("csvFile", file);
        try {
            const response = await getConvertedCsv(formData);

            jsonAvailable.value = true;
            downloadable.value = true;
            jsonData.value = response.data;

            uploadSuccess.value = response.success;
        } catch (error) {
            console.error("Error while sending CSV file", error);

            uploadSuccess.value = false;
            jsonAvailable.value = false;
            downloadable.value = false;
        }
    } else {
        console.error("No file selected");

        uploadSuccess.value = false;
    }
};

const downloadJson = () => {
    if (jsonData.value) {
        const jsonDataString = JSON.stringify(jsonData.value);
        const blob = new Blob([jsonDataString], { type: "application/json" });

        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "data.json";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
    }
};
</script>

<style scoped>
.page {
    overflow-x: auto;
}
</style>