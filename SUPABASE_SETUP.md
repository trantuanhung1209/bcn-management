# Supabase Storage Setup Guide

## Vấn đề hiện tại
Lỗi "new row violates row-level security policy" khi upload avatar lên Supabase Storage.

## Nguyên nhân
- Row Level Security (RLS) được bật nhưng chưa có policy phù hợp
- Bucket `bcn-mangement` chưa được cấu hình đúng permissions

## Giải pháp

### 1. Tạo RLS Policies trong Supabase Dashboard

Vào Supabase Dashboard > Storage > Policies và chạy các lệnh SQL sau:

```sql
-- Bật RLS cho storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy cho phép public read
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'bcn-mangement');

-- Policy cho phép authenticated users upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bcn-mangement');

-- Policy cho phép users update files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'bcn-mangement');

-- Policy cho phép users delete files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'bcn-mangement');
```

### 2. Kiểm tra Bucket Configuration

Đảm bảo bucket `bcn-mangement` đã được tạo với:
- Public access: true (nếu muốn public read)
- File size limits: phù hợp (ví dụ: 10MB)
- Allowed MIME types: image/*

### 3. Alternative: Disable RLS tạm thời

Nếu cần test nhanh, có thể disable RLS:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Lưu ý**: Chỉ dùng cho development, không nên dùng cho production!

### 4. Kiểm tra Authentication

Đảm bảo user đã đăng nhập và có token hợp lệ:

```javascript
// Kiểm tra session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

## Test Commands

```bash
# Kiểm tra bucket exists
curl -X GET "https://mxughxhmiocbmgxzukyo.supabase.co/storage/v1/bucket/bcn-mangement" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test upload
curl -X POST "https://mxughxhmiocbmgxzukyo.supabase.co/storage/v1/object/bcn-mangement/test.txt" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -F "file=@test.txt"
```