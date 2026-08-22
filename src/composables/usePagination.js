import { computed, ref } from 'vue'

export function usePagination(items, itemsPerPage = 9) {
  const currentPage = ref(1)

  const totalPages = computed(() => {
    return Math.ceil(items.value.length / itemsPerPage)
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage

    const end = start + itemsPerPage

    return items.value.slice(start, end)
  })

  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1)
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total]
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
    }

    return [1, '...', current - 1, current, current + 1, '...', total]
  })

  function setPage(page) {
    currentPage.value = page
  }

  function resetPage() {
    currentPage.value = 1
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    visiblePages,
    setPage,
    resetPage,
  }
}
