# Vocabulário e microcópia

## A regra que manda em todas as outras

**O sistema nunca afirma intenção.** O acervo começou numa conversa de WhatsApp. Em alguns casos a pessoa recomendou; em outros só citou. Um membro leu "indicado por Brenda" e respondeu *"mas eu não indiquei esse livro"*.

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
| Corrigir ficha (quem pode editar: quem mencionou, com o nome vinculado, ou admin) | ✎ **Corrigir algo neste livro** · ou, quando falta um campo: **Falta o ano. Você sabe?** / **Faltam o ano e o número de páginas. Você sabe?** |
| Corrigir ficha (os outros: abre o WhatsApp) | **Avisar no grupo sobre um erro** · ou **Falta o ano. Perguntar no grupo** |
| Compartilhar | Celular: a folha de compartilhar do aparelho. Desktop: copia e avisa **Link copiado. É só colar na conversa.** (some sozinho) |
| Quem marcou o livro | **3 pessoas querem ler · 1 pessoa já leu** · ninguém: **Ninguém guardou nem marcou como lido ainda.** Só totais, nunca nomes. |
| Texto longo (comentário, sinopse) | **Ler o resto** / **Mostrar menos** |

## Contagens

Os números abaixo são exemplos de como a frase se escreve; na tela entram os reais.

Sempre os dois números: **"Você está vendo 23 de 87"**. Nunca "Mostrando os 24 primeiros" — não diz primeiros de quê nem quantos faltam.

Quando a lista acabou, o botão some e a frase vira **"Estes são todos os 25"**.

O resumo do catálogo diz só os livros: **"87 livros"**, e com filtro **"25 de 87 livros"**. O número de pessoas saiu: repetia o que o filtro "Quem mencionou" já mostra.

Quando um formato está escondido pela preferência da pessoa, o cabeçalho diz em texto: **"25 de 87 livros · 15 mangás estão fora por sua escolha"**, e a preferência aparece como chip **"Sem mangá"** junto dos filtros aplicados.

Os chips aplicados de pessoa e de autor levam só a preposição: **"por Brenda"** (quem mencionou) e **"de Junji Ito"** (autor). Com várias pessoas marcadas, repetir "mencionado por" em cada chip pesava a linha; curto, ela se lê de uma vez ("Ficção · por Wanderson"). Fora dos chips, onde o nome aparece sozinho, continua **"mencionado por"**.

## Estados vazios

**Livro sem comentário** (no levantamento do estudo, 18 de 87)
> Brenda não escreveu nada sobre este livro
> O livro apareceu na conversa do grupo, sem comentário junto. *(só nos que vieram da conversa)*
> `[Perguntar pra Brenda]` + *Abre o WhatsApp com a pergunta pronta.* — ou, para quem mencionou: `[✎ Escrever o que achei]`

O bloco se chama **Comentário**, não "O que a Fulana escreveu": parte dos textos está em terceira pessoa ("Favorito da Brenda."), e depois de editado o texto pode ser de outra pessoa. O rótulo não afirma autoria.

"Perguntar pra" e as perguntas de dado faltando abrem o WhatsApp com a mensagem pronta (`Brenda, o que você acha de "X"?`, `Alguém sabe o ano de "X"?`): ninguém tem contato guardado, e a pessoa escolhe o grupo.

**Sem número de páginas** (23) — `Páginas / ninguém anotou`
**Sem ano** (10) — `Publicado em / não sabemos`
Um campo só, na linha de baixo da ficha, pergunta pelo que falta (veja "Corrigir ficha"), em vez de um link por campo.
**Sem capa** (18) — a tinta do gênero com a palavra `sem capa`. Nenhum texto de erro.

**Busca sem resultado**
> Nada com "kafka no espaço"
> Procuramos no título, no autor e no que as pessoas escreveram sobre cada livro.
> `[Apagar a busca]` `[Adicionar esse livro]`

**Filtro sem resultado**
> Nenhum livro com esses filtros
> Nada de terror mencionado pela Nati.
> `[Limpar os filtros]`

**Sem internet / servidor fora** — mostra a lista salva com a data ("a lista de ontem") e desliga só a escrita, em todo lugar onde dá para adicionar (topo, trilho e barra de baixo juntos). Nunca tela em branco.

> Sem internet: `Você está sem internet. Dá pra olhar, mas não pra adicionar.`
> Servidor fora: `A plataforma está fora do ar agora. Você está vendo a lista de ontem: dá pra olhar, mas não pra adicionar.` `[Tentar de novo]`
> Sem lista salva e servidor fora: `A plataforma está fora do ar agora. Tente daqui a pouco.` / `Se não voltar, avise no grupo.`

**Volta do link mágico com a plataforma fora** — o link funcionou; quem não respondeu foi a plataforma. Nunca "Pedir outro link" nesse caso, e nunca o erro do navegador ("Failed to fetch").
> `A plataforma está fora do ar agora.` / `Seu link funcionou, só a plataforma que não respondeu. Dá pra olhar os livros enquanto isso.` `[Tentar de novo]` `[Continuar sem entrar]`

Link recusado ou sem sessão: `Não deu pra entrar com esse link. Ele pode ter vencido.` `[Pedir outro link]`.

O banner diz por que "Adicionar" está desligado; sem isso o botão cinza não se explica. "Servidor" não aparece: é palavra de quem fez o sistema. O nome é **plataforma**: "o Ecos" se confunde com o clube, e "site" lembra site institucional. O banner usa as tintas `alert-*` (âmbar): atenção, não erro, porque dá pra continuar olhando.

## Tom

Texto de tela é placa: orienta quem chega, onde está. O texto dos artboards é ponto de partida; o que não orienta foi reescrito ("Recortes que saem do próprio acervo" saiu: são quatro palavras de leitura de máquina juntas). Frases curtas. Nada de "explore", "descubra", "gerencie", "otimize". Sem emoji. O leitor é um amigo do grupo, não um usuário de SaaS — e não é nativo digital, então nenhum rótulo depende de reconhecer um ícone.

"Importação" e "cadastrado" são palavras de sistema: escreva **"veio da conversa do grupo no WhatsApp"**.
