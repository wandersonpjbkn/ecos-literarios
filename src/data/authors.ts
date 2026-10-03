const sentence = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

export const authorNames = (authors: string[]): string => sentence.format(authors)

export const authorMore = (authors: string[]): string => (authors.length > 1 ? `(+${authors.length - 1})` : '')

export const authorLine = (authors: string[]): string =>
  [authors[0] ?? '', authorMore(authors)].filter(Boolean).join(' ')

export const authorLineSpoken = (authors: string[]): string => {
  const more = authors.length - 1
  if (more < 1) return authors[0] ?? ''
  return `${authors[0]} e mais ${more} ${more === 1 ? 'autor' : 'autores'}`
}
