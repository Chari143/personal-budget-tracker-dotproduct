"use client"
import React from "react"
import Navbar from "./navbar"

export default function NavbarContainer() {
  if (typeof window === "undefined") return null
  const hasAccess = document.cookie.split(";").some(c => c.trim().startsWith("access="))
  return hasAccess ? <Navbar /> : null
}