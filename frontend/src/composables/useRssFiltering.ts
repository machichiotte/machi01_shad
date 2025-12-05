// src/composables/useRssFiltering.ts
import { computed, type Ref, type ComputedRef } from 'vue';
import type { RssItem } from '../types/responseData'; // Adjust path if needed
import type { FilterState } from '../components/rss/RssFilters.vue'; // Adjust path if needed

/**
 * Composable for filtering RSS items based on various criteria.
 *
 * @param allItems - A Ref or ComputedRef containing the array of all RssItem objects.
 * @param filters - A Ref containing the current FilterState object.
 * @returns A ComputedRef containing the filtered array of RssItem objects.
 */
export function useRssFiltering(
    allItems: Ref<RssItem[]> | ComputedRef<RssItem[]>,
    filters: Ref<FilterState>
) {
    const filteredRssItems = computed(() => {
        let items = [...allItems.value]; // Create a shallow copy to avoid modifying the original

        const {
            searchQuery,
            selectedSources,
            selectedCategories,
            contentFilterState,
            selectedDateRange
        } = filters.value; // Destructure current filters

        // --- Date Filter ---
        if (selectedDateRange !== 'all') {
            const now = Date.now(); // Use Date.now() for efficiency
            let cutoffTimestamp = 0;
            const oneHour = 60 * 60 * 1000;
            const oneDay = 24 * oneHour;
            const oneWeek = 7 * oneDay;
            const oneMonth = 30 * oneDay; // Approximation
            const oneYear = 365 * oneDay; // Approximation

            switch (selectedDateRange) {
                case 'hour': cutoffTimestamp = now - oneHour; break;
                case 'day': cutoffTimestamp = now - oneDay; break;
                case 'week': cutoffTimestamp = now - oneWeek; break;
                case 'month': cutoffTimestamp = now - oneMonth; break;
                case 'year': cutoffTimestamp = now - oneYear; break;
            }

            items = items.filter(item => {
                if (!item.processedAt) return false;
                try {
                    const itemTime = new Date(item.processedAt).getTime();
                    return !isNaN(itemTime) && itemTime >= cutoffTimestamp;
                } catch (e) { return false; } // Ignore items with invalid dates
            });
        }

        // --- Source Filter ---
        if (selectedSources.length > 0) {
            items = items.filter(item => item.feedName && selectedSources.includes(item.feedName));
        }

        // --- Category Filter ---
        if (selectedCategories.length > 0) {
            items = items.filter(item => item.category && selectedCategories.includes(item.category));
        }

        // --- Content Presence Filter ---
        if (contentFilterState === 'withContent') {
            items = items.filter(item => !!(item.summary && item.analysis));
        } else if (contentFilterState === 'noContent') {
            items = items.filter(item => !(item.summary && item.analysis));
        }

        // --- Search Query Filter ---
        const query = searchQuery.trim().toLowerCase(); // Use trimmed, lowercased query
        if (query) {
            items = items.filter(item => {
                const titleMatch = item.title?.toLowerCase().includes(query);
                const summaryMatch = item.summary?.toLowerCase().includes(query);
                const analysisMatch = item.analysis && (
                    item.analysis.relevanceReason?.toLowerCase().includes(query) ||
                    item.analysis.sentimentReason?.toLowerCase().includes(query) ||
                    item.analysis.potentialImpact?.toLowerCase().includes(query) ||
                    item.analysis.mentionedAssets?.some(a => a.toLowerCase().includes(query)) ||
                    item.analysis.financialThemes?.some(t => t.toLowerCase().includes(query))
                );
                return titleMatch || summaryMatch || analysisMatch;
            });
        }

        return items;
    });

    return {
        filteredRssItems
    };
}