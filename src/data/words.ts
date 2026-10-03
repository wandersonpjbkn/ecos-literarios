const conjunction = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' })

export const joinWords = (words: string[]) => conjunction.format(words)

export const counted = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`
