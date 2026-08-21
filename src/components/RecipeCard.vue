<script setup>
defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})
</script>

<template>
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
</template>
