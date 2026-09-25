# Arquitetura de informação

## O diagnóstico, em uma frase

O app tem cinco superfícies de navegação, duas interfaces de filtro e dois destinos diferentes para o mesmo livro. O redesign tem três destinos e três superfícies.

## Os três destinos

| Destino | Rota | O que é |
| --- | --- | --- |
| Catálogo | `/` | A raiz. A grade de livros abre a página; abaixo dela, na mesma rolagem, vêm as prateleiras. **Não existe uma "home" separada.** |
| Meus livros | `/perfil/livros` | O que a pessoa mencionou e o que ela guardou. |
| Adicionar | painel sobre o catálogo | Não é página: é um painel. Ao salvar, abre o livro recém-criado. |

A conta (`/perfil/conta`) fica no avatar, no fim do trilho. O painel do clube (`/admin`) fica dentro da conta — doze pessoas não precisam de um item de administração fixo na navegação.

## As três superfícies

1. **Trilho** (desktop, 96px) e **TabBar** (celular): os três destinos. Rótulo sempre escrito junto do ícone.
2. **Barra superior**: busca e a ação primária da tela.
3. **Gaveta de filtro**: abre sobre o catálogo, com véu. Não é coluna fixa.

## Rotas que morrem

`/midia/:slug`, `/categoria/:slug`, `/autor/:slug` e `/mencao/:slug` apontam todas para `FilterView.vue`, que é uma segunda implementação do catálogo com outro layout, outro filtro e outra ordenação. Elas viram **estado de query no catálogo**:

```
/                                  → tudo
/?genero=fantasia,suspense         → gênero
/?subgenero=crime                  → subgênero
/?quem=brenda                      → quem mencionou
/?autor=kafka                      → autor
/?midia=livro,hq                   → formato
/?tamanho=curto                    → menos de 200 páginas
/?tamanho=medio                    → de 200 a 500 páginas
/?tamanho=longo                    → mais de 500 páginas
/?tamanho=desconhecido             → "Não sabemos quantas páginas" (23 dos 87)
/?busca=kafka                      → busca no título, no autor, em quem mencionou e no que a pessoa escreveu (`porque`)
/?ordem=recentes|titulo|pessoa|genero → ordenação
```

`autor` e `subgenero` entraram depois do estudo: `/autor/:slug` precisava de destino para o redirect, e o filtro de subgênero que o app já tinha continua valendo. Os valores da query casam com o dado pelo mesmo slug que a `FilterView` usa hoje, senão `/categoria/nao-ficcao` não encontra "Não Ficção".

`?midia=` convive com a preferência "O que você quer ver", guardada no aparelho: quando o link pede um formato, o link vence e a preferência não se aplica àquela vista. Link compartilhado nunca abre vazio.

Motivos para ser query e não rota: o filtro é combinável (gênero + pessoa + tamanho ao mesmo tempo, o que a rota por slug nunca permitiu), continua compartilhável por URL, e some a duplicação de tela.

`FilterView.vue` é deletado. Os links antigos ganham um redirect permanente para a query equivalente, porque já foram mandados no grupo: `/midia/:slug` vai para `?midia=`, `/categoria/:slug` para `?genero=`, `/autor/:slug` para `?autor=` e `/mencao/:slug` para `?quem=`.

`BookDetailDrawer.vue` (a espiada lateral aberta pelo botão de informação do cartão) também sai. Era o segundo destino do mesmo livro; com o cartão virando um link só, o livro abre em `/livro/:id` e em nenhum outro lugar.

## Rotas que ficam

`/livro/:id` continua. Foi a decisão consciente: um livro tem endereço próprio, é o que se manda no WhatsApp, e o painel lateral sozinho não dava isso.

## O que muda na ordenação

O padrão é **Mais recentes**, por `added_at` decrescente, que é a ordem em que a API já entrega a lista. Os 87 livros entraram no mesmo dia, mas cada um tem um `added_at` próprio (a ordem da importação), e todo livro adicionado pela plataforma vai para o topo. Sem ela, some a pista de qual foi o último livro que entrou.

As opções são: Mais recentes, Título (A–Z), Por quem mencionou, Por gênero.

`?ordem=` é gravado sempre que a pessoa escolhe, inclusive "Mais recentes"; sem o parâmetro, vale o padrão.

## O eco da semana

Um cartão de citação na terceira posição da grade (`Main`): o que ficou registrado sobre um livro quando alguém o mencionou, com link para o livro. Ele toma o lugar de um livro na página ("Você está vendo 23 de 87"), mas não entra nas contagens.

- O cartão é sobre a pessoa, não sobre o livro. Ocupa a célula inteira (capa e legenda), com a moldura dos cartões das prateleiras, para não ser lido como livro sem capa. No pé, o título do livro em negrito (é o destino do link) e, embaixo, o avatar com "mencionado por {pessoa}"; sem linha de autor. "Mencionado por" porque é o único fato garantido (`COPY.md`, regra-mãe): há comentários em terceira pessoa ("Favorito da Brenda."), e "citado por {pessoa} em {livro}" faria o comentário parecer trecho do livro. A composição do cartão segue em estudo no Claude Design.
- "Eco" fica: é vocabulário do próprio clube ("Onde as ideias ecoam", descrição do grupo; "que suas ideias ecoem", poema de um ano). Não é jargão para quem chega, é o nome que o grupo já usa.

- Um comentário por semana: sorteado entre os livros com `porque`, estável da segunda ao domingo (semana ISO) e igual para todos. Livro novo com comentário entra no sorteio sozinho.
- Só na vista sem filtro e sem busca; ao lado de uma lista filtrada ficaria fora de contexto. No celular não aparece (`Catalog.mobile`).
- As prateleiras seguem a mesma regra de contexto: só na vista sem filtro; a contagem é a da lista que a prateleira abre (já sem o formato escondido pela preferência), e o formato escondido não ganha prateleira.

## Estado do catálogo

Tudo continua acontecendo sobre a lista que `GET /books` já entrega inteira e o Pinia guarda: busca, filtro, ordenação, "ver mais", abertura do livro e os estados vazios. 87 itens em memória é o que permite filtrar sem ida ao servidor, e é o motivo de nada disso precisar de endpoint novo.
