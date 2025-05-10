// src/composables/usePagination.ts
import { ref, computed, watch } from 'vue'

export function usePagination<T>(items: () => T[], defaultItemsPerPage = 20) {
    const currentPage = ref(1)
    const itemsPerPage = ref(defaultItemsPerPage)

    const totalPages = computed(() => {
        const count = items().length
        return Math.ceil(count / itemsPerPage.value) || 1
    })

    watch(items, () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = 1
        }
    })

    const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        return items().slice(start, start + itemsPerPage.value)
    })

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++
    }

    return {
        currentPage,
        itemsPerPage,
        totalPages,
        paginatedItems,
        prevPage,
        nextPage
    }
}
