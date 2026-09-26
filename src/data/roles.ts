// How each permission level is called on screen; the API keys (admin, editor, viewer) never reach the reader.
export const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', editor: 'Editor', viewer: 'Membro' }

export const roleLabel = (role: string) => ROLE_LABEL[role] ?? role
