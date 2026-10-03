import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    pageClass?: string
    // Which frame the screen sits in (App.vue): reading by default, an area (panel, Minha conta) or entering.
    frame?: 'area' | 'auth'
    // Behind the login: when the session ends here, the reader is sent to enter again (App.vue).
    signedIn?: boolean
    // Set only by adminRoute() in router/modules/admin.ts; the guard and the panel menu read it.
    adminOnly?: boolean
  }
}
