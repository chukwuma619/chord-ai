import { createClient } from '@/lib/supabase/server'

export interface UserLimits {
  canUploadFiles: boolean
  canUseYoutube: boolean
  canTranspose: boolean
  canChangeCapo: boolean
  canControlTempo: boolean
  canLoop: boolean
  canExport: boolean
  canAccessAllSongs: boolean
  maxFileSizeMB: number
}

// All features are free and unlimited
export const FREE_LIMITS: UserLimits = {
  canUploadFiles: true,
  canUseYoutube: true,
  canTranspose: true,
  canChangeCapo: true,
  canControlTempo: true,
  canLoop: true,
  canExport: true,
  canAccessAllSongs: true,
  maxFileSizeMB: 50
}

export async function getUserLimits(): Promise<UserLimits> {
  // Everyone gets all features for free
  return FREE_LIMITS
}

export async function checkUsageAllowed(): Promise<{ allowed: boolean; message?: string }> {
  // Always allow usage since it's completely free
  return { allowed: true }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return profile
} 