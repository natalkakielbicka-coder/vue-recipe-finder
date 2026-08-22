<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
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
const categoriesList = ref([])

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
      category: resetPage ? undefined : route.query.category,
      area: resetPage ? undefined : route.query.area,
      paged: resetPage ? undefined : route.query.paged,
    },
  })

  isLoading.value = true
  errorMessage.value = ''
  hasSearched.value = false

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
    )

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

  const query = route.query.q
  const page = Number(route.query.paged) || 1
  const category = route.query.category
  const area = route.query.area

  if (typeof query === 'string' && query.trim()) {
    searchQuery.value = query

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
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <div class="quick-categories">
      <button
        v-for="category in categoriesList"
        :key="category.idCategory"
        type="button"
        class="category-card"
        :class="{
          active: browseCategory === category.strCategory,
        }"
        @click="fetchRecipesByCategory(category.strCategory)"
      >
        <img :src="category.strCategoryThumb" :alt="category.strCategory" />

        <span>
          {{ category.strCategory }}
        </span>
      </button>
    </div>

    <form @submit.prevent="searchRecipes">
      <input v-model="searchQuery" type="text" placeholder="Wpisz nazwę dania..." />

      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Szukam...' : 'Szukaj' }}</button>

      <button
        v-if="hasSearched || browseCategory"
        type="button"
        class="button-secondary"
        @click="resetSearch"
      >
        Wyczyść
      </button>
    </form>

    <button
      type="button"
      class="random-recipe"
      :disabled="isRandomLoading"
      @click="openRandomRecipe"
    >
      {{ isRandomLoading ? 'Losuję...' : '🎲 Losowy przepis' }}
    </button>

    <div v-if="recipes.length && !browseCategory" class="filters">
      <select v-model="selectedCategory" @change="updateFilters">
        <option value="">Wszystkie kategorie</option>

        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <select v-model="selectedArea" @change="updateFilters">
        <option value="">Wszystkie kuchnie</option>

        <option v-for="area in areas" :key="area" :value="area">
          {{ area }}
        </option>
      </select>
    </div>

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
          ? 'Wyniki wyszukiwania'
          : browseCategory
            ? `Kategoria: ${browseCategory}`
            : 'Odkrywaj przepisy'
      }}
    </h2>

    <div class="recipes" ref="recipesSection">
      <RecipeCard
        v-for="recipe in paginatedRecipes"
        :key="recipe.idMeal"
        :recipe="recipe"
        :search-query="searchQuery"
      />
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        Poprzednia
      </button>

      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="pagination__dots"> ... </span>

        <button
          v-else
          type="button"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        type="button"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Następna
      </button>
    </div>
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

form {
  display: flex;
  gap: 12px;
  max-width: 700px;
  margin-bottom: 48px;
}

input {
  flex: 1;
  min-width: 0;
  padding: 16px 20px;
  border: 1px solid #deded6;
  border-radius: 12px;
  background: #ffffff;
  outline: none;
}

input:focus {
  border-color: #1f2937;
}

button {
  padding: 16px 26px;
  border-radius: 12px;
  background: #1f2937;
  color: white;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recipes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
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

button {
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 48px;
}

.pagination button {
  min-width: 44px;
  padding: 10px 14px;
  border: 1px solid #deded6;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
}

.pagination button:hover:not(:disabled),
.pagination button.active {
  border-color: #1f2937;
  background: #1f2937;
  color: #ffffff;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

form button:not(:disabled):hover {
  background: #374151;
  transform: translateY(-1px);
}
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.filters select {
  min-width: 180px;
  padding: 12px 16px;
  border: 1px solid #deded6;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
  font: inherit;
}

.recipes-title {
  margin: 48px 0 24px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.button-secondary {
  border: 1px solid #deded6;
  background: #ffffff;
  color: #1f2937;
}

.button-secondary:hover {
  background: #f1f1eb;
  color: #fff;
}

.quick-categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 48px;
}

.category-card {
  position: relative;

  overflow: hidden;
  min-width: 0;
  padding: 16px;

  border: 1px solid #deded6;
  border-radius: 16px;

  background: #ffffff;
  color: #1f2937;
}

.category-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  margin-bottom: 10px;
}

.category-card span {
  display: block;
  font-weight: 700;
}

.category-card:hover,
.category-card.active {
  border-color: #1f2937;
  background: #f1f1eb;
  color: #1f2937;
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

@media (max-width: 1023px) {
  .recipes {
    grid-template-columns: repeat(2, 1fr);
  }
  .quick-categories {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .home {
    width: min(100% - 28px, 1200px);
    padding: 48px 0;
  }

  form {
    flex-direction: column;
  }

  .recipes {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }

  .quick-categories {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
