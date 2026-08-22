import { ref } from 'vue'

export function useNameSuggestions(searchQuery, searchMode) {
  const nameSuggestions = ref([])

  let nameSuggestionsTimeout = null

  async function fetchNameSuggestions() {
    const query = searchQuery.value.trim()

    if (searchMode.value !== 'name' || query.length < 2) {
      nameSuggestions.value = []
      return
    }

    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
      )

      if (!response.ok) {
        throw new Error('Nie udało się pobrać podpowiedzi.')
      }

      const data = await response.json()

      nameSuggestions.value = (data.meals || []).slice(0, 6)
    } catch (error) {
      console.error(error)
      nameSuggestions.value = []
    }
  }

  function scheduleNameSuggestions() {
    clearTimeout(nameSuggestionsTimeout)

    if (searchQuery.value.trim().length < 2) {
      nameSuggestions.value = []
      return
    }

    nameSuggestionsTimeout = setTimeout(() => {
      fetchNameSuggestions()
    }, 300)
  }

  function clearNameSuggestions() {
    clearTimeout(nameSuggestionsTimeout)
    nameSuggestions.value = []
  }

  return {
    nameSuggestions,
    scheduleNameSuggestions,
    clearNameSuggestions,
  }
}
