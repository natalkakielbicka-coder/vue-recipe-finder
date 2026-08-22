<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'

const route = useRoute()

const { isFavorite, toggleFavorite } = useFavorites()

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
    <RouterLink
      :to="{
        name: 'home',
        query: route.query,
      }"
    >
      ← Wróć do przepisów
    </RouterLink>

    <p v-if="isLoading" class="status-message">Ładowanie przepisu...</p>

    <p v-else-if="errorMessage" class="status-message status-message--error">
      {{ errorMessage }}
    </p>

    <div v-else-if="recipe" class="recipe-details">
      <div class="recipe-details__image">
        <img :src="recipe.strMealThumb" :alt="recipe.strMeal" />
      </div>

      <div class="recipe-details__content">
        <div class="recipe-details__meta">
          <span v-if="recipe.strCategory">
            {{ recipe.strCategory }}
          </span>

          <span v-if="recipe.strArea">
            {{ recipe.strArea }}
          </span>
        </div>

        <div class="recipe-details__heading">
          <h1>{{ recipe.strMeal }}</h1>

          <button
            type="button"
            class="favorite-button"
            :class="{ active: isFavorite(recipe.idMeal) }"
            :aria-label="isFavorite(recipe.idMeal) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'"
            @click="toggleFavorite(recipe)"
          >
            {{ isFavorite(recipe.idMeal) ? '♥' : '♡' }}
          </button>
        </div>

        <h2>Składniki</h2>

        <ul class="ingredients">
          <li v-for="item in ingredients" :key="item.ingredient">
            <span>{{ item.ingredient }}</span>
            <strong>{{ item.measure }}</strong>
          </li>
        </ul>
      </div>

      <div class="recipe-details__instructions">
        <h2>Instrukcja</h2>
        <p>{{ recipe.strInstructions }}</p>
      </div>
    </div>

    <p v-else>Nie znaleziono przepisu.</p>
  </section>
</template>

<style scoped>
.recipe-view {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
  padding: 48px 0 80px;
}

.recipe-view > a {
  display: inline-flex;
  margin-bottom: 40px;
  color: #6b7280;
  font-weight: 600;
}

.recipe-view > a:hover {
  color: #1f2937;
}

.recipe-details {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 56px;
}

.recipe-details__image img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 24px;
}

.recipe-details__content h2,
.recipe-details__instructions h2 {
  margin: 0 0 20px;
  font-size: 1.4rem;
}

.recipe-details__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipe-details__meta span {
  padding: 7px 11px;
  border-radius: 999px;
  background: #f1f1eb;
  color: #62625d;
  font-size: 0.8rem;
  font-weight: 600;
}

.ingredients {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ingredients li {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5dc;
}

.ingredients strong {
  text-align: right;
  font-weight: 600;
}

.recipe-details__instructions {
  grid-column: 1 / -1;
  max-width: 800px;
  padding-top: 24px;
}

.recipe-details__instructions p {
  margin: 0;
  color: #4b5563;
  line-height: 1.8;
  white-space: pre-line;
}

.status-message {
  padding: 18px 20px;
  border: 1px solid #deded6;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
}

.status-message--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.recipe-details__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin: 16px 0 40px;
}

.recipe-details__heading h1 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.favorite-button {
  flex: 0 0 auto;

  display: grid;
  place-items: center;

  width: 50px;
  height: 50px;
  padding: 0;

  border: 1px solid #deded6;
  border-radius: 50%;

  background: #ffffff;
  color: #1f2937;

  font-size: 1.7rem;
}

.favorite-button:hover {
  transform: scale(1.05);
}

.favorite-button.active {
  color: #b42318;
}

@media (max-width: 800px) {
  .recipe-view {
    width: min(100% - 28px, 1200px);
    padding-top: 32px;
  }

  .recipe-details {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .recipe-details__content h1 {
    margin-bottom: 32px;
  }

  .recipe-details__instructions {
    grid-column: auto;
    padding-top: 8px;
  }
}
</style>
