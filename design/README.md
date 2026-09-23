# design/

A especificação do redesign do Ecos Literários, commitada junto do código para que qualquer agente ou pessoa que abra o repositório encontre o desenho sem precisar procurar uma conversa.

## Por onde começar

1. **`IA.md`** — os três destinos, as rotas que morrem, as que ficam e por quê.
2. **`COPY.md`** — o vocabulário e todos os textos, inclusive os de estado vazio.
3. **`COMPONENTES.md`** — o índice dos componentes; um arquivo por componente em `componentes/`.
4. **`BACKEND.md`** — o delta do servidor. É pequeno de propósito.
5. **`PLANO.md`** — as sete fatias, na ordem.
6. **`PROMPT-CLAUDE-CODE.md`** — como pedir cada fatia sem virar um PR de milhares de linhas.

## As cinco regras

**Uma cor de ação.** `--color-action-default` (#3A63B8, do azul-marinho do logo) quer dizer *isto clica*. Selecionado é fundo claro com borda, nunca azul preenchido. Uma ação primária por tela.

**O sistema nunca afirma intenção.** Os livros foram **mencionados** na conversa do WhatsApp, não indicados. Um membro já reclamou da palavra errada.

**Falta de informação é conteúdo.** 18 dos 87 livros sem capa, 23 sem páginas, 10 sem ano, 18 sem comentário. Um em cada quatro. Todo componente tem o estado vazio desenhado, e nenhum mostra caixa cinza ou campo em branco.

**A cor das capas não compete.** Nove tintas quase acromáticas com texto escuro. A tinta serve para reconhecer, não para chamar.

**44px e 13px.** Piso de alvo clicável e piso de texto. O cinza mais claro para texto é `#5F6B77` (5,4:1), e ele já é o limite.

## O que tem aqui

```
tokens/
  _ecos.scss      drop-in para src/assets/scss/themes/ — mantém o contrato do create-theme
  tokens.css      as mesmas variáveis em CSS puro, se preferir sair do SCSS
  tokens.json     a fonte (o mesmo arquivo do design system)
componentes/      um .md por componente: regras, estados, o que o consumidor fornece
telas/            os artboards exportados em HTML; abra no navegador
```

## Quem é o clube

Doze pessoas, nenhuma nativa digital. 87 livros que saíram de uma conversa de WhatsApp — em alguns casos alguém recomendou, em outros só citou o título. O acervo é irregular e vai continuar sendo. Tudo aqui foi escrito com essas três frases na frente.
