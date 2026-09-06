import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function getCurrentClinic() {
  const headersList = await headers()
  const subdomain = headersList.get('x-clinic-subdomain')

  if (!subdomain) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('subdomain', subdomain)
    .single()

  if (error || !data) return null
  return data
}