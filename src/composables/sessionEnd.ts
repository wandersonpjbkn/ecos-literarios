import { supabase } from '@/composables/supabase'

export type SessionEndReason = 'expired' | 'suspended'

let reason: SessionEndReason = 'expired'

export const endSession = async (why: SessionEndReason): Promise<void> => {
  reason = why
  await supabase.auth.signOut({ scope: 'local' })
}

export const takeEndReason = (): SessionEndReason => {
  const why = reason
  reason = 'expired'
  return why
}
