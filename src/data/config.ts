const API_BASE = import.meta.env.VITE_API_URL as string
const SUPPORT_PHONE = ((import.meta.env.VITE_PHONE_SUPPORT as string | undefined) ?? '').replace(/\D/g, '')

export { API_BASE, SUPPORT_PHONE }
