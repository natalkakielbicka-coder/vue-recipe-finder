<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },

  totalPages: {
    type: Number,
    required: true,
  },

  visiblePages: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['change-page'])
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      type="button"
      :disabled="currentPage === 1"
      @click="emit('change-page', currentPage - 1)"
    >
      Poprzednia
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="pagination__dots"> ... </span>

      <button
        v-else
        type="button"
        :class="{
          active: currentPage === page,
        }"
        @click="emit('change-page', page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      type="button"
      :disabled="currentPage === totalPages"
      @click="emit('change-page', currentPage + 1)"
    >
      Następna
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 48px;
}

.pagination button {
  min-width: 44px;
  padding: 10px 14px;
  border: 1px solid #deded6;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
}

.pagination button:hover:not(:disabled),
.pagination button.active {
  border-color: #1f2937;
  background: #1f2937;
  color: #ffffff;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
