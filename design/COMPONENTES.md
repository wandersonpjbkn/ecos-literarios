# Componentes

Dez componentes, um arquivo cada em `componentes/`. Cada um traz as regras, os estados
(inclusive o vazio) e o que o consumidor precisa fornecer. Os previews ao vivo estão no
design system; aqui está o texto, que é o que decide implementação.

| Componente | O que é | Fatia |
| --- | --- | --- |
| [Button](componentes/Button.md) | Quatro pesos, um primário por tela | 1 |
| [FilterChip](componentes/FilterChip.md) | Filtro rápido e etiqueta do que está aplicado | 3 |
| [CoverBlock](componentes/CoverBlock.md) | O lugar da capa, nos três estados do acervo | 2 |
| [BookCard](componentes/BookCard.md) | A célula da grade: título, autor, quem mencionou | 2 |
| [QuoteBlock](componentes/QuoteBlock.md) | O que alguém escreveu — e quando não escreveu | 5 |
| [FilterDrawer](componentes/FilterDrawer.md) | A gaveta sobre o catálogo | 4 |
| [ListFooter](componentes/ListFooter.md) | "Você está vendo 23 de 87" + ver mais | 3 |
| [EmptyState](componentes/EmptyState.md) | Sem resultado, sem conteúdo, fora do ar | 6 |
| [NavRail](componentes/NavRail.md) | Os três destinos, no desktop | 3 |
| [TabBar](componentes/TabBar.md) | Os mesmos três, no celular | 3 |

## Controles de formulário

Cada navegador pinta `select` e caixa de marcar do seu jeito, então nenhum controle nativo aparece cru. A forma vem de uma pílula só (`BasePill`: tamanho, borda, foco, desabilitado), e os controles montam em cima dela:

- `AppButton`: os quatro pesos do [Button](componentes/Button.md).
- `AppSelect`: lista própria (`listbox`) para escolha única, como a ordenação; setas, Home/End, Enter, Esc e letra inicial.
- `AppCheck`: caixa ou rádio desenhados sobre o input nativo transparente.
- `ComboSelect`: campo com autocompletar para listas longas de escolha múltipla (Subgênero).

## O que não é componente

Prateleiras, a faixa de relacionados e o cabeçalho de resultado são composições de
`BookCard` mais um cabeçalho de seção. Não precisam de abstração própria; se virarem uma,
vão acumular props para cobrir casos que não existem.

## Uma regra que vale para todos

Nenhum componente aceita cor por prop. A cor vem do token, e o gênero do livro é que
escolhe a tinta da capa. Um `color="blue"` em qualquer assinatura é o começo do fim da
regra de que azul quer dizer clicável.
