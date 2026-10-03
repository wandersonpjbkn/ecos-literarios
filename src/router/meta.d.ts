import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    pageClass?: string
    frame?: 'area' | 'auth'
    signedIn?: boolean
    adminOnly?: boolean
  }
}
