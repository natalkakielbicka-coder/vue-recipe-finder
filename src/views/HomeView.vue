<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const recipes = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

const currentPage = ref(1)
const recipesPerPage = 9
const recipesSection = ref(null)

async function searchRecipes(resetPage = true) {
  if (!searchQuery.value.trim()) {
    recipes.value = []
    errorMessage.value = ''
    hasSearched.value = false

    router.replace({
      query: {},
    })

    return
  }

  const query = searchQuery.value.trim()

  searchQuery.value = query

  router.replace({
    query: {
      q: query,
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
    }
  } catch (error) {
    errorMessage.value = error.message
    recipes.value = []
  } finally {
    isLoading.value = false
    hasSearched.value = true
  }
}

onMounted(async () => {
  const query = route.query.q
  const page = Number(route.query.paged) || 1

  if (typeof query === 'string' && query.trim()) {
    searchQuery.value = query

    await searchRecipes(false)

    if (page <= totalPages.value) {
      currentPage.value = page
    }
  }
})

const totalPages = computed(() => {
  return Math.ceil(recipes.value.length / recipesPerPage)
})

const paginatedRecipes = computed(() => {
  const start = (currentPage.value - 1) * recipesPerPage
  const end = start + recipesPerPage

  return recipes.value.slice(start, end)
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
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <form @submit.prevent="searchRecipes">
      <input v-model="searchQuery" type="text" placeholder="Wpisz nazwę dania..." />

      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Szukam...' : 'Szukaj' }}</button>
    </form>

    <p v-if="isLoading" class="status-message">Ładowanie...</p>

    <p v-else-if="errorMessage" class="status-message status-message--error">
      {{ errorMessage }}
    </p>

    <p v-else-if="hasSearched && recipes.length === 0" class="status-message">Brak wyników.</p>

    <div class="recipes" ref="recipesSection">
      <RecipeCard
        v-for="recipe in paginatedRecipes"
        :key="recipe.idMeal"
        :recipe="recipe"
        :search-query="searchQuery"
      />
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="currentPage--">Poprzednia</button>

      <button
        v-for="page in totalPages"
        :key="page"
        type="button"
        :class="{ active: currentPage === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Następna
      </button>
    </div>

    <p>Szukasz: {{ searchQuery }}</p>
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

button:not(:disabled):hover {
  background: #374151;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .recipes {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
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
}
</style>
