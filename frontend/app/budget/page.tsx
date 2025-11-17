"use client"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import dynamic from "next/dynamic"
const NavbarContainer = dynamic(() => import("@/components/navbar-container"), { ssr: false })

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

export default function BudgetPage() {
  const [amount, setAmount] = useState("")
  const [current, setCurrent] = useState<{year:number,month:number,amount:string}|null>(null)
  const [spent, setSpent] = useState<number>(0)
  const chartRef = useRef<HTMLDivElement>(null)

  function token() {
    return document.cookie.split(";").find(c=>c.trim().startsWith("access="))?.split("=")[1] || ""
  }

  function fetchCurrent() {
    fetch(`${API_BASE}/api/budgets/current/`, { headers: { Authorization: `Bearer ${token()}` }})
      .then(r=>r.json()).then(setCurrent)
  }

  useEffect(() => {
    fetchCurrent()
    fetch(`${API_BASE}/api/summary/`, { headers: { Authorization: `Bearer ${token()}`}})
      .then(r=>r.json()).then(j=>setSpent(Number(j.month_expenses||0)))
  }, [])

  useEffect(() => {
    if (!current || !chartRef.current) return
    const budget = Number(current.amount||0)
    const values = [
      { label: "Budget", value: budget, color: "#0ea5e9" },
      { label: "Spent", value: spent, color: "#f59e0b" },
    ]
    const w = Math.min(640, chartRef.current.clientWidth)
    const h = 240
    const m = { top: 20, right: 20, bottom: 40, left: 40 }
    const x = d3.scaleBand().domain(values.map(d=>d.label)).range([m.left, w - m.right]).padding(0.4)
    const y = d3.scaleLinear().domain([0, Math.max(budget, spent)]).nice().range([h - m.bottom, m.top])
    chartRef.current.innerHTML = ""
    const svg = d3.select(chartRef.current).append("svg").attr("width", w).attr("height", h)
    svg.selectAll("rect").data(values).enter().append("rect")
      .attr("x", d=>x(d.label)!)
      .attr("y", d=>y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d=>y(0)-y(d.value))
      .attr("fill", d=>d.color)
    const axisX = d3.axisBottom(x)
    const axisY = d3.axisLeft(y).ticks(5)
    svg.append("g").attr("transform", `translate(0,${h - m.bottom})`).call(axisX)
    svg.append("g").attr("transform", `translate(${m.left},0)`).call(axisY)
    const grid = d3.axisLeft(y).ticks(5).tickSize(-(w - m.left - m.right)).tickFormat(() => "")
    const gridG = svg.append("g").attr("transform", `translate(${m.left},0)`).call(grid)
    gridG.selectAll("line").attr("stroke", "#e5e7eb")
  }, [current, spent])

  async function save() {
    const now = new Date()
    const body = { year: now.getFullYear(), month: now.getMonth()+1, amount }
    const res = await fetch(`${API_BASE}/api/budgets/set_current/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      fetchCurrent()
      setAmount("")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavbarContainer />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Budget</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm mb-2 text-gray-700">Set Current Month Budget</div>
            <div className="flex gap-3">
              <input className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
              <button className="rounded-md px-3 py-2 bg-black text-white" onClick={save}>Save</button>
            </div>
            {current && <div className="text-sm mt-2 text-gray-600">Current: {current.amount}</div>}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm mb-2 text-gray-700">Budget vs Spent</div>
            <div ref={chartRef} />
          </div>
        </div>
      </div>
    </div>
  )
}