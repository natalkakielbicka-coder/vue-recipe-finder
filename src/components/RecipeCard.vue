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

        <div class="recipe-card__meta">
          <span v-if="recipe.strCategory">
            {{ recipe.strCategory }}
          </span>
          <span v-if="recipe.strArea">
            {{ recipe.strArea }}
          </span>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<style scoped>
.recipe-card-link {
  display: block;
}

.recipe-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e5e5dc;
  border-radius: 18px;
  background: #ffffff;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.recipe-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(31, 41, 55, 0.1);
}

.recipe-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.recipe-card__content {
  padding: 20px;
}

.recipe-card__content h2 {
  margin: 0 0 16px;
  font-size: 1.3rem;
  line-height: 1.25;
}

.recipe-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipe-card__meta span {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f1eb;
  color: #62625d;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
