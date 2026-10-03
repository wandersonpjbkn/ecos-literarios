# VistaBusca

A busca de capa e dados, aberta pela `LinhaCapaEDados`. Não é outra gaveta: troca o conteúdo da mesma gaveta, e voltar devolve o formulário como estava.

## Topo e rodapé

No topo, duas linhas no celular: em cima, **Voltar** à esquerda (sobe um nível) e **Fechar** à direita, no mesmo lugar em que fica no formulário (fecha a gaveta); embaixo, o título. No computador cabem na mesma linha: Voltar e título à esquerda, Fechar à direita. Os dois levam ícone e texto, como todo botão do sistema.

Rodapé só onde existe ação que o topo não oferece: no V3. Nenhum "Voltar ao livro" no rodapé; o topo e o voltar do sistema já fazem isso.

## Estados

| Estado | Mostra | Ações | Voltar leva a |
| --- | --- | --- | --- |
| V1 · Buscando | "Buscando por {título}, de {autor}", "Buscando…" em `role="status"` e três cartões vazios | Nenhuma | Formulário |
| V2 · Resultados | A consulta resumida, "{n} livros encontrados" em `role="status"`, o logo "powered by Google" ao lado da contagem quando a fonte for o Google, e até 5 resultados | Tocar num resultado; "Mudar a busca" | Formulário |
| V2 · Consulta aberta | Título, autor e ISBN (opcional) editáveis, acima dos resultados | "Buscar de novo" | Formulário |
| V3 · Conferir | O livro escolhido, a sinopse inteira e "O que entra no livro" | "Usar estes dados" (primária) e "Escolher outro" (secundária) | V2 |
| V4 · Nada encontrado | Que nada foi achado e o que tentar; a consulta aberta | "Buscar de novo" (primária, é a única ação) | Formulário |
| V5 · Busca indisponível | Aviso em `alert-*`: a busca não respondeu, tentar em alguns minutos, o cadastro continua possível | "Tentar de novo" | Formulário |

Abrir a vista já é o pedido: ela busca na hora com o título e o autor do formulário.

## O resultado (V2)

Um `<button>` por resultado, o cartão inteiro clicável: capa 56 × 84, título, autor, editora e ano, e o idioma como selo de texto ("Português", "Inglês"). O idioma distingue edições sem depender de cor. O título nunca é cortado: quebra linha. Em séries (HQ, mangá), o número do volume costuma estar no título, e é ele que separa um resultado do outro. No computador, os resultados ficam em duas colunas.

## A conferência (V3)

Capa, título, autor, editora, ano, páginas e idioma no topo; depois a sinopse inteira, porque uma sinopse de outro livro da mesma série só se percebe lendo. Depois, "O que entra no livro": uma linha por campo (capa, sinopse, editora, ano, páginas, ISBN), cada uma com caixa de marcar.

- Campo vazio no livro: entra marcado.
- Campo já preenchido: aparece com o valor atual e o novo, e entra **desmarcado**. Nada que alguém escreveu é substituído sem que a pessoa marque.
- Tudo desmarcado: "Usar estes dados" fica desabilitado, com uma frase dizendo por quê.

"Usar estes dados" preenche os campos do formulário e volta ao formulário em L2. Não grava nada.

No computador, o V3 tem duas colunas: o livro e a sinopse à esquerda, "O que entra no livro" à direita. O rodapé alinha à direita, secundária antes da primária, como o formulário.

## Voltar, foco e movimento

O voltar do sistema sobe um nível: V3 → V2 → formulário → fecha a gaveta. Exige a pilha de níveis do `useBackCloses` (fatia 9e).

Ao entrar na vista, o foco vai para o título dela. Ao voltar de V3 para V2, para o resultado que tinha sido escolhido. Ao voltar ao formulário, para o botão da linha.

Toda troca de vista tem transição que mostra a hierarquia (entrar desliza para dentro, voltar desliza para fora). Com `prefers-reduced-motion`, a troca é direta; o título continua dizendo onde a pessoa está.

## O que o consumidor fornece

A consulta inicial (título, autor), os campos que o livro já tem com seus valores, e o retorno com os campos marcados.

Telas: `design/telas/V1` a `V5`, `V2-aberta`, `Desk-V2`, `Desk-V3`.
