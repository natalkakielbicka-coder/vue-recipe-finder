<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const recipe = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const ingredients = computed(() => {
  if (!recipe.value) {
    return []
  }

  const result = []

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe.value[`strIngredient${i}`]
    const measure = recipe.value[`strMeasure${i}`]

    if (ingredient && ingredient.trim()) {
      result.push({
        ingredient,
        measure,
      })
    }
  }

  return result
})

async function fetchRecipe() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${route.params.id}`,
    )

    if (!response.ok) {
      throw new Error('Nie udało się pobrać przepisu.')
    }

    const data = await response.json()

    recipe.value = data.meals?.[0] || null
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchRecipe)
</script>

<template>
  <section class="recipe-view">
    <p v-if="isLoading">Ładowanie przepisu...</p>

    <p v-else-if="errorMessage">
      {{ errorMessage }}
    </p>

    <div v-else-if="recipe">
      <h1>{{ recipe.strMeal }}</h1>

      <img :src="recipe.strMealThumb" :alt="recipe.strMeal" />

      <p>{{ recipe.strCategory }}</p>
      <p>{{ recipe.strArea }}</p>

      <h2>Składniki</h2>

      <ul>
        <li v-for="item in ingredients" :key="item.ingredient">
          {{ item.measure }} {{ item.ingredient }}
        </li>
      </ul>

      <h2>Instrukcja</h2>

      <p>{{ recipe.strInstructions }}</p>
    </div>

    <p v-else>Nie znaleziono przepisu.</p>
  </section>
</template>
