# O que muda no servidor

Começa pela notícia boa: **quase nada**. Busca, filtro, ordenação, "ver mais", abertura do livro, os estados vazios e as prateleiras acontecem todos sobre a lista que `GET /books` já entrega inteira e o Pinia guarda. Ter o acervo inteiro em memória é o que torna isso possível, e é por isso que o redesign do catálogo não precisa de endpoint novo.

## 1. O campo fantasma sai do tipo

```ts
// src/types/index.ts
quem_user_id?: { _id: string; name: string; avatar_url?: string }
//                                          ^^^^^^^^^^^^^^^^^^^^
```

`avatar_url` nunca teve valor: não há upload, não há Gravatar, não há nada gravando esse campo. Ele existe só no tipo, e por isso o desenho antigo do filtro mostrava rosto de quem mencionou — um rosto que nunca ia aparecer.

Tire o campo do tipo. Onde havia avatar, a interface mostra o **nome**, que é verdade. Se um dia houver foto, o campo volta junto com o upload que o preenche.

**Feito na fatia 7:** saiu do tipo no front, do model `User` e dos dois `populate` de `/books`. Documentos antigos que ainda tenham o campo não vazam na resposta.

## 2. Preferência de formato em `users/me`

A pessoa desmarca "Mangá" em **O que você quer ver** e isso vale em todos os aparelhos, sem remarcar:

```
GET  /users/me        → { ..., hidden_midias: ["Mangá"] }
PATCH /users/me       ← { hidden_midias: ["Mangá"] }
```

O `PATCH /users/me` já existe no `ecos-api`, mas hoje só aceita `name` e responde 400 sem ele. A mudança é estender a rota: `hidden_midias` opcional, validado contra os formatos que existem, e `name` deixa de ser obrigatório. O campo também entra no model `User`.

Até a fatia 7 a preferência fica guardada no aparelho (fatia 4); na fatia 7 ela passa a ir para `users/me`, levando junto o que já estava salvo localmente.

**Como ficou (fatia 7):**

```
POST  /auth/verify   → { user: { …, hidden_midias? } }
GET   /users/me      → { user: { …, hidden_midias? }, permissions: { books: ["create", "read", …], … } }
PATCH /users/me      ← { name?, hidden_midias? }   → o usuário, com a lista guardada
```

- **Ausente não é vazio.** Sem `hidden_midias`, a conta nunca escolheu. `[]` quer dizer "não escondo nada", e isso também é uma escolha.
- **Formato que não existe mais** (renomeado ou removido) é descartado, não recusado. A resposta traz a lista guardada, e o aparelho adota essa lista. Assim uma escolha antiga nunca trava a sincronia.
- **A escolha do aparelho tem dono:** a conta que estava dentro quando ela foi feita, ou ninguém, se foi feita fora da conta.
- **Ao entrar,** a conta que nunca escolheu herda a escolha do aparelho só se for dela; escolha de outra conta ou feita fora da conta não sobe, e a conta começa sem nada escondido. Se a conta já escolheu, a conta vale. A exceção é uma mudança feita neste aparelho que ainda não chegou à conta: ela fica guardada com a conta a que pertence e sobe primeiro. Pendência de outra conta nunca é mandada para esta.
- **Ao sair,** a escolha fica no aparelho, com o mesmo dono.
- **Nível e identidade** (`_id`, nome, e-mail, nível) vêm do `users/me` a cada sessão, não só do login: uma promoção vale na próxima visita, e uma conta recriada com outro `_id` não fica com o antigo.
- **Salvar:** vários cliques seguidos viram um save só, e os saves vão um de cada vez.
- **`permissions`** é a matriz do próprio nível, lida da coleção `Permission`. O painel esconde o que o nível não pode fazer; quem decide cada pedido continua sendo o servidor.

Aplicado no cliente, sobre a lista já carregada. O servidor guarda, não filtra — filtrar no servidor quebraria o cache do Pinia e obrigaria a recarregar a cada mudança de preferência.

## 2b. "Quero ler" e "Lido"

O `COPY.md` e o `IA.md` contam com os dois botões ("Guardar em Quero ler", "Marcar como lido") e com Meus livros mostrando o que a pessoa guardou. Nada disso existe hoje, nem no cliente nem na API, e vai ser implementado. É estado por pessoa que precisa persistir, então o contrato (onde o dado mora, quais rotas, o que vê quem não entrou na conta) é proposto e aprovado antes da fatia 5, que é onde os botões aparecem.

**Contrato aprovado (fatia 5):**

```
GET    /users/me/reading          → [{ book_id, status, updated_at }]     (só a própria pessoa)
PUT    /users/me/reading/:bookId  ← { status: "quero_ler" | "lido" }      (grava ou troca)
DELETE /users/me/reading/:bookId  → 204                                  (tira da lista; repetir não dá erro)
GET    /books/:id/reading         → { quero_ler: N, lido: M }            (público, só totais)
```

- Coleção `ReadingStatus` (usuário, livro, estado, data), com índice único por pessoa e livro: **um estado por livro**; marcar como lido tira de "Quero ler".
- Quem não entrou vê os botões; o clique leva ao login e o link mágico volta para o livro (só caminhos internos).
- Sem internet ou com a plataforma fora, os botões desligam junto com "Adicionar" (escrita).
- Apagar um livro apaga as marcações dele.
- A tela Meus livros mostrando essas listas fica para depois (tela sem fatia).

## 3. O que **não** precisa de migração

Eu tinha previsto no inventário um script para tirar "Mangá" e "HQ" de `categoria`, supondo que `midia` e `categoria` estivessem brigando. **O catálogo real não tem essa colisão**: os livros usam os dois eixos direito — `midia` é Livro (67), Mangá (15) ou HQ (5), e `categoria` é um dos nove gêneros. Não rode migração nenhuma. Se aparecer um registro fora disso no futuro, é validação de entrada, não migração.

## 4. Painel do clube: fica e melhora

A tela de permissões continua, e é para ela existir que o painel existe: a alternativa é editar papel de membro direto no banco, às cegas. O painel ganha o visual novo. A paginação numerada, prevista aqui, saiu na fatia 7: o painel usa o mesmo "Ver mais" do resto do app (`componentes/ListFooter.md`).

## 5. Autenticação

Entrada por link mágico (Supabase), sem senha. Um link vencido é o caso normal, não uma falha do sistema (fatia 6):

- O callback não sabe se o link venceu ou se é inválido, então diz "Não foi possível entrar com esse link. Ele pode ter vencido." em vez de afirmar "expirou".
- O e-mail que pediu o link fica guardado no aparelho (`localStorage`, porque o link abre em uma aba nova) por no máximo 1 hora, a validade do link. Ele é apagado quando o login dá certo ou quando o reenvio é usado. Com ele, a tela oferece **Enviar outro link para fulano@…** e **Usar outro e-mail**; sem ele, **Pedir outro link**.
- "Enviamos outro link" só aparece depois que o reenvio foi feito de verdade. O sistema não envia sozinho.
- Quando o link funcionou mas a plataforma não respondeu, o callback diz isso e não pede outro link (veja `COPY.md`).
- Mensagens do servidor que chegam à tela seguem o `COPY.md`: sessão vencida é "Sua sessão venceu. Entre de novo.", falta de permissão é "Você não tem permissão para isso."
- **Token recusado (401):** toda chamada passa pelo `apiFetch`. O token vem do Supabase, que renova o que está para vencer. Um 401 renova uma vez, e as chamadas que falharam juntas dividem essa renovação; cada uma é reenviada uma vez. Renovação recusada, ou token novo recusado de novo, encerra a sessão. Sem internet ou com o Supabase fora, a sessão fica.
- **Sessão encerrada sem "Sair"** (renovação recusada, conta bloqueada, saída em outra aba): aparece "Sua sessão venceu. Entre de novo." e, em página que exige login (`meta.signedIn`), a pessoa vai para o login com o caminho de volta. No catálogo, ela fica onde está.

## 6. Dados que faltam, e o que fazer com eles

No levantamento feito para o estudo: 18 de 87 livros sem `cover_url`, 23 sem `page_count`, 10 sem `published_year`, 18 sem `porque`, e todos os importados com a **mesma** data de entrada (vieram de uma importação só). Os números mudam com o acervo; que sempre vai faltar algo em parte dele, não.

Nada disso é bug e nada disso deve ser preenchido com valor inventado. O servidor devolve o campo ausente; a interface já sabe o que dizer em cada caso (veja `COPY.md`). A única coisa que a ausência da data de entrada proíbe é ordenar por "mais recentes" — o campo só passa a significar alguma coisa depois da primeira adição feita pelo site.

## 7. Filtro por URL

Os filtros viram query no catálogo (veja `IA.md`). As rotas `/midia/:slug`, `/categoria/:slug`, `/autor/:slug` e `/mencao/:slug` ganham redirect permanente para a query equivalente: elas já circularam no grupo e não podem quebrar.

## 8. Níveis e pessoas do clube (fatia 8)

- **Rótulo, não chave.** `viewer` passa a aparecer como **Visitante**. A chave da API, o enum e a coleção `Permission` não mudam.
- **Vínculo vira permissão.** Recurso novo `claim` em `RESOURCES` e em `CONFIGURABLE` (`create`, `update`). Semente padrão: `update` para Administrador e Editor, `create` só para Administrador, nada para Visitante. `POST` e `DELETE /users/me/claim` exigem `claim: update`. A semente do boot insere as linhas novas sem tocar nas que já existem.
- **Quem mencionou, sem coleção nova.** Um livro é creditado a uma conta (`quem_user_id`) ou a um marcador sem dono (`quem_nome`). Livro novo sem escolha sai creditado a quem cadastra, e `quem_nome` deixa de ser obrigatório. `utils/bookPerson.ts` decide:
  - marcador existente (pela normalização dos slugs) mantém a grafia e o dono;
  - grafia quase igual é recusada (409);
  - nome novo exige `claim: create` e não pode repetir um marcador nem o nome de uma conta que já vinculou; o nome de uma conta que ainda não vinculou vira marcador, que ela pode vincular depois.
- **`GET /books/people`** (`books: create`) devolve, para o campo "Mencionado por", as contas que já vincularam um nome e os marcadores ainda sem vínculo. A conta que ainda não vinculou fica de fora, para não aparecer duas vezes ao lado do próprio marcador; se o livro já estiver creditado a ela (ou for um livro novo, que começa creditado a quem cadastra), o formulário mostra esse valor atual mesmo assim.
- **`GET /users/me`** devolve `claim_match`: o marcador sem dono com o nome da conta, para o "É você?" do formulário. Só vem para quem tem `claim: update`.
- **Desfazer o vínculo** solta só os livros do marcador reivindicado; livro creditado direto à conta continua dela.
- **Capas e sinopses vira permissão.** Recurso novo `enrichment` (`update`), padrão Administrador e Editor. `/admin/books/enrich`, `/status` e `/history` saem do `adminOnly` do router de admin e passam a exigir `authorize('enrichment', 'update')`. O `/books/:id/enrich` do formulário continua em `books: update`, e o histórico de vínculos continua só do Administrador.
- **Remover um livro** apaga as marcações de leitura dele (já é assim, §2b); o texto da confirmação passa a dizer isso.

## 9. Suspender e remover contas

Só o Administrador, e nunca na própria conta. Como só um Administrador com acesso chega a essas rotas, sempre sobra pelo menos um.

```http
PATCH  /users/:id/status  ← { status: "active" | "suspended" }  → o membro, com o estado
DELETE /users/:id                                                → { removed, books }
```

- **Suspender** vale na hora: toda requisição da conta recebe 403 com `code: "account_suspended"`, e o Supabase recusa entrar e renovar o token (`ban_duration`). Reativar desfaz os dois. A conta, os livros e a lista de leitura continuam.
- **Remover** apaga a conta no Supabase e no `ecos-api`. Os livros ficam: os creditados à conta ganham o nome dela como marcador (`quem_nome`), e os de um nome vinculado voltam para esse nome. A lista de leitura e o histórico de vínculo continuam. A pessoa pode voltar pelo mesmo e-mail, como Visitante nova.
- **Conta nova só com conta real no Supabase:** no primeiro acesso, a API confirma que a conta existe antes de criá-la. O token de uma conta removida ainda vale por até 1 hora e não pode trazê-la de volta.
- **Token:** a API exige `aud = authenticated`, o `iss` do projeto e um e-mail.
- **No front:** a conta suspensa sai da sessão com "Esta conta está suspensa." e vai para o catálogo se estiver numa página com login. O Supabase envia o link mágico mesmo para a conta suspensa e só o recusa quando ele é usado (`user_banned`): o callback mostra a mesma frase, sem oferecer outro link. Em Membros, "Gerenciar acesso" abre a linha com suspender ou reativar e remover, cada um com confirmação, e a conta suspensa leva a etiqueta âmbar "suspensa".
- **Chaves:** a API usa a secret key (`SUPABASE_SECRET_KEY`) só no servidor, para o admin do Auth; o front e o keepalive usam a publishable key.

## 10. O catálogo no aparelho

O aparelho guarda **uma** cópia do catálogo (`books`, com a hora em que veio da API) para mostrar na hora e sem internet. Ela nunca vence e nunca é a verdade: a cada visita o app pergunta à API se mudou.

- **Como:** `GET /books` vai com `cache: 'no-cache'`, e a API responde com `ETag` e `Cache-Control: no-cache`. O próprio navegador manda o `If-None-Match`; catálogo sem mudança volta `304`, sem corpo, e o navegador entrega a cópia que já tinha. Medido na API real: 55 KB comprimido quando muda, 0 bytes de corpo quando não muda.
- **Quando:** ao abrir o app (antes de esperar a sessão, porque o catálogo é público), quando a aba volta a ficar visível depois de 10 minutos, quando a conexão volta, e depois de uma mudança feita no próprio aparelho. Uma busca em andamento serve a todos que pedirem ao mesmo tempo.
- **Plataforma fora ou sem internet:** a cópia continua na tela, e o aviso diz de quando ela é ("a lista de ontem").
- **O que decide uma ação vem da API, nunca da cópia:** os nomes livres para vincular (`available_names` em `GET /users/me/claim`) e quantos livros perdem um subgênero antes de removê-lo (`GET /subgeneros/:id/usage`).
- **Por que não um prazo:** o antigo cache de 7 dias (com uma segunda cópia sem prazo nenhum) escondia livro novo, edição, remoção e vínculo feitos em outro aparelho. A revalidação custa uma requisição de cabeçalhos por visita; no plano grátis do Render (5 GB/mês de saída) isso não chega perto do limite.
- **Se o clube crescer muito:** o `304` ainda consulta o banco para calcular a `ETag`. Uma versão do catálogo, incrementada a cada escrita, responderia `304` sem ler os livros.

## 11. Capa e dados (fatia 9)

A busca deixa de depender de um livro salvo e deixa de gravar sozinha. Quem grava é o formulário, com os valores que a pessoa conferiu. Com isso, "o que é gravado é o que foi visto" vale por construção.

### Busca nova

```http
POST /books/enrich/search   ← { title, author, isbn? }
                            → { source: "google_books" | "open_library", candidates: [...] }
```

- Exige `books: create` **ou** `books: update` (quem cadastra e quem edita). Mantém o `enrichmentRateLimit`.
- Até 5 candidatos (`maxResults=5` no Google, `limit=5` na Open Library). Cada um: `volume_id`, `title`, `authors`, `publisher`, `published_year`, `page_count`, `language`, `synopsis`, `cover_url`, `isbn`.
- `language`: o Google devolve `volumeInfo.language` (código de duas letras); a Open Library, uma lista de códigos de três letras. O servidor devolve o código; o front mostra o nome ("Português").
- Ordem das estratégias como hoje: ISBN (só se veio na consulta), título e autor em português, título e autor sem idioma, e a Open Library como reserva. Devolve os candidatos da primeira estratégia que achar algo.
- `isbn` na consulta vem só do que a pessoa digitou. O ISBN que veio de uma busca anterior não é usado como chave (ver `isbn_source`).

### O que sai

- `POST /books/:id/enrich` e `POST /books/:id/enrich/apply`. Só o `useBookEnrichment` usava as duas.
- A busca em lote: `POST /admin/books/enrich`, `GET /admin/books/enrich/status`, `GET /admin/books/enrich/history`, o modelo `EnrichmentRun` e o recurso `enrichment` (em `RESOURCES`, `CONFIGURABLE` e na semente). A seção 8 deixa de valer no item "Capas e sinopses vira permissão". A semente do boot apaga as linhas `enrichment` da coleção `Permission`.
- A trava manual: o campo `manually_edited_at` sai do modelo, e `hasEnrichmentEdit` e a parte `enrichmentEdited` de `markBookEdit` saem de `utils/bookEdit.ts`. O histórico de edição (`edit_history`) continua.

### O que entra

- **`isbn_source`** no livro: `"person"`, `"search"` ou ausente. O formulário manda `"search"` quando o ISBN veio da busca e não foi mexido; qualquer ISBN digitado ou alterado à mão vira `"person"`. Se o `PATCH` trouxer um ISBN diferente do salvo sem `isbn_source`, o servidor grava `"person"`. Ausente quer dizer origem desconhecida e conta como não confirmado. Sem migração: os ISBNs já gravados ficam sem origem.
- **`cover_source` vindo do formulário.** Hoje, trocar a capa num `PATCH` grava `"manual"`. Passa a aceitar `"google"` ou `"openlibrary"` no payload quando a capa veio da busca; sem isso, continua `"manual"`.
- **`google_books_id`** vai junto no salvar quando o resultado escolhido veio do Google (o `volume_id`). Serve à atribuição (fatia 9a) e ao "Onde encontrar".

### Atribuição

A página do livro mostra a frase de atribuição quando `cover_source` é `"google"` ou quando existe `google_books_id`. Não precisa de campo novo. A imprecisão é aceita (dono, 2026-10-02): um livro reescrito à mão continua com a frase enquanto tiver `google_books_id`.

**A conferir antes da 9a:** se as diretrizes de marca do Google Books exigem o logo também na página do livro, ou se a frase basta; e a cláusula que diz que os resultados não podem ser alterados, em tensão com "tudo continua editável à mão".
