export const googleBooksPage = (coverUrl?: string): string | null => {
  if (!coverUrl) return null
  try {
    const url = new URL(coverUrl)
    const id = url.searchParams.get('id')
    return url.hostname === 'books.google.com' && id
      ? `https://books.google.com/books?id=${encodeURIComponent(id)}`
      : null
  } catch {
    return null
  }
}
