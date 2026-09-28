/** Who mentioned a book, as shown: the account's name once someone claimed it, else the placeholder from the first load. */
export const personName = (book: { quem_nome?: string | null; quem_user_id?: { name: string } | null }): string =>
  book.quem_user_id?.name ?? book.quem_nome ?? ''
