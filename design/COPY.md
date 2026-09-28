# Vocabulário e microcópia

## A regra que manda em todas as outras

**O sistema nunca afirma intenção.** O acervo começou em uma conversa de WhatsApp. Em alguns casos a pessoa recomendou; em outros só citou. Um membro leu "indicado por Brenda" e respondeu *"mas eu não indiquei esse livro"*.

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
| Fechar filtro aplicando | Ver 25 livros *(o número real)* · sem nenhum: **Fechar**, com **Nenhum livro com esses filtros.** acima |
| Limpar | **Limpar os filtros** — nunca "Limpar tudo", que soa como apagar a conta |
| Ver mais da lista | Ver mais 24 |
| Corrigir ficha (quem pode editar: o dono do livro, ou quem pode editar qualquer livro) | ✎ **Editar**, o mesmo de Meus livros, e ao lado o que falta: **Falta o ano.** / **Faltam o ano e o número de páginas.** |
| Corrigir ficha (os outros: abre o WhatsApp do suporte) | **Avisar sobre um erro** · ou **Pedir para completar o ano** |
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
> `[Perguntar para Brenda]` + *Abre o WhatsApp com a pergunta pronta.* — ou, para quem mencionou: `[✎ Escrever o que achei]`

O bloco se chama **Comentário**, não "O que a Fulana escreveu": parte dos textos está em terceira pessoa ("Favorito da Brenda."), e depois de editado o texto pode ser de outra pessoa. O rótulo não afirma autoria.

"Perguntar para" abre o WhatsApp com a mensagem pronta (`Brenda, o que você acha de "X"?`): ninguém tem contato guardado, e a pessoa escolhe a conversa. O WhatsApp não aceita mensagem pronta para um grupo específico. Erro e dado faltando na ficha vão para o número de suporte (`Achei algo para corrigir em "X".`, `Falta o ano em "X".`), porque é a administração que corrige; sem número configurado, a pessoa escolhe a conversa.

**Sem número de páginas** (23) — `Páginas / ninguém anotou`
**Sem ano** (10) — `Publicado em / não sabemos`
Um campo só, na linha de baixo da ficha, pergunta pelo que falta (veja "Corrigir ficha"), em vez de um link por campo.
**Sem capa** (18) — a tinta do gênero com a palavra `sem capa`. Nenhum texto de erro.

**Busca sem resultado**
> Nada com "kafka no espaço"
> Procuramos no título, no autor e no que as pessoas escreveram sobre cada livro. *(com filtro junto: "…, dentro dos filtros escolhidos.")*
> `[Apagar a busca]` · `[Limpar os filtros]` quando há filtro · `[Adicionar esse livro]` só para quem pode criar livro (admin e editor); membro não vê um caminho que ainda não existe para ele

**Filtro sem resultado**
> Nenhum livro com esses filtros
> Nenhum livro de terror mencionado por Natália.
> `[Limpar os filtros]`

A frase monta a combinação aplicada a partir de "Nenhum livro": gênero ou subgênero ("de fantasia"), formato ("em mangá"), tamanho ("com menos de 200 páginas"), autor ("de Junji Ito") e pessoa ("mencionado por Natália"). "Mencionado" concorda com "livro", nunca com a pessoa: o dado não diz o gênero de ninguém. Na dúvida, redação neutra; se pesar para um lado, o feminino (dono, 2026-09-27).

**Catálogo vazio** (nenhum livro no acervo, sem busca nem filtro)
> Nenhum livro no catálogo ainda
> Os livros que o clube adicionar aparecem aqui.
> `[Adicionar um livro]` só para quem pode criar livro

**Lista própria vazia** (Meus livros)
> Nenhum livro com o seu nome ainda
> Aqui aparecem os livros que você mencionou no grupo, depois que você vincula a sua conta ao nome que aparece neles.
> `[Vincular meu nome]`

**Link mágico que não funcionou** (pode ter vencido; o sistema não sabe qual dos dois)
> Não foi possível entrar com esse link. Ele pode ter vencido.
> `[Enviar outro link para fulano@…]` `[Usar outro e-mail]` quando o e-mail foi pedido neste aparelho na última hora; senão `[Pedir outro link]`
> Depois do reenvio: `Enviamos outro link` / `Foi para fulano@…. Abra seu e-mail e toque no link para entrar.`

**Sem internet / servidor fora** — mostra a lista salva com a data ("a lista de ontem") e desliga só a escrita, em todo lugar onde dá para adicionar (topo, trilho e barra de baixo juntos). Nunca tela em branco.

> Sem internet: `Você está sem internet. Os livros continuam visíveis, mas não é possível adicionar.`
> Servidor fora: `A plataforma está fora do ar agora. Você está vendo a lista de ontem: os livros continuam visíveis, mas não é possível adicionar.` `[Tentar de novo]`
> Sem lista salva e servidor fora: `A plataforma está fora do ar agora. Tente daqui a pouco.` `[Tentar de novo]` `[Falar com o suporte]`

**Volta do link mágico com a plataforma fora** — o link funcionou; quem não respondeu foi a plataforma. Nunca "Pedir outro link" nesse caso, e nunca o erro do navegador ("Failed to fetch").
> `A plataforma está fora do ar agora.` / `Seu link funcionou; quem não respondeu foi a plataforma. Enquanto isso, você pode olhar os livros.` `[Tentar de novo]` `[Continuar sem entrar]`

Link recusado ou sem sessão: `Não foi possível entrar com esse link. Ele pode ter vencido.` `[Pedir outro link]`.

O banner diz por que "Adicionar" está desligado; sem isso o botão cinza não se explica. "Servidor" não aparece: é palavra de quem fez o sistema. O nome é **plataforma**: "o Ecos" se confunde com o clube, e "site" lembra site institucional. O banner usa as tintas `alert-*` (âmbar): atenção, não erro, porque dá para continuar olhando.

## Entrar

Antes de enviar:
> Entrar
> Coloque seu e-mail e nós enviamos um link para você entrar. Não é preciso senha.

"A gente" vira "nós" e "mandar" vira "enviar" em todo o produto (dono, 2026-09-27).

Depois de enviar, a introdução some e fica só:
> Enviamos o link
> Foi para **fulano@…**. Abra seu e-mail e toque no link para entrar.
> `[Usar outro e-mail]` · durante a espera, texto: *Você pode pedir outro link em 59 segundos* · depois: `[Enviar outro link]`

Espera não é botão desabilitado: botão cinza parece quebrado, e o texto diz quando vai dar.

## Vincular meu nome

A seção tem o mesmo nome do botão de Meus livros que leva a ela e aparece para toda conta. Vincular segue a matriz (Vínculo · Editar; por padrão Editor e Administrador); sem essa permissão, no lugar do formulário:
> Vincular um nome do grupo não está liberado para a sua conta.
> `[Pedir a liberação]` ← abre o WhatsApp do suporte com a mensagem pronta

Em Meus livros, a mesma conta sem livros vê:
> Nenhum livro com o seu nome ainda
> Se você é do clube, peça a liberação para vincular o seu nome e ver aqui os livros que mencionou no grupo.
> `[Pedir a liberação]`

Sem permissão, o subtítulo da seção fica só com a origem dos livros ("Os livros antigos vieram da conversa do WhatsApp, com o nome de quem falou deles."), sem pedir para vincular. Sem número de suporte configurado (`VITE_PHONE_SUPPORT`), o botão não aparece: em Vincular meu nome o texto ganha "Se você é do clube, fale com um Administrador."; em Meus livros fica "Aqui aparecem os livros mencionados por você." A mensagem leva o e-mail da conta, que é como o Administrador a acha no painel.

Ninguém precisa vincular antes de adicionar: o livro sai com quem cadastra como "mencionado por". Mas, se existe um nome da carga sem dono igual ao da conta, o formulário pergunta primeiro:
> O nome "Wanderson" já está no catálogo. É você? Se for, vincule esse nome e esses livros passam a ser seus.
> `[Vincular este nome]` `[Não sou eu, continuar]`

"Mencionado por" é escolha em uma lista (as contas e os nomes da carga sem dono), com quem cadastra já escolhido. Nome digitado só pela última opção, **"Outro nome: {o que foi digitado}"**, que segue a matriz (Vínculo · Criar; por padrão só Administrador). O nome novo não pode repetir um que já existe, nem com outro acento ou outra caixa: "Natalia" não entra se há "Natália"; "Natalia C." entra.

As linhas novas da matriz de Permissões, em frase: **"Vincular a própria conta a um nome do grupo"** (Vínculo · Editar), **"Incluir um nome novo de pessoa do clube"** (Vínculo · Criar) e **"Buscar capas e dados para o acervo inteiro"**.

## Suporte

**Falar com o suporte** abre o WhatsApp do número de suporte com a mensagem pronta (com o e-mail, quando ele é conhecido). Fica na moldura e onde a pessoa trava:

- **Ajuda** no pé do trilho (do tablet para cima), acima de Painel do clube e de Entrar ou Minha conta. O pé é uma navegação própria ("Conta"), separada da principal: ajuda, painel e conta não são destinos de leitura. No trilho o rótulo é curto, como os outros itens;
- no pé de Minha conta e do Painel do clube;
- em "Enviamos o link", em todo estado de erro ou aviso da volta do link e no erro de "não foi possível abrir" do catálogo e do livro.

"Enviamos outro link" (volta do link) tem as mesmas saídas de "Enviamos o link": `[Usar outro e-mail]` `[Falar com o suporte]` e, fora da mensagem, `← Voltar ao catálogo`, como no Entrar. "Não foi possível entrar com esse link" também tem `← Voltar ao catálogo`; com a plataforma fora, a volta é "Continuar sem entrar". Sem internet, o erro de carregamento não oferece o suporte: o WhatsApp também não abriria.

Todo botão que abre o WhatsApp leva o ícone do WhatsApp: é o sinal, na tela, de que sai do app. "Sem permissão" oferece **Pedir a liberação** a quem não é Editor, e a mensagem diz o que se pede (adicionar livros, usar o painel, vincular o nome), para a administração saber que nível liberar.

## Confirmar o que não tem volta

Título com o item entre aspas, uma frase do que acontece e do que vai junto, e o verbo completo no botão:
> Remover "Circe"?
> O livro sai do catálogo e das listas de quem guardou. Não é possível desfazer.
> `[Cancelar]` `[Remover o livro]` ← peso destrutivo, nunca o azul

## Permissões

Cada linha é uma frase sobre o que ela controla ("Ver a lista de membros"), nunca o nome do recurso seguido de um verbo ("Membros: Ver"). O que o painel não configura aparece como linha fixa: **"Mudar o nível de alguém: só Administrador (não muda aqui)"**.

## Palavras de sistema que não aparecem

Na tela, inclusive no painel do clube e nas mensagens que vêm do servidor:
- "role", "claim", "reivindicar", "batch", "token", "cache", "cadastrado", "importação", "Qtd.", "livro(s)";
- "Erro ao …" vira **"Não foi possível … Tente de novo."**, e "Tentar novamente" vira **"Tentar de novo"**. Nada de "a gente", "mandar", "pra", "pro", "numa", "dá pra" ou "não deu pra": o registro pode ser leve, mas não chega nesse ponto (dono, 2026-09-28);
- "Categoria" vira **"Gênero"** e "Sub-gêneros", **"Subgêneros"**, como na tela pública; "Email" vira **"E-mail"**;
- "Painel admin" vira **"Painel do clube"**; "Segmentações" vira **"Autores e gêneros"**;
- os níveis de permissão aparecem como **Administrador, Editor, Visitante**, nunca `admin`, `editor`, `viewer`. "Membro" não é nível: os membros do clube são Editores, e o nível mais baixo é de quem entrou por um link sem ser do clube (fatia 8a);
- "Resetar cache" vira **"Limpar os dados deste aparelho"**, com o que acontece: "Sai da conta e baixa o catálogo de novo. Sua escolha de formatos fica." Ao lado, **"Recarregar o catálogo"**: "Baixa o catálogo de novo. Você continua na conta." Cada ação na sua linha, com a consequência embaixo (fatia 8e);
- "Mídia" vira **"Formato"** (coluna, aba e permissão no painel, campo do livro); "Enriquecimento" e "Executar" viram **"Capas e sinopses"** e **"Buscar capas e dados"**;
- "cadastrei" vira **"adicionei"**; os códigos da busca de capas (`manual_edit`, `not_found`, `isbn`…) aparecem como frase ("Alguém corrigiu à mão, então não mexemos"), nunca crus.

## Acervo e catálogo

**Catálogo** é a página onde se olha os livros. **Acervo** é o conjunto de livros do clube, a palavra do painel ("Livros do acervo", o grupo "Acervo" na lateral). Estado vazio segue a tela: "Nenhum livro no catálogo ainda" no catálogo, "Nenhum livro no acervo ainda" no painel.

## Tom

Texto de tela é placa: orienta quem chega, onde está. O texto dos artboards é ponto de partida; o que não orienta foi reescrito ("Recortes que saem do próprio acervo" saiu: são quatro palavras de leitura de máquina juntas). Frases curtas. Nada de "explore", "descubra", "gerencie", "otimize". Sem emoji. O leitor é um amigo do grupo, não um usuário de SaaS — e não é nativo digital, então nenhum rótulo depende de reconhecer um ícone.

"Importação" e "cadastrado" são palavras de sistema. O app não diz de onde o livro veio (conversa do grupo ou cadastro aqui): a informação não muda nada para quem lê (dono, 2026-09-27).
