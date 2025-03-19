'use client';

// Base API URL - à modifier en fonction de votre backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fonction générique pour les appels API
 */
export async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    // Préparer les options de la requête
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Ajouter le token d'authentification si disponible
    let token;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ajouter le corps de la requête si nécessaire
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    // Effectuer l'appel API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Analyser la réponse
    const result = await response.json();
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(result.message || 'Une erreur est survenue');
    }
    
    return result;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

/**
 * Gérer les erreurs d'authentification
 */
export function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    // Supprimer les données d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la page de connexion
    window.location.href = '/connexion';
    
    // Afficher une alerte
    alert('Votre session a expiré. Veuillez vous reconnecter.');
  }
}

// Configuration d'un gestionnaire global pour les rejets non gérés
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function(event) {
    // Vérifier si l'erreur est liée à un appel API
    if (event.reason && event.reason.message) {
      // Vérifier s'il s'agit d'une erreur d'authentification
      if (event.reason.message.includes('Authentication') || 
          event.reason.message.includes('token') || 
          event.reason.message.includes('JWT')) {
        handleUnauthorized();
      }
    }
  });
}