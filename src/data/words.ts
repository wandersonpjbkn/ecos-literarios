const conjunction = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' })

/** "capa", "capa e ISBN", "capa, ISBN e ano": the Portuguese way of listing, in one place. */
export const joinWords = (words: string[]) => conjunction.format(words)

/** "1 livro", "3 livros": the count with the word that agrees with it. */
export const counted = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`
