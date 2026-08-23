<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import RecipeCard from '@/components/RecipeCard.vue'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { showToast } = useToast()

const { isFavorite, toggleFavorite } = useFavorites()
const { addRecentlyViewed } = useRecentlyViewed()

const recipe = ref(null)
const similarRecipes = ref([])
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

    if (recipe.value) {
      addRecentlyViewed(recipe.value)
      await fetchSimilarRecipes(recipe.value.strCategory)
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const youtubeEmbedUrl = computed(() => {
  if (!recipe.value?.strYoutube) {
    return ''
  }

  const url = recipe.value.strYoutube

  let videoId = ''

  if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0]
  }

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
})

async function fetchSimilarRecipes(category) {
  if (!category) {
    similarRecipes.value = []
    return
  }

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
    )

    if (!response.ok) {
      throw new Error('Nie udało się pobrać podobnych przepisów.')
    }

    const data = await response.json()

    similarRecipes.value = (data.meals || [])
      .filter((item) => item.idMeal !== recipe.value.idMeal)
      .slice(0, 3)
  } catch (error) {
    console.error(error)
    similarRecipes.value = []
  }
}

onMounted(fetchRecipe)

watch(
  () => route.params.id,
  async () => {
    await fetchRecipe()
  },
)

const recipeTags = computed(() => {
  if (!recipe.value?.strTags) {
    return []
  }

  return recipe.value.strTags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
})

async function copyIngredients() {
  if (!ingredients.value.length) {
    return
  }

  const text = ingredients.value.map((item) => `${item.ingredient} — ${item.measure}`).join('\n')

  try {
    await navigator.clipboard.writeText(text)

    showToast('Składniki skopiowane')
  } catch (error) {
    console.error(error)

    showToast('Nie udało się skopiować składników', 'error')
  }
}
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
          <RouterLink
            v-if="recipe.strCategory"
            :to="{
              name: 'home',
              query: {
                browse: recipe.strCategory,
              },
            }"
          >
            {{ recipe.strCategory }}
          </RouterLink>

          <span v-if="recipe.strArea">
            {{ recipe.strArea }}
          </span>
        </div>

        <div v-if="recipeTags.length" class="recipe-tags">
          <span v-for="tag in recipeTags" :key="tag" class="recipe-tag"> #{{ tag }} </span>
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

        <button type="button" class="copy-ingredients" @click="copyIngredients">
          Kopiuj składniki
        </button>

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

        <div v-if="recipe.strSource || recipe.strYoutube" class="recipe-links">
          <a
            v-if="recipe.strSource"
            :href="recipe.strSource"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zobacz oryginalny przepis
          </a>

          <a
            v-if="recipe.strYoutube"
            :href="recipe.strYoutube"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zobacz film na YouTube
          </a>
        </div>

        <div v-if="youtubeEmbedUrl" class="recipe-video">
          <iframe
            :src="youtubeEmbedUrl"
            :title="`Film: ${recipe.strMeal}`"
            allowfullscreen
          ></iframe>
        </div>

        <section v-if="similarRecipes.length" class="similar-recipes">
          <h2>Podobne przepisy</h2>

          <div class="similar-recipes__grid">
            <RecipeCard
              v-for="similarRecipe in similarRecipes"
              :key="similarRecipe.idMeal"
              :recipe="similarRecipe"
            />
          </div>
        </section>
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

.recipe-details__meta span,
.recipe-details__meta a {
  padding: 7px 11px;
  border-radius: 999px;
  background: #f1f1eb;
  color: #62625d;
  font-size: 0.8rem;
  font-weight: 600;
}

.recipe-details__meta a {
  text-decoration: none;
}

.recipe-details__meta a:hover {
  background: #e6e6de;
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

.recipe-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.recipe-links a {
  display: inline-flex;
  padding: 12px 18px;

  border: 1px solid #deded6;
  border-radius: 10px;

  background: #ffffff;
  color: #1f2937;

  text-decoration: none;
  font-weight: 600;
}

.recipe-links a:hover {
  background: #f1f1eb;
}

.recipe-video {
  margin-top: 40px;
  overflow: hidden;
  border-radius: 16px;
  aspect-ratio: 16 / 9;
}

.recipe-video iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.similar-recipes {
  margin-top: 64px;
}

.similar-recipes h2 {
  margin-bottom: 24px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.similar-recipes__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.recipe-tag {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f8f8f4;
  color: #77776f;
  font-size: 0.78rem;
  font-weight: 600;
}

.copy-ingredients {
  margin-bottom: 20px;
  padding: 12px 18px;

  border: 1px solid #deded6;
  border-radius: 10px;

  background: #ffffff;
  color: #1f2937;

  font-size: 0.9rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.copy-ingredients:hover {
  background: #f1f1eb;
  transform: translateY(-1px);
}

@media (max-width: 1023px) {
  .similar-recipes__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
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
  .similar-recipes__grid {
    grid-template-columns: 1fr;
  }
}

@media all and (max-width: 480px) {
  .copy-ingredients {
    width: 100%;
  }

  .recipe-links {
    flex-direction: column;
  }

  .recipe-links a {
    justify-content: center;
    width: 100%;
  }
}
</style>
