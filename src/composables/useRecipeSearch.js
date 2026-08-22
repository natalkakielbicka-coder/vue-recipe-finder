import { ref } from 'vue'

export function useRecipeSearch() {
  const recipes = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const hasSearched = ref(false)

  async function fetchRecipes(url) {
    isLoading.value = true
    errorMessage.value = ''
    hasSearched.value = false

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Nie udało się pobrać przepisów.')
      }

      const data = await response.json()

      recipes.value = data.meals || []
    } catch (error) {
      errorMessage.value = error.message
      recipes.value = []
    } finally {
      isLoading.value = false
      hasSearched.value = true
    }
  }

  return {
    recipes,
    isLoading,
    errorMessage,
    hasSearched,
    fetchRecipes,
  }
}
