# O prompt para o Claude Code

Cole isto na raiz do projeto, com a pasta `design/` já commitada. Um prompt por fatia — não peça as sete de uma vez.

---

## Prompt de abertura (só na primeira sessão)

> Este repositório vai passar por um redesign completo. A especificação está em `design/`, commitada: leia, nesta ordem, `design/README.md`, `design/IA.md`, `design/COPY.md`, `design/COMPONENTES.md`, `design/BACKEND.md` e `design/PLANO.md`. Os artboards do desenho estão em `design/telas/*.html` — abra os que a fatia citar.
>
> Não escreva código nesta sessão. Me devolva: (a) o que você entendeu do plano em sete fatias, (b) onde o código atual vai brigar com ele, arquivo por arquivo, e (c) a pergunta que você faria antes de começar a fatia 1.

---

## Prompt de uma fatia

> Implemente a **fatia N** de `design/PLANO.md`, e só ela.
>
> Regras que valem em toda fatia:
>
> - Uma cor de ação. `--color-action-default` quer dizer _isto clica_. Estado selecionado usa `--color-action-background-subtle` com borda, nunca azul preenchido. Nunca duas ações primárias na mesma dobra.
> - Nenhum texto afirma intenção: **mencionado por**, nunca _indicado por_. `design/COPY.md` manda.
> - Todo componente que você tocar tem o estado vazio implementado junto, com o texto de `design/COPY.md`. Um em cada quatro livros do acervo está incompleto — o estado vazio não é caso de borda.
> - Qualquer coisa clicável é `<button>` ou `<a href>` de verdade, com no mínimo 44px, e texto nunca abaixo de 13px.
> - Valor de cor, espaço ou raio vem de token. Se você precisou escrever um hex, pare e me pergunte.
>
> Ao terminar: me diga o que mudou, o que você não fez e por quê, e rode `yarn build` antes de dizer que acabou.

---

## Como cortar o Claude Code quando ele passar do escopo

O erro típico não é ele errar a fatia — é ele resolver de brinde a próxima. Duas frases que funcionam:

> Você entrou na fatia N+1. Volte, deixe aquilo para o PR seguinte.

> Esse arquivo não está na fatia. Reverta e me diga o que você achou nele — a gente decide depois se entra.

---

## O que **não** dizer a ele

Não peça "refaça o front e o back conforme o layout". São 44 funções e 23 telas: vira um PR de milhares de linhas que ninguém revisa e que você abandona no meio.

Não mande o link do artifact. Ele não abre artifact — por isso a pasta `design/` existe.

Não peça para ele inventar o tema escuro. Não foi desenhado; ele vai gerar uma inversão automática que reprova em contraste e ninguém vai conferir.
