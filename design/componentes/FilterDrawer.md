# FilterDrawer

Uma gaveta que abre **sobre** o catálogo, com véu por baixo. Não é coluna fixa: coluna fixa cobra largura da grade em toda tela para servir uma ação que acontece de vez em quando.

Largura `drawer-width` (388px no desktop). No celular a mesma coisa sobe de baixo, em tela cheia.

O botão do rodapé diz o resultado antes de fechar — **"Ver 25 livros"** —, então ninguém aplica um filtro e descobre o vazio depois.

## Um só mecanismo

Toda linha da gaveta é uma caixa de marcar. A versão com interruptor para formato foi um erro duplo: dois mecanismos no mesmo painel, e a polaridade invertida ("Esconder do catálogo" com o interruptor ligado significando escondido, ao lado da instrução "desligue aqui").

O grupo de formato hoje se chama **"O que você quer ver"**, com Livro, Mangá e HQ marcados por padrão; desmarcar é que esconde. E quando alguma coisa está escondida, o cabeçalho do resultado diz em texto quantos livros ficaram de fora e por quê.

## Regras

Grupos na ordem: Gênero, Tamanho, O que você quer ver, Quem mencionou. Cada linha tem `touch-min` de altura e a contagem em `ink-muted`. Listas longas mostram os seis primeiros e um link "Mostrar as outras 8 pessoas".

O que está aplicado aparece como chip removível **junto do resultado**, fora da gaveta.

"Limpar os filtros", nunca "Limpar tudo" — "tudo" soa como apagar a conta.

## O que o consumidor fornece

As contagens reais por opção, e o total que restaria. Um filtro sem contagem faz o membro clicar para descobrir que não tem nada.
