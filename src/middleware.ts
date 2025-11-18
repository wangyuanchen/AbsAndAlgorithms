import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 临时简化 middleware，避免 Edge Runtime 与 Node.js crypto 的冲突
export function middleware(request: NextRequest) {
  // 目前禁用认证，直接通过
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
