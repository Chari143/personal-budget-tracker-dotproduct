import { NextRequest, NextResponse } from 'next/server'

// const isStaticAsset = (pathname: string) => {
//   return (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/static') ||
//     pathname.startsWith('/public') ||
//     pathname.startsWith('/api') ||
//     pathname === '/favicon.ico' ||
//     pathname === '/robots.txt' ||
//     pathname.endsWith('.css') ||
//     pathname.endsWith('.js') ||
//     pathname.endsWith('.svg') ||
//     pathname.endsWith('.png') ||
//     pathname.endsWith('.jpg')
//   )
// }

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  // if (isStaticAsset(pathname)) return NextResponse.next()

  const allowPaths = ['/signin']
  const hasAccess = !!request.cookies.get('access')?.value

  if (allowPaths.includes(pathname)) {
    if (hasAccess) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }
  if (pathname === '/') {
    const dest = hasAccess ? '/dashboard' : '/signin'
    return NextResponse.redirect(new URL(dest, request.url))
  }
  if (!hasAccess) return NextResponse.redirect(new URL('/signin', request.url))
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|static|public|api).*)'] }