'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function requireAdminClinicId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('members')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!member || member.role !== 'admin') return null
  return member.clinic_id
}

export async function addMemberManually(name: string, email: string, password: string) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const admin = createAdminClient()

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !newUser.user) {
    return { error: createError?.message || 'Failed to create user' }
  }

  const { error: memberError } = await admin.from('members').insert({
    id: newUser.user.id,
    clinic_id: clinicId,
    full_name: name,
    role: 'member',
  })

  if (memberError) {
    return { error: memberError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteMember(memberId: string) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(memberId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function postAnnouncement(message: string) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('announcements').insert({
    clinic_id: clinicId,
    message,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function updatePricePerMember(price: number) {
  const clinicId = await requireAdminClinicId()
  if (!clinicId) return { error: 'Not authorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('clinics')
    .update({ price_per_member: price })
    .eq('id', clinicId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}