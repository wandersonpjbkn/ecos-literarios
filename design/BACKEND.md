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
- **Ao entrar,** a conta que nunca escolheu herda a escolha do aparelho; senão, a conta vale. A exceção é uma mudança feita neste aparelho que ainda não chegou à conta: ela fica guardada com a conta a que pertence e sobe primeiro. Pendência de outra conta nunca é mandada para esta.
- **Ao sair,** a escolha fica no aparelho.
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
  - nome novo exige `claim: create` e não pode repetir um marcador nem um nome de conta.
- **`GET /books/people`** (`books: create`) devolve as contas e os marcadores sem dono, para o campo do formulário.
- **`GET /users/me`** devolve `claim_match`: o marcador sem dono com o nome da conta, para o "É você?" do formulário. Só vem para quem tem `claim: update`.
- **Desfazer o vínculo** solta só os livros do marcador reivindicado; livro creditado direto à conta continua dela.
- **Capas e sinopses vira permissão.** Recurso novo `enrichment` (`update`), padrão Administrador e Editor. `/admin/books/enrich`, `/status` e `/history` saem do `adminOnly` do router de admin e passam a exigir `authorize('enrichment', 'update')`. O `/books/:id/enrich` do formulário continua em `books: update`, e o histórico de vínculos continua só do Administrador.
- **Remover um livro** apaga as marcações de leitura dele (já é assim, §2b); o texto da confirmação passa a dizer isso.
