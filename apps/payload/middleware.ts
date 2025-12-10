// Empty middleware to prevent Next.js from finding the root app's middleware
// This file must exist to override middleware detection in monorepo setups
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Only run middleware on admin routes
export const config = {
  matcher: '/admin/:path*',
};
