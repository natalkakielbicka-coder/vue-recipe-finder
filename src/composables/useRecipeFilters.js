import { computed, ref } from 'vue'

export function useRecipeFilters(recipes) {
  const selectedCategory = ref('')
  const selectedArea = ref('')

  const categories = computed(() => {
    return [...new Set(recipes.value.map((recipe) => recipe.strCategory).filter(Boolean))].sort()
  })

  const areas = computed(() => {
    return [...new Set(recipes.value.map((recipe) => recipe.strArea).filter(Boolean))].sort()
  })

  const filteredRecipes = computed(() => {
    return recipes.value.filter((recipe) => {
      const matchesCategory =
        !selectedCategory.value || recipe.strCategory === selectedCategory.value

      const matchesArea = !selectedArea.value || recipe.strArea === selectedArea.value

      return matchesCategory && matchesArea
    })
  })

  function resetFilters() {
    selectedCategory.value = ''
    selectedArea.value = ''
  }

  return {
    selectedCategory,
    selectedArea,
    categories,
    areas,
    filteredRecipes,
    resetFilters,
  }
}
