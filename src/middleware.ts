import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/site', '/api/uploadthing']);

export default clerkMiddleware(
  {
    secretKey: process.env.CLERK_SECRET_KEY,
  },
  async (auth, request) => {
    // Mus prevent crash on undefined request
    if (!request?.nextUrl) {
      console.warn('Request or request.nextUrl is undefined in middleware. Skipping...');
      return NextResponse.next();
    }

    const url = request.nextUrl;
    const searchParams = url.searchParams.toString();
    const hostname = request.headers;

    const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

    const customSubDomain = hostname
      .get('host')
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0];

    if (customSubDomain) {
      return NextResponse.rewrite(new URL(`/${customSubDomain}${pathWithSearchParams}`, request.url));
    }

    if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
      return NextResponse.redirect(new URL(`/garage/sign-in`, request.url));
    }

    if (
      url.pathname === '/' ||
      (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
    ) {
      return NextResponse.rewrite(new URL('/site', request.url));
    }

    if (
      url.pathname.startsWith('/garage') ||
      url.pathname.startsWith('/subaccount')
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, request.url));
    }
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
