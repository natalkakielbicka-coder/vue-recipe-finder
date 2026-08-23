<script setup>
import RecipeGrid from '@/components/RecipeGrid.vue'

defineProps({
  recipes: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section v-if="recipes.length" class="recently-viewed">
    <h2>Ostatnio oglądane</h2>

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
</style>
