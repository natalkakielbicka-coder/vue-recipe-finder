import { ref } from 'vue'

export function useRecipeCategories() {
  const categoriesList = ref([])

  async function fetchCategories() {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php')

      if (!response.ok) {
        throw new Error('Nie udało się pobrać kategorii.')
      }

      const data = await response.json()

      categoriesList.value = data.categories || []
    } catch (error) {
      console.error(error)
    }
  }

  return {
    categoriesList,
    fetchCategories,
  }
}
