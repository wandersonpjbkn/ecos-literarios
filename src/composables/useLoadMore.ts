import { computed, nextTick, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUtils } from '@/composables/useUtils'

// One batch for every list in the app (catalog, Meus livros, panel): inside Baymard's range for phones.
const LOAD_MORE_BATCH = 24

type Options = {
  // Names the list in the analytics event, so depth can be measured per screen (estudo-paginacao.md).
  name: string
  // Slots the list shows that are not items (the eco card in the catalog grid).
  reserved?: Ref<number>
}

/** "Ver mais" for any list, with the open count in the URL (?ver=); rules in ListFooter.md. */
export function useLoadMore<T>(items: Ref<T[]>, { name, reserved }: Options) {
  const route = useRoute()
  const router = useRouter()

  const open = computed(() => Math.max(LOAD_MORE_BATCH, Number(route.query.ver) || LOAD_MORE_BATCH))
  const visible = computed(() => items.value.slice(0, open.value - (reserved?.value ?? 0)))
  const nextBatch = computed(() => Math.min(LOAD_MORE_BATCH, items.value.length - visible.value.length))

  const setOpen = (count: number) => {
    const query = { ...route.query }
    if (count > LOAD_MORE_BATCH) query.ver = String(count)
    else delete query.ver
    return router.replace({ query })
  }

  // Focus goes to the first item that just appeared, so a keyboard or screen reader continues from there.
  let opening = false
  const more = async (list?: HTMLElement | null) => {
    // A second click before the URL updates would count the same batch twice in the analytics.
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

  // Another criterion in the URL means another list; data arriving (reload, sync) keeps the place.
  const otherParams = computed(() => JSON.stringify(Object.entries(route.query).filter(([key]) => key !== 'ver')))
  watch(otherParams, () => reset())

  return { visible, nextBatch, more, reset }
}
