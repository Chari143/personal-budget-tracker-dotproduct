"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const link = (href: string, label: string) => {
    const active = pathname === href
    return (
      <Link href={href} className={`text-sm px-3 py-2 rounded-md ${active ? "bg-gray-100" : "hover:bg-gray-50"}`}>{label}</Link>
    )
  }
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-semibold">Budget Tracker</div>
        <div className="flex items-center gap-2">
          {link('/dashboard','Dashboard')}
          {link('/transactions','Transactions')}
          {link('/budget','Budget')}
          {link('/categories','Categories')}
          <button
            className="text-sm rounded-md px-3 py-2 bg-black text-white"
            onClick={() => {
              document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
              window.location.href = "/signin";
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}