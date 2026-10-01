# Componentes

Onze componentes, um arquivo cada em `componentes/`. Cada um traz as regras, os estados
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
| [Avatar](componentes/Avatar.md) | A inicial de quem é do clube, e a da sua conta | 8g |

## Controles de formulário

Cada navegador pinta `select` e caixa de marcar do seu jeito, então nenhum controle nativo aparece cru. A forma vem de uma pílula só (`BasePill`: tamanho, borda, foco, desabilitado), e os controles montam em cima dela:

- `AppButton`: os quatro pesos do [Button](componentes/Button.md).
- `AppSelect`: lista própria (`listbox`) para escolha única, como a ordenação; setas, Home/End, Enter, Esc e letra inicial.
- `AppCheck`: caixa ou rádio desenhados sobre o input nativo transparente. Desabilitado, fica cinza, como a pílula desabilitada.
- `CheckRow`: a linha de caixa de marcar do app inteiro (filtro, formatos, permissões, busca de capa e dados): caixa, rótulo, detalhe opcional embaixo e contagem opcional à direita.
- `ComboSelect`: campo com autocompletar para listas longas de escolha múltipla (Subgênero). O que já foi escolhido aparece como `FilterChip` removível.
- `AppField`: rótulo, dica (embaixo do campo), campo (linha ou texto longo), contador e erro. O erro é lido junto do campo (`aria-describedby`), nunca só pela cor. Recebe um controle próprio no slot (o `MultiSelect`, por exemplo), que ganha o id do rótulo. `trim` apara o valor quando ele é confirmado, nunca a cada tecla.
- `MultiSelect`: o gatilho é um `<button>`, e as setas funcionam mesmo sem campo de busca.

Todo campo de formulário (`AppField`, `MultiSelect`, o campo do `ComboSelect`) tem a mesma casca: branco com ou sem valor, borda de 1px `border-strong`, raio `radius-md` e borda mais clara ao passar o mouse. Nas listas de escolha (`AppSelect`, `MultiSelect`, `ComboSelect`), o escolhido tem um tique e a tinta de ação, sem fundo.

## Peças compartilhadas

- Ação de linha (Editar, Remover, Salvar, Cancelar): `AppButton` `md` com ícone **e** texto, e o item só para o leitor de tela ("Editar" + "Circe"). É o mesmo "Editar" em Livros do painel, Autores e gêneros, Meus livros e na página do livro: nenhum rótulo depende de reconhecer um ícone (COPY.md).
- `AppBadge`: etiqueta que não é controle ("você", "Incluiu os que já tinham capa"). Canto reto e sem borda, para não ser lida como chip. Com `tone="alert"`, no âmbar do aviso, marca um estado que pede atenção e tem volta ("suspensa" em Membros); o vermelho continua só para a ação sem volta.
- `SupportLink`: o link para o WhatsApp do suporte, com o ícone e a mensagem pronta. Sozinho é um link que quem usa veste (pé das áreas, trilho); com `pill`, é o botão ghost entre outras ações (entrar, volta do link, erro de carregamento). Sem número configurado, não aparece.
- `InfoTip`: ajuda que abre ao passar o mouse, ao focar e ao tocar ("Só outro Administrador muda o seu nível.").
- `AppNotice`: o aviso âmbar, com "Tentar de novo" quando repetir resolve. É o erro de toda ação que não passou por diálogo: abrir a edição, a lista de leitura, recarregar o catálogo, reenviar o link, copiar o link (o aviso guarda o link para a pessoa selecionar). Um erro de ação que a pessoa confirmou aparece dentro do diálogo, não aqui.
- `.panel-box` e `.panel-row` (`main.scss`): a caixa de toda lista, tabela e cartão do painel, e as linhas à mesma distância da borda (`space-4`).
- `.book-grid` (`main.scss`): a grade dos cartões de livro, a mesma no catálogo, em Meus livros e no esqueleto de carregamento.
- `ConfirmModal`: diálogo de confirmação. O foco começa em "Cancelar", Tab fica dentro, Esc fecha e o foco volta ao botão que abriu; o erro aparece dentro do diálogo.
- `AppDrawer`: a moldura do FilterDrawer para qualquer painel lateral: ao lado do trilho no desktop, folha de baixo no celular. Trava a rolagem da página enquanto está aberta. Fecha por "Fechar", pelo fundo, por Esc, pelo Voltar e, no celular, arrastando a alça ou o cabeçalho para baixo (`useSheetDrag`). Hoje é usada pela gaveta de filtro, pelo formulário do livro e pelas seções das áreas no celular.
- `SectionHeader` e `BookFormDrawer`: servem o painel, o perfil e a página do livro.
- `ListTabs`: abas que trocam de lista, com a lista na URL (`?lista=`), setas, Home e End, e contagem opcional. Aba troca de lista; pílula (`FilterChip`) filtra dentro dela. Hoje: Autores e gêneros no painel e as prateleiras de Meus livros.
- `useDialogFocus` e `useLoadMore`: foco de diálogo e "Ver mais" com a quantidade na URL, os mesmos em todas as telas.

`PanelPagination` saiu na fatia 7, e o "Ver mais" passou a valer no app inteiro ([ListFooter](componentes/ListFooter.md)).

## Pastas (`src/components/`)

Cada componente mora na pasta de quem o usa, como em `views/`:

- `ui/`: peças sem assunto, usadas por mais de uma área (botão, campo, aviso, estado vazio, chip, diálogo).
- `books/`: peças de livro que mais de uma área usa (cartão, capa, formulário do livro).
- `catalog/`, `admin/`: o que só as telas daquela área usam, inclusive as peças da página do livro em `catalog/`.

Quando um componente passa a servir outra área, ele sobe para `books/` ou `ui/`.

## Molduras (`src/layouts/`)

Cada pasta do `src` guarda uma coleção só. Os esqueletos de tela e as peças que só eles usam
ficam em `layouts/`, não em `components/`:

- `ReadingLayout`: a moldura de leitura (catálogo, livro, Meus livros, login). Traz trilho
  (`AppSidebar`, com `UserMenu`), topo (`AppHeader`), o `<main>` que rola e o "Voltar ao topo"
  (`BackTop`).
- `AreaLayout`: a moldura das áreas de cuidar, com barra, seções e pé (`AreaWho` diz quem é você).
  Duas áreas usam: `ClubPanelLayout` (Painel do clube) e `AccountLayout` (Minha conta). A lista de seções e
  o pé são o `AreaSections`, o mesmo na lateral do desktop e na gaveta do celular. No celular, um botão com o
  nome da seção atual abre a gaveta de baixo (a mesma do Filtrar), com os grupos, quem é você, "Sair da conta"
  e a outra área.
- `AuthLayout`: a moldura de entrar (login e callback), só com a barra da marca.
- O `App.vue` só escolhe a moldura pela rota (`meta.frame`: `area`, `auth` ou nenhuma, que é a de leitura).

No pé das áreas (na lateral ou na gaveta), o link para a outra área fica sempre no mesmo lugar, por último. "Sair da conta"
fica acima dele, com ícone e separado por uma linha: no mesmo ponto em que o painel leva a Minha
conta, a conta nunca desloga.

## Aviso rápido

`AppToast`, montado uma vez no `App.vue`, e `useToast().show(texto)` para qualquer tela. Um aviso por vez (o novo substitui o anterior), some sozinho em 3,5 s e fica em uma região `aria-live` que já existe antes da mensagem, para o leitor de tela anunciar. Aviso com ação (como "Recarregar" na versão nova) continua sendo banner, não toast.

O toast é só para sucesso. Os usos de hoje:
- "Link copiado. É só colar na conversa." (Compartilhar);
- "Nome salvo.", "Catálogo atualizado." e o vínculo feito ou desfeito (Minha conta);
- `"X" adicionado.`, `Renomeado para "X".` e `"X" removido.` (Autores e gêneros e Livros do painel);
- "O nível de X agora é Y." (Membros) e "Permissões de Y salvas." (Permissões).

O formulário do livro é a exceção de sucesso: a gaveta continua aberta, então "Livro atualizado." aparece no rodapé dela. Erro nunca vai para o toast; vai para o `AppNotice` ou para o diálogo.

## O que não é componente

Prateleiras, a faixa de relacionados e o cabeçalho de resultado são composições de
`BookCard` mais um cabeçalho de seção. Não precisam de abstração própria; se virarem uma,
vão acumular props para cobrir casos que não existem.

## Uma regra que vale para todos

Nenhum componente aceita cor por prop. A cor vem do token, e o gênero do livro é que
escolhe a tinta da capa. Um `color="blue"` em qualquer assinatura é o começo do fim da
regra de que azul quer dizer clicável.

## Link dentro de texto

Azul sozinho não basta quando o link está no meio de uma frase: quem não distingue a cor, ou
lê numa tela ruim, vê só texto. Link dentro de texto corrido usa o mixin `text-link`
(`abstracts/_a11y.scss`): azul de ação, sublinhado e foco visível. Hoje: os links de fonte
do formulário de livro, "Vincular meu nome" em Meus livros e gênero e formato na ficha do livro.

Link de ação com ícone (voltar, ver todos, onde encontrar) não leva sublinhado: o ícone e a
posição já dizem que é clicável.

## Nenhum valor solto

Todo valor visual vem de token (`src/assets/scss/themes/_ecos.scss`): cor, raio, tamanho e
peso de fonte, entrelinha, espaçamento de letra, margem, espaço interno, vão, largura, altura,
posição e colunas de grade. Os breakpoints de `@media` são variáveis SCSS
(`abstracts/_breakpoints.scss`), porque media query não lê variável CSS.

O `yarn lint` falha com arquivo e linha quando um componente escreve valor cru, inclusive
dentro de `calc()` ou `rgb()`. Isso vale também para:
- camada (`z-index`), afastamento do foco, sublinhado, duração de transição e animação, e sombra;
- o `font` abreviado, o `font: { … }` aninhado e variável `$` local, que esconderiam um valor da checagem;
- porcentagem, que só vale onde uma fração da caixa faz sentido (largura, altura, posição, base de flex, círculo de 50%).

Faltou um token? Ele entra no tema, com nome de papel (`--row-min`, `--layer-drawer`), nunca de valor.
Espessura de borda, de contorno de foco e de anel fino (até 3px) e `transform` de animação ficam fora
da checagem. O que precisa de valor cru por natureza mora nos abstracts, como o mixin `visually-hidden`
(`abstracts/_a11y.scss`).

## Chamadas à API

Toda chamada passa por uma função do `useApi` (`src/composables/useApi.ts`), que monta endereço e
cabeçalho, marca o erro para o Sentry e devolve a mensagem da API. O ESLint recusa `fetch` em qualquer
outro arquivo. A tela chama a função e mostra o erro com `errorText`.

## Revisão de 2026-09-27 (fatia 8)

**Peso destrutivo.** `AppButton variant="danger"`: fundo `bg-surface`, borda `danger-line`, texto `danger-ink`; hover com fundo `danger-soft`. Nunca fundo cheio. Tokens novos no tema:

```
--danger-ink:  #A3322B;  /* 6,9:1 sobre branco, 6,0:1 sobre danger-soft */
--danger-soft: #FBEDEC;
--danger-line: #C98078;  /* 3,1:1 sobre branco: limite de contorno de controle */
```

É o peso de toda ação sem volta: remover livro, autor, gênero, formato ou subgênero; desfazer vínculo; limpar os dados do aparelho. No `ConfirmModal` destrutivo não existe primário azul.

**"Fechar" de gaveta e folha.** Tom `neutral` do `BasePill` (branco, borda `border-strong`), não `bg-sunken` sem borda: aquele é o visual de desabilitado.

**Sombra é para o que flutua.** Separação entre áreas no fluxo continua sendo borda fina, nunca sombra. O que fica **sobre** o conteúdo usa elevação, porque é assim que se lê "está por cima":

| Token | Onde |
| --- | --- |
| `--shadow-default` | Voltar ao topo |
| `--shadow-lg` | listas suspensas, `InfoTip`, busca, toast |
| `--shadow-xl` | `ConfirmModal`, aviso de versão nova |

`--shadow-sm` não tem uso e não deve ganhar um: se algo no fluxo parece pedir sombra, o que falta é borda.

**Caixa de marcar: exceção documentada.** Marcada, a caixa (e o rádio) é preenchida com `action` e tique branco. É a única exceção à regra "azul cheio só em botão", e é de propósito: é a convenção de todo celular e navegador, e para quem não é nativo digital reconhecer vale mais que a pureza da regra. A regra continua valendo para áreas: chip, linha e item selecionados usam `action-soft` com borda.

**Largura nas áreas.** Em Minha conta e nas seções de formulário do painel, o conteúdo tem largura máxima: `--form-max` para campos, `--text-column` para linhas de escolha com contagem ou ação à direita. Tabela de várias colunas usa a largura toda.

**Acento da voz (8g).** Uma segunda cor, que nunca clica. Tokens novos no tema, ao lado dos `--alert-*`:

```
--voice-soft: #FBEFF4;  /* fundo do monograma */
--voice-line: #EFCADB;  /* borda do monograma */
--voice-mark: #C25E88;  /* estrela e ícone: 4,0:1, só objeto gráfico */
--voice-ink:  #8A3A5C;  /* texto: 7,4:1 sobre branco, 6,6:1 sobre voice-soft */
```

Três lugares, e mais nenhum: a estrela do Favorito do clube (`CoverBlock`), o monograma de pessoa do clube (`UserAvatar kind="pessoa"`) e o rótulo do eco da semana (`EcoCard`). Sempre do tamanho do objeto: nenhum fundo, faixa ou borda de bloco em rosa, e nunca em botão, link, chip ou item selecionado. Medido nas telas do estudo: 0,1% da área, contra 1,1–1,7% de azul. Passou de 1% em uma tela, virou tema. O vermelho destrutivo fica a 28° de matiz do rosa: os dois não dividem tela.
