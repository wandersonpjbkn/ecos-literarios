<template>
  <div class="app">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-icon">📚</span>
          <div class="brand-text">
            <span class="brand-name">Ecos Literários</span>
            <span class="brand-sub">Catálogo do clube</span>
          </div>
        </RouterLink>
        <nav class="header-nav">
          <RouterLink to="/" class="nav-link">Catálogo</RouterLink>
        </nav>
      </div>
    </header>

    <main class="site-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <p>Ecos Literários · Clube do livro · Feito com 💛</p>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site {
  /* ── Header ──────────────────────────────────── */
  &-header {
    position: sticky;
    top: 0;
    z-index: 100;

    background: var(--ink);
    border-bottom: 1px solid rgba(var(--surface-rgb), 0.078);
    backdrop-filter: blur(8px);
  }

  /* ── Main ────────────────────────────────────── */
  &-main {
    flex: 1;
  }

  /* ── Footer ──────────────────────────────────── */
  &-footer {
    margin-top: auto;

    background: var(--ink);
    padding: 20px 24px;

    color: var(--muted);
    text-align: center;
    font-size: 0.8rem;
  }
}

.header {
  &-inner {
    margin: 0 auto;

    display: flex;
    max-width: 1200px;
    height: 64px;
    padding: 0 24px;

    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  &-nav {
    display: flex;
    gap: 8px;
  }
}

.brand {
  display: flex;

  color: var(--accent-muted);

  align-items: center;
  gap: 12px;
  transition: opacity var(--transition);

  &:hover {
    opacity: 0.85;
  }

  &-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  &-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  &-name {
    font: {
      family: var(--font-display);
      size: 1.1rem;
      weight: 600;
    }
    color: var(--surface);
  }

  &-sub {
    font: {
      size: 0.7rem;
      weight: 500;
    }
    color: var(--accent-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}

.nav {
  &-link {
    padding: 6px 14px;
    border-radius: var(--radius-sm);

    font: {
      weight: 400;
      size: 0.9rem;
    }
    color: var(--muted);

    transition: all var(--transition);

    &:hover,
    &.router-link-active {
      color: var(--surface);
      background: rgba(var(--surface-rgb), 0.078);
    }
  }
}
</style>
