# TabBar

A mesma navegação do NavRail, embaixo, no celular. Os mesmos três destinos, na mesma ordem, com os mesmos rótulos — trocar a ordem entre tamanhos de tela é a forma mais rápida de perder alguém.

A conta sai da barra e vira o avatar no canto superior direito, junto do nome do clube.

## Regras

É o mesmo `AppSidebar` do NavRail, em outra disposição. Altura mínima `tab-item` (58px) por aba mais o respiro da área inferior do aparelho. O que flutua sobre a barra (toast, aviso de versão, "Voltar ao topo") fica à mesma distância dela (`--above-tab-bar`). Rótulo em 13px — 11px foi testado e some.

Nada de aba ativa só por cor de ícone: a aba ativa tem o mesmo fundo com borda do NavRail, e o rótulo muda para `action` e para peso 600.
