"use client"
import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
const NavbarContainer = dynamic(() => import("@/components/navbar-container"), { ssr: false })

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://193.53.40.63:8000/").replace(/\/$/, "")

type Category = { id: number; name: string; type?: "income" | "expense" }
type Transaction = { id: number; date: string; amount: number | string; description: string; category?: number | { name: string } }

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<{category?:string,date__gte?:string,date__lte?:string,amount__gte?:string,amount__lte?:string}>({})
  const [form, setForm] = useState<{category_id:string,amount:string,date:string,description:string}>({category_id:"",amount:"",date:"",description:""})

  function token() {
    return document.cookie.split(";").find(c=>c.trim().startsWith("access="))?.split("=")[1] || ""
  }

  function qs(obj: Record<string,string|undefined>) {
    const params = new URLSearchParams()
    Object.entries(obj).forEach(([k,v])=>{ if (v) params.set(k, v) })
    params.set("page", String(page))
    return params.toString()
  }

  function load() {
    const q = qs(filters)
    fetch(`${API_BASE}/api/transactions/?${q}`, { headers: { Authorization: `Bearer ${token()}` }})
      .then(r=>r.json()).then(j=>{
        const arr = Array.isArray(j) ? j : (j.results || [])
        setItems(arr)
      })
  }

  function loadCategories() {
    fetch(`${API_BASE}/api/categories/`, { headers: { Authorization: `Bearer ${token()}`}})
      .then(r=>r.json()).then(j=>{ setCategories(Array.isArray(j)?j:(j.results||[])) })
  }

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { load() }, [page, filters])

  async function add() {
    const res = await fetch(`${API_BASE}/api/transactions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setForm({category_id:"",amount:"",date:"",description:""})
      load()
    }
  }

  async function del(id:number) {
    const res = await fetch(`${API_BASE}/api/transactions/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` }})
    if (res.ok) load()
  }

  const categoryMap = useMemo(()=>{
    const m: Record<number, string> = {}
    categories.forEach(c=>{ m[c.id] = c.name })
    return m
  }, [categories])

  return (
    <div className="min-h-screen bg-white">
      <NavbarContainer />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Transactions</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select className="border border-gray-300 rounded-md px-3 py-2" value={filters.category||""} onChange={e=>setFilters(f=>({ ...f, category: e.target.value||undefined }))}>
              <option value="">All categories</option>
              {categories.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <input className="border border-gray-300 rounded-md px-3 py-2" type="date" value={filters.date__gte||""} onChange={e=>setFilters(f=>({ ...f, date__gte: e.target.value||undefined }))} />
            <input className="border border-gray-300 rounded-md px-3 py-2" type="date" value={filters.date__lte||""} onChange={e=>setFilters(f=>({ ...f, date__lte: e.target.value||undefined }))} />
            <input className="border border-gray-300 rounded-md px-3 py-2" placeholder="Min amount" value={filters.amount__gte||""} onChange={e=>setFilters(f=>({ ...f, amount__gte: e.target.value||undefined }))} />
            <input className="border border-gray-300 rounded-md px-3 py-2" placeholder="Max amount" value={filters.amount__lte||""} onChange={e=>setFilters(f=>({ ...f, amount__lte: e.target.value||undefined }))} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select className="border border-gray-300 rounded-md px-3 py-2" value={form.category_id} onChange={e=>setForm(f=>({ ...f, category_id: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <input className="border border-gray-300 rounded-md px-3 py-2" placeholder="Amount" value={form.amount} onChange={e=>setForm(f=>({ ...f, amount: e.target.value }))} />
            <input className="border border-gray-300 rounded-md px-3 py-2" type="date" value={form.date} onChange={e=>setForm(f=>({ ...f, date: e.target.value }))} />
            <input className="border border-gray-300 rounded-md px-3 py-2" placeholder="Description" value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} />
          </div>
          <div className="mt-3"><button className="rounded-md px-3 py-2 bg-black text-white" onClick={add}>Add</button></div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-3">Date</th><th className="text-left p-3">Category</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Description</th><th className="text-left p-3">Actions</th></tr></thead>
            <tbody>
              {items.map(t=> (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{typeof t.category === "number" ? categoryMap[t.category] : t.category?.name}</td>
                  <td className="p-3">{t.amount}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3"><button className="bg-red-600 text-white px-3 py-1 rounded-md" onClick={()=>del(t.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button className="rounded-md px-3 py-1 border border-gray-300" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <button className="rounded-md px-3 py-1 border border-gray-300" onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  )
}