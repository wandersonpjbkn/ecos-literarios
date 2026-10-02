# Ordem de execução

Sete fatias. Cada uma entrega sozinha, roda em produção sem as seguintes, e cabe em uma revisão de código de verdade. Não faça duas ao mesmo tempo.

## 1 · Tokens e tipografia

Trocar `src/assets/scss/themes/_ecos.scss` pelo arquivo em `tokens/_ecos.scss`. Carregar Figtree. Nada de componente muda de estrutura — só o que já lê `--color-*` passa a ler as cores novas.

Entrega: o app inteiro em azul, com Figtree, funcionando igual.

**A decisão que essa fatia força:** o projeto tem seis temas (`ecos`, `olive`, `gothic`, `purple`, `sunny`, `fiesta`) gerados por `generate-palette`. O sistema novo tem **um acento e um tema**, com valores medidos em vez de derivados. Os outros cinco contradizem a regra de "azul quer dizer clicável" e nunca passaram por verificação de contraste. Ou eles saem, ou viram um enfeite assumido que ninguém garante. Decida antes de codar — não descubra isso na fatia 5.

**Decidido:** os cinco temas saem, junto com o seletor de tema; quem tinha outro tema salvo volta para `ecos`. A fatia também corrige a cor dos componentes que quebram com o tema novo sem mudar a estrutura deles: os ícones do trilho (brancos, sobre um fundo que passa a ser branco), e o texto de `ActiveFilters` e `BrandLogo`, que usavam como cor de texto o token que vira a borda de selecionado.

## 2 · Capa e cartão

`CoverBlock` e `BookCard`, com os três estados de capa e as nove tintas de gênero. É a fatia que mais muda a cara do produto por linha de código.

Cuidado: o cartão mostra o título **uma vez só**, dentro da capa. Autor e "mencionado por" ficam fora do bloco.

O botão de informação do cartão e o `BookDetailDrawer` que ele abria saem aqui: o cartão é um link só, e o livro abre em `/livro/:id`.

Entrega: a grade atual, com o cartão novo.

## 3 · Um destino

Fundir `BooksView` e `FilterView` em uma tela. `FilterView.vue` é deletado; os filtros viram query; as quatro rotas antigas ganham redirect. O trilho passa a ter três destinos, com o estado ativo correto.

É a maior fatia e a mais importante. Faça com os filtros ainda na forma antiga — a gaveta é a fatia seguinte.

A query cobre também `autor`, `subgenero` e `tamanho=desconhecido`, e a busca passa a olhar o que a pessoa escreveu (`porque`). Veja `IA.md`.

Entrega: uma tela de catálogo só, com filtro por URL.

## 4 · Gaveta de filtro

`FilterDrawer` sobre o catálogo, com véu, um mecanismo só (caixa de marcar), contagem por opção e o botão que diz quantos livros restam. Junto: os chips do que está aplicado, ao lado do resultado.

"O que você quer ver" fica guardado no aparelho nesta fatia; vai para `users/me` na fatia 7.

Entrega: filtrar em um lugar só, igual no desktop e no celular.

## 5 · Livro aberto

`/livro/:id` com o novo layout: ficha, `QuoteBlock` (com o estado vazio), compartilhar, onde encontrar, e a faixa de relacionados. Os estados de campo faltando entram aqui. "Guardar em Quero ler" e "Marcar como lido" também, e dependem de estado novo no servidor: o contrato é aprovado antes desta fatia (veja `BACKEND.md`).

Entrega: a tela que o clube mais abre, resolvida.

## 6 · Vocabulário e estados vazios

Varredura de `COPY.md` pelo app inteiro: "mencionado", rótulos de botão, contagens, todos os estados vazios, o texto do link mágico expirado.

Parece cosmético e não é: é a fatia que resolve a reclamação real de um membro ("mas eu não indiquei esse livro").

Entrega: nenhum texto do produto afirmando intenção de ninguém.

## 7 · Servidor

`avatar_url` fora do tipo, `hidden_midias` em `users/me`, painel do clube repaginado. A menor fatia, e ela é por último de propósito: até aqui nada precisou dela, com uma exceção, o estado de "Quero ler" e "Lido", que entra antes da fatia 5. A preferência de formato, guardada no aparelho desde a fatia 4, migra para `users/me`.

## Telas que não têm fatia

O painel Adicionar, as prateleiras, a nova Meus livros e a Conta entram na fatia em que fizerem mais sentido ou em uma fatia final depois da 7. O que cada fatia deixa pendente se decide no começo dela, não antes.

**Onde cada uma entrou (2026-09-27):**

- **Meus livros e Conta:** fatia 7.
- **Prateleiras:** fatia 4, ajustadas na 7; só na vista sem filtro, com a contagem da lista que abrem.
- **Adicionar:** não virou painel sobre o catálogo. Por decisão do dono na triagem 2 da fatia 7, ele leva ao painel do clube (o Visitante não vê o botão; ver fatia 8a). O `IA.md` foi alinhado.

**Artboards atrás do código.** Eles ficam como estão até o dono refazê-los no Claude Design:

- `MeusLivros.html` ainda mostra a origem do livro, que saiu do app;
- `Conta.html` ainda mostra uma página única, sem "Dados salvos" e com "Desfazer" sem confirmação;
- `Indicar.desktop.html` ainda mostra o fluxo em duas etapas e usa "Indicar";
- `Main.html` ainda mostra as notas antigas das prateleiras.

## 8 · Correções da revisão de 2026-09-27

Revisão das telas depois da fatia 7, triada pelo dono item a item. Entra aqui só o que foi aprovado. As correções vêm na ordem de gravidade, e dá para abrir um PR por grupo (8a a 8h) sem que um espere o outro. O 8c não tem migração: usa os campos que já existiam.

### 8a · Níveis e o botão Adicionar

**Visitante, não Membro.** Os membros do clube são Editores; o nível mais baixo existe para quem entrar por um link vazado. Chamá-lo de "Membro" diz o contrário do que ele é. O rótulo de `viewer` passa a ser **Visitante** (`src/data/roles.ts`) e todo texto que dizia "como Membro" acompanha ("Quem entra pelo link do e-mail aparece aqui, como Visitante."). A chave da API continua `viewer`: muda só o que a tela diz.

**Adicionar some para o Visitante.** No topo e no trilho (e na barra de baixo), o Adicionar não aparece para quem não pode criar livro. Estranho não é convidado a adicionar. Para quem **não entrou**, ele continua: quase sempre é alguém do clube num aparelho novo, e o login já volta ao formulário (`?voltar=`). "Sem permissão" continua existindo para quem digitar o endereço do painel.

Aceite: logado como Visitante, nenhum "Adicionar" na tela; deslogado, o Adicionar leva ao login e volta ao formulário.

### 8b · Ações que não têm volta

**Peso destrutivo no botão.** `AppButton` ganha `variant="danger"`: fundo `bg-surface`, borda e texto `danger-ink`, e no hover o fundo vira `danger-soft`. Nunca fundo cheio. O `ConfirmModal` usa esse peso na ação irreversível ("Remover o livro", "Remover o autor", "Desfazer o vínculo"); "Cancelar" continua secundário e com o foco inicial. Um diálogo destrutivo não tem primário azul: o azul chama o Enter e o olho para o que não tem volta.

O texto da confirmação diz o que vai junto: **"O livro sai do catálogo e das listas de quem guardou. Não é possível desfazer."**

**Editar e Remover não ficam colados na linha.** Nas tabelas do painel (Livros, Autores e gêneros) a linha fica só com **Editar**. "Remover" vai para o rodapé da gaveta de edição, separado das ações de salvar, com o peso destrutivo: **"Remover este livro do acervo"**. Metade dos alvos da tela some, e remover vira uma decisão tomada com o livro aberto na frente.

Aceite: nenhum botão azul cheio em diálogo destrutivo; nenhuma linha de tabela com "Remover".

### 8c · Pessoa do clube e "mencionado por"

**O modelo (dono, 2026-09-27).** O acervo começou em uma carga estática, feita antes de existir conta no sistema. O nome que a carga deu a cada pessoa (`quem_nome`, "Brenda") é um **marcador**: guarda o lugar enquanto a pessoa real não entra. Quando entra, ela **vincula** a conta ao marcador, e daí em diante vale a conta. Toda conta é uma pessoa que pode ser creditada, inclusive o Visitante (alguém de fora que sugeriu um livro citado no clube).

- Todo livro tem quem o mencionou: uma **conta** (`quem_user_id`) ou um **marcador** sem dono (`quem_nome`). Não existe livro sem pessoa.
- O nome mostrado é o **atual**: com conta, o nome da conta; sem conta, o marcador. `quem_nome` fica como histórico da carga e não é preenchido em livro novo.
- **Sem coleção nova.** A proposta de uma coleção `Pessoa` ficou de fora: a estrutura que já existia resolve. Quem levantou a dúvida foi o dono ("acho que esse desenho do `pessoa` pode ser volta desnecessária, valida", 2026-09-28); a conclusão veio da validação. Nomes novos no banco seguem em inglês.

**Quem faz o quê, pela matriz de Permissões.** Recurso novo **Vínculo** (`claim`):

| Ação                                                                          | Chave                        | Padrão                                                 |
| ----------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
| **Vincular a própria conta a um nome do grupo** (Vínculo · Editar)            | `claim: update`              | Administrador e Editor; Visitante presente e desligado |
| **Incluir um nome novo de pessoa do clube**, o "Outro nome" (Vínculo · Criar) | `claim: create`              | só Administrador                                       |
| **Escolher quem mencionou**, ao adicionar ou editar                           | segue `books: create/update` | Administrador e Editor, em uma lista                   |

**O que muda.**

1. **Vincular vira permissão.** `POST` e `DELETE /users/me/claim` exigem `claim: update`. A seção "Vincular meu nome" continua aparecendo para toda conta; sem a permissão, no lugar do formulário, ela diz por quê.
2. **"Mencionado por" é uma lista** (`GET /books/people`): todas as contas e os marcadores sem dono, com quem cadastra já escolhido. Sai do texto livre. A última opção, **"Outro nome: {o que foi digitado}"**, só aparece com `claim: create`, e o nome novo não pode repetir um que existe (marcador ou conta), pela mesma normalização dos slugs: "Natalia" não entra se há "Natália"; "Natalia C." entra.
3. **Adicionar não trava ninguém.** O livro sai com quem cadastra. Se existe um marcador sem dono com o nome da conta, o formulário pergunta antes ("É você?"), com **Vincular este nome** e **Não sou eu, continuar**.
4. **Desfazer o vínculo** solta só os livros do marcador; um livro creditado direto à conta continua dela.
5. **O filtro "Quem mencionou"** mostra o nome atual, uma linha por pessoa.

Aceite:

- Sem `claim: update`, a API recusa o vínculo e a seção diz por quê; com o padrão, isso vale para o Visitante.
- Não dá para criar um nome sem "Outro nome", e "Outro nome" só aparece com `claim: create`.
- Livro novo sem escolha sai creditado a quem cadastra.
- Permissões mostra as linhas novas em frase, e mudar a matriz muda o comportamento sem deploy.

### 8d · Números e textos que não batem

**Busca sem resultado.** Com busca ativa, a contagem dos chips rápidos é a da busca, não a do acervo inteiro. Chip com zero some; se a busca não achou nada, a fileira de chips some junto. O "0 de 87" sai de dentro do campo de busca: ele já está ao lado de "Catálogo".

**Entrar.** Antes de enviar: **"Coloque seu e-mail e nós enviamos um link para você entrar. Não é preciso senha."** ("a gente" e "mandar" saem do produto, dono 2026-09-27) Depois de enviar, o bloco de introdução some e fica só a mensagem "Enviamos o link", com duas saídas:

- **Usar outro e-mail** (fantasma), que volta ao campo já preenchido;
- o reenvio, que durante a espera não é botão cinza desabilitado: é texto em `ink-muted`, **"Você pode pedir outro link em 59 segundos"**, e vira o botão **Enviar outro link** quando pode.

**Permissões.** Cada linha diz o que controla, em frase: "Membros: Ver" vira **"Ver a lista de membros"**. O que não é configurável aparece como linha fixa, para ninguém ler a matriz como completa: **"Mudar o nível de alguém: só Administrador (não muda aqui)"**.

**Meus livros.** "mencionado por {nome}" sai dos cartões: é a lista da própria pessoa, a linha repetia o mesmo nome em todos. O cartão fica com título e autor. Em Meus livros, o "19 livros" ao lado do título sai: o chip "Todos 19" já diz.

### 8e · Molduras e formas

**Largura das áreas.** O conteúdo de Minha conta e das seções de formulário do painel ganha largura máxima (`--form-max`, 480px, para campos; `--text-column`, 760px, para linhas de escolha como "O que você quer ver" e "Vincular meu nome"). Tabelas de várias colunas continuam na largura toda. "Livro" e "67 no catálogo" não podem ficar a 1000px um do outro.

**Dados salvos.** Cada ação vira uma linha com a sua consequência, e "Limpar" deixa de ter o peso de "Recarregar":

- **Recarregar o catálogo** (secundário) · "Baixa o catálogo de novo. Você continua na conta."
- **Limpar os dados deste aparelho** (destrutivo, com confirmação) · "Sai da conta e baixa o catálogo de novo. Sua escolha de formatos fica."

**"Fechar" das gavetas e folhas.** Hoje é uma pílula `bg-sunken` sem borda, o mesmo visual de botão desabilitado. Passa a usar o tom `neutral` do `BasePill` (branco, borda `border-strong`, texto `ink`), igual ao secundário.

**Livro aberto no celular.** As pílulas do topo (formato e gênero) somem no celular: repetem os links da ficha logo abaixo e empurram o conteúdo. No desktop elas ficam, como atalho para o catálogo filtrado. A capa continua em largura cheia; o comentário abaixo da dobra é aceito. Capa e dados lado a lado não se sustentam sem saber a largura da tela.

### 8f · Capas e sinopses pela matriz de Permissões

Hoje há dois caminhos para buscar capa e dados, com regras diferentes:

- no formulário do livro, **Buscar capa e dados** segue `books: update`, então Editor já pode e Visitante não;
- a seção **Capas e sinopses** do painel (buscar para o acervo inteiro e ver o histórico) está presa ao Administrador no código: `adminRoute` no front e `adminOnly` em `/admin/books/enrich*` na API.

A seção passa a seguir a matriz, como o Vínculo (8c): recurso novo `enrichment` (Capas e sinopses), ação `update`, com padrão **Administrador e Editor**. O Visitante fica de fora pelo padrão. A rota do front usa a matriz de `users/me` em vez de `adminRoute`, e as rotas `/admin/books/enrich*` saem do `adminOnly` geral do router de admin e passam a exigir `authorize('enrichment', 'update')`. O Histórico de vínculos continua só do Administrador.

Na matriz, a linha em frase é **"Buscar capas e dados para o acervo inteiro"**.

Aceite: Editor abre Capas e sinopses e roda a busca; Visitante não vê a seção nem consegue chamar a rota; tirar a permissão do Editor em Permissões esconde a seção sem deploy.

### 8g · Acento da voz

**O pedido (dono, 2026-09-30, palavras dele).** "sistema ainda podia melhorar a palheta de cores, hoje, ela só tem o azul; mas algumas telas que não tem capa e coisas assim, fica bem 'plain' (sem graça) só com azul e cinza [...] a identidade da marca carrega duas cores, não teria mesmo como espandir a palheta?"

**A proposta (estudo do Claude Design, 2026-10-01; trazida para esta pasta a pedido do dono; ainda não implementada).** O sistema ganha uma segunda cor, um rosa do outro lado do logo, que **nunca clica** e marca o que é do clube, não da interface. Capa, moldura e blocos ficam como estão. Estudo e medição no canvas, linha "Cor · um acento que não clica".

Argumento do estudo, não do dono: a cor nova não entra na página sem capa, porque ali o que falta é a capa, e enfeitar o vazio esconderia isso.

**Tokens.** `--voice-soft`, `--voice-line`, `--voice-mark` e `--voice-ink` entram no tema (`src/assets/scss/themes/_ecos.scss`), no bloco de `:root[data-theme='ecos']` ao lado dos `--alert-*`. Valores e contrastes em `tokens/tokens.json` e em `COMPONENTES.md`.

**Onde entra, e só aí.**

1. **`UserAvatar` ganha `kind`** (`pessoa` | `conta`, padrão `pessoa`). Pessoa: fundo `voice-soft`, borda `voice-line`, inicial em `voice-ink`, peso 700. Conta: o neutro de hoje. `UserMenu` passa `kind="conta"`; `EcoCard` e `ClaimNameSection` ficam no padrão. É papel, não cor: nada de `color` por prop.
2. **Página do livro:** o monograma de pessoa (26px) entra antes de "mencionado por", na mesma linha. O nome continua `RouterLink` azul.
3. **`EcoCard`:** o rótulo "O eco da semana" passa a `voice-ink` com o ícone de conversa (14px, traço 2) em `voice-mark` antes dele. Moldura e fundo do cartão não mudam.

A estrela do Destaque do clube usa os mesmos tokens, mas depende de dado novo: está na 8h.

**O que não muda.** `BookCard` continua sem avatar. A régua do `QuoteBlock` continua `action-line` (a troca por `voice-line` foi sugerida e não adotada). Nenhum botão, link, chip ou estado selecionado em rosa.

Aceite:

- Monograma rosa no eco da semana, em "Vincular meu nome" e ao lado de "mencionado por" na página do livro; neutro no menu da conta.
- Rótulo do eco em `voice-ink` com o ícone; cartão do eco igual ao de hoje no resto.
- `yarn lint` passa sem valor cru: tudo pelos tokens novos.
- Nenhum outro elemento em rosa (busca por `--voice-` mostra só `UserAvatar`, `EcoCard` e, depois da 8h, `CoverBlock`).

### 8h · Destaque do clube

Recurso novo, pedido na lista de melhorias ("livros em destaque/estrela"). Visual e regra decididos; o formato do dado é proposta.

**Visual (decidido).** No `CoverBlock`, canto superior esquerdo (o direito é do selo de formato): na grade, círculo branco de 28px com borda `border-hair` e estrela cheia de 15px em `voice-mark`, `role="img"` e `aria-label="Destaque do clube"`; na página do livro, a pílula branca com a estrela e **"Destaque do clube"** em `voice-ink`, `caption` 600. Ver `componentes/CoverBlock.md`.

**Decidido (dono, 2026-10-01).** O nome é **Destaque do clube**, não "Favorito". Nas palavras dele: "favorito dá a impressão de ser o wishlist ou favoritos que vemos em websites por aqui: você, o usuário do sistema, pode marcar um livro como 'favorito'; e não é isso!" e "é para quem cadastrou o livro poder dizer para o resto do clube - ou para quem acessar o catalog - 'olha, esse livro foi uma sensação de leitura!'".

1. **Quem marca:** Administrador e Editor. Matriz de Permissões, recurso `destaques`, ação `update`, padrão **Administrador e Editor**. Linha em frase: **"Marcar um livro como destaque do clube"**.
2. **Filtro:** entra, como caixa de marcar na gaveta (**"Só destaques do clube"**), não como chip rápido.

Hoje três livros já carregam essa distinção e são os primeiros a marcar: **A hora da estrela** (leitura difícil que a mídia trata como culta e ninguém do clube captou; o choque virou piada interna), **Nunca minta** (virou favorito da galera) e **O pequeno príncipe** (a discussão sobre a morte, ou não, do pequeno príncipe no fim).

**Dado (proposta).** `Book.destaque: { por: user_id, em: Date } | null`. Marcar e desmarcar entram no histórico, como o vínculo. `PATCH /books/:id/destaque` com `authorize('destaques', 'update')`.

Aceite: marcar no formulário do livro mostra a estrela na grade e a pílula na página; quem não tem a permissão não vê o controle e a API recusa; a estrela nunca encobre o selo de formato.

## 9 · Capa e dados

Redesenho da busca de capa e dados, a partir do estudo de 02/10/2026. O problema: quem cadastra não descobre a busca, e quem a encontra depois esbarra em dois jeitos de salvar, na edição errada e numa recusa sem saída. Daqui em diante os livros entram um a um, pelo cadastro e pela edição, então esse caminho precisa ser simples e guiado. Especificação em `componentes/LinhaCapaEDados.md`, `componentes/VistaBusca.md`, `BACKEND.md` §11 e `COPY.md` ("Capa e dados"). Telas em `telas/capa-e-dados/`.

Um PR por fatia, nesta ordem. A 9a e a 9b não dependem de nada e podem ir antes. Fora do escopo, de propósito: corrigir os dados já gravados no acervo pela busca antiga (corrige-se caso a caso) e qualquer envio ou hospedagem de capa (fica o campo de endereço).

### 9a · Atribuição na página do livro

A página do livro já mostra capa e sinopse vindas do Google Books, sem atribuição. Uma frase no rodapé da página, com o texto de `COPY.md`, quando `cover_source` é `"google"` ou o livro tem `google_books_id`.

Antes de começar: ler as diretrizes atuais de marca do Google Books e confirmar se a frase basta ou se o logo também é exigido aqui.

Aceite: livro com capa do Google mostra a frase; livro com capa manual e sem `google_books_id` não mostra.

### 9b · Cadastro duplicado

Tocar de novo em "Adicionar o livro" nos 800 ms antes de a gaveta fechar cadastra o livro duas vezes: `isSaving` volta a `false` no `finally`. O botão continua desabilitado até a gaveta fechar.

Aceite: dois toques rápidos geram um livro só.

### 9c · Adicionar abre onde a pessoa está

Hoje "Adicionar" navega para o Painel do clube (`useAddTarget` aponta para `admin-books`), que troca a moldura inteira, e a pessoa fica lá depois de salvar. Passa a abrir a gaveta por cima da tela atual, e salvar devolve a pessoa a ela. A gaveta sai de dentro do `AdminBooks` e passa a ser montada uma vez, no app.

O pedido continua sobrevivendo ao login: a URL de volta carrega `?adicionar=1` na rota em que a pessoa estava, não no painel. O "Adicionar esse livro" da busca vazia do catálogo leva o termo digitado para o título (hoje se perde; no painel, já funciona).

Aceite: do catálogo, da página de um livro e de Meus livros, adicionar não muda de tela; deslogado, o login volta para a mesma tela com a gaveta aberta; a busca vazia preenche o título.

### 9d · Servidor

`BACKEND.md` §11: a busca nova por título e autor, com até 5 candidatos e o idioma; o fim de `/books/:id/enrich` e `/apply`; o fim de `manually_edited_at`; `isbn_source`; `cover_source` vindo do formulário. A busca em lote **não** sai aqui (é a 9h): os dois caminhos convivem até a vista nova existir.

Aceite: a busca responde sem livro salvo; um livro com páginas editadas à mão aceita capa da busca no salvar seguinte; ISBN com origem `search` não é usado como chave.

### 9e · Voltar em níveis e confirmação ao fechar

`useBackCloses` ganha uma pilha: só o nível mais recente responde ao `popstate`. Hoje, com duas instâncias ativas, um voltar fecha as duas (cada uma escuta `popstate` em `window`), e fechar o nível de dentro pelo botão chama `history.back()`, o que fecha a gaveta junto.

Fechar a gaveta com dados preenchidos pede confirmação. Vale para toda saída que fecha a gaveta: Fechar, Cancelar, tocar fora, arrastar para baixo e o voltar do sistema no nível do formulário. "Preenchido" é qualquer diferença em relação ao que abriu, inclusive dados escolhidos na busca. No voltar do sistema, a entrada do histórico já foi consumida quando o diálogo aparece: se a pessoa ficar, ela é devolvida. O `ConfirmModal` ganha `cancelLabel` ("Continuar preenchendo"); o foco inicial fica nele.

Aceite: com a vista aberta, o voltar do sistema volta ao formulário sem fechar a gaveta; com algo digitado, qualquer saída pergunta; "Continuar preenchendo" mantém tudo e o voltar seguinte continua funcionando; sem nada digitado, fecha direto.

### 9f · A vista de busca

`componentes/VistaBusca.md`: V1 a V5, a consulta aberta, o V3 com campos já preenchidos desmarcados e o ISBN listado, o logo "powered by Google" no V2 quando a fonte for o Google (arquivo oficial das diretrizes de marca), as duas colunas no computador, o foco e a transição entre vistas. "Usar estes dados" devolve valores; não grava.

Aceite: o resultado em inglês mostra "Inglês"; a sinopse aparece inteira no V3; um campo já preenchido chega desmarcado; tudo desmarcado desabilita "Usar estes dados" e diz por quê; o leitor de tela anuncia "3 livros encontrados".

### 9g · A linha no formulário

`componentes/LinhaCapaEDados.md`: L0 a L4, no fim do essencial, largura inteira no computador. Sai o `BookEnrichmentPanel` e o aviso "Depois de salvar o livro…". Os valores que voltam da vista entram nos campos do formulário e vão no mesmo salvar, com `isbn_source`, `cover_source` e `google_books_id` quando for o caso.

Aceite: no cadastro, a linha aparece antes de salvar e o botão habilita ao preencher título e autor; escolher e salvar grava capa e dados num salvar só; "Desfazer" esvazia só o que veio da busca; na edição de um livro sem capa, a linha diz o que falta.

### 9h · Fim da busca em lote

Sai a seção "Capas e sinopses" do Painel do clube (`AdminEnrichment`, a rota e o item da lateral), a linha de Permissões e, no servidor, o que `BACKEND.md` §11 lista em "O que sai". Supera a fatia 8f. Quem cuida do acervo encontra livros sem capa pelo "Faltando algo" do painel e completa pela edição (L4).

Aceite: nenhuma tela, rota ou permissão de busca em lote; a matriz de Permissões não mostra mais a linha.

### O que ficou de fora, de propósito

- **Capa carregando com título e sem "sem capa".** Não é bug: é o estado de carregamento, e o `@error` troca para "sem capa" quando a imagem falha.
- **Pílula "Livro" no livro aberto (desktop).** Fica: é link para o catálogo filtrado, não selo de formato.
- **Sombra em "Voltar ao topo".** Fica, e a regra foi corrigida: sombra é para o que flutua sobre o conteúdo (ver `COMPONENTES.md`).
- **Caixa de marcar em azul cheio.** Fica, como exceção documentada (ver `COMPONENTES.md`).

---

## Fora do plano, de propósito

**Tema escuro.** Não foi desenhado. Se for preciso, é trabalho novo — não uma inversão automática destas cores. Os quatro `voice-*` vão precisar de par escuro próprio.

**Tablet, detalhe no celular e folha de filtro do celular.** Os artboards existem mas só foram repintados, não refeitos: ainda têm livros inventados e o cartão com título duplicado. Refaça o desenho antes de codar essas três telas.

As três já foram codadas (fatias 3 a 5), a partir das regras em texto e não desses artboards. Refazer o desenho agora serve para conferir o código, não para liberar a construção.

**Rotação das prateleiras.** A ideia é boa e não tem regra ainda. Prateleira que muda sozinha faz o membro procurar na semana seguinte o recorte que viu e não achar. Só entra com um critério que o recorte possa dizer em voz alta.
