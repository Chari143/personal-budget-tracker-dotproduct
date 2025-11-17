"use client"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import dynamic from "next/dynamic"
const NavbarContainer = dynamic(() => import("@/components/navbar-container"), { ssr: false })

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://193.53.40.63:8000/").replace(/\/$/, "")

export default function DashboardPage() {
  const [data, setData] = useState<{total_income:number,total_expenses:number,balance:number,month_expenses:number,month_budget:number}|null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const budgetChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = document.cookie.split(";").find(c=>c.trim().startsWith("access="))?.split("=")[1] || ""
    if (!token) return
    fetch(`${API_BASE}/api/summary/`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>r.json())
      .then(json=>setData({
        total_income:Number(json.total_income||0),
        total_expenses:Number(json.total_expenses||0),
        balance:Number(json.balance||0),
        month_expenses:Number(json.month_expenses||0),
        month_budget:Number(json.month_budget||0)
      }))
  }, [])

  useEffect(() => {
    if (!data || !chartRef.current) return
    const values = [
      { label: "Income", value: data.total_income, color: "#22c55e" },
      { label: "Expenses", value: data.total_expenses, color: "#ef4444" },
      { label: "Balance", value: data.balance, color: "#3b82f6" },
    ]
    const w = Math.min(640, chartRef.current.clientWidth)
    const h = 280
    const m = { top: 20, right: 20, bottom: 40, left: 40 }
    const x = d3.scaleBand().domain(values.map(d=>d.label)).range([m.left, w - m.right]).padding(0.2)
    const y = d3.scaleLinear().domain([0, d3.max(values, d=>d.value)||0]).nice().range([h - m.bottom, m.top])
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
  }, [data])

  useEffect(() => {
    if (!data || !budgetChartRef.current) return
    const values = [
      { label: "Budget", value: data.month_budget, color: "#0ea5e9" },
      { label: "Spent", value: data.month_expenses, color: "#f59e0b" },
    ]
    const w = Math.min(640, budgetChartRef.current.clientWidth)
    const h = 220
    const m = { top: 20, right: 20, bottom: 40, left: 40 }
    const x = d3.scaleBand().domain(values.map(d=>d.label)).range([m.left, w - m.right]).padding(0.4)
    const y = d3.scaleLinear().domain([0, d3.max(values, d=>d.value)||0]).nice().range([h - m.bottom, m.top])
    budgetChartRef.current.innerHTML = ""
    const svg = d3.select(budgetChartRef.current).append("svg").attr("width", w).attr("height", h)
    svg.selectAll("rect").data(values).enter().append("rect")
      .attr("x", d=>x(d.label)!)
      .attr("y", d=>y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d=>y(0)-y(d.value))
      .attr("fill", d=>d.color)
    const axisX = d3.axisBottom(x)
    const axisY = d3.axisLeft(y).ticks(4)
    svg.append("g").attr("transform", `translate(0,${h - m.bottom})`).call(axisX)
    svg.append("g").attr("transform", `translate(${m.left},0)`).call(axisY)
    const grid2 = d3.axisLeft(y).ticks(4).tickSize(-(w - m.left - m.right)).tickFormat(() => "")
    const gridG2 = svg.append("g").attr("transform", `translate(${m.left},0)`).call(grid2)
    gridG2.selectAll("line").attr("stroke", "#e5e7eb")
  }, [data])

  return (
    <div className="min-h-screen bg-white">
      <NavbarContainer />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        {!data && <div className="text-sm text-gray-600">Loading...</div>}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-600">Total Income</div>
                <div className="text-2xl font-semibold text-emerald-600">{data.total_income.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-600">Total Expenses</div>
                <div className="text-2xl font-semibold text-rose-600">{data.total_expenses.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-600">Balance</div>
                <div className="text-2xl font-semibold text-blue-600">{data.balance.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm mb-2 text-gray-700">Income vs Expenses vs Balance</div>
                <div ref={chartRef} />
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm mb-2 text-gray-700">Budget vs Spent (Current Month)</div>
                <div ref={budgetChartRef} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}