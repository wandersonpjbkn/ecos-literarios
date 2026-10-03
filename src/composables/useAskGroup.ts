export const askGroupLink = (message: string, bookPath: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${message} ${window.location.origin}${bookPath}`)}`
