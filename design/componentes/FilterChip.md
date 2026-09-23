# FilterChip

O filtro rápido, acima da grade, e a etiqueta do que está aplicado.

Selecionado é `action-soft` com borda `action-line` e texto `action-hover` — **nunca** azul preenchido, que é do botão. A contagem ao lado do rótulo vai em `ink-muted`: ela é o que decide o clique ("Poesia 1" avisa que não vale a pena) e por isso não pode ser mais clara que isso.

O chip que já está aplicado ganha um X e vira o jeito de tirar o filtro. Ele fica junto do resultado, não dentro da gaveta: quem quer desfazer está olhando para a lista, não para o painel.

## Regras

Altura `touch-min`. Pílula (`radius-pill`) — é o que separa filtro de botão à primeira vista.

No máximo cinco ou seis chips visíveis, e o resto atrás do botão de filtrar. O catálogo chegou a ter doze pessoas mais dez gêneros mais dois controles em cima da grade: 24 alvos antes do primeiro livro.

Rótulo na afirmativa. "Sem mangá" é um estado do resultado; "Esconder mangá" num controle cuja marcação significa mostrar é a contradição que confundiu o painel inteiro.

## O que o consumidor fornece

`<a href>` quando o filtro muda a URL — e ele deve mudar, para o membro poder voltar. `<button>` quando não muda.
