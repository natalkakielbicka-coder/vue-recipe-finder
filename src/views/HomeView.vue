<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'
import CategoryBrowser from '@/components/CategoryBrowser.vue'
import RecipeFilters from '@/components/RecipeFilters.vue'
import RecipePagination from '@/components/RecipePagination.vue'
import RecipeSearch from '@/components/RecipeSearch.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import { useRecipeCategories } from '@/composables/useRecipeCategories'

const route = useRoute()
const router = useRouter()
const { categoriesList, fetchCategories } = useRecipeCategories()

const searchQuery = ref('')
const searchMode = ref('name')
const recipes = ref([])
const isLoading = ref(false)
const isRandomLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

const currentPage = ref(1)
const recipesPerPage = 9
const recipesSection = ref(null)

const selectedCategory = ref('')
const selectedArea = ref('')

const browseCategory = ref('')
const ingredientsList = ref([])
const showIngredientSuggestions = ref(false)
const activeSuggestionIndex = ref(-1)
const nameSuggestions = ref([])
let nameSuggestionsTimeout = null

async function searchRecipes(resetPage = true) {
  if (!searchQuery.value.trim()) {
    recipes.value = []
    errorMessage.value = ''
    hasSearched.value = false
    browseCategory.value = ''

    router.replace({
      query: {},
    })

    return
  }

  const query = searchQuery.value.trim()

  searchQuery.value = query
  browseCategory.value = ''

  router.replace({
    query: {
      q: query,
      mode: searchMode.value === 'ingredient' ? 'ingredient' : undefined,
      category: resetPage ? undefined : route.query.category,
      area: resetPage ? undefined : route.query.area,
      paged: resetPage ? undefined : route.query.paged,
    },
  })

  isLoading.value = true
  errorMessage.value = ''
  hasSearched.value = false

  try {
    let ingredientQuery = query

    if (searchMode.value === 'ingredient') {
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

      const matchedIngredient = exactMatch || startsWithMatches[0] || includesMatches[0]

      if (matchedIngredient) {
        ingredientQuery = matchedIngredient.strIngredient
      }
    }

    const url =
      searchMode.value === 'ingredient'
        ? `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredientQuery)}`
        : `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Nie udało się pobrać przepisów.')
    }

    const data = await response.json()

    recipes.value = data.meals || []
    if (resetPage) {
      currentPage.value = 1
      selectedCategory.value = ''
      selectedArea.value = ''
    }
  } catch (error) {
    errorMessage.value = error.message
    recipes.value = []
  } finally {
    isLoading.value = false
    hasSearched.value = true
  }
}

async function fetchInitialRecipes() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?f=c')

    if (!response.ok) {
      throw new Error('Nie udało się pobrać przepisów.')
    }

    const data = await response.json()

    recipes.value = data.meals || []
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchIngredients()

  const query = route.query.q
  const page = Number(route.query.paged) || 1
  const category = route.query.category
  const area = route.query.area
  const mode = route.query.mode
  const browse = route.query.browse

  if (typeof query === 'string' && query.trim()) {
    searchQuery.value = query

    searchMode.value = mode === 'ingredient' ? 'ingredient' : 'name'

    await searchRecipes(false)

    if (typeof category === 'string') {
      selectedCategory.value = category
    }

    if (typeof area === 'string') {
      selectedArea.value = area
    }

    if (page <= totalPages.value) {
      currentPage.value = page
    }

    return
  }

  if (typeof browse === 'string' && browse.trim()) {
    await fetchRecipesByCategory(browse)
    return
  }

  await fetchInitialRecipes()
})

const totalPages = computed(() => {
  return Math.ceil(filteredRecipes.value.length / recipesPerPage)
})

const paginatedRecipes = computed(() => {
  const start = (currentPage.value - 1) * recipesPerPage
  const end = start + recipesPerPage

  return filteredRecipes.value.slice(start, end)
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

function changePage(page) {
  currentPage.value = page

  router.push({
    query: {
      ...route.query,
      paged: page > 1 ? page : undefined,
    },
  })

  recipesSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const categories = computed(() => {
  return [...new Set(recipes.value.map((recipe) => recipe.strCategory).filter(Boolean))].sort()
})

const areas = computed(() => {
  return [...new Set(recipes.value.map((recipe) => recipe.strArea).filter(Boolean))].sort()
})

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesCategory = !selectedCategory.value || recipe.strCategory === selectedCategory.value

    const matchesArea = !selectedArea.value || recipe.strArea === selectedArea.value

    return matchesCategory && matchesArea
  })
})

function updateFilters() {
  currentPage.value = 1

  router.replace({
    query: {
      ...route.query,
      mode: searchMode.value === 'ingredient' ? 'ingredient' : undefined,
      category: selectedCategory.value || undefined,
      area: selectedArea.value || undefined,
      paged: undefined,
    },
  })
}

async function resetSearch() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedArea.value = ''
  currentPage.value = 1
  hasSearched.value = false
  errorMessage.value = ''
  browseCategory.value = ''

  router.replace({
    query: {},
  })

  await fetchInitialRecipes()
}

async function fetchRecipesByCategory(category) {
  if (browseCategory.value === category) {
    await resetSearch()
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  hasSearched.value = false
  browseCategory.value = category
  currentPage.value = 1
  selectedCategory.value = ''
  selectedArea.value = ''
  searchQuery.value = ''

  router.replace({
    query: {
      browse: category,
    },
  })

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
    )

    if (!response.ok) {
      throw new Error('Nie udało się pobrać kategorii.')
    }

    const data = await response.json()

    recipes.value = (data.meals || []).map((recipe) => {
      return {
        ...recipe,
        strCategory: category,
      }
    })
  } catch (error) {
    errorMessage.value = error.message
    recipes.value = []
  } finally {
    isLoading.value = false
  }
}

async function openRandomRecipe() {
  isRandomLoading.value = true

  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')

    if (!response.ok) {
      throw new Error('Nie udało się wylosować przepisu.')
    }

    const data = await response.json()
    const randomRecipe = data.meals?.[0]

    if (!randomRecipe) {
      return
    }

    router.push({
      name: 'recipe',
      params: {
        id: randomRecipe.idMeal,
      },
    })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isRandomLoading.value = false
  }
}

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

function handleSuggestionKeydown(event) {
  const suggestions = currentSuggestions.value

  const suggestionsAreVisible =
    searchMode.value === 'ingredient'
      ? showIngredientSuggestions.value
      : nameSuggestions.value.length > 0

  if (!suggestionsAreVisible || !suggestions.length) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    activeSuggestionIndex.value =
      activeSuggestionIndex.value < suggestions.length - 1 ? activeSuggestionIndex.value + 1 : 0
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    activeSuggestionIndex.value =
      activeSuggestionIndex.value > 0 ? activeSuggestionIndex.value - 1 : suggestions.length - 1
  }

  if (event.key === 'Enter' && activeSuggestionIndex.value >= 0) {
    event.preventDefault()

    const suggestion = suggestions[activeSuggestionIndex.value]

    selectSuggestion(suggestion.label)
  }

  if (event.key === 'Escape') {
    showIngredientSuggestions.value = false
    nameSuggestions.value = []
    activeSuggestionIndex.value = -1
  }
}

function handleSearchInput() {
  activeSuggestionIndex.value = -1

  clearTimeout(nameSuggestionsTimeout)

  if (searchMode.value === 'ingredient') {
    showIngredientSuggestions.value = true
    nameSuggestions.value = []
    return
  }

  showIngredientSuggestions.value = false

  if (searchQuery.value.trim().length < 2) {
    nameSuggestions.value = []
    return
  }

  nameSuggestionsTimeout = setTimeout(() => {
    fetchNameSuggestions()
  }, 300)
}

function closeSuggestions() {
  setTimeout(() => {
    showIngredientSuggestions.value = false
    nameSuggestions.value = []
    activeSuggestionIndex.value = -1
  }, 100)
}

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

const currentSuggestions = computed(() => {
  if (searchMode.value === 'ingredient') {
    return ingredientSuggestions.value.map((ingredient) => ({
      id: ingredient.idIngredient,
      label: ingredient.strIngredient,
    }))
  }

  return nameSuggestions.value.map((recipe) => ({
    id: recipe.idMeal,
    label: recipe.strMeal,
  }))
})

async function selectSuggestion(value) {
  searchQuery.value = value

  showIngredientSuggestions.value = false
  nameSuggestions.value = []
  activeSuggestionIndex.value = -1

  await searchRecipes()
}

function handleSearchModeChange() {
  showIngredientSuggestions.value = false
  nameSuggestions.value = []
  activeSuggestionIndex.value = -1

  clearTimeout(nameSuggestionsTimeout)
}

const showSearchSuggestions = computed(() => {
  if (searchMode.value === 'ingredient') {
    return showIngredientSuggestions.value
  }

  return nameSuggestions.value.length > 0
})
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <CategoryBrowser
      :categories="categoriesList"
      :active-category="browseCategory"
      @select="fetchRecipesByCategory"
    />

    <RecipeSearch
      v-model:search-query="searchQuery"
      v-model:search-mode="searchMode"
      :is-loading="isLoading"
      :show-clear="hasSearched || browseCategory"
      :suggestions="currentSuggestions"
      :show-suggestions="showSearchSuggestions"
      :active-suggestion-index="activeSuggestionIndex"
      @submit="searchRecipes"
      @reset="resetSearch"
      @input="handleSearchInput"
      @keydown="handleSuggestionKeydown"
      @blur="closeSuggestions"
      @mode-change="handleSearchModeChange"
      @select-suggestion="selectSuggestion"
    />

    <button
      type="button"
      class="random-recipe"
      :disabled="isRandomLoading"
      @click="openRandomRecipe"
    >
      {{ isRandomLoading ? 'Losuję...' : '🎲 Losowy przepis' }}
    </button>

    <RecipeFilters
      v-if="recipes.length && !browseCategory && searchMode !== 'ingredient'"
      v-model:selected-category="selectedCategory"
      v-model:selected-area="selectedArea"
      :categories="categories"
      :areas="areas"
      @change="updateFilters"
    />

    <p v-if="isLoading" class="status-message">Ładowanie...</p>

    <p v-else-if="errorMessage" class="status-message status-message--error">
      {{ errorMessage }}
    </p>

    <p v-else-if="hasSearched && recipes.length === 0" class="status-message">Brak wyników.</p>

    <p v-else-if="recipes.length && filteredRecipes.length === 0" class="status-message">
      Brak przepisów dla wybranych filtrów.
    </p>

    <h2 v-if="recipes.length" class="recipes-title">
      {{
        hasSearched
          ? searchMode === 'ingredient'
            ? `Przepisy ze składnikiem: ${searchQuery}`
            : `Wyniki dla: ${searchQuery}`
          : browseCategory
            ? `Kategoria: ${browseCategory}`
            : 'Odkrywaj przepisy'
      }}
    </h2>

    <div ref="recipesSection">
      <RecipeGrid :recipes="paginatedRecipes" />
    </div>

    <RecipePagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      @change-page="changePage"
    />
  </section>
</template>

<style scoped>
.home {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
  padding: 80px 0;
}

.home > h1 {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.home > p {
  margin: 20px 0 40px;
  color: #6b7280;
  font-size: 1.1rem;
}

button {
  padding: 16px 26px;
  border-radius: 12px;
  background: #1f2937;
  color: white;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-message {
  margin: -24px 0 40px;
  padding: 16px 20px;
  border: 1px solid #deded6;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
}

.status-message--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.recipes-title {
  margin: 48px 0 24px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.random-recipe {
  margin-bottom: 32px;
  border: 1px solid #deded6;
  background: #ffffff;
  color: #1f2937;
}

.random-recipe:hover:not(:disabled) {
  background: #f1f1eb;
}

@media (max-width: 767px) {
  .home {
    width: min(100% - 28px, 1200px);
    padding: 48px 0;
  }
}
</style>
