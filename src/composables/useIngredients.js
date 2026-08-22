import { computed, ref } from 'vue'

export function useIngredients(searchQuery, searchMode) {
  const ingredientsList = ref([])

  async function fetchIngredients() {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list')

      if (!response.ok) {
        throw new Error('Nie udało się pobrać składników.')
      }

      const data = await response.json()

      ingredientsList.value = data.meals || []
    } catch (error) {
      console.error(error)
    }
  }

  const ingredientSuggestions = computed(() => {
    if (searchMode.value !== 'ingredient' || searchQuery.value.trim().length < 2) {
      return []
    }

    const query = searchQuery.value.trim().toLowerCase()

    return ingredientsList.value
      .filter((item) => item.strIngredient.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.strIngredient.toLowerCase().startsWith(query)

        const bStarts = b.strIngredient.toLowerCase().startsWith(query)

        return Number(bStarts) - Number(aStarts)
      })
      .slice(0, 6)
  })

  function matchIngredient(query) {
    const normalizedQuery = query.toLowerCase()

    const exactMatch = ingredientsList.value.find(
      (item) => item.strIngredient.toLowerCase() === normalizedQuery,
    )

    const startsWithMatches = ingredientsList.value
      .filter((item) => item.strIngredient.toLowerCase().startsWith(normalizedQuery))
      .sort((a, b) => a.strIngredient.length - b.strIngredient.length)

    const includesMatches = ingredientsList.value
      .filter((item) => item.strIngredient.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.strIngredient.length - b.strIngredient.length)

    return exactMatch || startsWithMatches[0] || includesMatches[0] || null
  }

  return {
    ingredientsList,
    ingredientSuggestions,
    fetchIngredients,
    matchIngredient,
  }
}
