/** No contact is stored: the question opens WhatsApp already written and the reader picks the group. */
export const askGroupLink = (message: string, bookPath: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${message} ${window.location.origin}${bookPath}`)}`
