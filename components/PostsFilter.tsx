'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export function PostsFilter({ tags }: { tags: string[] }) {
  const [tag, setTag] = useState('all')
  const [sort, setSort] = useState('newest')
  const tagOptions = useMemo(() => tags.map((x) => ({ label: x, value: x.toLocaleLowerCase('el-GR') })), [tags])
  // The actual cards are children of this parent; selectors live here to avoid server/client data duplication.
  return <div className="article-filters">
    <label><span>Ετικέτα</span><select value={tag} onChange={(e) => { setTag(e.target.value); filterCards(e.target.value, sort) }}><option value="all">Όλες οι ετικέτες</option>{tagOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
    <label><span>Ταξινόμηση</span><select value={sort} onChange={(e) => { setSort(e.target.value); filterCards(tag, e.target.value) }}><option value="newest">Νεότερα</option><option value="popular">Δημοφιλέστερα</option></select></label>
  </div>
}

function filterCards(tag: string, sort: string) {
  const grid = document.getElementById('articles-grid')
  if (!grid) return
  const cards = Array.from(grid.children) as HTMLElement[]
  cards.sort((a, b) => {
    const da = Number(a.dataset.date || 0), db = Number(b.dataset.date || 0)
    if (sort === 'popular') return Number(b.dataset.views || 0) - Number(a.dataset.views || 0)
    return db - da
  }).forEach((el) => grid.appendChild(el))
  cards.forEach((el) => {
    const tags = (el.dataset.tags || '').split('|').filter(Boolean)
    el.hidden = tag !== 'all' && !tags.includes(tag)
  })
}
