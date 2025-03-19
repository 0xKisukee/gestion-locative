'use client';

import { useEffect } from 'react';

export default function TenantDetailsModal({ isOpen, onClose, tenant, property }) {
  // Fermer la modale avec la touche Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !tenant || !property) return null;
  
  const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
  
  return (
    <div 
      className="fixed inset-0 bg-white/80 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-50 p-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-blue-600 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
            Détails du locataire
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Fermer"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-blue-600 flex items-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none"
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
                Informations du locataire
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Nom</span>
                  <p className="text-sm font-medium text-gray-900">{tenant.username}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <p className="text-sm font-medium text-gray-900">{tenant.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Téléphone</span>
                  <p className="text-sm font-medium text-gray-900">{tenant.phone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-blue-600 flex items-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
                Bien loué
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <p className="text-sm font-medium text-gray-900">{propertyType}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Adresse</span>
                  <p className="text-sm font-medium text-gray-900">{property.address}, {property.city}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Surface</span>
                  <p className="text-sm font-medium text-gray-900">{property.surface} m²</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Loyer mensuel</span>
                  <p className="text-sm font-medium text-gray-900">{property.rent} €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}