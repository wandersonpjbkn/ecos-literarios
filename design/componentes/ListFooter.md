# ListFooter

O rodapé de qualquer lista: quanto você está vendo, de quanto, e como ver mais.

A frase é **"Você está vendo 23 de 87"** — completa, com os dois números. "Mostrando os 24 primeiros" não diz primeiros de quê nem quantos faltam, e foi exatamente o que fez alguém achar que o clube tinha 24 livros.

Quando a lista acabou, o botão some e a frase vira "Estes são todos os 25". Uma lista que simplesmente para, sem dizer nada, é lida como coisa quebrada.

## Regras

O mesmo componente no desktop, no tablet e no celular — no celular o botão ocupa a largura toda. Nada de rolagem infinita: a rolagem infinita convivendo com paginação numerada foi um dos problemas do app antigo.

Um padrão só no app inteiro: catálogo, Meus livros e painel do clube usam este rodapé, com lote de 24. Não existe paginação numerada. A decisão está no estudo da fatia 7 (`rca/…-fatia-7-servidor/estudo-paginacao.md`):
- a paginação fez as pessoas verem menos da lista (Baymard);
- quase ninguém usa o número da página;
- em uma lista de trabalho, como "Faltando algo" no painel, cada item corrigido faz a página andar.

Quantos itens estão abertos fica na URL (`?ver=48`): voltar de um livro, recarregar e enviar o link mantêm o lugar. Mudar filtro, busca, ordem ou aba recomeça a lista do topo.

Depois do "Ver mais", o foco vai para o primeiro item que apareceu, e a frase de contagem é anunciada (`aria-live`).

O que escala com o acervo é achar o livro: busca e filtros ficam sempre junto da lista. Cada "Ver mais" envia um evento (`load_more`, com a lista e quantos estão abertos). Se esse dado mostrar gente clicando quatro vezes ou mais na mesma lista, o próximo passo é melhorar a busca e os filtros, não voltar aos números.

## O que o consumidor fornece

`useLoadMore(lista, { name })` entrega os itens visíveis, o total, a próxima leva e o `more`. Cada item da lista leva `data-list-item`, para o foco saber onde ir. Quantos itens estão renderizados, o total e o tamanho da próxima leva. Os três números têm que bater com o que está na tela — o painel de filtro já anunciou "25 livros" enquanto mostrava 20.
