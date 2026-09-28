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

Revisão das telas depois da fatia 7, triada pelo dono item a item. Entra aqui só o que foi aprovado. As correções vêm na ordem de gravidade, e dá para abrir um PR por grupo (8a a 8f) sem que um espere o outro. O 8c não tem migração: usa os campos que já existiam.

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
- **Sem coleção nova.** A proposta de uma coleção `Pessoa` ficou de fora: a estrutura que já existia resolve (dono). Nomes novos no banco seguem em inglês.

**Quem faz o quê, pela matriz de Permissões.** Recurso novo **Vínculo** (`claim`):

| Ação | Chave | Padrão |
| --- | --- | --- |
| **Vincular a própria conta a um nome do grupo** (Vínculo · Editar) | `claim: update` | Administrador e Editor; Visitante presente e desligado |
| **Incluir um nome novo de pessoa do clube**, o "Outro nome" (Vínculo · Criar) | `claim: create` | só Administrador |
| **Escolher quem mencionou**, ao adicionar ou editar | segue `books: create/update` | Administrador e Editor, em uma lista |

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

**Livro aberto no celular.** As pílulas do topo (formato e gênero) somem no celular: repetem os links da ficha logo abaixo e empurram o conteúdo. No desktop elas ficam, como atalho para o catálogo filtrado. A capa continua em largura cheia; o comentário abaixo da dobra é aceito (dono, 2026-09-27: capa e dados lado a lado não se sustentam sem saber a largura da tela).

### 8f · Capas e sinopses pela matriz de Permissões

Hoje há dois caminhos para buscar capa e dados, com regras diferentes:
- no formulário do livro, **Buscar capa e dados** segue `books: update`, então Editor já pode e Visitante não;
- a seção **Capas e sinopses** do painel (buscar para o acervo inteiro e ver o histórico) está presa ao Administrador no código: `adminRoute` no front e `adminOnly` em `/admin/books/enrich*` na API.

A seção passa a seguir a matriz, como o Vínculo (8c): recurso novo `enrichment` (Capas e sinopses), ação `update`, com padrão **Administrador e Editor**. O Visitante fica de fora pelo padrão. A rota do front usa a matriz de `users/me` em vez de `adminRoute`, e as rotas `/admin/books/enrich*` saem do `adminOnly` geral do router de admin e passam a exigir `authorize('enrichment', 'update')`. O Histórico de vínculos continua só do Administrador.

Na matriz, a linha em frase é **"Buscar capas e dados para o acervo inteiro"**.

Aceite: Editor abre Capas e sinopses e roda a busca; Visitante não vê a seção nem consegue chamar a rota; tirar a permissão do Editor em Permissões esconde a seção sem deploy.

### O que ficou de fora, de propósito

- **Capa carregando com título e sem "sem capa".** Não é bug: é o estado de carregamento, e o `@error` troca para "sem capa" quando a imagem falha.
- **Pílula "Livro" no livro aberto (desktop).** Fica: é link para o catálogo filtrado, não selo de formato.
- **Sombra em "Voltar ao topo".** Fica, e a regra foi corrigida: sombra é para o que flutua sobre o conteúdo (ver `COMPONENTES.md`).
- **Caixa de marcar em azul cheio.** Fica, como exceção documentada (ver `COMPONENTES.md`).

---

## Fora do plano, de propósito

**Tema escuro.** Não foi desenhado. Se for preciso, é trabalho novo — não uma inversão automática destas cores.

**Tablet, detalhe no celular e folha de filtro do celular.** Os artboards existem mas só foram repintados, não refeitos: ainda têm livros inventados e o cartão com título duplicado. Refaça o desenho antes de codar essas três telas.

As três já foram codadas (fatias 3 a 5), a partir das regras em texto e não desses artboards. Refazer o desenho agora serve para conferir o código, não para liberar a construção.

**Rotação das prateleiras.** A ideia é boa e não tem regra ainda. Prateleira que muda sozinha faz o membro procurar na semana seguinte o recorte que viu e não achar. Só entra com um critério que o recorte possa dizer em voz alta.
