import { readonly, ref } from 'vue'

const DEFAULT_MS = 3500

const message = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

const show = (text: string, duration = DEFAULT_MS) => {
  message.value = text
  clearTimeout(timer)
  timer = setTimeout(() => (message.value = ''), duration)
}

const hide = () => {
  clearTimeout(timer)
  message.value = ''
}

export const useToast = () => ({ message: readonly(message), show, hide })
