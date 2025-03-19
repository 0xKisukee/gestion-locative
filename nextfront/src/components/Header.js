'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth();

  return (
    <header className="py-3 mb-4 border-b shadow-sm bg-card rounded-lg">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <i className="bi bi-building text-2xl"></i>
          <h1 className="text-xl font-bold m-0">Gestion Locative</h1>
        </Link>
        
        {!loading && (
          isAuthenticated() ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <i className="bi bi-person-fill text-xl text-primary"></i>
                <span className="bg-primary/10 text-primary py-1 px-3 rounded-md text-sm font-medium">
                  {user?.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                </span>
                <span className="text-muted-foreground text-sm hidden md:inline">{user?.email}</span>
              </div>
              <button 
                onClick={logout}
                className="nav-btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/connexion" className="nav-btn-primary">
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Connexion</span>
              </Link>
              <Link href="/inscription" className="nav-btn-outline">
                <i className="bi bi-person-plus"></i>
                <span>Inscription</span>
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}