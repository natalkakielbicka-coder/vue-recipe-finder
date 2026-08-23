import { ref } from 'vue'

const toastMessage = ref('')
const toastType = ref('success')
const isToastVisible = ref(false)

let toastTimeout = null

export function useToast() {
  function showToast(message, type = 'success') {
    toastMessage.value = message
    toastType.value = type
    isToastVisible.value = true

    clearTimeout(toastTimeout)

    toastTimeout = setTimeout(() => {
      isToastVisible.value = false
    }, 2500)
  }

  return {
    toastMessage,
    toastType,
    isToastVisible,
    showToast,
  }
}
