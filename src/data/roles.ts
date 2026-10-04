export const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', editor: 'Editor', viewer: 'Visitante' }

export const roleLabel = (role: string) => ROLE_LABEL[role] ?? role
