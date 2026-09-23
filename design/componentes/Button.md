# Button

Quatro pesos, e a tela escolhe no máximo um primário.

**Primário** — fundo `action`, texto `on-action`. É a ação que a tela existe para oferecer, e há **uma** por tela. Quando o catálogo tinha "Adicionar um livro" no topo e "Sortear" ao lado, os dois em azul cheio, o olho não sabia qual era a saída.

**Secundário** — fundo `bg-surface`, borda `border-strong`, texto `ink`. A alternativa de mesmo peso semântico ("Marcar como lido" ao lado de "Guardar em Quero ler").

**De ação, contornado** — borda `action-line`, texto `action`. Uma segunda ação que ainda é ação, numa tela que já gastou o primário.

**Fantasma** — só texto `action`. Ação terciária, dentro de um bloco.

## Regras

Altura mínima `touch-cta` para a ação principal e para qualquer botão em celular; `touch-min` é o piso absoluto. Raio `radius-lg` — chip é que é pílula, botão não.

O rótulo diz o que acontece, não o estado desejado: **"Guardar em Quero ler"**, não "Quero ler". Depois do clique o botão muda de texto e oferece a volta ("Guardado em Quero ler · Tirar da lista"); sem isso o membro clica duas vezes.

Nunca dois primários na mesma dobra, e nunca `action` como fundo de algo que não seja botão — `action-soft` é que carrega estado selecionado.

## O que o consumidor fornece

Elemento `<button>` ou `<a href>` de verdade. Um `div` com `onClick` é pulado pelo Tab, e metade do clube navega assim.
