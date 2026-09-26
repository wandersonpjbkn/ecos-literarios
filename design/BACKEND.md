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

## 2. Preferência de formato em `users/me`

A pessoa desmarca "Mangá" em **O que você quer ver** e isso vale em todos os aparelhos, sem remarcar:

```
GET  /users/me        → { ..., hidden_midias: ["Mangá"] }
PATCH /users/me       ← { hidden_midias: ["Mangá"] }
```

O `PATCH /users/me` já existe no `ecos-api`, mas hoje só aceita `name` e responde 400 sem ele. A mudança é estender a rota: `hidden_midias` opcional, validado contra os formatos que existem, e `name` deixa de ser obrigatório. O campo também entra no model `User`.

Até a fatia 7 a preferência fica guardada no aparelho (fatia 4); na fatia 7 ela passa a ir para `users/me`, levando junto o que já estava salvo localmente.

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

## 2c. De onde veio o livro

`GET /books` e `GET /books/:id` trazem `origem: "conversa" | "site"`, calculado no servidor pelo usuário da migração do CSV. A tela do livro diz "Veio da conversa do grupo no WhatsApp" só quando é verdade; o cliente não adivinha por data nem por id.

## 3. O que **não** precisa de migração

Eu tinha previsto no inventário um script para tirar "Mangá" e "HQ" de `categoria`, supondo que `midia` e `categoria` estivessem brigando. **O catálogo real não tem essa colisão**: os livros usam os dois eixos direito — `midia` é Livro (67), Mangá (15) ou HQ (5), e `categoria` é um dos nove gêneros. Não rode migração nenhuma. Se aparecer um registro fora disso no futuro, é validação de entrada, não migração.

## 4. Painel do clube: fica e melhora

A tela de permissões continua, e é para ela existir que o painel existe: a alternativa é editar papel de membro direto no banco, às cegas. O painel ganha o visual novo e mantém paginação numerada — é o único lugar do produto que conta páginas, porque quem administra conta e quem lê não.

## 5. Autenticação

Entrada por link mágico (Supabase), sem senha. Um link vencido é o caso normal, não uma falha do sistema (fatia 6):

- O callback não sabe se o link venceu ou se é inválido, então diz "Não deu pra entrar com esse link. Ele pode ter vencido." em vez de afirmar "expirou".
- O e-mail que pediu o link fica guardado no aparelho (`localStorage`, porque o link abre numa aba nova) por no máximo 1 hora, a validade do link. Ele é apagado quando o login dá certo ou quando o reenvio é usado. Com ele, a tela oferece **Mandar outro link para fulano@…** e **Usar outro e-mail**; sem ele, **Pedir outro link**.
- "Mandamos outro link" só aparece depois que o reenvio foi feito de verdade. O sistema não manda sozinho.
- Quando o link funcionou mas a plataforma não respondeu, o callback diz isso e não pede outro link (veja `COPY.md`).
- Mensagens do servidor que chegam à tela seguem o `COPY.md`: sessão vencida é "Sua sessão venceu. Entre de novo.", falta de permissão é "Você não tem permissão para isso."

## 6. Dados que faltam, e o que fazer com eles

No levantamento feito para o estudo: 18 de 87 livros sem `cover_url`, 23 sem `page_count`, 10 sem `published_year`, 18 sem `porque`, e todos os importados com a **mesma** data de entrada (vieram de uma importação só). Os números mudam com o acervo; que sempre vai faltar algo em parte dele, não.

Nada disso é bug e nada disso deve ser preenchido com valor inventado. O servidor devolve o campo ausente; a interface já sabe o que dizer em cada caso (veja `COPY.md`). A única coisa que a ausência da data de entrada proíbe é ordenar por "mais recentes" — o campo só passa a significar alguma coisa depois da primeira adição feita pelo site.

## 7. Filtro por URL

Os filtros viram query no catálogo (veja `IA.md`). As rotas `/midia/:slug`, `/categoria/:slug`, `/autor/:slug` e `/mencao/:slug` ganham redirect permanente para a query equivalente: elas já circularam no grupo e não podem quebrar.
