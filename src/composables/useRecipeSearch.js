import { ref } from 'vue'

export function useRecipeSearch() {
  const recipes = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const hasSearched = ref(false)

  async function fetchRecipes(url, markAsSearched = true) {
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
      hasSearched.value = markAsSearched
    }
  }

  async function fetchInitialRecipes() {
    await fetchRecipes('https://www.themealdb.com/api/json/v1/1/search.php?f=c', false)
  }

  async function fetchCategoryRecipes(category) {
    isLoading.value = true
    errorMessage.value = ''
    hasSearched.value = false

    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
      )

      if (!response.ok) {
        throw new Error('Nie udało się pobrać kategorii.')
      }

      const data = await response.json()

      recipes.value = (data.meals || []).map((recipe) => ({
        ...recipe,
        strCategory: category,
      }))
    } catch (error) {
      errorMessage.value = error.message
      recipes.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    recipes,
    isLoading,
    errorMessage,
    hasSearched,
    fetchRecipes,
    fetchInitialRecipes,
    fetchCategoryRecipes,
  }
}
