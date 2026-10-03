const THREE_TO_TWO: Record<string, string> = {
  por: 'pt',
  eng: 'en',
  spa: 'es',
  fre: 'fr',
  fra: 'fr',
  ita: 'it',
  ger: 'de',
  deu: 'de',
  jpn: 'ja',
}

const names = new Intl.DisplayNames(['pt-BR'], { type: 'language' })

export const languageName = (code?: string): string => {
  if (!code) return ''
  const base = code.split('-')[0]!.toLowerCase()
  try {
    const name = names.of(THREE_TO_TWO[base] ?? base) ?? ''
    return name === base ? '' : name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return ''
  }
}
