# FilterDrawer

Uma gaveta que abre **sobre** o catálogo, com véu por baixo. Não é coluna fixa: coluna fixa cobra largura da grade em toda tela para servir uma ação que acontece de vez em quando.

Largura `drawer-width` (388px no desktop). No celular é uma folha que sobe de baixo, com alça e cantos arredondados, deixando o topo da página visível (como no `FilterSheet.mobile`); o botão de fechar diz "Fechar". No celular a ordenação mora dentro da folha, como primeiro grupo, porque a página mostra só a contagem, o botão Filtrar e os chips rápidos.

O botão do rodapé diz o resultado antes de fechar — **"Ver 25 livros"** —, então ninguém aplica um filtro e descobre o vazio depois.

## Ao vivo

Não existe passo de "aplicar". Cada marcação muda a URL e a lista na hora; o botão do rodapé só fecha, e o número nele é o retorno visível enquanto a folha cobre a lista. Esc e "Fechar" mantêm o que foi marcado.

No histórico, a primeira mudança de cada abertura entra como passo novo e as seguintes substituem esse passo, então **um Voltar desfaz a visita inteira à gaveta**. Voltar com a gaveta aberta também a fecha; aberta, ela continuaria substituindo o passo para onde o Voltar levou.

As caixas são desenhadas (`AppCheck`) sobre a caixa nativa transparente: o navegador cuida de clique, teclado e leitor de tela, e não pinta a caixa do seu jeito.

## Um só mecanismo

Toda linha da gaveta é uma caixa de marcar. A versão com interruptor para formato foi um erro duplo: dois mecanismos no mesmo painel, e a polaridade invertida ("Esconder do catálogo" com o interruptor ligado significando escondido, ao lado da instrução "desligue aqui").

O grupo de formato hoje se chama **"O que você quer ver"**, com Livro, Mangá e HQ marcados por padrão; desmarcar é que esconde. E quando alguma coisa está escondida, o cabeçalho do resultado diz em texto quantos livros ficaram de fora e por quê.

## Regras

Grupos na ordem: Gênero, Subgênero, Tamanho, O que você quer ver, Quem mencionou. Subgênero entrou depois do estudo e fica junto do eixo que refina. Tamanho tem quatro faixas: menos de 200, de 200 a 500, mais de 500 e "Não sabemos quantas páginas". Cada linha tem `touch-min` de altura e a contagem em `ink-muted`. Listas longas mostram os seis primeiros e um link "Mostrar as outras 6 pessoas". Subgênero (100 opções) é um campo com autocompletar: ao focar mostra a lista inteira numa caixa com rolagem, e digitar filtra por início de palavra ("ro" acha "romântico", não "horror"); o que foi escolhido vira chip acima do campo.

Com algum filtro aplicado, os chips aplicados tomam o lugar dos chips rápidos na página; as duas fileiras nunca aparecem juntas.

O que está aplicado aparece como chip removível **junto do resultado**, fora da gaveta.

"Limpar os filtros", nunca "Limpar tudo" — "tudo" soa como apagar a conta.

## O que o consumidor fornece

As contagens reais por opção, e o total que restaria. Um filtro sem contagem faz o membro clicar para descobrir que não tem nada.
