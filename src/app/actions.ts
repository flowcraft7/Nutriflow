'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function completeSignup(userId: string, fullName: string) {
  const headersList = await headers()
  const subdomain = headersList.get('x-clinic-subdomain')

  if (!subdomain) {
    return { error: "No clinic context found. Please use your clinic's link." }
  }

  const supabase = await createClient()

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('id')
    .eq('subdomain', subdomain)
    .single()

  if (clinicError || !clinic) {
    return { error: 'Clinic not found for this link.' }
  }

  const { error: memberError } = await supabase
    .from('members')
    .insert({ id: userId, clinic_id: clinic.id, role: 'member', full_name: fullName })

  if (memberError) {
    return { error: memberError.message }
  }

  return { success: true }
}