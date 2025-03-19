'use client';

import { apiCall } from './api';

/**
 * Vérifier si l'utilisateur est connecté
 */
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('token') !== null;
}

/**
 * Récupérer l'utilisateur actuel depuis localStorage
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Fonction de connexion
 */
export async function login(email, password) {
  try {
    // Appel à l'API de connexion
    const data = await apiCall('/api/user/login', 'POST', { email, password });
    
    // Stocker le token et l'utilisateur dans localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

/**
 * Fonction d'inscription
 */
export async function register(username, email, role, password) {
  try {
    // Appel à l'API d'inscription
    const data = await apiCall('/api/user/create', 'POST', { username, email, role, password });
    return data;
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    throw error;
  }
}

/**
 * Fonction de déconnexion
 */
export function logout() {
  if (typeof window === 'undefined') return;
  
  // Supprimer les données d'authentification
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}