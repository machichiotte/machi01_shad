// src/utils/filter.ts
export function applyGlobalFilter<T extends Record<string, unknown>>(
    items: T[],
    filterText: string
): T[] {
    if (!filterText.trim()) return items
    const lowerFilter = filterText.toLowerCase()
    return items.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(lowerFilter)
        )
    )
}
