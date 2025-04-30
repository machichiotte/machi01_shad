<!-- src/components/rss/FinancialAnalysisDisplay -->
<script setup lang="ts">
import { computed } from 'vue';
import type { FinancialAnalysis } from '../../types/responseData';
import Tag from 'primevue/tag'; // Import Tag component

interface Props {
    analysis: FinancialAnalysis | null | undefined;
}
const props = defineProps<Props>();

const getSentimentSeverity = computed(() => {
    switch (props.analysis?.financialSentiment) {
        case 'Positive': return 'success';
        case 'Negative': return 'danger';
        case 'Neutral': return 'info';
        case 'Mixed': return 'warning';
        default: return undefined; // Use PrimeVue's default or no severity
    }
});

const getRelevanceSeverity = computed(() => {
    switch (props.analysis?.isRelevant) {
        case 'Yes': return 'success';
        case 'No': return 'danger';
        case 'Partial': return 'warning';
        default: return undefined; // Use PrimeVue's default or no severity
    }
});

</script>

<template>
    <div v-if="analysis" class="financial-analysis-details">

        <div class="analysis-field relevance-field">
            <strong>Pertinence:</strong>
            <Tag v-if="analysis.isRelevant"
                :value="analysis.isRelevant === 'Yes' ? 'Oui' : analysis.isRelevant === 'No' ? 'Non' : 'Partielle'"
                :severity="getRelevanceSeverity" class="p-ml-2">
            </Tag>
            <span v-else class="p-ml-2 text-muted">Non spécifiée</span>
            <p v-if="analysis.relevanceReason" class="reason-text">{{ analysis.relevanceReason }}</p>
        </div>

        <div v-if="analysis.isRelevant !== 'No'" class="analysis-content">
            <div v-if="analysis.financialSentiment" class="analysis-field sentiment-field">
                <strong>Sentiment Financier:</strong>
                <Tag :value="analysis.financialSentiment" :severity="getSentimentSeverity" class="p-ml-2"></Tag>
                <p v-if="analysis.sentimentReason" class="reason-text">{{ analysis.sentimentReason }}</p>
            </div>
            <div v-else class="analysis-field sentiment-field">
                <strong>Sentiment Financier:</strong>
                <span class="p-ml-2 text-muted">Non spécifié</span>
            </div>


            <div class="analysis-field">
                <strong>Actifs Mentionnés:</strong>
                <div v-if="analysis.mentionedAssets && analysis.mentionedAssets.length > 0" class="tag-list">
                    <Tag v-for="asset in analysis.mentionedAssets" :key="asset" :value="asset" severity="contrast"
                        class="p-mr-1 p-mb-1"></Tag>
                </div>
                <span v-else class="p-ml-2 text-muted">Aucun</span>
            </div>

            <div class="analysis-field">
                <strong>Thèmes Financiers:</strong>
                <div v-if="analysis.financialThemes && analysis.financialThemes.length > 0" class="tag-list">
                    <Tag v-for="theme in analysis.financialThemes" :key="theme" :value="theme" severity="info"
                        class="p-mr-1 p-mb-1"></Tag>
                </div>
                <span v-else class="p-ml-2 text-muted">Aucun</span>
            </div>

            <div v-if="analysis.potentialImpact" class="analysis-field">
                <strong>Impact Potentiel:</strong>
                <p class="impact-text">{{ analysis.potentialImpact }}</p>
            </div>

            <div v-if="analysis.actionableInfo" class="analysis-field">
                <strong>Information Actionnable:</strong>
                <p class="actionable-text">{{ analysis.actionableInfo }}</p>
            </div>
        </div>

        <p v-else-if="analysis.isRelevant === 'No' && !analysis.relevanceReason">
            L'article a été jugé non pertinent pour l'analyse financière.
        </p>

    </div>
    <p v-else class="text-muted">Aucune analyse financière disponible pour cet élément.</p>
</template>

<style scoped>
.financial-analysis-details {
    font-size: 0.95em;
    line-height: 1.6;
}

.analysis-field {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #4a4a4a;
    /* Slightly lighter border */
}

.analysis-field:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.analysis-field strong {
    color: #b0c4de;
    /* Light Steel Blue */
    margin-right: 0.5rem;
    display: block;
    margin-bottom: 0.3rem;
}

.reason-text,
.impact-text,
.actionable-text {
    margin-top: 0.4rem;
    margin-left: 0.2rem;
    font-style: italic;
    color: #bdbdbd;
    /* Lighter gray */
    white-space: pre-wrap;
    /* Keep formatting */
    word-wrap: break-word;
}

.text-muted {
    color: #999;
    font-style: italic;
}

.tag-list {
    margin-top: 0.4rem;
}

.analysis-content {
    padding-left: 0.5rem;
    /* Indent analysis details slightly if relevant */
    margin-top: 1rem;
}

/* Adjust Tag margin if needed */
:deep(.p-tag) {
    vertical-align: middle;
}

:deep(.p-tag.p-tag-contrast) {
    background-color: #555;
    color: #eee;
}
</style>