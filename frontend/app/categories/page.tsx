"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
const NavbarContainer = dynamic(() => import("@/components/navbar-container"), { ssr: false })

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://193.53.40.63:8000/")

type Category = { id: number; name: string; type: "income" | "expense" }

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState("expense")
  const [message, setMessage] = useState("")

  function token() {
    return document.cookie.split(";").find(c=>c.trim().startsWith("access="))?.split("=")[1] || ""
  }

  function load() {
    fetch(`${API_BASE}/api/categories/`, { headers: { Authorization: `Bearer ${token()}`}})
      .then(r=>r.json()).then(j=>{
        const arr = Array.isArray(j) ? j : (j.results || [])
        setItems(arr)
      })
  }

  useEffect(() => { load() }, [])

  async function add() {
    const res = await fetch(`${API_BASE}/api/categories/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ name, type })
    })
    if (res.ok) {
      setName("")
      load()
    }
  }

  async function del(id: number) {
    const res = await fetch(`${API_BASE}/api/categories/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    })
    if (res.ok) {
      setMessage("")
      load()
    } else {
      const t = await res.text()
      let msg = "Cannot delete category that has transactions"
      try {
        const j = JSON.parse(t)
        msg = j.detail || j.error || msg
      } catch {}
      setMessage(msg)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavbarContainer />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Categories</h1>
        {message && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{message}</div>}
        <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
            <select className="border border-gray-300 rounded-md px-3 py-2" value={type} onChange={e=>setType(e.target.value)}>
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
            <button className="rounded-md px-3 py-2 bg-black text-white" onClick={add}>Add</button>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Type</th><th className="text-left p-3">Actions</th></tr></thead>
            <tbody>
              {items.map(c=> (
                <tr key={c.id} className="border-t"><td className="p-3">{c.name}</td><td className="p-3">{c.type}</td><td className="p-3"><button className="bg-red-600 text-white px-3 py-1 rounded-md" onClick={()=>del(c.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}