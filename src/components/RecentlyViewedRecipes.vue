<script setup>
import RecipeGrid from '@/components/RecipeGrid.vue'

defineProps({
  recipes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['clear'])
</script>

<template>
  <section v-if="recipes.length" class="recently-viewed">
    <div class="recently-viewed__header">
      <h2>Ostatnio oglądane</h2>

      <button type="button" @click="emit('clear')">Wyczyść</button>
    </div>

    <RecipeGrid :recipes="recipes" />
  </section>
</template>

<style scoped>
.recently-viewed {
  margin-top: 72px;
}

.recently-viewed h2 {
  margin-bottom: 24px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.recently-viewed__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.recently-viewed__header h2 {
  margin: 0;
}

.recently-viewed__header button {
  padding: 10px 14px;
  border: 1px solid #deded6;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
  font-weight: 600;
}

.recently-viewed__header button:hover {
  background: #f1f1eb;
}
</style>
