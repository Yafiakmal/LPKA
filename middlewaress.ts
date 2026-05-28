// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const protectedRoutes = ["/borrows", "/items", "/units", "/takings"];
// const authRoutes = ["/login"];

// function isTokenExpired(request: NextRequest): boolean {
//   const expiresAt = request.cookies.get("auth_expires")?.value;
//   if (!expiresAt) return true;

//   const now = Math.floor(Date.now() / 1000);
//   return now >= Number(expiresAt);
// }

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("auth_token")?.value;
//   const pathname = request.nextUrl.pathname;

//   const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
//   const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

//   const isLoggedIn = !!token && !isTokenExpired(request);

//   // Belum login atau token expired → redirect ke login
//   if (isProtected && !isLoggedIn) {
//     // Hapus cookie lama jika expired
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     const response = NextResponse.redirect(loginUrl);

//     if (token) {
//       // Bersihkan cookie yang sudah tidak valid
//       response.cookies.delete("auth_token");
//       response.cookies.delete("auth_expires");
//     }

//     return response;
//   }

//   // Sudah login tapi akses halaman login → redirect ke dashboard
//   if (isAuthRoute && isLoggedIn) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
// };
