'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_INPUT_BYTES = 8 * 1024 * 1024
const MAX_OUTPUT_BYTES = 800 * 1024

async function compressImage(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Χρησιμοποίησε JPG, PNG ή WebP.')
  if (file.size > MAX_INPUT_BYTES) throw new Error('Η αρχική εικόνα πρέπει να είναι έως 8 MB.')

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(async () => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    await img.decode()
    URL.revokeObjectURL(url)
    return img as unknown as ImageBitmap
  })

  const width = 'width' in bitmap ? bitmap.width : 1600
  const height = 'height' in bitmap ? bitmap.height : 900
  const scale = Math.min(1, 1800 / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Ο browser δεν υποστηρίζει canvas.')
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, canvas.width, canvas.height)

  let quality = .84
  let blob: Blob | null = null
  while (quality >= .5) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    if (blob && blob.size <= MAX_OUTPUT_BYTES) break
    quality -= .08
  }
  if (!blob) throw new Error('Δεν ήταν δυνατή η συμπίεση της εικόνας.')
  if (blob.size > MAX_OUTPUT_BYTES) throw new Error('Η εικόνα παραμένει πολύ μεγάλη μετά τη συμπίεση.')
  return new File([blob], `${crypto.randomUUID()}.webp`, { type: 'image/webp' })
}

export function ImageUpload({ onUploaded }: { onUploaded: (url: string, alt: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  async function upload(file: File | null) {
    if (!file) return
    setBusy(true); setStatus('Συμπίεση…')
    try {
      const compressed = await compressImage(file)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Η συνεδρία έληξε. Κάνε ξανά σύνδεση.')
      const path = `${user.id}/${compressed.name}`
      setStatus(`Upload ${(compressed.size / 1024).toFixed(0)} KB…`)
      const { error } = await supabase.storage.from('post-images').upload(path, compressed, { cacheControl: '31536000', contentType: 'image/webp', upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      onUploaded(data.publicUrl, file.name.replace(/\.[^.]+$/, ''))
      setStatus('Η εικόνα ανέβηκε.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Αποτυχία upload.')
    } finally { setBusy(false) }
  }

  return <div className="form-field">
    <label htmlFor="image-file">Upload νέας εικόνας</label>
    <input id="image-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(e.target.files?.[0] ?? null)} />
    <small>{status || 'JPG/PNG/WebP έως 8 MB αρχικά· το σύστημα αποθηκεύει βελτιστοποιημένο WebP έως περίπου 800 KB.'}</small>
  </div>
}
