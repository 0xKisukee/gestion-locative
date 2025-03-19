'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth();

  return (
    <header className="py-3 mb-4 border-b shadow-sm bg-white rounded-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:opacity-90 transition-opacity">
          {/* Icône de bâtiment en SVG */}
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h1 className="text-xl font-bold m-0">Gestion Locative</h1>
        </Link>
        
        {!loading && (
          isAuthenticated() ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Icône de personne en SVG */}
                <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>
                <span className="bg-blue-100 text-blue-600 py-1 px-3 rounded-md text-sm font-medium">
                  {user?.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                </span>
                <span className="text-gray-500 text-sm hidden md:inline">{user?.email}</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 border border-red-200 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
              >
                {/* Icône de déconnexion en SVG */}
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/connexion" className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                {/* Icône de connexion en SVG */}
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Connexion</span>
              </Link>
              <Link href="/inscription" className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-colors">
                {/* Icône d'inscription en SVG */}
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Inscription</span>
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}