import { supabase } from '@/composables/supabase'

export type SessionEndReason = 'expired' | 'suspended'

let reason: SessionEndReason = 'expired'

/** Ends the session on this device only; watchSession reports it to App.vue with the reason. */
export const endSession = async (why: SessionEndReason): Promise<void> => {
  reason = why
  await supabase.auth.signOut({ scope: 'local' })
}

/** Why the session that just ended did so; read once, then back to the default. */
export const takeEndReason = (): SessionEndReason => {
  const why = reason
  reason = 'expired'
  return why
}
