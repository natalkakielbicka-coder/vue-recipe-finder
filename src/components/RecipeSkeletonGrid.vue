<script setup>
import RecipeSkeleton from '@/components/RecipeSkeleton.vue'

defineProps({
  count: {
    type: Number,
    default: 9,
  },
})
</script>

<template>
  <div class="skeleton-grid">
    <RecipeSkeleton v-for="index in count" :key="index" />
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1023px) {
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
