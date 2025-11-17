"use client"
import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) throw new Error("Invalid credentials")
      const json = await res.json()
      document.cookie = `access=${json.access}; path=/`
      window.location.href = "/dashboard"
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 mb-4">Use your test account credentials</p>
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="sr-only">Email</span>
            <input aria-label="Email" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Email" value={username} onChange={e=>setUsername(e.target.value)} />
          </label>
          <label className="block">
            <span className="sr-only">Password</span>
            <input aria-label="Password" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </label>
          <button disabled={loading} className="w-full bg-black text-white rounded-md px-3 py-2 disabled:opacity-60">{loading?"Signing in...":"Sign in"}</button>
        </form>
        <div className="text-xs text-gray-500 mt-4">Demo: test@example.com / password123</div>
      </div>
    </div>
  )
}