'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      router.push('/feed')
    } catch (err: any) {
      setError(err.response?.data?.detail || '註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-8 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-4xl font-headline font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent tracking-tight">
            Curator
          </span>
          <p className="text-sm text-on-surface-variant mt-1.5">開始收藏你喜愛的每個地點</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="使用者名稱"
            type="text"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="spotlover"
            required
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            required
          />
          <Input
            label="密碼"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="至少 8 個字元"
            required
          />

          {error && (
            <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-2.5">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            建立帳號
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          已有帳號？{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  )
}
