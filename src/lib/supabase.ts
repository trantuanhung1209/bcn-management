import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Upload avatar to Supabase Storage via API endpoint
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Use server-side API to upload (bypasses RLS issues)
    const formData = new FormData()
    formData.append('file', file)

    console.log('Uploading avatar via API endpoint...')

    const response = await fetch('/api/upload/avatar', {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed')
    }

    console.log('Avatar uploaded successfully via API:', result.url)
    return result.url

  } catch (error) {
    console.error('Avatar upload error:', error)
    throw error
  }
}

// Delete old avatar from Supabase Storage via API endpoint
export const deleteAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts[pathParts.length - 1] // Get filename
    
    if (!filePath) {
      console.warn('Could not extract file path from avatar URL')
      return
    }

    console.log('Deleting avatar via API:', filePath)

    const response = await fetch(`/api/upload/avatar?path=avatars/${filePath}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error deleting avatar:', errorData.error || response.statusText)
      // Don't throw error, just log it
      return
    }

    const result = await response.json()
    if (!result.success) {
      console.error('Delete avatar failed:', result.error)
    }

  } catch (error) {
    console.error('Error deleting old avatar:', error)
    // Don't throw error, just log it
  }
}