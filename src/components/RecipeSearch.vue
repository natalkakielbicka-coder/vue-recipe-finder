<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },

  searchMode: {
    type: String,
    default: 'name',
  },

  isLoading: {
    type: Boolean,
    default: false,
  },

  showClear: {
    type: Boolean,
    default: false,
  },

  suggestions: {
    type: Array,
    default: () => [],
  },

  showSuggestions: {
    type: Boolean,
    default: false,
  },

  activeSuggestionIndex: {
    type: Number,
    default: -1,
  },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:searchMode',
  'submit',
  'reset',
  'input',
  'keydown',
  'blur',
  'mode-change',
  'select-suggestion',
])

function handleInput(event) {
  emit('update:searchQuery', event.target.value)
  emit('input')
}

function handleModeChange(event) {
  emit('update:searchMode', event.target.value)
  emit('mode-change')
}
</script>

<template>
  <form class="recipe-search" @submit.prevent="emit('submit')">
    <label for="search-mode" class="sr-only"> Sposób wyszukiwania </label>

    <select id="search-mode" :value="searchMode" class="search-mode" @change="handleModeChange">
      <option value="name">Po nazwie</option>

      <option value="ingredient">Po składniku</option>
    </select>

    <div class="search-input-wrapper">
      <label for="recipe-search" class="sr-only"> Szukaj przepisu </label>

      <input
        id="recipe-search"
        :value="searchQuery"
        type="text"
        :placeholder="searchMode === 'ingredient' ? 'Wpisz składnik...' : 'Wpisz nazwę dania...'"
        @input="handleInput"
        @keydown="emit('keydown', $event)"
        @blur="emit('blur')"
      />

      <div v-if="showSuggestions && suggestions.length" class="search-suggestions">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          type="button"
          class="search-suggestion"
          :class="{
            active: activeSuggestionIndex === index,
          }"
          @click="emit('select-suggestion', suggestion.label)"
        >
          {{ suggestion.label }}
        </button>
      </div>
    </div>

    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Szukam...' : 'Szukaj' }}
    </button>

    <button v-if="showClear" type="button" class="button-secondary" @click="emit('reset')">
      Wyczyść
    </button>
  </form>
</template>

<style scoped>
.recipe-search {
  display: flex;
  gap: 12px;
  max-width: 700px;
  margin-bottom: 48px;
}

.search-mode {
  padding: 16px;
  border: 1px solid #deded6;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2937;
  font: inherit;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search-input-wrapper input {
  width: 100%;
  min-width: 0;
  padding: 16px 20px;

  border: 1px solid #deded6;
  border-radius: 12px;

  background: #ffffff;
  outline: none;
}

.search-input-wrapper input:focus {
  border-color: #1f2937;
}

.recipe-search button {
  padding: 16px 26px;
  border: 0;
  border-radius: 12px;

  background: #1f2937;
  color: #ffffff;

  font-weight: 600;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.recipe-search button:not(:disabled):hover {
  background: #374151;
  transform: translateY(-1px);
}

.recipe-search button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recipe-search .button-secondary {
  border: 1px solid #deded6;
  background: #ffffff;
  color: #1f2937;
}

.recipe-search .button-secondary:hover {
  background: #f1f1eb !important;
  color: #1f2937;
  transform: none;
}

.search-suggestions {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;

  width: 100%;
  overflow: hidden;

  border: 1px solid #deded6;
  border-radius: 12px;

  background: #ffffff;
  box-shadow: 0 14px 30px rgba(31, 41, 55, 0.12);
}

.recipe-search .search-suggestion {
  display: block;
  width: 100%;
  padding: 12px 16px;

  border: 0;
  border-radius: 0;

  background: #ffffff;
  color: #1f2937;

  text-align: left;
  font-weight: 500;
}

.recipe-search .search-suggestion:hover,
.recipe-search .search-suggestion.active {
  background: #f1f1eb !important;
  color: #1f2937;
  transform: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 767px) {
  .recipe-search {
    flex-direction: column;
  }
}
</style>
