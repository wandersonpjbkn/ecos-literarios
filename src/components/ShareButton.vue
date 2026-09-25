<template>
  <div class="share">
    <AppButton variant="ghost" size="md" @click="share">
      <BaseIcon name="link" aria-hidden="true" />
      Compartilhar
    </AppButton>
  </div>
</template>

<script lang="ts" setup>
import { useMediaQuery } from '@vueuse/core'

import AppButton from '@/components/AppButton.vue'
import { useBreakpoints, useToast } from '@/composables'

const props = defineProps<{
  title: string
  path: string
}>()

const isPhone = useMediaQuery(useBreakpoints.isTablet)
const toast = useToast()

// Phone: the system share sheet (WhatsApp is right there). Desktop: just copy, the sheet adds nothing there.
const share = async () => {
  const url = `${window.location.origin}${props.path}`
  if (isPhone.value && navigator.share) {
    try {
      await navigator.share({ title: props.title, url })
      return
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    toast.show('Link copiado. É só colar na conversa.')
  } catch {
    toast.show(`Não deu pra copiar. O link é ${url}`)
  }
}
</script>

<style lang="scss" scoped>
.share {
  display: flex;
  justify-content: center;
}
</style>
