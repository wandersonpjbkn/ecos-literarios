<template>
  <div class="avatar" :style="avatarStyle" :title="alt">
    <span class="avatar-initials">{{ initialLetters }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  alt: string
  size?: 'sm' | 'default'
}>()

// ── Iniciais ──────────────────────────────────────────────────────
const initialLetters = computed(
  () =>
    props.alt
      ?.trim()
      ?.split(/\s+/)
      ?.map((part) => part[0])
      ?.slice(0, 2)
      ?.join('')
      ?.toUpperCase() ?? '?',
)

// ── Cor determinística por nome ───────────────────────────────────
const normalizedAlt = computed(() => props.alt?.trim().toLowerCase() || '')

const hash = computed(() => {
  let h = 0
  for (let i = 0; i < normalizedAlt.value.length; i++) {
    h = normalizedAlt.value.charCodeAt(i) + ((h << 5) - h)
    h |= 0
  }
  return Math.abs(h)
})

const hue = computed(() => hash.value % 360)

const avatarStyle = computed(() => {
  const h = hue.value
  const base = `hsl(${h} 60% 45%)`
  const lighten = `hsl(${h} 60% 65%)`
  const darken = `hsl(${h} 60% 35%)`

  return {
    backgroundImage: `linear-gradient(135deg, ${lighten}, ${darken})`,
    backgroundColor: base, // fallback se gradient não carregar
    color: '#fff',
  }
})
</script>

<style lang="scss" scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
  user-select: none;

  width: 2rem;
  height: 2rem;
}

.avatar-initials {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.02em;

  @media (max-width: 767px) {
    font-size: 0.7rem;
  }
}
</style>
