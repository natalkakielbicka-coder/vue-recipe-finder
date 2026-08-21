<script setup>
import { ref } from 'vue'
import RecipeCard from '@/components/RecipeCard.vue'

const searchQuery = ref('')
const recipes = ref([])
const isLoading = ref(false)

async function searchRecipes() {
  if (!searchQuery.value.trim()) {
    recipes.value = []
    return
  }

  isLoading.value = true

  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery.value}`,
  )

  const data = await response.json()

  recipes.value = data.meals || []

  isLoading.value = false
}
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <form @submit.prevent="searchRecipes">
      <input v-model="searchQuery" type="text" placeholder="Wpisz nazwę dania..." />

      <button type="submit">Szukaj</button>
    </form>

    <p v-if="isLoading">Ładowanie...</p>

    <p v-else-if="searchQuery && recipes.length === 0">Brak wyników.</p>

    <div class="recipes">
      <RecipeCard v-for="recipe in recipes" :key="recipe.idMeal" :recipe="recipe" />
    </div>

    <p>Szukasz: {{ searchQuery }}</p>
  </section>
</template>
