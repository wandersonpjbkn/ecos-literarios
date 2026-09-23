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
/?tamanho=desconhecido             → sem número de páginas anotado (23 dos 87)
/?busca=kafka                      → busca no título, no autor e no que a pessoa escreveu (`porque`)
/?ordem=titulo|pessoa|genero       → ordenação
```

`autor` e `subgenero` entraram depois do estudo: `/autor/:slug` precisava de destino para o redirect, e o filtro de subgênero que o app já tinha continua valendo. Os valores da query casam com o dado pelo mesmo slug que a `FilterView` usa hoje, senão `/categoria/nao-ficcao` não encontra "Não Ficção".

Motivos para ser query e não rota: o filtro é combinável (gênero + pessoa + tamanho ao mesmo tempo, o que a rota por slug nunca permitiu), continua compartilhável por URL, e some a duplicação de tela.

`FilterView.vue` é deletado. Os links antigos ganham um redirect permanente para a query equivalente, porque já foram mandados no grupo: `/midia/:slug` vai para `?midia=`, `/categoria/:slug` para `?genero=`, `/autor/:slug` para `?autor=` e `/mencao/:slug` para `?quem=`.

`BookDetailDrawer.vue` (a espiada lateral aberta pelo botão de informação do cartão) também sai. Era o segundo destino do mesmo livro; com o cartão virando um link só, o livro abre em `/livro/:id` e em nenhum outro lugar.

## Rotas que ficam

`/livro/:id` continua. Foi a decisão consciente: um livro tem endereço próprio, é o que se manda no WhatsApp, e o painel lateral sozinho não dava isso.

## O que muda na ordenação

O padrão vira **Título (A–Z)**. "Mais recentes" sai: os 87 livros compartilham a mesma data de importação, então a ordem "recente" é arbitrária e a promessa é falsa. Cronologia volta quando existir a primeira adição feita pelo site, e aí o rótulo é "Adicionados depois da importação".

As opções são: Título (A–Z), Por quem mencionou, Por gênero — os únicos eixos com dado real e variado.

## Estado do catálogo

Tudo continua acontecendo sobre a lista que `GET /books` já entrega inteira e o Pinia guarda: busca, filtro, ordenação, "ver mais", abertura do livro e os estados vazios. 87 itens em memória é o que permite filtrar sem ida ao servidor, e é o motivo de nada disso precisar de endpoint novo.
