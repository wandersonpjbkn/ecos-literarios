# QuoteBlock

O que uma pessoa escreveu sobre um livro — e o que aparece quando ela não escreveu nada.

É a alma do produto e o motivo de existir um catálogo em vez de uma planilha, então **o bloco nunca some**. Dos 87 livros do acervo, 18 não têm texto nenhum e só 17 passam de 80 caracteres: a versão vazia é tão frequente quanto a cheia e foi desenhada junto.

O rótulo é **"Comentário"** (fatia 5). Nunca "Por que Fulana indicou": o texto veio de uma conversa de WhatsApp, e afirmar intenção é exatamente o erro que fez um membro responder "mas eu não indiquei esse livro". Também não "O que Fulana escreveu": parte dos textos está em terceira pessoa ("Favorito da Brenda.") e pode ser editada depois; o rótulo não afirma autoria. Quem mencionou já aparece no cabeçalho do livro.

## Regras

Fundo `bg-sunken` com uma régua de 3px à esquerda — `action-line` quando há texto, `border-strong` quando está vazio. Sem cor de destaque própria: o sistema tem um acento só, e ele é de ação.

O texto usa `body-l` (19px), o único corpo grande do sistema. Ele é a coisa mais humana da tela e merece o tamanho.

Vazio, o bloco nomeia quem não escreveu e oferece a saída certa para cada leitor: **Escrever o que achei** para quem mencionou o livro (abre o formulário de edição), **Perguntar pra Fulana** para os outros (abre o WhatsApp com a pergunta pronta, e diz isso embaixo). Texto longo fica recolhido com **Ler o resto**.

## O que o consumidor fornece

O texto, o nome de quem mencionou, e se quem está olhando é essa pessoa.
