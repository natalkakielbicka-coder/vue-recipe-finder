<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoryBrowser from '@/components/CategoryBrowser.vue'
import RecipeFilters from '@/components/RecipeFilters.vue'
import RecipePagination from '@/components/RecipePagination.vue'
import RecipeSearch from '@/components/RecipeSearch.vue'
import RecipeGrid from '@/components/RecipeGrid.vue'
import RecentlyViewedRecipes from '@/components/RecentlyViewedRecipes.vue'
import { useRecipeCategories } from '@/composables/useRecipeCategories'
import { useIngredients } from '@/composables/useIngredients'
import { useNameSuggestions } from '@/composables/useNameSuggestions'
import { useRecipeSearch } from '@/composables/useRecipeSearch'
import { usePagination } from '@/composables/usePagination'
import { useRecipeFilters } from '@/composables/useRecipeFilters'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed'

const route = useRoute()
const router = useRouter()
const { categoriesList, fetchCategories } = useRecipeCategories()

const searchQuery = ref('')
const searchMode = ref('name')
const { ingredientSuggestions, fetchIngredients, matchIngredient } = useIngredients(
  searchQuery,
  searchMode,
)
const { nameSuggestions, scheduleNameSuggestions, clearNameSuggestions } = useNameSuggestions(
  searchQuery,
  searchMode,
)
const {
  recipes,
  isLoading,
  errorMessage,
  hasSearched,
  fetchRecipes,
  fetchInitialRecipes,
  fetchCategoryRecipes,
  fetchRandomRecipe,
} = useRecipeSearch()

const { selectedCategory, selectedArea, categories, areas, filteredRecipes, resetFilters } =
  useRecipeFilters(recipes)

const { recentlyViewedRecipes, clearRecentlyViewed } = useRecentlyViewed()

const isRandomLoading = ref(false)

const recipesSection = ref(null)

const browseCategory = ref('')
const showIngredientSuggestions = ref(false)
const activeSuggestionIndex = ref(-1)

async function searchRecipes(shouldResetPage = true) {
  if (!searchQuery.value.trim()) {
    recipes.value = []
    errorMessage.value = ''
    hasSearched.value = false
    browseCategory.value = ''

    resetFilters()
    resetPage()

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
      category: shouldResetPage ? undefined : route.query.category,
      area: shouldResetPage ? undefined : route.query.area,
      paged: shouldResetPage ? undefined : route.query.paged,
    },
  })

  let ingredientQuery = query

  if (searchMode.value === 'ingredient') {
    const matchedIngredient = matchIngredient(query)

    if (matchedIngredient) {
      ingredientQuery = matchedIngredient.strIngredient
    }
  }

  const url =
    searchMode.value === 'ingredient'
      ? `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredientQuery)}`
      : `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`

  await fetchRecipes(url)

  if (shouldResetPage) {
    resetPage()
    resetFilters()
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
      setPage(page)
    }

    return
  }

  if (typeof browse === 'string' && browse.trim()) {
    await fetchRecipesByCategory(browse)
    return
  }

  await fetchInitialRecipes()
})

function changePage(page) {
  setPage(page)

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

const {
  currentPage,
  totalPages,
  paginatedItems: paginatedRecipes,
  visiblePages,
  setPage,
  resetPage,
} = usePagination(filteredRecipes, 9)

function updateFilters() {
  resetPage()

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
  resetRecipeControls()

  hasSearched.value = false
  errorMessage.value = ''
  browseCategory.value = ''

  router.replace({
    query: {},
  })

  await fetchInitialRecipes()
}

async function fetchRecipesByCategory(category, updateUrl = true) {
  if (browseCategory.value === category && updateUrl) {
    await resetSearch()
    return
  }

  resetRecipeControls()

  browseCategory.value = category

  if (updateUrl) {
    router.replace({
      query: {
        browse: category,
      },
    })
  }

  await fetchCategoryRecipes(category)
}

async function openRandomRecipe() {
  isRandomLoading.value = true

  try {
    const randomRecipe = await fetchRandomRecipe()

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

function resetSuggestions() {
  showIngredientSuggestions.value = false
  clearNameSuggestions()
  activeSuggestionIndex.value = -1
}

async function handleSuggestionKeydown(event) {
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

    await selectSuggestion(suggestion.label)
  }

  if (event.key === 'Escape') {
    resetSuggestions()
  }
}

function handleSearchInput() {
  activeSuggestionIndex.value = -1

  if (searchMode.value === 'ingredient') {
    showIngredientSuggestions.value = true
    clearNameSuggestions()
    return
  }

  showIngredientSuggestions.value = false

  scheduleNameSuggestions()
}

function closeSuggestions() {
  setTimeout(() => {
    resetSuggestions()
  }, 100)
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

  resetSuggestions()

  await searchRecipes()
}

function handleSearchModeChange() {
  resetSuggestions()
}

const showSearchSuggestions = computed(() => {
  if (searchMode.value === 'ingredient') {
    return showIngredientSuggestions.value
  }

  return nameSuggestions.value.length > 0
})

function resetRecipeControls() {
  searchQuery.value = ''
  resetFilters()
  resetPage()
  resetSuggestions()
}
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

    <RecentlyViewedRecipes :recipes="recentlyViewedRecipes" @clear="clearRecentlyViewed" />
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
