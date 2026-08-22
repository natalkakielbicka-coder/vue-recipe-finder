<script setup>
import RecipeCard from '@/components/RecipeCard.vue'
import { useFavorites } from '@/composables/useFavorites'

const { favoriteRecipes, clearFavorites } = useFavorites()

function confirmClearFavorites() {
  const confirmed = window.confirm('Czy na pewno chcesz usunąć wszystkie ulubione przepisy?')

  if (confirmed) {
    clearFavorites()
  }
}
</script>

<template>
  <section class="favorites-view">
    <h1>Ulubione przepisy</h1>

    <p v-if="favoriteRecipes.length === 0">Nie masz jeszcze żadnych ulubionych przepisów.</p>

    <button
      v-if="favoriteRecipes.length"
      type="button"
      class="clear-favorites"
      @click="confirmClearFavorites"
    >
      Usuń wszystkie ulubione
    </button>

    <div v-if="favoriteRecipes.length" class="recipes">
      <RecipeCard v-for="recipe in favoriteRecipes" :key="recipe.idMeal" :recipe="recipe" />
    </div>
  </section>
</template>

<style scoped>
.favorites-view {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
  padding: 64px 0 80px;
}

.favorites-view > h1 {
  margin: 0 0 40px;
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.favorites-view > p {
  padding: 24px;
  border: 1px solid #deded6;
  border-radius: 14px;
  background: #ffffff;
  color: #6b7280;
}

.recipes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.clear-favorites {
  margin-bottom: 32px;
  border: 1px solid #deded6;
  background: #ffffff;
  color: #1f2937;
}

.clear-favorites:hover {
  background: #f1f1eb;
}

@media (max-width: 900px) {
  .recipes {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .favorites-view {
    width: min(100% - 28px, 1200px);
    padding-top: 48px;
  }

  .recipes {
    grid-template-columns: 1fr;
  }
}
</style>
