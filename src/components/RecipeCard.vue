<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <RouterLink
    :to="{
      name: 'recipe',
      params: {
        id: recipe.idMeal,
      },
      query: {
        q: searchQuery,
      },
    }"
    class="recipe-card-link"
  >
    <article class="recipe-card">
      <img :src="recipe.strMealThumb" :alt="recipe.strMeal" />

      <div class="recipe-card__content">
        <h2>{{ recipe.strMeal }}</h2>

        <p>
          {{ recipe.strCategory }}
        </p>

        <p>
          {{ recipe.strArea }}
        </p>
      </div>
    </article>
  </RouterLink>
</template>
