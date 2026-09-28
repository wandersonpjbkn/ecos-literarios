# NavRail

Três destinos e a conta. É a decisão de arquitetura do redesign inteiro, não um enfeite.

**Catálogo · Meus livros · Adicionar**, e embaixo "Minha conta" (ou "Entrar"). Quem pode entrar no Painel do clube vê também "Painel do clube" embaixo, acima da conta, do tablet para cima, onde o trilho aparece (decisão do dono, 2026-09-27). Para quem não pode entrar, o item não existe.

Não existe "Início" separado do "Catálogo". Duas telas com grade de livros foi o problema original do app (`BooksView` e `FilterView` faziam a mesma coisa) e chegou a ser recriado no redesign antes de ser cortado. O catálogo **é** a raiz: a grade abre a página e as prateleiras vêm depois dela, na mesma rolagem.

## Regras

Largura `rail-width`. Destino ativo com o estado selecionado do app inteiro: fundo `action-soft` com borda `action-border-subtle`, ícone e rótulo em `action` e rótulo em 600. Os outros ficam em `ink-muted`. As abas (Cadastros) são a exceção: marcam com sublinhado. O rótulo é sempre escrito — ícone sozinho não é entendido por quem não é nativo digital, e "três ícones sem texto" foi descartado no estudo de navegação.

Rótulo em 13px, não 12px. Cada destino tem no mínimo 66px de altura.

O estado ativo tem que corresponder à página. Na página de um livro, fica marcada a lista de onde ele foi aberto (Catálogo ou Meus livros). Um trilho marcando "Catálogo" em uma tela que não é o catálogo desfaz a única pista de lugar que existe.

## O que o consumidor fornece

A rota atual. No celular, o mesmo `AppSidebar` vira TabBar.

## Quem vê "Adicionar" (fatia 8)

Administrador e Editor, e quem não entrou (vai para Entrar e volta ao formulário). O Visitante não vê o item, nem no topo, nem no trilho, nem na barra de baixo.
