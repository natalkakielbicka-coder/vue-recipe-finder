<template>
  <article class="recipe-skeleton">
    <div class="recipe-skeleton__image"></div>

    <div class="recipe-skeleton__content">
      <div class="recipe-skeleton__title"></div>
      <div class="recipe-skeleton__meta"></div>
    </div>
  </article>
</template>

<style scoped>
.recipe-skeleton {
  overflow: hidden;
  border: 1px solid #deded6;
  border-radius: 16px;
  background: #ffffff;
}

.recipe-skeleton__image {
  aspect-ratio: 4 / 3;
  background: #eeeeea;
}

.recipe-skeleton__content {
  padding: 20px;
}

.recipe-skeleton__title {
  width: 75%;
  height: 22px;
  margin-bottom: 14px;
  border-radius: 6px;
  background: #eeeeea;
}

.recipe-skeleton__meta {
  width: 40%;
  height: 16px;
  border-radius: 6px;
  background: #eeeeea;
}

.recipe-skeleton__image,
.recipe-skeleton__title,
.recipe-skeleton__meta {
  position: relative;
  overflow: hidden;
}

.recipe-skeleton__image::after,
.recipe-skeleton__title::after,
.recipe-skeleton__meta::after {
  content: '';
  position: absolute;
  inset: 0;

  transform: translateX(-100%);

  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);

  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
