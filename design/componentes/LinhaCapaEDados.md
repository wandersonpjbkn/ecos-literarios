# LinhaCapaEDados

A porta para a busca de capa e dados dentro do formulário do livro. Não é um campo: é um cartão que diz o que a busca traz e leva à `VistaBusca`.

O estudo de 02/10/2026 mostrou que ninguém achava a busca: no cadastro ela era só um aviso ("Depois de salvar…"), e na edição ficava dentro de "Mais sobre o livro", fechado justamente no livro vazio. A linha resolve isso ficando sempre visível e sempre no mesmo lugar.

## Onde fica

No fim do essencial, depois de Comentário e antes de "Mais sobre o livro". Nunca no meio dos campos: abrir outra vista no meio do preenchimento interrompe a tarefa (dono, 2026-10-02). No celular fica abaixo da dobra; aparece quando a pessoa termina o essencial, logo antes de salvar. No computador, ocupa a largura inteira da grade, como o Comentário.

## Regras

Cartão com borda `border-hair`, `radius-lg`, padding `space-4`, fundo `bg-surface`. À esquerda, a miniatura da capa (48 × 72, `radius-sm`): tracejada com ícone de livro quando não há capa, a capa (ou a tinta do gênero) quando há. Título em `ui` ("Capa e dados") com "(opcional)" em `ink-muted`; frase de apoio em `caption`.

O botão é sempre secundário. A ação primária da gaveta continua sendo salvar. Não há duas terciárias.

## Estados

| Estado | Quando | Mostra | Ações |
| --- | --- | --- | --- |
| L0 | Título ou autor vazios | O que falta para buscar | "Buscar capa e dados" desabilitado (`aria-disabled`, ligado ao texto por `aria-describedby`), no mesmo lugar em que fica habilitado. Nada muda de posição ao habilitar |
| L1 | Título e autor preenchidos, nada escolhido | O que a busca traz | "Buscar capa e dados" abre a vista |
| L2 | Um resultado foi escolhido e ainda não salvo | Miniatura da capa escolhida e o que entra no livro ao salvar | "Trocar" (secundária, reabre a vista) e "Desfazer" (terciária, esvazia o que veio da busca) |
| L3 | Edição de livro com capa e sinopse | A capa atual | "Buscar de novo" |
| L4 | Edição de livro sem capa ou sem sinopse | O que falta neste livro | "Buscar capa e dados" |

Desabilitado usa o visual que o sistema já tem (cinza sem borda), não um cinza novo.

## Comportamento

Nada da busca é gravado fora do salvar do formulário. Os valores escolhidos na vista entram nos campos do formulário e são gravados pelo mesmo "Adicionar o livro" ou "Salvar alterações". O L2 diz isso enquanto houver algo pendente: no cadastro, "quando você adicionar o livro"; na edição, "quando você salvar".

Ao voltar da vista, o foco vai para o botão da linha (o mesmo que abriu a vista).

## O que o consumidor fornece

Título e autor atuais do formulário, se é cadastro ou edição, a capa atual (se houver), quais campos opcionais o livro já tem e o que foi escolhido na vista (para o L2).

Telas: `design/telas/L0` a `L4` e `Desk-Form`.
