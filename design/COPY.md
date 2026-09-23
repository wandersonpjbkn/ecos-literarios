# Vocabulário e microcópia

## A regra que manda em todas as outras

**O sistema nunca afirma intenção.** Os 87 livros saíram de uma conversa de WhatsApp. Em alguns casos a pessoa recomendou; em outros só citou. Um membro leu "indicado por Brenda" e respondeu *"mas eu não indiquei esse livro"*.

| Nunca | Sempre |
| --- | --- |
| indicado por / indicou | **mencionado por** / mencionou |
| Quem indicou | **Quem mencionou** |
| Por que Fulana indicou | **O que a Fulana escreveu** |
| Indicar um livro | **Adicionar um livro** |
| recomendou, sugeriu | mencionou |

Vale na interface, nos títulos de página, nos textos de estado vazio, nos e-mails e no `<title>`. A rota `/mencao/:slug` já usava o termo certo — foi o resto que divergiu.

## Rótulos de ação

| Onde | Texto |
| --- | --- |
| Ação primária do catálogo | Adicionar um livro |
| Guardar para ler | Guardar em "Quero ler" → depois do clique: **Guardado em Quero ler · Tirar da lista** |
| Marcar lido | Marcar como lido → depois: **Lido · Desmarcar** |
| Abrir o filtro | Filtrar |
| Chip que abre o resto | Filtrar por tamanho, pessoa e formato |
| Fechar filtro aplicando | Ver 25 livros *(o número real)* |
| Limpar | **Limpar os filtros** — nunca "Limpar tudo", que soa como apagar a conta |
| Ver mais da lista | Ver mais 24 |
| Sorteio | Sortear um livro pra mim |
| Corrigir ficha | Corrigir algo neste livro · ou, quando falta um campo: **Está faltando o ano. Você sabe?** |

## Contagens

Sempre os dois números: **"Você está vendo 23 de 87"**. Nunca "Mostrando os 24 primeiros" — não diz primeiros de quê nem quantos faltam.

Quando a lista acabou, o botão some e a frase vira **"Estes são todos os 25"**.

Quando um formato está escondido pela preferência da pessoa, o cabeçalho diz em texto: **"25 de 87 livros · 15 mangás estão fora por sua escolha"**.

## Estados vazios

**Livro sem comentário** (18 dos 87)
> Brenda não escreveu nada sobre este livro
> Ele apareceu na conversa do grupo, sem comentário junto.
> `[Perguntar pra Brenda]` — ou, para quem mencionou: `[Escrever o que achei]`

**Sem número de páginas** (23) — `Páginas / ninguém anotou` + link `Dizer quantas páginas tem`
**Sem ano** (10) — `Publicado em / não sabemos` + link `Dizer o ano`
**Sem capa** (18) — a tinta do gênero com a palavra `sem capa`. Nenhum texto de erro.

**Busca sem resultado**
> Nada com "kafka no espaço"
> Procuramos no título, no autor e no que as pessoas escreveram sobre cada livro.
> `[Apagar a busca]` `[Adicionar esse livro]`

**Filtro sem resultado**
> Nenhum livro com esses filtros
> Nada de terror mencionado pela Nati.
> `[Limpar os filtros]`

**Sem internet / servidor fora** — mostra o catálogo em cache com a data ("o catálogo de ontem") e desliga só a escrita. Nunca tela em branco.

## Tom

Frases curtas. Nada de "explore", "descubra", "gerencie", "otimize". Sem emoji. O leitor é um amigo do grupo, não um usuário de SaaS — e não é nativo digital, então nenhum rótulo depende de reconhecer um ícone.

"Importação" e "cadastrado" são palavras de sistema: escreva **"veio da conversa do grupo no WhatsApp"**.
