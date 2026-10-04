# Avatar

Um círculo com a inicial. Ninguém tem foto: a inicial ajuda a achar, o nome ao lado é que identifica.

Dois tipos, pelo que ele representa, nunca por cor escolhida na chamada:

**Pessoa do clube** — quem mencionou um livro, e o nome do grupo que a conta vinculou. Fundo `voice-soft`, borda `voice-line`, inicial em `voice-ink`. Aparece no eco da semana, ao lado de "mencionado por" na página do livro e em "Vincular meu nome".

**Conta** — a sua, no trilho e no menu. Fica neutro (`bg-sunken`, borda `border-hair`, inicial em `ink-2`): ali ele é navegação, e navegação não leva a cor da voz.

## Regras

Todo mundo tem o mesmo rosa. Cor por pessoa vira uma paleta de doze tons que ninguém decora, e a regra continua: o nome identifica, não a cor.

Tamanhos: 24px ao lado de `caption`, 26px ao lado de `meta`, 32px no trilho. A inicial é `micro` 700 até 26px e `caption` 600 no trilho.

Sempre ao lado do nome, nunca sozinho. Leitor de tela ouve o nome; o avatar é `aria-hidden`.

Não entra no cartão da grade: 24 monogramas por tela seriam tema, não acento.

## O que o consumidor fornece

O nome (a inicial sai dele) e o tipo: `UserAvatar kind="pessoa"` ou `kind="conta"` (padrão `pessoa`). É um papel, não uma cor: a regra "nenhum componente aceita cor por prop" continua valendo.

Usos hoje: `EcoCard` e `ClaimNameSection` são pessoa; `UserMenu` é conta. A página do livro ganha um, de pessoa, ao lado de "mencionado por" (fatia 8g).
