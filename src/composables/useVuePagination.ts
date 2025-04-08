// src/composables/useVuePagination.ts
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { PageState } from 'primevue/paginator'; // Import PageState type

/**
 * Composable for managing pagination state.
 *
 * @param totalItems - A Ref or ComputedRef containing the total number of items to paginate.
 * @param initialRowsPerPage - Optional initial number of rows per page (defaults to 10).
 * @returns Pagination state and methods.
 */
export function usePagination(
    totalItems: Ref<number> | ComputedRef<number>,
    initialRowsPerPage: number = 10
) {
    const currentPage = ref(1);
    const rowsPerPage = ref(initialRowsPerPage);

    const firstRecordIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value);

    const onPageChange = (event: PageState) => {
        // PrimeVue's event.page is 0-indexed
        currentPage.value = event.page + 1;
        rowsPerPage.value = event.rows;
        window.scrollTo(0, 0); // Optional: Scroll to top on page change
    };

    const resetPagination = () => {
        currentPage.value = 1;
    }

    // Watch for changes in totalItems (e.g., due to filtering)
    // If the current page becomes invalid, reset to the first page.
    watch(totalItems, (newTotal) => {
        if (newTotal > 0 && firstRecordIndex.value >= newTotal) {
            resetPagination();
        }
        // Also reset if total becomes 0? Optional, depends on desired UX
        // if (newTotal === 0) {
        //   resetPagination();
        // }
    }, { immediate: false }); // Don't run immediately on init

    // Watch for changes in rowsPerPage to potentially reset page
    watch(rowsPerPage, () => {
        // If current page > last possible page with new rowsPerPage, reset
        const lastPage = Math.ceil(totalItems.value / rowsPerPage.value);
        if (currentPage.value > lastPage && lastPage > 0) {
            currentPage.value = lastPage; // Go to last valid page instead of page 1
        } else if (lastPage === 0) {
            resetPagination(); // Reset if no pages exist
        }
    });


    return {
        currentPage,
        rowsPerPage,
        firstRecordIndex,
        onPageChange,
        resetPagination
    };
}