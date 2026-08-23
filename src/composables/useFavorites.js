import { ref, watch } from 'vue'
import { useToast } from '@/composables/useToast'

const favoriteRecipes = ref(JSON.parse(localStorage.getItem('favoriteRecipes') || '[]'))

watch(
  favoriteRecipes,
  (newFavorites) => {
    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites))
  },
  { deep: true },
)

export function useFavorites() {
  const { showToast } = useToast()

  function isFavorite(id) {
    return favoriteRecipes.value.some((recipe) => recipe.idMeal === id)
  }

  function toggleFavorite(recipe) {
    if (isFavorite(recipe.idMeal)) {
      favoriteRecipes.value = favoriteRecipes.value.filter((item) => item.idMeal !== recipe.idMeal)

      showToast('Usunięto z ulubionych')

      return
    }

    favoriteRecipes.value.push({
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strMealThumb: recipe.strMealThumb,
      strCategory: recipe.strCategory,
      strArea: recipe.strArea,
    })

    showToast('Dodano do ulubionych')
  }

  function clearFavorites() {
    favoriteRecipes.value = []

    showToast('Usunięto wszystkie ulubione')
  }

  return {
    favoriteRecipes,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  }
}
