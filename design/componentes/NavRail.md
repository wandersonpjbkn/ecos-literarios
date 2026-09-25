# NavRail

Três destinos e a conta. É a decisão de arquitetura do redesign inteiro, não um enfeite.

**Catálogo · Meus livros · Adicionar**, e o avatar embaixo levando à conta. O painel do clube mora dentro da conta: um grupo pequeno não precisa de um item de administração fixo na tela.

Não existe "Início" separado do "Catálogo". Duas telas com grade de livros foi o problema original do app (`BooksView` e `FilterView` faziam a mesma coisa) e chegou a ser recriado no redesign antes de ser cortado. O catálogo **é** a raiz: a grade abre a página e as prateleiras vêm depois dela, na mesma rolagem.

## Regras

Largura `rail-width`. Destino ativo em `action-soft` com ícone e rótulo em `action`; os outros em `ink-muted`. O rótulo é sempre escrito — ícone sozinho não é entendido por quem não é nativo digital, e "três ícones sem texto" foi descartado no estudo de navegação.

Rótulo em 13px, não 12px. Cada destino tem no mínimo 66px de altura.

O estado ativo tem que corresponder à página. Um trilho marcando "Catálogo" numa tela que não é o catálogo desfaz a única pista de lugar que existe.

## O que o consumidor fornece

A rota atual. No celular, o mesmo conjunto vira TabBar.
