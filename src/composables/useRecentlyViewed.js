import { ref, watch } from 'vue'
import { useToast } from '@/composables/useToast'

const recentlyViewedRecipes = ref(JSON.parse(localStorage.getItem('recentlyViewedRecipes') || '[]'))

watch(
  recentlyViewedRecipes,
  (recipes) => {
    localStorage.setItem('recentlyViewedRecipes', JSON.stringify(recipes))
  },
  { deep: true },
)

export function useRecentlyViewed() {
  const { showToast } = useToast()

  function addRecentlyViewed(recipe) {
    if (!recipe) {
      return
    }

    recentlyViewedRecipes.value = recentlyViewedRecipes.value.filter(
      (item) => item.idMeal !== recipe.idMeal,
    )

    recentlyViewedRecipes.value.unshift({
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strMealThumb: recipe.strMealThumb,
      strCategory: recipe.strCategory,
      strArea: recipe.strArea,
    })

    recentlyViewedRecipes.value = recentlyViewedRecipes.value.slice(0, 6)
  }

  function clearRecentlyViewed() {
    recentlyViewedRecipes.value = []

    showToast('Wyczyszczono ostatnio oglądane')
  }

  return {
    recentlyViewedRecipes,
    addRecentlyViewed,
    clearRecentlyViewed,
  }
}
