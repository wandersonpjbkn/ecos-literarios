# EmptyState

Tela sem resultado, sem conteúdo ou fora do ar. Três partes, sempre: **o que aconteceu**, **onde o sistema procurou** e **uma saída em botão**.

Dizer onde procurou é o que evita a pergunta seguinte. "Nada encontrado" faz o membro repetir a busca com outras palavras sem saber que o campo já cobria o autor.

A saída é sempre um botão de verdade, nunca um conselho em texto. "Tente outros termos" não é uma saída.

## Variantes

**Busca sem resultado** — repete o termo buscado entre aspas, diz onde procurou, oferece apagar a busca e adicionar o livro.

**Filtro sem resultado** — nomeia a combinação aplicada em português ("Nada de terror mencionado por Natália"; sem artigo de gênero, que o dado não informa) e oferece limpar os filtros.

**Lista própria vazia** — diz o que a lista vai guardar quando tiver algo, e leva ao catálogo.

**Servidor fora / sem internet** — mostra o que estava em cache com a data ("o catálogo de ontem") em vez de tela em branco, e desliga só a escrita.

## Regras

Sem ilustração e sem emoji. Texto centralizado em uma coluna de no máximo 380px. Nunca vermelho: o acervo não ter resultado não é erro de ninguém.

A saída em botão só falta em dois casos, e só neles:
- quando não há ação possível (Membros sem ninguém, Histórico de vínculos vazio);
- quando a única ação já está na tela, logo acima ("Buscar capas e dados", sobre o histórico de buscas vazio).

Um botão repetido ao lado do original dá duas escolhas para uma decisão só.

## Onde mais aparece

É a mensagem centrada do app inteiro, não só do resultado vazio: página não encontrada, sem permissão, catálogo fora do ar (`PageStatus`), link recusado ou reenviado (callback) e "Enviamos o link" (login). O texto aceita um trecho em negrito pelo slot `text` (o e-mail), e o componente expõe `focus()` para levar o leitor de tela até a mensagem quando ela troca o que a pessoa tinha na frente.

## O que o consumidor fornece

O termo ou os filtros aplicados, em texto, para o componente poder repeti-los.
