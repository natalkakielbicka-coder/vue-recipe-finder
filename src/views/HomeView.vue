<script setup>
import { ref } from 'vue'
import RecipeCard from '@/components/RecipeCard.vue'

const searchQuery = ref('')
const recipes = ref([])

async function searchRecipes() {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery.value}`,
  )

  const data = await response.json()

  recipes.value = data.meals || []
}
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <input v-model="searchQuery" type="text" placeholder="Wpisz nazwę dania..." />

    <button @click="searchRecipes">Szukaj</button>

    <div class="recipes">
      <RecipeCard v-for="recipe in recipes" :key="recipe.idMeal" :recipe="recipe" />
    </div>

    <p>Szukasz: {{ searchQuery }}</p>
  </section>
</template>
