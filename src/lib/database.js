import { supabase, isSupabaseConfigured } from './supabase'

export const SERVICE_CATEGORIES = [
  'Broken Streetlight',
  'Water & Sanitation',
  'Garbage Collection',
  'Roads & Transport',
  'Drainage & Sewerage',
  'Business Permits',
  'Birth Certificate & ID',
  'Land Services',
  'Public Complaint',
]

export const REQUEST_STATUSES = ['Pending', 'In Progress', 'Resolved']

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent']

// Clean up any legacy dummy data keys from earlier versions
try {
  localStorage.removeItem('huduma_service_requests_v1')
  localStorage.removeItem('huduma_users_v1')
} catch {
  // Ignore storage errors
}

const SESSION_KEY = 'huduma_active_session_v2'

export function getLocalSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setLocalSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

function makeUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generateReferenceNumber(existingRequests = []) {
  const year = new Date().getFullYear()
  const prefix = `PSR${year}`
  const numbers = existingRequests
    .map((req) => req.referenceNumber || req.reference_number || '')
    .filter((ref) => ref.startsWith(prefix))
    .map((ref) => parseInt(ref.replace(prefix, ''), 10))
    .filter((num) => !Number.isNaN(num))

  const nextNum =
    numbers.length > 0 ? Math.max(...numbers) + 1 : existingRequests.length + 1
  return `${prefix}${String(nextNum).padStart(3, '0')}`
}

function normalizeStatus(status) {
  if (!status) return 'Pending'
  const lower = status.toLowerCase()
  if (lower === 'resolved' || lower === 'approved' || lower === 'completed') {
    return 'Resolved'
  }
  if (
    lower === 'in progress' ||
    lower === 'in-progress' ||
    lower === 'under review'
  ) {
    return 'In Progress'
  }
  return 'Pending'
}

function normalizeRequestRecord(row, index = 0) {
  const status = normalizeStatus(row.status)
  const createdAt = row.created_at || row.createdAt || new Date().toISOString()
  const updatedAt = row.updated_at || row.updatedAt || createdAt

  const rawHistory = row.history || row.request_status_history || []
  const sortedHistory = Array.isArray(rawHistory)
    ? [...rawHistory]
        .map((h) => ({
          id: h.id,
          status: normalizeStatus(h.status),
          note: h.note || '',
          changedBy: h.changed_by || h.changedBy || null,
          createdAt: h.created_at || h.createdAt || createdAt,
        }))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : []

  const history =
    sortedHistory.length > 0
      ? sortedHistory
      : [
          {
            id: `init-${row.id}`,
            status,
            note: row.admin_note || row.adminNote || 'Service request submitted.',
            createdAt,
          },
        ]

  return {
    id: row.id,
    referenceNumber:
      row.reference_number ||
      row.referenceNumber ||
      `PSR${new Date(createdAt).getFullYear()}${String(index + 1).padStart(3, '0')}`,
    citizenId: row.citizen_id || row.citizenId,
    citizenName: row.citizen_name || row.citizenName || 'Citizen',
    citizenEmail: row.citizen_email || row.citizenEmail || '',
    title:
      row.title || `${row.category || 'Service'} - ${row.location || ''}`,
    category: row.category || 'Other',
    location: row.location || 'Not specified',
    description: row.description || '',
    imageUrl: row.image_url ?? row.imageUrl ?? '',
    priority: row.priority || 'Medium',
    status,
    adminNote: row.admin_note ?? row.adminNote ?? '',
    createdAt,
    updatedAt,
    history,
  }
}

/**
 * Ensures a Profile row exists in Supabase `profiles` table for a given user
 * so foreign keys on `service_requests.citizen_id` always succeed.
 */
export async function ensureSupabaseProfile(user) {
  if (!isSupabaseConfigured || !supabase || !user?.id) return null

  const now = new Date().toISOString()
  const profilePayload = {
    id: user.id,
    email: user.email || null,
    full_name:
      user.fullName ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Citizen',
    phone: user.phone || user.user_metadata?.phone || null,
    national_id: user.nationalId || user.user_metadata?.national_id || null,
    role: user.role || user.user_metadata?.role || 'citizen',
    updated_at: now,
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          full_name: profilePayload.full_name,
          role: profilePayload.role,
          updated_at: now,
        },
        { onConflict: 'id' }
      )
    }
    return data || profilePayload
  } catch {
    return profilePayload
  }
}

/**
 * Fetch user profile from Supabase `profiles` table
 */
export async function fetchUserProfile(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return data
  } catch {
    return null
  }
}

/**
 * Fetch all real service requests from Supabase
 */
export async function fetchServiceRequests() {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('service_requests')
    .select('*, request_status_history(*)')
    .order('created_at', { ascending: false })

  if (error) {
    const fallbackRes = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (fallbackRes.error) {
      return []
    }
    return (fallbackRes.data || []).map((row, idx) =>
      normalizeRequestRecord(row, idx)
    )
  }

  return (data || []).map((row, idx) => normalizeRequestRecord(row, idx))
}

/**
 * Look up a single request in Supabase by its reference number (or ID)
 */
export async function findRequestByReference(referenceInput) {
  const cleanRef = (referenceInput || '').trim().toUpperCase()
  if (!cleanRef) return null

  const allRequests = await fetchServiceRequests()
  const found = allRequests.find(
    (req) =>
      req.referenceNumber?.toUpperCase() === cleanRef ||
      req.id?.toUpperCase() === cleanRef ||
      req.id?.toUpperCase().startsWith(cleanRef)
  )

  return found || null
}

/**
 * Create a new service request in Supabase PostgreSQL
 */
export async function createServiceRequest({
  user,
  title,
  category,
  location,
  description,
  imageUrl,
  priority = 'Medium',
}) {
  if (!user?.id) {
    throw new Error('Please sign in to submit a service request.')
  }

  const existing = await fetchServiceRequests()
  const referenceNumber = generateReferenceNumber(existing)
  const requestId = makeUuid()
  const now = new Date().toISOString()

  const citizenName =
    user.fullName ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Citizen'
  const citizenEmail = user.email || ''
  const cleanTitle = title?.trim() || `${category} at ${location.trim()}`

  await ensureSupabaseProfile(user)

  const insertPayload = {
    id: requestId,
    reference_number: referenceNumber,
    citizen_id: user.id,
    citizen_name: citizenName,
    citizen_email: citizenEmail,
    title: cleanTitle,
    category,
    location: location.trim(),
    description: description.trim(),
    image_url: imageUrl || null,
    priority,
    status: 'Pending',
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await supabase
    .from('service_requests')
    .insert(insertPayload)
    .select()
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Failed to save service request to database.')
  }

  const savedId = data?.id || requestId

  await supabase.from('request_status_history').insert({
    id: makeUuid(),
    request_id: savedId,
    status: 'Pending',
    note: 'Service request submitted by citizen.',
    changed_by: user.id,
    created_at: now,
  })

  return normalizeRequestRecord({
    ...(data || insertPayload),
    request_status_history: [
      {
        id: makeUuid(),
        status: 'Pending',
        note: 'Service request submitted by citizen.',
        changed_by: user.id,
        created_at: now,
      },
    ],
  })
}

/**
 * Update a service request's status and admin note in Supabase
 */
export async function updateServiceRequestStatus({
  requestId,
  status,
  adminNote,
  adminUser,
}) {
  const now = new Date().toISOString()
  const noteText =
    adminNote?.trim() ||
    `Status updated to ${status} by ${adminUser?.fullName || 'Admin'}.`

  const updatePayload = {
    status,
    admin_note: adminNote !== undefined ? adminNote : null,
    updated_at: now,
  }

  const { error } = await supabase
    .from('service_requests')
    .update(updatePayload)
    .eq('id', requestId)

  if (error) {
    throw new Error(error.message || 'Failed to update request status.')
  }

  await supabase.from('request_status_history').insert({
    id: makeUuid(),
    request_id: requestId,
    status,
    note: noteText,
    changed_by: adminUser?.id || null,
    created_at: now,
  })

  const refreshed = await fetchServiceRequests()
  return refreshed.find((r) => r.id === requestId) || null
}

/**
 * Compress an uploaded image File into a lightweight data URL for reliable database storage
 */
export function compressImageFile(file, maxWidth = 1000, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => resolve(reader.result)
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(reader.result)
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Calculate analytics summary from a list of requests
 */
export function calculateAnalytics(requests = []) {
  const total = requests.length
  const pending = requests.filter((r) => r.status === 'Pending').length
  const inProgress = requests.filter((r) => r.status === 'In Progress').length
  const resolved = requests.filter((r) => r.status === 'Resolved').length
  const open = pending + inProgress
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  const byCategory = SERVICE_CATEGORIES.map((category) => {
    const items = requests.filter((r) => r.category === category)
    return {
      category,
      total: items.length,
      open: items.filter((r) => r.status !== 'Resolved').length,
      resolved: items.filter((r) => r.status === 'Resolved').length,
    }
  }).filter((item) => item.total > 0)

  return {
    total,
    open,
    pending,
    inProgress,
    resolved,
    resolutionRate,
    byCategory,
  }
}
