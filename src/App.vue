<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import ToastMessage from '@/components/ToastMessage.vue'

const { favoriteRecipes } = useFavorites()
</script>

<template>
  <header class="site-header">
    <RouterLink to="/" class="site-header__logo"> Recipe Finder </RouterLink>

    <nav>
      <RouterLink to="/"> Przepisy </RouterLink>

      <RouterLink to="/favorites"> Ulubione ({{ favoriteRecipes.length }}) </RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>

  <ToastMessage />
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 10;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
  padding: 20px 0;

  background: rgba(247, 247, 242, 0.92);
  backdrop-filter: blur(12px);
}

.site-header__logo {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.site-header nav {
  display: flex;
  gap: 24px;
}

.site-header nav a {
  color: #6b7280;
  font-weight: 600;
}

.site-header nav a:hover,
.site-header nav a.router-link-exact-active {
  color: #1f2937;
}

@media (max-width: 767px) {
  .site-header {
    width: min(100% - 28px, 1200px);
  }

  .site-header nav {
    gap: 14px;
  }
}
</style>
