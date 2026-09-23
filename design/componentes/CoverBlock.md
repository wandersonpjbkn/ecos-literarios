# CoverBlock

O lugar da capa, nos três estados que o acervo real produz.

Ele mostra **o título e nada mais**. Autor e quem mencionou vivem fora do bloco — quando estavam dentro e fora, cada cartão repetia as duas linhas e a grade virava um paredão de texto.

**Com capa** — a imagem preenche o bloco; a tinta do gênero fica por baixo como cor de carregamento.

**Sem capa** (18 dos 87 livros) — a tinta do gênero com o título centralizado e a palavra *sem capa* embaixo, discreta. Não é estado de erro: é o acervo como ele é. Nunca retângulo cinza, nunca ícone de imagem quebrada.

**Com selo de formato** — Mangá e HQ ganham selo branco no canto superior direito. Livro é o padrão e não recebe marca nenhuma; se tudo tivesse selo, nada teria.

## Regras

Raio `radius-md`. A tinta vem do gênero, por token `tint-<genero>-bg` / `-line` / `-ink`; o título usa a tinta de ink correspondente, que passa de 7:1 sobre o próprio fundo.

O título corta em três linhas com reticências, e o título completo continua no `alt`/`aria-label` do link. Cortar no dado é que não: o banco guarda o nome inteiro.

As nove tintas são quase acromáticas de propósito. Uma paleta saturada por gênero foi testada e transformou a grade num mosaico em que nada tinha prioridade.

## O que o consumidor fornece

O gênero do livro, para escolher a tinta, e a URL da capa quando existir. Sem gênero, cai em `tint-ficcao`.
