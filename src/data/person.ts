export const personName = (book: { quem_nome?: string | null; quem_user_id?: { name: string } | null }): string =>
  book.quem_user_id?.name ?? book.quem_nome ?? ''
