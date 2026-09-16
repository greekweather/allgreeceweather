'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState(
    search.get('error') === 'not-authorized'
      ? 'Ο λογαριασμός συνδέθηκε, αλλά δεν έχει δικαίωμα διαχείρισης.'
      : ''
  )

  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Η σύνδεση απέτυχε. Έλεγξε email και κωδικό.')
      setLoading(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <main className="login-wrap">
      <div className="login-card form-card">
        <p className="eyebrow">ΔΙΑΧΕΙΡΙΣΗ</p>

        <h1>Σύνδεση</h1>

        {message && (
          <p className="notice">
            {message}
          </p>
        )}

        <form
          className="form-grid"
          onSubmit={submit}
        >
          <div className="form-field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">
              Κωδικός
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="button"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Σύνδεση…' : 'Σύνδεση'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="login-wrap">
          <div className="login-card form-card">
            <p>Φόρτωση…</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
