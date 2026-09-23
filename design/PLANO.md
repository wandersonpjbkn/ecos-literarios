# Ordem de execução

Sete fatias. Cada uma entrega sozinha, roda em produção sem as seguintes, e cabe numa revisão de código de verdade. Não faça duas ao mesmo tempo.

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

O painel Adicionar, as prateleiras, a nova Meus livros e a Conta entram na fatia em que fizerem mais sentido ou numa fatia final depois da 7. O que cada fatia deixa pendente se decide no começo dela, não antes.

---

## Fora do plano, de propósito

**Tema escuro.** Não foi desenhado. Se for preciso, é trabalho novo — não uma inversão automática destas cores.

**Tablet, detalhe no celular e folha de filtro do celular.** Os artboards existem mas só foram repintados, não refeitos: ainda têm livros inventados e o cartão com título duplicado. Refaça o desenho antes de codar essas três telas.

**Rotação das prateleiras.** A ideia é boa e não tem regra ainda. Prateleira que muda sozinha faz o membro procurar na semana seguinte o recorte que viu e não achar. Só entra com um critério que o recorte possa dizer em voz alta.
