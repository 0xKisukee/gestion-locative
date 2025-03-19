'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import AuthCheck from '@/components/AuthCheck';
import TenantDetailsModal from './TenantDetailsModal';
import { getCurrentUser } from '@/lib/auth';
import { apiCall } from '@/lib/api';

export default function TenantsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initTenantsPage = async () => {
      try {
        setIsLoading(true);
        const currentUser = getCurrentUser();

        if (!currentUser) {
          router.push('/connexion');
          return;
        }

        if (currentUser.role !== 'owner') {
          alert('Accès réservé aux propriétaires.');
          router.push('/dashboard');
          return;
        }

        setUser(currentUser);
        await fetchTenantsFromProperties();
      } catch (error) {
        console.error('Erreur lors du chargement de la page locataires:', error);
        setError(error.message || 'Une erreur est survenue lors du chargement des locataires.');
      } finally {
        setIsLoading(false);
      }
    };

    initTenantsPage();
  }, [router]);

  const fetchTenantsFromProperties = async () => {
    try {
      const properties = await apiCall('/api/property/getMyProperties');
      
      if (!Array.isArray(properties)) {
        throw new Error('Réponse invalide du serveur');
      }

      const propertiesWithTenants = properties.filter(property => 
        property.status === 'rented' && property.tenant
      );

      if (propertiesWithTenants.length === 0) {
        setTenants([]);
        return;
      }

      // Fetch payment information for each tenant
      const tenantsWithPayments = await Promise.all(propertiesWithTenants.map(async (property) => {
        try {
          const payments = await apiCall(`/api/user/myPayments`);
          const duePayments = payments.filter(pay => pay.status === 'due');
          const incomingPayments = payments.filter(pay => pay.status === 'incoming');
          
          return {
            tenant: property.tenant,
            property: {
              id: property.id,
              detail: property.detail,
              address: property.address,
              city: property.city,
              rent: property.rent,
              surface: property.surface
            },
            payments: {
              due: duePayments.length,
              incoming: incomingPayments.length
            }
          };
        } catch (error) {
          console.error(`Erreur lors de la récupération des paiements pour le locataire ${property.tenant.id}:`, error);
          return {
            tenant: property.tenant,
            property: {
              id: property.id,
              detail: property.detail,
              address: property.address,
              city: property.city,
              rent: property.rent,
              surface: property.surface
            },
            payments: {
              due: 0,
              incoming: 0
            }
          };
        }
      }));

      setTenants(tenantsWithPayments);
    } catch (error) {
      console.error('Erreur dans fetchTenantsFromProperties:', error);
      setError(error.message || 'Impossible de charger vos locataires.');
      setTenants([]);
    }
  };

  const removeTenantFromProperty = async (propertyId) => {
    try {
      if (confirm('Êtes-vous sûr de vouloir retirer ce locataire de la propriété ?')) {
        await apiCall(`/api/property/${propertyId}/removeTenant`, 'PATCH');
        await fetchTenantsFromProperties(); // Rafraîchir la liste
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du locataire:', error);
      alert('Erreur lors du retrait du locataire : ' + (error.message || 'Erreur inconnue'));
    }
  };

  const showTenantDetails = async (tenantId, propertyId) => {
    try {
      const property = await apiCall(`/api/property/getInfos/${propertyId}`);
      setSelectedTenant(property.tenant);
      setSelectedProperty(property);
      setModalOpen(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger les détails du locataire : ' + (error.message || 'Erreur inconnue'));
    }
  };

  function getStatusBadge(payments) {
    if (payments.due === 1) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          En retard
        </span>
      );
    } else if (payments.due > 1) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          À régulariser
        </span>
      );
    } else if (payments.incoming > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Paiements à venir
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          À jour
        </span>
      );
    }
  }

  return (
    <AuthCheck>
      <PageContainer>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Mes Locataires
            </h1>
          </div>

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-600">Chargement de vos locataires...</p>
            </div>
          )}

          {/* Error message */}
          {error && !isLoading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* No tenants message */}
          {!isLoading && !error && tenants.length === 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800">Vous n'avez encore aucun locataire attribué à vos propriétés.</span>
              </div>
            </div>
          )}

          {/* Tenants table */}
          {!isLoading && !error && tenants.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-blue-600">Liste des locataires</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {tenants.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bien loué
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((item, index) => {
                      const { tenant, property, payments } = item;
                      const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
                      const propertyText = `${propertyType} - ${property.address}, ${property.city}`;
                      const phoneText = tenant.phone || 'Non renseigné';

                      return (
                        <tr 
                          key={index}
                          className="hover:bg-gray-50 transition-all duration-200 group hover:-translate-y-1 hover:shadow-md"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{tenant.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tenant.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{phoneText}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{propertyText}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payments)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => showTenantDetails(tenant.id, property.id)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                title="Voir détails"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeTenantFromProperty(property.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                title="Retirer locataire"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Utilisation du composant modal externe */}
          <TenantDetailsModal 
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            tenant={selectedTenant}
            property={selectedProperty}
          />
        </div>
      </PageContainer>
    </AuthCheck>
  );
}