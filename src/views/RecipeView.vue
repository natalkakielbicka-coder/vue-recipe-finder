<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="recipe-view">
    <h1>Przepis</h1>

    <p>ID przepisu: {{ route.params.id }}</p>
  </section>
</template>
