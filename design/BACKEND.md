# O que muda no servidor

Começa pela notícia boa: **quase nada**. Busca, filtro, ordenação, "ver mais", abertura do livro, os estados vazios e as prateleiras acontecem todos sobre a lista que `GET /books` já entrega inteira e o Pinia guarda. 87 itens em memória é o que torna isso possível, e é por isso que o redesign do catálogo não precisa de endpoint novo.

## 1. O campo fantasma sai do tipo

```ts
// src/types/index.ts
quem_user_id?: { _id: string; name: string; avatar_url?: string }
//                                          ^^^^^^^^^^^^^^^^^^^^
```

`avatar_url` nunca teve valor: não há upload, não há Gravatar, não há nada gravando esse campo. Ele existe só no tipo, e por isso o desenho antigo do filtro mostrava rosto de quem mencionou — um rosto que nunca ia aparecer.

Tire o campo do tipo. Onde havia avatar, a interface mostra o **nome**, que é verdade. Se um dia houver foto, o campo volta junto com o upload que o preenche.

## 2. Preferência de formato em `users/me`

A pessoa desmarca "Mangá" em **O que você quer ver** e isso vale em todos os aparelhos, sem remarcar. É o único estado novo que precisa persistir:

```
GET  /users/me        → { ..., hidden_midias: ["Mangá"] }
PATCH /users/me       ← { hidden_midias: ["Mangá"] }
```

Aplicado no cliente, sobre a lista já carregada. O servidor guarda, não filtra — filtrar no servidor quebraria o cache do Pinia e obrigaria a recarregar a cada mudança de preferência.

## 3. O que **não** precisa de migração

Eu tinha previsto no inventário um script para tirar "Mangá" e "HQ" de `categoria`, supondo que `midia` e `categoria` estivessem brigando. **O catálogo real não tem essa colisão**: os 87 livros usam os dois eixos direito — `midia` é Livro (67), Mangá (15) ou HQ (5), e `categoria` é um dos nove gêneros. Não rode migração nenhuma. Se aparecer um registro fora disso no futuro, é validação de entrada, não migração.

## 4. Painel do clube: fica e melhora

A tela de permissões continua, e é para ela existir que o painel existe: a alternativa é editar papel de membro direto no banco, às cegas. O painel ganha o visual novo e mantém paginação numerada — é o único lugar do produto que conta páginas, porque quem administra conta e quem lê não.

## 5. Autenticação

Entrada por link mágico (Supabase), sem senha. O texto de erro **"Falha ao verificar o token"** que aparece hoje no callback precisa virar linguagem de gente: *"Esse link expirou. Mandamos outro para o seu e-mail."* com o botão de reenviar ao lado. Um link mágico expirado é o caso normal, não uma falha do sistema.

## 6. Dados que faltam, e o que fazer com eles

Do acervo real: 18 livros sem `cover_url`, 23 sem `page_count`, 10 sem `published_year`, 18 sem `porque`, e os 87 com a **mesma** data de entrada (vieram de uma importação só).

Nada disso é bug e nada disso deve ser preenchido com valor inventado. O servidor devolve o campo ausente; a interface já sabe o que dizer em cada caso (veja `COPY.md`). A única coisa que a ausência da data de entrada proíbe é ordenar por "mais recentes" — o campo só passa a significar alguma coisa depois da primeira adição feita pelo site.

## 7. Filtro por URL

Os filtros viram query no catálogo (veja `IA.md`). As rotas `/midia/:slug`, `/categoria/:slug`, `/autor/:slug` e `/mencao/:slug` ganham redirect permanente para a query equivalente: elas já circularam no grupo e não podem quebrar.
