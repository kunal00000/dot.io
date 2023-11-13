import { serverClient } from '@/app/_trpc/serverClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  const { pathname } = req.nextUrl;

  if (pathname.length !== 9) return NextResponse.redirect(new URL('/'));
  const shortkey = pathname.slice(1);

  const { targetUrl } = await serverClient.getTargetUrl({ shortkey });
  if (!targetUrl) return NextResponse.redirect(new URL('/'));

  return NextResponse.redirect(new URL(targetUrl));
}
