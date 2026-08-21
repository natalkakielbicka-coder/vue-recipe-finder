<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const recipes = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

async function searchRecipes() {
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
  } catch (error) {
    errorMessage.value = error.message
    recipes.value = []
  } finally {
    isLoading.value = false
    hasSearched.value = true
  }
}

onMounted(() => {
  const query = route.query.q

  if (typeof query === 'string' && query.trim()) {
    searchQuery.value = query
    searchRecipes()
  }
})
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <form @submit.prevent="searchRecipes">
      <input v-model="searchQuery" type="text" placeholder="Wpisz nazwę dania..." />

      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Szukam...' : 'Szukaj' }}</button>
    </form>

    <p v-if="isLoading">Ładowanie...</p>

    <p v-else-if="errorMessage">
      {{ errorMessage }}
    </p>

    <p v-else-if="hasSearched && recipes.length === 0">Brak wyników.</p>

    <div class="recipes">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.idMeal"
        :recipe="recipe"
        :search-query="searchQuery"
      />
    </div>

    <p>Szukasz: {{ searchQuery }}</p>
  </section>
</template>
