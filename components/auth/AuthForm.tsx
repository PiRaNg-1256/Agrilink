'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Leaf } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<UserRole>('consumer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { role, full_name: fullName } },
        })
        if (error) throw error
        toast.success('Account created! Signing you in...')
        // Auto sign in after register
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        const { data: profile } = await supabase.from('profiles').select('role, is_admin').eq('id', data.user.id).single()
        window.location.href = profile?.is_admin ? '/admin' : profile?.role === 'farmer' ? '/dashboard' : '/shop'
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const { data: profile } = await supabase.from('profiles').select('role, is_admin').eq('id', data.user.id).single()
        window.location.href = profile?.is_admin ? '/admin' : profile?.role === 'farmer' ? '/dashboard' : '/shop'
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-xl tracking-widest text-white">AGRILINK</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-green-500 text-black' : 'text-gray-400'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-green-500 text-black' : 'text-gray-400'}`}>
              Register
            </button>
          </div>

          {mode === 'register' && (
            <>
              <div className="mb-4">
                <Label className="text-gray-300 text-sm mb-2 block">I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['consumer', 'farmer'] as UserRole[]).map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`p-3 rounded-xl border text-sm font-medium capitalize transition-colors ${role === r ? 'border-green-400 bg-green-500/20 text-green-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                      {r === 'consumer' ? '🛒 Consumer' : '🌾 Farmer'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="name" className="text-gray-300 text-sm">Full Name</Label>
                <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white" placeholder="Your full name" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold">
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
