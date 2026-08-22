<script setup>
import RecipeCard from '@/components/RecipeCard.vue'

defineProps({
  recipes: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="recipes">
    <RecipeCard v-for="recipe in recipes" :key="recipe.idMeal" :recipe="recipe" />
  </div>
</template>

<style scoped>
.recipes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1023px) {
  .recipes {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .recipes {
    grid-template-columns: 1fr;
  }
}
</style>
