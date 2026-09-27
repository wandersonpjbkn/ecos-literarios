<template>
  <div class="share">
    <AppButton variant="ghost" size="md" @click="share">
      <BaseIcon name="link" aria-hidden="true" />
      Compartilhar
    </AppButton>
    <!-- Stays until the next try: a toast would take the link away before anyone could select it. -->
    <AppNotice v-if="uncopied" :text="`Não deu pra copiar. O link é ${uncopied}`" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import AppButton from '@/components/AppButton.vue'
import AppNotice from '@/components/AppNotice.vue'
import { useBreakpoints, useToast } from '@/composables'

const props = defineProps<{
  title: string
  path: string
}>()

const isPhone = useMediaQuery(useBreakpoints.isPhone)
const toast = useToast()
const uncopied = ref('')

// Phone: the system share sheet (WhatsApp is right there). Desktop: just copy, the sheet adds nothing there.
const share = async () => {
  const url = `${window.location.origin}${props.path}`
  uncopied.value = ''
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
    uncopied.value = url
  }
}
</script>

<style lang="scss" scoped>
.share {
  display: flex;
  flex-direction: column;
  align-items: center;

  :deep(.app-notice__text) {
    overflow-wrap: anywhere;
    user-select: all;
  }
}
</style>
