import { computed, nextTick, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUtils } from '@/composables/useUtils'

const LOAD_MORE_BATCH = 24

type Options = {
  name: string
  reserved?: Ref<number>
}

export function useLoadMore<T>(items: Ref<T[]>, { name, reserved }: Options) {
  const route = useRoute()
  const router = useRouter()

  let opening = false

  const open = computed(() => Math.max(LOAD_MORE_BATCH, Number(route.query.ver) || LOAD_MORE_BATCH))
  const visible = computed(() => items.value.slice(0, open.value - (reserved?.value ?? 0)))
  const nextBatch = computed(() => Math.min(LOAD_MORE_BATCH, items.value.length - visible.value.length))

  const otherParams = computed(() => JSON.stringify(Object.entries(route.query).filter(([key]) => key !== 'ver')))

  const setOpen = (count: number) => {
    const query = { ...route.query }
    if (count > LOAD_MORE_BATCH) query.ver = String(count)
    else delete query.ver
    return router.replace({ query })
  }

  const more = async (list?: HTMLElement | null) => {
    if (opening) return
    opening = true
    try {
      const firstNew = visible.value.length
      await setOpen(open.value + LOAD_MORE_BATCH)
      useUtils().sendGtmEvent({ event: 'load_more', load_more_list: name, load_more_shown: visible.value.length })
      await nextTick()
      list?.querySelectorAll<HTMLElement>('[data-list-item]')[firstNew]?.focus()
    } finally {
      opening = false
    }
  }

  const reset = () => (route.query.ver ? setOpen(LOAD_MORE_BATCH) : undefined)

  watch(otherParams, () => reset())

  return { visible, nextBatch, more, reset }
}
