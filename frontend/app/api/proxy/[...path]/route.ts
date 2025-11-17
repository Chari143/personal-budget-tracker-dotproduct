import { NextRequest } from "next/server"

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

async function handle(req: NextRequest) {
  const url = new URL(req.url)
  const prefix = "/api/proxy/"
  const idx = url.pathname.indexOf(prefix)
  const rest = idx >= 0 ? url.pathname.slice(idx + prefix.length) : ""
  const dest = `${BASE}/${rest}${url.search}`
  const headers: Record<string, string> = {}
  const ct = req.headers.get("content-type")
  const auth = req.headers.get("authorization")
  if (ct) headers["content-type"] = ct
  if (auth) headers["authorization"] = auth
  const init: RequestInit = { method: req.method, headers }
  if (["POST","PUT","PATCH","DELETE"].includes(req.method)) {
    const body = await req.text()
    init.body = body
  }
  const res = await fetch(dest, init)
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } })
}

export async function GET(req: NextRequest) { return handle(req) }
export async function POST(req: NextRequest) { return handle(req) }
export async function PUT(req: NextRequest) { return handle(req) }
export async function PATCH(req: NextRequest) { return handle(req) }
export async function DELETE(req: NextRequest) { return handle(req) }
export async function OPTIONS(req: NextRequest) { return handle(req) }