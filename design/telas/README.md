# telas/

Os artboards do estudo, exportados do canvas em HTML. Abra no navegador — são arquivos
estáticos, sem build.

## As telas do produto

| Arquivo | O que é |
| --- | --- |
| `Main.html` | **O catálogo.** O destino único: grade, prateleiras, rodapé. Começa por aqui. |
| `Filters.desktop.html` | A gaveta de filtro aberta sobre o catálogo |
| `Detail.desktop.html` | O livro aberto, com a faixa das três variantes de falta no fim |
| `Catalog.mobile.html` | O catálogo no celular |
| `Indicar.desktop.html` | Adicionar um livro (painel) |
| `Conta.html`, `MeusLivros.html` | Conta e a lista pessoal |
| `Estados.html` | Vazio, erro, carregando, offline |
| `Entrar.html` | Link mágico e volta |
| `Admin.html` | Painel do clube |
| `Entradas.html` | Como se entra e se sai de cada fluxo |

## Os quadros de estudo

`Dados.html` (o retrato do acervo real — leia antes de discutir qualquer decisão),
`Proposta.html`, `Navegacao.html`, `Foundations.html`, `Identificacao.html`,
`Cor.html` (por que o acento é o azul do logo), `Inventario.html` e `Impacto.html`
(as 44 funções do produto e o que acontece com cada uma).

## Duas ressalvas honestas

**Sete arquivos não renderizam inteiros fora do canvas.** `Admin`, `Catalog.tablet`,
`Entradas`, `FilterSheet.mobile`, `Impacto`, `Inventario` e `MeusLivros` usam o runtime
de repetição do editor; a estrutura aparece, as linhas de lista não. Para esses, o texto
das especificações manda.

**Tablet, detalhe no celular e folha de filtro do celular estão desatualizados.** Foram
repintados com as cores novas, mas não refeitos: ainda mostram livros inventados e o
cartão com o título duplicado. Refaça o desenho antes de codar essas três telas.
