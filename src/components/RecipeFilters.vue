<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
  },

  areas: {
    type: Array,
    required: true,
  },

  selectedCategory: {
    type: String,
    default: '',
  },

  selectedArea: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:selectedCategory', 'update:selectedArea', 'change'])

function handleCategoryChange(event) {
  emit('update:selectedCategory', event.target.value)
  emit('change')
}

function handleAreaChange(event) {
  emit('update:selectedArea', event.target.value)
  emit('change')
}
</script>

<template>
  <div class="filters">
    <select :value="selectedCategory" @change="handleCategoryChange">
      <option value="">Wszystkie kategorie</option>

      <option v-for="category in categories" :key="category" :value="category">
        {{ category }}
      </option>
    </select>

    <select :value="selectedArea" @change="handleAreaChange">
      <option value="">Wszystkie kuchnie</option>

      <option v-for="area in areas" :key="area" :value="area">
        {{ area }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.filters select {
  min-width: 180px;
  padding: 12px 16px;
  border: 1px solid #deded6;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
  font: inherit;
}

@media (max-width: 767px) {
  .filters {
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }
}
</style>
