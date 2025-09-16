import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client với service role key (có full permissions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // Get user ID from headers hoặc authentication
    const userId = request.headers.get('X-User-ID')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()

    console.log('Server-side upload attempt:', { filePath, fileSize: file.size, fileType: file.type })

    // Upload to Supabase Storage using service role (bypasses RLS)
    const { error } = await supabaseAdmin.storage
      .from('bcn-mangement')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Server-side upload error:', error)
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: error.message 
      }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('bcn-mangement')
      .getPublicUrl(filePath)

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 })
    }

    console.log('Upload successful:', publicUrlData.publicUrl)

    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('Avatar upload API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE method để xóa avatar cũ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.storage
      .from('bcn-mangement')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Avatar delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}