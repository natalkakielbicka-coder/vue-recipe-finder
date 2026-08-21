<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <RouterLink :to="`/recipe/${recipe.idMeal}`" class="recipe-card-link">
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
