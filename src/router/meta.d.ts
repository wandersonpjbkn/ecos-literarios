import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    pageClass?: string
    // Which frame the screen sits in (App.vue): reading by default, an area (panel, Minha conta) or entering.
    frame?: 'area' | 'auth'
    // Set only by adminRoute() in router/modules/admin.ts; the guard and the panel menu read it.
    adminOnly?: boolean
  }
}
