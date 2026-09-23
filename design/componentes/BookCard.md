# BookCard

A célula da grade. Três informações, uma vez cada: **título** (dentro da capa), **autor**, **quem mencionou**.

Essa é a correção mais importante do sistema. A versão anterior punha título e autor dentro do bloco de capa *e* embaixo dele — quatro linhas por cartão, 24 cartões por tela, e a grade ficava ilegível.

Não há avatar de quem mencionou. O campo `avatar_url` existe no tipo do projeto mas nunca teve valor; a interface mostra o nome, que é verdade.

## Regras

Largura da coluna pela grade (seis colunas no desktop, duas no celular), capa em 212px de altura no desktop. `space-5` de gutter horizontal, `space-5 + 10px` de vertical — a linha extra é para o texto abaixo da capa não colar na capa de baixo.

O cartão inteiro é um `<a>` único, com `aria-label` trazendo o título completo. Dois links dentro do mesmo cartão (um no título, outro na pessoa) dobram o número de paradas do Tab sem dobrar a utilidade.

Autor em `ink-2`, uma linha, com reticências. Quem mencionou em `ink-muted`, `caption`. O selo de formato, quando há, mora na capa e não se repete embaixo.

## O que o consumidor fornece

Título, autor, gênero, formato, nome de quem mencionou e a URL da capa quando existir. Todos os quatro últimos podem faltar, e o cartão continua correto.
