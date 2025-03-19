import { NextResponse } from 'next/server';

// Middleware pour la redirection vers la page de connexion
export function middleware(request) {
  // Vérifier si le chemin actuel nécessite une authentification
  const protectedPaths = [
    '/dashboard',
    '/properties',
    '/tenants',
    '/payments',
    '/tickets'
  ];

  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  // Si le chemin est protégé, vérifier l'authentification
  if (isProtectedPath) {
    // Vérifier si un token existe dans les cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Rediriger vers la page de connexion
      const redirectUrl = new URL('/connexion', request.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Continuer avec la requête
  return NextResponse.next();
}

// Configuration pour le middleware
export const config = {
  // Matcher les chemins sur lesquels le middleware devrait s'exécuter
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/tenants/:path*',
    '/payments/:path*',
    '/tickets/:path*',
  ],
};