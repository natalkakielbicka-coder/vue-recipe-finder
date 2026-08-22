<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
  },

  activeCategory: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="quick-categories">
    <button
      v-for="category in categories"
      :key="category.idCategory"
      type="button"
      class="category-card"
      :class="{
        active: activeCategory === category.strCategory,
      }"
      @click="emit('select', category.strCategory)"
    >
      <img :src="category.strCategoryThumb" :alt="category.strCategory" />

      <span>
        {{ category.strCategory }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.quick-categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 48px;
}

.category-card {
  position: relative;
  overflow: hidden;
  min-width: 0;
  padding: 16px;

  border: 1px solid #deded6;
  border-radius: 16px;

  background: #ffffff;
  color: #1f2937;
}

.category-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  margin-bottom: 10px;
}

.category-card span {
  display: block;
  font-weight: 700;
}

.category-card:hover,
.category-card.active {
  border-color: #1f2937;
  background: #f1f1eb;
  color: #1f2937;
}

@media (max-width: 1023px) {
  .quick-categories {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .quick-categories {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
