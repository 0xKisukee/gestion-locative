'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiCall } from '@/lib/api';

// Créer le contexte d'authentification
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger l'utilisateur à partir du localStorage et des cookies au chargement initial
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Vérifier si un token existe
        const token = localStorage.getItem('token') || Cookies.get('token');
        
        if (token) {
          // Si le token existe, récupérer les informations de l'utilisateur depuis localStorage ou API
          let userData = null;
          
          try {
            userData = JSON.parse(localStorage.getItem('user'));
          } catch (e) {
            console.error('Erreur lors de la récupération des données utilisateur:', e);
          }
          
          if (!userData) {
            // Si les données utilisateur ne sont pas disponibles dans localStorage, les récupérer depuis l'API
            try {
              const response = await apiCall('/api/user/me');
              userData = response.user;
              
              // Mettre à jour localStorage
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
              console.error('Erreur lors de la récupération des informations utilisateur:', error);
              // En cas d'erreur, nettoyer le token
              logout();
              return;
            }
          }
          
          setUser(userData);
        }
      } catch (error) {
        console.error('Erreur d\'initialisation de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Appel à l'API de connexion
      const data = await apiCall('/api/user/login', 'POST', { email, password });
      
      // Stocker le token et l'utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Stocker également le token dans un cookie pour le SSR
      Cookies.set('token', data.token, { expires: 7 }); // Expire dans 7 jours
      
      // Mettre à jour l'état utilisateur
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token et les données utilisateur
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    
    // Réinitialiser l'état utilisateur
    setUser(null);
    
    // Rediriger vers la page d'accueil
    router.push('/');
  };

  // Fonction d'inscription
  const register = async (username, email, role, password) => {
    try {
      setLoading(true);
      
      // Appel à l'API d'inscription
      const data = await apiCall('/api/user/create', 'POST', { username, email, role, password });
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    return !!user;
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}