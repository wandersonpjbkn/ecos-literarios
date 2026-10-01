const sentence = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

/** All the authors of a book in one sentence: "Neil Gaiman e Terry Pratchett". */
export const authorNames = (authors: string[]): string => sentence.format(authors)

/** How many authors a list leaves out after the first: "(+1)", or nothing for a single author. */
export const authorMore = (authors: string[]): string => (authors.length > 1 ? `(+${authors.length - 1})` : '')

/** The authors as a list shows them, the first and how many more: "Neil Gaiman (+1)". */
export const authorLine = (authors: string[]): string =>
  [authors[0] ?? '', authorMore(authors)].filter(Boolean).join(' ')

/** The same line read aloud, where "(+1)" means nothing: "Neil Gaiman e mais 1 autor". */
export const authorLineSpoken = (authors: string[]): string => {
  const more = authors.length - 1
  if (more < 1) return authors[0] ?? ''
  return `${authors[0]} e mais ${more} ${more === 1 ? 'autor' : 'autores'}`
}
