export const routes = [
  {
    path: '/perfil',
    component: () => import('@/views/profile/ProfileLayout.vue'),
    redirect: { name: 'profile-claim' },
    children: [
      {
        path: 'vinculos',
        name: 'profile-claim',
        component: () => import('@/views/profile/ProfileClaim.vue'),
        meta: { title: 'Vínculos — Ecos Literários', pageClass: 'page-profile' },
      },
    ],
  },
]

export default { routes }
