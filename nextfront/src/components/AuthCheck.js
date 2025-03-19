'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Composant pour vérifier l'authentification et les autorisations
export default function AuthCheck({ children, requiredRole = null }) {
  const router = useRouter();
  const { isAuthenticated, hasRole, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Vérifier si l'utilisateur est connecté
      if (!isAuthenticated()) {
        router.push('/connexion');
        return;
      }

      // Vérifier le rôle si nécessaire
      if (requiredRole && !hasRole(requiredRole)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [router, requiredRole, isAuthenticated, hasRole, loading]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted mt-3">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}