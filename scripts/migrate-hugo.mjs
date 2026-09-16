import fg from 'fast-glob'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY first.')

const supabase = createClient(url, key)
const files = await fg('content/posts/**/*.md', { onlyFiles: true })
if (!files.length) { console.log('No Hugo posts found in content/posts'); process.exit(0) }

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data
  if (data.draft === true) { console.log('Skipping draft:', file); continue }
  const slug = String(data.slug || path.basename(file, '.md')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : typeof data.tags === 'string' ? data.tags.split(/[,|]/).map((x) => x.trim()).filter(Boolean) : []
  let image = data.image ? String(data.image) : ''
  if (image && !/^https?:\/\//.test(image)) image = image.startsWith('/') ? image : `/${image}`
  let content = parsed.content.trim()
  content = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/|\/)(images\/[^)]+)\)/g, '![$1](/$2)')
  content = content.replace(/\]\(\/allgreeceweather\/posts\//g, '](/posts/')
  const published = data.draft !== true
  const date = data.date ? new Date(data.date) : new Date()
  const publishedAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()

  const row = { title: String(data.title || slug), slug, description: String(data.description || ''), content, image_url: image || null, image_alt: String(data.image_alt || ''), tags, published, published_at: publishedAt }
  const { error } = await supabase.from('posts').upsert(row, { onConflict: 'slug' })
  if (error) throw new Error(`${file}: ${error.message}`)
  console.log('Migrated:', file, '->', slug)
}
