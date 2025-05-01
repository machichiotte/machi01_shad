<!-- src/components/rss/RssItemPanel.vue-->
<script setup lang="ts">
import type { PropType } from 'vue';
import type { RssItem } from '../../types/responseData'; // Adjust path if needed
import { formatDate } from '../../utils/formatter'; // Import utility
import FinancialAnalysisDisplay from './FinancialAnalysisDisplay.vue'; // Import child

// PrimeVue Components
import Panel from 'primevue/panel';
import Badge from 'primevue/badge';

// Props
defineProps({
    item: {
        type: Object as PropType<RssItem>,
        required: true
    }
});

</script>

<template>
    <Panel :toggleable="!!(item.summary || item.analysis)" collapsed class="rss-panel">
        <template #header>
            <div class="rss-panel-header-content">
                <div class="header-left-section">
                    <a :href="item.sourceFeed" target="_blank" rel="noopener noreferrer" @click.stop class="source-link"
                        v-tooltip.top="`Ouvrir le flux source : ${item.feedName || 'Source inconnue'}`">
                        <Badge :value="item.feedName || 'Inconnue'" severity="info" class="source-badge"></Badge>
                    </a>
                    <Badge v-if="item.category" :value="item.category" severity="contrast" class="category-badge"
                        v-tooltip.top="`Catégorie : ${item.category}`"></Badge>
                    <span class="analysis-date" v-tooltip.top="'Date d\'analyse'">
                        <i class="pi pi-calendar p-mr-1"></i>
                        {{ formatDate(item.processedAt) }}
                    </span>
                </div>
                <span class="item-title" v-tooltip.top="item.title">{{ item.title }}</span>
            </div>
        </template>

        <template #icons>
            <a :href="item.link" target="_blank" rel="noopener noreferrer" @click.stop
                class="p-panel-header-icon p-link p-mr-2 icon-link external-link-icon"
                v-tooltip.top="'Lire l\'article original'">
                <i class="pi pi-external-link"></i>
            </a>
        </template>

        <template #default>
            <div class="rss-item-content">
                <div v-if="item.summary">
                    <h4>Résumé</h4>
                    <p class="summary">{{ item.summary }}</p>
                </div>

                <h4 v-if="item.analysis">Analyse Financière</h4>
                <FinancialAnalysisDisplay v-if="item.analysis" :analysis="item.analysis" />
                <p v-else><i>Aucune analyse financière disponible.</i></p>


                <div class="rss-item-footer">
                    <small v-if="item.publicationDate">Publié le: {{ formatDate(item.publicationDate) }}</small>
                    <small v-if="item.fetchedAt">Récupéré le: {{ formatDate(item.fetchedAt) }}</small>
                </div>
            </div>
        </template>
    </Panel>
</template>

<style scoped>
/* Header specific styles */
.rss-panel-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
    overflow: hidden;
}

.header-left-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    min-width: 150px;
    gap: 0.3rem;
}

.source-link {
    text-decoration: none;
    display: inline-block;
    max-width: 100%;
}

.source-badge,
.category-badge {
    display: inline-block;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 4px;
}

.source-badge {
    background-color: var(--badge-primary-bg);
    color: var(--badge-primary-text);
}

.category-badge {
    background-color: var(--badge-secondary-bg);
    color: var(--badge-secondary-text);
}

.analysis-date {
    display: inline-flex;
    align-items: center;
    font-size: 0.8em;
    color: var(--neutral-color);
    white-space: nowrap;
}

.analysis-date i {
    font-size: 0.9em;
    margin-right: 4px;
}

.item-title {
    font-weight: 600;
    color: var(--primary-text);
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    min-width: 0;
    cursor: default;
    margin-left: 1rem;
}

/* Content specific styles */
.rss-item-content {
    padding: 1rem 1.5rem;
    background-color: var(--card-secondary-bg);
    color: var(--secondary-text);
}

.rss-item-content h4 {
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    color: var(--secondary-text);
    border-bottom: 1px solid var(--primary-border);
    padding-bottom: 0.3rem;
    font-weight: 600;
    font-size: 1.1em;
}

.rss-item-content h4:first-child {
    margin-top: 0;
}

.summary {
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.rss-item-footer {
    margin-top: 1.5rem;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--primary-border);
    font-size: 0.8em;
    color: var(--neutral-color);
}

.rss-item-footer small {
    display: block;
    line-height: 1.4;
    margin-bottom: 0.25rem;
}
</style>