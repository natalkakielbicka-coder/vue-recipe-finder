<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

function searchRecipes() {
  console.log('Szukam:', searchQuery.value)
}
</script>

<template>
  <section class="home">
    <h1>Recipe Finder</h1>
    <p>Znajdź pomysł na swój następny posiłek.</p>

    <input v-model="searchQuery" type="text" placeholder="Wpisz nazwę dania..." />

    <button @click="searchRecipes">Szukaj</button>

    <p>Szukasz: {{ searchQuery }}</p>
  </section>
</template>
