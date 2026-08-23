<script setup>
import { useToast } from '@/composables/useToast'

const { toastMessage, toastType, isToastVisible } = useToast()
</script>

<template>
  <Transition name="toast">
    <div
      v-if="isToastVisible"
      class="toast"
      :class="`toast--${toastType}`"
      role="status"
      aria-live="polite"
    >
      {{ toastMessage }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  z-index: 1000;
  right: 24px;
  bottom: 24px;

  max-width: 360px;
  padding: 14px 18px;

  border-radius: 12px;

  background: #1f2937;
  color: #ffffff;

  font-size: 0.95rem;
  font-weight: 600;

  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.2);
}

.toast--success {
  background: #1f2937;
}

.toast--error {
  background: #991b1b;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 600px) {
  .toast {
    right: 14px;
    bottom: 14px;
    left: 14px;
    max-width: none;
  }
}
</style>
