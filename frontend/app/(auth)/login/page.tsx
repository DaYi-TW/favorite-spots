'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.login(form)
      router.push('/feed')
    } catch {
      setError('帳號或密碼錯誤，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-8 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-4xl font-headline font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent tracking-tight">
            Curator
          </span>
          <p className="text-sm text-on-surface-variant mt-1.5">你的私人地點收藏</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            required
            autoFocus
          />
          <Input
            label="密碼"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-2.5">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            登入
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          還沒有帳號？{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  )
}
